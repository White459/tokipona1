import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS words (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        meaning TEXT NOT NULL,
        english TEXT,
        is_official BOOLEAN DEFAULT false,
        example TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

initializeDatabase()

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM words ORDER BY word ASC")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching words:", error)
    return NextResponse.json({ error: "Failed to fetch words" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { word, meaning, english, is_official, example } = body

    if (!word || !meaning) {
      return NextResponse.json({ error: "Word and meaning are required" }, { status: 400 })
    }

    const result = await pool.query(
      "INSERT INTO words (word, meaning, english, is_official, example) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [word, meaning, english, is_official || false, example],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error adding word:", error)
    return NextResponse.json({ error: "Failed to add word" }, { status: 500 })
  }
}
