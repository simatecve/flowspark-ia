
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAIApiKeys } from '@/hooks/useAIApiKeys';

const formSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'groq', 'anthropic'], {
    required_error: 'Selecciona un proveedor',
  }),
  api_key: z.string().min(10, 'La API key debe tener al menos 10 caracteres'),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface CreateAIApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAIApiKeyModal: React.FC<CreateAIApiKeyModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { createKey, isCreatingKey } = useAIApiKeys();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_key: '',
      is_active: true,
    },
  });

  const onSubmit = (values: FormData) => {
    console.log('Creating API key with values:', values);
    createKey(values);
    form.reset();
    onOpenChange(false);
  };

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'groq', label: 'Groq' },
    { value: 'anthropic', label: 'Anthropic' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar API Key de IA</DialogTitle>
          <DialogDescription>
            Agrega una nueva API key para usar con tus bots de IA
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Ingresa tu API key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Estado activo
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      La API key estará disponible para usar en tus bots
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingKey}>
                {isCreatingKey ? 'Creando...' : 'Crear API Key'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
