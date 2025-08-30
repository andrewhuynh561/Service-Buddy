'use client'

import { useState, useRef, useEffect } from 'react'
import TypewriterText from './TypewriterText'
import SettingsModal from './SettingsModal'
import VoiceInput from './VoiceInput';

interface Message {
id: string
content: string
sender: 'user' | 'bot'
timestamp: Date
}

interface Service {
id: string
title: string
agency: string
description: string
eligibility: string[]
phone: string
applyUrl: string
actionSteps?: string[]
processingTime?: string
urgentAction?: string
importantNote?: string
}

interface UserProfile {
age?: number
residencyStatus?: 'citizen' | 'permanent_resident' | 'temporary_visa' | 'unknown'
employmentStatus?: 'employed' | 'unemployed' | 'not_working' | 'unknown'
hasChildren?: boolean
isPregnant?: boolean
isCaring?: boolean
hasDisability?: boolean
annualIncome?: number
weeklyIncome?: number
assets?: number
location?: string
rentingStatus?: 'renting' | 'homeowner' | 'boarding' | 'unknown'
currentPayments?: string[]
}

interface EligibilityResult {
eligible: boolean
confidence: number
missingRequirements: string[]
metRequirements: string[]
needsMoreInfo: string[]
recommendation: string
}

const mockServices: Record<string, Service[]> = {
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

const examplePhrases = [
'I lost my job',
'We just had a baby', 
'I lost my home due to natural disaster',
'I need to become a carer for my parent',
'I was made redundant',
'Our house was damaged in floods',
'I\'m expecting my first child',
'I was affected by bushfires'
]

export default function ChatInterface() {
const [messages, setMessages] = useState<Message[]>([
    {
    id: '1',
    content: `Hi! I'm here to help you navigate government services during life events. You can tell me about:

• 🏢 Job loss
• 👶 Birth of a child  
• 🌪️ Natural disasters
• 👥 Becoming a carer

What can I help you with today?`,
    sender: 'bot',
    timestamp: new Date()
    }
])

const [inputValue, setInputValue] = useState('')
const [isTyping, setIsTyping] = useState(false)
const [selectedServices, setSelectedServices] = useState<Service[]>([])
const [showSettings, setShowSettings] = useState(false)
const [mode, setMode] = useState<'basic' | 'advanced'>('basic')
const [userApiKey, setUserApiKey] = useState('')
const [sessionId] = useState(() => Math.random().toString(36).substring(7))
const [usageInfo, setUsageInfo] = useState<{remaining: number, limit: number, used: number} | null>(null)
const [userProfile, setUserProfile] = useState<UserProfile>({})
const [isCollectingInfo, setIsCollectingInfo] = useState(false)
const [pendingEligibilityCheck, setPendingEligibilityCheck] = useState<Service | null>(null)
const messagesEndRef = useRef<HTMLDivElement>(null)

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}

useEffect(() => {
    scrollToBottom()
}, [messages, isTyping])

// Eligibility checking functions
const extractUserInfoFromMessage = (message: string): Partial<UserProfile> => {
    const lowerMessage = message.toLowerCase()
    const extractedInfo: Partial<UserProfile> = {}

    // Age detection
    const ageMatch = message.match(/\b(\d{1,2})\s*(?:years?\s*old|yo|age)\b/i) || 
                    message.match(/\bage\s*(\d{1,2})\b/i) ||
                    message.match(/\bi'?m\s*(\d{1,2})\b/i)
    if (ageMatch) {
    extractedInfo.age = parseInt(ageMatch[1])
    }

    // Residency status
    if (lowerMessage.match(/\b(citizen|australian citizen|born in australia)\b/)) {
    extractedInfo.residencyStatus = 'citizen'
    } else if (lowerMessage.match(/\b(permanent resident|pr|have pr|permanent visa)\b/)) {
    extractedInfo.residencyStatus = 'permanent_resident'
    } else if (lowerMessage.match(/\b(temporary visa|work visa|student visa|visitor)\b/)) {
    extractedInfo.residencyStatus = 'temporary_visa'
    }

    // Employment status
    if (lowerMessage.match(/\b(lost.*job|unemployed|out of work|no job|fired|laid off|redundant|jobless)\b/)) {
    extractedInfo.employmentStatus = 'unemployed'
    } else if (lowerMessage.match(/\b(working|employed|have.*job|full time|part time)\b/)) {
    extractedInfo.employmentStatus = 'employed'
    } else if (lowerMessage.match(/\b(not working|don't work|stay at home|retired)\b/)) {
    extractedInfo.employmentStatus = 'not_working'
    }

    // Children and pregnancy
    if (lowerMessage.match(/\b(have.*child|children|kids|son|daughter|baby)\b/)) {
    extractedInfo.hasChildren = true
    }
    if (lowerMessage.match(/\b(pregnant|expecting|due|having.*baby)\b/)) {
    extractedInfo.isPregnant = true
    }

    // Caring responsibilities
    if (lowerMessage.match(/\b(caring for|care for|look after|elderly parent|disabled.*child)\b/)) {
    extractedInfo.isCaring = true
    }

    // Disability
    if (lowerMessage.match(/\b(disability|disabled|chronic illness|mental health|can't work|unable.*work)\b/)) {
    extractedInfo.hasDisability = true
    }

    // Income (rough estimates)
    const incomeMatch = message.match(/\$(\d{1,3}(?:,\d{3})*)\s*(?:per\s*)?(?:year|annually|pa)/i)
    if (incomeMatch) {
    extractedInfo.annualIncome = parseInt(incomeMatch[1].replace(/,/g, ''))
    }
    
    const weeklyIncomeMatch = message.match(/\$(\d{1,4})\s*(?:per\s*)?(?:week|weekly)/i)
    if (weeklyIncomeMatch) {
    extractedInfo.weeklyIncome = parseInt(weeklyIncomeMatch[1])
    extractedInfo.annualIncome = extractedInfo.weeklyIncome * 52
    }

    // Rental status
    if (lowerMessage.match(/\b(renting|rent|rental|landlord|lease)\b/)) {
    extractedInfo.rentingStatus = 'renting'
    } else if (lowerMessage.match(/\b(own.*home|homeowner|mortgage|own.*house)\b/)) {
    extractedInfo.rentingStatus = 'homeowner'
    }

    return extractedInfo
}

const checkEligibility = (service: Service, profile: UserProfile): EligibilityResult => {
    let eligible = true
    let confidence = 1.0
    const missingRequirements: string[] = []
    const metRequirements: string[] = []
    const needsMoreInfo: string[] = []

    service.eligibility.forEach(requirement => {
    const lowerReq = requirement.toLowerCase()

    // Age requirements
    if (lowerReq.includes('age') && lowerReq.match(/\d+/)) {
        const ageMatch = lowerReq.match(/age\s*(\d+)\s*to\s*(\d+)|(\d+)\s*to\s*age|age\s*(\d+)/g)
        if (profile.age) {
        if (lowerReq.includes('22 to age pension') && (profile.age >= 22 && profile.age < 67)) {
            metRequirements.push(requirement)
        } else if (lowerReq.includes('67') && profile.age >= 67) {
            metRequirements.push(requirement)
        } else if (lowerReq.includes('16') && profile.age >= 16) {
            metRequirements.push(requirement)
        } else {
            missingRequirements.push(requirement)
            eligible = false
        }
        } else {
        needsMoreInfo.push(`Your age (for: ${requirement})`)
        confidence -= 0.2
        }
    }

    // Residency requirements
    else if (lowerReq.includes('australian resident') || lowerReq.includes('residency')) {
        if (profile.residencyStatus === 'citizen' || profile.residencyStatus === 'permanent_resident') {
        metRequirements.push(requirement)
        } else if (profile.residencyStatus === 'temporary_visa') {
        missingRequirements.push(requirement)
        eligible = false
        } else {
        needsMoreInfo.push(`Your residency status (for: ${requirement})`)
        confidence -= 0.3
        }
    }

    // Employment/work requirements
    else if (lowerReq.includes('unable to work') || lowerReq.includes("can't work")) {
        if (profile.employmentStatus === 'unemployed' || profile.employmentStatus === 'not_working' || profile.hasDisability) {
        metRequirements.push(requirement)
        } else if (profile.employmentStatus === 'employed') {
        missingRequirements.push(requirement)
        eligible = false
        } else {
        needsMoreInfo.push(`Your work capacity (for: ${requirement})`)
        confidence -= 0.2
        }
    }

    // Caring requirements
    else if (lowerReq.includes('caring') || lowerReq.includes('care for')) {
        if (profile.isCaring) {
        metRequirements.push(requirement)
        } else {
        needsMoreInfo.push(`Your caring responsibilities (for: ${requirement})`)
        confidence -= 0.2
        }
    }

    // Disability requirements
    else if (lowerReq.includes('disability') || lowerReq.includes('medical condition')) {
        if (profile.hasDisability) {
        metRequirements.push(requirement)
        } else {
        needsMoreInfo.push(`Medical/disability details (for: ${requirement})`)
        confidence -= 0.2
        }
    }

    // Income and assets tests
    else if (lowerReq.includes('income') || lowerReq.includes('assets')) {
        if (profile.annualIncome !== undefined) {
        // Basic income test - these are simplified thresholds
        const isLowIncome = profile.annualIncome < 50000 // Simplified threshold
        if (isLowIncome) {
            metRequirements.push(requirement)
        } else {
            missingRequirements.push(requirement)
            eligible = false
        }
        } else {
        needsMoreInfo.push(`Your income and assets (for: ${requirement})`)
        confidence -= 0.3
        }
    }

    // Payment eligibility
    else if (lowerReq.includes('receiving') && lowerReq.includes('payment')) {
        needsMoreInfo.push(`Current government payments (for: ${requirement})`)
        confidence -= 0.2
    }

    // Other requirements
    else {
        needsMoreInfo.push(`Details about: ${requirement}`)
        confidence -= 0.1
    }
    })

    // Generate recommendation
    let recommendation = ''
    if (eligible && confidence > 0.7) {
    recommendation = `You appear to be eligible for ${service.title}! I recommend applying as soon as possible.`
    } else if (eligible && confidence > 0.4) {
    recommendation = `You may be eligible for ${service.title}, but I need more information to be certain.`
    } else if (!eligible) {
    recommendation = `Based on current information, you may not meet all requirements for ${service.title}.`
    } else {
    recommendation = `I need more information to assess your eligibility for ${service.title}.`
    }

    return {
    eligible: eligible && confidence > 0.4,
    confidence: Math.max(0, confidence),
    missingRequirements,
    metRequirements,
    needsMoreInfo,
    recommendation
    }
}

const generateEligibilityResponse = (service: Service, eligibilityResult: EligibilityResult): string => {
    let response = `**Eligibility Check: ${service.title}**\n\n`
    
    response += `${eligibilityResult.recommendation}\n\n`
    
    if (eligibilityResult.metRequirements.length > 0) {
    response += `✅ **Requirements you meet:**\n`
    eligibilityResult.metRequirements.forEach(req => {
        response += `• ${req}\n`
    })
    response += '\n'
    }
    
    if (eligibilityResult.missingRequirements.length > 0) {
    response += `❌ **Requirements not met:**\n`
    eligibilityResult.missingRequirements.forEach(req => {
        response += `• ${req}\n`
    })
    response += '\n'
    }
    
    if (eligibilityResult.needsMoreInfo.length > 0) {
    response += `❓ **Need more information about:**\n`
    eligibilityResult.needsMoreInfo.forEach(info => {
        response += `• ${info}\n`
    })
    response += '\n'
    }
    
    if (eligibilityResult.eligible) {
    response += `**Next steps:**\n`
    response += `📞 Call: ${service.phone}\n`
    response += `🔗 Apply: ${service.applyUrl}\n\n`
    response += `💡 **Tip**: Have your documents ready - ID, income statements, and any relevant medical certificates.\n\n`
    } else if (eligibilityResult.needsMoreInfo.length > 0) {
    response += `**To check your eligibility, please tell me:**\n`
    response += eligibilityResult.needsMoreInfo.slice(0, 3).map(info => `• ${info}`).join('\n')
    response += '\n\n'
    }
    
    response += `Want to check eligibility for other services? Just ask about a specific service or life situation!`
    
    return response
}

const detectIntent = (message: string): string | null => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('lost job') || 
        lowerMessage.includes('unemployed') || 
        lowerMessage.includes('jobless') ||
        lowerMessage.includes('fired') ||
        lowerMessage.includes('redundant') ||
        lowerMessage.includes('laid off')) {
    return 'job_loss'
    }
    
    if (lowerMessage.includes('baby') || 
        lowerMessage.includes('birth') || 
        lowerMessage.includes('newborn') ||
        lowerMessage.includes('pregnant') ||
        lowerMessage.includes('expecting') ||
        lowerMessage.includes('child') ||
        lowerMessage.includes('maternity')) {
    return 'birth'
    }
    
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
    
    if (lowerMessage.includes('carer') ||
        lowerMessage.includes('caring for') ||
        lowerMessage.includes('look after') ||
        lowerMessage.includes('care for my parent')) {
    return 'carer'
    }
    
    return null
}

const generateResponse = (intent: string, services: Service[]): string => {
    const responses = {
    job_loss: `I understand you've lost your job - this is a difficult time. I've found ${services.length} key services that can help provide financial support and get you back on your feet. Let me explain what you might be eligible for.`,
    birth: `Congratulations on your new addition to the family! There are ${services.length} important services to help support you and your baby. Let me walk you through what you'll need to do.`,
    disaster: `I'm sorry to hear you've been affected by a disaster. There are ${services.length} support services available to help you during this difficult time. Let me show you what assistance you may be eligible for.`,
    carer: `I understand you're taking on caring responsibilities - this is both rewarding and challenging. I've found ${services.length} support services that can help you financially while you provide care. Let me explain what support is available.`
    }
    
    return responses[intent as keyof typeof responses] || "I've found some services that might help you."
}

const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
    id: Date.now().toString(),
    content: inputValue,
    sender: 'user',
    timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToProcess = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
    // Extract user information from this message and update profile
    const extractedInfo = extractUserInfoFromMessage(messageToProcess)
    setUserProfile(prev => ({ ...prev, ...extractedInfo }))

    // Check if user is asking about eligibility for a specific service
    const eligibilityCheck = messageToProcess.toLowerCase().match(/\b(?:am i eligible|eligibility|qualify|check.*eligibility|can i get|do i qualify)\b.*\b(jobseeker|rent assistance|medicare|parental leave|family tax|child care|carer payment|carer allowance|disability support|age pension|disaster recovery)\b/i)
    
    if (eligibilityCheck) {
        // Find the specific service
        const serviceQuery = eligibilityCheck[1]
        let targetService: Service | null = null
        
        for (const category of Object.values(mockServices)) {
        for (const service of category) {
            if (service.title.toLowerCase().includes(serviceQuery.toLowerCase()) ||
                service.id.toLowerCase().includes(serviceQuery.toLowerCase())) {
            targetService = service
            break
            }
        }
        if (targetService) break
        }
        
        if (targetService) {
        const updatedProfile = { ...userProfile, ...extractedInfo }
        const eligibilityResult = checkEligibility(targetService, updatedProfile)
        const eligibilityResponse = generateEligibilityResponse(targetService, eligibilityResult)
        
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: eligibilityResponse,
            sender: 'bot',
            timestamp: new Date()
        }
        
        setMessages(prev => [...prev, botMessage])
        setSelectedServices([targetService])
        setIsTyping(false)
        return
        }
    }

    // Check if this is a follow-up to eligibility questions
    if (isCollectingInfo && pendingEligibilityCheck) {
        const updatedProfile = { ...userProfile, ...extractedInfo }
        const eligibilityResult = checkEligibility(pendingEligibilityCheck, updatedProfile)
        
        // If we have enough info now, provide eligibility assessment
        if (eligibilityResult.confidence > 0.6 || eligibilityResult.needsMoreInfo.length <= 1) {
        const eligibilityResponse = generateEligibilityResponse(pendingEligibilityCheck, eligibilityResult)
        
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: eligibilityResponse,
            sender: 'bot',
            timestamp: new Date()
        }
        
        setMessages(prev => [...prev, botMessage])
        setSelectedServices([pendingEligibilityCheck])
        setIsCollectingInfo(false)
        setPendingEligibilityCheck(null)
        setIsTyping(false)
        return
        }
    }

    // Regular API call for general responses
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
        message: messageToProcess,
        mode,
        userApiKey: mode === 'advanced' ? userApiKey : undefined,
        sessionId
        }),
    })

    if (!response.ok) {
        throw new Error('Network response was not ok')
    }

    const data = await response.json()
    
    let botContent = data.response
    if (data.aiEnhanced) {
        botContent += '\n\n✨ *Enhanced by AI*'
    }

    // If services were returned and user profile has some info, offer eligibility checking
    if (data.services && data.services.length > 0 && Object.keys(userProfile).length > 0) {
        botContent += '\n\n💡 **Want to check your eligibility?** I can analyze your specific situation against these services. Just ask "Am I eligible for [service name]?" or "Check my eligibility for JobSeeker Payment".'
    }
    
    const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botContent,
        sender: 'bot',
        timestamp: new Date()
    }
    
    setMessages(prev => [...prev, botMessage])
    setSelectedServices(data.services || [])
    
    // Update usage info for basic mode
    if (data.usageInfo) {
        setUsageInfo(data.usageInfo)
    }
    
    } catch (error) {
    console.error('Error calling chat API:', error)
    
    // Fallback to local processing
    const intent = detectIntent(messageToProcess)
    
    if (intent) {
        const services = mockServices[intent]
        if (services && services.length > 0) {
        const response = generateResponse(intent, services)
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response + '\n\n⚠️ *Using offline mode*',
            sender: 'bot',
            timestamp: new Date()
        }
        
        setMessages(prev => [...prev, botMessage])
        setSelectedServices(services)
        }
    } else {
        const helpMessage = `I'm here to help with government services for major life events. Try telling me about:

• "I lost my job" or "I'm unemployed"
• "We had a baby" or "I'm expecting"  
• "We were affected by floods/fires" or "Natural disaster"
• "I need to become a carer"

What situation can I help you with?`
        
        const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: helpMessage,
        sender: 'bot',
        timestamp: new Date()
        }
        
        setMessages(prev => [...prev, botMessage])
        setSelectedServices([])
    }
    } finally {
    setIsTyping(false)
    }
}

