import { customers, dealers, demoUsers, services } from '@/data/mockData';
import { Customer, Dealer, ServiceItem, Session, User } from '@/types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let forceFailure = false;
export const setNetworkFailure = (v: boolean) => {
  forceFailure = v;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(producer: () => T, latency = 600): Promise<T> {
  await wait(latency + Math.random() * 300);
  if (forceFailure) throw new ApiError('Sem conexão com o servidor. Verifique sua internet.', 503);
  return producer();
}

function fakeJwt(user: User, expiresAt: number) {
  const b64 = (o: object) =>
    globalThis.btoa
      ? globalThis.btoa(unescape(encodeURIComponent(JSON.stringify(o))))
      : JSON.stringify(o);
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, role: user.role, exp: Math.floor(expiresAt / 1000) })}.demo-signature`;
}

export const api = {
  async login(email: string, password: string): Promise<Session> {
    await wait(900);
    if (forceFailure) throw new ApiError('Sem conexão com o servidor. Verifique sua internet.', 503);
    const found = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || found.password !== password) throw new ApiError('E-mail ou senha incorretos.', 401);
    const { password: _pw, ...user } = found;
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    return { token: fakeJwt(user, expiresAt), user, expiresAt };
  },
  getDealers: (): Promise<Dealer[]> => request(() => dealers),
  getServices: (): Promise<ServiceItem[]> => request(() => services, 400),
  getCustomers: (): Promise<Customer[]> => request(() => customers, 800),
  getSlots: (dealerId: string, day: Date): Promise<{ time: string; available: boolean }[]> =>
    request(() => {
      const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '14:30', '15:00', '16:00'];
      const seed = day.getDate() + day.getMonth() * 31 + dealerId.length;
      return times.map((time, i) => ({ time, available: (seed * (i + 3)) % 5 !== 0 }));
    }, 450),
};
