-- ============================================================
-- MEI Control - Schema completo com RLS
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Espelha auth.users com dados do plano e Stripe
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  plano           TEXT NOT NULL DEFAULT 'free' CHECK (plano IN ('free', 'pro')),
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  subscription_status     TEXT DEFAULT 'inactive',
  -- Armazena o ano de reset para controle anual
  ano_referencia  INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários descritivos
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários MEI com dados de assinatura';
COMMENT ON COLUMN public.profiles.plano IS 'Plano atual: free ou pro';
COMMENT ON COLUMN public.profiles.ano_referencia IS 'Ano fiscal corrente para reset do faturamento';

-- ============================================================
-- TABELA: notas_fiscais
-- Registro de todas as notas emitidas pelo MEI
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notas_fiscais (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valor       NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
  data        DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao   TEXT,
  numero_nf   TEXT,  -- número da nota fiscal (opcional, para referência)
  cliente     TEXT,  -- nome do cliente/tomador
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notas_fiscais IS 'Notas fiscais emitidas pelo MEI';

-- ============================================================
-- TABELA: historico_anual
-- Guarda o faturamento de anos anteriores após o reset
-- ============================================================
CREATE TABLE IF NOT EXISTS public.historico_anual (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ano         INT NOT NULL,
  total       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  qtd_notas   INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ano)
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_user_id   ON public.notas_fiscais(user_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_data       ON public.notas_fiscais(data);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_user_data  ON public.notas_fiscais(user_id, data);
CREATE INDEX IF NOT EXISTS idx_historico_user_ano       ON public.historico_anual(user_id, ano);

-- ============================================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_notas_updated_at
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- FUNÇÃO: criar perfil automaticamente ao cadastrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNÇÃO: calcular total faturado no ano corrente
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_faturamento_anual(p_user_id UUID, p_ano INT DEFAULT NULL)
RETURNS NUMERIC AS $$
DECLARE
  v_ano INT;
  v_total NUMERIC;
BEGIN
  v_ano := COALESCE(p_ano, EXTRACT(YEAR FROM NOW())::INT);

  SELECT COALESCE(SUM(valor), 0)
  INTO v_total
  FROM public.notas_fiscais
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM data) = v_ano;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNÇÃO: calcular notas emitidas no mês
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_notas_mes_atual(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.notas_fiscais
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM data)  = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM NOW());

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_anual ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário vê/edita apenas seu próprio perfil
CREATE POLICY "profiles: select proprio" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: update proprio" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Notas fiscais: CRUD apenas nas próprias notas
CREATE POLICY "notas: select proprio" ON public.notas_fiscais
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notas: insert proprio" ON public.notas_fiscais
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notas: update proprio" ON public.notas_fiscais
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notas: delete proprio" ON public.notas_fiscais
  FOR DELETE USING (auth.uid() = user_id);

-- Histórico: somente leitura do próprio
CREATE POLICY "historico: select proprio" ON public.historico_anual
  FOR SELECT USING (auth.uid() = user_id);

-- Service role ignora RLS (necessário para webhooks do Stripe)
-- As funções com SECURITY DEFINER rodam como superuser, ok para webhooks

-- ============================================================
-- VIEW: dashboard_summary (facilita queries no front)
-- ============================================================
CREATE OR REPLACE VIEW public.dashboard_summary AS
SELECT
  p.id AS user_id,
  p.plano,
  p.ano_referencia,
  -- Faturamento ano corrente
  COALESCE(SUM(nf.valor) FILTER (
    WHERE EXTRACT(YEAR FROM nf.data) = EXTRACT(YEAR FROM NOW())
  ), 0) AS total_ano,
  -- Quantidade de notas no ano
  COUNT(nf.id) FILTER (
    WHERE EXTRACT(YEAR FROM nf.data) = EXTRACT(YEAR FROM NOW())
  ) AS qtd_notas_ano,
  -- Quantidade de notas no mês atual
  COUNT(nf.id) FILTER (
    WHERE EXTRACT(YEAR FROM nf.data)  = EXTRACT(YEAR FROM NOW())
    AND   EXTRACT(MONTH FROM nf.data) = EXTRACT(MONTH FROM NOW())
  ) AS qtd_notas_mes,
  -- Percentual do limite MEI usado (limite: R$ 81.000)
  ROUND(
    COALESCE(SUM(nf.valor) FILTER (
      WHERE EXTRACT(YEAR FROM nf.data) = EXTRACT(YEAR FROM NOW())
    ), 0) / 81000 * 100, 2
  ) AS percentual_limite
FROM public.profiles p
LEFT JOIN public.notas_fiscais nf ON nf.user_id = p.id
GROUP BY p.id, p.plano, p.ano_referencia;

-- RLS na view via função
ALTER VIEW public.dashboard_summary OWNER TO authenticated;

-- ============================================================
-- GRANT de permissões
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.notas_fiscais TO authenticated;
GRANT SELECT ON public.historico_anual TO authenticated;
GRANT SELECT ON public.dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_faturamento_anual TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_notas_mes_atual TO authenticated;
