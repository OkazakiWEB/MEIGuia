-- ============================================================
-- Migration: preferências de notificação no profiles
-- Executar em: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notif_email     BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_whatsapp  BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.profiles.notif_email    IS 'Receber alertas por e-mail';
COMMENT ON COLUMN public.profiles.notif_whatsapp IS 'Receber alertas por WhatsApp (Premium)';
