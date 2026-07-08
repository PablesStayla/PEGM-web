import type { ProductCategory } from './product-factory.types';

// Real GrowShop product names to make fixtures feel authentic
export const GROWSHOP_PRODUCTS: Record<ProductCategory, string[]> = {
  seeds: [
    'Northern Lights Auto Feminizada',
    'White Widow Feminizada',
    'Gorilla Glue #4 Auto',
    'Blue Dream Seeds',
    'OG Kush Auto Feminizada',
  ],
  lights: [
    'Panel LED Quantum Board 240W',
    'Lámpara HPS 600W Completa',
    'LED Bar Full Spectrum 320W',
    'Panel CFL 200W Bajo Consumo',
    'LED Samsung LM301H 480W',
  ],
  nutrients: [
    'Abono Floración NPK 5-15-10 1L',
    'Fórmula Crecimiento Vegetativo 500ml',
    'Suplemento Cal-Mag 1L',
    'Estimulador de Raíces 250ml',
    'Potenciador Floración 250ml',
  ],
  equipment: [
    'Filtro Carbón 150mm 500m³/h',
    'Extractor Inline 200mm 800m³/h',
    'Carpa Cultivo 1.2x1.2x2m',
    'pH-metro Digital de Bolsillo',
    'Medidor EC/TDS Profesional',
  ],
  kits: [
    'Kit Cultivo Indoor Pro 80x80',
    'Kit Iniciación Hidroponía Completo',
    'Pack Cogollero Todo Incluido',
    'Kit LED + Carpa 60x60cm',
    'Pack Nutrientes Ciclo Completo',
  ],
};
