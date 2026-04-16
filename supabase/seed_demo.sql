-- ============================================================
-- Portal MEIguia — Seed de Usuário Demo
-- ============================================================
-- IMPORTANTE: Execute APÓS o schema.sql e após criar o usuário
-- demo@meiguia.com.br no painel Authentication do Supabase.
--
-- Passos:
--   1. Supabase Dashboard → Authentication → Users → Add User
--      Email:  demo@meiguia.com.br
--      Senha:  demo123456
--      Marcar "Auto Confirm User"
--   2. Copie o UUID gerado e substitua abaixo em DEMO_USER_ID
--   3. Execute este script no SQL Editor
-- ============================================================

DO $$
DECLARE
  -- ⬇️ Substitua pelo UUID real do usuário criado no passo 1
  DEMO_USER_ID UUID := '00000000-0000-0000-0000-000000000001';
  ano_atual    INT  := EXTRACT(YEAR FROM NOW())::INT;
BEGIN

  -- ── Atualizar perfil ─────────────────────────────────────────────────────
  UPDATE public.profiles
  SET
    full_name = 'João Demo Silva',
    plano     = 'pro',
    subscription_status = 'active'
  WHERE id = DEMO_USER_ID;

  -- ── Notas fiscais do ano atual (distribuídas nos meses) ──────────────────
  -- Janeiro
  INSERT INTO public.notas_fiscais (user_id, valor, data, descricao, cliente, numero_nf) VALUES
    (DEMO_USER_ID, 4500.00, make_date(ano_atual,1,8),  'Desenvolvimento de website',        'TechStart Ltda',     '00001'),
    (DEMO_USER_ID, 2800.00, make_date(ano_atual,1,15), 'Consultoria em marketing digital',   'Loja do Bairro ME',  '00002'),
    (DEMO_USER_ID, 1200.00, make_date(ano_atual,1,22), 'Criação de identidade visual',       'João Artesão',       '00003');

  -- Fevereiro
  INSERT INTO public.notas_fiscais (user_id, valor, data, descricao, cliente, numero_nf) VALUES
    (DEMO_USER_ID, 5200.00, make_date(ano_atual,2,5),  'Sistema de gestão personalizado',    'Padaria Central',    '00004'),
    (DEMO_USER_ID, 1800.00, make_date(ano_atual,2,14), 'Manutenção de site',                 'Academia Fit',       '00005'),
    (DEMO_USER_ID, 3400.00, make_date(ano_atual,2,25), 'Treinamento em ferramentas digitais','Consultório Dr. Ana','00006');

  -- Março
  INSERT INTO public.notas_fiscais (user_id, valor, data, descricao, cliente, numero_nf) VALUES
    (DEMO_USER_ID, 6800.00, make_date(ano_atual,3,10), 'Projeto e-commerce completo',        'Moda Bella ME',      '00007'),
    (DEMO_USER_ID, 2100.00, make_date(ano_atual,3,18), 'Fotografia corporativa',             'RH Solutions',       '00008'),
    (DEMO_USER_ID, 1500.00, make_date(ano_atual,3,28), 'Edição de vídeo institucional',      'Auto Peças Norte',   '00009');

  -- Abril
  INSERT INTO public.notas_fiscais (user_id, valor, data, descricao, cliente, numero_nf) VALUES
    (DEMO_USER_ID, 4900.00, make_date(ano_atual,4,3),  'Consultoria financeira MEI',         'Costureira Silva',   '00010'),
    (DEMO_USER_ID, 3300.00, make_date(ano_atual,4,12), 'Desenvolvimento de aplicativo',      'Delivery Local',     '00011'),
    (DEMO_USER_ID, 2700.00, make_date(ano_atual,4,20), 'Suporte técnico mensal',             'Escritório Contábil','00012');

  -- Maio
  INSERT INTO public.notas_fiscais (user_id, valor, data, descricao, cliente, numero_nf) VALUES
    (DEMO_USER_ID, 5600.00, make_date(ano_atual,5,7),  'Redação de conteúdo SEO',            'Blog Gourmet',       '00013'),
    (DEMO_USER_ID, 1900.00, make_date(ano_atual,5,15), 'Design de embalagens',               'Doces da Vovó',      '00014'),
    (DEMO_USER_ID, 4100.00, make_date(ano_atual,5,29), 'Automação de planilhas',             'Distribuidora Sul',  '00015');

  -- Junho
  INSERT INTO public.notas_fiscais (user_id, valor, data, descricao, cliente, numero_nf) VALUES
    (DEMO_USER_ID, 7200.00, make_date(ano_atual,6,4),  'Projeto completo de branding',       'Startup GreenTech',  '00016'),
    (DEMO_USER_ID, 2400.00, make_date(ano_atual,6,19), 'Criação de landing page',            'Imobiliária Certo',  '00017'),
    (DEMO_USER_ID, 3800.00, make_date(ano_atual,6,27), 'Gestão de redes sociais (3 meses)',  'Barbearia Style',    '00018');

  RAISE NOTICE 'Seed demo concluído com sucesso!';
  RAISE NOTICE 'Total inserido: verificar no dashboard';

END $$;
