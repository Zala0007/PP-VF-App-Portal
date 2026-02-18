export const GUJARAT_COLLEGES = [
  'Dr. S & S.S.Ghandhi Government Engineering College, Surat',
  'Government Engineering College, Bharuch',
  'Government Engineering College, Bhavnagar',
  'Government Engineering College, Bhuj',
  'Government Engineering College, Dahod',
  'Government Engineering College, Gandhinagar',
  'Government Engineering College, Godhra',
  'Government Engineering College, Modasa',
  'Government Engineering College, Palanpur',
  'Government Engineering College, Patan',
  'Government Engineering College, Rajkot',
  'Government Engineering College, Valsad',
  'L.D. College of Engineering, Ahmedabad',
  'L.E.College, Morbi',
  'Shantilal Shah Engineering College, Bhavnagar',
  'Vishwakarma Government Engineering College, Ahmedabad'
] as const

export type College = typeof GUJARAT_COLLEGES[number]

export const COLLEGE_DEPARTMENTS: Record<string, string[]> = {
  'Dr. S & S.S.Ghandhi Government Engineering College, Surat': [
    'Science & Humanities (General) Department',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Environmental Engineering',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Bharuch': [
    'Science & Humanities (General) Department',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Bhavnagar': [
    'Science & Humanities (General) Department',
    'Civil Engineering',
    'Computer Engineering',
    'Electronics & Communication Engineering',
    'Information & Communication Technology',
    'Information Technology',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Bhuj': [
    'Science & Humanities (General) Department',
    'Chemical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Mining Engineering'
  ],
  'Government Engineering College, Dahod': [
    'Science & Humanities (General) Department',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Gandhinagar': [
    'Science & Humanities (General) Department',
    'Biomedical Engineering',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Information Technology',
    'Instrumentation & Control Engineering',
    'Mechanical Engineering',
    'Metallurgy',
    'Robotics and Automation'
  ],
  'Government Engineering College, Godhra': [
    'Science & Humanities (General) Department',
    'Civil Engineering',
    'Electrical Engineering',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Modasa': [
    'Science & Humanities (General) Department',
    'Automobile Engineering',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Information Technology',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Palanpur': [
    'Science & Humanities (General) Department',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Patan': [
    'Science & Humanities (General) Department',
    'Civil Engineering',
    'Computer Science & Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering'
  ],
  'Government Engineering College, Rajkot': [
    'Science & Humanities (General) Department',
    'Artificial Intelligence and Data Science',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Instrumentation & Control Engineering',
    'Mechanical Engineering',
    'Robotics and Automation'
  ],
  'Government Engineering College, Valsad': [
    'Science & Humanities (General) Department',
    'Chemical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Mechanical Engineering'
  ],
  'L.D. College of Engineering, Ahmedabad': [
    'Science & Humanities (General) Department',
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
  ],
  'L.E.College, Morbi': [
    'Science & Humanities (General) Department',
    'Chemical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Technology',
    'Mechanical Engineering'
  ],
  'Shantilal Shah Engineering College, Bhavnagar': [
    'Science & Humanities (General) Department',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Technology',
    'Mechanical Engineering'
  ],
  'Vishwakarma Government Engineering College, Ahmedabad': [
    'Science & Humanities (General) Department',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Engineering',
    'Computer Science & Engineering(Data Science)',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Electronics & Instrumentation Engineering',
    'Information & Communication Technology',
    'Information Technology',
    'Instrumentation & Control Engineering',
    'Mechanical Engineering',
    'Power Electronics'
  ]
}

export const COLLEGE_WEBSITES: Record<string, string> = {
  'L.D. College of Engineering, Ahmedabad': 'https://ldce.ac.in/',
  'Dr. S & S.S.Ghandhi Government Engineering College, Surat': 'https://sites.google.com/view/ssgpsurat/home',
  'Government Engineering College, Bharuch': 'https://gecbharuch.com/',
  'Government Engineering College, Bhavnagar': 'https://gecbhavnagar.ac.in/',
  'Government Engineering College, Bhuj': 'https://gecbhuj.ac.in/',
  'Government Engineering College, Dahod': 'https://www.gecdahod.ac.in/',
  'Government Engineering College, Gandhinagar': 'https://gecg28.ac.in/?trk=public_post-text',
  'Government Engineering College, Godhra': 'https://www.gecgodhra.ac.in/',
  'Government Engineering College, Modasa': 'https://www.gecmodasa.ac.in/',
  'Government Engineering College, Palanpur': 'https://www.gecpalanpur.ac.in/',
  'Government Engineering College, Patan': 'https://www.gecpatan.ac.in/',
  'Government Engineering College, Rajkot': 'https://www.gecrajkot.ac.in/',
  'Government Engineering College, Valsad': 'https://www.gecv.ac.in/',
  'L.E.College, Morbi': 'https://www.lecollege.ac.in/',
  'Shantilal Shah Engineering College, Bhavnagar': 'https://www.ssgec.ac.in/',
  'Vishwakarma Government Engineering College, Ahmedabad': 'https://www.vgecg.ac.in/'
}

export const COLLEGE_LOGOS: Record<string, string> = {
  'L.D. College of Engineering, Ahmedabad': '/ldce-logo.png',
  'Dr. S & S.S.Ghandhi Government Engineering College, Surat': '/S & SS Gandhi -logo.jpg',
  'Government Engineering College, Bharuch': '/gec bharuch-logo.jpg',
  'Government Engineering College, Bhavnagar': '/gec bhavnagar-logo.png',
  'Government Engineering College, Bhuj': '/gec bhuj-logo.jpg',
  'Government Engineering College, Dahod': '/gec dahod-logo.png',
  'Government Engineering College, Gandhinagar': '/gec gandhinagar-logo.png',
  'Government Engineering College, Godhra': '/gec godhra-logo.jpg',
  'Government Engineering College, Modasa': '/gec modasa-logo.png',
  'Government Engineering College, Palanpur': '/gec palanpur-logo.png',
  'Government Engineering College, Patan': '/gec patan-logo.png',
  'Government Engineering College, Rajkot': '/gec rajkot-logo.jpg',
  'Government Engineering College, Valsad': '/gec valsad-logo.png',
  'L.E.College, Morbi': '/le college morbi-logo.jpg',
  'Shantilal Shah Engineering College, Bhavnagar': '/ssec-logo.png',
  'Vishwakarma Government Engineering College, Ahmedabad': '/vgec-logo.png'
}
