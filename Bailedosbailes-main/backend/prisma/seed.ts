import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed do Banco de Dados ---');

  // 1. Tiers de Ingressos Oficiais do Hotel Cortez
  const tiers = [
    {
      id: 't-pista',
      name: 'PISTA CORTEZ - OPEN BAR',
      category: 'PISTA',
      price: 50.00,
      originalPrice: 70.00,
      batch: '1º LOTE',
      totalQuota: 200,
      availableQuota: 200,
      active: true,
    },
    {
      id: 't-vip',
      name: 'VIP SUITE 64 - OPEN BAR PREMIUM',
      category: 'VIP',
      price: 110.00,
      originalPrice: 140.00,
      batch: '1º LOTE',
      totalQuota: 80,
      availableQuota: 80,
      active: true,
    },
    {
      id: 't-camarote',
      name: 'CAMAROTE COUNTESS - ALL INCLUSIVE',
      category: 'CAMAROTE',
      price: 180.00,
      originalPrice: 220.00,
      batch: 'ÚLTIMOS',
      totalQuota: 30,
      availableQuota: 30,
      active: true,
    },
    {
      id: 't-lounge',
      name: 'LOUNGE PRIVATIVO PARA 10 PESSOAS',
      category: 'LOUNGE',
      price: 1200.00,
      originalPrice: 1500.00,
      batch: 'LOTE ÚNICO',
      totalQuota: 5,
      availableQuota: 5,
      active: true,
    }
  ];

  for (const tier of tiers) {
    await prisma.ticketTier.upsert({
      where: { id: tier.id },
      update: tier,
      create: tier,
    });
    console.log(`[Seed] Tier carregado: ${tier.name} (R$ ${tier.price.toFixed(2)})`);
  }

  // 2. Admin inicial configurado exclusivamente por variáveis de ambiente.
  const defaultAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const defaultAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!defaultAdminEmail || !defaultAdminPassword) {
    throw new Error('INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD são obrigatórios para executar o seed.');
  }

  const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: defaultAdminEmail },
    update: { passwordHash },
    create: {
      email: defaultAdminEmail,
      name: 'Administrador Hotel Cortez',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`[Seed] Admin padrão configurado: ${defaultAdminEmail}`);
  console.log('--- Seed finalizado com sucesso ---');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
