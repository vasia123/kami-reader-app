<template>
  <div class="manga-reader relative">
    <!-- Основная область контента -->
    <div ref="readerContent" :class="pagesContainerClass" @click="toggleNavOverlay">
      <template v-if="mangaStore.readingMode === 'vertical'">
        <div v-for="(image, index) in mangaStore.currentChapterImages" :key="image.page" class="relative">
          <div v-show="imageLoading" class="absolute inset-0 flex items-center justify-center bg-base-200">
            <span class="loading loading-spinner loading-lg" />
          </div>
          <img 
            :src="image.url" 
            :alt="`Page ${image.page}`" 
            class="max-w-full h-auto" 
            :class="{ 'opacity-50': isPageRead(index) }"
            @load="handleImageLoaded"
          >
        </div>
      </template>
      <template v-else-if="mangaStore.readingMode === 'single' && mangaStore.currentPageImage">
        <div class="relative">
          <div v-show="imageLoading" class="absolute inset-0 flex items-center justify-center bg-base-200">
            <span class="loading loading-spinner loading-lg" />
          </div>
          <img
            :src="mangaStore.currentPageImage" 
            :alt="`Page ${mangaStore.currentPage + 1}`" 
            class="max-w-full h-auto"
            @load="handleImageLoaded"
          >
        </div>
      </template>
    </div>

    <!-- Навигационный оверлей -->
    <MangaReaderNavOverlay
      :show-nav-overlay="showNavOverlay"
      :can-go-prev-chapter="canGoPrevChapter"
      :can-go-next-chapter="canGoNextChapter"
      :is-interface-visible="isInterfaceVisible"
      @toggle-nav-overlay="toggleNavOverlay"
      @hide-overlay="hideOverlay"
      @prev-page="prevPage"
      @next-page="nextPage"
      @toggle-reading-mode="toggleReadingMode"
      @go-to-page="goToPage"
    />

    <!-- Плавающие кнопки навигации с счетчиком страниц -->
    <div 
      class="fixed bottom-4 left-4 right-4 flex justify-between items-center z-40 transition-opacity duration-500"
      :class="{ 'opacity-0': !isInterfaceVisible }"
    >
      <button
        :disabled="mangaStore.readingMode === 'single' ? !mangaStore.canGoPrevPage : !canGoPrevChapter"
        class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100"
        @click="prevPage"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="flex flex-col items-center">
        <button
          class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100 mb-2"
          @click="toggleNavOverlay"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="bg-base-200 bg-opacity-70 px-2 py-1 rounded-full text-sm font-medium">
          {{ pageCounter }}
        </span>
      </div>
      <button
        :disabled="mangaStore.readingMode === 'single' ? !mangaStore.canGoNextPage : !canGoNextChapter"
        class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100"
        @click="nextPage"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaStore } from '../store/manga'
import { useSettingsStore } from '../store/settings'
import { useMangaReaderNavigation } from '../composables/useMangaReaderNavigation'
import MangaReaderNavOverlay from './MangaReaderNavOverlay.vue'

const route = useRoute()
const mangaStore = useMangaStore()
const settingsStore = useSettingsStore()

const mangaId = computed(() => Number(route.params.id))
const chapterId = computed(() => Number(route.params.chapterId))

// Используем композабл для навигации
const {
  showNavOverlay,
  canGoNextChapter,
  canGoPrevChapter,
  pageCounter,
  nextPage: navigateNextPage,
  prevPage: navigatePrevPage,
  toggleReadingMode,
  toggleNavOverlay,
  hideOverlay,
  goToPage
} = useMangaReaderNavigation(mangaId.value, chapterId.value)

// Новый ref для отслеживания статуса загрузки изображения
const imageLoading = ref(true)

// Новый ref для управления видимостью интерфейса
const isInterfaceVisible = ref(true)

// Ref для доступа к содержимому читалки
const readerContent = ref<HTMLElement | null>(null)

onMounted(async () => {
  await mangaStore.loadMangaChapters(mangaId.value)
  await loadCurrentChapter()

  const lastPosition = settingsStore.getLastPosition(String(mangaId.value), String(chapterId.value))
  if (lastPosition !== null) {
    mangaStore.setCurrentPage(lastPosition)
  }
})

onUnmounted(() => {
  settingsStore.saveLastPosition(String(mangaId.value), String(chapterId.value), mangaStore.currentPage)
})

const loadCurrentChapter = async () => {
  imageLoading.value = true
  await mangaStore.loadChapterImages(chapterId.value)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight') {
    nextPage()
  } else if (event.key === 'ArrowLeft') {
    prevPage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

watch(chapterId, async (newChapterId, oldChapterId) => {
  if (newChapterId !== oldChapterId) {
    await loadCurrentChapter()
  }
})

const pagesContainerClass = computed(() => {
  return {
    'flex flex-col': mangaStore.readingMode === 'vertical',
    'flex justify-center': mangaStore.readingMode === 'single'
  }
})

// Новый метод для обработки завершения загрузки изображения
const handleImageLoaded = () => {
  imageLoading.value = false
}

// Функция для проверки, прочитана ли страница
const isPageRead = (index: number) => {
  return mangaStore.readingMode === 'vertical' && index <= mangaStore.currentPage
}

// Обновленные функции для навигации
const nextPage = () => {
  hideInterface()
  setTimeout(() => {
    navigateNextPage()
    scrollToTop()
    showInterface()
  }, 500)
}

const prevPage = () => {
  hideInterface()
  setTimeout(() => {
    navigatePrevPage()
    scrollToTop()
    showInterface()
  }, 500)
}

// Функции для управления видимостью интерфейса
const hideInterface = () => {
  isInterfaceVisible.value = false
}

const showInterface = () => {
  isInterfaceVisible.value = true
}

// Функция для прокрутки к верху страницы
const scrollToTop = () => {
  if (readerContent.value) {
    readerContent.value.scrollTop = 0
  }
}
</script>

<style scoped>
.manga-reader {
  min-height: calc(100vh - 64px);
  /* Adjust based on your header height */
}

/* Ensure images take full width in vertical mode */
.flex-col img {
  width: 100%;
  height: auto;
}

/* Custom scrollbar for horizontal mode */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.primary') theme('colors.base-200');
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: theme('colors.base-200');
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: theme('colors.primary');
  border-radius: 20px;
  border: 3px solid theme('colors.base-200');
}
</style>