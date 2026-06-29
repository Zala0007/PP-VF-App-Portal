const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

const root = path.resolve(__dirname, '..')
const outputDir = path.join(root, 'docs', 'hod-user-manual')
const imageDir = path.join(outputDir, 'images')
const portalUrl = process.env.PORTAL_CAPTURE_URL || 'http://127.0.0.1:3000'

const applications = [
  {
    applicationId: 'VF-DEMO-2026-001',
    applicationType: 'Visiting Faculty',
    college: 'L.D. College of Engineering, Ahmedabad',
    name: 'Dr. Asha Patel',
    email: 'asha.patel@example.invalid',
    contactNo: '9000000001',
    department: ['Computer Engineering'],
    areaOfInterest: 'Artificial Intelligence and Data Science',
    preferredSubjects: 'Machine Learning, Database Management Systems',
    educationQualifications: JSON.stringify([
      {
        degree: 'Ph.D. in Computer Engineering',
        institution: 'Demo Institute of Technology',
        fromDate: '2018',
        toDate: '2023',
        percentage: 'Completed'
      },
      {
        degree: 'M.E. in Computer Engineering',
        institution: 'Sample Engineering College',
        fromDate: '2015',
        toDate: '2017',
        percentage: '8.8 CGPA'
      }
    ]),
    experienceEntries: JSON.stringify([
      {
        position: 'Assistant Professor',
        company: 'Example Engineering Institute',
        fromDate: '2023',
        toDate: 'Present',
        remark: 'Teaching and research'
      }
    ]),
    labLectureBoth: 'Both',
    timeSlotDay: ['Monday', 'Wednesday', 'Friday'],
    timeSlotPeriod: ['Morning'],
    timeSlotText: '10:30 AM to 1:30 PM',
    resumeFile: '',
    linkedinLink: '',
    googleScholarLink: '',
    reviewed: false,
    selectionStatus: 'Pending',
    dateTimeOfSubmit: '2026-06-25T05:30:00.000Z'
  },
  {
    applicationId: 'VF-DEMO-2026-002',
    applicationType: 'Visiting Faculty',
    college: 'L.D. College of Engineering, Ahmedabad',
    name: 'Prof. Nirav Shah',
    email: 'nirav.shah@example.invalid',
    contactNo: '9000000002',
    department: ['Computer Engineering'],
    preferredSubjects: 'Computer Networks, Cyber Security',
    reviewed: false,
    selectionStatus: 'Pending',
    dateTimeOfSubmit: '2026-06-24T08:15:00.000Z'
  },
  {
    applicationId: 'VF-DEMO-2026-003',
    applicationType: 'Visiting Faculty',
    college: 'L.D. College of Engineering, Ahmedabad',
    name: 'Dr. Meera Desai',
    email: 'meera.desai@example.invalid',
    contactNo: '9000000003',
    department: ['Computer Engineering'],
    preferredSubjects: 'Cloud Computing',
    reviewed: true,
    selectionStatus: 'Selected',
    dateTimeOfSubmit: '2026-06-23T07:00:00.000Z'
  }
]

function ensureOutputFolders() {
  fs.mkdirSync(imageDir, { recursive: true })
}