const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
    }
}

const fillExample = (text: string) => {
    setInputValue(text)
}

const fillAndSend = async (text: string) => {
    setInputValue(text)
    // Wait for state to update, then send
    setTimeout(async () => {
    if (!isTyping) {
        const trimmedMessage = text.trim()
        if (trimmedMessage) {
        setIsTyping(true)
        setInputValue('')
        
        const userMessage: Message = {
            id: Date.now().toString(),
            content: trimmedMessage,
            sender: 'user',
            timestamp: new Date()
        }
        
        setMessages(prev => [...prev, userMessage])
        
        try {
            const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: trimmedMessage,
                mode,
                userApiKey: mode === 'advanced' ? userApiKey : undefined,
                sessionId
            }),
            })
            
            const data = await response.json()
            
            if (data.usageInfo) {
            setUsageInfo(data.usageInfo)
            }
            
            const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: data.response || 'Sorry, I encountered an error. Please try again.',
            sender: 'bot',
            timestamp: new Date()
            }
            
            setMessages(prev => [...prev, botMessage])
            setSelectedServices(data.services || [])
        } catch (error) {
            console.error('Chat error:', error)
            const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Sorry, I encountered an error. Please try again.',
            sender: 'bot',
            timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
        }
    }
    }, 100)
}

