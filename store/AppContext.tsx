import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { dealers, initialVehicle, services } from '@/data/mockData';
import { setNetworkFailure } from '@/services/api';
import { cancelReminder, notifyNow, scheduleReminder } from '@/services/notifications';
import { storage } from '@/services/storage';
import { DEFAULT_MQTT_URL } from '@/services/telemetry';
import {
  AppNotification,
  Appointment,
  ConsentSettings,
  DemoSettings,
  FeedbackEvent,
  FeedbackEventType,
  Lead,
  LeadChannel,
  NotificationType,
  Offer,
  OfferStatus,
  Vehicle,
} from '@/types';
import { formatDateTime, uid } from '@/utils/format';

export const APP_CUSTOMER_ID = 'c-001';
export const POINTS_PER_APPOINTMENT = 180;

type OfferState = Record<string, { status: OfferStatus; createdAt: string }>;

type NewAppointment = { serviceId: string; dealerId: string; date: string; notes: string; offer?: Offer | null };
type DealerOfferInput = { customerId: string; title: string; serviceId: string; discountPct: number; channel: LeadChannel };

type AppState = {
  isReady: boolean;
  vehicle: Vehicle;
  appointments: Appointment[];
  offerStates: OfferState;
  dealerOffers: Offer[];
  notifications: AppNotification[];
  consent: ConsentSettings;
  demo: DemoSettings;
  events: FeedbackEvent[];
  leads: Lead[];
  redemptions: Redemption[];
};

export type Redemption = { id: string; title: string; points: number; code: string; at: string };

