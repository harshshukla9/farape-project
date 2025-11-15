import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid, username, tasks } = body

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

    // Log the submission (optional - for tracking)
    console.log(`Whitelist submission from user ${username} (FID: ${fid})`)

    // Return success without storing in database
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
    // Return empty array since we're not storing in database
    return NextResponse.json({
      success: true,
      count: 0,
      data: [],
    })
  } catch (error) {
    console.error('Error fetching whitelist entries:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

