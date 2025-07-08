async function analyzeCSV() {
  try {
    console.log("Fetching CSV data...")

    // Use dynamic import for fetch in Node.js
    const fetch = (await import("node-fetch")).default

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Problems-WHBCCjHc187nOHPXlhl8PF7zUHHKzT.csv",
    )
    const csvText = await response.text()

    const lines = csvText.split("\n")
    const headers = lines[0].split(",")

    console.log("Headers:", headers)
    console.log("Total rows:", lines.length - 1)

    // Analyze first few rows
    const sampleRows = lines.slice(1, 6).map((line) => {
      const values = line.split(",")
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = values[index]
      })
      return obj
    })

    console.log("Sample data:", sampleRows)

    // Analyze patterns
    const patterns = new Set()
    const difficulties = new Set()
    const topics = new Set()

    lines.slice(1).forEach((line) => {
      if (line.trim()) {
        const values = line.split(",")
        if (values[8]) patterns.add(values[8]) // Pattern column
        if (values[5]) difficulties.add(values[5]) // Difficulty column
        if (values[7]) {
          values[7].split(";").forEach((topic) => topics.add(topic.trim()))
        }
      }
    })

    console.log("Unique patterns:", Array.from(patterns))
    console.log("Unique difficulties:", Array.from(difficulties))
    console.log("Sample topics:", Array.from(topics).slice(0, 10))

    return {
      totalRows: lines.length - 1,
      patterns: Array.from(patterns),
      difficulties: Array.from(difficulties),
      sampleData: sampleRows,
    }
  } catch (error) {
    console.error("Error analyzing CSV:", error)
  }
}

analyzeCSV()
