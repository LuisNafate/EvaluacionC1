import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Dashboard de Cafeteria</h1>
        <p className="text-gray-600 mb-8">Reportes y analisis de ventas</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reporte 1 */}
          <Link href="/reports/sales-daily">
            <div className="border-l-4 border-purple-600 pl-4 py-2 hover:bg-gray-100 transition-all">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Ventas por Dia</h2>
              <p className="text-gray-600">
                Cuanto se vendio cada dia, tickets y promedios
              </p>
            </div>
          </Link>

          {/* Reporte 2 */}
          <Link href="/reports/top-products">
            <div className="border-l-4 border-purple-600 pl-4 py-2 hover:bg-gray-100 transition-all">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Top Productos</h2>
              <p className="text-gray-600">
                Los productos mas vendidos con ranking
              </p>
            </div>
          </Link>

          {/* Reporte 3 */}
          <Link href="/reports/inventory-risk">
            <div className="border-l-4 border-purple-600 pl-4 py-2 hover:bg-gray-100 transition-all">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Riesgo de Inventario</h2>
              <p className="text-gray-600">
                Productos con poco stock
              </p>
            </div>
          </Link>

          {/* Reporte 4 */}
          <Link href="/reports/customer-value">
            <div className="border-l-4 border-purple-600 pl-4 py-2 hover:bg-gray-100 transition-all">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Valor de Clientes</h2>
              <p className="text-gray-600">
                Cuanto ha gastado cada cliente
              </p>
            </div>
          </Link>

          {/* Reporte 5 */}
          <Link href="/reports/payment-mix">
            <div className="border-l-4 border-purple-600 pl-4 py-2 hover:bg-gray-100 transition-all">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Tipos de Pago</h2>
              <p className="text-gray-600">
                Como pagan los clientes (efectivo, tarjeta, etc)
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

