const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.notes.deleteMany({});
  await prisma.questionPaper.deleteMany({});
  await prisma.syllabus.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.term.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.university.deleteMany({});

  // Create University
  const university = await prisma.university.create({
    data: {
      name: "ABC University",
      code: "ABC123",
    },
  });
  console.log(`✅ Created university: ${university.name}`);

  // Create Course with SEMESTER scheme
  const course1 = await prisma.course.create({
    data: {
      name: "Bachelor of Science",
      code: "B.SC",
      universityId: university.id,
      schemeType: "SEMESTER",
    },
  });
  console.log(`✅ Created course (SEMESTER): ${course1.name}`);

  // Create Terms (Semesters)
  const terms = [];
  for (let i = 1; i <= 4; i++) {
    const term = await prisma.term.create({
      data: {
        courseId: course1.id,
        type: "SEMESTER",
        value: i,
        label: `Semester ${i}`,
      },
    });
    terms.push(term);
    console.log(`  ✅ Created ${term.label}`);
  }

  // Create Subjects for each term
  const subjects = [];
  const subjectNames = [
    { name: "Mathematics", code: "MATH101" },
    { name: "Physics", code: "PHY101" },
    { name: "Chemistry", code: "CHEM101" },
    { name: "Biology", code: "BIO101" },
  ];

  for (let i = 0; i < terms.length; i++) {
    for (let j = 0; j < 3; j++) {
      const subjectData = subjectNames[(i * 3 + j) % subjectNames.length];
      const subject = await prisma.subject.create({
        data: {
          name: `${subjectData.name} - ${terms[i].label}`,
          code: `${subjectData.code}-${i + 1}`,
          termId: terms[i].id,
        },
      });
      subjects.push(subject);
      console.log(`    ✅ Created subject: ${subject.name}`);

      // Add syllabus
      await prisma.syllabus.create({
        data: {
          subjectId: subject.id,
          filePath: `/uploads/syllabus/syllabus-${subject.id}.pdf`,
          year: "2025",
        },
      });

      // Add question papers
      for (let year = 2022; year <= 2024; year++) {
        await prisma.questionPaper.create({
          data: {
            subjectId: subject.id,
            filePath: `/uploads/question-papers/qp-${subject.id}-${year}.pdf`,
            year: year.toString(),
            month: "June",
          },
        });
      }

      // Add notes
      for (let unit = 1; unit <= 3; unit++) {
        await prisma.notes.create({
          data: {
            subjectId: subject.id,
            filePath: `/uploads/notes/notes-${subject.id}-unit${unit}.pdf`,
            unit: unit.toString(),
            title: `Unit ${unit} Notes`,
          },
        });
      }
    }
  }

  // Create Course with YEAR scheme
  const course2 = await prisma.course.create({
    data: {
      name: "Bachelor of Technology",
      code: "B.TECH",
      universityId: university.id,
      schemeType: "YEAR",
    },
  });
  console.log(`\n✅ Created course (YEAR): ${course2.name}`);

  // Create Years
  const years = [];
  for (let i = 1; i <= 3; i++) {
    const year = await prisma.term.create({
      data: {
        courseId: course2.id,
        type: "YEAR",
        value: i,
        label: `Year ${i}`,
      },
    });
    years.push(year);
    console.log(`  ✅ Created ${year.label}`);
  }

  // Create Subjects for each year
  for (let i = 0; i < years.length; i++) {
    for (let j = 0; j < 2; j++) {
      const subjectData = subjectNames[(i * 2 + j) % subjectNames.length];
      const subject = await prisma.subject.create({
        data: {
          name: `${subjectData.name} - ${years[i].label}`,
          code: `${subjectData.code}-Y${i + 1}`,
          termId: years[i].id,
        },
      });
      console.log(`    ✅ Created subject: ${subject.name}`);

      // Add syllabus
      await prisma.syllabus.create({
        data: {
          subjectId: subject.id,
          filePath: `/uploads/syllabus/syllabus-${subject.id}.pdf`,
          year: "2025",
        },
      });

      // Add question papers
      for (let year = 2022; year <= 2024; year++) {
        await prisma.questionPaper.create({
          data: {
            subjectId: subject.id,
            filePath: `/uploads/question-papers/qp-${subject.id}-${year}.pdf`,
            year: year.toString(),
            month: "June",
          },
        });
      }

      // Add notes
      for (let unit = 1; unit <= 2; unit++) {
        await prisma.notes.create({
          data: {
            subjectId: subject.id,
            filePath: `/uploads/notes/notes-${subject.id}-unit${unit}.pdf`,
            unit: unit.toString(),
            title: `Unit ${unit} Notes`,
          },
        });
      }
    }
  }

  console.log("\n🎉 Database seeding completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`  • Universities: 1`);
  console.log(`  • Courses: 2 (1 SEMESTER-based, 1 YEAR-based)`);
  console.log(`  • Terms: 7 (4 semesters + 3 years)`);
  console.log(`  • Subjects: ${subjects.length + years.length * 2}`);
  console.log(`  • Syllabus: ${subjects.length + years.length * 2}`);
  console.log(
    `  • Question Papers: ${(subjects.length + years.length * 2) * 3}`
  );
  console.log(`  • Notes: ${(subjects.length + years.length * 2) * 3}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
