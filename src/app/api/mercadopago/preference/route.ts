import { NextResponse } from 'next/server';
import { preference } from '@/lib/mercadopago';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, payer } = body;

        const response = await preference.create({
            body: {
                items: items || [],
                payer: payer,
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/failure`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pending`,
                },
                auto_return: 'approved',
            },
        });

        return NextResponse.json({
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        });
    } catch (error) {
        console.error('Error al crear la preferencia:', error);
        return NextResponse.json({ error: 'Error al crear la preferencia de pago' }, { status: 500 });
    }
}
