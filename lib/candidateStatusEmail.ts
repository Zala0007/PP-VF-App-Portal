export type CandidateStatus = 'Shortlisted for Interview' | 'Rejected' | 'Selected'

type CandidateStatusEmailInput = {
  name: string
  applicationId: string
  email: string
  department: string
  status: CandidateStatus
}

const STATUS_SUBJECTS: Record<CandidateStatus, string> = {
  'Shortlisted for Interview': 'Update on Your Visiting Faculty Application',
  Rejected: 'Update on Your Visiting Faculty Application',
  Selected: 'Selection for Visiting Faculty Engagement'
}

function getStatusMessage(status: CandidateStatus, department: string) {
  if (status === 'Shortlisted for Interview') {
    return `We are pleased to inform you that your application has been shortlisted for an interview for the post of Visiting Faculty at the ${department} department. The department will contact you with the further instructions. Details for the Interview Timing and Venue are given below.`
  }

  if (status === 'Selected') {
    return `We are pleased to inform you that you have been selected for the Visiting Faculty engagement for the ${department} department. The department will contact you regarding the next steps and required formalities.`
  }

  return `Thank you for your interest in the Visiting Faculty engagement for the ${department} department. After careful review, we regret to inform you that your application has not been selected for further process at this time.`
}

export function isCandidateStatus(value: string): value is CandidateStatus {
  return value === 'Shortlisted for Interview' || value === 'Rejected' || value === 'Selected'
}

export function buildCandidateStatusEmailDraft(input: CandidateStatusEmailInput) {
  const department = input.department || 'concerned'
  const subject = STATUS_SUBJECTS[input.status]
  const applicationDetails = [
    `Application ID: ${input.applicationId}`,
    ...(input.status === 'Shortlisted for Interview' ? ['Date:', 'Time:', 'Venue:'] : []),
    `Status: ${input.status}`
  ]
  const body = [
    `Dear ${input.name},`,
    '',
    getStatusMessage(input.status, department),
    '',
    ...applicationDetails,
    '',
    'Regards,',
    'L.D. College of Engineering, Ahmedabad'
  ].join('\n')

  return {
    subject,
    body,
    gmailComposeUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(input.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
}
