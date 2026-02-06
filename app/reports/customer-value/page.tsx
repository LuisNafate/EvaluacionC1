import { query } from '@/lib/db';
import { CustomerValue } from '@/lib/types';
import { validatePagination } from '@/lib/validators';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Traer valor de clientes con paginacion
async function getCustomerValue(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT * FROM reports.vw_customer_value 
    ORDER BY total_gastado DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const data = await query<CustomerValue>(sql);
  return data;
}

async function getTotalCount() {
  const result = await query<{ total: string }>(
    'SELECT COUNT(*) as total FROM reports.vw_customer_value'
  );
  return parseInt(result[0]?.total || '0', 10);
}

export default async function CustomerValuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  // Validar paginacion
  const params = await searchParams;
  const { page, limit, offset } = validatePagination(
    params.page,
    params.limit
  );

  const customers = await getCustomerValue(page, limit);
  const totalCount = await getTotalCount();
  const totalPages = Math.ceil(totalCount / limit);

  // KPI: clientes VIP
  const vipCount = customers.filter(c => c.segmento_cliente === 'VIP').length;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block font-medium">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Valor de Clientes</h1>
        <p className="text-gray-600 mb-6">
          Cuanto ha gastado cada cliente
        </p>

        {/* KPI destacado */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Clientes VIP</p>
          <p className="text-xl font-bold text-purple-600">
            {vipCount}
          </p>
          <p className="text-sm text-gray-600">clientes con mas de $1000 gastados</p>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-purple-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Total Gastado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  ordenes
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Segmento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((item) => (
                <tr key={item.customer_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${Number(item.total_gastado).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.num_ordenes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(item.gasto_promedio).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                      {item.segmento_cliente}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}&limit=${limit}`}
                className="px-4 py-2 border border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-colors"
              >
                Anterior
              </Link>
            )}
            <span className="px-4 py-2 text-gray-600">
              Pagina {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`?page=${page + 1}&limit=${limit}`}
                className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Siguiente
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
