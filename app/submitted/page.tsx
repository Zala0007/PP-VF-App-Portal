import React from 'react'
import prismaClient from '../../lib/prisma'

export default async function Submitted({ searchParams }: { searchParams?: Promise<{ id?: string }> }) {
  const params = await searchParams
  const applicationId = params?.id
  let application: any = null
  if (applicationId) {
    try {
      application = await prismaClient.application.findUnique({ where: { applicationId } })
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="gradient-bg min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="text-green-600 dark:text-green-400 text-4xl">✅</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your application has been successfully submitted.</h2>
                {application && (
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <div><strong>Name:</strong> {application.name}</div>
                    <div><strong>Application Type:</strong> {application.applicationType}</div>
                    <div><strong>Submitted:</strong> {new Date(application.dateTimeOfSubmit).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <a href="/" className="inline-block bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg transition-colors">Back to Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
