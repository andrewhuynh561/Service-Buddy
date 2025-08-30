# 🎯 Eligibility Checking System Guide

## Overview

Service-Buddy now includes an advanced **frontend-only eligibility checking system** that analyzes user information against government service requirements in real-time. This system works entirely in the browser without requiring backend processing.

## ✨ Features

### 🤖 Automatic Information Extraction
- **Smart parsing** of user messages to extract personal information
- **Age detection** from various formats ("I'm 25", "25 years old", "age 25")
- **Residency status** identification (citizen, permanent resident, temporary visa)
- **Employment status** tracking (employed, unemployed, not working)
- **Family situation** detection (children, pregnancy, caring responsibilities)
- **Income parsing** from dollar amounts mentioned in messages
- **Disability status** recognition from disability-related keywords

### 🔍 Real-Time Eligibility Assessment
- **Instant analysis** when user asks "Am I eligible for [service]?"
- **Confidence scoring** based on available information completeness
- **Missing requirements** identification with specific guidance
- **Met requirements** highlighting for user confidence
- **Proactive suggestions** for additional information needed

### 📊 Intelligent Profile Building
- **Cumulative learning** - each message adds to user profile
- **Context retention** across the entire conversation
- **Visual indicators** showing profile completeness
- **Privacy-focused** - all data stays in the browser session

## 🎮 How to Use

### 1. Start a Conversation
```
User: "I lost my job last month and I'm 28 years old"
```
*System automatically extracts: age=28, employment_status=unemployed*

### 2. Ask About Specific Services
```
User: "Am I eligible for JobSeeker Payment?"
```
*System provides detailed eligibility analysis*

### 3. Use Service Cards
- Click **"✓ Check My Eligibility"** button on any service card
- System analyzes your profile against service requirements
- Get immediate feedback with specific recommendations

### 4. Build Your Profile Gradually
```
User: "I'm an Australian citizen, renting, and have two kids"
```
*System extracts: residency_status=citizen, renting_status=renting, hasChildren=true*

## 🔧 Technical Implementation

### Information Extraction Patterns

**Age Detection:**
- `I'm 25`, `25 years old`, `age 25`
- Regex: `/\b(\d{1,2})\s*(?:years?\s*old|yo|age)\b/i`

**Residency Status:**
- Keywords: `citizen`, `permanent resident`, `temporary visa`
- Smart matching with confidence scoring

**Employment Status:**
- Unemployed: `lost job`, `unemployed`, `fired`, `laid off`
- Employed: `working`, `employed`, `have a job`
- Not working: `retired`, `stay at home`, `not working`

**Income Parsing:**
- Annual: `$50,000 per year`, `$50k annually`
- Weekly: `$500 per week`, `$500 weekly`
- Auto-conversion between weekly and annual figures

### Eligibility Logic

```typescript
interface EligibilityResult {
  eligible: boolean
  confidence: number           // 0.0 to 1.0
  missingRequirements: string[]
  metRequirements: string[]
  needsMoreInfo: string[]
  recommendation: string
}
```

### Service Requirements Analysis

**Age Requirements:**
- JobSeeker: "Age 22 to Age Pension age" → checks if user is 22-66
- Age Pension: "Age 67 or over" → checks if user is 67+

**Residency Requirements:**
- "Australian resident" → accepts citizen or permanent resident
- Flags temporary visa holders as ineligible

**Income Testing:**
- Simplified thresholds (e.g., $50,000 annual income limit)
- Automatic eligibility assessment based on declared income

**Complex Requirements:**
- Caring responsibilities matched against caring-related keywords
- Disability status for DSP eligibility
- Work capacity assessment for various payments

## 🎯 Example Interactions

### Complete Eligibility Check
```
User: "I'm 30, Australian citizen, lost my job, earning $0, paying $400 rent weekly. Am I eligible for JobSeeker?"

System Response:
✅ Requirements you meet:
• Age 22 to Age Pension age
• Australian resident
• Currently unemployed

❓ Need more information about:
• Income and assets thresholds (current financial situation)

Recommendation: You appear to be eligible for JobSeeker Payment! I recommend applying as soon as possible.

Next steps:
📞 Call: 131 202
🔗 Apply: https://www.servicesaustralia.gov.au/jobseeker-payment
💡 Tip: Have your documents ready - ID, income statements, and bank details.
```

### Gradual Information Building
```
User: "I lost my job"
System: Extracts employment_status=unemployed

User: "I'm 35 and Australian citizen"  
System: Adds age=35, residency_status=citizen

User: "Am I eligible for JobSeeker?"
System: Now has enough info for comprehensive assessment
```

## 🚀 Advanced Features

### Profile Status Indicator
- **Green dot** shows when profile information is collected
- **View Details** button displays all extracted information
- **Real-time updates** as new information is provided

### Service Card Integration
- **Smart buttons** that adapt based on profile completeness
- **"📝 Start Eligibility Check"** when no profile exists
- **"✓ Check My Eligibility"** when profile is available

### Confidence Scoring
- **High confidence (0.7+)**: Clear eligibility recommendation
- **Medium confidence (0.4-0.7)**: Conditional eligibility with info needed
- **Low confidence (<0.4)**: Insufficient information for assessment

## 🔒 Privacy & Security

### Frontend-Only Processing
- **No backend storage** - all data stays in your browser
- **Session-based** - information cleared when you close the browser
- **No external API calls** for eligibility checking
- **Complete privacy** - government agencies don't receive your information until you apply

### Data Handling
- Information extracted only from user-provided messages
- No tracking or persistent storage
- User maintains full control over shared information

## 🎨 User Experience

### Visual Feedback
- **Color-coded requirements**: Green (met), Red (missing), Yellow (need info)
- **Progress indicators** showing profile completeness
- **Immediate responses** without waiting for API calls

### Conversational Flow
- **Natural language processing** understands various ways of expressing information
- **Context awareness** builds on previous conversation
- **Proactive guidance** suggests what information is needed next

## 🛠️ Developer Notes

### Adding New Services
1. Add service to `mockServices` with detailed eligibility requirements
2. Update eligibility checking logic in `checkEligibility()` function
3. Add service name patterns to eligibility query matching

### Extending Information Extraction
1. Add new patterns to `extractUserInfoFromMessage()`
2. Update `UserProfile` interface with new fields
3. Add corresponding eligibility logic

### Customizing Confidence Scoring
- Adjust confidence reduction factors in `checkEligibility()`
- Modify threshold values for different confidence levels
- Add weighted scoring for critical vs. optional requirements

## 📈 Future Enhancements

### Planned Features
- **Document requirement analysis** based on eligibility results
- **Application timeline guidance** with personalized deadlines
- **Multi-service optimization** showing best combination of benefits
- **Location-based service centers** for in-person assistance
- **Progress tracking** for ongoing applications

### Integration Opportunities
- **Government API integration** for real-time policy updates
- **Document scanning** for automatic information extraction
- **Calendar integration** for appointment booking
- **SMS reminders** for application deadlines

---

This eligibility checking system transforms Service-Buddy from a passive information provider into an **active assistant** that provides personalized, actionable guidance for accessing government services.
