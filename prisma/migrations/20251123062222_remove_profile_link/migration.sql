/*
  Warnings:

  - You are about to drop the column `profileLink` on the `Application` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "highestQualification" TEXT,
    "educationQualifications" TEXT,
    "experienceEntries" TEXT,
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
    "linkedinLink" TEXT,
    "googleScholarLink" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "dateTimeOfSubmit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Application" ("applicationType", "areaOfInterest", "createdAt", "cvLink", "dateTimeOfSubmit", "department", "designation", "educationQualifications", "experience", "experienceEntries", "googleScholarLink", "highestQualification", "id", "labLectureBoth", "lengthOfService", "linkedinLink", "name", "preferredEngagements", "preferredSubjects", "remark", "reviewed", "timeSlotDay", "timeSlotPeriod", "timeSlotText") SELECT "applicationType", "areaOfInterest", "createdAt", "cvLink", "dateTimeOfSubmit", "department", "designation", "educationQualifications", "experience", "experienceEntries", "googleScholarLink", "highestQualification", "id", "labLectureBoth", "lengthOfService", "linkedinLink", "name", "preferredEngagements", "preferredSubjects", "remark", "reviewed", "timeSlotDay", "timeSlotPeriod", "timeSlotText" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
