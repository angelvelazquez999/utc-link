"use client";

import { useEffect, useState } from "react";
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Sparkles, Download } from "lucide-react";

export default function AnalizarCV() {
    const [cvList, setCvList] = useState([]);
    const [selectedCV, setSelectedCV] = useState(null);
    const [cvUrl, setCvUrl] = useState(null);
    const [cvText, setCvText] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Obtener el ID del usuario desde la API /usuarios/me
        const getUserIdFromAPI = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    return null;
                }

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                const response = await fetch(`${API_URL}/usuarios/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener datos del usuario');
                }

                const userData = await response.json();
                return userData.id; // Obtener el ID del usuario
            } catch (err) {
                console.error('Error getting user ID:', err);
                return null;
            }
        };

        getUserIdFromAPI().then(id => {
            if (id) {
                setUserId(id);
                loadUserCVs(id);
            } else {
                setError('No se pudo obtener el ID del usuario');
            }
        });
    }, []);

    const loadUserCVs = async (id) => {
        try {
            setIsLoading(true);
            setError("");

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${API_URL}/cv/usuario/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los CVs');
            }

            const data = await response.json();
            setCvList(data);
        } catch (err) {
            console.error('Error loading CVs:', err);
            setError('Error al cargar tus CVs: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCV = async (cv) => {
        try {
            setIsLoading(true);
            setError("");
            setSelectedCV(cv);
            setAnalysis("");

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${API_URL}/cv/descargar/${cv.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al descargar el CV');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setCvUrl(url);

            // Extraer texto del PDF
            await extractTextFromPDF(blob);

        } catch (err) {
            console.error('Error loading CV:', err);
            setError('Error al cargar el CV: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const extractTextFromPDF = async (blob) => {
        try {
            // Importar pdfjs-dist
            const pdfjs = await import('pdfjs-dist');
            
            // Configurar el worker desde el directorio public
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

            const arrayBuffer = await blob.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            setCvText(fullText);
            
        } catch (err) {
            console.error('Error extracting text from PDF:', err);
            setError('Error al extraer texto del PDF. Por favor, intenta con otro CV.');
        }
    };

    const analyzeCV = async () => {
        if (!cvText) {
            setError('No hay texto del CV para analizar');
            return;
        }

        try {
            setIsAnalyzing(true);
            setError("");
            setAnalysis("");

            const response = await fetch('/api/analyze-cv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cvText })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al analizar el CV');
            }

            const data = await response.json();
            setAnalysis(data.analysis);

        } catch (err) {
            console.error('Error analyzing CV:', err);
            setError('Error al analizar el CV: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <DashboardLayout
            title="Analizar CV"
            currentPath="/dashboard/analizar-cv"
            showLogo={false}
        >
            <div className="p-6 max-w-7xl mx-auto">
                {/* <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f2755' }}>
                        Analizar CV con IA
                    </h1>
                    <p className="text-lg font-medium" style={{ color: '#0a6448' }}>
                        Obtén recomendaciones personalizadas para mejorar tu currículum
                    </p>
                </div> */}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Lista de CVs */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#1f2937' }}>
                            <FileText className="w-5 h-5" style={{ color: '#0a6448' }} />
                            Mis CVs
                        </h2>

                        {isLoading && !selectedCV ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-[#0a6448]" />
                            </div>
                        ) : cvList.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No tienes CVs subidos aún
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cvList.map((cv) => (
                                    <div
                                        key={cv.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                            selectedCV?.id === cv.id
                                                ? 'border-[#0a6448] bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => loadCV(cv)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">
                                                    {cv.nombre_archivo}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Subido: {new Date(cv.fecha_subida).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {selectedCV?.id === cv.id && (
                                                <div className="w-3 h-3 bg-[#0a6448] rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Visor de PDF */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>
                            Vista Previa del CV
                        </h2>

                        {isLoading && selectedCV ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-[#0a6448]" />
                            </div>
                        ) : cvUrl ? (
                            <div className="space-y-4">
                                <iframe
                                    src={cvUrl}
                                    className="w-full h-[500px] border rounded-lg"
                                    title="CV Preview"
                                />
                                
                                <Button
                                    onClick={analyzeCV}
                                    disabled={isAnalyzing || !cvText}
                                    className="w-full"
                                    style={{
                                        background: 'linear-gradient(135deg, #0a6448 0%, #0f2755 100%)',
                                        color: 'white'
                                    }}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Analizando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Analizar CV con IA
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-20 text-gray-500">
                                Selecciona un CV para ver la vista previa
                            </div>
                        )}
                    </div>
                </div>

                {/* Análisis de IA */}
                {analysis && (
                    <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                            <Sparkles className="w-6 h-6 text-[#0a6448]" />
                            Análisis y Recomendaciones
                        </h2>
                        
                        <div className="prose max-w-none text-gray-800">
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {analysis}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
