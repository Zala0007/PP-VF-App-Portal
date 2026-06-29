import prisma from '@/lib/prisma'
import { applicationBelongsToDepartment, getApplicationReviewDepartments, getHodDepartmentAliases, LDCE_COLLEGE_NAME, verifyHodToken } from '@/lib/roleAuth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const token = request.headers.get('x-hod-token')
  const credential = verifyHodToken(token)

  if (!credential) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await prisma.application.findMany({
      where: {
        college: LDCE_COLLEGE_NAME
      },
      include: {
        departmentReviews: {
          where: {
            department: { in: getHodDepartmentAliases(credential.department) }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const items = applications
      .filter((application) => applicationBelongsToDepartment(application.department, credential.department))
      .flatMap((application) => {
        const reviewDepartments = getApplicationReviewDepartments(
          application.department,
          credential.department
        )
        const { departmentReviews, ...applicationData } = application

        return reviewDepartments.map((reviewDepartment) => {
          const departmentReview = departmentReviews.find(
            (review) => review.department === reviewDepartment
          )

          return {
            ...applicationData,
            department: [reviewDepartment],
            statusDepartment: reviewDepartment,
            reviewed: departmentReview?.reviewed ?? false,
            selectionStatus: departmentReview?.selectionStatus ?? 'Pending'
          }
        })
      })

    return NextResponse.json({
      items,
      count: items.length,
      department: credential.department
    })
  } catch (error) {
    console.error('Error fetching HOD applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
