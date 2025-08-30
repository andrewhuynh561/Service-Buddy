import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory usage tracking (in production, use a database)
const dailyUsage = new Map<string, { count: number, date: string }>()

const DAILY_LIMIT = 10 // Basic users get 10 AI-enhanced responses per day

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || 'anonymous'
    
    const today = new Date().toDateString()
    const userUsage = dailyUsage.get(sessionId)
    
    if (!userUsage || userUsage.date !== today) {
      // Reset daily usage for new day
      dailyUsage.set(sessionId, { count: 0, date: today })
      return NextResponse.json({ remaining: DAILY_LIMIT, limit: DAILY_LIMIT })
    }
    
    const remaining = Math.max(0, DAILY_LIMIT - userUsage.count)
    
    return NextResponse.json({ 
      remaining, 
      limit: DAILY_LIMIT,
      used: userUsage.count 
    })
    
  } catch (error) {
    console.error('Usage tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    const today = new Date().toDateString()
    
    const userUsage = dailyUsage.get(sessionId || 'anonymous')
    
    if (!userUsage || userUsage.date !== today) {
      dailyUsage.set(sessionId || 'anonymous', { count: 1, date: today })
    } else {
      dailyUsage.set(sessionId || 'anonymous', { 
        count: userUsage.count + 1, 
        date: today 
      })
    }
    
    const remaining = Math.max(0, DAILY_LIMIT - (userUsage?.count || 0) - 1)
    
    return NextResponse.json({ 
      remaining,
      limit: DAILY_LIMIT,
      success: true 
    })
    
  } catch (error) {
    console.error('Usage increment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
