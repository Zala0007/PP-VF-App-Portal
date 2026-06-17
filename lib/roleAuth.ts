export type PortalRole =
  | { role: 'admin' }
  | { role: 'hod'; department: string }

export type HodCredential = {
  department: string
  password: string
}

export const LDCE_COLLEGE_NAME = 'L.D. College of Engineering, Ahmedabad'

export function getAdminPasswords() {
  return [
    process.env.ADMIN_PASSWORD_1,
    process.env.ADMIN_PASSWORD_2,
    process.env.ADMIN_PASSWORD_3,
    process.env.ADMIN_PASSWORD_4,
    process.env.ADMIN_PASSWORD_5
  ].filter(Boolean) as string[]
}

export function getHodCredentials(): HodCredential[] {
  const raw = process.env.HOD_DEPARTMENT_PASSWORDS || ''

  return raw
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf('=')
      if (separatorIndex === -1) return null

      const department = entry.slice(0, separatorIndex).trim()
      const password = entry.slice(separatorIndex + 1).trim()

      if (!department || !password) return null

      return { department, password }
    })
    .filter((entry): entry is HodCredential => Boolean(entry))
}

export function verifyPortalPassword(password: string): PortalRole | null {
  if (getAdminPasswords().includes(password)) {
    return { role: 'admin' }
  }

  const hodCredential = getHodCredentials().find((credential) => credential.password === password)

  if (hodCredential) {
    return {
      role: 'hod',
      department: hodCredential.department
    }
  }

  return null
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false

  return getAdminPasswords().includes(token)
}

export function verifyHodToken(token: string | null): HodCredential | null {
  if (!token) return null

  return getHodCredentials().find((credential) => credential.password === token) || null
}

export function parseDepartments(value: string | null): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
  } catch {
    // Fall back to a plain text department value.
  }

  return [value]
}

export function normalizeDepartment(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function getHodDepartmentAliases(hodDepartment: string) {
  if (normalizeDepartment(hodDepartment) !== 'science & humanities') {
    return [hodDepartment]
  }

  return [
    'Science & Humanities',
    'Physics - Science & Humanities (General) Department',
    'Maths - Science & Humanities (General) Department',
    'English - Science & Humanities (General) Department'
  ]
}

export function applicationBelongsToDepartment(applicationDepartment: string | null, hodDepartment: string) {
  const selectedDepartments = parseDepartments(applicationDepartment).map(normalizeDepartment)
  const hodDepartments = getHodDepartmentAliases(hodDepartment).map(normalizeDepartment)

  return selectedDepartments.some((department) => hodDepartments.includes(department))
}
