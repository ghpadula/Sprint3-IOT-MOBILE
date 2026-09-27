import { CepAddress } from '@/types';

export async function fetchAddressByCep(cep: string): Promise<CepAddress> {
  const normalized = cep.replace(/\D/g, '');

  if (normalized.length !== 8) {
    throw new Error('Informe um CEP com 8 dígitos.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`, { signal: controller.signal });
    if (!response.ok) throw new Error('Não foi possível consultar o CEP agora.');
    const data = await response.json();
    if (data.erro) throw new Error('CEP não encontrado.');
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
    };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw new Error('A consulta demorou demais. Tente novamente.');
    if (e instanceof TypeError) throw new Error('Sem conexão com a internet.');
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export const maskCep = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
