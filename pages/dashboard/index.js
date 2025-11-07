'use client';

import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout 
      title="Dashboard" 
      currentPath="/dashboard" 
      showLogo={true}
    >
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        {/* Contenido adicional del dashboard aquí si lo necesitas */}
      </div>
    </DashboardLayout>
  );
}
