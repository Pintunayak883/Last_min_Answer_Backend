-- Seed data for Last Min Answers
-- Insert Universities
INSERT INTO "universities" (id, name, code, "createdAt", "updatedAt") VALUES 
('univ-1', 'ABC University', 'ABC123', NOW(), NOW());

-- Insert Courses
INSERT INTO "courses" (id, name, code, "universityId", "schemeType", "createdAt", "updatedAt") VALUES 
('course-1', 'Bachelor of Science', 'B.SC', 'univ-1', 'SEMESTER', NOW(), NOW()),
('course-2', 'Bachelor of Technology', 'B.TECH', 'univ-1', 'YEAR', NOW(), NOW());

-- Insert Terms for B.SC (Semesters)
INSERT INTO "terms" (id, "courseId", type, value, label, "createdAt", "updatedAt") VALUES 
('term-1', 'course-1', 'SEMESTER', 1, 'Semester 1', NOW(), NOW()),
('term-2', 'course-1', 'SEMESTER', 2, 'Semester 2', NOW(), NOW()),
('term-3', 'course-1', 'SEMESTER', 3, 'Semester 3', NOW(), NOW()),
('term-4', 'course-1', 'SEMESTER', 4, 'Semester 4', NOW(), NOW());

-- Insert Terms for B.TECH (Years)
INSERT INTO "terms" (id, "courseId", type, value, label, "createdAt", "updatedAt") VALUES 
('term-5', 'course-2', 'YEAR', 1, 'Year 1', NOW(), NOW()),
('term-6', 'course-2', 'YEAR', 2, 'Year 2', NOW(), NOW()),
('term-7', 'course-2', 'YEAR', 3, 'Year 3', NOW(), NOW());

-- Insert Subjects for B.SC Semester 1
INSERT INTO "subjects" (id, name, code, "termId", "createdAt", "updatedAt") VALUES 
('subj-1', 'Mathematics - Semester 1', 'MATH101-1', 'term-1', NOW(), NOW()),
('subj-2', 'Physics - Semester 1', 'PHY101-1', 'term-1', NOW(), NOW()),
('subj-3', 'Chemistry - Semester 1', 'CHEM101-1', 'term-1', NOW(), NOW());

-- Insert Subjects for B.SC Semester 2
INSERT INTO "subjects" (id, name, code, "termId", "createdAt", "updatedAt") VALUES 
('subj-4', 'Mathematics - Semester 2', 'MATH101-2', 'term-2', NOW(), NOW()),
('subj-5', 'Physics - Semester 2', 'PHY101-2', 'term-2', NOW(), NOW()),
('subj-6', 'Biology - Semester 2', 'BIO101-2', 'term-2', NOW(), NOW());

-- Insert Subjects for B.SC Semester 3
INSERT INTO "subjects" (id, name, code, "termId", "createdAt", "updatedAt") VALUES 
('subj-7', 'Chemistry - Semester 3', 'CHEM101-3', 'term-3', NOW(), NOW()),
('subj-8', 'Biology - Semester 3', 'BIO101-3', 'term-3', NOW(), NOW()),
('subj-9', 'Mathematics - Semester 3', 'MATH101-3', 'term-3', NOW(), NOW());

-- Insert Subjects for B.SC Semester 4
INSERT INTO "subjects" (id, name, code, "termId", "createdAt", "updatedAt") VALUES 
('subj-10', 'Physics - Semester 4', 'PHY101-4', 'term-4', NOW(), NOW()),
('subj-11', 'Chemistry - Semester 4', 'CHEM101-4', 'term-4', NOW(), NOW()),
('subj-12', 'Biology - Semester 4', 'BIO101-4', 'term-4', NOW(), NOW());

-- Insert Subjects for B.TECH Year 1
INSERT INTO "subjects" (id, name, code, "termId", "createdAt", "updatedAt") VALUES 
('subj-13', 'Engineering Mathematics - Year 1', 'EMATH101-Y1', 'term-5', NOW(), NOW()),
('subj-14', 'Engineering Physics - Year 1', 'EPHYS101-Y1', 'term-5', NOW(), NOW());

-- Insert Subjects for B.TECH Year 2
INSERT INTO "subjects" (id, name, code, "termId", "createdAt", "updatedAt") VALUES 
('subj-15', 'Data Structures - Year 2', 'DS101-Y2', 'term-6', NOW(), NOW()),
('subj-16', 'Database Management - Year 2', 'DBM101-Y2', 'term-6', NOW(), NOW());

-- Insert Subjects for B.TECH Year 3
INSERT INTO "subjects" (id, name, code, "termId", "createdAt", "updatedAt") VALUES 
('subj-17', 'Web Development - Year 3', 'WEB101-Y3', 'term-7', NOW(), NOW()),
('subj-18', 'Cloud Computing - Year 3', 'CC101-Y3', 'term-7', NOW(), NOW());

