import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Cafeteria",
  description: "Reportes de la cafeteria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">
        <nav className="bg-purple-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-xl font-bold">Dashboard</a>
                <div className="flex space-x-4">
                  <a href="/" className="hover:bg-purple-700 px-3 py-2 text-sm transition">Inicio</a>
                  <a href="/reports/top-products" className="hover:bg-purple-700 px-3 py-2 text-sm transition">Ranking</a>
                  <a href="/reports/inventory-risk" className="hover:bg-purple-700 px-3 py-2 text-sm transition">Inventario</a>
                  <a href="/reports/customer-value" className="hover:bg-purple-700 px-3 py-2 text-sm transition">Actividad</a>
                  <a href="/reports/payment-mix" className="hover:bg-purple-700 px-3 py-2 text-sm transition">Resumen</a>
                  <a href="/reports/sales-daily" className="hover:bg-purple-700 px-3 py-2 text-sm transition">Ventas Diarias</a>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
