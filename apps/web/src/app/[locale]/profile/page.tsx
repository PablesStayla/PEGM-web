'use client';

import { createClient } from '@pranakaia/auth/client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  useToast,
} from '@pranakaia/ui';
import { LogOut, Save, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getProfile, updateProfile } from '@/app/actions/profile';

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const result = await getProfile();

    if (result.success) {
      setProfile(result.data);
      setEditData(result.data);
      setError(null);
    } else {
      setError(result.error);
      // Not authenticated — redirect to login
      router.push('/login?callbackUrl=/profile');
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!editData.firstName || !editData.lastName) {
      return;
    }
    setIsSaving(true);

    const result = await updateProfile({
      firstName: editData.firstName,
      lastName: editData.lastName,
      phone: editData.phone,
    });

    if (result.success) {
      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos se guardaron correctamente',
      });
      setProfile((prev) => (prev ? { ...prev, ...editData } : prev));
      setIsEditing(false);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditData(profile || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">{error || 'Error al cargar el perfil'}</p>
        </div>
      </div>
    );
  }

  const displayName =
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email;
  const initials = (profile.firstName?.[0] || profile.email?.[0] || 'U').toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Mi Perfil</h1>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#1a4d2e]" />
              Información Personal
            </CardTitle>
            <CardDescription>Gestiona tu información personal y preferencias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar + Name */}
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-linear-to-br from-[#1a4d2e] to-[#2d6b45] flex items-center justify-center text-2xl font-bold text-white shadow-md">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
                <p className="text-gray-500">{profile.email}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={isEditing ? editData.firstName || '' : profile.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={isEditing ? editData.lastName || '' : profile.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={isEditing ? editData.phone || '' : profile.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="ghost"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-[#1a4d2e] hover:bg-[#2d6b45]"
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Guardando...
                        </span>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#1a4d2e] hover:bg-[#2d6b45]"
                  >
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
