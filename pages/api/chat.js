// pages/api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured',
        fallback: 'Por favor, configura GEMINI_API_KEY en tu archivo .env o .env.local'
      });
    }

    // Preparar el historial de conversación para Gemini
    const contents = [];
    
    // Si es el primer mensaje, agregar las instrucciones del sistema
    if (conversationHistory.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `Eres Ana, una entrevistadora virtual profesional del departamento de recursos humanos. Sé empática, profesional y haz preguntas relevantes sobre experiencia laboral y habilidades. Mantén respuestas de 2-4 oraciones.\n\nAhora comienza la entrevista con un saludo profesional.` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Entendido. Soy Ana, tu entrevistadora virtual.' }]
      });
    }
    
    // Agregar historial previo
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });
    
    // Agregar mensaje actual
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Llamar a la API de Gemini usando gemini-2.0-flash (modelo estable)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return res.status(response.status).json({ 
        error: 'AI response failed',
        details: error
      });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return res.status(500).json({ 
        error: 'Invalid response from Gemini',
        details: data
      });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ 
      response: aiResponse,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      ]
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: 'Chat processing failed', 
      details: error.message 
    });
  }
}