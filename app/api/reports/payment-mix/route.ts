import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { PaymentMix } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const data = await query<PaymentMix>(
      'SELECT * FROM reports.vw_payment_mix ORDER BY total_amount DESC'
    );

    const topMethod = data[0] || null;

    return NextResponse.json({
      success: true,
      data,
      kpi: {
        topMethod
      },
      metadata: {
        count: data.length,
      }
    });

  } catch (error) {
    console.error('Error en API payment-mix:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