async function createScreenshots(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.setRequestInterception(true)

  page.on('request', async (request) => {
    const url = request.url()

    if (url.includes('/api/hod/applications') && request.method() === 'GET') {
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: applications,
          count: applications.length,
          department: 'Computer Engineering'
        })
      })
      return
    }

    if (url.includes('/api/hod/applications/VF-DEMO-2026-001') && request.method() === 'PATCH') {
      const body = JSON.parse(request.postData() || '{}')
      if (typeof body.reviewed === 'boolean') applications[0].reviewed = body.reviewed
      if (typeof body.selectionStatus === 'string') applications[0].selectionStatus = body.selectionStatus
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...applications[0],
          statusDepartment: 'Computer Engineering',
          senderEmail: 'hod.department@ldce.ac.in'
        })
      })
      return
    }

    if (url.includes('/api/applications/VF-DEMO-2026-001') && request.method() === 'GET') {
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(applications[0])
      })
      return
    }

    if (/mail\.google\.com|googleapis\.com|gstatic\.com/.test(url)) {
      await request.abort()
      return
    }

    await request.continue()
  })

  console.log('Capturing footer Admin Login link...')
  await page.goto(`${portalUrl}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('footer')
  await page.evaluate(() => {
    const adminLink = [...document.querySelectorAll('a')].find((element) =>
      element.textContent?.trim() === 'Admin Login'
    )
    if (adminLink) {
      adminLink.style.outline = '4px solid #dc2626'
      adminLink.style.outlineOffset = '6px'
      adminLink.style.borderRadius = '3px'
      adminLink.scrollIntoView({ block: 'center' })
    }
  })
  await new Promise((resolve) => setTimeout(resolve, 700))
  await page.screenshot({
    path: path.join(imageDir, '00-footer-admin-login.png'),
    fullPage: false
  })

  console.log('Capturing login page...')
  await page.goto(`${portalUrl}/admin`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('text/Admin Login')
  await new Promise((resolve) => setTimeout(resolve, 900))
  await page.evaluate(() => {
    const targets = [
      document.querySelector('input[type="password"]'),
      [...document.querySelectorAll('button')].find((element) => element.textContent?.includes('Sign In'))
    ].filter(Boolean)
    for (const target of targets) {
      target.style.outline = '4px solid #dc2626'
      target.style.outlineOffset = '4px'
    }
  })
  await page.screenshot({
    path: path.join(imageDir, '01-login.png'),
    fullPage: false
  })

  await page.evaluate(() => {
    sessionStorage.setItem('hod_token', 'offline-documentation-token')
    sessionStorage.setItem('hod_department', 'Computer Engineering')
  })
  console.log('Capturing HoD dashboard...')
  await page.goto(`${portalUrl}/hod`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('text/All Applications')
  await new Promise((resolve) => setTimeout(resolve, 1200))
  await page.evaluate(() => {
    const pendingButton = [...document.querySelectorAll('button')].find((element) =>
      element.textContent?.trim() === 'Pending'
    )
    if (pendingButton) {
      pendingButton.style.outline = '4px solid #dc2626'
      pendingButton.style.outlineOffset = '3px'
    }
  })
  await page.screenshot({
    path: path.join(imageDir, '02-dashboard.png'),
    fullPage: true
  })

  console.log('Capturing Reviewed state and action controls...')
  const pendingButton = await page.$$('button')
  for (const button of pendingButton) {
    const text = await button.evaluate((element) => element.textContent?.trim())
    if (text === 'Pending') {
      await button.click()
      break
    }
  }
  await page.waitForFunction(() =>
    [...document.querySelectorAll('button')].some((element) => element.textContent?.trim() === 'Reviewed')
  )
  await page.evaluate(() => {
    const firstRow = document.querySelector('tbody tr')
    if (!firstRow) return
    const targets = [
      [...firstRow.querySelectorAll('button')].find((element) => element.textContent?.trim() === 'Reviewed'),
      [...firstRow.querySelectorAll('a')].find((element) => element.textContent?.includes('View Details')),
      firstRow.querySelector('select')
    ].filter(Boolean)
    for (const target of targets) {
      target.style.outline = '4px solid #dc2626'
      target.style.outlineOffset = '3px'
      target.style.borderRadius = '3px'
    }
  })
  await page.screenshot({
    path: path.join(imageDir, '02b-reviewed-actions.png'),
    fullPage: true
  })

  console.log('Capturing application details...')
  await page.goto(`${portalUrl}/admin/applications/VF-DEMO-2026-001`, {
    waitUntil: 'domcontentloaded'
  })
  await page.waitForSelector('text/Dr. Asha Patel')
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await page.screenshot({
    path: path.join(imageDir, '03-application-details.png'),
    fullPage: true
  })

  console.log('Capturing interview details dialog...')
  await page.goto(`${portalUrl}/hod`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('select')
  await new Promise((resolve) => setTimeout(resolve, 900))
  await page.evaluate(() => {
    const select = document.querySelector('tbody tr select')
    if (select) {
      select.setAttribute('size', '4')
      select.style.outline = '4px solid #dc2626'
      select.style.outlineOffset = '3px'
      select.style.minWidth = '245px'
    }
  })
  const applicationsCard = await page.$('table')
  if (applicationsCard) {
    await applicationsCard.screenshot({
      path: path.join(imageDir, '03b-all-status-options.png')
    })
  }
  await page.evaluate(() => {
    const select = document.querySelector('tbody tr select')
    if (select) {
      select.removeAttribute('size')
      select.style.outline = ''
      select.style.outlineOffset = ''
    }
  })
  await page.select('select', 'Shortlisted for Interview')
  await page.waitForSelector('text/Interview Details')
  await new Promise((resolve) => setTimeout(resolve, 500))
  await page.screenshot({
    path: path.join(imageDir, '04-interview-details.png'),
    fullPage: false
  })

  console.log('Creating privacy-safe Google account chooser illustration...')
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #f7f9fc;
          color: #202124;
          font-family: Arial, sans-serif;
        }
        .card {
          width: 470px;
          padding: 38px 40px 32px;
          border: 1px solid #dadce0;
          border-radius: 10px;
          background: white;
          box-shadow: 0 2px 8px rgba(60,64,67,.08);
        }
        .google { font-size: 23px; font-weight: 600; letter-spacing: -1px; text-align: center; }
        .b { color: #4285f4; } .r { color: #ea4335; }
        .y { color: #fbbc05; } .g { color: #34a853; }
        h1 { margin: 22px 0 8px; font-size: 24px; font-weight: 400; text-align: center; }
        .sub { margin: 0 0 25px; color: #5f6368; text-align: center; }
        .account {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 8px;
          border-top: 1px solid #dadce0;
          cursor: default;
        }
        .account:last-of-type { border-bottom: 1px solid #dadce0; }
        .avatar {
          width: 42px; height: 42px; border-radius: 50%;
          display: grid; place-items: center;
          background: #1a73e8; color: white; font-size: 18px; font-weight: 600;
        }
        .name { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
        .email { color: #5f6368; font-size: 13px; }
        .other { color: #1a73e8; font-weight: 600; font-size: 14px; }
        .shield {
          margin: 24px 0 0;
          padding: 12px;
          border-radius: 6px;
          background: #eef4ff;
          color: #315b96;
          font-size: 13px;
          line-height: 1.45;
        }
        .annotation {
          position: absolute;
          width: 250px;
          margin-left: 760px;
          padding: 16px;
          border: 2px solid #d97706;
          border-radius: 8px;
          background: #fff7e6;
          color: #744210;
          font-size: 16px;
          line-height: 1.4;
        }
        .arrow { color: #d97706; font-size: 32px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="google">
          <span class="b">G</span><span class="r">o</span><span class="y">o</span><span class="b">g</span><span class="g">l</span><span class="r">e</span>
        </div>
        <h1>Choose an account</h1>
        <p class="sub">to continue to Gmail</p>
        <div class="account">
          <div class="avatar">H</div>
          <div>
            <div class="name">HoD — Computer Engineering</div>
            <div class="email">hod.department@ldce.ac.in</div>
          </div>
        </div>
        <div class="account">
          <div class="avatar" style="background:#5f6368">+</div>
          <div class="other">Use another account</div>
        </div>
        <div class="shield">Use only the official HoD/departmental Google account authorized by LDCE.</div>
      </div>
      <div class="annotation"><span class="arrow">←</span><br><strong>Select the official HoD account.</strong><br>Do not select a personal Google account.</div>
    </body>
    </html>`, { waitUntil: 'load' })
  await page.screenshot({
    path: path.join(imageDir, '05-google-account-chooser.png'),
    fullPage: false
  })

  console.log('Creating privacy-safe Gmail draft illustration...')
  await page.setContent(`<!doctype html>
    <html><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; }
      body { margin:0; background:#f6f8fc; font-family:Arial,sans-serif; color:#202124; }
      .top { height:64px; display:flex; align-items:center; gap:18px; padding:0 24px; background:white; }
      .logo { font-size:22px; color:#5f6368; } .logo b { color:#ea4335; }
      .search { width:560px; padding:13px 18px; border-radius:24px; background:#eaf1fb; color:#5f6368; }
      .account { margin-left:auto; font-size:13px; text-align:right; }
      .layout { display:flex; height:736px; }
      .side { width:220px; padding:22px 14px; }
      .compose { padding:16px 24px; border-radius:16px; background:#c2e7ff; font-weight:600; }
      .inbox { margin-top:20px; padding:10px 15px; border-radius:18px; background:#d3e3fd; }
      .draft {
        position:absolute; right:55px; bottom:30px; width:650px; height:610px;
        border-radius:10px 10px 0 0; background:white;
        box-shadow:0 8px 30px rgba(60,64,67,.28); overflow:hidden;
      }
      .draft-head { padding:13px 16px; background:#f2f6fc; font-weight:600; }
      .row { min-height:48px; padding:13px 17px; border-bottom:1px solid #e0e0e0; font-size:14px; }
      .label { color:#5f6368; display:inline-block; width:58px; }
      .body { padding:20px 22px; font-size:14px; line-height:1.55; white-space:pre-line; }
      .send {
        position:absolute; left:18px; bottom:18px; padding:11px 28px;
        border:4px solid #dc2626; border-radius:22px; background:#0b57d0;
        color:white; font-weight:700;
      }
      .from-box { border:4px solid #dc2626; border-radius:5px; padding:7px 10px; margin:-7px -10px; }
      .edit-note {
        position:absolute; right:735px; bottom:250px; width:250px;
        padding:14px; border:3px solid #dc2626; border-radius:8px;
        background:#fff; color:#991b1b; font-weight:600; line-height:1.4;
      }
      .send-note {
        position:absolute; right:735px; bottom:50px; width:250px;
        padding:14px; border:3px solid #dc2626; border-radius:8px;
        background:#fff; color:#991b1b; font-weight:600; line-height:1.4;
      }
    </style></head><body>
      <div class="top"><div class="logo"><b>M</b> Gmail</div><div class="search">Search mail</div><div class="account">HoD — Computer Engineering<br>hod.department@ldce.ac.in</div></div>
      <div class="layout"><div class="side"><div class="compose">✎ Compose</div><div class="inbox">Inbox</div></div></div>
      <div class="draft">
        <div class="draft-head">New Message</div>
        <div class="row"><span class="label">From</span><span class="from-box">HoD — Computer Engineering &lt;hod.department@ldce.ac.in&gt;</span></div>
        <div class="row"><span class="label">To</span>Dr. Asha Patel &lt;asha.patel@example.invalid&gt;</div>
        <div class="row"><span class="label">Subject</span>Visiting Faculty Application Status — VF-DEMO-2026-001</div>
        <div class="body">Dear Dr. Asha Patel,

Your Visiting Faculty application has been shortlisted for an interview.

Interview Date: 05 July 2026
Time: 11:00 AM
Venue/Mode: Computer Engineering Department, LDCE

Regards,
Head of Department
Computer Engineering, LDCE</div>
        <div class="send">Send</div>
      </div>
      <div class="edit-note">← Review or modify the pre-filled subject and message body here.</div>
      <div class="send-note">← After final verification, click Send to deliver the email to the candidate.</div>
    </body></html>`, { waitUntil: 'load' })
  await page.screenshot({
    path: path.join(imageDir, '06-gmail-draft.png'),
    fullPage: false
  })

  await page.close()
}

function fileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, '/')}`
}

function buildManualHtml() {
  const logo = fileUrl(path.join(root, 'public', 'ldce-logo.png'))
  const footerLogin = fileUrl(path.join(imageDir, '00-footer-admin-login.png'))
  const login = fileUrl(path.join(imageDir, '01-login.png'))
  const dashboard = fileUrl(path.join(imageDir, '02-dashboard.png'))
  const reviewedActions = fileUrl(path.join(imageDir, '02b-reviewed-actions.png'))
  const details = fileUrl(path.join(imageDir, '03-application-details.png'))
  const statusOptions = fileUrl(path.join(imageDir, '03b-all-status-options.png'))
  const interview = fileUrl(path.join(imageDir, '04-interview-details.png'))
  const accountChooser = fileUrl(path.join(imageDir, '05-google-account-chooser.png'))
  const gmailDraft = fileUrl(path.join(imageDir, '06-gmail-draft.png'))

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>HoD User Manual — Visiting Faculty Application Portal</title>
  <style>
    @page { size: A4; margin: 16mm 15mm 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #182230;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.48;
      background: white;
    }
    h1, h2, h3 { color: #173b6d; page-break-after: avoid; }
    h1 { margin: 12px 0 4px; font-size: 25pt; line-height: 1.15; }
    h2 {
      margin: 22px 0 10px;
      padding-bottom: 5px;
      font-size: 17pt;
      border-bottom: 2px solid #d8e6f7;
    }
    h3 { margin: 16px 0 7px; font-size: 12.5pt; }
    p { margin: 6px 0 10px; }
    ol, ul { margin: 6px 0 12px; padding-left: 22px; }
    li { margin: 4px 0; }
    .cover {
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      page-break-after: always;
    }
    .cover img { width: 92px; height: 92px; object-fit: contain; margin: 0 auto 18px; }
    .subtitle { color: #536579; font-size: 14pt; }
    .meta {
      width: 76%;
      margin: 28px auto 0;
      padding: 14px;
      border-top: 1px solid #cbd8e6;
      border-bottom: 1px solid #cbd8e6;
      color: #536579;
      font-size: 10pt;
    }
    .callout {
      margin: 12px 0;
      padding: 10px 12px;
      border-left: 4px solid #2d6fb7;
      background: #edf5ff;
      page-break-inside: avoid;
    }
    .warning { border-color: #d97706; background: #fff7e8; }
    .danger { border-color: #c2413b; background: #fff0ef; }
    .figure { margin: 12px 0 18px; page-break-inside: avoid; }
    .figure img {
      display: block;
      width: 100%;
      max-height: 191mm;
      object-fit: contain;
      object-position: top center;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #f8fafc;
    }
    .caption { margin-top: 5px; color: #64748b; font-size: 8.5pt; text-align: center; }
    .page-break { page-break-before: always; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; }
    th, td { padding: 8px; border: 1px solid #ccd6e0; text-align: left; vertical-align: top; }
    th { background: #e9f1fb; color: #173b6d; }
    .steps { counter-reset: step; list-style: none; padding-left: 0; }
    .steps > li { position: relative; padding-left: 35px; margin: 9px 0; }
    .steps > li::before {
      counter-increment: step;
      content: counter(step);
      position: absolute;
      left: 0;
      top: -1px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #2d6fb7;
      color: white;
      font-weight: 700;
      text-align: center;
      line-height: 24px;
    }
    .small { color: #64748b; font-size: 8.5pt; }
    .toc td:first-child { width: 42px; text-align: center; font-weight: 700; color: #2d6fb7; }
    .footer-note { margin-top: 22px; padding-top: 8px; border-top: 1px solid #d6dee8; color: #64748b; font-size: 8.5pt; }
  </style>
</head>
<body>
  <section class="cover">
    <img src="${logo}" alt="LDCE logo">
    <div class="small">L. D. COLLEGE OF ENGINEERING, AHMEDABAD</div>
    <h1>HoD User Manual</h1>
    <div class="subtitle">Visiting Faculty Application Portal</div>
    <div class="meta">
      Audience: Heads of Department (HoDs)<br>
      Version 1.0 &nbsp; | &nbsp; 29 June 2026<br>
      Prepared using the current portal interface
    </div>
  </section>

  <h2>1. Purpose and safe use</h2>
  <p>This manual explains how an HoD signs in, reviews department applications, views candidate information, records review progress, updates selection status, and signs out.</p>
  <div class="callout warning"><strong>Important:</strong> Use only the password issued for your department. Do not share it, save it in a public browser, or forward screenshots containing candidate information.</div>
  <div class="callout danger"><strong>Email caution:</strong> Selecting <em>Shortlisted for Interview</em>, <em>Rejected</em>, or <em>Selected</em> updates the portal record and opens Google/Gmail. If Google asks you to choose an account, select the official HoD/departmental account—not a personal account. The portal does not click Send for you.</div>
  <p class="small">The screenshots in this manual use fictional sample candidates on the real portal interface. No live record was changed and no email was sent while preparing this document.</p>

  <h2>2. Quick workflow</h2>
  <table class="toc">
    <tr><td>1</td><td>Open <strong>visitingfaculty.ldcecollege.org</strong>, go to the footer, and click <strong>Admin Login</strong>.</td></tr>
    <tr><td>2</td><td>Sign in with the password assigned to your department.</td></tr>
    <tr><td>3</td><td>On the dashboard, change the application's review state from <strong>Pending</strong> to <strong>Reviewed</strong>.</td></tr>
    <tr><td>4</td><td>Under Actions, click <strong>View Details</strong> and examine the complete application.</td></tr>
    <tr><td>5</td><td>Return to All Applications and choose the approved status from the Actions submenu.</td></tr>
    <tr><td>6</td><td>Select the official departmental Google account, review or modify the pre-filled Gmail draft, and click Send.</td></tr>
  </table>

  <h2>3. Open Admin Login from the portal footer</h2>
  <ol class="steps">
    <li>Open <strong>visitingfaculty.ldcecollege.org</strong>.</li>
    <li>Scroll to the footer at the bottom of the home page.</li>
    <li>Under <strong>Quick Links</strong>, click <strong>Admin Login</strong>.</li>
  </ol>
  <div class="figure">
    <img src="${footerLogin}" alt="Portal footer with Admin Login highlighted">
    <div class="caption">Figure 1 — Portal footer; click the Admin Login link inside the red box</div>
  </div>

  <h2>4. Sign in to the HoD dashboard</h2>
  <ol class="steps">
    <li>Enter your department's HoD password in the <strong>Password</strong> field.</li>
    <li>Click <strong>Sign In</strong>. The portal identifies the department from the password and opens that department's HoD dashboard.</li>
  </ol>
  <div class="callout"><strong>If sign-in fails:</strong> check Caps Lock, remove accidental spaces, and retry. If it still fails, contact the portal administrator; do not use another department's credentials.</div>
  <div class="figure">
    <img src="${login}" alt="Portal login page">
    <div class="caption">Figure 2 — Shared Admin/HoD login page on the real portal interface</div>
  </div>

  <div class="page-break"></div>
  <h2>5. Change Pending to Reviewed</h2>
  <p>The heading confirms the department currently signed in. Only LDCE applications mapped to that department are shown.</p>
  <ol class="steps">
    <li>Find the candidate in <strong>All Applications</strong>. You may search by candidate name or application ID.</li>
    <li>In the Status column, click the orange <strong>Pending</strong> badge highlighted in red.</li>
    <li>Wait until the badge changes to green <strong>Reviewed</strong>. The selection-status submenu under Actions is now enabled.</li>
  </ol>
  <div class="figure">
    <img src="${dashboard}" alt="HoD dashboard with Pending highlighted">
    <div class="caption">Figure 3 — First click Pending in the Status column (red box)</div>
  </div>
  <div class="figure">
    <img src="${reviewedActions}" alt="Reviewed state and actions highlighted">
    <div class="caption">Figure 4 — Reviewed, View Details, and the status submenu are highlighted in red</div>
  </div>
  <div class="callout"><strong>Email behavior:</strong> Changing only the review state from Pending to Reviewed does not open Gmail and does not send an email.</div>

  <h3>Dashboard controls</h3>
  <table>
    <tr><th>Dashboard item</th><th>Meaning</th></tr>
    <tr><td>Department Applications</td><td>Total applications currently available to your department.</td></tr>
    <tr><td>Reviewed</td><td>Applications already marked as reviewed.</td></tr>
    <tr><td>Pending Review</td><td>Applications that still require review.</td></tr>
    <tr><td>Search Name/Application ID</td><td>Filters the list by candidate name or application ID.</td></tr>
    <tr><td>Status badges</td><td>Show review state (Pending/Reviewed) and decision state (Pending/Shortlisted/Rejected/Selected).</td></tr>
    <tr><td>View Details</td><td>Opens the complete application.</td></tr>
    <tr><td>Envelope icon</td><td>Opens a blank Gmail message to the candidate. Avoid it unless you intend to write an authorized email.</td></tr>
    <tr><td>Select status</td><td>Records the decision; enabled only after the application is marked Reviewed.</td></tr>
  </table>

  <h2>6. Open View Details</h2>
  <ol class="steps">
    <li>In the candidate's row, go to the <strong>Actions</strong> column.</li>
    <li>Click <strong>View Details</strong> (shown in the red box in Figure 4).</li>
    <li>Review contact details, academic information, education, professional experience, engagement preferences, time availability, resume, LinkedIn, and Google Scholar links when provided.</li>
    <li>Use <strong>Export as PDF</strong> only if an official offline copy is needed. Store exported files securely because they contain personal information.</li>
    <li>Click <strong>Back to Applications</strong> to return.</li>
  </ol>
  <div class="figure">
    <img src="${details}" alt="Application details page">
    <div class="caption">Figure 5 — Complete candidate application details</div>
  </div>

  <div class="page-break"></div>
  <h2>7. Select the candidate status</h2>
  <p>Use the <strong>Select status</strong> menu only after the departmental decision is approved. The choices are:</p>
  <table>
    <tr><th>Status</th><th>What happens</th></tr>
    <tr><td>Shortlisted for Interview</td><td>An Interview Details window asks for interview date, time, venue/mode, and optional instructions. After confirmation, the portal updates the record and opens a prepared Gmail draft.</td></tr>
    <tr><td>Rejected</td><td>The portal updates the record and opens a prepared Gmail draft.</td></tr>
    <tr><td>Selected</td><td>The portal updates the record and opens a prepared Gmail draft.</td></tr>
  </table>
  <div class="figure">
    <img src="${interview}" alt="Interview details dialog">
    <div class="caption">Figure 6 — Interview details appear when Shortlisted for Interview is selected</div>
  </div>
  <h3>Choose the correct Google account</h3>
  <p>After the portal opens Gmail, Google may display an account chooser. This commonly appears when more than one Google account is available in the browser or when the HoD account is not yet active.</p>
  <div class="figure">
    <img src="${accountChooser}" alt="Illustration of Google account chooser">
    <div class="caption">Figure 7 — Select the official departmental account inside the red callout; the address shown is an example</div>
  </div>
  <ol class="steps">
    <li>Confirm the correct candidate and approved decision.</li>
    <li>Select the required status. For an interview, complete every required interview field and verify the date, time, and venue/mode.</li>
    <li>Confirm the action. A Google account chooser or Gmail compose tab may open.</li>
    <li>If the account chooser appears, click the official HoD/departmental account. If it is not listed, use <strong>Use another account</strong> and sign in with the authorized HoD account. Never select a personal account.</li>
    <li>In Gmail, check the <strong>From</strong> account, recipient, subject, status, interview information, and signature.</li>
    <li>The subject and message body are already drafted. Change or modify the content if required.</li>
    <li>After final verification, click <strong>Send</strong>. Gmail sends the message directly to the respective candidate.</li>
  </ol>
  <div class="figure">
    <img src="${gmailDraft}" alt="Illustration of the drafted Gmail message">
    <div class="caption">Figure 8 — Review or modify the pre-filled draft, then click Send to email the candidate</div>
  </div>
  <div class="callout danger"><strong>Important:</strong> The portal prepares the draft, but it is not delivered until the HoD clicks Gmail's <strong>Send</strong> button. Verify the official From account and the candidate's address before sending.</div>

  <h2>8. Sign out and protect candidate data</h2>
  <ol class="steps">
    <li>Click <strong>Logout</strong> at the upper-right of the HoD dashboard.</li>
    <li>Confirm that the login page appears.</li>
    <li>Close exported PDFs, resumes, and portal tabs. Remove downloaded files when institutional retention rules no longer require them.</li>
  </ol>
  <ul>
    <li>Use a trusted institutional computer and network.</li>
    <li>Do not share HoD credentials or candidate data through personal accounts.</li>
    <li>Verify every candidate and application ID before changing a status.</li>
    <li>Report wrong department mapping, missing records, or access problems to the portal administrator.</li>
  </ul>

  <h2>9. Troubleshooting</h2>
  <table>
    <tr><th>Problem</th><th>Recommended action</th></tr>
    <tr><td>Invalid password</td><td>Check Caps Lock and spaces; then request credential verification from the portal administrator.</td></tr>
    <tr><td>Application is not visible</td><td>Clear the search field. Confirm the application belongs to LDCE and your department. Ask the administrator to verify mapping if needed.</td></tr>
    <tr><td>Status menu is disabled</td><td>Open and review the application, then mark the review badge as Reviewed.</td></tr>
    <tr><td>Wrong status selected</td><td>Stop before sending any email and immediately contact the portal administrator/authorized coordinator. Correct the portal record only according to the approved procedure.</td></tr>
    <tr><td>Gmail draft did not open</td><td>Check whether the browser blocked a pop-up. Confirm the status in the portal before retrying so the candidate is not notified twice.</td></tr>
    <tr><td>Session/access error</td><td>Return to the login page, sign in again, and retry. Report repeated errors with the application ID and a screenshot that does not expose unnecessary personal data.</td></tr>
  </table>

  <div class="footer-note">
    Document owner: L. D. College of Engineering &nbsp; • &nbsp; HoD Visiting Faculty Portal Manual &nbsp; • &nbsp; Version 1.0
  </div>
</body>
</html>`
}

