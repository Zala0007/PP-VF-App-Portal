import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';
import { COLLEGE_PRINCIPAL_EMAILS } from '@/lib/collegeEmails';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { college } = await request.json();
    
    if (!college) {
      return NextResponse.json({ error: 'College name is required' }, { status: 400 });
    }

    // Get principal email
    const principalEmail = COLLEGE_PRINCIPAL_EMAILS[college];
    
    if (!principalEmail) {
      return NextResponse.json({ 
        error: `No principal email configured for ${college}. Please add it in Principal Email Management.` 
      }, { status: 404 });
    }

    // Fetch all applications for the specified college
    const applications = await prisma.application.findMany({
      where: { college },
      orderBy: { dateTimeOfSubmit: 'desc' }
    });

    if (applications.length === 0) {
      return NextResponse.json({ error: 'No applications found for this college' }, { status: 404 });
    }

    // Prepare data for Excel
    const excelData = applications.map((app: any) => {
      // Parse JSON fields
      let educationQualifications = [];
      let experienceEntries = [];
      let departments = [];
      let timeSlotDay = [];
      let timeSlotPeriod = [];

      try {
        if (app.educationQualifications) {
          educationQualifications = typeof app.educationQualifications === 'string' 
            ? JSON.parse(app.educationQualifications) 
            : app.educationQualifications;
        }
        if (app.experienceEntries) {
          experienceEntries = typeof app.experienceEntries === 'string' 
            ? JSON.parse(app.experienceEntries) 
            : app.experienceEntries;
        }
        if (app.department) {
          departments = typeof app.department === 'string' 
            ? JSON.parse(app.department) 
            : app.department;
        }
        if (app.timeSlotDay) {
          timeSlotDay = typeof app.timeSlotDay === 'string' 
            ? JSON.parse(app.timeSlotDay) 
            : app.timeSlotDay;
        }
        if (app.timeSlotPeriod) {
          timeSlotPeriod = typeof app.timeSlotPeriod === 'string' 
            ? JSON.parse(app.timeSlotPeriod) 
            : app.timeSlotPeriod;
        }
      } catch (e) {
        console.error('Error parsing JSON fields:', e);
      }

      // Format education
      const educationStr = educationQualifications
        .map((edu: any) => `${edu.degree} from ${edu.institution} (${edu.fromDate} - ${edu.toDate}) - ${edu.percentage}`)
        .join(' | ');

      // Format experience
      const experienceStr = experienceEntries
        .map((exp: any) => `${exp.position} at ${exp.company} (${exp.fromDate} - ${exp.toDate})`)
        .join(' | ');

      return {
        'Application ID': app.applicationId,
        'Application Type': app.applicationType,
        'Name': app.name,
        'Email': app.email,
        'Contact Number': app.contactNo,
        'College': app.college,
        'Department(s)': Array.isArray(departments) ? departments.join(', ') : departments,
        'Education Qualifications': educationStr || 'N/A',
        'Professional Experience': experienceStr || 'N/A',
        'Area of Interest': app.areaOfInterest || 'N/A',
        'Preferred Subjects': app.preferredSubjects || 'N/A',
        'Mode (Lab/Lecture/Both)': app.labLectureBoth || 'N/A',
        'Preferred Days': Array.isArray(timeSlotDay) ? timeSlotDay.join(', ') : 'N/A',
        'Preferred Period': Array.isArray(timeSlotPeriod) ? timeSlotPeriod.join(', ') : 'N/A',
        'Specific Time Slot': app.timeSlotText || 'N/A',
        'CV/Resume Link': app.cvLink || 'N/A',
        'LinkedIn Profile': app.linkedinLink || 'N/A',
        'Google Scholar': app.googleScholarLink || 'N/A',
        'Remark': app.remark || 'N/A',
        'Submitted Date': new Date(app.dateTimeOfSubmit).toLocaleString('en-IN'),
        'Reviewed': app.reviewed ? 'Yes' : 'No',
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
      { wch: 35 }, { wch: 30 }, { wch: 50 }, { wch: 50 }, { wch: 30 },
      { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Create filename
    const safeCollegeName = college.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Applications_${safeCollegeName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Send email with attachment
    const mailOptions = {
      from: `"Directorate of Technical Education" <${process.env.EMAIL_USER}>`,
      to: principalEmail,
      subject: `Applications for ${college}`,
      html: `<p>Dear Principal,</p>

<p>Please find attached the Excel file containing all applications received for <strong>${college}</strong>.</p>

<p><strong>Summary:</strong></p>
<ul>
  <li>Total Applications: ${applications.length}</li>
  <li>Professor in Practice: ${applications.filter(a => a.applicationType === 'Professor in Practice').length}</li>
  <li>Visiting Faculty: ${applications.filter(a => a.applicationType === 'Visiting Faculty').length}</li>
  <li>Date Generated: ${new Date().toLocaleString('en-IN')}</li>
</ul>

<p>The attached Excel file contains comprehensive details of all applicants including their qualifications, experience, preferences, and contact information.</p>

<p>Best regards,<br/>
<strong>Directorate of Technical Education</strong><br/>
Government of Gujarat</p>`,
      attachments: [
        {
          filename: filename,
          content: excelBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: `Email sent successfully to ${principalEmail} with ${applications.length} applications`,
      recipientEmail: principalEmail,
      applicationCount: applications.length
    });

  } catch (error: any) {
    console.error('Error sending email with Excel:', error);
    return NextResponse.json({ 
      error: 'Failed to send email with Excel attachment',
      details: error.message 
    }, { status: 500 });
  }
}
