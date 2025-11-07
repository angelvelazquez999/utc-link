"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";

const Avatar = dynamic(() => import("../../components/Avatar"), { ssr: false });

import DashboardLayout from '../../components/DashboardLayout';


export default function Home() {
    const audioRef = useRef(null);
    const [audioAnalyzer, setAudioAnalyzer] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [conversationHistory, setConversationHistory] = useState([]);
    const [error, setError] = useState("");

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Inicializar analizador de audio del micrófono
        async function initMic() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const ctx = new AudioContext();
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 512;
                source.connect(analyser);
                setAudioAnalyzer(analyser);
            } catch (err) {
                console.error("Error al inicializar micrófono:", err);
                setError("No se pudo acceder al micrófono");
            }
        }
        initMic();

        // Cargar voces del navegador para TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }

        // Inicializar Web Speech API para reconocimiento de voz
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'es-ES';
        }
    }, []);

    // Función para grabar audio
    const startRecording = async () => {
        try {
            setError("");
            setIsListening(true);
            setTranscript("");
            audioChunksRef.current = [];

            // Opción 1: Usar Web Speech API del navegador (más simple)
            if (recognitionRef.current) {
                recognitionRef.current.onresult = async (event) => {
                    const text = event.results[0][0].transcript;
                    console.log("Transcript:", text);
                    setTranscript(text);
                    setIsListening(false);

                    // Procesar con IA
                    await processWithAI(text);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    setError(`Error de reconocimiento: ${event.error}`);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current.start();
            } else {
                setError("Tu navegador no soporta reconocimiento de voz");
                setIsListening(false);
            }

        } catch (err) {
            console.error("Error al grabar:", err);
            setError("Error al iniciar grabación: " + err.message);
            setIsListening(false);
        }
    };

    // Función para detener grabación
    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    // Procesar texto con IA
    const processWithAI = async (text) => {
        try {
            setIsProcessing(true);
            setError("");

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    conversationHistory: conversationHistory
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Error al procesar con IA");
            }

            const data = await response.json();
            setAiResponse(data.response);
            setConversationHistory(data.conversationHistory);

            // Hablar la respuesta
            await speakText(data.response);

        } catch (err) {
            console.error("Error al procesar con IA:", err);
            setError("Error de IA: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para convertir texto a voz
    const speakText = async (text) => {
        try {
            setError("");

            // Intentar usar API de TTS (ElevenLabs si está configurada)
            const resp = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (!resp.ok) {
                throw new Error("TTS API falló");
            }

            const contentType = resp.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                // Usar Web Speech API del navegador
                const data = await resp.json();
                console.log("Usando Web Speech API del navegador");

                const utterance = new SpeechSynthesisUtterance(data.text);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95;
                utterance.pitch = 1.1;
                utterance.volume = 1.0;

                // Buscar voz femenina en español
                const voices = window.speechSynthesis.getVoices();
                const spanishFemaleVoice = voices.find(voice =>
                    voice.lang.startsWith('es') &&
                    (voice.name.toLowerCase().includes('female') ||
                        voice.name.toLowerCase().includes('mujer') ||
                        voice.name.toLowerCase().includes('paulina') ||
                        voice.name.toLowerCase().includes('monica'))
                );

                const spanishVoice = spanishFemaleVoice || voices.find(v => v.lang.startsWith('es'));
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                }

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = (e) => {
                    console.error("Speech error:", e);
                    setIsSpeaking(false);
                };

                window.speechSynthesis.speak(utterance);
                return;
            }

            // Si es audio binario de ElevenLabs
            const arrayBuffer = await resp.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: contentType || "audio/mpeg" });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            const ctx = new AudioContext();
            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            setAudioAnalyzer(analyser);

            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);

            await audio.play();

        } catch (err) {
            console.error("Error al reproducir audio:", err);
            setError("Error al reproducir: " + err.message);
            setIsSpeaking(false);
        }
    };

    // Mensaje de bienvenida inicial
    const startInterview = async () => {
        const welcomeMessage = "Hola, soy Ana, tu entrevistadora virtual. Estoy aquí para conocerte mejor y entender tu experiencia profesional. Para comenzar, ¿podrías contarme un poco sobre ti y tu trayectoria profesional?";
        setAiResponse(welcomeMessage);
        await speakText(welcomeMessage);
    };

    return (
        <DashboardLayout
            title="Simular Entrevista"
            currentPath="/dashboard/entrevista"
            showLogo={false}
        >
            <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 4rem)' }}>
                {/* Panel de controles */}
                <div style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    zIndex: 10,
                    background: 'rgba(255,255,255,0.95)',
                    padding: '20px',
                    borderRadius: '15px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    maxWidth: '350px'
                }}>
                    <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#333' }}>
                        Entrevistador Virtual
                    </h2>

                    <div style={{ marginBottom: '15px' }}>
                        <button
                            onClick={startInterview}
                            disabled={isSpeaking || isProcessing}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: isSpeaking || isProcessing ? 'not-allowed' : 'pointer',
                                background: 'linear-gradient(135deg, #0a6448 0%, #0f2755 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                opacity: isSpeaking || isProcessing ? 0.6 : 1
                            }}
                        >
                            Iniciar Entrevista
                        </button>

                        <button
                            onClick={isListening ? stopRecording : startRecording}
                            disabled={isSpeaking || isProcessing}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: (isSpeaking || isProcessing) ? 'not-allowed' : 'pointer',
                                background: isListening ? '#ef4444' : '#0a6448',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                opacity: (isSpeaking || isProcessing) ? 0.6 : 1
                            }}
                        >
                            {isListening ? '⏹️ Detener' : 'Hablar'}
                        </button>
                    </div>

                    {/* Estados */}
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                        {isListening && <div style={{ color: '#ef4444' }}>🔴 Escuchando...</div>}
                        {isProcessing && <div style={{ color: '#f59e0b' }}>⚙️ Procesando...</div>}
                        {isSpeaking && <div style={{ color: '#0a6448' }}>🗣️ Hablando...</div>}
                    </div>

                    {/* Transcript */}
                    {transcript && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f3f4f6', borderRadius: '8px', color: '#1f2937' }}>
                            <strong style={{ color: '#0a6448' }}>Tú:</strong> {transcript}
                        </div>
                    )}

                    {/* Respuesta IA */}
                    {aiResponse && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5f1', borderRadius: '8px', color: '#1f2937' }}>
                            <strong style={{ color: '#0f2755' }}>Ana:</strong> {aiResponse}
                        </div>
                    )}

                    {/* Errores */}
                    {error && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Instrucciones */}
                    <div style={{ marginTop: '15px', fontSize: '12px', color: '#999', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                        <strong>Instrucciones:</strong>
                        <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
                            <li>Haz clic en "Iniciar Entrevista"</li>
                            <li>Espera a que el avatar termine de hablar</li>
                            <li>Presiona "Hablar" y responde</li>
                            <li>La IA procesará tu respuesta automáticamente</li>
                        </ol>
                    </div>
                </div>

                {/* Canvas del Avatar */}
                <Canvas 
                    camera={{ position: [0, 0, 2], fov: 50 }} 
                    style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a6448 0%, #0f2755 100%)' }}
                >
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                    <Avatar
                        url="https://models.readyplayer.me/690c35d7d9d72e80a579e569.glb"
                        audioAnalyser={audioAnalyzer}
                        isSpeaking={isSpeaking}
                    />
                </Canvas>
            </div>
        </DashboardLayout>
    );
}