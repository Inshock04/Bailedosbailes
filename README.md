# Hotel Cortez — Sistema de Venda e Gestão de Ingressos

Sistema web desenvolvido para gerenciar a venda de ingressos e o controle de acesso do evento **Bailes — Halloween Party**, com temática inspirada em *American Horror Story: Hotel*.

O projeto foi desenvolvido com foco na automação de processos, segurança das transações e facilidade de utilização, integrando vendas online, pagamentos, emissão de ingressos e gerenciamento administrativo em uma única plataforma.

## Funcionalidades

**Venda e emissão de ingressos**
- Compra de ingressos diretamente pela plataforma.
- Integração com o Checkout Pro do Mercado Pago.
- Confirmação automática de pagamentos via webhooks.
- Geração de ingressos com códigos únicos e QR Codes.
- Envio automático dos ingressos por e-mail.
- Consulta individual de ingressos por link.

**Gerenciamento administrativo**
- Painel para acompanhamento de vendas e pedidos.
- Controle de vendedores e promoters.
- Gerenciamento de ingressos emitidos.
- Autenticação para acesso administrativo.
- Acompanhamento do status dos pagamentos.

**Controle de acesso**
- Leitura de QR Codes utilizando a câmera do dispositivo.
- Validação dos ingressos na portaria.
- Controle de ingressos utilizados e disponíveis.
- Prevenção contra reutilização de ingressos.

**Interface e experiência do usuário**
- Design responsivo para computadores e dispositivos móveis.
- Interface personalizada com a identidade visual do evento.
- Animações e transições utilizando GSAP.
- Elementos tridimensionais desenvolvidos com Three.js.

## Tecnologias utilizadas

### Frontend
- **React 19:** desenvolvimento da interface em componentes.
- **TypeScript:** tipagem estática e organização do código.
- **Vite 6:** ambiente de desenvolvimento e build.
- **Tailwind CSS v4:** estilização responsiva.
- **Three.js:** renderização de elementos 3D.
- **GSAP:** animações e transições.
- **Lucide React:** biblioteca de ícones.
- **HTML5 QR Code:** leitura de ingressos pela câmera.
- **Canvas Confetti:** efeitos visuais interativos.

### Backend
- **Node.js / Bun:** ambientes de execução.
- **Express:** desenvolvimento de APIs, rotas e webhooks.
- **NestJS:** arquitetura modular com controllers, services e DTOs.
- **JWT:** autenticação baseada em tokens.
- **Bcrypt:** armazenamento seguro de senhas por hash.
- **Helmet:** configuração de headers de segurança.
- **Rate Limit:** proteção contra requisições excessivas.
- **CORS:** controle de acesso entre origens.

### Banco de dados
- **Supabase:** plataforma de banco de dados PostgreSQL.
- **Prisma ORM:** modelagem, tipagem e gerenciamento de dados no backend NestJS.

### Integrações
- **Mercado Pago API:** processamento de pagamentos e notificações via webhook.
- **Nodemailer:** envio automatizado de e-mails transacionais.
- **QR Code:** geração e validação de ingressos individuais.

### Testes
- **Vitest:** testes unitários e de integração.
- **Supertest:** testes de endpoints HTTP.
- **TypeScript:** verificação estática de tipos.

## Arquitetura do sistema

O projeto utiliza uma arquitetura dividida em camadas, separando a interface, as regras de negócio, a persistência de dados e as integrações externas.

O frontend foi desenvolvido em React e TypeScript. O backend utiliza Express e uma estrutura modular em NestJS, com integração ao Supabase para persistência dos dados.

As transações financeiras são processadas pelo Mercado Pago, enquanto os webhooks permitem atualizar o status dos pedidos após a confirmação do pagamento.

Após a confirmação, o sistema gera os ingressos individuais e realiza o envio automático por e-mail.

## Segurança

Foram utilizadas tecnologias e mecanismos voltados à proteção dos dados e das operações do sistema, incluindo:

- Autenticação JWT para usuários administrativos.
- Hashing de senhas com Bcrypt.
- Tokens criptográficos para identificação de ingressos.
- Validação de dados recebidos pela API.
- Controle de requisições e proteção de endpoints.
- Processamento de notificações de pagamento por webhook.
- Separação entre páginas públicas de ingressos e rotas administrativas.

## Objetivo do projeto

O Hotel Cortez foi desenvolvido para atender à necessidade real de comercialização e gerenciamento de ingressos de um evento, centralizando processos que normalmente seriam realizados manualmente.

O projeto proporcionou experiência prática com desenvolvimento full stack, integração de APIs, bancos de dados relacionais, autenticação, processamento de pagamentos, automação de processos e implantação de aplicações web.

## Autor

Projeto desenvolvido por **Inshock04**.

GitHub: https://github.com/Inshock04

Desenvolvimento de sistemas, integrações de APIs e soluções voltadas à automação de processos.
