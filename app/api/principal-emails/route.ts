import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { COLLEGE_PRINCIPAL_EMAILS } from '@/lib/collegeEmails';

const EMAIL_FILE_PATH = path.join(process.cwd(), 'lib', 'collegeEmails.ts');

// Helper to get the current emails from the imported object
async function getEmailsFromFile(): Promise<{ [key: string]: string }> {
  return { ...COLLEGE_PRINCIPAL_EMAILS };
}

// Helper to write emails back to the file
async function writeEmailsToFile(emails: { [key: string]: string }) {
  const entries = Object.entries(emails)
    .map(([college, email]) => `  "${college}": "${email}"`)
    .join(',\n');
  
  const content = `export const COLLEGE_PRINCIPAL_EMAILS: { [key: string]: string } = {
${entries}
};
`;
  
  await fs.writeFile(EMAIL_FILE_PATH, content, 'utf-8');
}

// GET - Retrieve all principal emails
export async function GET() {
  try {
    const emails = await getEmailsFromFile();
    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error reading principal emails:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve principal emails' },
      { status: 500 }
    );
  }
}

// POST - Add or update principal email(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { college, email, emails: bulkEmails } = body;
    
    const currentEmails = await getEmailsFromFile();
    
    if (bulkEmails) {
      // Bulk update
      Object.assign(currentEmails, bulkEmails);
    } else if (college && email) {
      // Single update
      currentEmails[college] = email;
    } else {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    await writeEmailsToFile(currentEmails);
    
    return NextResponse.json({ success: true, emails: currentEmails });
  } catch (error) {
    console.error('Error updating principal emails:', error);
    return NextResponse.json(
      { error: 'Failed to update principal emails' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a principal email
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const college = searchParams.get('college');
    
    if (!college) {
      return NextResponse.json(
        { error: 'College name is required' },
        { status: 400 }
      );
    }
    
    const currentEmails = await getEmailsFromFile();
    delete currentEmails[college];
    
    await writeEmailsToFile(currentEmails);
    
    return NextResponse.json({ success: true, emails: currentEmails });
  } catch (error) {
    console.error('Error deleting principal email:', error);
    return NextResponse.json(
      { error: 'Failed to delete principal email' },
      { status: 500 }
    );
  }
}
