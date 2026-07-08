import { PricingDashboard } from '@/resources/pricing/PricingDashboard';

export const metadata = {
  title: 'Rentabilidad | Admin - PranaKaia',
  description: 'Análisis de márgenes y rentabilidad real',
};

const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'Spider LED 200W',
    cost: 48000,
    price: 89990,
    shippingCost: 5900,
    category: 'LED',
  },
  {
    id: '2',
    name: 'Carpa Cultivo 80x80',
    cost: 12000,
    price: 28990,
    shippingCost: 5900,
    category: 'Carpas',
  },
  {
    id: '3',
    name: 'Semillas OG Kush x3',
    cost: 4200,
    price: 14990,
    shippingCost: 0,
    category: 'Semillas',
  },
  {
    id: '4',
    name: 'Kit Nutrientes Bio A+B',
    cost: 8500,
    price: 19990,
    shippingCost: 3900,
    category: 'Nutrientes',
  },
  {
    id: '5',
    name: 'Fibra de Coco 20L',
    cost: 3200,
    price: 8990,
    shippingCost: 3900,
    category: 'Sustratos',
  },
  {
    id: '6',
    name: 'Fan Clip 6"',
    cost: 2800,
    price: 7990,
    shippingCost: 2900,
    category: 'Ventilación',
  },
];

export default async function ProfitabilityPage() {
  // In the future, this data will come from a DB or API service
  return <PricingDashboard initialProducts={INITIAL_PRODUCTS} />;
}
