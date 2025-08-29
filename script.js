// Mock service data based on PRD requirements
const mockServices = {
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
};

// DOM elements
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const responsePanel = document.getElementById('response-panel');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    sendButton.addEventListener('click', handleSendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}

function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate processing delay
    setTimeout(() => {
        hideTypingIndicator();
        processMessage(message);
    }, 1500);
}

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (typeof content === 'string') {
        messageContent.innerHTML = `<p>${content}</p>`;
    } else {
        messageContent.appendChild(content);
    }
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <span style="margin-left: 10px; color: #666;">Service-Buddy is thinking...</span>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function processMessage(message) {
    const intent = detectIntent(message);
    
    if (intent) {
        const services = mockServices[intent];
        if (services && services.length > 0) {
            // Add bot response
            const response = generateResponse(intent, services);
            addMessage(response, 'bot');
            
            // Update response panel
            updateResponsePanel(services);
        } else {
            addMessage("I understand you're going through a difficult time. Let me connect you with general support services.", 'bot');
        }
    } else {
        const helpMessage = `I'm here to help with government services for major life events. Try telling me about:
        <br><br>
        • "I lost my job" or "I'm unemployed"
        <br>
        • "We had a baby" or "I'm expecting"
        <br>
        • "We were affected by floods/fires" or "Natural disaster"
        <br><br>
        What situation can I help you with?`;
        
        addMessage(helpMessage, 'bot');
    }
}

function detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Job loss keywords
    if (lowerMessage.includes('lost job') || 
        lowerMessage.includes('unemployed') || 
        lowerMessage.includes('jobless') ||
        lowerMessage.includes('fired') ||
        lowerMessage.includes('redundant') ||
        lowerMessage.includes('laid off')) {
        return 'job_loss';
    }
    
    // Birth keywords
    if (lowerMessage.includes('baby') || 
        lowerMessage.includes('birth') || 
        lowerMessage.includes('newborn') ||
        lowerMessage.includes('pregnant') ||
        lowerMessage.includes('expecting') ||
        lowerMessage.includes('child') ||
        lowerMessage.includes('maternity')) {
        return 'birth';
    }
    
    // Disaster keywords
    if (lowerMessage.includes('flood') || 
        lowerMessage.includes('fire') || 
        lowerMessage.includes('disaster') ||
        lowerMessage.includes('cyclone') ||
        lowerMessage.includes('storm') ||
        lowerMessage.includes('earthquake') ||
        lowerMessage.includes('bushfire')) {
        return 'disaster';
    }
    
    return null;
}

function generateResponse(intent, services) {
    const responses = {
        job_loss: `I understand you've lost your job - this is a difficult time. I've found ${services.length} key services that can help provide financial support and get you back on your feet. Let me explain what you might be eligible for.`,
        birth: `Congratulations on your new addition to the family! There are ${services.length} important services to help support you and your baby. Let me walk you through what you'll need to do.`,
        disaster: `I'm sorry to hear you've been affected by a disaster. There are ${services.length} support services available to help you during this difficult time. Let me show you what assistance you may be eligible for.`
    };
    
    return responses[intent] || "I've found some services that might help you.";
}

function updateResponsePanel(services) {
    responsePanel.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        serviceCard.innerHTML = `
            <h4>${service.title}</h4>
            <p class="agency">${service.agency}</p>
            <p>${service.description}</p>
            
            <div class="eligibility-info">
                <h5>Key Eligibility Requirements:</h5>
                <ul>
                    ${service.eligibility.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
            
            <p style="margin-top: 12px;">
                <strong>Phone:</strong> ${service.phone}<br>
                <strong>Apply:</strong> <a href="${service.applyUrl}" target="_blank" style="color: #667eea;">Visit official page</a>
            </p>
        `;
        
        responsePanel.appendChild(serviceCard);
    });
}

// Add some helpful suggestions when page loads
setTimeout(() => {
    const suggestions = document.createElement('div');
    suggestions.innerHTML = `
        <p style="margin-bottom: 15px;"><strong>Try these examples:</strong></p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button onclick="fillExample('I lost my job and need help with payments')" 
                    style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                "I lost my job and need help with payments"
            </button>
            <button onclick="fillExample('We just had a baby')" 
                    style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                "We just had a baby"
            </button>
            <button onclick="fillExample('Our house was damaged in the floods')" 
                    style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; text-align: left;">
                "Our house was damaged in the floods"
            </button>
        </div>
    `;
    
    addMessage(suggestions, 'bot');
}, 2000);

function fillExample(text) {
    userInput.value = text;
    userInput.focus();
}
