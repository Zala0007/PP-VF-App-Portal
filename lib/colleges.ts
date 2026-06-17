export const GUJARAT_COLLEGES = [
  'L.D. College of Engineering, Ahmedabad'
] as const

export type College = typeof GUJARAT_COLLEGES[number]

export const COLLEGE_DEPARTMENTS: Record<string, string[]> = {
  'L.D. College of Engineering, Ahmedabad': [
    'Physics - Science & Humanities (General) Department',
    'Maths - Science & Humanities (General) Department',
    'English - Science & Humanities (General) Department',
    'Applied Mechanics',
    'Artificial Intelligence and Machine Learning',
    'Automobile Engineering',
    'Biomedical Engineering',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Environmental Engineering',
    'Information Technology',
    'Instrumentation & Control Engineering',
    'Mechanical Engineering',
    'Plastic Technology',
    'Robotics and Automation',
    'Rubber Technology',
    'Textile Technology'
  ]
}

export const COLLEGE_WEBSITES: Record<string, string> = {
  'L.D. College of Engineering, Ahmedabad': 'https://ldce.ac.in/'
}

export const COLLEGE_LOGOS: Record<string, string> = {
  'L.D. College of Engineering, Ahmedabad': '/ldce-logo.png'
}
