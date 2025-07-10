const { PrismaClient } = require("@prisma/client")

// Only declare PrismaClient if not already declared
let prisma
try {
  prisma = require('@prisma/client').PrismaClient ? new (require('@prisma/client').PrismaClient)() : prisma
} catch (e) {
  if (!prisma) throw e
}

async function fixDatabase() {
  try {
    console.log("🔧 Starting database fix...")

    // Test basic connection
    console.log("1. Testing database connection...")
    await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Database connection successful")

    // Check if tables exist
    console.log("2. Checking if tables exist...")

    try {
      const problemCount = await prisma.problem.count()
      console.log(`✅ Problems table exists with ${problemCount} records`)
    } catch (error) {
      console.log("❌ Problems table missing or corrupted")
      console.log("Run: npm run db:push to create tables")
      return
    }

    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Users table exists with ${userCount} records`)
    } catch (error) {
      console.log("❌ Users table missing or corrupted")
      console.log("Run: npm run db:push to create tables")
      return
    }

    // Check for data
    console.log("3. Checking data integrity...")

    if ((await prisma.problem.count()) === 0) {
      console.log("⚠️  No problems found in database")
      console.log("Run: npm run seed-problems-js to populate problems")
    } else {
      console.log("✅ Problems data exists")
    }

    // Test a simple query that was causing issues
    console.log("4. Testing problematic queries...")

    try {
      const testUser = await prisma.user.findFirst()
      if (testUser) {
        const progressCount = await prisma.userProgress.count({
          where: { userId: testUser.id },
        })
        console.log(`✅ User progress queries work (${progressCount} records)`)
      } else {
        console.log("ℹ️  No users found, creating test user...")
        await prisma.user.create({
          data: {
            id: "test-user",
            email: "test@example.com",
          },
        })
        console.log("✅ Test user created")
      }
    } catch (error) {
      console.error("❌ User progress queries failing:", error.message)
    }

    console.log("🎉 Database check complete!")
  } catch (error) {
    console.error("💥 Database fix failed:", error)

    if (error.message.includes("connect")) {
      console.log("\n🔍 Connection issue detected:")
      console.log("1. Check your DATABASE_URL in .env.local")
      console.log("2. Make sure your database is running")
      console.log("3. Verify your database credentials")
    }

    if (error.message.includes("relation") || error.message.includes("table")) {
      console.log("\n🔍 Schema issue detected:")
      console.log("1. Run: npm run db:push")
      console.log("2. Or run: npm run db:migrate")
    }
  } finally {
    await prisma.$disconnect()
  }
}

fixDatabase()

// Script to fix solvedAt for all solved problems with null solvedAt
async function fixSolvedAt() {
  const now = new Date()
  const updated = await prisma.userProgress.updateMany({
    where: {
      solved: true,
      solvedAt: null,
    },
    data: {
      solvedAt: now,
    },
  })
  console.log(`Updated ${updated.count} solved problems with missing solvedAt.`)
  await prisma.$disconnect()
}

if (require.main === module) {
  fixSolvedAt().catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
}
