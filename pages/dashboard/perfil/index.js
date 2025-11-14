'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function Perfil() {
  return (
    <DashboardLayout 
      title="Mi Perfil" 
      currentPath="/dashboard/perfil"
      showLogo={true}
    >
      <div className="p-8">
        {/* <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0f2755] mb-6">Mi Perfil</h2>
          <p className="text-gray-600">Información del perfil del estudiante...</p>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
