// pages/api/stt.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audio } = req.body; // Base64 audio
    
    if (!audio) {
      return res.status(400).json({ error: 'Missing audio data' });
    }

    // Opción 1: Usar OpenAI Whisper (recomendado)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (OPENAI_API_KEY) {
      // Convertir base64 a buffer
      const audioBuffer = Buffer.from(audio.split(',')[1], 'base64');
      
      // Crear FormData para Whisper
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'es'); // Español

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Whisper API error:', error);
        throw new Error('Whisper transcription failed');
      }

      const data = await response.json();
      return res.status(200).json({ 
        text: data.text,
        method: 'whisper'
      });
    }

    // Fallback: usar Web Speech API del navegador (lado cliente)
    return res.status(200).json({ 
      useClientSide: true,
      message: 'Use browser SpeechRecognition API'
    });

  } catch (error) {
    console.error('STT error:', error);
    return res.status(500).json({ 
      error: 'Speech-to-text failed', 
      details: error.message 
    });
  }
}