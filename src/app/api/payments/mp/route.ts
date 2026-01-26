import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize the client
// NOTE: It is critical that MP_ACCESS_TOKEN is set in .env.local
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, price, quantity = 1, groupId } = body;

        if (!process.env.MP_ACCESS_TOKEN) {
            console.error("MP_ACCESS_TOKEN not defined");
            return NextResponse.json({ error: "Server misconfiguration: MP_ACCESS_TOKEN missing" }, { status: 500 });
        }

        const preference = new Preference(client);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
            ? process.env.NEXT_PUBLIC_APP_URL
            : 'http://localhost:3000';

        console.log("MP Preference Base URL:", baseUrl);

        const preferenceBody = {
            items: [
                {
                    id: `item-${Date.now()}`,
                    title: title || 'Suscripción Group Dreaming',
                    quantity: Number(quantity),
                    unit_price: Number(price),
                    currency_id: 'ARS',
                },
            ],
            back_urls: {
                success: `${baseUrl}/panel?payment=success&groupId=${groupId || ''}`,
                failure: `${baseUrl}/panel?payment=failure&groupId=${groupId || ''}`,
                pending: `${baseUrl}/panel?payment=pending&groupId=${groupId || ''}`,
            },
            // auto_return: 'approved', // Temporarily disabled to debug back_url error
        };

        console.log("Creating MP Preference with body:", JSON.stringify(preferenceBody, null, 2));

        const result = await preference.create({
            body: preferenceBody
        });

        return NextResponse.json({
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point, // Explicitly return sandbox link if available
            id: result.id
        });
    } catch (error: any) {
        console.error("Error creating preference:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
