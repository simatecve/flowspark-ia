
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAIApiKeys, AIApiKey } from '@/hooks/useAIApiKeys';

const formSchema = z.object({
  api_key: z.string().min(10, 'La API key debe tener al menos 10 caracteres'),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface EditAIApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: AIApiKey;
}

export const EditAIApiKeyModal: React.FC<EditAIApiKeyModalProps> = ({
  open,
  onOpenChange,
  apiKey,
}) => {
  const { updateKey, isUpdatingKey } = useAIApiKeys();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_key: apiKey.api_key,
      is_active: apiKey.is_active,
    },
  });

  useEffect(() => {
    form.reset({
      api_key: apiKey.api_key,
      is_active: apiKey.is_active,
    });
  }, [apiKey, form]);

  const onSubmit = (values: FormData) => {
    console.log('Updating API key with values:', values);
    updateKey({
      id: apiKey.id,
      ...values,
    });
    onOpenChange(false);
  };

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      groq: 'Groq',
      anthropic: 'Anthropic',
    };
    return labels[provider] || provider;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar API Key de {getProviderLabel(apiKey.provider)}</DialogTitle>
          <DialogDescription>
            Modifica tu API key y configuraciones
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
