'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MPButtonProps {
    title: string;
    price: number;
    description?: string;
    className?: string;
    onBeforePayment?: () => Promise<void> | void;
    groupId?: string;
}

export function MPButton({ title, price, description, className, onBeforePayment, groupId }: MPButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            if (onBeforePayment) {
                await onBeforePayment();
            }

            const response = await fetch('/api/payments/mp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    price: price,
                    quantity: 1,
                    groupId: groupId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al conectar con MercadoPago');
            }

            if (data.sandbox_init_point) {
                window.location.href = data.sandbox_init_point;
            } else if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error("No se recibió link de pago (init_point)");
            }

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast({
                title: "Error de Pago",
                description: error.message,
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handlePayment} disabled={isLoading} className={className}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                </>
            ) : (
                <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {description || 'Pagar con MercadoPago'}
                </>
            )}
        </Button>
    );
}
