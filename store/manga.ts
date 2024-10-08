import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Manga, Chapter, ChapterImage } from '../api/mangaApi';
import { mangaApi } from '../api/mangaApi'

export const useMangaStore = defineStore('manga', () => {
  const mangaList = ref<Manga[]>([]);
  const currentManga = ref<Manga | null>(null);
  const currentChapters = ref<Chapter[]>([]);
  const currentChapter = ref<Chapter | null>(null);
  const currentChapterImages = ref<ChapterImage[]>([]);
  const currentPage = ref<number>(0);
  const readingMode = ref<'vertical' | 'single'>('single');
  const readPages = ref<Set<number>>(new Set());

  const loadMangaList = async () => {
    try {
      mangaList.value = await mangaApi.getMangaList();
    } catch (error) {
      console.error('Failed to load manga list:', error);
    }
  }

  const loadMangaChapters = async (mangaId: number) => {
    try {
      currentChapters.value = await mangaApi.getMangaChapters(mangaId);
      currentManga.value = mangaList.value.find(manga => manga.id === mangaId) || null;
    } catch (error) {
      console.error('Failed to load manga chapters:', error);
    }
  }

  const loadChapterImages = async (chapterId: number) => {
    try {
      currentChapterImages.value = await mangaApi.getChapterImages(chapterId);
      currentPage.value = 0;
      currentChapter.value = currentChapters.value.find(ch => ch.id === chapterId) || null;
      readPages.value = new Set(); // Сброс прочитанных страниц при загрузке новой главы
    } catch (error) {
      console.error('Failed to load chapter images:', error);
    }
  }


  const goToNextChapter = async () => {
    if (!currentManga.value || !currentChapter.value) return;
    
    const currentIndex = currentChapters.value.findIndex(ch => ch.id === currentChapter.value?.id);
    if (currentIndex < currentChapters.value.length - 1) {
      const nextChapter = currentChapters.value[currentIndex + 1];
      await loadChapterImages(nextChapter.id);
    }
  }

  const goToPrevChapter = async () => {
    if (!currentManga.value || !currentChapter.value) return;
    
    const currentIndex = currentChapters.value.findIndex(ch => ch.id === currentChapter.value?.id);
    if (currentIndex > 0) {
      const prevChapter = currentChapters.value[currentIndex - 1];
      await loadChapterImages(prevChapter.id);
    }
  }

  // Обновленный метод setCurrentPage
  const setCurrentPage = (page: number) => {
    currentPage.value = page;
    markPageAsRead(page);
    // Автоматический переход к следующей главе при достижении последней страницы
    if (page === totalPages.value - 1 && readingMode.value === 'vertical') {
      goToNextChapter();
    }
  }
  
  const markPageAsRead = (page: number) => {
    readPages.value.add(page);
  }

  const setReadingMode = (mode: 'vertical' | 'single') => {
    readingMode.value = mode;
  }

  // Вычисляемые свойства
  const currentPageImage = computed(() =>
    currentChapterImages.value.find(img => img.page === currentPage.value)?.url || null
  );

  const totalPages = computed(() => currentChapterImages.value.length);

  const canGoNextPage = computed(() => currentPage.value < totalPages.value - 1);

  const canGoPrevPage = computed(() => currentPage.value > 0);

  const isPageRead = (pageIndex: number) => readPages.value.has(pageIndex);

  return {
    mangaList,
    currentManga,
    currentChapters,
    currentChapter,
    currentChapterImages,
    currentPage,
    readingMode,
    currentPageImage,
    totalPages,
    canGoNextPage,
    canGoPrevPage,
    loadMangaList,
    loadMangaChapters,
    loadChapterImages,
    setCurrentPage,
    setReadingMode,
    markPageAsRead,
    isPageRead,
    goToNextChapter,
    goToPrevChapter
  }
})