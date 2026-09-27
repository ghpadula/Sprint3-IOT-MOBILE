import { Customer, Dealer, ServiceItem, User, Vehicle } from '@/types';

const DAY = 24 * 60 * 60 * 1000;
const fromNow = (days: number) => new Date(Date.now() + days * DAY).toISOString();

export const demoUsers: (User & { password: string })[] = [
  {
    id: 'u-cliente',
    name: 'Gabriel Padula',
    email: 'cliente@fordconecta.com',
    password: 'ford2026',
    role: 'cliente',
    customerId: 'c-001',
  },
  {
    id: 'u-consultor',
    name: 'Marina Costa',
    email: 'consultor@fordconecta.com',
    password: 'ford2026',
    role: 'concessionaria',
    dealerId: 'ford-santo-amaro',
  },
];

export const initialVehicle: Vehicle = {
  ownerName: 'Gabriel',
  model: 'Ranger',
  version: 'Limited 3.0 V6',
  year: 2023,
  plate: 'FIA3P24',
  vin: '8AFBR23L1RJ000024',
  mileage: 38200,
  lastServiceKm: 30000,
  lastServiceDate: fromNow(-300),
  nextServiceKm: 40000,
  loyaltyPoints: 1280,
  warrantyEnd: fromNow(62),
  purchaseDate: fromNow(-3 * 365 + 62),
};

export const services: ServiceItem[] = [
  {
    id: 'revisao',
    title: 'Revisão programada 40.000 km',
    description: 'Checklist completo do plano de manutenção Ford, com registro oficial no histórico do VIN.',
    recommendedKm: 40000,
    priceRange: 'R$ 890 - R$ 1.240',
    basePrice: 1090,
    durationMin: 180,
    icon: 'construct',
    officialNetworkBenefit: 'Mantém a garantia e o histórico oficial — valoriza o veículo na revenda.',
  },
  {
    id: 'oil-filter',
    title: 'Troca de óleo e filtros',
    description: 'Serviço essencial para manter desempenho, consumo e durabilidade do motor.',
    recommendedKm: 40000,
    priceRange: 'R$ 520 - R$ 780',
    basePrice: 650,
    durationMin: 60,
    icon: 'water',
    officialNetworkBenefit: 'Peças originais, registro no histórico Ford e garantia do serviço.',
  },
  {
    id: 'brakes',
    title: 'Inspeção de freios',
    description: 'Checagem de pastilhas, discos, fluido e sensores de segurança.',
    recommendedKm: 40000,
    priceRange: 'R$ 180 - R$ 450',
    basePrice: 320,
    durationMin: 60,
    icon: 'disc',
    officialNetworkBenefit: 'Checklist padronizado e alerta preventivo para desgaste.',
  },
  {
    id: 'tires',
    title: 'Rodízio, alinhamento e calibragem',
    description: 'Ajuste para estabilidade, conforto e melhor aproveitamento dos pneus.',
    recommendedKm: 45000,
    priceRange: 'R$ 220 - R$ 360',
    basePrice: 290,
    durationMin: 90,
    icon: 'ellipse-outline',
    officialNetworkBenefit: 'Técnicos treinados para calibragem e geometria correta do modelo.',
  },
  {
    id: 'battery',
    title: 'Diagnóstico de bateria',
    description: 'Teste de carga e análise preventiva do sistema elétrico.',
    recommendedKm: 42000,
    priceRange: 'Sem custo na rede oficial',
    basePrice: 0,
    durationMin: 30,
    icon: 'battery-half',
    officialNetworkBenefit: 'Laudo rápido e desconto em substituição quando necessário.',
  },
  {
    id: 'diagnostic',
    title: 'Diagnóstico eletrônico (scanner)',
    description: 'Leitura dos módulos eletrônicos e códigos de falha (DTC) com equipamento Ford.',
    recommendedKm: 0,
    priceRange: 'R$ 150',
    basePrice: 150,
    durationMin: 45,
    icon: 'hardware-chip',
    officialNetworkBenefit: 'Software oficial Ford: identifica falhas que scanners genéricos não leem.',
  },
];

export const dealers: Dealer[] = [
  {
    id: 'ford-santo-amaro',
    name: 'Ford Santo Amaro',
    address: 'Av. Santo Amaro, 5200',
    city: 'São Paulo',
    state: 'SP',
    cep: '04705-000',
    phone: '(11) 4002-1020',
    distanceKm: 4.8,
    rating: 4.8,
  },
  {
    id: 'ford-pinheiros',
    name: 'Ford Pinheiros',
    address: 'R. dos Pinheiros, 1100',
    city: 'São Paulo',
    state: 'SP',
    cep: '05422-000',
    phone: '(11) 4002-2030',
    distanceKm: 8.3,
    rating: 4.7,
  },
  {
    id: 'ford-abc',
    name: 'Ford ABC Motors',
    address: 'Av. Kennedy, 700',
    city: 'São Bernardo do Campo',
    state: 'SP',
    cep: '09750-650',
    phone: '(11) 4002-3040',
    distanceKm: 18.6,
    rating: 4.6,
  },
];

type Seed = [string, string, string, Customer['vehicle']['model'], string, number, number, Partial<Customer['features']>];

const base: Customer['features'] = {
  vehicleAgeYears: 3,
  monthsSinceLastService: 6,
  warrantyMonthsLeft: 6,
  networkVisits24m: 3,
  distanceKm: 8,
  lastNps: 8,
  kmPerYear: 15,
  appEngaged: 0,
  hasUpcomingAppointment: 0,
  offerResponseRate: 0.3,
};

