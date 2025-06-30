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
    const error = await res.json().catch(() => ({ msg: 'Ocurrió un error en el servidor' }));
    // Lanza el mensaje de error del backend, o uno genérico si no lo hay.
    throw new Error(error.msg || 'Error de red o del servidor');
  }
  // Para métodos DELETE que pueden no devolver un cuerpo JSON
  if (res.status === 204 || res.headers.get('Content-Length') === '0') {
      return null; 
  }
  return res.json();
}

// --- Tipos para los cuerpos de las solicitudes (Payloads) ---
// Esto mejora la claridad y previene errores.
type AccountPayload = { account_name: string; card: string; balance: number };
type IncomePayload = { income_name: string; income_date: string; description: string; category: string; amount: number; account_id: number };
type ServicePayload = { service_name: string; description: string; date: string; category: string; price: number; reamining_price: number; account_id: number; expiration_date: string };
type LoanPayload = { loan_name: string; holder: string; price: number; description: string | null; date: string; quota: number | null; tea: number | null; reamining_price: number; account_id: number; expiration_date: string; };
type PaymentPayload = { amount: number; date: string; description: string | null; };
type ScheduledIncomePayload = { income_name: string; income_date: string; description: string; category: string; next_income: string; amount: number; received_amount: number; pending_amount: number; account_id: number; };

export const api = {
  // --- Auth ---
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
  
  // --- Accounts ---
  async getAccounts() { return request('/accounts/'); },
  async createAccount(account: AccountPayload) {
    return request('/accounts/', { method: 'POST', body: JSON.stringify(account) });
  },
  async updateAccount(id: number, account: Partial<AccountPayload>) {
    return request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(account) });
  },
  async deleteAccount(id: number) {
    return request(`/accounts/${id}`, { method: 'DELETE' });
  },

  // --- Incomes ---
  async getIncomes() { return request('/incomes/'); },
  async createIncome(income: IncomePayload) {
    return request('/incomes/', { method: 'POST', body: JSON.stringify(income) });
  },
  async updateIncome(id: number, income: Partial<IncomePayload>) {
    return request(`/incomes/${id}`, { method: 'PUT', body: JSON.stringify(income) });
  },
  async deleteIncome(id: number) {
    return request(`/incomes/${id}`, { method: 'DELETE' });
  },
  
  // --- Services ---
  async getServices() { return request('/services/'); },
  async createService(service: ServicePayload) {
    return request('/services/', { method: 'POST', body: JSON.stringify(service) });
  },
  async updateService(id: number, service: Partial<ServicePayload>) {
    return request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(service) });
  },
  async deleteService(id: number) {
    return request(`/services/${id}`, { method: 'DELETE' });
  },

  // --- Loans ---
  async getLoans() { return request('/loans/'); },
  async createLoan(loan: LoanPayload) { // CORREGIDO
    return request('/loans/', { method: 'POST', body: JSON.stringify(loan) });
  },
  async updateLoan(id: number, loan: Partial<LoanPayload>) { // CORREGIDO
    return request(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(loan) });
  },
  async deleteLoan(id: number) {
    return request(`/loans/${id}`, { method: 'DELETE' });
  },
  
  // --- Loan Payments ---
  async getLoanPayments() { return request('/loan_payments/'); },
  async createLoanPayment(payment: PaymentPayload & { loan_id: number }) { // CORREGIDO
    return request('/loan_payments/', { method: 'POST', body: JSON.stringify(payment) });
  },
  async updateLoanPayment(id: number, payment: Partial<PaymentPayload & { loan_id: number }>) { // CORREGIDO
    return request(`/loan_payments/${id}`, { method: 'PUT', body: JSON.stringify(payment) });
  },
  async deleteLoanPayment(id: number) {
    return request(`/loan_payments/${id}`, { method: 'DELETE' });
  },

  // --- Service Payments ---
  async getServicePayments() { return request('/service_payments/'); },
  async createServicePayment(payment: PaymentPayload & { service_id: number }) { // CORREGIDO
    return request('/service_payments/', { method: 'POST', body: JSON.stringify(payment) });
  },
  async updateServicePayment(id: number, payment: Partial<PaymentPayload & { service_id: number }>) { // CORREGIDO
    return request(`/service_payments/${id}`, { method: 'PUT', body: JSON.stringify(payment) });
  },
  async deleteServicePayment(id: number) {
    return request(`/service_payments/${id}`, { method: 'DELETE' });
  },

  // --- Scheduled Incomes ---
  async getScheduledIncomes() { return request('/scheduled_incomes/'); },
  async createScheduledIncome(income: ScheduledIncomePayload) { // CORREGIDO
    return request('/scheduled_incomes/', { method: 'POST', body: JSON.stringify(income) });
  },
  async updateScheduledIncome(id: number, income: Partial<ScheduledIncomePayload>) { // CORREGIDO
    return request(`/scheduled_incomes/${id}`, { method: 'PUT', body: JSON.stringify(income) });
  },
  async deleteScheduledIncome(id: number) {
    return request(`/scheduled_incomes/${id}`, { method: 'DELETE' });
  },
};