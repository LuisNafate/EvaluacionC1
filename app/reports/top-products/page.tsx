import { query } from '@/lib/db';
import { TopProductRanked } from '@/lib/types';
import { validatePagination, sanitizeSearch } from '@/lib/validators';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Traer los productos mas vendidos con busqueda y paginacion
async function getTopProducts(search?: string, page = 1, limit = 10) {
  let sql = 'SELECT * FROM reports.vw_top_products_ranked WHERE 1=1';
  const params: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND product_name ILIKE $${params.length}`;
  }

  sql += ' ORDER BY revenue_rank';
  sql += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
  
  const data = await query<TopProductRanked>(sql, params);
  return data;
}

async function getTotalCount(search?: string) {
  let sql = 'SELECT COUNT(*) as total FROM reports.vw_top_products_ranked WHERE 1=1';
  const params: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND product_name ILIKE $${params.length}`;
  }

  const result = await query<{ total: string }>(sql, params);
  return parseInt(result[0]?.total || '0', 10);
}

export default async function TopProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
  // Validar parametros
  const params = await searchParams;
  const search = sanitizeSearch(params.search);
  const { page, limit, offset } = validatePagination(
    params.page,
    params.limit
  );

  const products = await getTopProducts(search, page, limit);
  const totalCount = await getTotalCount(search);
  const totalPages = Math.ceil(totalCount / limit);

  // KPI: producto numero 1
  const topProduct = products[0];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block font-medium">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Top Productos</h1>
        <p className="text-gray-600 mb-6">
          Los productos mas vendidos con ranking
        </p>

        {/* Busqueda */}
        <form method="get" className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar producto
              </label>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Nombre del producto..."
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </form>

        {/* KPI destacado */}
        {topProduct && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Producto #1</p>
            <p className="text-xl font-bold text-purple-600 mb-1">
              {topProduct.product_name}
            </p>
            <p className="text-base text-gray-700">
              ${Number(topProduct.total_revenue).toFixed(2)} en ventas
            </p>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-purple-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Total Ventas
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Precio Prom
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((item) => (
                <tr key={item.product_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                    #{item.revenue_rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(item.total_revenue).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.total_qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(item.avg_price_per_unit).toFixed(2)}
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
                href={`?page=${page - 1}&limit=${limit}${search ? `&search=${search}` : ''}`}
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
                href={`?page=${page + 1}&limit=${limit}${search ? `&search=${search}` : ''}`}
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
