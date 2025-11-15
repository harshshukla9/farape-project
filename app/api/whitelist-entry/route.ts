import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid, username, pfpUrl, tasks, timestamp } = body

    if (!fid || !tasks || tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if all tasks are completed
    const allCompleted = tasks.every((task: any) => task.completed)
    if (!allCompleted) {
      return NextResponse.json(
        { success: false, error: 'All tasks must be completed' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if user already submitted
    const existing = await db.collection('whitelist_entries').findOne({ fid })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted an entry' },
        { status: 400 }
      )
    }

    // Insert whitelist entry
    const entry = {
      fid,
      username,
      pfpUrl,
      tasks,
      timestamp,
      createdAt: new Date(),
    }

    await db.collection('whitelist_entries').insertOne(entry)

    return NextResponse.json({
      success: true,
      message: 'Whitelist entry submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting whitelist entry:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Get all whitelist entries
    const entries = await db
      .collection('whitelist_entries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      count: entries.length,
      data: entries,
    })
  } catch (error) {
    console.error('Error fetching whitelist entries:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

