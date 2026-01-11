const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verifySeed() {
  try {
    console.log("✅ Verifying seeded data...\n");

    const unis = await prisma.university.count();
    console.log(`📚 Universities: ${unis}`);

    const courses = await prisma.course.findMany({
      select: { id: true, name: true, schemeType: true },
    });
    console.log(`\n📘 Courses: ${courses.length}`);
    courses.forEach((c) => console.log(`   - ${c.name} (${c.schemeType})`));

    const terms = await prisma.term.findMany({
      select: { id: true, label: true, courseId: true },
    });
    console.log(`\n📖 Terms: ${terms.length}`);
    terms.forEach((t) => console.log(`   - ${t.label}`));

    const subjects = await prisma.subject.count();
    console.log(`\n📝 Subjects: ${subjects}`);

    const syllabus = await prisma.syllabus.count();
    console.log(`📄 Syllabus files: ${syllabus}`);

    const papers = await prisma.questionPaper.count();
    console.log(`📋 Question papers: ${papers}`);

    const notes = await prisma.notes.count();
    console.log(`📑 Notes: ${notes}`);

    console.log("\n✅ Database seeding verification complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed();
