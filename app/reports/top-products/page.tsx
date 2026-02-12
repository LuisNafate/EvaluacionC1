import { TopProductRanked } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TopProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const page = params.page;
  const limit = params.limit;

  // Construir URL de la API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(`${baseUrl}/api/reports/top-products`);
  if (search) {
    url.searchParams.set('search', search);
  }
  if (page) {
    url.searchParams.set('page', page);
  }
  if (limit) {
    url.searchParams.set('limit', limit);
  }

  // Llamar a la API
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al obtener productos top');
  }

  const responseData = await response.json();
  const products: TopProductRanked[] = responseData.data;
  const { page: currentPage, limit: currentLimit, totalPages } = responseData.pagination;
  const topProduct = responseData.kpi.topProduct;

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
            {currentPage > 1 && (
              <Link
                href={`?page=${currentPage - 1}&limit=${currentLimit}${search ? `&search=${search}` : ''}`}
                className="px-4 py-2 border border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-colors"
              >
                Anterior
              </Link>
            )}
            <span className="px-4 py-2 text-gray-600">
              Pagina {currentPage} de {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`?page=${currentPage + 1}&limit=${currentLimit}${search ? `&search=${search}` : ''}`}
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
