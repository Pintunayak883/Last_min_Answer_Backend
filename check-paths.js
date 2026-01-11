const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkPaths() {
  try {
    const notes = await prisma.notes.findMany();
    console.log("NOTES:");
    notes.forEach((note) => {
      console.log(`  ID: ${note.id}`);
      console.log(`  FilePath: ${note.filePath}`);
      console.log("---");
    });

    const syllabus = await prisma.syllabus.findMany();
    console.log("\nSYLLABUS:");
    syllabus.forEach((s) => {
      console.log(`  ID: ${s.id}`);
      console.log(`  FilePath: ${s.filePath}`);
      console.log("---");
    });

    const papers = await prisma.questionPaper.findMany();
    console.log("\nQUESTION PAPERS:");
    papers.forEach((p) => {
      console.log(`  ID: ${p.id}`);
      console.log(`  FilePath: ${p.filePath}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaths();