function buildShortManualHtml() {
  const logo = fileUrl(path.join(root, 'public', 'ldce-logo.png'))
  const footerLogin = fileUrl(path.join(imageDir, '00-footer-admin-login.png'))
  const login = fileUrl(path.join(imageDir, '01-login.png'))
  const dashboard = fileUrl(path.join(imageDir, '02-dashboard.png'))
  const reviewedActions = fileUrl(path.join(imageDir, '02b-reviewed-actions.png'))
  const details = fileUrl(path.join(imageDir, '03-application-details.png'))
  const statusOptions = fileUrl(path.join(imageDir, '03b-all-status-options.png'))
  const interview = fileUrl(path.join(imageDir, '04-interview-details.png'))
  const accountChooser = fileUrl(path.join(imageDir, '05-google-account-chooser.png'))
  const gmailDraft = fileUrl(path.join(imageDir, '06-gmail-draft.png'))

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>HoD Quick User Guide</title>
  <style>
    @page { size: A4 landscape; margin: 13mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: #172033; font-size: 11pt; line-height: 1.4; }
    h1, h2 { color: #173b6d; margin: 0 0 10px; }
    h1 { font-size: 25pt; } h2 { font-size: 18pt; border-bottom: 2px solid #dbe8f7; padding-bottom: 5px; }
    p { margin: 5px 0 9px; }
    .cover { display: flex; align-items: center; justify-content: center; gap: 20px; text-align: left; margin-bottom: 12px; }
    .cover img { width: 72px; margin: 0; }
    .cover p { color: #5b6878; font-size: 13pt; }
    .sheet { height: 176mm; overflow: hidden; page-break-after: always; }
    .sheet:last-child { page-break-after: auto; }
    .cover-sheet { display: grid; place-content: center; text-align: center; }
    .cover-sheet .cover { display: block; text-align: center; margin: 0; }
    .cover-sheet .cover img { width: 105px; margin: 0 auto 20px; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }
    .wide-left { grid-template-columns: 1.25fr .75fr; }
    .panel { min-width: 0; }
    .step { margin: 8px 0 12px; padding: 10px 12px; background: #edf5ff; border-left: 5px solid #2563eb; font-weight: 600; }
    .figure { margin: 9px 0 14px; text-align: center; page-break-inside: avoid; }
    .figure img { width: 100%; max-height: 128mm; object-fit: contain; object-position: top; border: 1px solid #cbd5e1; }
    .caption { margin-top: 4px; color: #64748b; font-size: 8.5pt; }
    .small-img img { max-height: 72mm; }
    .medium-img img { max-height: 104mm; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 9px; text-align: left; vertical-align: top; }
    th { background: #e8f1fb; color: #173b6d; }
    .note { margin: 10px 0; padding: 10px 12px; background: #fff7e6; border-left: 5px solid #d97706; }
    .final { font-size: 12pt; font-weight: 600; color: #173b6d; }
  </style>
</head>
<body>
  <section class="sheet cover-sheet">
    <div class="cover">
      <img src="${logo}" alt="LDCE logo">
      <div><h1>HoD Quick User Guide</h1><p>Visiting Faculty Application Portal — visitingfaculty.ldcecollege.org</p></div>
    </div>
  </section>

  <section class="sheet">
    <h2>1. Open HoD Login</h2>
    <div class="step">Open the website → scroll to the footer → click <strong>Admin Login</strong> → enter the HoD password → click <strong>Sign In</strong>.</div>
    <div class="cols">
      <div class="figure medium-img"><img src="${footerLogin}" alt="Admin Login in footer"><div class="caption">Click Admin Login (red box)</div></div>
      <div class="figure medium-img"><img src="${login}" alt="HoD login"><div class="caption">Enter the password and click Sign In</div></div>
    </div>
  </section>

  <section class="sheet">
    <h2>2. Mark the Application Reviewed</h2>
    <div class="step">Click the orange <strong>Pending</strong> button. It changes to green <strong>Reviewed</strong>.</div>
    <div class="cols">
      <div class="figure"><img src="${dashboard}" alt="Pending status"><div class="caption">Click Pending in the red box</div></div>
      <div class="figure"><img src="${reviewedActions}" alt="Reviewed and actions"><div class="caption">Reviewed, View Details, and Select status</div></div>
    </div>
  </section>

  <section class="sheet">
    <div class="cols wide-left">
      <div class="panel">
        <h2>3. View Candidate Details</h2>
        <div class="step">Under Actions, click <strong>View Details</strong> and check the complete application.</div>
        <div class="figure"><img src="${details}" alt="Candidate application details"><div class="caption">Check education, experience, subjects, availability, and documents</div></div>
      </div>
      <div class="panel">
        <h2>4. Select One Status</h2>
        <div class="figure small-img"><img src="${statusOptions}" alt="All three status options"><div class="caption">Choose one status</div></div>
        <table>
          <tr><th>Status</th><th>Meaning</th></tr>
          <tr><td><strong>Rejected</strong></td><td>Not selected</td></tr>
          <tr><td><strong>Shortlisted for Interview</strong></td><td>Enter interview details</td></tr>
          <tr><td><strong>Selected</strong></td><td>Candidate selected</td></tr>
        </table>
        <div class="figure small-img"><img src="${interview}" alt="Interview details"><div class="caption">Interview details screen</div></div>
      </div>
    </div>
  </section>

  <section class="sheet">
    <div class="cols">
      <div class="panel">
        <h2>5. Select Official Google Account</h2>
        <div class="step">Select your <strong>official departmental email account</strong>, not a personal account.</div>
        <div class="figure"><img src="${accountChooser}" alt="Google account chooser"><div class="caption">Select the official HoD account</div></div>
      </div>
      <div class="panel">
        <h2>6. Review and Send</h2>
        <div class="step">Edit the pre-filled email if needed, verify the details, and click <strong>Send</strong>.</div>
        <div class="figure"><img src="${gmailDraft}" alt="Gmail draft"><div class="caption">Verify From, To, subject, and message</div></div>
        <div class="note">The candidate receives the email after you click Gmail's <strong>Send</strong> button.</div>
        <p class="final">Repeat these steps for all applications.</p>
      </div>
    </div>
  </section>
</body>
</html>`
}

async function createManualPdf(browser) {
  const htmlPath = path.join(outputDir, 'HoD-User-Manual.html')
  const pdfPath = path.join(outputDir, 'HoD-User-Manual.pdf')
  fs.writeFileSync(htmlPath, buildShortManualHtml(), 'utf8')

  const page = await browser.newPage()
  console.log('Creating PDF manual...')
  await page.goto(fileUrl(htmlPath), { waitUntil: 'load' })
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-size:8px;color:#64748b;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margin: { top: '16mm', right: '15mm', bottom: '18mm', left: '15mm' }
  })
  await page.close()
  return { htmlPath, pdfPath }
}

async function main() {
  ensureOutputFolders()
  const headlessShell = path.join(
    process.env.USERPROFILE || '',
    '.cache',
    'puppeteer',
    'chrome-headless-shell',
    'win64-143.0.7499.40',
    'chrome-headless-shell-win64',
    'chrome-headless-shell.exe'
  )
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: fs.existsSync(headlessShell) ? headlessShell : undefined,
    args: ['--no-sandbox', '--disable-gpu']
  })

  try {
    await createScreenshots(browser)
    const result = await createManualPdf(browser)
    console.log(JSON.stringify(result, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
