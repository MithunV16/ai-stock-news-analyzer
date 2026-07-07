import '../src/config/ensure-env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed well-known NSE companies so the news collector can resolve symbols
 * before the first real announcement arrives.
 */
const COMPANIES = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', sector: 'Energy' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', sector: 'IT' },
  { symbol: 'INFY', companyName: 'Infosys Ltd', sector: 'IT' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', sector: 'Banking' },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', sector: 'Banking' },
  { symbol: 'SBIN', companyName: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Ltd', sector: 'Telecom' },
  { symbol: 'ITC', companyName: 'ITC Ltd', sector: 'FMCG' },
  { symbol: 'LT', companyName: 'Larsen & Toubro Ltd', sector: 'Infrastructure' },
  { symbol: 'BEL', companyName: 'Bharat Electronics Ltd', sector: 'Defence' },
  { symbol: 'ADANIENT', companyName: 'Adani Enterprises Ltd', sector: 'Conglomerate' },
  { symbol: 'WIPRO', companyName: 'Wipro Ltd', sector: 'IT' },
  { symbol: 'MARUTI', companyName: 'Maruti Suzuki India Ltd', sector: 'Automobile' },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', sector: 'Automobile' },
  { symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma' },
] as const;

async function main(): Promise<void> {
  console.log('Seeding companies...');

  for (const company of COMPANIES) {
    await prisma.company.upsert({
      where: { symbol: company.symbol },
      update: {
        companyName: company.companyName,
        sector: company.sector,
      },
      create: company,
    });
  }

  const count = await prisma.company.count();
  console.log(`Seed complete — ${count} companies in database.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
