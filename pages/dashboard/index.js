'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Building2, Calendar, ExternalLink, Briefcase, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [vacantes, setVacantes] = useState([]);
  const [filteredVacantes, setFilteredVacantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModality, setSelectedModality] = useState("all");

  useEffect(() => {
    loadVacantes();
  }, []);

  useEffect(() => {
    filterVacantes();
  }, [searchTerm, selectedModality, vacantes]);

  const loadVacantes = async () => {
    try {
      setIsLoading(true);
      setError("");

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_URL}/vacantes/general`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar vacantes');
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
      title="Vacantes Disponibles" 
      currentPath="/dashboard" 
      showLogo={false}
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f2755' }}>
            Vacantes Disponibles
          </h1>
          <p className="text-lg font-medium" style={{ color: '#0a6448' }}>
            Encuentra tu próxima oportunidad profesional
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
            Mostrando <span className="font-semibold text-gray-900">{filteredVacantes.length}</span> de <span className="font-semibold text-gray-900">{vacantes.length}</span> vacantes
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#0a6448]" />
          </div>
        ) : (
          /* Grid de vacantes */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacantes.map((vacante) => (
              <div
                key={vacante.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#0a6448] cursor-pointer group"
              >
                {/* Header de la tarjeta */}
                <div className="p-6">
                  {/* Badges superiores */}
                  <div className="flex items-center justify-between mb-3">
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
    </DashboardLayout>
  );
}
