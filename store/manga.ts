import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchMangaList, fetchMangaDetails, fetchMangaPages } from '../api/mangaApi'

// Определение типов
interface MangaBasic {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  genres: string[];
}

interface MangaChapter {
  id: string;
  title: string;
  pages: number;
}

interface MangaDetailed extends MangaBasic {
  chapters: MangaChapter[];
}

interface MangaPage {
  pageNumber: number;
  imageUrl: string;
}

type ReadingMode = 'vertical' | 'horizontal' | 'single';

export const useMangaStore = defineStore('manga', () => {
  const mangaList = ref<MangaBasic[]>([]);
  const currentManga = ref<MangaDetailed | null>(null);
  const currentPage = ref<number>(0);
  const readingMode = ref<ReadingMode>('vertical');
  const currentChapterPages = ref<MangaPage[]>([]);

  const setMangaList = (list: MangaBasic[]) => {
    mangaList.value = list;
  }

  const setCurrentManga = (manga: MangaDetailed | null) => {
    currentManga.value = manga;
  }

  const setCurrentPage = (page: number) => {
    currentPage.value = page;
  }

  const setReadingMode = (mode: ReadingMode) => {
    readingMode.value = mode;
  }

  const setCurrentChapterPages = (pages: MangaPage[]) => {
    currentChapterPages.value = pages;
  }

  const loadMangaList = async () => {
    try {
      const list = await fetchMangaList();
      setMangaList(list);
    } catch (error) {
      console.error('Failed to load manga list:', error);
      // Здесь можно добавить обработку ошибок, например, установку флага ошибки
    }
  }

  const loadMangaDetails = async (mangaId: string) => {
    try {
      const details = await fetchMangaDetails(mangaId);
      setCurrentManga(details);
    } catch (error) {
      console.error('Failed to load manga details:', error);
      // Здесь можно добавить обработку ошибок
    }
  }

  const loadMangaPages = async (mangaId: string, chapterId: string) => {
    try {
      const pages = await fetchMangaPages(mangaId, chapterId);
      setCurrentChapterPages(pages);
      setCurrentPage(0); // Сбрасываем текущую страницу при загрузке новой главы
    } catch (error) {
      console.error('Failed to load manga pages:', error);
      // Здесь можно добавить обработку ошибок
    }
  }

  // Вычисляемые свойства
  const currentPageImage = computed(() => {
    return currentChapterPages.value[currentPage.value]?.imageUrl || null;
  });

  const totalPages = computed(() => currentChapterPages.value.length);

  const canGoNextPage = computed(() => currentPage.value < totalPages.value - 1);

  const canGoPrevPage = computed(() => currentPage.value > 0);

  return {
    mangaList,
    currentManga,
    currentPage,
    readingMode,
    currentChapterPages,
    currentPageImage,
    totalPages,
    canGoNextPage,
    canGoPrevPage,
    setCurrentPage,
    setReadingMode,
    loadMangaList,
    loadMangaDetails,
    loadMangaPages
  }
})