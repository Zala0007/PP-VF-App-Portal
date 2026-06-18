export type CandidateStatus = 'Shortlisted for Interview' | 'Rejected' | 'Selected'

type CandidateStatusEmailInput = {
  name: string
  applicationId: string
  email: string
  department: string
  status: CandidateStatus
}

export function isCandidateStatus(value: string): value is CandidateStatus {
  return value === 'Shortlisted for Interview' || value === 'Rejected' || value === 'Selected'
}

export function buildCandidateStatusEmailDraft(input: CandidateStatusEmailInput) {
  const department = input.department || 'concerned'
  let subject = 'Update on Your Visiting Faculty Application'
  let body = `Dear ${input.name},

Thank you for your interest in the Visiting Faculty engagement for the ${department} branch. After careful review, we regret to inform you that your application has not been selected for further process at this time.

Regards,
L. D. College of Engineering
Ahmedabad`

  if (input.status === 'Shortlisted for Interview') {
    subject = `Shortlisted for Visiting Faculty – ${department}`
    body = `Dear ${input.name},

Greetings from L. D. College of Engineering.

We are pleased to inform you that you have been shortlisted for the position of Visiting Faculty in the ${department} branch.

You are requested to remain available for the further selection process. Details regarding the interview/demo lecture/document verification will be shared with you shortly.

Regards,
L. D. College of Engineering
Ahmedabad`
  }

  if (input.status === 'Selected') {
    subject = `Selection for Visiting Faculty – ${department}`
    body = `Dear ${input.name},

Greetings from L. D. College of Engineering.

We are pleased to inform you that you have been selected as Visiting Faculty in the ${department} branch at L. D. College of Engineering.

You are requested to report to the concerned department and complete the required formalities.

Congratulations and welcome to LDCE.

Regards,
L. D. College of Engineering
Ahmedabad`
  }

  return {
    subject,
    body,
    gmailComposeUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(input.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
}
