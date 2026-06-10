import fetch from 'node-fetch';
import 'dotenv/config';

const BASE    = process.env.API_URL;
const VERSION = '1.0.0';

let _token = null;

async function getToken() {
  if (_token) return _token;
  const res = await fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-App-Version': VERSION },
    body: JSON.stringify({
      login:    process.env.ADMIN_LOGIN,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login xatolik: ' + JSON.stringify(data));
  _token = data.token;
  return _token;
}

async function request(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Version': VERSION,
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { _token = null; return request(path, options); }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export const api = {
  getOrders:      (q = '')   => request(`/orders?limit=50${q}`),
  getOrder:       (id)       => request(`/orders/${id}`),
  getUsers:       ()         => request('/users'),
  getSettings:    ()         => request('/settings'),
  getBalances:    ()         => request('/settlements/balances'),
  getCollections: (date)     => request(`/orders/drivers/collections?date=${date}`),
  getServices:    ()         => request('/services'),
  getUsers:       ()         => request('/users'),
  getActiveOrders: ()        => request('/orders?limit=500&page=1'),
  getOrdersByChat: (chatId)  => request(`/orders/by-chat/${chatId}`),
  createOrder:    (body)     => request('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};
