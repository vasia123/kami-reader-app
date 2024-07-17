import { fetchWithAuth } from '../utils/apiUtils';

export interface Manga {
  id: number;
  name: string;
}

export interface Chapter {
  id: number;
  name: string;
}

export interface ChapterImage {
  url: string;
  page: number;
}

export const mangaApi = {
  getMangaList: () => fetchWithAuth<Manga[]>('/manga'),

  getMangaChapters: (mangaId: number) => fetchWithAuth<Chapter[]>(`/manga/${mangaId}/chapter`),

  getChapterImages: (chapterId: number) => fetchWithAuth<ChapterImage[]>(`/chapter/${chapterId}/images`),

  getProgress: (mangaId: number, userId: number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchWithAuth<any>(`/manga/${mangaId}/progress?user_id=${userId}`, { method: 'POST' }),

  uploadChapter: (mangaId: number, name: string, images: File[]) => {
    const formData = new FormData();
    formData.append('name', name);
    images.forEach((image, index) => {
      formData.append('images', image, `page_${index + 1}.${image.name.split('.').pop()}`);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fetchWithAuth<any>(`/manga/${mangaId}/upload`, {
      method: 'POST',
      body: formData,
    });
  },
};