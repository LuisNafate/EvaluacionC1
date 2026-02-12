import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { TopProductRanked } from '@/lib/types';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100, 'Límite máximo: 100').default(10),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validatedParams = querySchema.parse(rawParams);

    let sql = 'SELECT * FROM reports.vw_top_products_ranked WHERE 1=1';
    const params: string[] = [];

    if (validatedParams.search) {
      params.push(`%${validatedParams.search}%`);
      sql += ` AND product_name ILIKE $${params.length}`;
    }

    sql += ' ORDER BY revenue_rank';
    sql += ` LIMIT ${validatedParams.limit} OFFSET ${(validatedParams.page - 1) * validatedParams.limit}`;
    
    const data = await query<TopProductRanked>(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM reports.vw_top_products_ranked WHERE 1=1';
    const countParams: string[] = [];

    if (validatedParams.search) {
      countParams.push(`%${validatedParams.search}%`);
      countSql += ` AND product_name ILIKE $${countParams.length}`;
    }

    const countResult = await query<{ total: string }>(countSql, countParams);
    const totalCount = parseInt(countResult[0]?.total || '0', 10);
    const totalPages = Math.ceil(totalCount / validatedParams.limit);

    const topProduct = data[0] || null;

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
        topProduct
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

    console.error('Error en API top-products:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
