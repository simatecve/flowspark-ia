
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Play, Pause, MessageSquare, Paperclip } from 'lucide-react';
import { useMassCampaigns } from '@/hooks/useMassCampaigns';

export const CampaignsList = () => {
  const { campaigns, isLoadingCampaigns, deleteCampaign, isDeletingCampaign } = useMassCampaigns();

  const handleDelete = (campaignId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      deleteCampaign(campaignId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'paused':
        return 'Pausada';
      case 'completed':
        return 'Completada';
      default:
        return 'Borrador';
    }
  };

  if (isLoadingCampaigns) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Cargando campañas...</div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay campañas creadas</h3>
          <p className="text-muted-foreground text-center">
            Crea tu primera campaña masiva para enviar mensajes automáticos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {campaign.name}
                {campaign.attachment_urls && campaign.attachment_urls.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {campaign.attachment_urls.length}
                  </Badge>
                )}
              </CardTitle>
              <Badge variant={getStatusColor(campaign.status)}>
                {getStatusText(campaign.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaign.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Descripción:</div>
                  <div className="text-sm">{campaign.description}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground">Instancia WhatsApp:</div>
                <div className="text-sm">{campaign.whatsapp_connection_name}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Mensaje:</div>
                <div className="text-sm bg-muted p-2 rounded-md mt-1 max-h-20 overflow-y-auto">
                  {campaign.campaign_message}
                </div>
              </div>

              {campaign.attachment_urls && campaign.attachment_urls.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Adjuntos:</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {campaign.attachment_names?.map((name, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Paperclip className="h-3 w-3 mr-1" />
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Delay:</span> {campaign.min_delay}ms - {campaign.max_delay}ms
                </div>
                <div>
                  <span className="font-medium">IA:</span> {campaign.edit_with_ai ? 'Habilitada' : 'Deshabilitada'}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Creada: {new Date(campaign.created_at).toLocaleDateString()}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {campaign.status === 'draft' && (
                  <Button variant="default" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Iniciar
                  </Button>
                )}
                
                {campaign.status === 'active' && (
                  <Button variant="secondary" size="sm">
                    <Pause className="h-4 w-4 mr-1" />
                    Pausar
                  </Button>
                )}

                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(campaign.id)}
                  disabled={isDeletingCampaign}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
