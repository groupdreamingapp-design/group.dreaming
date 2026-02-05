'use server';

import { preference } from "@/lib/mercadopago";
import { redirect } from "next/navigation";

interface PaymentItem {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
}

interface CreatePreferenceParams {
    title: string;
    price: number;
    quantity?: number;
    groupId?: string;
    userId?: string;
    userEmail?: string;
}

export async function crearPreferencia({ title, price, quantity = 1, groupId, userId, userEmail }: CreatePreferenceParams) {
    console.log("Creating preference via Server Action for:", title);

    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    const notificationUrl = `${baseUrl}/api/webhooks/mercadopago`;
    console.log("Using Base URL:", baseUrl);
    console.log("Notification URL set to:", notificationUrl);

    const preferenceBody = {
        items: [
            {
                id: `item-${Date.now()}`,
                title: title,
                quantity: Number(quantity),
                unit_price: Number(price),
                currency_id: 'USD', // MercadoPago manejará la conversión o moneda según configuración
            }
        ],
        payer: {
            email: userEmail || `test_user_${Date.now()}@testuser.com`
        },
        back_urls: {
            success: `${baseUrl}/panel?payment=success&groupId=${groupId || ''}`,
            failure: `${baseUrl}/panel?payment=failure&groupId=${groupId || ''}`,
            pending: `${baseUrl}/panel?payment=pending&groupId=${groupId || ''}`,
        },
        // auto_return: 'approved',
        notification_url: notificationUrl,
        metadata: {
            user_id: userId,
            group_id: groupId,
            payment_type: title.includes('Adhesión') ? 'adhésion' : 'cuota', // Simple heurística, mejorar si es necesario
        },
        external_reference: `${userId || 'guest'}-${groupId || 'nogroup'}-${Date.now()}`,
    };

    console.log("Preference Body:", JSON.stringify(preferenceBody, null, 2));

    try {
        const response = await preference.create({
            body: preferenceBody
        });

        if (response.init_point) {
            redirect(response.init_point);
        } else {
            console.error("No init_point received from MercadoPago");
            throw new Error("No se pudo generar el link de pago");
        }
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        console.error("Error creating preference in Server Action:", error);
        throw new Error(error.message || "Error al procesar el pago");
    }
}
