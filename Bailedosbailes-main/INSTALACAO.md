# Instalação e publicação — GitHub, Vercel e Supabase

Este guia explica como publicar o projeto pela integração entre GitHub e Vercel sem expor credenciais no frontend ou no repositório.

## 1. Antes de começar

Você precisa ter acesso a:

- repositório do projeto no GitHub;
- projeto conectado na Vercel;
- projeto `upijucscuvnxeqdetrhmv` no Supabase;
- painel de variáveis de ambiente da Vercel.

Nunca publique arquivos `.env`, a pasta `node_modules` ou a pasta `.tools`. Eles já estão protegidos pelo `.gitignore` deste projeto.

## 2. Rotacionar a chave secreta exposta

A chave secreta compartilhada anteriormente deve ser substituída antes do deploy.

1. Entre no painel do Supabase.
2. Abra o projeto `upijucscuvnxeqdetrhmv`.
3. Acesse **Settings > API Keys**.
4. Crie uma nova chave do tipo **Secret** (`sb_secret_...`).
5. Não apague a chave antiga ainda.
6. Guarde a nova chave em um gerenciador de senhas.
7. Depois que o novo deploy estiver funcionando, volte ao Supabase e exclua a chave antiga.

Nunca coloque a chave secreta em:

- arquivos dentro de `src/`;
- variáveis iniciadas por `VITE_`;
- código enviado ao GitHub;
- mensagens, prints ou documentação.

## 3. Criar as tabelas no Supabase

1. No Supabase, abra **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo [`supabase/schema.sql`](supabase/schema.sql) deste projeto.
4. Copie todo o conteúdo do arquivo.
5. Cole no SQL Editor.
6. Clique em **Run**.
7. Confirme em **Table Editor** que existem as tabelas:

   - `event_tickets`;
   - `coupons`;
   - `guest_list`;
   - `contacts`.

O arquivo pode ser executado novamente: as tabelas, índices e políticas foram preparados para não duplicar os objetos existentes.

## 4. Configurar as variáveis na Vercel

Abra o projeto na Vercel e acesse:

**Settings > Environment Variables**

Cadastre as variáveis abaixo. Não escreva os sinais `<` e `>` nos valores reais.

```env
SUPABASE_URL=https://upijucscuvnxeqdetrhmv.supabase.co
SUPABASE_SECRET_KEY=<nova chave sb_secret criada no Supabase>
ADMIN_USER=<login desejado para o painel administrativo>
ADMIN_KEY=<senha administrativa forte e exclusiva>
ADMIN_SESSION_SECRET=<segredo aleatório longo>
```

Marque pelo menos o ambiente **Production**. Se você utiliza links de teste da Vercel, marque também **Preview**.

Para criar o `ADMIN_SESSION_SECRET` com Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Copie o resultado diretamente para a Vercel. Não salve esse valor no repositório.

Depois de criar ou alterar variáveis, é obrigatório iniciar um novo deployment. Deployments antigos não recebem as novas variáveis.

## 5. Confirmar a pasta raiz na Vercel

No projeto da Vercel, abra **Settings > Build and Deployment** e confira **Root Directory**.

- Se `package.json`, `vercel.json`, `src/` e `api/` estiverem na raiz do repositório, deixe **Root Directory** vazio.
- Se esses arquivos estiverem dentro de uma subpasta, selecione essa subpasta como **Root Directory**.

