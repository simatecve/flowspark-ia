
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWebhookSender = () => {
  const { toast } = useToast();

  const { data: messageWebhook } = useQuery({
    queryKey: ['webhook-enviar-mensaje'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('url')
        .eq('name', 'Enviar Mensaje CRM')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Error fetching webhook:', error);
        return null;
      }

      return data.url;
    },
  });

  const sendWebhook = async (data: {
    instance_name: string;
    whatsapp_number: string;
    message: string;
    attachment_url?: string;
  }) => {
    if (!messageWebhook) {
      console.error('No webhook URL available');
      toast({
        title: "Error",
        description: "No se pudo obtener la configuración del webhook",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Sending webhook to:', messageWebhook, 'with data:', data);

      const response = await fetch(messageWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instance_name: data.instance_name,
          whatsapp_number: data.whatsapp_number,
          message: data.message,
          attachment_url: data.attachment_url || null,
          has_attachment: !!data.attachment_url,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error response:', response.status, errorText);
        toast({
          title: "Error en webhook",
          description: `Error ${response.status}: ${errorText}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Webhook sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending webhook:', error);
      toast({
        title: "Error",
        description: "Error al enviar el webhook. Revisa la consola para más detalles.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    sendWebhook,
    isWebhookReady: !!messageWebhook,
  };
};
