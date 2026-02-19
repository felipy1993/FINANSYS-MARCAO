
import { Company, Employee, Product, Consumption } from '../types';
import { GUEST_COMPANY_ID, GUEST_EMPLOYEE_ID } from '../constants';

// Arquivo limpo para produção
export const initialProducts: Product[] = [];

export const initialCompanies: Company[] = [
  { id: GUEST_COMPANY_ID, name: 'Vendas Avulsas' }
];

export const initialEmployees: Employee[] = [
  { id: GUEST_EMPLOYEE_ID, name: 'Cliente Não Identificado', whatsapp: '', companyId: GUEST_COMPANY_ID }
];

export const initialConsumptions: Consumption[] = [];