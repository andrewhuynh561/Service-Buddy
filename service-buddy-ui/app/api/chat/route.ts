import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// API usage tracking
const dailyUsage = new Map<string, { count: number, date: string }>()
const DAILY_LIMIT = 10

// Mock services data - in production this would come from a database
const services = {
job_loss: [
{
    id: "sa_jobseeker",
    title: "JobSeeker Payment",
    agency: "Services Australia",
    description: "Financial support while you look for work",
    eligibility: [
    "Age 22 to Age Pension age",
    "Australian resident",
    "Income and assets thresholds apply"
    ],
    phone: "131 202 (multilingual)",
    applyUrl: "https://www.servicesaustralia.gov.au/jobseeker-payment"
},
{
    id: "rent_assistance", 
    title: "Rent Assistance",
    agency: "Services Australia",
    description: "Help with rental costs if you receive certain payments",
    eligibility: [
    "Receiving eligible income support payment",
    "Paying rent and meet rent thresholds", 
    "Australian resident"
    ],
    phone: "131 202",
    applyUrl: "https://www.servicesaustralia.gov.au/rent-assistance"
}
],
birth: [
{
    id: "medicare_enrolment",
    title: "Medicare Enrolment for Newborn",
    agency: "Services Australia", 
    description: "Enrol your baby in Medicare for healthcare coverage",
    eligibility: [
    "Australian citizen or eligible visa holder",
    "Newborn Child Declaration or birth certificate required"
    ],
    phone: "132 011",
    applyUrl: "https://www.servicesaustralia.gov.au/enrolling-your-baby-medicare?context=60092"
},
{
    id: "parental_leave_pay",
    title: "Parental Leave Pay",
    agency: "Services Australia",
    description: "Up to 18 weeks of government-funded parental leave", 
    eligibility: [
    "Working before your child's birth",
    "Meet work and income tests",
    "Australian resident"
    ],
    phone: "131 272", 
    applyUrl: "https://www.servicesaustralia.gov.au/parental-leave-pay"
}
],
disaster: [
{
    id: "disaster_recovery_payment",
    title: "Australian Government Disaster Recovery Payment",
    agency: "Services Australia",
    description: "One-off payment for those severely affected by disasters",
    eligibility: [
    "Australian resident",
    "Severely affected by eligible disaster", 
    "In declared disaster area"
    ],
    phone: "180 22 66",
    applyUrl: "https://www.servicesaustralia.gov.au/natural-disaster-support?context=60042"
}
],
carer: [
{
    id: "carer_payment",
    title: "Carer Payment",
    agency: "Services Australia",
    description: "Income support if you can't work because you're caring for someone",
    eligibility: [
    "Caring for someone with disability or medical condition",
    "Unable to work substantial hours due to caring",
    "Meet residence and income/assets tests"
    ],
    phone: "132 717",
    applyUrl: "https://www.servicesaustralia.gov.au/carer-payment"
},
{
    id: "carer_allowance",
    title: "Carer Allowance",
    agency: "Services Australia",
    description: "Supplement to help with costs of caring for someone with disability",
    eligibility: [
    "Providing daily care to person with disability or medical condition",
    "Care receiver meets medical/disability criteria",
    "No income test for this payment"
    ],
    phone: "132 717",
    applyUrl: "https://www.servicesaustralia.gov.au/carer-allowance"
}
]
}


