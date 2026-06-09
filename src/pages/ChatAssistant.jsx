import { useState, useRef, useEffect } from 'react'
import Card from '../components/Card'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { askFinanceAssistant } from '../lib/gemini'

const initialMessages = [
  {
    role: 'assistant',
    content:
      "Hi! I'm your AI finance assistant. Ask me about pricing, invoices, international payments, taxes, or managing irregular income."
  }
]

function ChatAssistant() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const question = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setIsTyping(true)

    try {
      const response = await askFinanceAssistant(question)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response || 'Sorry, I could not generate a response.'
        }
      ])
    } catch (error) {
      console.error(error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Gemini is currently busy due to high demand. Please try again in a few moments.'
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-14rem)] lg:h-[calc(100vh-8rem)]">
      <div className="mb-5">
        <h2 className="text-3xl sm:text-4xl lg:text-3xl font-bold leading-tight">
          AI Finance Assistant
        </h2>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Get real AI-powered answers to your freelance finance questions.
        </p>
      </div>

      <Card className="flex-1 flex flex-col min-h-130 sm:min-h-140 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-900 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap wrap-break-word">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about invoices, fees..."
            className="min-w-0 flex-1 bg-slate-900 border border-gray-700 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-sky-500"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 flex items-center justify-center bg-sky-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  )
}

export default ChatAssistant