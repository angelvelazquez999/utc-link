'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Building2, Calendar, ExternalLink, Briefcase, Search, Sparkles, Target } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Vacantes() {
  const [vacantes, setVacantes] = useState([]);
  const [filteredVacantes, setFilteredVacantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModality, setSelectedModality] = useState("all");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserIdAndLoadVacantes();
  }, []);

  useEffect(() => {
    filterVacantes();
  }, [searchTerm, selectedModality, vacantes]);

  const getUserIdAndLoadVacantes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No hay sesión activa');
        setIsLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // Obtener ID del usuario
      const userResponse = await fetch(`${API_URL}/usuarios/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const userData = await userResponse.json();
      setUserId(userData.id);
      
      // Cargar vacantes personalizadas
      await loadVacantes(userData.id, token);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar las vacantes: ' + err.message);
      setIsLoading(false);
    }
  };

  const loadVacantes = async (id, token) => {
    try {
      setIsLoading(true);
      setError("");

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

      const response = await fetch(`${API_URL}/vacantes/?usuario_id=${id}&topk=100&orden=probabilidad&metrics=false`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar vacantes personalizadas');
      }

      const data = await response.json();
      setVacantes(data);
      setFilteredVacantes(data);
    } catch (err) {
      console.error('Error loading vacantes:', err);
      setError('Error al cargar las vacantes: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVacantes = () => {
    let filtered = vacantes;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.datos_vacante.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.datos_vacante.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por modalidad
    if (selectedModality !== "all") {
      filtered = filtered.filter(v => 
        v.datos_vacante.modality.toLowerCase() === selectedModality.toLowerCase()
      );
    }

    setFilteredVacantes(filtered);
  };

  const getModalityBadge = (modality) => {
    const styles = {
      'On-site': 'bg-blue-100 text-blue-800 border-blue-200',
      'Remote': 'bg-green-100 text-green-800 border-green-200',
      'Hybrid': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return styles[modality] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMatchColor = (score) => {
    if (!score) return 'bg-gray-200 text-gray-700';
    if (score >= 0.7) return 'bg-green-500 text-white';
    if (score >= 0.5) return 'bg-yellow-500 text-white';
    return 'bg-orange-500 text-white';
  };

  const getMatchLabel = (score) => {
    if (!score) return 'Sin calificar';
    if (score >= 0.7) return 'Alta compatibilidad';
    if (score >= 0.5) return 'Buena compatibilidad';
    return 'Compatibilidad media';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  return (
    <DashboardLayout 
      title="Vacantes Personalizadas" 
      currentPath="/dashboard/vacantes"
      showLogo={false}
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: '#0f2755' }}>
            <Target className="w-8 h-8" style={{ color: '#0a6448' }} />
            Vacantes Personalizadas para Ti
          </h1>
          <p className="text-lg font-medium" style={{ color: '#0a6448' }}>
            Vacantes ordenadas según tu perfil y preferencias
          </p>
        </div> */}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por puesto, empresa o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-gray-900"
                />
              </div>
            </div>

            {/* Filtro de modalidad */}
            <div>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0a6448] focus:border-transparent text-gray-900"
              >
                <option value="all">Todas las modalidades</option>
                <option value="on-site">Presencial</option>
                <option value="remote">Remoto</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{filteredVacantes.length}</span> de <span className="font-semibold text-gray-900">{vacantes.length}</span> vacantes personalizadas
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Loading con efecto de skeleton */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 text-[#0a6448] mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Analizando tu perfil...
              </h3>
              <p className="text-gray-500">
                Estamos buscando las mejores oportunidades para ti
              </p>
            </div>
            
            {/* Skeleton cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid de vacantes */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacantes.map((vacante, index) => (
              <div
                key={vacante.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#0a6448] cursor-pointer group relative"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Badge de ranking */}
                {index < 3 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-lg font-bold text-xs shadow-lg">
                    #{index + 1} TOP
                  </div>
                )}

                {/* Header de la tarjeta */}
                <div className="p-6">
                  {/* Match Score - Destacado */}
                  {vacante.match_score !== null && (
                    <div className="mb-4 -mx-6 -mt-6 p-4 bg-gradient-to-r from-[#0a6448] to-[#0f2755]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-white" />
                          <span className="text-white font-bold text-sm">
                            Compatibilidad
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-white px-3 py-1 rounded-full">
                            <span className="font-bold text-[#0a6448] text-lg">
                              {(vacante.match_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-white/30 rounded-full h-2">
                          <div 
                            className="bg-white rounded-full h-2 transition-all duration-1000"
                            style={{ width: `${vacante.match_score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Badges superiores */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getModalityBadge(vacante.datos_vacante.modality)}`}>
                      {vacante.datos_vacante.modality}
                    </span>
                    {vacante.datos_vacante.student_friendly && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        🎓 Para estudiantes
                      </span>
                    )}
                  </div>

                  {/* Título del puesto */}
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-[#0a6448] transition-colors line-clamp-2">
                    {vacante.datos_vacante.title}
                  </h3>

                  {/* Empresa */}
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {vacante.nombre_empresa}
                    </span>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {vacante.datos_vacante.city}, {vacante.datos_vacante.state}
                    </span>
                  </div>

                  {/* Fecha de publicación */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(vacante.datos_vacante.posted_at)}
                    </span>
                  </div>

                  {/* Términos coincidentes */}
                  {vacante.match_terms && vacante.match_terms.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[#0a6448] mb-2">Coincidencias clave:</p>
                      <div className="flex flex-wrap gap-1">
                        {vacante.match_terms.slice(0, 3).map((term, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-medium"
                          >
                            {term.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Áreas coincidentes */}
                  {vacante.datos_vacante.matched_utc_areas && vacante.datos_vacante.matched_utc_areas.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Áreas relacionadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {vacante.datos_vacante.matched_utc_areas.slice(0, 2).map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {area}
                          </span>
                        ))}
                        {vacante.datos_vacante.matched_utc_areas.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{vacante.datos_vacante.matched_utc_areas.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resumen de requisitos */}
                  {vacante.datos_vacante.requirements_summary && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {vacante.datos_vacante.requirements_summary}
                    </p>
                  )}
                </div>

                {/* Footer con botón */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <a
                    href={vacante.datos_vacante.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      className="w-full group-hover:shadow-md transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #0a6448 0%, #0f2755 100%)',
                        color: 'white'
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver detalles
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && filteredVacantes.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron vacantes
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
