import { Offer, RiskResult, TelemetryAlert, Vehicle } from '@/types';
import { daysUntil } from './format';
import { getKmToNextService } from './maintenance';

const DAY = 24 * 60 * 60 * 1000;
const validFor = (days: number) => new Date(Date.now() + days * DAY).toISOString();

export function generateModelOffers(vehicle: Vehicle, alerts: TelemetryAlert[], risk: RiskResult): Omit<Offer, 'status' | 'createdAt'>[] {
  const offers: Omit<Offer, 'status' | 'createdAt'>[] = [];
  const bonus = risk.tier === 'alto' ? 5 : 0;

  const warrantyDays = daysUntil(vehicle.warrantyEnd);
  if (warrantyDays > 0 && warrantyDays <= 180) {
    offers.push({
      id: 'm-garantia',
      title: 'Revisão de fim de garantia',
      description: 'Revisão completa + inspeção de itens cobertos pela garantia antes do vencimento.',
      serviceId: 'revisao',
      discountPct: 15 + bonus,
      validUntil: validFor(Math.min(30, warrantyDays)),
      reason: `Sua garantia termina em ${warrantyDays} dias. Revisar agora garante reparos sem custo.`,
      tag: 'garantia',
      source: 'modelo',
    });
  }

  const kmLeft = getKmToNextService(vehicle);
  if (kmLeft <= 3000 && !offers.some((o) => o.serviceId === 'revisao')) {
    offers.push({
      id: 'm-revisao',
      title: `Revisão ${vehicle.nextServiceKm.toLocaleString('pt-BR')} km com lavagem`,
      description: 'Revisão do plano Ford com lavagem completa de cortesia.',
      serviceId: 'revisao',
      discountPct: 10 + bonus,
      validUntil: validFor(20),
      reason: `Faltam ${kmLeft.toLocaleString('pt-BR')} km para a próxima revisão.`,
      tag: 'revisao',
      source: 'modelo',
    });
  }

  for (const a of alerts) {
    if (a.serviceId === 'oil-filter' && !offers.some((o) => o.serviceId === 'oil-filter')) {
      offers.push({
        id: 'm-oleo',
        title: 'Troca de óleo com 20% off',
        description: 'Óleo Motorcraft original e filtros, com registro no histórico do VIN.',
        serviceId: 'oil-filter',
        discountPct: 20,
        validUntil: validFor(15),
        reason: 'Seu veículo informou que a vida útil do óleo está baixa.',
        tag: 'telemetria',
        source: 'modelo',
      });
    }
    if (a.serviceId === 'tires' && !offers.some((o) => o.serviceId === 'tires')) {
      offers.push({
        id: 'm-pneus',
        title: 'Calibragem e alinhamento com 25% off',
        description: 'Verificação de vazamento, calibragem com nitrogênio e alinhamento.',
        serviceId: 'tires',
        discountPct: 25,
        validUntil: validFor(10),
        reason: 'Detectamos queda de pressão em um dos pneus.',
        tag: 'telemetria',
        source: 'modelo',
      });
    }
    if (a.serviceId === 'diagnostic' && !offers.some((o) => o.serviceId === 'diagnostic')) {
      offers.push({
        id: 'm-diag',
        title: 'Diagnóstico eletrônico gratuito',
        description: 'Leitura completa dos módulos com o scanner oficial Ford.',
        serviceId: 'diagnostic',
        discountPct: 100,
        validUntil: validFor(7),
        reason: 'O veículo registrou um código de falha no motor.',
        tag: 'telemetria',
        source: 'modelo',
      });
    }
  }

  if (risk.tier !== 'baixo') {
    offers.push({
      id: 'm-retencao',
      title: 'Leva e traz grátis no seu próximo serviço',
      description: 'Buscamos e devolvemos seu Ford em casa ou no trabalho, sem custo.',
      serviceId: 'revisao',
      discountPct: 0,
      validUntil: validFor(30),
      reason: 'Um benefício para facilitar sua ida à rede oficial.',
      tag: 'retencao',
      source: 'modelo',
    });
  }

  return offers;
}

export const offerTagMeta: Record<Offer['tag'], { label: string; icon: string; tone: 'primary' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
  garantia: { label: 'Garantia', icon: 'shield-checkmark', tone: 'primary' },
  telemetria: { label: 'Seu veículo avisou', icon: 'pulse', tone: 'warning' },
  revisao: { label: 'Revisão', icon: 'construct', tone: 'primary' },
  retencao: { label: 'Benefício', icon: 'gift', tone: 'success' },
  concessionaria: { label: 'Da sua concessionária', icon: 'storefront', tone: 'neutral' },
};
