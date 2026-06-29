CREATE TABLE "ApplicationDepartmentReview" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "selectionStatus" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationDepartmentReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApplicationDepartmentReview_applicationId_department_key"
ON "ApplicationDepartmentReview"("applicationId", "department");

CREATE INDEX "ApplicationDepartmentReview_department_idx"
ON "ApplicationDepartmentReview"("department");

ALTER TABLE "ApplicationDepartmentReview"
ADD CONSTRAINT "ApplicationDepartmentReview_applicationId_fkey"
FOREIGN KEY ("applicationId") REFERENCES "Application"("applicationId")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Additive backfill only: this does not update or delete any Application row.
--
-- For an application owned by one HoD, the legacy status can be mapped safely.
-- For an application visible to multiple HoDs, the old schema cannot tell
-- which HoD changed the shared status. Those department-specific rows begin as
-- Pending instead of incorrectly attributing another department's decision.
--
-- The original reviewed/selectionStatus values remain unchanged in Application
-- for historical reference. Maths, English, and Physics keep independent
-- decision rows even though one Science & Humanities HoD manages them.
WITH parsed_departments AS (
    SELECT
        application."applicationId",
        application."reviewed",
        application."selectionStatus",
        application."createdAt",
        selected_department AS department
    FROM "Application" AS application
    CROSS JOIN LATERAL jsonb_array_elements_text(
        CASE
            WHEN application."department" IS NULL OR btrim(application."department") = ''
                THEN '[]'::jsonb
            WHEN left(btrim(application."department"), 1) = '['
                THEN application."department"::jsonb
            ELSE jsonb_build_array(application."department")
        END
    ) AS departments(selected_department)
),
department_counts AS (
    SELECT
        "applicationId",
        COUNT(DISTINCT department) AS department_count
    FROM parsed_departments
    GROUP BY "applicationId"
)
INSERT INTO "ApplicationDepartmentReview" (
    "applicationId",
    "department",
    "reviewed",
    "selectionStatus",
    "createdAt",
    "updatedAt"
)
SELECT DISTINCT
    parsed."applicationId",
    parsed.department,
    CASE WHEN counts.department_count = 1 THEN parsed."reviewed" ELSE false END,
    CASE WHEN counts.department_count = 1 THEN parsed."selectionStatus" ELSE 'Pending' END,
    parsed."createdAt",
    CURRENT_TIMESTAMP
FROM parsed_departments AS parsed
INNER JOIN department_counts AS counts
    ON counts."applicationId" = parsed."applicationId"
ON CONFLICT ("applicationId", "department") DO NOTHING;
