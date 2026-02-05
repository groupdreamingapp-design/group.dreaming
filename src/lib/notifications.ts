
import type { Notification } from './types';
import { addDays, subDays, subHours } from 'date-fns';
import { Users, AlertTriangle, BadgePercent, CheckCircle, ShieldCheck, ShieldX, Trophy, CalendarCheck } from 'lucide-react';

const now = new Date();

export const initialNotifications: Notification[] = [];
