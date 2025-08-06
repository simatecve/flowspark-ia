
-- Insertar el webhook para generar código QR en la base de datos
INSERT INTO webhooks (name, url, function_description, is_active)
VALUES (
    'Generar Código QR WhatsApp',
    'https://n8nargentina.nocodeveloper.com/webhook/qr_instancia',
    'Webhook para generar código QR para conectar instancias de WhatsApp',
    true
);
