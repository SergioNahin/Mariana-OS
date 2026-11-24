import type { Memory, MemoryPhoto } from './memories-types.js';

const MOCK_MEMORIES: Memory[] = [
  {
    id: 'first-memory',
    title: 'Nuestro primer recuerdo',
    description: 'El comienzo de nuestra historia.',
    content:
      'Aquí podremos contar cómo comenzó nuestra historia, ' +
      'incluyendo fotografías, fechas y palabras especiales.',
    icon: '♡',
    category: 'story',
    categoryLabel: 'Nuestra historia',
  },
  {
    id: 'favorite-moments',
    title: 'Momentos favoritos',
    description: 'Instantes que queremos conservar.',
    content:
      'Este será el espacio para reunir experiencias, ' +
      'anécdotas y momentos que queremos recordar.',
    icon: '✦',
    category: 'moments',
    categoryLabel: 'Momentos',
  },
  {
    id: 'photos',
    title: 'Nuestras fotografías',
    description: 'Imágenes de nuestros días especiales.',
    content:
      'Aquí construiremos una galería con las fotografías ' +
      'que formarán parte de Mariana OS.',
    icon: '▧',
    category: 'photos',
    categoryLabel: 'Fotografías',
  },
];

// Inicialmente no tenemos fotografías reales.
const MOCK_PHOTOS: MemoryPhoto[] = [];

export class MemoriesService {
  public getMemories(): Memory[] {
    return [...MOCK_MEMORIES];
  }

  public getMemoryById(id: string): Memory | undefined {
    return MOCK_MEMORIES.find(memory => memory.id === id);
  }

  public getPhotosByMemoryId(memoryId: string): MemoryPhoto[] {
    return MOCK_PHOTOS.filter(photo => photo.memoryId === memoryId);
  }
}

export const memoriesService = new MemoriesService();
