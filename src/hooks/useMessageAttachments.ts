
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useMessageAttachments = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para subir archivos",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
        'application/pdf', 'video/mp4', 'audio/mpeg', 'audio/wav', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten imágenes, PDFs, videos, audios y documentos.",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El tamaño máximo permitido es 10MB.",
          variant: "destructive",
        });
        return null;
      }

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Error al subir archivo",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Obtener URL pública del archivo
      const { data: publicUrlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente.",
      });

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Error inesperado al subir el archivo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (url: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Extraer el nombre del archivo de la URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const fullPath = `${user.id}/${fileName}`;

      // Eliminar archivo de Supabase Storage
      const { error } = await supabase.storage
        .from('message-attachments')
        .remove([fullPath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing file:', error);
      return false;
    }
  };

  return {
    uploadFile,
    removeFile,
    isUploading,
  };
};
