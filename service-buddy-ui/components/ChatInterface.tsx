'use client'

import { useState, useRef, useEffect } from 'react'
import TypewriterText from './TypewriterText'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

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
      // Call the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageToProcess,
          useAI: false // Set to true if you want to use OpenAI
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      setSelectedServices(data.services || [])
      
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
            content: response,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
      {/* Chat Area */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
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
              <span className="ml-3 text-gray-600">Service-Buddy is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-5 bg-gray-50">
          {/* Dynamic placeholder text above input */}
          <div className="mb-3 text-sm text-gray-600">
            <TypewriterText 
              staticText="Tell me about your situation... (e.g., '"
              phrases={examplePhrases}
              typeSpeed={30}
              deleteSpeed={100}
              pauseDuration={2500}
            />
            <span className="text-gray-600">')</span>
          </div>
          
          <div className="flex gap-4 items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              rows={3}
              className="flex-1 border-2 border-gray-300 rounded-xl p-3 text-base resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-message text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all duration-200 h-fit"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Response Panel */}
      <div className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
        <div className="bg-gradient-message text-white p-4 text-center">
          <h3 className="text-lg font-semibold">Service Information</h3>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto max-h-96 lg:max-h-[500px]">
          {selectedServices.length > 0 ? (
            selectedServices.map((service) => (
              <div key={service.id} className="service-card">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h4>
                <p className="text-sm text-gray-600 italic mb-2">{service.agency}</p>
                <p className="text-gray-700 mb-3 leading-relaxed">{service.description}</p>
                
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <h5 className="text-blue-700 font-medium mb-2 text-sm">Key Eligibility Requirements:</h5>
                  <ul className="space-y-1">
                    {service.eligibility.map((req, index) => (
                      <li key={index} className="text-gray-600 text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-sm space-y-1">
                  <p><strong>Phone:</strong> {service.phone}</p>
                  <p>
                    <strong>Apply:</strong>{' '}
                    <a 
                      href={service.applyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Visit official page
                    </a>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p className="leading-relaxed">Your personalized service recommendations and explanations will appear here.</p>
              
              {/* Example suggestions */}
              <div className="mt-8 space-y-3">
                <p className="font-medium text-gray-700 text-sm">Try these examples:</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => fillExample('I lost my job and need help with payments')}
                    className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    "I lost my job and need help with payments"
                  </button>
                  <button 
                    onClick={() => fillExample('We just had a baby')}
                    className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    "We just had a baby"
                  </button>
                  <button 
                    onClick={() => fillExample('I lost my home due to natural disaster')}
                    className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    "I lost my home due to natural disaster"
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
