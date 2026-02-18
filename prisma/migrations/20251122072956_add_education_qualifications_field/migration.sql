-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "highestQualification" TEXT,
    "educationQualifications" TEXT,
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
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "dateTimeOfSubmit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Application" ("applicationType", "areaOfInterest", "createdAt", "cvLink", "dateTimeOfSubmit", "department", "designation", "experience", "highestQualification", "id", "labLectureBoth", "lengthOfService", "name", "preferredEngagements", "preferredSubjects", "profileLink", "remark", "reviewed", "timeSlotDay", "timeSlotPeriod", "timeSlotText") SELECT "applicationType", "areaOfInterest", "createdAt", "cvLink", "dateTimeOfSubmit", "department", "designation", "experience", "highestQualification", "id", "labLectureBoth", "lengthOfService", "name", "preferredEngagements", "preferredSubjects", "profileLink", "remark", "reviewed", "timeSlotDay", "timeSlotPeriod", "timeSlotText" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
