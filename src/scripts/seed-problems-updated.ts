const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function seedProblemsFromNewCSV() {
  try {
    console.log("Fetching problems from updated CSV...")

    // Use dynamic import for fetch in Node.js
    const fetch = (await import("node-fetch")).default

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Problems-WHBCCjHc187nOHPXlhl8PF7zUHHKzT.csv",
    )
    const csvText = await response.text()

    const lines = csvText.split("\n")
    const headers = lines[0].split(",")

    console.log("CSV Headers:", headers)
    console.log("Expected: ID,Title,URL,Is Premium,Acceptance %,Difficulty,Frequency %,Topics,Pattern,Question No.")

    const problems = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line, index) => {
        try {
          // Handle CSV parsing with potential commas in fields
          const values = []
          let current = ""
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              values.push(current.trim())
              current = ""
            } else {
              current += char
            }
          }
          values.push(current.trim()) // Add the last value

          // Map CSV columns to database fields
          const problem = {
            id: values[0] || `problem_${index}`, // ID
            title: values[1] || "", // Title
            url: values[2] || "", // URL
            isPremium: values[3] === "Yes", // Is Premium (Yes/No -> boolean)
            acceptanceRate: Number.parseFloat(values[4]) || 0, // Acceptance %
            difficulty: values[5] || "Medium", // Difficulty
            frequency: Number.parseFloat(values[6]) || 0, // Frequency %
            topics: values[7]
              ? values[7]
                  .split(";")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [], // Topics (semicolon separated)
            pattern: values[8] || null, // Pattern
            questionNo: Number.parseInt(values[9]) || 0, // Question No.
          }

          // Validate difficulty
          if (!["Easy", "Medium", "Hard"].includes(problem.difficulty)) {
            problem.difficulty = "Medium"
          }

          return problem
        } catch (error) {
          console.error(`Error parsing line ${index + 1}:`, line)
          console.error("Error:", error)
          return null
        }
      })
      .filter(Boolean) // Remove null entries

    console.log(`Parsed ${problems.length} problems successfully`)

    // Show sample of parsed data
    console.log("Sample problems:", problems.slice(0, 3))

    // Clear existing problems (optional - be careful in production)
    console.log("Clearing existing problems...")
    await prisma.problem.deleteMany()

    // Insert problems in batches
    const batchSize = 100
    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, i + batchSize)

      try {
        await prisma.problem.createMany({
          data: batch,
          skipDuplicates: true,
        })

        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(problems.length / batchSize)}`)
      } catch (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
        // Try inserting individually to identify problematic records
        for (const problem of batch) {
          try {
            await prisma.problem.create({ data: problem })
          } catch (individualError) {
            console.error("Problematic record:", problem)
            console.error("Error:", individualError)
          }
        }
      }
    }

    console.log("Problems seeded successfully!")

    // Analyze the data
    const totalProblems = await prisma.problem.count()
    const patterns = await prisma.problem.findMany({
      where: { pattern: { not: null } },
      select: { pattern: true },
      distinct: ["pattern"],
    })

    const difficulties = await prisma.problem.groupBy({
      by: ["difficulty"],
      _count: { difficulty: true },
    })

    console.log(`Total problems in database: ${totalProblems}`)
    console.log(`Unique patterns: ${patterns.length}`)
    console.log(
      "Pattern list:",
      patterns.map((p) => p.pattern),
    )
    console.log("Difficulty distribution:", difficulties)

    // Initialize pattern mastery for existing users
    const users = await prisma.user.findMany({ select: { id: true } })

    for (const user of users) {
      for (const { pattern } of patterns) {
        if (!pattern) continue

        const totalProblems = await prisma.problem.count({
          where: { pattern },
        })

        await prisma.patternMastery.upsert({
          where: {
            userId_pattern: {
              userId: user.id,
              pattern,
            },
          },
          update: {
            totalProblems,
          },
          create: {
            userId: user.id,
            pattern,
            totalProblems,
            problemsSolved: 0,
            masteryPercentage: 0,
          },
        })
      }
    }

    console.log("Pattern mastery initialized for all users!")
  } catch (error) {
    console.error("Error seeding problems:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProblemsFromNewCSV()
