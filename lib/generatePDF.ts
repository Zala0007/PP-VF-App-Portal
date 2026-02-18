import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateApplicationPDF(application: any) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let yPosition = height - 50
  const leftMargin = 50
  const lineHeight = 15
  
  // Helper function to draw text
  const drawText = (text: string, size: number, isBold: boolean = false, x: number = leftMargin) => {
    page.drawText(text, {
      x,
      y: yPosition,
      size,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    })
    yPosition -= size + 5
  }
  
  // Header
  drawText('Directorate of Technical Education', 16, true, width / 2 - 150)
  drawText('Education Department, Government of Gujarat', 12, false, width / 2 - 140)
  yPosition -= 10
  drawText('Professor in Practice & Visiting Faculty Online Application Form', 11, true, width / 2 - 180)
  yPosition -= 5
  drawText(`Application ID: ${application.applicationId} | Submitted: ${new Date(application.dateTimeOfSubmit).toLocaleDateString('en-IN')}`, 9, false, leftMargin)
  
  yPosition -= 20
  
  // Basic Information
  drawText('BASIC INFORMATION', 12, true)
  yPosition -= 5
  drawText(`Name: ${application.name}`, 10)
  drawText(`Email: ${application.email}`, 10)
  drawText(`Contact Number: ${application.contactNo}`, 10)
  drawText(`Application Type: ${application.applicationType}`, 10)
  if (application.college) drawText(`College: ${application.college}`, 10)
  drawText(`Department: ${application.department || '—'}`, 10)
  
  yPosition -= 15
  
  // Education & Qualifications
  drawText('EDUCATION & QUALIFICATIONS', 12, true)
  yPosition -= 5
  
  let educationData = []
  try {
    if (application.educationQualifications) {
      educationData = typeof application.educationQualifications === 'string' 
        ? JSON.parse(application.educationQualifications) 
        : application.educationQualifications
    }
  } catch (e) {
    console.error('Failed to parse education data:', e)
  }
  
  if (educationData.length > 0) {
    educationData.forEach((edu: any, index: number) => {
      drawText(`${edu.degree}`, 10, true)
      drawText(`  ${edu.fromDate} - ${edu.toDate}`, 9)
      drawText(`  Institution: ${edu.institution}`, 9)
      if (edu.percentage) drawText(`  Percentage/CGPA: ${edu.percentage}`, 9)
      yPosition -= 5
    })
  } else {
    drawText('No education information provided', 9)
  }
  
  yPosition -= 15
  
  // Professional Experience
  drawText('PROFESSIONAL EXPERIENCE', 12, true)
  yPosition -= 5
  
  let experienceData = []
  try {
    if (application.experienceEntries) {
      experienceData = typeof application.experienceEntries === 'string' 
        ? JSON.parse(application.experienceEntries) 
        : application.experienceEntries
    }
  } catch (e) {
    console.error('Failed to parse experience data:', e)
  }
  
  if (experienceData.length > 0) {
    experienceData.forEach((exp: any, index: number) => {
      drawText(`${exp.position}`, 10, true)
      drawText(`  ${exp.fromDate} - ${exp.toDate}`, 9)
      drawText(`  Company/Organization: ${exp.company}`, 9)
      if (exp.remark) drawText(`  Remark: ${exp.remark}`, 9)
      yPosition -= 5
    })
  } else {
    drawText('No experience information provided', 9)
  }
  
  yPosition -= 15
  
  // Academic Preferences
  drawText('ACADEMIC PREFERENCES', 12, true)
  yPosition -= 5
  if (application.areaOfInterest) drawText(`Area of Interest: ${application.areaOfInterest}`, 10)
  if (application.preferredSubjects) drawText(`Preferred Subjects: ${application.preferredSubjects}`, 10)
  if (application.labLectureBoth) drawText(`Mode: ${application.labLectureBoth}`, 10)
  
  yPosition -= 15
  
  // Time Availability
  drawText('TIME AVAILABILITY', 12, true)
  yPosition -= 5
  
  let timeSlotDay = []
  let timeSlotPeriod = []
  try {
    if (application.timeSlotDay) {
      timeSlotDay = typeof application.timeSlotDay === 'string' ? JSON.parse(application.timeSlotDay) : application.timeSlotDay
    }
    if (application.timeSlotPeriod) {
      timeSlotPeriod = typeof application.timeSlotPeriod === 'string' ? JSON.parse(application.timeSlotPeriod) : application.timeSlotPeriod
    }
  } catch (e) {
    console.error('Failed to parse time slot data:', e)
  }
  
  if (timeSlotDay.length > 0) drawText(`Preferred Days: ${timeSlotDay.join(', ')}`, 10)
  if (timeSlotPeriod.length > 0) drawText(`Preferred Period: ${timeSlotPeriod.join(', ')}`, 10)
  if (application.timeSlotText) drawText(`Specific Time Slot: ${application.timeSlotText}`, 10)
  
  yPosition -= 15
  
  // Documents & Links
  drawText('DOCUMENTS & LINKS', 12, true)
  yPosition -= 5
  
  const annotations: any[] = []
  
  // CV/Resume Link
  if (application.cvLink) {
    drawText('CV/Resume: ', 9, true, leftMargin)
    yPosition += lineHeight
    
    page.drawText(application.cvLink, {
      x: leftMargin + 75,
      y: yPosition,
      size: 9,
      font: font,
      color: rgb(0, 0.3, 0.8),
    })
    
    const linkWidth = font.widthOfTextAtSize(application.cvLink, 9)
    const linkAnnotation = pdfDoc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [leftMargin + 75, yPosition - 2, leftMargin + 75 + linkWidth, yPosition + 10],
      Border: [0, 0, 0],
      C: [0, 0, 1],
      A: {
        Type: 'Action',
        S: 'URI',
        URI: pdfDoc.context.obj(application.cvLink),
      },
    })
    
    annotations.push(pdfDoc.context.register(linkAnnotation))
    yPosition -= lineHeight * 2
  }
  
  // LinkedIn Link
  if (application.linkedinLink) {
    drawText('LinkedIn Profile: ', 9, true, leftMargin)
    yPosition += lineHeight
    
    page.drawText(application.linkedinLink, {
      x: leftMargin + 105,
      y: yPosition,
      size: 9,
      font: font,
      color: rgb(0, 0.3, 0.8),
    })
    
    const linkWidth = font.widthOfTextAtSize(application.linkedinLink, 9)
    const linkAnnotation = pdfDoc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [leftMargin + 105, yPosition - 2, leftMargin + 105 + linkWidth, yPosition + 10],
      Border: [0, 0, 0],
      C: [0, 0, 1],
      A: {
        Type: 'Action',
        S: 'URI',
        URI: pdfDoc.context.obj(application.linkedinLink),
      },
    })
    
    annotations.push(pdfDoc.context.register(linkAnnotation))
    yPosition -= lineHeight * 2
  }
  
  // Google Scholar Link
  if (application.googleScholarLink) {
    drawText('Google Scholar: ', 9, true, leftMargin)
    yPosition += lineHeight
    
    page.drawText(application.googleScholarLink, {
      x: leftMargin + 100,
      y: yPosition,
      size: 9,
      font: font,
      color: rgb(0, 0.3, 0.8),
    })
    
    const linkWidth = font.widthOfTextAtSize(application.googleScholarLink, 9)
    const linkAnnotation = pdfDoc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [leftMargin + 100, yPosition - 2, leftMargin + 100 + linkWidth, yPosition + 10],
      Border: [0, 0, 0],
      C: [0, 0, 1],
      A: {
        Type: 'Action',
        S: 'URI',
        URI: pdfDoc.context.obj(application.googleScholarLink),
      },
    })
    
    annotations.push(pdfDoc.context.register(linkAnnotation))
  }
  
  // Set all annotations at once
  if (annotations.length > 0) {
    page.node.set(pdfDoc.context.obj('Annots'), pdfDoc.context.obj(annotations))
  }
  
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
