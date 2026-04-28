-- ============================================================
-- Migration: adiciona plano "premium" e ajusta limites de notas
-- Executar em: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Adicionar 'premium' ao CHECK constraint do campo plano
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plano_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plano_check
  CHECK (plano IN ('free', 'pro', 'premium'));

COMMENT ON COLUMN public.profiles.plano IS 'Plano atual: free, pro ou premium';

-- 2. Criar/substituir trigger que limita notas por plano
--    free: 5/mês | pro: 30/mês | premium: ilimitado
CREATE OR REPLACE FUNCTION public.check_notas_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plano  TEXT;
  v_count  INT;
  v_limite INT;
BEGIN
  -- Buscar plano do usuário
  SELECT plano INTO v_plano
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Premium não tem limite
  IF v_plano = 'premium' THEN
    RETURN NEW;
  END IF;

  -- Definir limite por plano
  v_limite := CASE v_plano
    WHEN 'pro'  THEN 30
    ELSE 5  -- free ou qualquer outro
  END;

  -- Contar notas do mês corrente
  SELECT COUNT(*) INTO v_count
  FROM public.notas_fiscais
  WHERE user_id = NEW.user_id
    AND EXTRACT(YEAR  FROM data) = EXTRACT(YEAR  FROM NOW())
    AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM NOW());

  IF v_count >= v_limite THEN
    RAISE EXCEPTION 'NOTAS_LIMIT_EXCEEDED: limite de % notas/mês atingido para o plano %', v_limite, v_plano;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger (DROP primeiro para evitar duplicata)
DROP TRIGGER IF EXISTS trigger_check_notas_limit ON public.notas_fiscais;

CREATE TRIGGER trigger_check_notas_limit
  BEFORE INSERT ON public.notas_fiscais
  FOR EACH ROW EXECUTE FUNCTION public.check_notas_limit();
