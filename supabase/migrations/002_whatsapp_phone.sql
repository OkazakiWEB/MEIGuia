-- ============================================================
-- Migration: adiciona whatsapp_phone ao profiles
-- Executar em: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT DEFAULT NULL;

COMMENT ON COLUMN public.profiles.whatsapp_phone IS 'Celular para alertas via WhatsApp (somente dígitos, com DDD)';
