export type MemoryCategory = 'story' | 'moments' | 'photos';

export interface Memory {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  category: MemoryCategory;
  categoryLabel: string;
}

export interface MemoryPhoto {
  id: string;
  memoryId: string;
  title: string;
  imageUrl: string | null;
  description: string;
}
