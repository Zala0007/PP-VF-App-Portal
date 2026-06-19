export type CandidateStatus = 'Shortlisted for Interview' | 'Rejected' | 'Selected'

export type InterviewDetails = {
  date: string
  time: string
  venue: string
}

type CandidateStatusEmailInput = {
  name: string
  applicationId: string
  email: string
  department: string
  status: CandidateStatus
  interviewDetails?: InterviewDetails
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
    const interviewDate = input.interviewDetails?.date
      ? new Date(`${input.interviewDetails.date}T00:00:00`).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : 'To be confirmed'
    const interviewTime = input.interviewDetails?.time || 'To be confirmed'
    const interviewVenue = input.interviewDetails?.venue || 'To be confirmed'

    subject = `Shortlisted for Visiting Faculty – ${department}`
    body = `Dear ${input.name},

Greetings from L. D. College of Engineering.

We are pleased to inform you that you have been shortlisted for the position of Visiting Faculty in the ${department} branch.

Interview Details:
Date: ${interviewDate}
Time: ${interviewTime}
Venue: ${interviewVenue}

You are requested to report at the venue on time and bring the required original documents for verification.

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
