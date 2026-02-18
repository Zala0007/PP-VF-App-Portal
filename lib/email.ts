import nodemailer from 'nodemailer'
import { generateApplicationPDF } from './generatePDF'
import { COLLEGE_PRINCIPAL_EMAILS } from './collegeEmails'

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
  applicationType: string
) {
  const mailOptions = {
    from: `"Directorate of Technical Education" <${process.env.EMAIL_USER}>`,
    to: applicantEmail,
    subject: `Acknowledgement of Your Application – Post of ${applicationType}`,
    text: `Dear ${applicantName},

This is to confirm that we have received your application for the post of ${applicationType}. Your application has been successfully recorded in our recruitment system.

Your Unique Application ID: ${applicationId}

Please keep this ID, as it will be required for any future communication regarding the selection process.

Your application will now undergo through our standard screening procedure as per the Terms of Use and Recruitment Guidelines. If your profile is shortlisted, you will be notified via email about the next steps.

Thank you for your interest in joining our organization.

Warm regards,
Director of Technical Education`,
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
    from: `"Directorate of Technical Education" <${process.env.EMAIL_USER}>`,
    to: principalEmail,
    subject: `New ${applicationData.applicationType} Application - ${applicationData.name}`,
    text: `Dear Sir,

A new application has been received for the post of ${applicationData.applicationType} at your institution.

Application Details:
- Application ID: ${applicationData.applicationId}
- Applicant Name: ${applicationData.name}
- Email: ${applicationData.email}
- Contact: ${applicationData.contactNo}
- Department(s): ${departments.join(', ')}
- Area of Interest: ${applicationData.areaOfInterest || 'Not specified'}
- Submitted: ${new Date(applicationData.dateTimeOfSubmit).toLocaleString('en-IN')}

Please find the complete application form attached as a PDF.

This application is now available in the DTE portal for your review.

Warm regards,
Directorate of Technical Education
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
