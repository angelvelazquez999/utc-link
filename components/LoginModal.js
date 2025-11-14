'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginModal({ open, onOpenChange }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // Crear los datos en formato x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', '');

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // Guardar el token en localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);

      // Cerrar modal y redirigir
      onOpenChange(false);
      router.push('/dashboard'); // Cambiar a la ruta que necesites
      
      // Limpiar formulario
      setUsername('');
      setPassword('');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border-[#0a6448]/20">
        <DialogHeader>
          <DialogTitle className="text-[#0f2755] text-2xl font-bold">Iniciar Sesión</DialogTitle>
          <DialogDescription className="text-gray-600">
            Ingresa tus credenciales para acceder a tu cuenta
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#0f2755] font-medium">Usuario</Label>
            <Input
              id="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0f2755] font-medium">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-[#0a6448] hover:bg-[#0f2755] text-white transition-all" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
