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

    // Step 1: Check if this matches our prepared answers
    const directIntent = detectIntent(message)
    let response: string
    let aiEnhanced = false
    let usageInfo = null
    let relevantServices: any[] = []

    if (directIntent) {
      // Tier 3: We have prepared answers - use them
      relevantServices = services[directIntent as keyof typeof services] || []
      response = buildAgenticResponse(relevantServices, [directIntent], message)
      
      if (mode === 'basic') {
        usageInfo = await getUsageInfo(sessionId)
      }

      return NextResponse.json({
        intent: directIntent,
        response,
        services: relevantServices,
        confidence: calculateConfidence(message, directIntent),
        mode,
        aiEnhanced: false,
        usageInfo
      })
    }

    // Step 2: Determine if it's government service related or general question
    const isServiceRelated = isGovernmentServiceRelated(message)
    
    if (isServiceRelated) {
      // Tier 2: Government service related but not in prepared answers - use smart service response
      try {
        let smartResponse: string
        
        if (mode === 'advanced' && userApiKey) {
          smartResponse = await getSmartServiceResponse(message, userApiKey)
          aiEnhanced = true
        } else if (mode === 'basic') {
          const canUseAI = await checkBasicUsage(sessionId)
          if (canUseAI) {
            smartResponse = await getSmartServiceResponse(message, process.env.GOOGLE_GEMINI_API_KEY!)
            await incrementBasicUsage(sessionId)
            aiEnhanced = true
          } else {
            smartResponse = "I'd love to help you with government services, but I've reached my daily limit for detailed responses. You can try advanced mode with your own API key, or ask about specific services like JobSeeker Payment, Medicare, or disaster recovery assistance."
          }
        } else {
          smartResponse = "I can help with government services but need API access for detailed responses. Try asking about specific services like JobSeeker, Medicare, or disaster assistance."
        }
        
        response = smartResponse
        
      } catch (error) {
        console.error('Smart service response error:', error)
        response = "I can help with government services like JobSeeker Payment, Medicare, Parental Leave, disaster assistance, and more. What specific service are you looking for?"
      }
    } else {
      // Tier 1: Not related to government services - use general smart response
      try {
        let generalResponse: string
        
        if (mode === 'advanced' && userApiKey) {
          generalResponse = await getGeneralSmartResponse(message, userApiKey)
          aiEnhanced = true
        } else if (mode === 'basic') {
          const canUseAI = await checkBasicUsage(sessionId)
          if (canUseAI) {
            generalResponse = await getGeneralSmartResponse(message, process.env.GOOGLE_GEMINI_API_KEY!)
            await incrementBasicUsage(sessionId)
            aiEnhanced = true
          } else {
            generalResponse = "I'm primarily designed to help with Australian government services, but I've reached my daily limit for general conversations. You can ask me about services like JobSeeker, Medicare, or family support - or try advanced mode for unlimited responses."
          }
        } else {
          generalResponse = "I'm Service-Buddy, designed to help with Australian government services. While I can chat about other things, my specialty is helping with JobSeeker, Medicare, parental leave, disaster assistance, and other government support."
        }
        
        response = generalResponse
        
      } catch (error) {
        console.error('General smart response error:', error)
        response = "I'm Service-Buddy, your guide to Australian government services. I can help with JobSeeker, Medicare, family support, disaster assistance, and more. What would you like to know?"
      }
    }

    // Get usage info for basic mode
    if (mode === 'basic') {
      usageInfo = await getUsageInfo(sessionId)
    }

    return NextResponse.json({
      intent: null,
      response,
      services: relevantServices,
      confidence: 0.1,
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

// Natural conversational response builder
function buildAgenticResponse(services: any[], intents: string[], message: string): string {
  if (services.length === 0) {
    return "I can help you find government services for situations like job loss, having a baby, natural disasters, becoming a carer, or other life events. What would you like to know about?"
  }

  // Generate natural, conversational responses based on the situation
  const intent = intents[0] || 'general'
  
  if (intent === 'job_loss') {
    return "I understand losing your job is really stressful. There are several support options available, including JobSeeker Payment for income support, Rent Assistance to help with housing costs, and Workforce Australia for job search help. The main number to call is 131 202 - they have multilingual support and can help you figure out what you're eligible for. Would you like me to explain more about any of these options?"
  }
  
  if (intent === 'birth') {
    return "Congratulations on your new baby! There are a few important things to sort out, like enrolling your baby in Medicare (call 132 011) and looking into Parental Leave Pay and Family Tax Benefit if you're eligible. Services Australia at 131 150 can help with the family payments. I can give you more details about any of these if you'd like?"
  }
  
  if (intent === 'disaster') {
    return "I'm really sorry you've been affected by a disaster. There are emergency payments available like the Disaster Recovery Payment (one-off help) and Disaster Recovery Allowance if you can't work. The disaster helpline is 180 22 66. They can process payments quite quickly, usually within 7-14 days. Do you need help understanding what you might be eligible for?"
  }
  
  if (intent === 'carer') {
    return "Taking on caring responsibilities is both rewarding and challenging. There's support available through Carer Payment if you can't work because of your caring role, and Carer Allowance to help with extra costs. You can call 132 717 to discuss your situation. Would you like me to explain more about the eligibility requirements?"
  }
  
  // General fallback for other situations
  return `I've found some services that might help with your situation. The best place to start is usually calling Services Australia at 131 202 - they can help determine what you're eligible for and guide you through the application process. Would you like me to explain more about any specific services?`
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

  const prompt = `You are Service-Buddy, a helpful AI assistant that provides information about Australian government services.

The user has asked: "${message}"

Please provide a helpful and friendly response that:
1. If the question is about government services (job loss, having a baby, natural disasters, becoming a carer, age pension, disability support, healthcare), provide relevant information
2. If it's a general greeting or casual conversation, politely guide them toward how you can help with government services
3. If it's inappropriate or toxic content, politely decline and redirect to your purpose
4. Keep responses conversational and easy to understand
5. Mention relevant phone numbers and websites when appropriate

For greetings like "hey", "what's up", etc., respond naturally but guide them to your main purpose.

Keep your response friendly, helpful, and around 100-150 words.

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

  const prompt = `You are Service-Buddy, a helpful AI assistant that provides information about Australian government services.

The user has asked: "${message}"

Please provide a helpful response that:
1. Answers their question if it's related to Australian government services
2. For casual conversation or greetings, respond naturally but guide them toward government services you can help with
3. For inappropriate content, politely decline and redirect to your purpose
4. Keep responses conversational, friendly, and informative
5. Include relevant contact details and websites when discussing specific services

Focus on being helpful and informative rather than overly directive. Provide context and options rather than demanding immediate action.

Keep your response natural and conversational, around 150-250 words.

Response:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text() || "I'm here to help with government services for major life events. I can provide detailed assistance with job loss, having a baby, natural disasters, or becoming a carer. How can I help you today?"
}

// Helper function to determine if a message is government service related
function isGovernmentServiceRelated(message: string): boolean {
  const serviceKeywords = [
    // General government terms
    'government', 'service', 'centrelink', 'services australia', 'medicare', 'myGov', 'benefits', 'payment', 'support', 'assistance', 'help', 'aid', 'subsidy', 'allowance', 'pension',
    
    // Life events
    'job', 'work', 'unemployed', 'employment', 'jobseeker', 'baby', 'birth', 'newborn', 'pregnant', 'maternity', 'paternity', 'parental', 'disaster', 'flood', 'fire', 'storm', 'cyclone', 'earthquake', 'bushfire', 'carer', 'caring', 'disability', 'aged care',
    
    // Specific services
    'family tax', 'child care', 'childcare', 'rent assistance', 'healthcare', 'health care', 'pharmaceutical', 'pbs', 'ndis', 'aged pension', 'disability support', 'workforce australia',
    
    // Financial terms
    'financial', 'money', 'income', 'tax', 'refund', 'claim', 'apply', 'eligible', 'eligibility'
  ]
  
  const lowerMessage = message.toLowerCase()
  return serviceKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Smart response for government service related queries
async function getSmartServiceResponse(message: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const prompt = `You are Service-Buddy, an expert assistant for Australian government services.

The user has asked: "${message}"

This question is related to government services. Please provide a helpful, informative response that:

1. Addresses their specific question about Australian government services
2. Provides relevant service information, phone numbers, and websites when appropriate
3. Explains eligibility requirements in simple terms if relevant
4. Suggests next steps or actions they can take
5. Mentions key contact numbers like Services Australia (131 202), Medicare (132 011), etc.
6. Keeps the response conversational and supportive, not overwhelming

Focus on being informative and helpful. If you're not sure about specific details, direct them to official sources.

Keep your response natural and conversational, around 150-250 words.

Response:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text() || "I can help with government services like JobSeeker Payment, Medicare, family support, disaster assistance, and more. For specific information, you can call Services Australia at 131 202. What would you like to know more about?"
}

// Smart response for general (non-government service) queries
async function getGeneralSmartResponse(message: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const prompt = `You are Service-Buddy, a friendly AI assistant whose main purpose is helping with Australian government services.

The user has asked: "${message}"

This question doesn't seem to be about government services. Please provide a helpful response that:

1. Answers their question naturally and helpfully if appropriate
2. Acknowledges that while you can chat about various topics, your specialty is Australian government services
3. Gently guides the conversation toward how you can help with government services
4. Maintains a friendly, conversational tone
5. If it's a greeting, respond warmly and introduce your main purpose

Keep your response friendly and natural, around 100-150 words.

Response:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text() || "I'm Service-Buddy, your guide to Australian government services. While I can chat about various topics, I specialize in helping with JobSeeker, Medicare, family support, disaster assistance, and other government services. How can I help you today?"
}
