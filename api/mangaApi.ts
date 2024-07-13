const API_BASE_URL = 'https://manga-viewer-chuker.amvera.io';

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

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as T;
}

export const mangaApi = {
  getMangaList: () => fetchApi<Manga[]>('/manga'),

  getMangaChapters: (mangaId: number) => fetchApi<Chapter[]>(`/manga/${mangaId}/chapter`),

  getChapterImages: (chapterId: number) => fetchApi<ChapterImage[]>(`/chapter/${chapterId}/images`),
};