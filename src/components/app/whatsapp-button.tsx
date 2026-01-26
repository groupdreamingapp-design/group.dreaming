'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.36 21.85 12.04 21.85C17.5 21.85 21.95 17.4 21.95 11.94C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.7 2 12.04 2M12.04 3.67C16.56 3.67 20.28 7.38 20.28 11.91C20.28 16.44 16.56 20.15 12.04 20.15C10.48 20.15 8.99 19.73 7.7 19L7.3 18.8L3.91 19.72L4.85 16.41L4.64 16.15C3.84 14.76 3.4 13.21 3.4 11.91C3.4 7.38 7.11 3.67 12.04 3.67M17.46 14.85C17.18 15.54 16.22 15.93 15.7 16.03C15.18 16.13 14.54 16.16 14.21 16.1C13.88 16.04 13.36 15.86 12.67 15.6C11.12 15.05 9.89 14.07 8.94 12.78C8.5 12.18 8.24 11.54 8.24 10.91C8.24 10.28 8.41 9.71 8.61 9.49C8.81 9.27 9.08 9.07 9.36 9.07C9.64 9.07 9.87 9.07 10.05 9.07C10.23 9.07 10.4 9.04 10.59 9.43C10.78 9.82 11.23 11.03 11.33 11.2C11.43 11.37 11.46 11.59 11.36 11.76C11.26 11.93 11.2 12.04 11.04 12.21C10.88 12.38 10.75 12.51 10.63 12.63C10.51 12.75 10.38 12.87 10.54 13.14C10.7 13.41 11.11 14.04 11.66 14.56C12.42 15.29 13.11 15.54 13.43 15.64C13.75 15.74 14.08 15.71 14.29 15.54C14.5 15.37 14.78 14.99 15 14.66C15.22 14.33 15.44 14.33 15.72 14.43C16 14.53 16.96 15 17.18 15.09C17.4 15.18 17.56 15.24 17.63 15.34C17.7 15.44 17.7 14.88 17.46 14.85Z" />
  </svg>
);

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

export function WhatsAppButton({ phoneNumber, message }: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <Button
      asChild
      className="fixed bottom-24 right-4 h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl z-50 animate-bounce"
      aria-label="Contactar por WhatsApp"
    >
      <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
      </Link>
    </Button>
  );
}
