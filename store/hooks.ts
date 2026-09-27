import { useCallback, useEffect, useMemo, useState } from 'react';
import { dealers } from '@/data/mockData';
import { predictChurn } from '@/ml/churnModel';
import { api } from '@/services/api';
import { ChurnFeatures, Customer, Offer, RiskResult } from '@/types';
import { daysUntil, monthsBetween } from '@/utils/format';
import { generateModelOffers } from '@/utils/offers';
import { APP_CUSTOMER_ID, useApp } from './AppContext';
import { useTelemetry } from './TelemetryContext';

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const run = useCallback(
    async (mode: 'load' | 'refresh' = 'load') => {
      if (mode === 'load') setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        setData(await fn());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro inesperado.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    run('load');
  }, [run]);

  return { data, error, loading, refreshing, reload: () => run('load'), refresh: () => run('refresh') };
}

export function useAppCustomerFeatures(): ChurnFeatures {
  const { vehicle, appointments, consent, offerStates, dealerOffers } = useApp();
  return useMemo(() => {
    const now = Date.now();
    const ageYears = Math.max(0.5, monthsBetween(vehicle.purchaseDate) / 12);
    const done = appointments.filter((a) => a.status === 'concluido');
    const lastDone = done.map((a) => new Date(a.date).getTime()).sort((a, b) => b - a)[0];
    const lastServiceIso = lastDone ? new Date(lastDone).toISOString() : vehicle.lastServiceDate;
    const upcoming = appointments.some((a) => a.status === 'confirmado' && new Date(a.date).getTime() > now);
    const statuses = [...Object.values(offerStates).map((s) => s.status), ...dealerOffers.map((o) => o.status)];
    const answered = statuses.filter((s) => s === 'aceita' || s === 'recusada' || s === 'vista');
    const accepted = statuses.filter((s) => s === 'aceita').length;
    return {
      vehicleAgeYears: Math.round(ageYears * 10) / 10,
      monthsSinceLastService: Math.round(monthsBetween(lastServiceIso) * 10) / 10,
      warrantyMonthsLeft: Math.round((daysUntil(vehicle.warrantyEnd) / 30.4) * 10) / 10,
      networkVisits24m: done.filter((a) => now - new Date(a.date).getTime() < 730 * 86400000).length,
      distanceKm: dealers[0].distanceKm,
      lastNps: 7,
      kmPerYear: Math.round(vehicle.mileage / ageYears / 100) / 10,
      appEngaged: consent.personalizedOffers ? 1 : 0,
      hasUpcomingAppointment: upcoming ? 1 : 0,
      offerResponseRate: answered.length ? accepted / answered.length : 0.2,
    };
  }, [vehicle, appointments, consent, offerStates, dealerOffers]);
}

export function useAppCustomerRisk(): RiskResult {
  const f = useAppCustomerFeatures();
  return useMemo(() => predictChurn(f), [f]);
}

export function useClientOffers(): Offer[] {
  const { vehicle, offerStates, dealerOffers, consent } = useApp();
  const { alerts } = useTelemetry();
  const risk = useAppCustomerRisk();
  const alertKey = alerts.map((a) => a.serviceId).join(',');
  return useMemo(() => {
    const model: Offer[] = consent.personalizedOffers
      ? generateModelOffers(vehicle, alerts, risk).map((o) => ({
          ...o,
          status: offerStates[o.id]?.status ?? 'nova',
          createdAt: offerStates[o.id]?.createdAt ?? new Date().toISOString(),
        }))
      : [];
    return [...dealerOffers, ...model].filter((o) => new Date(o.validUntil).getTime() > Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle, offerStates, dealerOffers, consent.personalizedOffers, risk.tier, alertKey]);
}

export type PortfolioItem = Customer & { risk: RiskResult };

export function usePortfolio() {
  const { vehicle } = useApp();
  const appFeatures = useAppCustomerFeatures();
  const query = useAsync(() => api.getCustomers(), []);

  const items = useMemo<PortfolioItem[] | null>(() => {
    if (!query.data) return null;
    const me: Customer = {
      id: APP_CUSTOMER_ID,
      name: 'Gabriel Padula',
      phone: '(11) 98765-4321',
      email: 'cliente@fordconecta.com',
      city: 'São Paulo',
      vehicle: { model: vehicle.model, version: vehicle.version, year: vehicle.year, plate: vehicle.plate, vin: vehicle.vin, mileage: vehicle.mileage },
      features: appFeatures,
      lastVisit: vehicle.lastServiceDate,
      isAppUser: true,
    };
    return [me, ...query.data]
      .map((c) => ({ ...c, risk: predictChurn(c.features) }))
      .sort((a, b) => b.risk.probability - a.risk.probability);
  }, [query.data, appFeatures, vehicle]);

  return { ...query, items };
}
