'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { crearPreferencia } from '@/actions/pagar';

interface MPButtonProps {
    title: string;
    price: number;
    description?: string;
    className?: string;
    onBeforePayment?: () => Promise<void> | void;
    groupId?: string;
    disabled?: boolean;
}

import { useUser } from '@/firebase';

// ...

export function MPButton({ title, price, description, className, onBeforePayment, groupId, disabled }: MPButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useUser();

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            if (onBeforePayment) {
                await onBeforePayment();
            }

            // Using Server Action
            await crearPreferencia({
                title: title,
                price: price,
                quantity: 1,
                groupId: groupId,
                userId: user?.uid,
                userEmail: user?.email || undefined
            });

            // The server action handles redirect. 
            // If we are here, it might be waiting for redirect or finished.

        } catch (error: any) {
            console.error("Payment Error:", error);
            // Ignore digest errors usually related to redirects if any
            if (error.message && error.message.includes('NEXT_REDIRECT')) return;

            toast({
                title: "Error de Pago",
                description: error.message || "No se pudo procesar el pago.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handlePayment} disabled={isLoading || disabled} className={className}>
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
