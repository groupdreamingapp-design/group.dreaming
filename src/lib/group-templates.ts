
import type { GroupTemplate } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const groupTemplates: GroupTemplate[] = [
  {
    name: 'Mi Hogar',
    capital: 50000,
    plazo: 120,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-house')?.imageUrl || '',
    imageHint: 'modern house',
  },
  {
    name: 'Mi Auto',
    capital: 25000,
    plazo: 84,
    imageUrl: PlaceHolderImages.find(img => img.id === 'collage-car-keys')?.imageUrl || '',
    imageHint: 'car keys',
  },
  {
    name: 'Mi Emprendimiento',
    capital: 15000,
    plazo: 48,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-business')?.imageUrl || '',
    imageHint: 'small business',
  },
  {
    name: 'Un gustito',
    capital: 5000,
    plazo: 24,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-treat')?.imageUrl || '',
    imageHint: 'personal gift',
  },
];
