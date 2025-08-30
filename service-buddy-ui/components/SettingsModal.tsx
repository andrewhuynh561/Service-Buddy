'use client'

import { useState } from 'react'
import { validateApiKey } from '../utils/encryption'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentMode: 'basic' | 'advanced'
  onModeChange: (mode: 'basic' | 'advanced', apiKey?: string) => void
  usageInfo?: {
    remaining: number
    limit: number
    used: number
  }
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  currentMode, 
  onModeChange,
  usageInfo 
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  if (!isOpen) return null

  const handleAdvancedMode = () => {
    const trimmedKey = apiKey.trim()
    if (trimmedKey && validateApiKey(trimmedKey)) {
      onModeChange('advanced', trimmedKey)
      onClose()
    }
  }

  const isValidKey = apiKey.trim() && validateApiKey(apiKey.trim())

  const handleBasicMode = () => {
    onModeChange('basic')
    setApiKey('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-message text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">AI Service Settings</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Usage (Basic Mode) */}
          {currentMode === 'basic' && usageInfo && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Today's Usage</h3>
              <div className="flex justify-between text-sm">
                <span>AI-enhanced responses used:</span>
                <span className="font-medium">{usageInfo.used}/{usageInfo.limit}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(usageInfo.used / usageInfo.limit) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {usageInfo.remaining} enhanced responses remaining today
              </p>
            </div>
          )}

          {/* Basic Mode */}
          <div className={`border-2 rounded-xl p-6 ${currentMode === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  🆓 Basic Mode
                  {currentMode === 'basic' && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
                  )}
                </h3>
                <p className="text-gray-600 mt-1">Limited AI-enhanced responses using our API</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>10 AI-enhanced responses per day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>No API key required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Standard response quality</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Shared resource limitations</span>
              </div>
            </div>

            {currentMode !== 'basic' && (
              <button
                onClick={handleBasicMode}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Switch to Basic Mode
              </button>
            )}
          </div>

          {/* Advanced Mode */}
          <div className={`border-2 rounded-xl p-6 ${currentMode === 'advanced' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  🚀 Advanced Mode
                  {currentMode === 'advanced' && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
                  )}
                </h3>
                <p className="text-gray-600 mt-1">Unlimited enhanced responses using your Google Gemini API</p>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Unlimited AI-enhanced responses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Higher quality responses (Google Gemini Pro)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Your data stays private</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Requires your Google Gemini API key</span>
              </div>
            </div>

            {currentMode !== 'advanced' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Google Gemini API key..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleAdvancedMode}
                  disabled={!isValidKey}
                  className={`
                    w-full px-6 py-2 rounded-lg font-medium transition-all
                    ${isValidKey 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Enable Advanced Mode
                </button>
              </div>
            )}
          </div>

          {/* API Key Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🔑 How to get your Google Gemini API key:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
              <li>Sign in with your Google account</li>
              <li>Click "Get API key" and create a new key</li>
              <li>Copy the API key and paste it above</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Privacy:</strong> Your API key is encrypted and only used for this session. 
                We never store your API key on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
