import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { CustomerValue } from '@/lib/types';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100, 'Límite máximo: 100').default(10),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validatedParams = querySchema.parse(rawParams);
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    const sql = `
      SELECT * FROM reports.vw_customer_value 
      ORDER BY total_gastado DESC 
      LIMIT ${validatedParams.limit} OFFSET ${offset}
    `;
    const data = await query<CustomerValue>(sql);

    const countResult = await query<{ total: string }>(
      'SELECT COUNT(*) as total FROM reports.vw_customer_value'
    );
    const totalCount = parseInt(countResult[0]?.total || '0', 10);
    const totalPages = Math.ceil(totalCount / validatedParams.limit);

    const vipCount = data.filter(c => c.segmento_cliente === 'VIP').length;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        totalCount,
        totalPages
      },
      kpi: {
        vipCount
      },
      metadata: {
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

    console.error('Error en API customer-value:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
