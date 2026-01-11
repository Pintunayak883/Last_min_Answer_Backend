const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkSyllabus() {
  try {
    const syllabus = await prisma.syllabus.findMany({
      include: {
        subject: true,
      },
    });

    console.log("SYLLABUS DATA:");
    console.log(JSON.stringify(syllabus, null, 2));

    // Also check the subject ID from the URL
    const subjectId = "983b0f06-6bb2-4b60-a2ba-37ba5a1000ea";
    console.log("\n\nChecking for subject:", subjectId);

    const syllabusForSubject = await prisma.syllabus.findMany({
      where: {
        subjectId: subjectId,
      },
    });

    console.log("Syllabus for this subject:");
    console.log(JSON.stringify(syllabusForSubject, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSyllabus();
