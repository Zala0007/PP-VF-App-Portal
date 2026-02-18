-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "highestQualification" TEXT NOT NULL,
    "experience" TEXT,
    "designation" TEXT,
    "lengthOfService" TEXT,
    "remark" TEXT,
    "areaOfInterest" TEXT,
    "preferredEngagements" TEXT,
    "department" TEXT,
    "labLectureBoth" TEXT,
    "preferredSubjects" TEXT,
    "timeSlotText" TEXT,
    "timeSlotDay" TEXT,
    "timeSlotPeriod" TEXT,
    "cvLink" TEXT,
    "profileLink" TEXT,
    "dateTimeOfSubmit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
