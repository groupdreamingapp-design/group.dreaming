
'use client';

import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { initialNotifications } from '@/lib/notifications';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

function ClientFormattedDate({ dateString }: { dateString: string }) {
    const [formattedDate, setFormattedDate] = useState('...');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            try {
                const date = new Date(dateString);
                setFormattedDate(formatDistanceToNow(date, { addSuffix: true, locale: es }));
            } catch (error) {
                setFormattedDate('Fecha inválida');
            }
        }
    }, [dateString, isMounted]);

    return <>{formattedDate}</>;
}


export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="flex justify-between items-center p-3 border-b">
                    <h4 className="font-medium text-sm">Notificaciones</h4>
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                        <Link href="/panel/notifications">Ver todas</Link>
                    </Button>
                </div>
                <ScrollArea className="h-96">
                    <div className="space-y-1">
                        {notifications.length > 0 ? (
                             notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-3 p-3 transition-colors hover:bg-muted/50",
                                        !notification.read && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex-shrink-0">
                                        <notification.icon className={cn("h-5 w-5 mt-1", notification.type === 'success' ? 'text-green-500' : notification.type === 'error' ? 'text-red-500' : 'text-primary')} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm leading-tight">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <ClientFormattedDate dateString={notification.date} />
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => markAsRead(notification.id)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                             <div className="text-center p-8 text-sm text-muted-foreground">
                                <p>No tienes notificaciones nuevas.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
