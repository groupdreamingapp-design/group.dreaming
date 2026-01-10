
import type { GroupTemplate } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const groupTemplates: GroupTemplate[] = [
  {
    purposeCode: "001",
    name: 'Mi Hogar',
    capital: 50000,
    plazo: 120,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-house')?.imageUrl || '',
    imageHint: 'modern house',
  },
  {
    purposeCode: "002",
    name: 'Mi Auto',
    capital: 25000,
    plazo: 84,
    imageUrl: PlaceHolderImages.find(img => img.id === 'collage-car-keys')?.imageUrl || '',
    imageHint: 'car keys',
  },
  {
    purposeCode: "003",
    name: 'Mi Emprendimiento',
    capital: 15000,
    plazo: 60,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-business')?.imageUrl || '',
    imageHint: 'small business',
  },
  {
    purposeCode: "004",
    name: 'Un gustito',
    capital: 5000,
    plazo: 36,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-treat')?.imageUrl || '',
    imageHint: 'personal gift',
  },
  {
    purposeCode: "005",
    name: 'Ingreso inesperado',
    capital: 1000,
    plazo: 12,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-unexpected-income')?.imageUrl || '',
    imageHint: 'surprise money',
  },
];
