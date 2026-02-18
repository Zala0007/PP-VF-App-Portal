/*
  Warnings:

  - Added the required column `contactNo` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "educationQualifications" TEXT,
    "experienceEntries" TEXT,
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
    "linkedinLink" TEXT,
    "googleScholarLink" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "dateTimeOfSubmit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Application" ("applicationType", "areaOfInterest", "createdAt", "cvLink", "dateTimeOfSubmit", "department", "educationQualifications", "experienceEntries", "googleScholarLink", "id", "labLectureBoth", "linkedinLink", "name", "preferredEngagements", "preferredSubjects", "remark", "reviewed", "timeSlotDay", "timeSlotPeriod", "timeSlotText", "email", "contactNo") 
SELECT "applicationType", "areaOfInterest", "createdAt", "cvLink", "dateTimeOfSubmit", "department", "educationQualifications", "experienceEntries", "googleScholarLink", "id", "labLectureBoth", "linkedinLink", "name", "preferredEngagements", "preferredSubjects", "remark", "reviewed", "timeSlotDay", "timeSlotPeriod", "timeSlotText", 
COALESCE("linkedinLink", 'noemail@example.com') as email, 
'0000000000' as contactNo 
FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