export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      mode = 'basic', // 'basic' or 'advanced'
      userApiKey, // For advanced mode
      sessionId = 'anonymous'
    } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Intent detection
    const intent = detectIntent(message)
    let response: string
    let aiEnhanced = false
    let usageInfo = null
    let relevantServices: any[] = []

    if (intent) {
      // We have a prepared answer - use it directly without calling AI
      relevantServices = services[intent as keyof typeof services] || []
      response = generateResponse(intent, relevantServices)
      
      // Get usage info for basic mode
      if (mode === 'basic') {
        usageInfo = await getUsageInfo(sessionId)
      }

      return NextResponse.json({
        intent,
        response,
        services: relevantServices,
        confidence: calculateConfidence(message, intent),
        mode,
        aiEnhanced: false, // Prepared answers are not AI enhanced
        usageInfo
      })
    } else {
      // No prepared answer - use AI to help navigate
      let aiResponse: string | null = null

      // AI Enhancement based on mode for unknown queries
      if (mode === 'advanced' && userApiKey) {
        // Advanced mode: Use user's API key
        try {
          aiResponse = await getAdvancedAIResponse(message, userApiKey)
          aiEnhanced = true
        } catch (aiError) {
          console.error('Advanced AI error:', aiError)
        }
      } else if (mode === 'basic') {
        // Basic mode: Use our API with daily limits
        const canUseAI = await checkBasicUsage(sessionId)
        
        if (canUseAI) {
          try {
            aiResponse = await getBasicAIResponse(message)
            await incrementBasicUsage(sessionId)
            aiEnhanced = true
          } catch (aiError) {
            console.error('Basic AI error:', aiError)
          }
        }
        
        // Get usage info for frontend
        usageInfo = await getUsageInfo(sessionId)
      }

      // Use AI response if available, otherwise fallback
      response = aiResponse || "I'm here to help with government services for major life events. Try telling me about job loss, having a baby, natural disasters, or becoming a carer. For other questions, I'll do my best to assist you."

      return NextResponse.json({
        intent: null,
        response,
        services: [],
        confidence: 0.1,
        mode,
        aiEnhanced,
        usageInfo
      })
    }

    return NextResponse.json({
      intent,
      response,
      services: relevantServices,
      confidence: calculateConfidence(message, intent),
      mode,
      aiEnhanced,
      usageInfo
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function detectIntent(message: string): string | null {
  const lowerMessage = message.toLowerCase()
  
  // Job loss keywords
  if (lowerMessage.includes('lost job') || 
      lowerMessage.includes('lost my job') ||
      lowerMessage.includes('unemployed') || 
      lowerMessage.includes('jobless') ||
      lowerMessage.includes('fired') ||
      lowerMessage.includes('redundant') ||
      lowerMessage.includes('laid off')) {
    return 'job_loss'
  }
  
  // Birth keywords
  if (lowerMessage.includes('baby') || 
      lowerMessage.includes('birth') || 
      lowerMessage.includes('newborn') ||
      lowerMessage.includes('pregnant') ||
      lowerMessage.includes('expecting') ||
      lowerMessage.includes('child') ||
      lowerMessage.includes('maternity')) {
    return 'birth'
  }
  
  // Disaster keywords
  if (lowerMessage.includes('flood') || 
      lowerMessage.includes('fire') || 
      lowerMessage.includes('disaster') ||
      lowerMessage.includes('cyclone') ||
      lowerMessage.includes('storm') ||
      lowerMessage.includes('earthquake') ||
      lowerMessage.includes('bushfire') ||
      lowerMessage.includes('lost my home') ||
      lowerMessage.includes('house was damaged')) {
    return 'disaster'
  }
  
  // Carer keywords
  if (lowerMessage.includes('carer') ||
      lowerMessage.includes('caring for') ||
      lowerMessage.includes('look after') ||
      lowerMessage.includes('care for my parent')) {
    return 'carer'
  }
  
  return null
}

function generateResponse(intent: string, services: any[]): string {
  const responses = {
    job_loss: `I understand you've lost your job - this is a difficult time. I've found ${services.length} key services that can help provide financial support and get you back on your feet. Let me explain what you might be eligible for.`,
    birth: `Congratulations on your new addition to the family! There are ${services.length} important services to help support you and your baby. Let me walk you through what you'll need to do.`,
    disaster: `I'm sorry to hear you've been affected by a disaster. There are ${services.length} support services available to help you during this difficult time. Let me show you what assistance you may be eligible for.`,
    carer: `I understand you're taking on caring responsibilities - this is both rewarding and challenging. I've found ${services.length} support services that can help you financially while you provide care. Let me explain what support is available.`
  }
  
  return responses[intent as keyof typeof responses] || "I've found some services that might help you."
}

function calculateConfidence(message: string, intent: string): number {
  // Simple confidence calculation based on keyword matches
  const keywords = {
    job_loss: ['lost job', 'unemployed', 'jobless', 'fired', 'redundant', 'laid off'],
    birth: ['baby', 'birth', 'newborn', 'pregnant', 'expecting', 'child', 'maternity'],
    disaster: ['flood', 'fire', 'disaster', 'cyclone', 'storm', 'earthquake', 'bushfire'],
    carer: ['carer', 'caring for', 'look after', 'care for my parent']
  }
  
  const intentKeywords = keywords[intent as keyof typeof keywords] || []
  const lowerMessage = message.toLowerCase()
  
  const matchCount = intentKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  return Math.min(matchCount / intentKeywords.length + 0.3, 1.0)
}

// Usage tracking functions
async function checkBasicUsage(sessionId: string): Promise<boolean> {
  const today = new Date().toDateString()
  const userUsage = dailyUsage.get(sessionId)
  
  if (!userUsage || userUsage.date !== today) {
    return true // New day or new user
  }
  
  return userUsage.count < DAILY_LIMIT
}

async function incrementBasicUsage(sessionId: string): Promise<void> {
  const today = new Date().toDateString()
  const userUsage = dailyUsage.get(sessionId)
  
  if (!userUsage || userUsage.date !== today) {
    dailyUsage.set(sessionId, { count: 1, date: today })
  } else {
    dailyUsage.set(sessionId, { count: userUsage.count + 1, date: today })
  }
}

async function getUsageInfo(sessionId: string) {
  const today = new Date().toDateString()
  const userUsage = dailyUsage.get(sessionId)
  
  if (!userUsage || userUsage.date !== today) {
    return { remaining: DAILY_LIMIT, limit: DAILY_LIMIT, used: 0 }
  }
  
  return {
    remaining: Math.max(0, DAILY_LIMIT - userUsage.count),
    limit: DAILY_LIMIT,
    used: userUsage.count
  }
}

// AI Response functions for unknown queries (no prepared answers)
async function getBasicAIResponse(message: string): Promise<string> {
  // Use our Google Gemini API for basic responses to unknown queries
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('Google Gemini API key not configured')
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const prompt = `You are Service Buddy, an empathetic AI assistant helping Australians navigate government services during life events.

The user has asked: "${message}"

Please provide a helpful response that:
1. Acknowledges their question
2. Provides relevant information if it's related to Australian government services
3. Guides them toward the specific life events you can help with (job loss, having a baby, natural disasters, or becoming a carer)
4. Keeps the response appropriate and family-friendly

Keep your response concise (max 150 words), compassionate, and at a Grade 6 reading level.

Response:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  return text || "I'm here to help with government services for major life events. Try telling me about job loss, having a baby, natural disasters, or becoming a carer."
}

async function getAdvancedAIResponse(message: string, userApiKey: string): Promise<string> {
  // Use user's Google Gemini API for advanced responses to unknown queries
  const genAI = new GoogleGenerativeAI(userApiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const prompt = `You are Service Buddy, an empathetic AI assistant helping Australians navigate government services during life events.

The user has asked: "${message}"

Please provide a comprehensive and helpful response that:
1. Acknowledges their question with empathy
2. Provides relevant information if it's related to Australian government services
3. If it's not about government services, still be helpful but guide them toward the specific life events you specialize in (job loss, having a baby, natural disasters, or becoming a carer)
4. Maintains appropriate, family-friendly content
5. Offers to help with their specific government service needs

Keep your response conversational, compassionate, and at a Grade 6 reading level. Be thorough but easy to understand.

Response:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text() || "I'm here to help with government services for major life events. I can provide detailed assistance with job loss, having a baby, natural disasters, or becoming a carer. How can I help you today?"
}