-- Insert Syllabus
INSERT INTO "syllabi" (id, "subjectId", "filePath", year, "createdAt", "updatedAt") VALUES 
('syl-1', 'subj-1', '/uploads/syllabus/math-sem1.pdf', '2025', NOW(), NOW()),
('syl-2', 'subj-2', '/uploads/syllabus/physics-sem1.pdf', '2025', NOW(), NOW()),
('syl-3', 'subj-3', '/uploads/syllabus/chemistry-sem1.pdf', '2025', NOW(), NOW()),
('syl-4', 'subj-4', '/uploads/syllabus/math-sem2.pdf', '2025', NOW(), NOW()),
('syl-5', 'subj-5', '/uploads/syllabus/physics-sem2.pdf', '2025', NOW(), NOW()),
('syl-6', 'subj-6', '/uploads/syllabus/biology-sem2.pdf', '2025', NOW(), NOW()),
('syl-7', 'subj-7', '/uploads/syllabus/chemistry-sem3.pdf', '2025', NOW(), NOW()),
('syl-8', 'subj-8', '/uploads/syllabus/biology-sem3.pdf', '2025', NOW(), NOW()),
('syl-9', 'subj-9', '/uploads/syllabus/math-sem3.pdf', '2025', NOW(), NOW()),
('syl-10', 'subj-10', '/uploads/syllabus/physics-sem4.pdf', '2025', NOW(), NOW()),
('syl-11', 'subj-11', '/uploads/syllabus/chemistry-sem4.pdf', '2025', NOW(), NOW()),
('syl-12', 'subj-12', '/uploads/syllabus/biology-sem4.pdf', '2025', NOW(), NOW()),
('syl-13', 'subj-13', '/uploads/syllabus/emath-y1.pdf', '2025', NOW(), NOW()),
('syl-14', 'subj-14', '/uploads/syllabus/ephys-y1.pdf', '2025', NOW(), NOW()),
('syl-15', 'subj-15', '/uploads/syllabus/ds-y2.pdf', '2025', NOW(), NOW()),
('syl-16', 'subj-16', '/uploads/syllabus/dbm-y2.pdf', '2025', NOW(), NOW()),
('syl-17', 'subj-17', '/uploads/syllabus/web-y3.pdf', '2025', NOW(), NOW()),
('syl-18', 'subj-18', '/uploads/syllabus/cc-y3.pdf', '2025', NOW(), NOW());

-- Insert Question Papers
INSERT INTO "question_papers" (id, "subjectId", "filePath", year, month, "createdAt", "updatedAt") VALUES 
('qp-1', 'subj-1', '/uploads/question-papers/math-sem1-2024.pdf', '2024', 'June', NOW(), NOW()),
('qp-2', 'subj-1', '/uploads/question-papers/math-sem1-2023.pdf', '2023', 'June', NOW(), NOW()),
('qp-3', 'subj-2', '/uploads/question-papers/physics-sem1-2024.pdf', '2024', 'June', NOW(), NOW()),
('qp-4', 'subj-2', '/uploads/question-papers/physics-sem1-2023.pdf', '2023', 'June', NOW(), NOW()),
('qp-5', 'subj-4', '/uploads/question-papers/math-sem2-2024.pdf', '2024', 'June', NOW(), NOW()),
('qp-6', 'subj-5', '/uploads/question-papers/physics-sem2-2024.pdf', '2024', 'June', NOW(), NOW()),
('qp-7', 'subj-13', '/uploads/question-papers/emath-y1-2024.pdf', '2024', 'June', NOW(), NOW()),
('qp-8', 'subj-15', '/uploads/question-papers/ds-y2-2024.pdf', '2024', 'June', NOW(), NOW());

-- Insert Notes
INSERT INTO "notes" (id, "subjectId", "filePath", unit, title, "createdAt", "updatedAt") VALUES 
('note-1', 'subj-1', '/uploads/notes/math-sem1-unit1.pdf', '1', 'Unit 1: Calculus Basics', NOW(), NOW()),
('note-2', 'subj-1', '/uploads/notes/math-sem1-unit2.pdf', '2', 'Unit 2: Algebra', NOW(), NOW()),
('note-3', 'subj-2', '/uploads/notes/physics-sem1-unit1.pdf', '1', 'Unit 1: Mechanics', NOW(), NOW()),
('note-4', 'subj-2', '/uploads/notes/physics-sem1-unit2.pdf', '2', 'Unit 2: Waves', NOW(), NOW()),
('note-5', 'subj-4', '/uploads/notes/math-sem2-unit1.pdf', '1', 'Unit 1: Matrices', NOW(), NOW()),
('note-6', 'subj-5', '/uploads/notes/physics-sem2-unit1.pdf', '1', 'Unit 1: Thermodynamics', NOW(), NOW()),
('note-7', 'subj-13', '/uploads/notes/emath-y1-unit1.pdf', '1', 'Unit 1: Differential Equations', NOW(), NOW()),
('note-8', 'subj-15', '/uploads/notes/ds-y2-unit1.pdf', '1', 'Unit 1: Trees and Graphs', NOW(), NOW());
