<template>
  <div class="manga-reader relative">
    <div ref="readerContent" :class="pagesContainerClass">
      <template v-if="mangaStore.readingMode === 'vertical'">
        <div v-for="(image, index) in mangaStore.currentChapterImages" :key="image.page" class="relative">
          <div v-show="imageLoading" class="absolute inset-0 flex items-center justify-center bg-base-200">
            <span class="loading loading-spinner loading-lg" />
          </div>
          <img
            :ref="el => { if (el) setImageRef(el as HTMLImageElement, index) }"
            :src="image.url"
            :alt="`Page ${image.page}`"
            class="max-w-full h-auto"
            :class="{ 'opacity-50': mangaStore.isPageRead(index) }"
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
        v-if="showPrevButton"
        :disabled="!canGoPrevPage"
        class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100"
        @click="prevPage"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span v-else>&nbsp;</span>
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
        v-if="showNextButton"
        :disabled="!canGoNextPage"
        class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100"
        @click="nextPage"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span v-else>&nbsp;</span>
    </div>
  </div>
</template>

компонента MangaReader.vue">
<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref, nextTick } from 'vue'
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

const imageLoading = ref(true)
const isInterfaceVisible = ref(true)
const readerContent = ref<HTMLElement | null>(null)
const imageRefs = ref<(HTMLImageElement | null)[]>([])

const showPrevButton = computed(() => mangaStore.readingMode === 'single' || mangaStore.currentPage === 0)
const showNextButton = computed(() => mangaStore.readingMode === 'single' || mangaStore.currentPage === mangaStore.totalPages - 1)

let intersectionObserver: IntersectionObserver | null = null

onMounted(async () => {
  await mangaStore.loadMangaChapters(mangaId.value)
  await loadCurrentChapter()

  const lastPosition = settingsStore.getLastPosition(String(mangaId.value), String(chapterId.value))
  if (lastPosition !== null) {
    mangaStore.setCurrentPage(lastPosition)
    if (mangaStore.readingMode === 'vertical') {
      nextTick(() => {
        scrollToPage(lastPosition)
      })
    }
  }

  setupIntersectionObserver()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  settingsStore.saveLastPosition(String(mangaId.value), String(chapterId.value), mangaStore.currentPage)
  intersectionObserver?.disconnect()
  window.removeEventListener('keydown', handleKeyDown)
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

watch(chapterId, async (newChapterId, oldChapterId) => {
  if (newChapterId !== oldChapterId) {
    await loadCurrentChapter()
  }
})

const pagesContainerClass = computed(() => ({
  'flex flex-col': mangaStore.readingMode === 'vertical',
  'flex justify-center': mangaStore.readingMode === 'single'
}))

const handleImageLoaded = () => {
  imageLoading.value = false
}

const nextPage = () => {
  hideInterface()
  scrollToTop()
  navigateNextPage()
  setTimeout(() => {
    showInterface()
  }, 500)
}

const prevPage = () => {
  hideInterface()
  scrollToTop()
  navigatePrevPage()
  setTimeout(() => {
    showInterface()
  }, 500)
}

const hideInterface = () => {
  isInterfaceVisible.value = false
}

const showInterface = () => {
  isInterfaceVisible.value = true
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToPage = (pageIndex: number) => {
  const targetImage = imageRefs.value[pageIndex]
  if (targetImage) {
    targetImage.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const setupIntersectionObserver = () => {
  intersectionObserver?.disconnect()

  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = imageRefs.value.findIndex(img => img === entry.target)
        if (index !== -1) {
          mangaStore.setCurrentPage(index)
        }
      }
    })
  }, { threshold: 0.1 })

  updateObservedImages()
}

const updateObservedImages = () => {
  if (!intersectionObserver) return

  // Сначала прекращаем наблюдение за всеми изображениями
  imageRefs.value.forEach(img => {
    if (img) intersectionObserver?.unobserve(img)
  })

  // Затем начинаем наблюдение за актуальными изображениями
  imageRefs.value.forEach(img => {
    if (img) intersectionObserver?.observe(img)
  })
}

const setImageRef = (el: HTMLImageElement | null, index: number) => {
  if (el !== imageRefs.value[index]) {
    imageRefs.value[index] = el
    nextTick(updateObservedImages)
  }
}

// Следим за изменениями в режиме чтения и текущей главе
watch([() => mangaStore.readingMode, chapterId], () => {
  imageRefs.value = []
  setupIntersectionObserver()
  nextTick(() => {
    if (mangaStore.readingMode === 'vertical') {
      scrollToPage(mangaStore.currentPage)
    } else {
      scrollToTop()
    }
  })
})

const canGoNextPage = computed(() => {
  return mangaStore.readingMode === 'single'
    ? mangaStore.canGoNextPage
    : mangaStore.currentPage < mangaStore.totalPages - 2 || canGoNextChapter.value
})

const canGoPrevPage = computed(() => {
  return mangaStore.readingMode === 'single'
    ? mangaStore.canGoPrevPage
    : mangaStore.currentPage > 0 || canGoPrevChapter.value
})
</script>

<style scoped>
.manga-reader {
  min-height: calc(100vh - 64px); /* Настройте в соответствии с высотой вашего заголовка */
}

.flex-col img {
  width: 100%;
  height: auto;
}

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