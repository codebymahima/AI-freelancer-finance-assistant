import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
})

const financePrompt = (question) => `
You are an experienced freelance finance advisor helping freelancers, web developers, designers, and consultants.

Answer clearly, practically, and specifically.

Rules:
- Always respond in English.
- Never switch languages.
- Use only English unless the user explicitly asks for another language.
- Keep the answer under 180 words.
- Use short bullet points.
- Do not assume project scope, hours, country, or market unless provided.
- If information is missing, mention the assumptions clearly.
- Give realistic pricing guidance when relevant.
- Mention risks, costs, or trade-offs when applicable.
- Avoid vague statements.
- Do not give legal or tax advice as final truth.
- End with one practical recommendation.
- Focus on actionable advice rather than theory.

Question:
${question}
`

async function askOpenRouter(question) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-OpenRouter-Title': 'FreelanceAI Finance Assistant'
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content:
            `
You are a professional freelance finance advisor.

IMPORTANT:
- Never explain your reasoning process.
- Never show internal thinking.
- Never describe how you will answer.
- Never write phrases like:
  "We need to answer..."
  "Let's think..."
  "Assumptions..."
  "Reasoning..."
- Respond directly to the user's question.
- Use bullet points.
- Give only the final answer.
`
        },
        {
          role: 'user',
          content: financePrompt(question)
        }
      ],
      max_tokens: 250
    })
  })

  const data = await response.json()
  console.log('OPENROUTER FULL DATA:', data)

  if (!response.ok) {
    throw new Error(data?.error?.message || 'OpenRouter API failed')
  }

  const answer =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    ''

  if (!answer.trim()) {
    throw new Error('OpenRouter returned empty response')
  }

  return answer
}

async function askGemini(question) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: financePrompt(question)
  })

  return response.text
}

export async function askFinanceAssistant(question) {

  try {
    return await askOpenRouter(question)
  } catch (openRouterError) {
    console.error('OpenRouter failed:', openRouterError)

    try {
      return await askGemini(question)
    } catch (geminiError) {
      console.error('Gemini failed:', geminiError)

      return `The AI assistant is temporarily unavailable, but here’s a quick finance suggestion:

- Track invoice status regularly.
- Follow up on overdue payments.
- Compare platform fees before accepting international payments.
- Keep a small buffer for irregular freelance income.

Recommendation: Review pending invoices weekly and prioritize collecting overdue payments first.`
    }
  }
}