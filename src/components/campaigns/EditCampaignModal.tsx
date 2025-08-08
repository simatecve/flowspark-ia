
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload, type AttachmentFile } from './FileUpload';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';
import { useContactLists } from '@/hooks/useContactLists';
import { useMassCampaigns, type MassCampaign } from '@/hooks/useMassCampaigns';

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: MassCampaign | null;
}

export const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  const [name, setName] = useState(campaign?.name || '');
  const [description, setDescription] = useState(campaign?.description || '');
  const [whatsappConnection, setWhatsappConnection] = useState(campaign?.whatsapp_connection_name || '');
  const [contactList, setContactList] = useState(campaign?.contact_list_id || '');
  const [message, setMessage] = useState(campaign?.campaign_message || '');
  const [editWithAI, setEditWithAI] = useState(campaign?.edit_with_ai || false);
  const [minDelay, setMinDelay] = useState(campaign?.min_delay?.toString() || '1000');
  const [maxDelay, setMaxDelay] = useState(campaign?.max_delay?.toString() || '5000');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const { connections } = useWhatsAppConnections();
  const { contactLists } = useContactLists();
  const { updateCampaign, isUpdatingCampaign } = useMassCampaigns();

  // Actualizar estado cuando cambie la campaña
  React.useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description || '');
      setWhatsappConnection(campaign.whatsapp_connection_name);
      setContactList(campaign.contact_list_id || '');
      setMessage(campaign.campaign_message);
      setEditWithAI(campaign.edit_with_ai);
      setMinDelay(campaign.min_delay.toString());
      setMaxDelay(campaign.max_delay.toString());
      
      // Convertir los arrays de URLs y nombres a AttachmentFile[]
      const campaignAttachments: AttachmentFile[] = [];
      if (campaign.attachment_urls && campaign.attachment_names) {
        for (let i = 0; i < campaign.attachment_urls.length; i++) {
          if (campaign.attachment_urls[i] && campaign.attachment_names[i]) {
            campaignAttachments.push({
              url: campaign.attachment_urls[i],
              name: campaign.attachment_names[i]
            });
          }
        }
      }
      setAttachments(campaignAttachments);
    }
  }, [campaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaign || !name.trim() || !whatsappConnection || !message.trim()) {
      return;
    }

    const minDelayNum = parseInt(minDelay, 10);
    const maxDelayNum = parseInt(maxDelay, 10);

    if (isNaN(minDelayNum) || isNaN(maxDelayNum) || minDelayNum <= 0 || maxDelayNum <= minDelayNum) {
      alert('Por favor, ingresa valores válidos para los delays (números enteros positivos, máximo > mínimo)');
      return;
    }

    // Convertir AttachmentFile[] a arrays separados
    const attachmentUrls = attachments.map(att => att.url);
    const attachmentNames = attachments.map(att => att.name);

    updateCampaign({
      id: campaign.id,
      name: name.trim(),
      description: description.trim() || undefined,
      whatsapp_connection_name: whatsappConnection,
      contact_list_id: contactList || undefined,
      campaign_message: message.trim(),
      edit_with_ai: editWithAI,
      min_delay: minDelayNum,
      max_delay: maxDelayNum,
      attachment_urls: attachmentUrls,
      attachment_names: attachmentNames,
    });

    onClose();
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Campaña Masiva</DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu campaña de mensajes masivos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la campaña *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi campaña masiva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-connection">Instancia de WhatsApp *</Label>
              <Select value={whatsappConnection} onValueChange={setWhatsappConnection}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una instancia" />
                </SelectTrigger>
                <SelectContent>
                  {connections?.map((connection) => (
                    <SelectItem key={connection.id} value={connection.name}>
                      {connection.name} ({connection.phone_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional de la campaña"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-list">Lista de contactos (opcional)</Label>
            <Select value={contactList} onValueChange={setContactList}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una lista de contactos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin lista específica</SelectItem>
                {contactLists?.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje de la campaña *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="min-h-[100px]"
              required
            />
          </div>

          <FileUpload
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            disabled={isUpdatingCampaign}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-with-ai"
              checked={editWithAI}
              onCheckedChange={setEditWithAI}
            />
            <Label htmlFor="edit-with-ai">Personalizar mensajes con IA</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-delay">Delay mínimo (ms)</Label>
              <Input
                id="min-delay"
                type="number"
                value={minDelay}
                onChange={(e) => setMinDelay(e.target.value)}
                placeholder="1000"
                min="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-delay">Delay máximo (ms)</Label>
              <Input
                id="max-delay"
                type="number"
                value={maxDelay}
                onChange={(e) => setMaxDelay(e.target.value)}
                placeholder="5000"
                min="100"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdatingCampaign}>
              {isUpdatingCampaign ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
