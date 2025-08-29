import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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
      applyUrl: "https://www.servicesaustralia.gov.au/enrol-newborn-child-medicare"
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
      applyUrl: "https://www.servicesaustralia.gov.au/disaster-recovery-payment"
    }
  ]
}

// Initialize OpenAI (optional - for enhanced AI responses)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

export async function POST(request: NextRequest) {
  try {
    const { message, useAI = false } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Intent detection
    const intent = detectIntent(message)
    
    if (!intent) {
      return NextResponse.json({
        intent: null,
        response: "I'm here to help with government services for major life events. Try telling me about job loss, having a baby, or natural disasters.",
        services: []
      })
    }

    const relevantServices = services[intent as keyof typeof services] || []
    
    let response = generateResponse(intent, relevantServices)

    // Optional: Use OpenAI for enhanced responses
    if (useAI && process.env.OPENAI_API_KEY) {
      try {
        // const completion = await openai.chat.completions.create({
        //   model: "gpt-3.5-turbo",
        //   messages: [
        //     {
        //       role: "system",
        //       content: `You are Service-Buddy, an empathetic AI assistant helping Australians navigate government services during life events. 
        //       Provide clear, compassionate responses in Grade 6 reading level. The user has expressed: ${intent.replace('_', ' ')}.
        //       Available services: ${relevantServices.map(s => s.title).join(', ')}`
        //     },
        //     {
        //       role: "user", 
        //       content: message
        //     }
        //   ],
        //   max_tokens: 200,
        //   temperature: 0.7
        // })
        // response = completion.choices[0]?.message?.content || response
      } catch (aiError) {
        console.error('OpenAI API error:', aiError)
        // Fall back to default response
      }
    }

    return NextResponse.json({
      intent,
      response,
      services: relevantServices,
      confidence: calculateConfidence(message, intent)
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
      lowerMessage.includes('bushfire')) {
    return 'disaster'
  }
  
  return null
}

function generateResponse(intent: string, services: any[]): string {
  const responses = {
    job_loss: `I understand you've lost your job - this is a difficult time. I've found ${services.length} key services that can help provide financial support and get you back on your feet. Let me explain what you might be eligible for.`,
    birth: `Congratulations on your new addition to the family! There are ${services.length} important services to help support you and your baby. Let me walk you through what you'll need to do.`,
    disaster: `I'm sorry to hear you've been affected by a disaster. There are ${services.length} support services available to help you during this difficult time. Let me show you what assistance you may be eligible for.`
  }
  
  return responses[intent as keyof typeof responses] || "I've found some services that might help you."
}

function calculateConfidence(message: string, intent: string): number {
  // Simple confidence calculation based on keyword matches
  const keywords = {
    job_loss: ['lost job', 'unemployed', 'jobless', 'fired', 'redundant', 'laid off'],
    birth: ['baby', 'birth', 'newborn', 'pregnant', 'expecting', 'child', 'maternity'],
    disaster: ['flood', 'fire', 'disaster', 'cyclone', 'storm', 'earthquake', 'bushfire']
  }
  
  const intentKeywords = keywords[intent as keyof typeof keywords] || []
  const lowerMessage = message.toLowerCase()
  
  const matchCount = intentKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  return Math.min(matchCount / intentKeywords.length + 0.3, 1.0)
}
