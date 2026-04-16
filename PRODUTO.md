# Produto & Crescimento — MEI Control

## 🏷️ Nome e Branding

### Nome escolhido: **MEI Control**

**Alternativas:**
- `NotaMEI` — direto ao ponto, fácil de lembrar
- `LimiteZero` — foco no benefício (nunca ultrapassar o limite)
- `MEI Fácil` — apela para simplicidade
- `FaturoMEI` — verbo de ação
- `Mei.io` — moderno, tech

### Identidade visual sugerida:
- **Cor primária**: Azul (#2563eb) — confiança, profissionalismo
- **Cor de alerta**: Vermelho/Laranja para limites
- **Fonte**: Inter — legível, moderna, gratuita
- **Tom de voz**: Acolhedor e direto. "Simples como deve ser."
- **Logo**: Barra de progresso + ícone de nota fiscal

---

## 📣 Estratégia de Aquisição

### 1. Instagram / Reels (orgânico — custo zero)

**Conteúdo que converte MEI:**
- "Você sabe quanto pode faturar esse mês sem ultrapassar o limite?"
- "3 erros que MEIs cometem no controle de notas"
- "Como eu controlo meu MEI em 5 minutos por semana"
- Antes/depois: planilha caótica → MEI Control

**Hashtags estratégicas:**
`#MEI #MicroempreendedorIndividual #EmpreendedorBrasileiro #CNPJ #NotaFiscal #ContabilidadeMEI #Empreendedorismo`

### 2. Tráfego Pago (Meta Ads / Google Ads)

**Público-alvo:**
- Idade: 25–45
- Interesses: Empreendedorismo, MEI, Contabilidade, Negócios
- Comportamento: Donos de negócios, autônomos

**Anúncio de alta conversão:**
> "Você sabia que se ultrapassar R$81.000 de faturamento como MEI, você pode ser enquadrado como ME e pagar muito mais impostos? Controle seu limite em tempo real. Grátis para começar."

**Custo estimado:** R$ 300–800/mês para testes iniciais

### 3. SEO / Blog

Posts para rankear no Google:
- "Limite de faturamento MEI 2024 — como não ultrapassar"
- "Como emitir nota fiscal sendo MEI"
- "MEI pode faturar quanto por mês?"
- "Calculadora de limite MEI"

### 4. Programa de Afiliados

- Comissão: 30% do primeiro mês (R$ 4,47 por conversão)
- Parceiros ideais: contadores, influencers de finanças, coaches de negócios
- Ferramenta: Integração simples via link único

### 5. Parcerias Estratégicas

- Contadores que atendem MEIs (indicam o produto aos clientes)
- Comunidades: grupos do Facebook de MEI, WhatsApp de empreendedores
- Plataformas: integração com sistemas de contabilidade

---

## 💡 Integrações Futuras (Roadmap)

### Versão 2.0
- **Emissão automática de NFS-e** via API das prefeituras
- **Integração com Conta Azul / Omie** para contabilidade
- **Calculadora de DASN** (Declaração Anual MEI)
- **Notificações WhatsApp** via Twilio/Z-API

### Versão 3.0
- **App mobile** (React Native / Expo)
- **Multiusuário** (contador + cliente)
- **Controle de despesas** e lucro líquido
- **Geração de DAS** (boleto mensal MEI)
- **Relatório para o contador** em PDF

---

## 🔒 Retenção de Usuários

### Gatilhos de engajamento:
1. **E-mail mensal**: "Você faturou X este mês. Restam Y para o limite."
2. **Alerta por e-mail**: Quando atingir 50%, 80%, 95%
3. **Relatório de fim de ano**: "Seu ano em números — parabéns!"
4. **Onboarding guiado**: Tutorial passo a passo na primeira semana

### Anti-churn:
- **Período de graça**: 7 dias Pro após cancelamento antes do downgrade
- **Pause de assinatura**: Para MEIs que pararam temporariamente
- **Desconto de retorno**: 50% no primeiro mês para quem cancela

### Métricas de sucesso:
- MRR (Receita Mensal Recorrente)
- Churn rate < 5%/mês
- NPS > 50
- Notas criadas/usuário/mês (proxy de engajamento)

---

## 💰 Projeção Financeira (12 meses)

| Mês | Usuários Free | Usuários Pro | MRR        |
|-----|---------------|--------------|------------|
| 1   | 50            | 5            | R$ 74,50   |
| 3   | 200           | 30           | R$ 447     |
| 6   | 600           | 100          | R$ 1.490   |
| 9   | 1.200         | 250          | R$ 3.725   |
| 12  | 2.500         | 600          | R$ 8.940   |

> Taxa de conversão estimada: 10–15% free → pro  
> Custo de infraestrutura (Supabase + Vercel + Stripe): < R$ 150/mês até 10k usuários

---

## 📊 Métricas para acompanhar

```
MRR           = usuários_pro × 14,90
ARR           = MRR × 12
Churn         = cancelamentos / usuários_pro (por mês)
CAC           = gasto_marketing / novos_clientes_pagos
LTV           = 14,90 / churn_rate
LTV/CAC       > 3 = negócio saudável
```