type AppContextValue = AppState & {
  unreadCount: number;
  updateMileage: (km: number) => Promise<void>;
  addAppointment: (a: NewAppointment) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  setOfferStatus: (offer: Offer, status: OfferStatus) => void;
  addNotification: (n: { title: string; body: string; type: NotificationType; route?: string; push?: boolean }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setConsent: (c: Partial<ConsentSettings>) => void;
  setDemo: (d: Partial<DemoSettings>) => void;
  logEvent: (customerId: string, type: FeedbackEventType, detail: string) => void;
  sendDealerOffer: (input: DealerOfferInput) => Lead;
  registerContact: (customerId: string, channel: LeadChannel, note: string) => void;
  resetDemoData: () => Promise<void>;
  redeemReward: (title: string, points: number) => Redemption | null;
};

const DAY = 24 * 60 * 60 * 1000;

function seedAppointments(): Appointment[] {
  return [
    {
      id: 'apt-seed-1',
      serviceId: 'revisao',
      dealerId: 'ford-santo-amaro',
      date: new Date(Date.now() - 300 * DAY).toISOString(),
      notes: 'Revisão de 30.000 km',
      status: 'concluido',
      price: 980,
      discountPct: 0,
      pointsEarned: POINTS_PER_APPOINTMENT,
      createdAt: new Date(Date.now() - 310 * DAY).toISOString(),
    },
  ];
}

function seedNotifications(): AppNotification[] {
  return [
    {
      id: 'n-seed-1',
      title: 'Bem-vindo ao Ford Conecta',
      body: 'Seu Ranger está conectado. Acompanhe a saúde do veículo e receba ofertas feitas para você.',
      type: 'sistema',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      route: '/veiculo',
    },
  ];
}

const defaultState = (): Omit<AppState, 'isReady'> => ({
  vehicle: initialVehicle,
  appointments: seedAppointments(),
  offerStates: {},
  dealerOffers: [],
  notifications: seedNotifications(),
  consent: { telemetry: true, personalizedOffers: true, pushNotifications: true },
  demo: { simulateNetworkError: false, telemetrySource: 'simulador', mqttUrl: DEFAULT_MQTT_URL },
  events: [],
  leads: [],
  redemptions: [],
});

const AppContext = createContext<AppContextValue | null>(null);

const PERSISTED: (keyof Omit<AppState, 'isReady'>)[] = [
  'vehicle',
  'appointments',
  'offerStates',
  'dealerOffers',
  'notifications',
  'consent',
  'demo',
  'events',
  'leads',
  'redemptions',
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({ ...defaultState(), isReady: false });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      const d = defaultState();
      const loaded = await Promise.all(PERSISTED.map((k) => storage.get(k, d[k])));
      const next = Object.fromEntries(PERSISTED.map((k, i) => [k, loaded[i]])) as Omit<AppState, 'isReady'>;
      next.demo = { ...d.demo, ...next.demo };
      setNetworkFailure(next.demo.simulateNetworkError);
      setState({ ...next, isReady: true });
    })();
  }, []);

  const patch = useCallback(<K extends keyof Omit<AppState, 'isReady'>>(key: K, updater: (prev: AppState[K]) => AppState[K]) => {
    setState((s) => {
      const value = updater(s[key]);
      storage.set(key, value);
      return { ...s, [key]: value };
    });
  }, []);

  const addNotification = useCallback<AppContextValue['addNotification']>(
    ({ title, body, type, route, push = true }) => {
      const n: AppNotification = { id: uid('n'), title, body, type, route, read: false, createdAt: new Date().toISOString() };
      patch('notifications', (list) => [n, ...list].slice(0, 60));
      if (push && stateRef.current.consent.pushNotifications) notifyNow(title, body, route);
    },
    [patch],
  );

  const logEvent = useCallback<AppContextValue['logEvent']>(
    (customerId, type, detail) => {
      patch('events', (list) => [{ id: uid('ev'), customerId, type, detail, at: new Date().toISOString() }, ...list].slice(0, 200));
    },
    [patch],
  );

  const updateMileage = useCallback(
    async (km: number) => {
      patch('vehicle', (v) => ({ ...v, mileage: Math.round(km) }));
    },
    [patch],
  );

  const setOfferStatus = useCallback<AppContextValue['setOfferStatus']>(
    (offer, status) => {
      const prev = stateRef.current.offerStates[offer.id]?.status ?? offer.status;
      if (prev === status || prev === 'aceita') return;
      if (offer.source === 'concessionaria') {
        patch('dealerOffers', (list) => list.map((o) => (o.id === offer.id ? { ...o, status } : o)));
      } else {
        patch('offerStates', (m) => ({ ...m, [offer.id]: { status, createdAt: m[offer.id]?.createdAt ?? new Date().toISOString() } }));
      }
      const map = { vista: 'oferta_vista', aceita: 'oferta_aceita', recusada: 'oferta_recusada' } as const;
      if (status !== 'nova') logEvent(APP_CUSTOMER_ID, map[status], offer.title);
      patch('leads', (list) =>
        list.map((l) =>
          l.offerId === offer.id
            ? { ...l, status: status === 'aceita' ? 'agendado' : status === 'recusada' ? 'perdido' : l.status === 'enviado' ? 'visualizado' : l.status }
            : l,
        ),
      );
    },
    [patch, logEvent],
  );

  const addAppointment = useCallback<AppContextValue['addAppointment']>(
    async ({ serviceId, dealerId, date, notes, offer }) => {
      const service = services.find((s) => s.id === serviceId) ?? services[0];
      const dealer = dealers.find((d) => d.id === dealerId) ?? dealers[0];
      const discountPct = offer && offer.serviceId === serviceId ? offer.discountPct : 0;
      const price = Math.round(service.basePrice * (1 - discountPct / 100));
      const when = new Date(date);
      const reminderAt = new Date(when.getTime() - DAY);
      const reminderId = stateRef.current.consent.pushNotifications
        ? await scheduleReminder('Lembrete: seu serviço é amanhã', `${service.title} na ${dealer.name}, ${formatDateTime(when)}.`, reminderAt, '/agenda')
        : undefined;
      const apt: Appointment = {
        id: uid('apt'),
        serviceId,
        dealerId,
        date,
        notes,
        status: 'confirmado',
        price,
        discountPct,
        offerId: offer?.id,
        pointsEarned: POINTS_PER_APPOINTMENT,
        createdAt: new Date().toISOString(),
        reminderId,
      };
      patch('appointments', (list) => [apt, ...list]);
      patch('vehicle', (v) => ({ ...v, loyaltyPoints: v.loyaltyPoints + POINTS_PER_APPOINTMENT }));
      if (offer) setOfferStatus(offer, 'aceita');
      logEvent(APP_CUSTOMER_ID, 'agendamento', `${service.title} — ${formatDateTime(when)}`);
      addNotification({
        title: 'Agendamento confirmado',
        body: `${service.title} na ${dealer.name}, ${formatDateTime(when)}. +${POINTS_PER_APPOINTMENT} pontos!`,
        type: 'agendamento',
        route: `/agendamento/${apt.id}`,
      });
      return apt;
    },
    [patch, setOfferStatus, logEvent, addNotification],
  );

  const cancelAppointment = useCallback(
    async (id: string) => {
      const apt = stateRef.current.appointments.find((a) => a.id === id);
      if (!apt || apt.status !== 'confirmado') return;
      await cancelReminder(apt.reminderId);
      patch('appointments', (list) => list.map((a) => (a.id === id ? { ...a, status: 'cancelado' } : a)));
      patch('vehicle', (v) => ({ ...v, loyaltyPoints: Math.max(0, v.loyaltyPoints - apt.pointsEarned) }));
      const service = services.find((s) => s.id === apt.serviceId);
      logEvent(APP_CUSTOMER_ID, 'cancelamento', service?.title ?? 'Serviço');
      addNotification({ title: 'Agendamento cancelado', body: `${service?.title} foi cancelado. Os pontos foram estornados.`, type: 'agendamento', push: false });
    },
    [patch, logEvent, addNotification],
  );

  const markNotificationRead = useCallback((id: string) => patch('notifications', (l) => l.map((n) => (n.id === id ? { ...n, read: true } : n))), [patch]);
  const markAllNotificationsRead = useCallback(() => patch('notifications', (l) => l.map((n) => ({ ...n, read: true }))), [patch]);
  const setConsent = useCallback((c: Partial<ConsentSettings>) => patch('consent', (p) => ({ ...p, ...c })), [patch]);
  const setDemo = useCallback(
    (d: Partial<DemoSettings>) => {
      if (d.simulateNetworkError !== undefined) setNetworkFailure(d.simulateNetworkError);
      patch('demo', (p) => ({ ...p, ...d }));
    },
    [patch],
  );

  const sendDealerOffer = useCallback<AppContextValue['sendDealerOffer']>(
    ({ customerId, title, serviceId, discountPct, channel }) => {
      const offerId = uid('of');
      const lead: Lead = { id: uid('lead'), customerId, title, channel, status: 'enviado', createdAt: new Date().toISOString(), offerId };
      patch('leads', (l) => [lead, ...l]);
      logEvent(customerId, 'oferta_enviada', `${title} (${channel === 'app' ? 'app' : channel === 'whatsapp' ? 'WhatsApp' : 'ligação'})`);
      if (customerId === APP_CUSTOMER_ID && channel === 'app') {
        const offer: Offer = {
          id: offerId,
          title,
          description: 'Oferta exclusiva enviada pela sua concessionária Ford.',
          serviceId,
          discountPct,
          validUntil: new Date(Date.now() + 15 * DAY).toISOString(),
          reason: 'Seu consultor preparou esta condição especial para você.',
          tag: 'concessionaria',
          source: 'concessionaria',
          status: 'nova',
          createdAt: new Date().toISOString(),
        };
        patch('dealerOffers', (l) => [offer, ...l]);
        addNotification({ title: 'Nova oferta da sua concessionária', body: `${title}. Toque para ver e agendar.`, type: 'oferta', route: `/oferta/${offerId}` });
      }
      return lead;
    },
    [patch, logEvent, addNotification],
  );

  const registerContact = useCallback(
    (customerId: string, channel: LeadChannel, note: string) => {
      logEvent(customerId, 'contato', `${channel === 'whatsapp' ? 'WhatsApp' : channel === 'ligacao' ? 'Ligação' : 'App'}: ${note}`);
    },
    [logEvent],
  );

  const redeemReward = useCallback(
    (title: string, points: number) => {
      if (stateRef.current.vehicle.loyaltyPoints < points) return null;
      const r: Redemption = { id: uid('rd'), title, points, code: `FC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, at: new Date().toISOString() };
      patch('vehicle', (v) => ({ ...v, loyaltyPoints: v.loyaltyPoints - points }));
      patch('redemptions', (l) => [r, ...l]);
      addNotification({ title: 'Benefício resgatado', body: `${title} — apresente o código ${r.code} na concessionária.`, type: 'sistema', push: false });
      return r;
    },
    [patch, addNotification],
  );

  const resetDemoData = useCallback(async () => {
    await storage.clearAll();
    const d = defaultState();
    setNetworkFailure(false);
    setState({ ...d, isReady: true });
  }, []);

  const unreadCount = useMemo(() => state.notifications.filter((n) => !n.read).length, [state.notifications]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      unreadCount,
      updateMileage,
      addAppointment,
      cancelAppointment,
      setOfferStatus,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      setConsent,
      setDemo,
      logEvent,
      sendDealerOffer,
      registerContact,
      resetDemoData,
      redeemReward,
    }),
    [
      state,
      unreadCount,
      updateMileage,
      addAppointment,
      cancelAppointment,
      setOfferStatus,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      setConsent,
      setDemo,
      logEvent,
      sendDealerOffer,
      registerContact,
      resetDemoData,
      redeemReward,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}
