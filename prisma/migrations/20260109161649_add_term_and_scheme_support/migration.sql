-- CreateEnum
CREATE TYPE "SchemeType" AS ENUM ('SEMESTER', 'YEAR');

-- AlterTable: Add schemeType to courses
ALTER TABLE "courses" ADD COLUMN "schemeType" "SchemeType" NOT NULL DEFAULT 'SEMESTER';

-- Store existing courseId values before dropping the column
ALTER TABLE "subjects" ADD COLUMN "courseId_temp" TEXT;
UPDATE "subjects" SET "courseId_temp" = "courseId" WHERE "courseId" IS NOT NULL;

-- CreateTable: Terms table
CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" "SchemeType" NOT NULL,
    "value" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- Create a default Term (Semester 1) for each course that has existing subjects
INSERT INTO "terms" (id, "courseId", type, value, label, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text as id,
  c.id as "courseId",
  'SEMESTER'::"SchemeType" as type,
  1 as value,
  'Semester 1' as label,
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM "courses" c
WHERE c.id IN (SELECT DISTINCT "courseId_temp" FROM "subjects" WHERE "courseId_temp" IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Create indexes for terms table
CREATE INDEX "terms_courseId_idx" ON "terms"("courseId");
CREATE UNIQUE INDEX "terms_courseId_value_key" ON "terms"("courseId", "value");

-- AlterTable: Update subjects with termId and drop courseId
ALTER TABLE "subjects" ADD COLUMN "termId" TEXT;

-- Set termId based on courseId_temp
UPDATE "subjects" s SET "termId" = (
  SELECT t.id FROM "terms" t 
  WHERE t."courseId" = s."courseId_temp" 
  LIMIT 1
) WHERE s."courseId_temp" IS NOT NULL;

-- Drop the old constraints and column
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_courseId_fkey";
DROP INDEX "subjects_courseId_name_key";
ALTER TABLE "subjects" DROP COLUMN "courseId";
ALTER TABLE "subjects" DROP COLUMN "courseId_temp";

-- Make termId NOT NULL now that all values are set
ALTER TABLE "subjects" ALTER COLUMN "termId" SET NOT NULL;

-- Create indexes and constraints for subjects
CREATE INDEX "subjects_termId_idx" ON "subjects"("termId");
CREATE UNIQUE INDEX "subjects_termId_name_key" ON "subjects"("termId", "name");
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraint for terms
ALTER TABLE "terms" ADD CONSTRAINT "terms_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
