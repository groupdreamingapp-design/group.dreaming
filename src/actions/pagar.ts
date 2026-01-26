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
}

export async function crearPreferencia({ title, price, quantity = 1, groupId }: CreatePreferenceParams) {
    console.log("Creating preference via Server Action for:", title);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: `item-${Date.now()}`,
                        title: title,
                        quantity: Number(quantity),
                        unit_price: Number(price),
                        currency_id: 'ARS',
                    }
                ],
                back_urls: {
                    success: `${baseUrl}/panel?payment=success&groupId=${groupId || ''}`,
                    failure: `${baseUrl}/panel?payment=failure&groupId=${groupId || ''}`,
                    pending: `${baseUrl}/panel?payment=pending&groupId=${groupId || ''}`,
                },
                auto_return: 'approved',
            }
        });

        if (response.init_point) {
            // In server actions, redirect throws an error that Next.js catches.
            // We return nothing here because redirect takes over.
            // If we wanted to return the URL to the client, we would NOT use redirect here.
            // But the user pattern showed using redirect.
            redirect(response.init_point);
        } else {
            console.error("No init_point received from MercadoPago");
            // validation limits or other issues
            throw new Error("No se pudo generar el link de pago");
        }
    } catch (error: any) {
        // If it's a redirect error, rethrow it so Next.js handles it
        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        console.error("Error creating preference in Server Action:", error);
        throw new Error(error.message || "Error al procesar el pago");
    }
}
