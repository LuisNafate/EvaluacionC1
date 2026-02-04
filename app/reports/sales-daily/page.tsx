import { query } from '@/lib/db';
import { SalesDaily } from '@/lib/types';
import { dateFormatSchema } from '@/lib/validators';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Traer los datos del servidor con filtros opcionales
async function getSalesDaily(dateFrom?: string, dateTo?: string) {
  let sql = 'SELECT * FROM reports.vw_sales_daily WHERE 1=1';
  const params: string[] = [];

  if (dateFrom) {
    params.push(dateFrom);
    sql += ` AND day >= $${params.length}`;
  }
  if (dateTo) {
    params.push(dateTo);
    sql += ` AND day <= $${params.length}`;
  }

  sql += ' ORDER BY day DESC';
  
  const data = await query<SalesDaily>(sql, params);
  return data;
}

export default async function SalesDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  // Validar fechas
  const params = await searchParams;
  let dateFrom = params.dateFrom;
  let dateTo = params.dateTo;

  if (dateFrom && !dateFormatSchema.safeParse(dateFrom).success) {
    dateFrom = undefined;
  }
  if (dateTo && !dateFormatSchema.safeParse(dateTo).success) {
    dateTo = undefined;
  }

  const sales = await getSalesDaily(dateFrom, dateTo);

  // Calcular KPI: total de ventas de todos los dias
  const totalVentas = sales.reduce((sum, item) => sum + Number(item.total_ventas), 0);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block font-medium">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Ventas por Dia</h1>
        <p className="text-gray-600 mb-6">
          Cuanto se vendio cada dia, cuantos tickets y el promedio
        </p>

        {/* Filtros de fecha */}
        <form method="get" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFrom}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                name="dateTo"
                defaultValue={dateTo}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>
        </form>

        {/* KPI destacado */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Total de Ventas</p>
          <p className="text-xl font-bold text-purple-600">
            ${totalVentas.toFixed(2)}
          </p>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-purple-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Dia
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Total Ventas
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Nivel
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.day).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(item.total_ventas).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(item.ticket_promedio).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                      {item.nivel_ventas}
                    </span>
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
