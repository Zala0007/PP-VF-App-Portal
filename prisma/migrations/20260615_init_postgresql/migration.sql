-- CreateTable
CREATE TABLE "Application" (
    "applicationId" TEXT NOT NULL,
    "applicationType" TEXT NOT NULL,
    "college" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "educationQualifications" TEXT,
    "experienceEntries" TEXT,
    "remark" TEXT,
    "areaOfInterest" TEXT,
    "department" TEXT,
    "labLectureBoth" TEXT,
    "preferredSubjects" TEXT,
    "timeSlotText" TEXT,
    "timeSlotDay" TEXT,
    "timeSlotPeriod" TEXT,
    "resumeFile" TEXT,
    "linkedinLink" TEXT,
    "googleScholarLink" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "dateTimeOfSubmit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" SERIAL NOT NULL,
    "college" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "visitingFaculty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