const handleModeChange = (newMode: 'basic' | 'advanced', apiKey?: string) => {
    setMode(newMode)
    if (newMode === 'advanced' && apiKey) {
    setUserApiKey(apiKey)
    } else if (newMode === 'basic') {
    setUserApiKey('')
    }
}

return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
    {/* Chat Area */}
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Chat Header with Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            mode === 'basic' 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
            }`}>
            {mode === 'basic' ? '🆓 Basic Mode' : '🚀 Advanced Mode'}
            </div>
            {mode === 'basic' && usageInfo && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
                {usageInfo.remaining}/{usageInfo.limit} AI responses left today
            </div>
            )}
        </div>
        <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
            ⚙️ Settings
        </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto max-h-96 lg:max-h-[500px]">
        {messages.map((message) => (
            <div key={message.id} className="mb-5">
            <div className={`message-bubble ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}>
                <div className="whitespace-pre-line leading-relaxed">
                {message.content}
                </div>
            </div>
            </div>
        ))}
        
        {isTyping && (
            <div className="flex items-center p-4 mb-5">
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-typing"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-typing"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-typing"></span>
            </div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Service-Buddy is thinking...</span>
            </div>
        )}
        
        <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900">
        {/* User Profile Status */}
        {Object.keys(userProfile).length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Profile Information Collected</span>
                </div>
                <button
                onClick={() => {
                    const profileSummary = Object.entries(userProfile)
                    .filter(([_, value]) => value !== undefined && value !== 'unknown')
                    .map(([key, value]) => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                        return `• ${label}: ${value}`
                    })
                    .join('\n')
                    
                    const infoMessage: Message = {
                    id: Date.now().toString(),
                    content: `**Your Profile Information:**\n\n${profileSummary}\n\nThis information helps me provide accurate eligibility assessments. You can update any details by mentioning them in our conversation.`,
                    sender: 'bot',
                    timestamp: new Date()
                    }
                    
                    setMessages(prev => [...prev, infoMessage])
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                >
                View Details
                </button>
            </div>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                {Object.keys(userProfile).length} piece(s) of information • Ready for eligibility checks
            </div>
            </div>
        )}
        
        {/* Dynamic placeholder text above input */}
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            <TypewriterText 
            staticText="Tell me about your situation... (e.g., '"
            phrases={examplePhrases}
            typeSpeed={30}
            deleteSpeed={100}
            pauseDuration={2500}
            />
            <span className="text-gray-600 dark:text-gray-400">')</span>
        </div>
        
        <div className="flex gap-4 items-end">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                rows={3}
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-3 text-base resize-none focus:border-blue-500 dark:focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-purple-200 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="flex flex-col gap-4 items-end justify-end relative">
            <div className="self-end mr-3">
                <VoiceInput 
                onTranscriptComplete={(transcript) => {
                    setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
                }}
                onTranscriptUpdate={(transcript) => {
                    // Live update the textarea while recording
                    setInputValue(transcript);
                }}
                />
            </div>
            <button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-message dark:bg-gradient-send-dark text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all duration-200 h-fit">
                Send
            </button>
            </div>
        </div>
        </div>
    </div>

    {/* Response Panel */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
        <div className="bg-gradient-message dark:bg-gradient-chat-dark text-white p-4 text-center">
        <h3 className="text-lg font-semibold">Service Information</h3>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto max-h-96 lg:max-h-[500px]">
        {selectedServices.length > 0 ? (
            selectedServices.map((service) => (
            <div key={service.id} className="service-card">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{service.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">{service.agency}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{service.description}</p>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-3">
                <h5 className="text-blue-700 dark:text-blue-300 font-medium mb-2 text-sm">Key Eligibility Requirements:</h5>
                <ul className="space-y-1">
                    {service.eligibility.map((req, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300 text-sm flex items-start">
                        <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                        {req}
                    </li>
                    ))}
                </ul>
                </div>
                
                <div className="text-sm space-y-1">
                <p className="text-gray-800 dark:text-white"><strong>Phone:</strong> {service.phone}</p>
                <p className="text-gray-800 dark:text-white">
                    <strong>Apply:</strong>{' '}
                    <a 
                    href={service.applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                    >
                    Visit official page
                    </a>
                </p>
                </div>
                
                {/* Eligibility Check Button */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <button
                    onClick={() => {
                    if (Object.keys(userProfile).length === 0) {
                        setInputValue(`To check my eligibility for ${service.title}, I am`)
                    } else {
                        const eligibilityResult = checkEligibility(service, userProfile)
                        const eligibilityResponse = generateEligibilityResponse(service, eligibilityResult)
                        
                        const botMessage: Message = {
                        id: Date.now().toString(),
                        content: eligibilityResponse,
                        sender: 'bot',
                        timestamp: new Date()
                        }
                        
                        setMessages(prev => [...prev, botMessage])
                    }
                    }}
                    className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                    {Object.keys(userProfile).length > 0 ? '✓ Check My Eligibility' : '📝 Start Eligibility Check'}
                </button>
                </div>
            </div>
            ))
        ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <p className="leading-relaxed">Your personalized service recommendations and explanations will appear here.</p>
            
            {/* Example suggestions */}
            <div className="mt-8 space-y-3">
                <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Try these examples:</p>
                <div className="space-y-2">
                <button
                    onClick={() => fillAndSend('I lost my job and need help with payments')}
                    className="w-full p-3 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors text-gray-800 dark:text-gray-200"
                >
                    "I lost my job and need help with payments"
                </button>
                <button
                    onClick={() => fillAndSend('We just had a baby')}
                    className="w-full p-3 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors text-gray-800 dark:text-gray-200"
                >
                    "We just had a baby"
                </button>
                <button
                    onClick={() => fillAndSend('I lost my home due to natural disaster')}
                    className="w-full p-3 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors text-gray-800 dark:text-gray-200"
                >
                    "I lost my home due to natural disaster"
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    </div>

    {/* Settings Modal */}
    <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentMode={mode}
        onModeChange={handleModeChange}
        usageInfo={usageInfo || undefined}
    />
    </div>
)
}
