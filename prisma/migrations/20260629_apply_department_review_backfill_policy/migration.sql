-- Populate only the new department-review table. Existing Application rows
-- remain untouched.
WITH parsed_departments AS (
    SELECT application."applicationId", selected_department AS department
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
)
INSERT INTO "ApplicationDepartmentReview" (
    "applicationId", "department", "reviewed", "selectionStatus", "createdAt", "updatedAt"
)
SELECT DISTINCT
    parsed."applicationId", parsed.department, false, 'Pending',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM parsed_departments AS parsed
ON CONFLICT ("applicationId", "department") DO NOTHING;

-- Remove an obsolete combined development row. Actual General-department rows
-- remain independent.
DELETE FROM "ApplicationDepartmentReview"
WHERE "department" = 'Science & Humanities';

-- Policy:
-- 1. Single-department applications retain their existing state.
-- 2. If a reviewed application contains both Computer Engineering and AIML,
--    those two department rows retain the existing state.
-- 3. Every other department row starts Pending.
WITH parsed_departments AS (
    SELECT
        application."applicationId",
        application."reviewed" AS legacy_reviewed,
        application."selectionStatus" AS legacy_status,
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
application_summary AS (
    SELECT
        "applicationId",
        COUNT(DISTINCT department) AS department_count,
        BOOL_OR(department = 'Computer Engineering') AS has_computer,
        BOOL_OR(department = 'Artificial Intelligence and Machine Learning') AS has_aiml,
        BOOL_OR(legacy_reviewed) AS legacy_reviewed,
        MAX(legacy_status) AS legacy_status
    FROM parsed_departments
    GROUP BY "applicationId"
),
desired_state AS (
    SELECT
        parsed."applicationId",
        parsed.department,
        CASE
            WHEN summary.department_count = 1 THEN summary.legacy_reviewed
            WHEN summary.legacy_reviewed
                AND summary.has_computer
                AND summary.has_aiml
                AND parsed.department IN (
                    'Computer Engineering',
                    'Artificial Intelligence and Machine Learning'
                )
                THEN true
            ELSE false
        END AS reviewed,
        CASE
            WHEN summary.department_count = 1 THEN summary.legacy_status
            WHEN summary.legacy_reviewed
                AND summary.has_computer
                AND summary.has_aiml
                AND parsed.department IN (
                    'Computer Engineering',
                    'Artificial Intelligence and Machine Learning'
                )
                THEN summary.legacy_status
            ELSE 'Pending'
        END AS selection_status
    FROM parsed_departments AS parsed
    INNER JOIN application_summary AS summary
        ON summary."applicationId" = parsed."applicationId"
)
UPDATE "ApplicationDepartmentReview" AS review
SET
    "reviewed" = desired.reviewed,
    "selectionStatus" = desired.selection_status,
    "updatedAt" = CURRENT_TIMESTAMP
FROM desired_state AS desired
WHERE
    review."applicationId" = desired."applicationId"
    AND review."department" = desired.department;
