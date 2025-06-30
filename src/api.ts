// api.ts - Centraliza llamadas al backend y manejo de token JWT

const API_URL = 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.msg || 'Error de red');
  }
  return res.json();
}

export const api = {
  async login(email: string, password: string) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    return data.user;
  },
  async register(username: string, email: string, password: string) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },
  async me() {
    return request('/auth/me');
  },
  async getAccounts() {
    return request('/accounts/');
  },
  async createAccount(account: { account_name: string; card: string; balance: number }) {
    return request('/accounts/', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  },
  async getIncomes() {
    return request('/incomes/');
  },
  async createIncome(income: { income_name: string; income_date: string; description: string; category: string; amount: number; account_id: number }) {
    return request('/incomes/', {
      method: 'POST',
      body: JSON.stringify(income),
    });
  },
  async getServices() {
    return request('/services/');
  },
  async createService(service: { service_name: string; description: string; date: string; category: string; price: number; reamining_price: number; account_id: number; expiration_date: string }) {
    return request('/services/', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },
  async getLoans() {
    return request('/loans/');
  },
  async createLoan(loan: { amount: number; description: string }) {
    return request('/loans/', {
      method: 'POST',
      body: JSON.stringify(loan),
    });
  },
  async updateLoan(id: number, loan: { amount?: number; description?: string }) {
    return request(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loan),
    });
  },
  async deleteLoan(id: number) {
    return request(`/loans/${id}`, {
      method: 'DELETE',
    });
  },
  async getLoanPayments() {
    return request('/loan_payments/');
  },
  async createLoanPayment(payment: { amount: number; payment_date: string; loan_id: number }) {
    return request('/loan_payments/', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },
  async updateLoanPayment(id: number, payment: { amount?: number; payment_date?: string; loan_id?: number }) {
    return request(`/loan_payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    });
  },
  async deleteLoanPayment(id: number) {
    return request(`/loan_payments/${id}`, {
      method: 'DELETE',
    });
  },
  async getServicePayments() {
    return request('/service_payments/');
  },
  async createServicePayment(payment: { amount: number; payment_date: string; service_id: number }) {
    return request('/service_payments/', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },
  async updateServicePayment(id: number, payment: { amount?: number; payment_date?: string; service_id?: number }) {
    return request(`/service_payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    });
  },
  async deleteServicePayment(id: number) {
    return request(`/service_payments/${id}`, {
      method: 'DELETE',
    });
  },
  async getScheduledIncomes() {
    return request('/scheduled_incomes/');
  },
  async createScheduledIncome(income: { amount: number; scheduled_date: string; description: string; account_id: number }) {
    return request('/scheduled_incomes/', {
      method: 'POST',
      body: JSON.stringify(income),
    });
  },
  async updateScheduledIncome(id: number, income: { amount?: number; scheduled_date?: string; description?: string; account_id?: number }) {
    return request(`/scheduled_incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(income),
    });
  },
  async deleteScheduledIncome(id: number) {
    return request(`/scheduled_incomes/${id}`, {
      method: 'DELETE',
    });
  },
  // Agrega aquí más métodos para loans, services, etc.
};
