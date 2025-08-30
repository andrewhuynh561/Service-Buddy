// Simple client-side encryption utilities for API keys
// Note: This is not meant for high-security scenarios, just basic obfuscation

const ENCRYPTION_KEY = 'service-buddy-2025'

export function encryptApiKey(apiKey: string): string {
  try {
    // Simple XOR encryption for client-side obfuscation
    let encrypted = ''
    for (let i = 0; i < apiKey.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      const messageChar = apiKey.charCodeAt(i)
      encrypted += String.fromCharCode(messageChar ^ keyChar)
    }
    return btoa(encrypted) // Base64 encode
  } catch (error) {
    console.error('Encryption error:', error)
    return apiKey // Return original if encryption fails
  }
}

export function decryptApiKey(encryptedApiKey: string): string {
  try {
    const encrypted = atob(encryptedApiKey) // Base64 decode
    let decrypted = ''
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      const encryptedChar = encrypted.charCodeAt(i)
      decrypted += String.fromCharCode(encryptedChar ^ keyChar)
    }
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return encryptedApiKey // Return original if decryption fails
  }
}

export function validateApiKey(apiKey: string): boolean {
  // Basic validation for Google Gemini API key format
  return apiKey.length > 20 && apiKey.startsWith('AI')
}
