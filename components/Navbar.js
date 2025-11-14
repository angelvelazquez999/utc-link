'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f2755] backdrop-blur-md border-b border-[#0a6448]/20 shadow-sm">
        <div className="max-w-8xl mx-auto px-5 sm:px-8 lg:px-9">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center">
              {/* <Image
                src="images/logo_mini.png"
                alt="Logo"
                width={70}
                height={70}
                className="object-contain"
                unoptimized
              /> */}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 bg-[#064f38] hover:bg-[#033022] text-white transition-all"
              >
                <FiLogIn className="w-4 h-4" />
                Iniciar Sesión
              </Button>
              <Button
                size="sm"
                onClick={() => setRegisterOpen(true)}
                className="flex items-center gap-2 bg-[#064f38] hover:bg-[#033022] text-white transition-all"
              >
                <FiUserPlus className="w-4 h-4" />
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  );
}
