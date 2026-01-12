
'use client';

import { useState, useEffect } from 'react';
import { initialNotifications } from '@/lib/notifications';
import type { Notification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    const deleteAll = () => {
        setNotifications([]);
    }

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        Notificaciones
                    </h1>
                    <p className="text-muted-foreground">Mantente al día con todas las novedades de tus planes.</p>
                </div>
                 <div className='flex gap-2'>
                    <Button variant="outline" onClick={markAllAsRead}>
                        <Check className="mr-2 h-4 w-4" />
                        Marcar todas como leídas
                    </Button>
                     <Button variant="destructive" onClick={deleteAll}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Borrar todas
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="space-y-2">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-4 p-4 border-b last:border-b-0 transition-colors hover:bg-muted/50",
                                        !notification.read && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex-shrink-0">
                                        <notification.icon className={cn("h-6 w-6 mt-1", notification.type === 'success' ? 'text-green-500' : notification.type === 'error' ? 'text-red-500' : 'text-primary')} />
                                    </div>
                                    <div className="flex-grow">
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <p className="font-semibold">{notification.title}</p>
                                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                                            </div>
                                             <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                <ClientFormattedDate dateString={notification.date} />
                                            </p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        {!notification.read && (
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => markAsRead(notification.id)}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(notification.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-16 text-muted-foreground">
                                <p>No tienes notificaciones.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
