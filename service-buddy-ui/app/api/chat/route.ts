import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// API usage tracking
const dailyUsage = new Map<string, { count: number, date: string }>()
const DAILY_LIMIT = 10

// Enhanced services data - comprehensive Services Australia coverage
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
    applyUrl: "https://www.servicesaustralia.gov.au/jobseeker-payment",
    actionSteps: [
      "Gather identity documents (birth certificate, passport)",
      "Collect income and asset information",
      "Visit myGov.au to create account",
      "Complete online application",
      "Attend appointment if required"
    ],
    processingTime: "21-49 days",
    immediateHelp: "Call 132 850 for immediate financial hardship assistance"
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
    applyUrl: "https://www.servicesaustralia.gov.au/rent-assistance",
    actionSteps: [
      "Ensure you're receiving an eligible payment",
      "Gather rental agreement or lease",
      "Complete Rent Certificate (SU124A) form",
      "Submit online via myGov or in person"
    ],
    processingTime: "14-21 days"
},
{
    id: "employment_services",
    title: "Workforce Australia",
    agency: "Services Australia",
    description: "Job search assistance and training programs",
    eligibility: [
    "Registered with Services Australia",
    "Looking for work",
    "Australian resident"
    ],
    phone: "131 202",
    applyUrl: "https://www.servicesaustralia.gov.au/workforce-australia",
    actionSteps: [
      "Register with Workforce Australia online",
      "Complete job seeker assessment",
      "Meet with employment consultant",
      "Develop employment plan"
    ]
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
    applyUrl: "https://www.servicesaustralia.gov.au/enrolling-your-baby-medicare",
    actionSteps: [
      "Get birth certificate from hospital or registry",
      "Complete newborn enrolment form",
      "Provide parent Medicare details",
      "Submit within 12 months of birth"
    ],
    processingTime: "10-15 business days",
    urgentAction: "Apply immediately for healthcare coverage"
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
    applyUrl: "https://www.servicesaustralia.gov.au/parental-leave-pay",
    actionSteps: [
      "Apply online via myGov before birth or within 52 weeks",
      "Provide employment details for 13 months before birth",
      "Submit birth certificate when baby is born",
      "Choose payment dates"
    ],
    processingTime: "49 days from complete application"
},
{
    id: "family_tax_benefit",
    title: "Family Tax Benefit",
    agency: "Services Australia",
    description: "Financial help with the cost of raising children",
    eligibility: [
    "Have children under 16 (or 16-19 in study)",
    "Meet income tests",
    "Australian resident"
    ],
    phone: "131 150",
    applyUrl: "https://www.servicesaustralia.gov.au/family-tax-benefit",
    actionSteps: [
      "Apply online via myGov",
      "Provide child's birth certificate",
      "Submit income estimates",
      "Set up bank details for payments"
    ]
},
{
    id: "child_care_subsidy",
    title: "Child Care Subsidy",
    agency: "Services Australia",
    description: "Help with child care fees",
    eligibility: [
    "Child attends approved child care",
    "Meet residency requirements",
    "Activity test requirements"
    ],
    phone: "131 150",
    applyUrl: "https://www.servicesaustralia.gov.au/child-care-subsidy",
    actionSteps: [
      "Apply online before child starts care",
      "Choose approved child care service",
      "Complete activity test assessment",
      "Confirm enrolment details"
    ]
}
],
disability: [
{
    id: "disability_support_pension",
    title: "Disability Support Pension",
    agency: "Services Australia",
    description: "Financial support if you have a disability that prevents work",
    eligibility: [
    "Have a disability that prevents work",
    "Meet medical assessment requirements",
    "Australian resident",
    "Age 16 to Age Pension age"
    ],
    phone: "131 202",
    applyUrl: "https://www.servicesaustralia.gov.au/disability-support-pension",
    actionSteps: [
      "Gather comprehensive medical evidence",
      "Complete application with treating doctor's help",
      "Attend medical assessment if required",
      "Provide work history and qualifications"
    ],
    processingTime: "Up to 16 weeks",
    importantNote: "Start gathering medical evidence early - this is crucial for application success"
},
{
    id: "ndis_access",
    title: "NDIS Access Support",
    agency: "NDIS/Services Australia",
    description: "Help accessing National Disability Insurance Scheme",
    eligibility: [
    "Permanent and significant disability",
    "Under 65 when first applying",
    "Australian citizen or permanent resident"
    ],
    phone: "1800 800 110",
    applyUrl: "https://www.ndis.gov.au/applying-access-ndis",
    actionSteps: [
      "Contact NDIS to discuss eligibility",
      "Gather evidence of disability impact",
      "Complete access request form",
      "Attend planning meeting if approved"
    ]
}
],
age_pension: [
{
    id: "age_pension",
    title: "Age Pension",
    agency: "Services Australia", 
    description: "Regular payment for people 67 and over",
    eligibility: [
    "Age 67 or over (check your age pension age)",
    "Meet residence requirements",
    "Pass income and assets tests"
    ],
    phone: "132 300",
    applyUrl: "https://www.servicesaustralia.gov.au/age-pension",
    actionSteps: [
      "Check your Age Pension age online",
      "Apply 13 weeks before your pension age",
      "Gather financial documents",
      "Complete comprehensive income and assets assessment"
    ],
    processingTime: "49 days from complete application"
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
    applyUrl: "https://www.servicesaustralia.gov.au/disaster-recovery-payment",
    actionSteps: [
      "Check if your area is declared a disaster zone",
      "Apply within 2 years of the disaster",
      "Provide evidence of impact (photos, reports)",
      "Submit application online or by phone"
    ],
    processingTime: "7-14 days",
    urgentAction: "Apply immediately - emergency financial support available"
},
{
    id: "disaster_recovery_allowance",
    title: "Disaster Recovery Allowance",
    agency: "Services Australia",
    description: "Income support if you can't work due to a disaster",
    eligibility: [
    "Lost income due to eligible disaster",
    "Not eligible for other income support",
    "Australian resident"
    ],
    phone: "180 22 66",
    applyUrl: "https://www.servicesaustralia.gov.au/disaster-recovery-allowance",
    actionSteps: [
      "Apply within 2 years of disaster",
      "Provide evidence of lost income",
      "Show disaster impact on work",
      "Complete application online"
    ]
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
    applyUrl: "https://www.servicesaustralia.gov.au/carer-payment",
    actionSteps: [
      "Complete medical report with care receiver's doctor",
      "Gather evidence of caring responsibilities",
      "Apply online via myGov",
      "Attend assessment if required"
    ],
    processingTime: "49 days from complete application"
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
    applyUrl: "https://www.servicesaustralia.gov.au/carer-allowance",
    actionSteps: [
      "Complete Carer Allowance medical report",
      "Provide care receiver's medical evidence",
      "Submit application online",
      "Arrange medical assessment if needed"
    ]
}
],
healthcare: [
{
    id: "medicare_safety_net",
    title: "Medicare Safety Net",
    agency: "Services Australia",
    description: "Extra help with medical costs when you reach safety net thresholds",
    eligibility: [
    "Have Medicare card",
    "Reach annual safety net threshold",
    "Australian resident"
    ],
    phone: "132 011",
    applyUrl: "https://www.servicesaustralia.gov.au/medicare-safety-net",
    actionSteps: [
      "Register family for safety net",
      "Keep all medical receipts",
      "Check threshold progress online",
      "Automatic benefits once threshold reached"
    ]
},
{
    id: "pharmaceutical_benefits",
    title: "Pharmaceutical Benefits Scheme (PBS)",
    agency: "Services Australia",
    description: "Subsidised prescription medicines",
    eligibility: [
    "Have Medicare card",
    "Australian resident"
    ],
    phone: "132 011",
    applyUrl: "https://www.pbs.gov.au",
    actionSteps: [
      "Present Medicare card at pharmacy",
      "Check if medicine is on PBS list",
      "Keep receipts for safety net",
      "Ask doctor about PBS alternatives"
    ]
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
      // We have a prepared answer - use agentic response builder
      relevantServices = services[intent as keyof typeof services] || []
      const detectedIntents = [intent]
      response = buildAgenticResponse(relevantServices, detectedIntents, message)
      
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

      // Check if AI response mentions any life events and provide relevant services
      const possibleIntents = detectPossibleIntents(aiResponse || message)
      if (possibleIntents.length > 0) {
        // Combine services from all detected intents
        relevantServices = possibleIntents.flatMap(intent => 
          services[intent as keyof typeof services] || []
        )
        
        // Use agentic response builder when services are found
        if (relevantServices.length > 0) {
          response = buildAgenticResponse(relevantServices, possibleIntents, message)
        } else {
          // Use AI response for non-service queries
          response = aiResponse || "I'm here to help with government services for major life events. Try telling me about job loss, having a baby, natural disasters, or becoming a carer."
        }
      } else {
        // Use AI response if available, otherwise fallback
        response = aiResponse || "I'm here to help with government services for major life events. Try telling me about job loss, having a baby, natural disasters, or becoming a carer. For other questions, I'll do my best to assist you."
      }

      return NextResponse.json({
        intent: possibleIntents.length > 0 ? possibleIntents[0] : null,
        response,
        services: relevantServices,
        confidence: possibleIntents.length > 0 ? 0.7 : 0.1,
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

function detectPossibleIntents(text: string): string[] {
  const intents: string[] = []
  const lowerText = text.toLowerCase()
  
  // Check for job loss keywords (enhanced)
  if (lowerText.match(/\b(job loss|lost.*job|unemployed|redundant|fired|laid off|out of work|no work|jobseeker|centrelink payment|jobkeeper ended|work|employ|unemploy)\b/)) {
    intents.push('job_loss')
  }
  
  // Check for birth keywords (enhanced)
  if (lowerText.match(/\b(baby|birth|newborn|pregnant|maternity|parental leave|family tax|child care|medicare.*baby|having.*child|pregnan|expecting|maternal|paternal)\b/)) {
    intents.push('birth')
  }
  
  // Check for disability keywords (new)
  if (lowerText.match(/\b(disability|disabled|ndis|mobility|chronic illness|mental health|support pension|cant work|unable.*work)\b/)) {
    intents.push('disability')
  }
  
  // Check for age pension keywords (new)
  if (lowerText.match(/\b(age pension|retirement|retired|pension age|65|66|67|superannuation|senior)\b/)) {
    intents.push('age_pension')
  }
  
  // Check for disaster keywords (enhanced)
  if (lowerText.match(/\b(disaster|flood|fire|bushfire|cyclone|earthquake|emergency|evacuat|damage.*home|lost.*home|storm)\b/)) {
    intents.push('disaster')
  }
  
  // Check for carer keywords (enhanced)
  if (lowerText.match(/\b(carer|caring|elderly.*parent|disabled.*child|care.*someone|carer payment|carer allowance|care for|look after|elderly)\b/)) {
    intents.push('carer')
  }
  
  // Check for healthcare keywords (new)
  if (lowerText.match(/\b(medicare|health|medical|hospital|doctor|prescription|medication|pbs|safety net)\b/)) {
    intents.push('healthcare')
  }

  // Check for form assistance keywords (new)
  if (lowerText.match(/\b(how.*apply|help.*form|fill.*application|step.*step|process|documents.*need|what.*next)\b/)) {
    intents.push('form_assistance')
  }

  // Check for location-based keywords (new)
  if (lowerText.match(/\b(near me|office|centre|local|address|where.*go|appointment|visit)\b/)) {
    intents.push('location_assistance')
  }
  
  return intents
}

// Enhanced agentic response builder for proactive assistance
function buildAgenticResponse(services: any[], intents: string[], message: string): string {
  if (services.length === 0) {
    return "Let me help you find the right government services. Tell me more about your situation - are you dealing with job loss, having a baby, disability support, age pension, natural disaster, caring for someone, or healthcare needs?"
  }

  let response = "**Here's what you need to do right now:**\n\n"
  
  // Build immediate action items
  services.forEach((service, index) => {
    if (service.urgentAction) {
      response += `🚨 **URGENT**: ${service.urgentAction}\n\n`
    }
    
    response += `**${index + 1}. ${service.title}**\n`
    response += `📞 **Call immediately**: ${service.phone}\n`
    
    if (service.actionSteps && service.actionSteps.length > 0) {
      response += `**Your next steps:**\n`
      service.actionSteps.forEach((step: string, stepIndex: number) => {
        response += `   ${stepIndex + 1}. ${step}\n`
      })
    }
    
    if (service.processingTime) {
      response += `⏱️ **Processing time**: ${service.processingTime}\n`
    }
    
    if (service.importantNote) {
      response += `⚠️ **Important**: ${service.importantNote}\n`
    }
    
    response += `🔗 **Apply here**: ${service.applyUrl}\n\n`
  })
  
  // Add form assistance offer
  if (intents.includes('form_assistance') || services.length > 0) {
    response += "**Need help with the application?** I can guide you through each form section, explain required documents, and help you avoid common mistakes that delay processing.\n\n"
  }
  
  // Add location assistance
  if (intents.includes('location_assistance')) {
    response += "**Looking for in-person help?** Call the numbers above to find your nearest service center. **Best times to call**: 8-10am or 2-4pm to avoid peak wait times.\n\n"
  }
  
  // Proactive preparation checklist
  response += "**Documents to gather now:**\n"
  response += "• Birth certificate and passport or driver's license\n"
  response += "• Bank statements (last 3 months)\n"
  response += "• Income tax returns and payslips\n"
  response += "• Rental agreement (if applicable)\n"
  response += "• Medical certificates (if applicable)\n\n"
  
  response += "**Set up myGov account**: If you don't have one, create it at myGov.gov.au - you'll need it for most applications.\n\n"
  
  response += "**I'm here to help every step of the way!** Ask me about:\n"
  response += "• Specific form questions\n"
  response += "• What documents you need\n"
  response += "• How to prepare for appointments\n"
  response += "• What to expect during processing\n"
  response += "• Backup options if applications are delayed"
  
  return response
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

  const prompt = `You are Service-Buddy, an expert Australian government services assistant designed to actively help users navigate and access government services during life events.

The user has asked: "${message}"

YOUR ROLE: Be proactive, action-oriented, and practical. Don't just inform - actively guide users through the process of accessing services.

AGENTIC RESPONSE STYLE:
1. **IMMEDIATE ACTION FOCUS**: Always start with "Here's what you need to do right now..." or "Let me help you get this sorted immediately..."

2. **STEP-BY-STEP GUIDANCE**: Provide clear, numbered action steps that users can follow immediately

3. **PROACTIVE SUGGESTIONS**: Anticipate what users need next, suggest related services they might have missed

4. **DIRECT LINKS & CONTACTS**: Always provide specific phone numbers, URLs, and reference numbers

5. **URGENCY AWARENESS**: Highlight time-sensitive applications, deadlines, and urgent actions

Please provide a response that:
1. Acknowledges their situation with empathy and urgency
2. Provides immediate, actionable next steps
3. If related to job loss, birth, disability, age pension, disasters, carer situations, or healthcare - be specific about what they need to do TODAY
4. Include specific phone numbers and deadlines where relevant
5. Guide them to explore the Service Information panel for detailed step-by-step assistance
6. Use action verbs: "Apply now", "Call immediately", "Gather these documents"

CONVERSATION TONE:
- Confident and reassuring: "I'll help you get this sorted"
- Urgent when appropriate: "This needs to be done within 21 days" 
- Practical: "Here's exactly what documents you'll need"
- Supportive: "This process can be complex, but I'll guide you through each step"

Keep your response concise (max 200 words), action-oriented, and at a Grade 6 reading level.

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

  const prompt = `You are Service-Buddy, an expert Australian government services assistant designed to actively help users navigate and access government services during life events.

The user has asked: "${message}"

YOUR ROLE: Be proactive, action-oriented, and practical. Don't just inform - actively guide users through the process of accessing services. You have unlimited capabilities with the user's API key.

ADVANCED AGENTIC RESPONSE STYLE:
1. **COMPREHENSIVE ACTION PLAN**: Provide detailed, step-by-step guidance with specific timelines
2. **ANTICIPATE NEEDS**: Suggest related services, backup options, and common next steps
3. **DETAILED PROCESS GUIDANCE**: Explain exactly how to fill out forms, what to expect in appointments
4. **ESCALATION PATHS**: Provide options if applications are rejected or delayed
5. **PROACTIVE FOLLOW-UP**: Suggest calendar reminders, document preparation lists
6. **LOCATION-SPECIFIC HELP**: Mention local service centers and best times to visit/call

Please provide a comprehensive response that:
1. Acknowledges their situation with empathy and confidence in helping them succeed
2. Provides immediate, actionable next steps with specific timelines
3. If related to job loss, birth, disability, age pension, disasters, carer situations, or healthcare - provide detailed guidance
4. Include specific phone numbers, reference numbers, and exact document requirements
5. Anticipate potential complications and provide backup plans
6. Guide them to explore the Service Information panel for detailed assistance
7. Offer specific help with form completion and appointment preparation

CONVERSATION TONE:
- Expert and confident: "I'll walk you through exactly what you need to do"
- Detailed and thorough: "Here's the complete process from start to finish"
- Anticipatory: "You'll also want to prepare for these potential next steps"
- Supportive: "I'm here to help you succeed with every part of this process"

Provide a detailed response (up to 400 words) that gives them everything they need to take action successfully.

Response:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text() || "I'm here to help with government services for major life events. I can provide detailed assistance with job loss, having a baby, natural disasters, or becoming a carer. How can I help you today?"
}
