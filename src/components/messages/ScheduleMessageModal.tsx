
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, CalendarIcon } from 'lucide-react';
import { format, addMinutes, startOfMinute } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useScheduledMessages } from '@/hooks/useScheduledMessages';

interface ScheduleMessageModalProps {
  instanceName: string;
  whatsappNumber: string;
  pushname?: string;
}

export const ScheduleMessageModal = ({ instanceName, whatsappNumber, pushname }: ScheduleMessageModalProps) => {
  const { createScheduledMessage, isCreating } = useScheduledMessages();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');

  const handleSchedule = () => {
    if (!message.trim() || !selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    // Verificar que la fecha sea futura
    if (scheduledDateTime <= new Date()) {
      return;
    }

    createScheduledMessage({
      instance_name: instanceName,
      whatsapp_number: whatsappNumber,
      pushname,
      message: message.trim(),
      scheduled_for: scheduledDateTime.toISOString(),
    });

    // Reset form
    setMessage('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setIsOpen(false);
  };

  // Generar opciones de tiempo (cada 15 minutos)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Obtener la fecha mínima (hoy + 5 minutos)
  const minDateTime = addMinutes(startOfMinute(new Date()), 5);
  const today = new Date();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Programar mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Programar mensaje</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Para: {pushname || whatsappNumber}</Label>
            <p className="text-sm text-muted-foreground">Instancia: {instanceName}</p>
          </div>

          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={4}
            />
          </div>

          <div>
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: es })
                  ) : (
                    "Selecciona una fecha"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="time">Hora</Label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="">Selecciona una hora</option>
              {timeOptions.map((time) => {
                const [hours, minutes] = time.split(':').map(Number);
                const timeDate = new Date(selectedDate || today);
                timeDate.setHours(hours, minutes, 0, 0);
                
                // Deshabilitar tiempos pasados si es hoy
                const isDisabled = selectedDate && 
                  selectedDate.toDateString() === today.toDateString() && 
                  timeDate <= minDateTime;

                return (
                  <option key={time} value={time} disabled={isDisabled}>
                    {time}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSchedule}
              disabled={!message.trim() || !selectedDate || !selectedTime || isCreating}
            >
              {isCreating ? 'Programando...' : 'Programar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
