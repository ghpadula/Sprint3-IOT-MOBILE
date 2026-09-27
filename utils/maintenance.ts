import { ServiceItem, Telemetry, TelemetryAlert, Vehicle } from '@/types';

export function getServiceProgress(vehicle: Vehicle) {
  const interval = vehicle.nextServiceKm - vehicle.lastServiceKm;
  const current = vehicle.mileage - vehicle.lastServiceKm;
  return Math.min(100, Math.max(0, Math.round((current / interval) * 100)));
}

export function getKmToNextService(vehicle: Vehicle) {
  return Math.max(0, vehicle.nextServiceKm - vehicle.mileage);
}

export type Urgency = { label: string; tone: 'success' | 'warning' | 'danger' };

export function getServiceUrgency(vehicle: Vehicle): Urgency {
  const remaining = getKmToNextService(vehicle);
  if (remaining === 0) return { label: 'Revisão vencida', tone: 'danger' };
  if (remaining <= 2000) return { label: 'Agendar em breve', tone: 'warning' };
  return { label: 'Dentro do prazo', tone: 'success' };
}

export function sortServicesByNeed(vehicle: Vehicle, items: ServiceItem[], alerts: TelemetryAlert[] = []) {
  const flagged = new Set(alerts.map((a) => a.serviceId));
  return [...items].sort((a, b) => {
    const fa = flagged.has(a.id) ? -1e9 : 0;
    const fb = flagged.has(b.id) ? -1e9 : 0;
    const aDistance = a.recommendedKm ? Math.abs(vehicle.mileage - a.recommendedKm) : 1e6;
    const bDistance = b.recommendedKm ? Math.abs(vehicle.mileage - b.recommendedKm) : 1e6;
    return fa + aDistance - (fb + bDistance);
  });
}

export const TIRE_POSITIONS = ['Dianteiro esq.', 'Dianteiro dir.', 'Traseiro esq.', 'Traseiro dir.'];
export const TIRE_TARGET_PSI = 35;

export function evaluateTelemetry(t: Telemetry | null): TelemetryAlert[] {
  if (!t) return [];
  const alerts: TelemetryAlert[] = [];
  if (t.oilLifePct <= 10) {
    alerts.push({ id: 'oil', severity: 'critico', title: 'Vida útil do óleo crítica', description: `Restam ${Math.round(t.oilLifePct)}% — troque o óleo o quanto antes.`, serviceId: 'oil-filter' });
  } else if (t.oilLifePct <= 20) {
    alerts.push({ id: 'oil', severity: 'atencao', title: 'Troca de óleo se aproximando', description: `Vida útil do óleo em ${Math.round(t.oilLifePct)}%.`, serviceId: 'oil-filter' });
  }
  if (t.batteryV < 12.0) {
    alerts.push({ id: 'battery', severity: 'critico', title: 'Bateria com tensão baixa', description: `${t.batteryV.toFixed(1)} V com o motor desligado. Risco de não dar partida.`, serviceId: 'battery' });
  } else if (t.batteryV < 12.3) {
    alerts.push({ id: 'battery', severity: 'atencao', title: 'Bateria perdendo carga', description: `${t.batteryV.toFixed(1)} V — recomendamos um diagnóstico gratuito.`, serviceId: 'battery' });
  }
  t.tirePsi.forEach((psi, i) => {
    if (psi < TIRE_TARGET_PSI - 5) {
      alerts.push({ id: `tire-${i}`, severity: psi < TIRE_TARGET_PSI - 9 ? 'critico' : 'atencao', title: `Pneu ${TIRE_POSITIONS[i].toLowerCase()} baixo`, description: `${psi.toFixed(0)} PSI (ideal ${TIRE_TARGET_PSI} PSI).`, serviceId: 'tires' });
    }
  });
  if (t.engineTempC > 105) {
    alerts.push({ id: 'temp', severity: 'critico', title: 'Temperatura do motor elevada', description: `${Math.round(t.engineTempC)} °C. Pare em local seguro.`, serviceId: 'diagnostic' });
  }
  if (t.dtc.length > 0) {
    alerts.push({ id: 'dtc', severity: 'atencao', title: 'Código de falha detectado', description: `${t.dtc.join(', ')} — diagnóstico eletrônico recomendado.`, serviceId: 'diagnostic' });
  }
  return alerts;
}

export function healthScore(vehicle: Vehicle, t: Telemetry | null) {
  let score = 100;
  const kmLeft = getKmToNextService(vehicle);
  if (kmLeft === 0) score -= 25;
  else if (kmLeft < 2000) score -= 10;
  if (t) {
    score -= Math.max(0, 25 - t.oilLifePct) * 0.8;
    if (t.batteryV < 12.3) score -= (12.3 - t.batteryV) * 40;
    t.tirePsi.forEach((p) => (score -= Math.max(0, TIRE_TARGET_PSI - 3 - p) * 1.5));
    score -= t.dtc.length * 8;
    if (t.engineTempC > 105) score -= 20;
  }
  return Math.max(5, Math.min(100, Math.round(score)));
}
