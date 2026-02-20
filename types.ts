
export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'snack' | 'drink' | 'food' | 'dessert';
  stock: number;
}

export interface Company {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  whatsapp: string;
  companyId: string;
}

export interface ConsumptionItem {
  productId: string;
  quantity: number;
  priceAtTime: number;
}

export interface Consumption {
  id: string;
  employeeId: string;
  items: ConsumptionItem[];
  date: string; // ISO string
  payment: Payment | null;
}

export interface Payment {
  date: string; // ISO string
  method: 'pix' | 'cash' | 'card';
}

export interface Subscription {
  status: 'active' | 'expired' | 'trial';
  expirationDate: string; // ISO string
  pixKey: string;
  pixCopiaCola: string;
  monthlyValue: number;
}