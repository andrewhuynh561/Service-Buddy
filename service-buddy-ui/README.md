# Service-Buddy UI

A Next.js application for the Service-Buddy AI agent that helps Australians navigate government services during life events.

## Features

- 💬 **Dual AI Modes**: Choose between Basic (limited) and Advanced (unlimited) AI responses
- 🤖 **Google Gemini Integration**: Powered entirely by Google's Gemini Flash model
- 🎯 **Intent Detection**: Automatically detects job loss, birth, or disaster situations  
- 📋 **Service Recommendations**: Shows relevant government services with eligibility info
- 🔒 **Secure API Keys**: Client-side encryption for user-provided API keys
- 📊 **Usage Tracking**: Daily limits and progress visualization for basic mode
- 🎨 **Modern UI**: Gradient design with glassmorphism effects and dynamic placeholders
- 📱 **Responsive**: Works on desktop and mobile devices
- ⚡ **Fast**: Built with Next.js App Router and TypeScript

## AI Modes

### 🆓 Basic Mode (Recommended)
- **10 AI-enhanced responses per day**
- **Powered by Google Gemini**
- **Uses our Gemini API** - free for users
- **Perfect for casual users**

### 🚀 Advanced Mode  
- **Unlimited AI-enhanced responses**
- **Uses your own Google Gemini API key**
- **Perfect for power users**

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom gradients and animations
- **Backend**: Next.js API Routes with Google Gemini integration
- **AI**: Google Gemini Flash API
- **Encryption**: Client-side XOR encryption for API keys

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (recommended):
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Google Gemini API key to `.env.local` for basic mode responses:
   ```
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your key from: [Google AI Studio](https://ai.google.dev/)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
service-buddy-ui/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (lightweight backend)
│   │   └── chat/          # Chat API endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ChatInterface.tsx  # Main chat component
├── styles/                # Global styles
│   └── globals.css        # Tailwind + custom CSS
└── public/                # Static assets
```

## API Endpoints

### POST /api/chat

Processes user messages and returns service recommendations.

**Request:**
```json
{
  "message": "I lost my job",
  "useAI": false
}
```

**Response:**
```json
{
  "intent": "job_loss",
  "response": "I understand you've lost your job...",
  "services": [...],
  "confidence": 0.85
}
```

## Supported Life Events

1. **Job Loss**: JobSeeker Payment, Rent Assistance
2. **Birth of Child**: Medicare enrolment, Parental Leave Pay  
3. **Natural Disasters**: Disaster Recovery Payment

## Development

### Adding New Services

1. Update the `services` object in `/app/api/chat/route.ts`
2. Add new intent keywords to the `detectIntent` function
3. Update response templates in `generateResponse`

### Styling

This project uses Tailwind CSS with custom gradients defined in `tailwind.config.js`. The main gradient theme can be customized by updating the gradient classes.

### Environment Variables

- `NEXT_PUBLIC_APP_URL`: Application URL (defaults to localhost:3000)

## Deployment

This Next.js app can be deployed to:

- **Vercel**: `npm run build` and deploy
- **Netlify**: Build command: `npm run build`, Publish directory: `out`
- **Docker**: Build Docker image and deploy to any container platform

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
