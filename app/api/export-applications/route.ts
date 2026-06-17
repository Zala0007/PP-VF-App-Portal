import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const { college } = await request.json();
    
    if (!college) {
      return NextResponse.json({ error: 'College name is required' }, { status: 400 });
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
        'Resume File': app.resumeFile || 'N/A',
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
      { wch: 15 }, // Application ID
      { wch: 20 }, // Application Type
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Contact
      { wch: 35 }, // College
      { wch: 30 }, // Department
      { wch: 50 }, // Education
      { wch: 50 }, // Experience
      { wch: 30 }, // Area of Interest
      { wch: 30 }, // Preferred Subjects
      { wch: 15 }, // Mode
      { wch: 20 }, // Days
      { wch: 20 }, // Period
      { wch: 20 }, // Time Slot
      { wch: 40 }, // Resume File
      { wch: 40 }, // LinkedIn
      { wch: 40 }, // Scholar
      { wch: 20 }, // Remark
      { wch: 20 }, // Submitted
      { wch: 10 }, // Reviewed
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Create safe filename
    const safeCollegeName = college.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Applications_${safeCollegeName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
  }
}
