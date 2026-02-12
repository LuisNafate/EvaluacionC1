import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { InventoryRisk } from '@/lib/types';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  category: z.coerce.number().int().positive('Debe ser un número positivo').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      category: searchParams.get('category') || undefined,
    };

    const validatedParams = querySchema.parse(rawParams);

    let sql = 'SELECT * FROM reports.vw_inventory_risk WHERE 1=1';
    const params: number[] = [];

    if (validatedParams.category) {
      params.push(validatedParams.category);
      sql += ` AND category_id = $${params.length}`;
    }

    sql += ' ORDER BY porcentaje_riesgo DESC';
    
    const data = await query<InventoryRisk>(sql, params);

    const criticalCount = data.filter(
      item => item.risk_level === 'Critico' || item.risk_level === 'Sin Stock'
    ).length;

    return NextResponse.json({
      success: true,
      data,
      kpi: {
        criticalCount
      },
      metadata: {
        count: data.length,
        filters: validatedParams,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validación fallida',
          details: error.issues.map((e: z.ZodIssue) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('Error en API inventory-risk:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
