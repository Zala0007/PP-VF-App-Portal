# Visiting Faculty Application Portal

A comprehensive web application for **Visiting Faculty (VF)** recruitment across Gujarat Government Engineering Colleges. This portal streamlines the entire recruitment process from application submission to administrative review and vacancy management.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)

---

## Features

### For Applicants
- **Easy Application Process** - Multi-step form with intuitive UI
- **Visiting Faculty Applications** - Apply for Visiting Faculty positions
- **16 Government Colleges** - Select from all Gujarat government engineering colleges
- **Department Selection** - College-specific department options
- **Flexible Scheduling** - Multi-select days and time periods
- **Document Links** - Attach CV, LinkedIn, and Google Scholar profiles
- **Email Confirmation** - Automatic confirmation email upon submission

### For Administrators
- **Secure Dashboard** - Multi-password authentication system
- **Application Management** - Search, filter, review, and track applications
- **Vacancy Management** - Add, edit, and delete department-wise vacancies
- **Real-time Statistics** - Live counts for applications and vacancies
- **Application Export** - Export applications data
- **College Management** - Manage college listings and principal emails
- **Resource Management** - Upload and manage downloadable resources

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | SQLite with Prisma ORM |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |
| **Email** | Nodemailer |
| **PDF Generation** | pdf-lib, Puppeteer |

---

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── apply/page.tsx           # Application form
│   ├── colleges/page.tsx        # Colleges listing
│   ├── resources/page.tsx       # Resources & downloads
│   ├── submitted/page.tsx       # Submission success page
│   ├── vacancy/page.tsx         # Public vacancy listings
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── applications/        # Application management
│   │   ├── colleges/            # College management
│   │   ├── principal-emails/    # Principal email management
│   │   ├── resources/           # Resource management
│   │   └── vacancy/             # Vacancy management
│   └── api/
│       ├── applications/        # Application CRUD API
│       ├── vacancies/           # Vacancy CRUD API
│       ├── colleges/            # College API
│       ├── resources/           # Resources API
│       ├── email-applications/  # Email notification API
│       ├── export-applications/ # Export API
│       └── principal-emails/    # Principal emails API
├── components/
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Site footer
│   ├── ThemeProvider.tsx        # Dark/Light theme
│   └── ...
├── lib/
│   ├── prisma.ts                # Prisma client
│   ├── colleges.ts              # College data
│   ├── email.ts                 # Email utilities
│   └── generatePDF.ts           # PDF generation
└── prisma/
    └── schema.prisma            # Database schema
```

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Zala0007/Visiting-Faculty-LDCE.git
   cd Visiting-Faculty-LDCE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   
   # Admin passwords (multiple for different access levels)
   ADMIN_PASSWORD_1="your-password-1"
   ADMIN_PASSWORD_2="your-password-2"
   ADMIN_PASSWORD_3="your-password-3"
   ADMIN_PASSWORD_4="your-password-4"
   ADMIN_PASSWORD_5="your-password-5"
   NEXT_PUBLIC_ADMIN_PASSWORDS="password1,password2,password3,password4,password5"
   
   # Email configuration (Gmail App Password)
   EMAIL_USER="your-email@gmail.com"
   EMAIL_APP_PASSWORD="your-app-password"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run lint` | Run ESLint |

---

## Database Schema

### Application
Stores faculty applications with:
- Personal information (name, email, contact)
- Education qualifications (JSON array)
- Experience entries (JSON array)
- Preferred college, departments, subjects
- Time availability (days and periods)
- Links (CV, LinkedIn, Google Scholar)
- Review status

### Vacancy
Department-wise vacancy tracking:
- College name
- Department name
- Visiting Faculty count
- Visiting Faculty count

### Resource
Uploaded resources and documents:
- Title, file name, file path
- File size, upload date

---

## Colleges Covered

The portal supports 16 Government Engineering Colleges across Gujarat:

- L.D. College of Engineering, Ahmedabad
- Vishwakarma Government Engineering College, Ahmedabad
- Government Engineering College, Gandhinagar
- Government Engineering College, Rajkot
- Government Engineering College, Bhavnagar
- Government Engineering College, Bharuch
- Government Engineering College, Surat
- And 9 more...

Each college has its specific list of departments available for selection.

---

## Admin Panel

### Access
Navigate to `/admin` and enter any of the configured admin passwords.

### Dashboard Features
- **Statistics Overview** - Total applications, pending reviews, vacancy counts
- **Quick Actions** - Direct links to management sections
- **Application Review** - Mark applications as reviewed
- **Vacancy Management** - CRUD operations for department vacancies
- **Resource Upload** - Upload documents for applicants

### Security
- Multiple admin passwords for different access levels
- Session-based authentication (sessionStorage)
- API-level password validation
- Prisma ORM prevents SQL injection

---

## Application Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Landing Page  │────▶│  Application     │────▶│   Confirmation  │
│   (Home)        │     │  Form (/apply)   │     │   (/submitted)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │   Email Sent     │
                        │   to Applicant   │
                        └──────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Admin Login   │────▶│  Admin Dashboard │────▶│   Review &      │
│   (/admin)      │     │  (Statistics)    │     │   Manage        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## UI/UX Features

- **Dark/Light Theme** - System preference detection with manual toggle
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Smooth Animations** - Framer Motion for transitions
- **Form Validation** - Real-time validation with helpful error messages
- **Loading States** - Spinners and skeleton loaders
- **Accessibility** - Proper contrast ratios and ARIA labels

---

## Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables for Production
Ensure all environment variables are set in your hosting platform:
- `DATABASE_URL` - Database connection string
- `ADMIN_PASSWORD_*` - Admin credentials
- `EMAIL_USER` & `EMAIL_APP_PASSWORD` - Email configuration

### Recommended Platforms
- Vercel (recommended)
- Railway
- Render
- Any Node.js hosting with SQLite support

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is developed for government educational institutions in Gujarat, India.

---

## Support

For issues or feature requests, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for Gujarat Government Engineering Colleges**
