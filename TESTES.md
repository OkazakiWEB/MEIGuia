# Guia de Testes — MEI Control

## Cartões de teste Stripe

| Cenário              | Número do cartão       | CVC   | Validade |
|----------------------|------------------------|-------|----------|
| Pagamento aprovado   | `4242 4242 4242 4242`  | Qualquer | Qualquer futura |
| Cartão recusado      | `4000 0000 0000 0002`  | Qualquer | Qualquer futura |
| Autenticação 3DS     | `4000 0025 0000 3155`  | Qualquer | Qualquer futura |
| Fundos insuficientes | `4000 0000 0000 9995`  | Qualquer | Qualquer futura |

> Use qualquer CEP/nome para preencher os campos do Checkout Stripe.

---

## Fluxos a testar

### ✅ Autenticação

1. **Cadastro** → `/cadastro` → criar conta com e-mail e senha
2. Verificar e-mail de confirmação (ou desabilitar confirmação no Supabase para dev)
3. **Login** → `/login` → entrar com as credenciais
4. **Logout** → clicar em "Sair" na sidebar
5. **Acesso protegido** → tentar acessar `/dashboard` sem login → deve redirecionar para `/login`

### ✅ Notas Fiscais

1. Criar nota → `/notas/nova` → preencher todos os campos
2. Verificar que aparece no dashboard e na listagem
3. Editar nota → clicar no ícone de edição
4. Excluir nota → clicar no ícone de lixeira
5. Verificar que o faturamento no dashboard atualiza
6. **Limite free**: criar 20 notas no mês → a 21ª deve ser bloqueada

### ✅ Dashboard

1. Verificar barra de progresso do limite MEI
2. Verificar alertas (50%, 80%, 100%, excedido)
3. Verificar gráfico mensal
4. **Plano free**: previsão de faturamento deve aparecer bloqueada (ProGate)
5. **Plano pro**: previsão deve ser exibida

### ✅ Assinatura Stripe

#### Assinando o plano Pro:
1. Ir para `/assinatura`
2. Clicar em "Assinar Pro"
3. Usar cartão `4242 4242 4242 4242`
4. Confirmar redirecionamento de volta com `?success=true`
5. Verificar que o perfil mudou para `plano = pro` no Supabase

#### Verificar webhook:
No terminal com Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```
Você deve ver os eventos `customer.subscription.created` e `invoice.paid`.

#### Gerenciar assinatura:
1. Clicar em "Gerenciar assinatura"
2. Verificar redirecionamento para o portal Stripe
3. No portal, testar cancelamento

#### Após cancelamento:
1. Verificar que o webhook `customer.subscription.deleted` foi recebido
2. Verificar que `plano` voltou para `free` no Supabase

### ✅ Exportação (plano Pro)

1. Com plano Pro ativo, ir para `/notas`
2. Clicar em "Excel" → arquivo `.xlsx` deve ser baixado
3. Clicar em "CSV" → arquivo `.csv` deve ser baixado
4. Com plano free, os botões devem estar desabilitados/mostrar Pro

---

## Testar regras de negócio

### Alertas de faturamento:
Crie notas com os valores abaixo e verifique os alertas no dashboard:

| Valor total inserido | Alerta esperado                    |
|----------------------|------------------------------------|
| R$ 20.000            | Verde — dentro do limite           |
| R$ 40.500            | Amarelo — 50% atingido             |
| R$ 65.000            | Laranja — 80% atingido             |
| R$ 82.000            | Vermelho — limite ultrapassado     |

### Previsão de faturamento (Pro):
- Se você faturou R$ 30.000 em 6 meses → previsão = R$ 60.000/ano
- Se você faturou R$ 50.000 em 6 meses → previsão = R$ 100.000/ano (aparece alerta de risco)

---

## Verificar no Supabase

Após cada operação, verifique no **Table Editor** do Supabase:

1. `profiles` — verificar `plano`, `stripe_customer_id`, `subscription_status`
2. `notas_fiscais` — verificar inserção, edição, exclusão
3. Testar RLS: na aba **SQL Editor**, trocar `auth.uid()` para outro usuário — não deve ver dados

---

## Comandos úteis

```bash
# Ver logs do Next.js
npm run dev

# Testar build de produção
npm run build && npm start

# Simular evento Stripe manualmente
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted
```
