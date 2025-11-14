'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children, title = 'Dashboard', currentPath = '/dashboard', showLogo = false }) {
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verificar si hay token en localStorage
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      // Si no hay token, redirigir al home
      router.push('/');
    } else {
      setToken(accessToken);
    }
  }, [router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a6448]/5 to-[#0f2755]/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a6448] mx-auto mb-4"></div>
          <p className="text-[#0f2755] font-medium">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#0a6448]/5 via-white to-[#0f2755]/5">
        <DashboardSidebar currentPath={currentPath} />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#0a6448]/20 bg-white/80 backdrop-blur-sm px-6">
            <SidebarTrigger className="text-[#0f2755] hover:text-[#0a6448]" />
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#0a6448] to-[#0f2755] bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
          </header>
          
          <div className="relative min-h-[calc(100vh-4rem)]">
            {showLogo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Image
                  src="/images/logo_main.png"
                  alt="UTC Link Logo"
                  width={600}
                  height={600}
                  className="opacity-20 select-none"
                  unoptimized
                />
              </div>
            )}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
