import ChatInterface from '../components/ChatInterface'

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-5 py-5 min-h-screen flex flex-col max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
            Service Buddy
          </h1>
          <p className="text-lg md:text-xl opacity-90 font-light max-w-2xl mx-auto">
            From crisis to care — one AI agent that helps you navigate government services
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 glass-panel p-5">
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
