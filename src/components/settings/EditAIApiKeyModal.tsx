
import React, { useEffect } from 'react';
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
import { useAIApiKeys, AIApiKey } from '@/hooks/useAIApiKeys';

const formSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'groq', 'anthropic'], {
    required_error: 'Selecciona un proveedor',
  }),
  api_key: z.string().min(10, 'La API key debe tener al menos 10 caracteres'),
  is_active: z.boolean(),
});

interface EditAIApiKeyModalProps {
  apiKey: AIApiKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAIApiKeyModal: React.FC<EditAIApiKeyModalProps> = ({
  apiKey,
  open,
  onOpenChange,
}) => {
  const { updateKey, isUpdatingKey } = useAIApiKeys();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: apiKey.provider,
      api_key: apiKey.api_key,
      is_active: apiKey.is_active,
    },
  });

  useEffect(() => {
    if (apiKey) {
      form.reset({
        provider: apiKey.provider,
        api_key: apiKey.api_key,
        is_active: apiKey.is_active,
      });
    }
  }, [apiKey, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Updating API key with values:', values);
    updateKey({ id: apiKey.id, ...values });
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
          <DialogTitle>Editar API Key de IA</DialogTitle>
          <DialogDescription>
            Modifica la información de tu API key
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
              <Button type="submit" disabled={isUpdatingKey}>
                {isUpdatingKey ? 'Actualizando...' : 'Actualizar API Key'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
