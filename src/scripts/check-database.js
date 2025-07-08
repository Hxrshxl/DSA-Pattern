const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log("🔍 Checking database status...")

    // Test connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Database connection: OK")

    // Check problems
    const problemCount = await prisma.problem.count()
    console.log(`📊 Total problems: ${problemCount}`)

    if (problemCount === 0) {
      console.log("❌ No problems found! You need to run the seed script:")
      console.log("   npm run seed-problems-js")
      return
    }

    // Check patterns
    const patterns = await prisma.problem.findMany({
      where: { pattern: { not: null } },
      select: { pattern: true },
      distinct: ["pattern"],
    })
    console.log(`🎯 Unique patterns: ${patterns.length}`)

    // Check difficulty distribution
    const difficulties = await prisma.problem.groupBy({
      by: ["difficulty"],
      _count: { difficulty: true },
    })
    console.log("📈 Difficulty distribution:")
    difficulties.forEach((d) => {
      console.log(`   ${d.difficulty}: ${d._count.difficulty}`)
    })

    // Sample problems
    const sampleProblems = await prisma.problem.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        difficulty: true,
        pattern: true,
        questionNo: true,
      },
      orderBy: { questionNo: "asc" },
    })
    console.log("📝 Sample problems:")
    sampleProblems.forEach((p) => {
      console.log(`   #${p.questionNo}: ${p.title} (${p.difficulty}) - ${p.pattern}`)
    })

    // Check users
    const userCount = await prisma.user.count()
    console.log(`👥 Total users: ${userCount}`)

    console.log("\n✅ Database check complete!")
  } catch (error) {
    console.error("❌ Database check failed:", error)

    if (error.message.includes("connect")) {
      console.log("\n💡 Connection issue - check your DATABASE_URL in .env.local")
    }
    if (error.message.includes("relation") || error.message.includes("table")) {
      console.log("\n💡 Schema issue - run: npx prisma db push")
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
