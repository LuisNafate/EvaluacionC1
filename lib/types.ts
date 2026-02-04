// Tipos para los datos que vienen de las views

export interface SalesDaily {
  day: string;
  total_ventas: number;
  tickets: number;
  ticket_promedio: number;
  nivel_ventas: 'Alto' | 'Medio' | 'Bajo';
}

export interface TopProductRanked {
  product_id: number;
  product_name: string;
  category_name: string;
  total_revenue: number;
  total_qty: number;
  revenue_rank: number;
  qty_rank: number;
  avg_price_per_unit: number;
}

export interface InventoryRisk {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  stock_actual: number;
  price: number;
  ventas_ultimos_30_dias: number;
  risk_level: 'Sin Stock' | 'Critico' | 'Bajo' | 'Medio' | 'Suficiente';
  porcentaje_riesgo: number;
  active: boolean;
}

export interface CustomerValue {
  customer_id: number;
  customer_name: string;
  email: string;
  num_ordenes: number;
  total_gastado: number;
  gasto_promedio: number;
  orden_maxima: number;
  orden_minima: number;
  segmento_cliente: 'VIP' | 'Frecuente' | 'Regular' | 'Nuevo';
}

export interface PaymentMix {
  payment_method: string;
  total_amount: number;
  num_payments: number;
  avg_per_payment: number;
  porcentaje: number;
  tipo_metodo: 'Metodo Tradicional' | 'Metodo Electronico' | 'Metodo Digital' | 'Otro';
}

