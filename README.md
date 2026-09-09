<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/52aa04aa-f374-4d81-8519-6295ad611abb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Ingressos e QR Code seguro

Execute o conteúdo adicionado ao final de `supabase/schema.sql` no SQL Editor do Supabase. Ele cria `event_tickets`, armazena somente o hash do token secreto e instala o consumo atômico do ingresso. Não execute a migration mais de uma vez fora do SQL Editor: os comandos são idempotentes, mas devem ser revisados no ambiente de produção.

O painel administrativo em `Área de ADM > SCANNER / CHECK-IN` exige `ADMIN_USER` e `ADMIN_KEY` configurados somente no servidor. A emissão manual persistente fica em `INSERIR DADOS DOS USUÁRIOS`; o código público pode ser exibido, enquanto o QR é gerado em memória com o token secreto e não contém dados pessoais.

O fluxo de compra atual ainda encaminha o visitante para o WhatsApp. Portanto, o ingresso de teste deve ser emitido pelo formulário autenticado do painel, representando a confirmação feita pela organização. A integração automática com pagamento só deve emitir o mesmo registro após o webhook oficial confirmar o pagamento.

Antes de publicar a funcionalidade do Oráculo, execute todo o `supabase/schema.sql` no SQL Editor do projeto Supabase configurado. A verificação local encontrou o projeto acessível, mas `public.coupons` ainda não existe no banco; sem essa etapa as APIs retornam erro de persistência em vez de criar resgates apenas em memória. A migration adiciona `device_id`, `redeemed_at` e o índice único por dispositivo sem apagar registros existentes.
