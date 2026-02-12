import { InventoryRisk } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InventoryRiskPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category;

  // Construir URL de la API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(`${baseUrl}/api/reports/inventory-risk`);
  if (categoryId) {
    url.searchParams.set('category', categoryId);
  }

  // Llamar a la API
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al obtener datos de inventario');
  }

  const responseData = await response.json();
  const inventory: InventoryRisk[] = responseData.data;
  const criticalCount = responseData.kpi.criticalCount;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block font-medium">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Riesgo de Inventario</h1>
        <p className="text-gray-600 mb-6">
          Productos con poco stock
        </p>

        <form method="get" className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por categoria
              </label>
              <select
                name="category"
                defaultValue={categoryId?.toString() || ''}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todas las categorias</option>
                <option value="1">Cafes</option>
                <option value="2">Tes e Infusiones</option>
                <option value="3">Postres</option>
                <option value="4">Sandwiches</option>
                <option value="5">Bebidas Frias</option>
                <option value="6">Desayunos</option>
                <option value="7">Snacks</option>
                <option value="8">Especiales</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>
        </form>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Productos en Riesgo</p>
          <p className="text-xl font-bold text-purple-600">
            {criticalCount}
          </p>
          <p className="text-sm text-gray-600">productos criticos o sin stock</p>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-purple-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Ventas 30d
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  % Riesgo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Nivel
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.product_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.stock_actual}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.ventas_ultimos_30_dias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(item.porcentaje_riesgo).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                      {item.risk_level}
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
