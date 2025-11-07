'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  FiHome,
  FiBriefcase,
  FiFileText,
  FiMessageSquare,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';

const menuItems = [
  {
    title: 'Principal',
    icon: FiHome,
    url: '/dashboard',
  },
  {
    title: 'Vacantes',
    icon: FiBriefcase,
    url: '/dashboard/vacantes',
  },
  {
    title: 'Analizar CV',
    icon: FiFileText,
    url: '/dashboard/analizar-cv',
  },
  {
    title: 'Simular Entrevista',
    icon: FiMessageSquare,
    url: '/dashboard/entrevista',
  },
  {
    title: 'Perfil',
    icon: FiUser,
    url: '/dashboard/perfil',
  },
];

export default function DashboardSidebar({ currentPath }) {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('Principal');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${apiUrl}/usuarios/me`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Determinar el item activo basado en la ruta actual
  useEffect(() => {
    const item = menuItems.find((item) => item.url === currentPath);
    if (item) {
      setActiveItem(item.title);
    }
  }, [currentPath]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    router.push('/');
  };

  const handleNavigation = (item) => {
    setActiveItem(item.title);
    router.push(item.url);
  };

  return (
    <Sidebar className="border-none bg-white">
      <SidebarHeader className="h-20 border-b border-gray-200 px-6 bg-gradient-to-br from-[#0a6448] to-[#0f2755]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <FiUser className="w-5 h-5 text-[#0a6448]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            {loading ? (
              <>
                <p className="text-sm font-semibold text-white drop-shadow-sm">Cargando...</p>
                <p className="text-xs text-white/90">Estudiante UTC</p>
              </>
            ) : userData ? (
              <>
                <p className="text-sm font-semibold text-white drop-shadow-sm">
                  {userData.nombre} {userData.apellidos}
                </p>
                <p className="text-xs text-white/90 mt-1">
                  {userData.carrera}
                </p>
                <p className="text-xs text-white/90 mt-1">
                  {userData.cuatrimestre}° Cuatrimestre
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-white drop-shadow-sm">Usuario</p>
                <p className="text-xs text-white/90">Estudiante UTC</p>
              </>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = activeItem === item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item)}
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        group relative rounded-xl px-4 py-3 transition-all duration-200 font-medium
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#0a6448] to-[#0f2755] shadow-lg shadow-[#0a6448]/25' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-[#0a6448]'
                        }
                      `}
                      style={isActive ? { color: '#ffffff' } : undefined}
                    >
                      <item.icon 
                        className={`w-5 h-5 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}
                        style={isActive ? { color: '#ffffff' } : undefined}
                      />
                      <span className="text-sm" style={isActive ? { color: '#ffffff' } : undefined}>
                        {item.title}
                      </span>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm"></div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 p-4 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="group rounded-xl px-4 py-3 transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium"
            >
              <FiLogOut className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-sm">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
