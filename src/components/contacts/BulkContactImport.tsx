
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import type { CreateContactData } from '@/types/contacts';

interface BulkContactImportProps {
  onContactsImported?: () => void;
}

export const BulkContactImport = ({ onContactsImported }: BulkContactImportProps) => {
  const [textInput, setTextInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { createContact, isCreatingContact } = useContacts();

  const parseContactText = (text: string): CreateContactData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const contacts: CreateContactData[] = [];
    const parseErrors: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Try different formats
      // Format 1: "Name, +1234567890"
      // Format 2: "Name,+1234567890"  
      // Format 3: "Name +1234567890"
      // Format 4: "Name | +1234567890"
      
      let match = trimmedLine.match(/^(.+?)[,|\s]+([+]?\d[\d\s\-\(\)]{7,})$/);
      
      if (match) {
        const name = match[1].trim();
        const phone = match[2].replace(/[\s\-\(\)]/g, ''); // Clean phone number
        
        if (name && phone) {
          // Check if phone has at least 7 digits
          if (phone.replace(/[^\d]/g, '').length >= 7) {
            contacts.push({
              name,
              phone_number: phone,
            });
          } else {
            parseErrors.push(`Línea ${index + 1}: Número de teléfono inválido - ${phone}`);
          }
        } else {
          parseErrors.push(`Línea ${index + 1}: Formato incorrecto - ${trimmedLine}`);
        }
      } else {
        parseErrors.push(`Línea ${index + 1}: No se pudo parsear - ${trimmedLine}`);
      }
    });

    setErrors(parseErrors);
    return contacts;
  };

  const handleImport = async () => {
    if (!textInput.trim()) {
      setErrors(['Ingresa el texto con los contactos']);
      return;
    }

    setIsProcessing(true);
    setErrors([]);
    setSuccessCount(0);

    const contacts = parseContactText(textInput);
    
    if (contacts.length === 0) {
      setIsProcessing(false);
      return;
    }

    let imported = 0;
    const importErrors: string[] = [];

    // Import contacts one by one
    for (const contact of contacts) {
      try {
        await new Promise<void>((resolve, reject) => {
          createContact(contact, {
            onSuccess: () => {
              imported++;
              resolve();
            },
            onError: (error: any) => {
              importErrors.push(`Error al crear ${contact.name}: ${error.message}`);
              reject(error);
            }
          });
        });
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Error already handled in onError
      }
    }

    setSuccessCount(imported);
    setErrors(prev => [...prev, ...importErrors]);
    setIsProcessing(false);

    if (imported > 0) {
      setTextInput('');
      onContactsImported?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Contactos en Lote
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="contact-text">
            Pega el texto con los contactos (uno por línea)
          </Label>
          <Textarea
            id="contact-text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Ejemplo:
Juan Pérez, +1234567890
María García, +0987654321
Pedro López | +1122334455
Ana Martín +5566778899`}
            className="min-h-[120px] mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Formatos soportados: "Nombre, Teléfono" o "Nombre | Teléfono" o "Nombre Teléfono"
          </p>
        </div>

        {successCount > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡{successCount} contactos importados exitosamente!
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Errores encontrados:</div>
                {errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="text-sm">• {error}</div>
                ))}
                {errors.length > 5 && (
                  <div className="text-sm">... y {errors.length - 5} errores más</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleImport}
          disabled={isProcessing || isCreatingContact || !textInput.trim()}
          className="w-full"
        >
          {isProcessing ? 'Procesando...' : 'Importar Contactos'}
        </Button>
      </CardContent>
    </Card>
  );
};
