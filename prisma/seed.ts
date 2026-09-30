/**
 * prisma/seed.ts
 * Seed inicial de StampaApp.
 * Ejecucion: pnpm prisma db seed
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    ?? 'admin@stampaapp.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@Stampa2026!';
const ADMIN_NAME     = process.env.SEED_ADMIN_NAME     ?? 'Administrador StampaApp';

const OPERATOR_EMAIL    = process.env.SEED_OPERATOR_EMAIL    ?? 'operador@stampaapp.com';
const OPERATOR_PASSWORD = process.env.SEED_OPERATOR_PASSWORD ?? 'Operador@Stampa2026!';
const OPERATOR_NAME     = process.env.SEED_OPERATOR_NAME     ?? 'Operador de Taller';

const SALT_ROUNDS = 12;

const TECHNIQUES = [
  {
    id: 'dtf',
    name: 'DTF (Direct-to-Film)',
    description: 'Impresion directa en film transferible. Soporta degradados, transparencias y alto detalle en textiles de algodon o poliester.',
    requiresVector: false,
    maxColors: null as number | null,
  },
  {
    id: 'sublimation',
    name: 'Sublimacion',
    description: 'Disenado para poleras de poliester claras, tazas, termos, vasos y gorras trucker. No imprime color blanco.',
    requiresVector: false,
    maxColors: null as number | null,
  },
  {
    id: 'embroidery',
    name: 'Bordado',
    description: 'Aplicable a polos, gorras estructuradas y chaquetas. Requiere colores planos, trazo minimo 1mm y texto 5mm.',
    requiresVector: true,
    maxColors: 8 as number | null,
  },
];

const IMAGE_CATEGORIES = [
  'Deportes', 'Anime', 'Logos y Marcas', 'Abstracto',
  'Naturaleza', 'Musica', 'Animales', 'Tipografia', 'Geometrico', 'Otros',
];

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function main() {
  console.log('Iniciando seed de StampaApp...\n');

  // 1. Tecnicas base
  console.log('Creando tecnicas base...');
  for (const t of TECHNIQUES) {
    await prisma.technique.upsert({
      where: { id: t.id },
      update:  { name: t.name, description: t.description, requiresVector: t.requiresVector, maxColors: t.maxColors },
      create:  { id: t.id, name: t.name, description: t.description, requiresVector: t.requiresVector, maxColors: t.maxColors },
    });
    console.log('  [OK] Tecnica: ' + t.name);
  }

  // 2. Categorias de galeria
  console.log('\nCreando categorias de imagenes...');
  for (const name of IMAGE_CATEGORIES) {
    const exists = await prisma.imageCategory.findFirst({ where: { name } });
    if (!exists) {
      await prisma.imageCategory.create({ data: { name } });
      console.log('  [OK] Categoria creada: ' + name);
    } else {
      console.log('  [--] Ya existe: ' + name);
    }
  }

  // 3. Usuario Administrador
  console.log('\nCreando usuario Administrador...');
  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existingAdmin) {
    console.log('  [--] Admin ya existe: ' + ADMIN_EMAIL);
  } else {
    const adminHash = await hashPassword(ADMIN_PASSWORD);
    const admin = await prisma.user.create({
      data: { email: ADMIN_EMAIL, passwordHash: adminHash, fullName: ADMIN_NAME, role: 'admin', isActive: true },
    });
    console.log('  [OK] Admin creado: ' + admin.email + ' | id: ' + admin.id);
    console.log('  [!!] Password por defecto: ' + ADMIN_PASSWORD);
  }

  // 4. Usuario Operador
  console.log('\nCreando usuario Operador...');
  const existingOp = await prisma.user.findUnique({ where: { email: OPERATOR_EMAIL } });
  if (existingOp) {
    console.log('  [--] Operador ya existe: ' + OPERATOR_EMAIL);
  } else {
    const opHash = await hashPassword(OPERATOR_PASSWORD);
    const operator = await prisma.user.create({
      data: { email: OPERATOR_EMAIL, passwordHash: opHash, fullName: OPERATOR_NAME, role: 'operator', isActive: true },
    });
    console.log('  [OK] Operador creado: ' + operator.email + ' | id: ' + operator.id);
    console.log('  [!!] Password por defecto: ' + OPERATOR_PASSWORD);
  }

  console.log('\nSeed completado exitosamente.');
}

main()
  .catch((err) => { console.error('Error en el seed:', err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
