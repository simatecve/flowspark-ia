
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLeadColumns } from '@/hooks/useLeadColumns';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  color: z.string().min(1, 'El color es requerido'),
});

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createColumn, isCreating } = useLeadColumns();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      color: '#3b82f6',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Ensure the values conform to CreateLeadColumnData type
    const columnData = {
      name: values.name,
      color: values.color,
    };
    createColumn(columnData);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const predefinedColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Columna</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la columna</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: En progreso, Cerrado..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input type="color" {...field} className="w-20 h-10" />
                      <div className="grid grid-cols-6 gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded border-2 ${
                              field.value === color ? 'border-foreground' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => field.onChange(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creando...' : 'Crear Columna'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