const seeds: Seed[] = [
  ['c-002', 'Ana Beatriz Lima', 'São Paulo', 'Territory', 'Titanium', 2021, 71200, { vehicleAgeYears: 5, monthsSinceLastService: 16, warrantyMonthsLeft: -24, networkVisits24m: 0, distanceKm: 14, lastNps: 5, kmPerYear: 18 }],
  ['c-003', 'Carlos Eduardo Souza', 'Santo André', 'Ranger', 'XLS 2.0', 2022, 64300, { vehicleAgeYears: 4, monthsSinceLastService: 13, warrantyMonthsLeft: -8, networkVisits24m: 1, distanceKm: 22, lastNps: 6, kmPerYear: 22 }],
  ['c-004', 'Fernanda Ribeiro', 'São Paulo', 'Maverick', 'Lariat Hybrid', 2024, 18400, { vehicleAgeYears: 2, monthsSinceLastService: 4, warrantyMonthsLeft: 14, networkVisits24m: 3, distanceKm: 5, lastNps: 10, appEngaged: 1, offerResponseRate: 0.7 }],
  ['c-005', 'João Pedro Martins', 'Osasco', 'Ranger', 'Raptor', 2024, 22100, { vehicleAgeYears: 2, monthsSinceLastService: 9, warrantyMonthsLeft: 10, networkVisits24m: 2, distanceKm: 16, lastNps: 7 }],
  ['c-006', 'Luciana Alves', 'São Paulo', 'Territory', 'SEL', 2020, 96800, { vehicleAgeYears: 6, monthsSinceLastService: 20, warrantyMonthsLeft: -36, networkVisits24m: 0, distanceKm: 11, lastNps: 4, kmPerYear: 16, offerResponseRate: 0.05 }],
  ['c-007', 'Rafael Nogueira', 'Guarulhos', 'Ranger', 'XLT 3.0 V6', 2023, 41800, { vehicleAgeYears: 3, monthsSinceLastService: 11, warrantyMonthsLeft: 1, networkVisits24m: 2, distanceKm: 27, lastNps: 7, kmPerYear: 17 }],
  ['c-008', 'Patrícia Gomes', 'São Paulo', 'Bronco Sport', 'Wildtrak', 2023, 30500, { vehicleAgeYears: 3, monthsSinceLastService: 5, warrantyMonthsLeft: 3, networkVisits24m: 4, distanceKm: 6, lastNps: 9, appEngaged: 1, offerResponseRate: 0.55 }],
  ['c-009', 'Marcelo Tanaka', 'São Caetano do Sul', 'Mustang', 'GT Performance', 2022, 15200, { vehicleAgeYears: 4, monthsSinceLastService: 10, warrantyMonthsLeft: -6, networkVisits24m: 2, distanceKm: 12, lastNps: 8, kmPerYear: 5 }],
  ['c-010', 'Juliana Freitas', 'São Paulo', 'Maverick', 'XLT', 2025, 9800, { vehicleAgeYears: 1, monthsSinceLastService: 3, warrantyMonthsLeft: 26, networkVisits24m: 1, distanceKm: 4, lastNps: 9, appEngaged: 1, offerResponseRate: 0.6 }],
  ['c-011', 'Roberto Carvalho', 'Diadema', 'Ranger', 'XL Cabine Simples', 2021, 128400, { vehicleAgeYears: 5, monthsSinceLastService: 14, warrantyMonthsLeft: -20, networkVisits24m: 1, distanceKm: 19, lastNps: 6, kmPerYear: 32, offerResponseRate: 0.1 }],
  ['c-012', 'Camila Duarte', 'São Paulo', 'Territory', 'Titanium', 2024, 26700, { vehicleAgeYears: 2, monthsSinceLastService: 7, warrantyMonthsLeft: 12, networkVisits24m: 2, distanceKm: 9, lastNps: 8 }],
  ['c-013', 'Thiago Moreira', 'Barueri', 'Transit', 'Furgão', 2022, 88300, { vehicleAgeYears: 4, monthsSinceLastService: 8, warrantyMonthsLeft: -4, networkVisits24m: 3, distanceKm: 24, lastNps: 7, kmPerYear: 28 }],
  ['c-014', 'Beatriz Oliveira', 'São Paulo', 'Bronco Sport', 'Big Bend', 2022, 47900, { vehicleAgeYears: 4, monthsSinceLastService: 15, warrantyMonthsLeft: -10, networkVisits24m: 1, distanceKm: 7, lastNps: 5, offerResponseRate: 0.15 }],
];

const plates = ['BRA2E19', 'FRD4C21', 'MAV1H24', 'RAP7T24', 'TER3S20', 'RGR5V23', 'BRS8W23', 'GTP6M22', 'MAV2X25', 'RGX9L21', 'TTN4T24', 'TRN1F22', 'BBD3B22'];

export const customers: Customer[] = seeds.map(([id, name, city, model, version, year, mileage, f], i) => ({
  id,
  name,
  city,
  phone: `(11) 9${(8100 + i * 37).toString().padStart(4, '0')}-${(2200 + i * 91).toString().slice(0, 4)}`,
  email: `${name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}@email.com`,
  vehicle: { model, version, year, mileage, plate: plates[i], vin: `9BFZ${(100000 + i * 7919).toString()}${year}X` },
  features: { ...base, ...f },
  lastVisit: fromNow(-Math.round((f.monthsSinceLastService ?? 6) * 30)),
  isAppUser: (f.appEngaged ?? 0) === 1,
}));

export const vinShareHistory = {
  labels: ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
  values: [52.1, 52.8, 53.4, 54.9, 56.2, 57.6],
  target: 60,
};
