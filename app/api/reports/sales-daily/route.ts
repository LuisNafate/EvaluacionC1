import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { SalesDaily } from '@/lib/types';

export const dynamic = 'force-dynamic';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const querySchema = z.object({
  dateFrom: z.string().regex(DATE_REGEX, 'Formato inválido. Use YYYY-MM-DD').optional(),
  dateTo: z.string().regex(DATE_REGEX, 'Formato inválido. Use YYYY-MM-DD').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    const validatedParams = querySchema.parse(rawParams);

    let sql = 'SELECT * FROM reports.vw_sales_daily WHERE 1=1';
    const params: string[] = [];

    if (validatedParams.dateFrom) {
      params.push(validatedParams.dateFrom);
      sql += ` AND day >= $${params.length}`;
    }
    if (validatedParams.dateTo) {
      params.push(validatedParams.dateTo);
      sql += ` AND day <= $${params.length}`;
    }

    sql += ' ORDER BY day DESC';
    
    const data = await query<SalesDaily>(sql, params);

    const totalVentas = data.reduce((sum, item) => sum + Number(item.total_ventas), 0);

    return NextResponse.json({
      success: true,
      data,
      kpi: {
        totalVentas
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

    console.error('Error en API sales-daily:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
