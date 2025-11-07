// pages/api/analyze-cv.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cvText } = req.body;
    
    if (!cvText) {
      return res.status(400).json({ error: 'CV text is required' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured',
        fallback: 'Por favor, configura GROQ_API_KEY en tu archivo .env o .env.local'
      });
    }

    // Llamar a la API de Groq para analizar el CV
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Eres un experto en recursos humanos especializado en análisis de CV. Tu trabajo es revisar el CV y proporcionar recomendaciones específicas y accionables para mejorarlo. Analiza:
1. Estructura y formato
2. Contenido y experiencia profesional
3. Habilidades y competencias
4. Educación y certificaciones
5. Redacción y claridad
6. Palabras clave relevantes para ATS

Proporciona una lista de 5-10 mejoras específicas, priorizadas por impacto. Sé constructivo y profesional.`
            },
            {
              role: 'user',
              content: `Por favor, analiza este CV y proporciona recomendaciones de mejora:\n\n${cvText}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return res.status(response.status).json({ 
        error: 'AI analysis failed',
        details: error
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ 
        error: 'Invalid response from Groq',
        details: data
      });
    }

    const analysis = data.choices[0].message.content;

    return res.status(200).json({ 
      analysis: analysis,
      success: true
    });

  } catch (error) {
    console.error('CV Analysis error:', error);
    return res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
}