As configurações esperadas são:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install ou npm ci
```

O arquivo `vercel.json` do projeto já define o build, a pasta `dist` e o encaminhamento das rotas `/api`.

## 6. Preparar o projeto local conectado ao GitHub

Esta pasta foi recebida sem a pasta `.git`. Por isso, somente entrar na conta do GitHub pelo terminal não é suficiente para fazer `push`.

A opção mais segura é clonar o repositório que já está conectado à Vercel:

```powershell
cd C:\Users\Aluno\Desktop
git clone URL_DO_SEU_REPOSITORIO Bailedosbailes-deploy
cd Bailedosbailes-deploy
```

Depois, copie para o clone os arquivos corrigidos desta pasta, preservando a mesma estrutura. Não copie `.tools`, `node_modules` ou qualquer `.env`.

Principais arquivos corrigidos:

```text
.env.example
.gitignore
README.md
INSTALACAO.md
api/index.ts
server.ts
src/components/AdminDashboardModal.tsx
src/components/InfoModals.tsx
src/utils/supabase.ts
supabase/schema.sql
tsconfig.json
backend/.env.example
backend/prisma/seed.ts
backend/src/config/configuration.ts
```

Se a sua pasta local já possuir `.git`, não é necessário clonar novamente. Entre nela e confira:

```powershell
git status
git remote -v
git branch --show-current
```

## 7. Instalar e validar localmente

Instale o Node.js LTS e execute dentro da pasta que contém `package.json`:

```powershell
npm ci
npm run lint
npm run build
```

Resultado esperado:

- `npm ci` termina sem erro;
- `npm run lint` não apresenta erros TypeScript;
- `npm run build` cria a pasta `dist`.

Avisos de pacotes descontinuados não são necessariamente falhas. O importante é o comando terminar com código de saída zero e sem linhas `npm error`.

Não execute `git add node_modules` e não envie a pasta `dist`; a Vercel cria ambos durante o deployment.

## 8. Enviar as correções ao GitHub

Confira primeiro tudo o que será enviado:

```powershell
git status
git diff
```

Depois faça o commit:

```powershell
git add .
git status
git commit -m "Corrige persistencia Supabase e autenticacao da Vercel"
git push origin main
```

Se a branch conectada à Vercel não for `main`, substitua `main` pelo nome correto.

Depois do `push`, abra a aba **Deployments** da Vercel. A integração com GitHub deve iniciar um deployment automaticamente.

## 9. Validar o deployment

Quando a Vercel mostrar o status **Ready**, abra:

```text
https://SEU-DOMINIO.vercel.app/api/health
```

O resultado esperado é semelhante a:

```json
{
  "status": "ok",
  "supabaseConfigured": true,
  "eventTicketsTable": true,
  "couponsTable": true,
  "guestListTable": true,
  "contactsTable": true
}
```

Depois:

1. Abra o site publicado.
2. Entre na área administrativa.
3. Faça login usando `ADMIN_USER` e `ADMIN_KEY`.
4. Cadastre um nome e celular válido com DDD.
5. Confirme que o QR Code com abóbora foi apresentado.
6. No Supabase, abra `event_tickets` e confirme a nova linha.
7. Atualize a página administrativa e confirme que o cadastro continua na listagem.

O cadastro administrativo é salvo em `event_tickets`, nos campos `nome` e `telefone`. Ele não é salvo em `guest_list`.

## 10. Diagnóstico de erros

### `/api/health` retorna 404

- Confira se `api/index.ts` foi enviado ao GitHub.
- Confira a **Root Directory** da Vercel.
- Confira os rewrites de `vercel.json`.

### `supabaseConfigured` retorna `false`

- Confira os nomes exatos `SUPABASE_URL` e `SUPABASE_SECRET_KEY`.
- Confirme que as variáveis estão habilitadas para **Production**.
- Faça um novo deployment.

### `eventTicketsTable` retorna `false`

- Execute todo o arquivo `supabase/schema.sql`.
- Confirme que a URL e a chave pertencem ao mesmo projeto Supabase.

### Login retorna configuração ausente

- Configure `ADMIN_USER` e `ADMIN_KEY` na Vercel.
- Configure também `ADMIN_SESSION_SECRET`.
- Faça um novo deployment.

### Login funciona, mas cadastro retorna erro

1. Abra **Vercel > Deployments > deployment atual > Functions/Logs**.
2. Procure por mensagens iniciadas com `[Supabase]`.
3. Confira novamente `/api/health`.
4. Confirme que a chave antiga só foi excluída depois de publicar a nova.

### O cadastro informa sucesso, mas não aparece no Supabase

- Confira a tabela `event_tickets`, não `guest_list`.
- Confirme que está olhando o projeto `upijucscuvnxeqdetrhmv`.
- Atualize o Table Editor do Supabase.

## 11. Checklist final

- [ ] Chave secreta antiga rotacionada.
- [ ] Nenhuma chave secreta está no GitHub.
- [ ] Schema executado no Supabase correto.
- [ ] Cinco variáveis configuradas na Vercel.
- [ ] Root Directory da Vercel está correta.
- [ ] `npm ci` concluído.
- [ ] `npm run lint` concluído.
- [ ] `npm run build` concluído.
- [ ] Commit enviado para a branch conectada.
- [ ] Deployment da Vercel com status **Ready**.
- [ ] `/api/health` apresenta todas as tabelas como `true`.
- [ ] Cadastro aparece em `event_tickets` após atualizar a página.
- [ ] QR Code com abóbora foi baixado e testado em outro aparelho.
