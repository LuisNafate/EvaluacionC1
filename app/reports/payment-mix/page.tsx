import { query } from '@/lib/db';
import { PaymentMix } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Traer mix de pagos
async function getPaymentMix() {
  const data = await query<PaymentMix>(
    'SELECT * FROM reports.vw_payment_mix ORDER BY total_amount DESC'
  );
  return data;
}

export default async function PaymentMixPage() {
  const payments = await getPaymentMix();

  // KPI: metodo mas usado
  const topMethod = payments[0];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block font-medium">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Tipos de Pago</h1>
        <p className="text-gray-600 mb-6">
          Como pagan los clientes (efectivo, tarjeta, etc)
        </p>

        {/* KPI destacado */}
        {topMethod && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Metodo mas usado</p>
            <p className="text-xl font-bold text-purple-600 mb-1">
              {topMethod.payment_method}
            </p>
            <p className="text-base text-gray-700">
              {Number(topMethod.porcentaje).toFixed(1)}% del total
            </p>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-purple-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Metodo de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Num. Pagos
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Porcentaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${Number(item.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.num_payments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(item.avg_per_payment).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 h-2 mr-2">
                        <div 
                          className="bg-purple-600 h-2" 
                          style={{width: `${Math.min(100, Number(item.porcentaje))}%`}}
                        ></div>
                      </div>
                      <span>{Number(item.porcentaje).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tipo_metodo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
