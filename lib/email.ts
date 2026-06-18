import nodemailer from 'nodemailer'
import { existsSync } from 'fs'
import { basename, join } from 'path'
import { generateApplicationPDF } from './generatePDF'
import { COLLEGE_PRINCIPAL_EMAILS, DEPARTMENT_HOD_EMAILS } from './collegeEmails'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
})

export async function sendApplicationReceivedEmail(
  applicantEmail: string,
  applicantName: string,
  applicationId: string,
  applicationType: string,
  department: unknown
) {
  const branchName = parseDepartments(department).join(', ') || 'concerned'
  const mailOptions = {
    from: `"L D College of Engineering" <${process.env.EMAIL_USER}>`,
    to: applicantEmail,
    subject: `Application Received – Visiting Faculty, ${branchName}`,
    text: `Dear ${applicantName},

Greetings from L. D. College of Engineering.

This is to acknowledge that we have received your application for the position of Visiting Faculty in the ${branchName} branch.

Your application will be scrutinized by the concerned committee. Shortlisted candidates will be informed through email for the next stage of the selection process.

Regards,
L. D. College of Engineering
Ahmedabad`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Application received email sent to ${applicantEmail}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendApplicationToPrincipal(
  applicationData: any
) {
  console.log('Looking up principal email for college:', applicationData.college)
  console.log('Available colleges:', Object.keys(COLLEGE_PRINCIPAL_EMAILS))
  
  const principalEmail = COLLEGE_PRINCIPAL_EMAILS[applicationData.college]
  
  if (!principalEmail) {
    console.warn(`No principal email found for college: ${applicationData.college}`)
    return
  }

  console.log('Found principal email:', principalEmail)

  // Generate PDF
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await generateApplicationPDF(applicationData)
  } catch (error) {
    console.error('Error generating PDF for principal:', error)
    throw error
  }

  const departments = Array.isArray(applicationData.department) 
    ? applicationData.department 
    : typeof applicationData.department === 'string' && applicationData.department.startsWith('[')
      ? JSON.parse(applicationData.department)
      : [applicationData.department]

  const mailOptions = {
    from: `"L D College of Engineering" <${process.env.EMAIL_USER}>`,
    to: principalEmail,
    subject: `New ${applicationData.applicationType} Application - ${applicationData.name}`,
    text: `Dear Sir/Ma'am,

A new application has been received for your department.

Application Details:
- Application ID: ${applicationData.applicationId}
- Applicant Name: ${applicationData.name}
- Email: ${applicationData.email}
- Contact: ${applicationData.contactNo}
- Department(s): ${departments.join(', ')}
- Area of Interest: ${applicationData.areaOfInterest || 'Not specified'}
- Submitted: ${new Date(applicationData.dateTimeOfSubmit).toLocaleString('en-IN')}

Please find the complete application form attached as a PDF.

This application is now available in the Visiting Faculty portal for your review.

Warm regards,
L D College of Engineering
Government of Gujarat`,
    attachments: [
      {
        filename: `Application_${applicationData.applicationId}_${applicationData.name.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Application PDF sent to principal at ${principalEmail}`)
  } catch (error) {
    console.error('Error sending email to principal:', error)
    throw error
  }
}

function parseDepartments(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      }
    } catch {
      // Keep plain text department values as-is.
    }

    return value.trim() ? [value.trim()] : []
  }

  return []
}

function getUploadedResumeAttachment(resumeFile: unknown) {
  if (typeof resumeFile !== 'string' || !resumeFile.trim()) {
    return null
  }

  const normalizedResumePath = resumeFile.replace(/^\/+/, '')
  const resumePath = join(process.cwd(), 'public', normalizedResumePath)

  if (!existsSync(resumePath)) {
    console.warn(`Resume file not found for email attachment: ${resumePath}`)
    return null
  }

  return {
    filename: basename(resumePath),
    path: resumePath
  }
}

export async function sendApplicationToDepartmentHods(applicationData: any) {
  const departments = parseDepartments(applicationData.department)
  const recipients = Array.from(
    new Set(
      departments
        .map((department) => DEPARTMENT_HOD_EMAILS[department]?.trim())
        .filter((email): email is string => Boolean(email))
    )
  )

  if (recipients.length === 0) {
    console.warn(`No HOD email configured for department(s): ${departments.join(', ') || 'None'}`)
    return
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await generateApplicationPDF(applicationData)
  } catch (error) {
    console.error('Error generating PDF for HOD:', error)
    throw error
  }

  const attachments: any[] = [
    {
      filename: `Application_${applicationData.applicationId}_${applicationData.name.replace(/\s+/g, '_')}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ]
  const resumeAttachment = getUploadedResumeAttachment(applicationData.resumeFile)
  if (resumeAttachment) {
    attachments.push(resumeAttachment)
  }

  const mailOptions = {
    from: `"Directorate of Technical Education" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject: `New Visiting Faculty Application Received for Your Department - ${applicationData.name}`,
    text: `Dear HOD,

A new application has been received for your department.

Application Details:
- Application ID: ${applicationData.applicationId}
- Applicant Name: ${applicationData.name}
- Email: ${applicationData.email}
- Contact: ${applicationData.contactNo}
- Department(s): ${departments.join(', ')}
- Area of Interest: ${applicationData.areaOfInterest || 'Not specified'}
- Submitted: ${new Date(applicationData.dateTimeOfSubmit).toLocaleString('en-IN')}

Please find the complete application form and uploaded resume attached.

This application is also available in the HOD portal for review.

Warm regards,
Visiting Faculty Application Portal
L.D. College of Engineering`,
    attachments,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Application PDF sent to HOD email(s): ${recipients.join(', ')}`)
  } catch (error) {
    console.error('Error sending email to HOD:', error)
    throw error
  }
}
