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

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
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

  getProgress: (mangaId: number, userId: number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchApi<any>(`/manga/${mangaId}/progress?user_id=${userId}`, { method: 'POST' }),

  uploadChapter: (mangaId: number, name: string, images: File[]) => {
    const formData = new FormData();
    formData.append('name', name);
    images.forEach((image, index) => {
      formData.append('images', image, `page_${index + 1}.${image.name.split('.').pop()}`);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fetchApi<any>(`/manga/${mangaId}/upload`, {
      method: 'POST',
      body: formData,
    });
  },
};