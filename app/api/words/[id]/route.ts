import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { word, meaning, english, is_official, example } = body

    if (!word || !meaning) {
      return NextResponse.json({ error: "Word and meaning are required" }, { status: 400 })
    }

    const result = await pool.query(
      "UPDATE words SET word = $1, meaning = $2, english = $3, is_official = $4, example = $5 WHERE id = $6 RETURNING *",
      [word, meaning, english, is_official || false, example, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating word:", error)
    return NextResponse.json({ error: "Failed to update word" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await pool.query("DELETE FROM words WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Word deleted successfully" })
  } catch (error) {
    console.error("Error deleting word:", error)
    return NextResponse.json({ error: "Failed to delete word" }, { status: 500 })
  }
}
