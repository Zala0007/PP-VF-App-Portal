-- Preserve legacy review decisions independently for Computer and AIML.
--
-- A multi-department application's legacy status is copied only to its
-- Computer and/or AIML review row. Review rows belonging to other departments
-- are not changed.
--
-- Only untouched Pending rows are backfilled so decisions already made in the
-- department-specific portal are never overwritten.
WITH legacy_department_reviews AS (
    SELECT DISTINCT
        application."applicationId",
        selected_department AS department,
        application."selectionStatus" AS legacy_status
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
    WHERE
        application."reviewed" = true
        AND selected_department IN (
            'Computer Engineering',
            'Artificial Intelligence and Machine Learning'
        )
)
UPDATE "ApplicationDepartmentReview" AS review
SET
    "reviewed" = true,
    "selectionStatus" = legacy.legacy_status,
    "updatedAt" = CURRENT_TIMESTAMP
FROM legacy_department_reviews AS legacy
WHERE
    review."applicationId" = legacy."applicationId"
    AND review."department" = legacy.department
    AND review."reviewed" = false
    AND review."selectionStatus" = 'Pending';
