
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, File, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AttachmentFile {
  url: string;
  name: string;
}

interface FileUploadProps {
  attachments: AttachmentFile[];
  onAttachmentsChange: (attachments: AttachmentFile[]) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  attachments, 
  onAttachmentsChange, 
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    setIsUploading(true);
    const newAttachments: AttachmentFile[] = [];

    try {
      for (const file of files) {
        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Tipo de archivo no válido",
            description: `${file.name} no es un tipo de archivo permitido. Solo se permiten imágenes y PDFs.`,
            variant: "destructive",
          });
          continue;
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Archivo muy grande",
            description: `${file.name} es muy grande. El tamaño máximo es 10MB.`,
            variant: "destructive",
          });
          continue;
        }

        // Crear nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
          .from('campaign-attachments')
          .upload(fileName, file);

        if (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Error al subir archivo",
            description: `Error al subir ${file.name}: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Obtener URL pública del archivo
        const { data: publicUrlData } = supabase.storage
          .from('campaign-attachments')
          .getPublicUrl(fileName);

        newAttachments.push({
          url: publicUrlData.publicUrl,
          name: file.name
        });
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
        toast({
          title: "Archivos subidos",
          description: `Se subieron ${newAttachments.length} archivo(s) correctamente.`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Error inesperado al subir los archivos.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];
    
    try {
      // Extraer el nombre del archivo de la URL
      const url = new URL(attachment.url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const fullPath = `${user?.id}/${fileName}`;

      // Eliminar archivo de Supabase Storage
      const { error } = await supabase.storage
        .from('campaign-attachments')
        .remove([fullPath]);

      if (error) {
        console.error('Error deleting file:', error);
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }

    // Actualizar lista de adjuntos
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(updatedAttachments);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Adjuntos</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Sube imágenes (JPG, PNG, GIF, WebP) o archivos PDF. Máximo 10MB por archivo.
        </p>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleFileSelect}
          disabled={disabled || isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Subiendo...' : 'Seleccionar archivos'}
        </Button>

        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Archivos adjuntados:</Label>
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {getFileIcon(attachment.name)}
                <span className="text-sm truncate max-w-[200px]" title={attachment.name}>
                  {attachment.name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
