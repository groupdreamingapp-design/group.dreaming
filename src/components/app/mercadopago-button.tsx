'use client';

import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Inicializar MercadoPago con la clave pública
// Asegúrate de que NEXT_PUBLIC_MP_PUBLIC_KEY esté en .env.local
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

if (MP_PUBLIC_KEY) {
    initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
}

interface MercadoPagoButtonProps {
    items: {
        title: string;
        quantity: number;
        unit_price: number;
    }[];
    payer?: {
        email: string;
    };
    label?: string;
}

export function MercadoPagoButton({ items, payer, label = "Pagar con MercadoPago" }: MercadoPagoButtonProps) {
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleBuy = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/mercadopago/preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items, payer }),
            });
            const data = await response.json();
            if (data.id) {
                setPreferenceId(data.id);
            }
        } catch (error) {
            console.error("Error creating preference:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {!preferenceId && (
                <Button onClick={handleBuy} disabled={isLoading} className="w-full bg-[#009EE3] hover:bg-[#007EB5] text-white font-bold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {label}
                </Button>
            )}

            {preferenceId && (
                <div className="w-full">
                    <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
                </div>
            )}
        </div>
    );
}
