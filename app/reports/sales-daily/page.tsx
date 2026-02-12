import { SalesDaily } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SalesDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const dateFrom = params.dateFrom;
  const dateTo = params.dateTo;

  // Construir URL de la API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(`${baseUrl}/api/reports/sales-daily`);
  if (dateFrom) {
    url.searchParams.set('dateFrom', dateFrom);
  }
  if (dateTo) {
    url.searchParams.set('dateTo', dateTo);
  }

  // Llamar a la API
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al obtener ventas diarias');
  }

  const responseData = await response.json();
  const sales: SalesDaily[] = responseData.data;
  const totalVentas = responseData.kpi.totalVentas;

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

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Total de Ventas</p>
          <p className="text-xl font-bold text-purple-600">
            ${totalVentas.toFixed(2)}
          </p>
        </div>

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
