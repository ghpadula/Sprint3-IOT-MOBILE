export type Role = 'cliente' | 'concessionaria';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  customerId?: string;
  dealerId?: string;
};

export type Session = {
  token: string;
  user: User;
  expiresAt: number;
};

export type Vehicle = {
  ownerName: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  vin: string;
  mileage: number;
  lastServiceKm: number;
  lastServiceDate: string;
  nextServiceKm: number;
  loyaltyPoints: number;
  warrantyEnd: string;
  purchaseDate: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  recommendedKm: number;
  priceRange: string;
  basePrice: number;
  durationMin: number;
  icon: string;
  officialNetworkBenefit: string;
};

export type Dealer = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
  distanceKm: number;
  rating: number;
};

export type AppointmentStatus = 'confirmado' | 'concluido' | 'cancelado';

export type Appointment = {
  id: string;
  serviceId: string;
  dealerId: string;
  date: string;
  notes: string;
  status: AppointmentStatus;
  price: number;
  discountPct: number;
  offerId?: string;
  pointsEarned: number;
  createdAt: string;
  reminderId?: string;
};

export type OfferStatus = 'nova' | 'vista' | 'aceita' | 'recusada';
export type OfferTag = 'garantia' | 'telemetria' | 'revisao' | 'retencao' | 'concessionaria';

export type Offer = {
  id: string;
  title: string;
  description: string;
  serviceId: string;
  discountPct: number;
  validUntil: string;
  reason: string;
  tag: OfferTag;
  source: 'modelo' | 'concessionaria';
  status: OfferStatus;
  createdAt: string;
};

export type NotificationType = 'agendamento' | 'oferta' | 'alerta' | 'sistema';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  route?: string;
};

export type TelemetrySourceKind = 'simulador' | 'mqtt';
export type TelemetryStatus = 'conectando' | 'online' | 'offline' | 'erro';

export type Telemetry = {
  timestamp: number;
  odometerKm: number;
  oilLifePct: number;
  batteryV: number;
  fuelPct: number;
  engineTempC: number;
  tirePsi: [number, number, number, number];
  dtc: string[];
  ignitionOn: boolean;
};

export type TelemetryAlert = {
  id: string;
  severity: 'info' | 'atencao' | 'critico';
  title: string;
  description: string;
  serviceId?: string;
};

export type ConsentSettings = {
  telemetry: boolean;
  personalizedOffers: boolean;
  pushNotifications: boolean;
};

export type DemoSettings = {
  simulateNetworkError: boolean;
  telemetrySource: TelemetrySourceKind;
  mqttUrl: string;
};

export type ChurnFeatures = {
  vehicleAgeYears: number;
  monthsSinceLastService: number;
  warrantyMonthsLeft: number;
  networkVisits24m: number;
  distanceKm: number;
  lastNps: number;
  kmPerYear: number;
  appEngaged: number;
  hasUpcomingAppointment: number;
  offerResponseRate: number;
};

export type RiskTier = 'baixo' | 'medio' | 'alto';

export type RiskFactor = {
  feature: keyof ChurnFeatures;
  label: string;
  contribution: number;
  detail: string;
};

export type RiskResult = {
  probability: number;
  tier: RiskTier;
  factors: RiskFactor[];
  recommendedAction: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  vehicle: { model: string; version: string; year: number; plate: string; vin: string; mileage: number };
  features: ChurnFeatures;
  lastVisit: string;
  isAppUser: boolean;
};

export type FeedbackEventType =
  | 'oferta_enviada'
  | 'oferta_vista'
  | 'oferta_aceita'
  | 'oferta_recusada'
  | 'agendamento'
  | 'cancelamento'
  | 'contato';

export type FeedbackEvent = {
  id: string;
  customerId: string;
  type: FeedbackEventType;
  at: string;
  detail: string;
};

export type LeadStatus = 'enviado' | 'visualizado' | 'agendado' | 'perdido';
export type LeadChannel = 'app' | 'whatsapp' | 'ligacao';

export type Lead = {
  id: string;
  customerId: string;
  title: string;
  channel: LeadChannel;
  status: LeadStatus;
  createdAt: string;
  offerId?: string;
};

export type CepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};
