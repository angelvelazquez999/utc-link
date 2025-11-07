'use client';

import DashboardLayout from '../../components/DashboardLayout';

export default function Vacantes() {
  return (
    <DashboardLayout 
      title="Vacantes" 
      currentPath="/dashboard/vacantes"
      showLogo={true}
    >
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0f2755] mb-6">Vacantes Disponibles</h2>
          <p className="text-gray-600">Aquí se mostrarán las vacantes disponibles...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
