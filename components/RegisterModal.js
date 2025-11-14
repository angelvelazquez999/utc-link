'use client';

import { useState } from 'react';
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

export default function RegisterModal({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    matricula: '',
    carrera: '',
    cuatrimestre: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          matricula: formData.matricula,
          carrera: formData.carrera,
          cuatrimestre: parseInt(formData.cuatrimestre),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al registrarse');
      }

      setSuccess(true);
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellidos: '',
        matricula: '',
        carrera: '',
        cuatrimestre: '',
        password: '',
        confirmPassword: '',
      });

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 2000);
      
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
          <DialogTitle className="text-[#0f2755] text-2xl font-bold">Crear Cuenta</DialogTitle>
          <DialogDescription className="text-gray-600">
            Completa el formulario para crear tu cuenta
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegister} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[#0f2755] font-medium">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellidos" className="text-[#0f2755] font-medium">Apellidos</Label>
            <Input
              id="apellidos"
              name="apellidos"
              type="text"
              placeholder="Tus apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matricula" className="text-[#0f2755] font-medium">Matrícula</Label>
            <Input
              id="matricula"
              name="matricula"
              type="text"
              placeholder="Tu matrícula"
              value={formData.matricula}
              onChange={handleChange}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carrera" className="text-[#0f2755] font-medium">Carrera</Label>
            <Input
              id="carrera"
              name="carrera"
              type="text"
              placeholder="Tu carrera"
              value={formData.carrera}
              onChange={handleChange}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuatrimestre" className="text-[#0f2755] font-medium">Cuatrimestre</Label>
            <Input
              id="cuatrimestre"
              name="cuatrimestre"
              type="number"
              min="1"
              max="12"
              placeholder="Ej: 5"
              value={formData.cuatrimestre}
              onChange={handleChange}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password" className="text-[#0f2755] font-medium">Contraseña</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleChange}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#0f2755] font-medium">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirma tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border-[#0a6448]/30 focus:border-[#0a6448] focus:ring-[#0a6448] text-gray-900"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-[#0a6448] bg-green-50 p-3 rounded-md border border-[#0a6448]/30">
              ¡Cuenta creada exitosamente! Redirigiendo...
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-[#0a6448] hover:bg-[#0f2755] text-white transition-all" 
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
