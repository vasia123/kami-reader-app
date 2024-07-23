<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMangaStore } from '../store/manga'
import { useSettingsStore } from '../store/settings'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const mangaStore = useMangaStore()
const settingsStore = useSettingsStore()

const { currentManga, currentChapter, currentPage, readingMode, currentPageImage, totalPages, canGoNextPage, canGoPrevPage } = storeToRefs(mangaStore)

const mangaId = computed(() => Number(route.params.id))
const chapterId = computed(() => Number(route.params.chapterId))

const currentChapterIndex = computed(() => 
  mangaStore.currentChapters.findIndex(ch => ch.id === chapterId.value)
)

const canGoNextChapter = computed(() => 
  currentChapterIndex.value < mangaStore.currentChapters.length - 1
)

const canGoPrevChapter = computed(() => currentChapterIndex.value > 0)

const showNavOverlay = ref(false)
const pageCounter = computed(() => `${currentPage.value + 1} / ${totalPages.value}`)

// New ref for tracking image loading status
const imageLoading = ref(true)

onMounted(async () => {
  await mangaStore.loadMangaChapters(mangaId.value)
  await loadCurrentChapter()
  
  const lastPosition = settingsStore.getLastPosition(String(mangaId.value), String(chapterId.value))
  if (lastPosition !== null) {
    mangaStore.setCurrentPage(lastPosition)
  }
})

onUnmounted(() => {
  settingsStore.saveLastPosition(String(mangaId.value), String(chapterId.value), currentPage.value)
})

const loadCurrentChapter = async () => {
  imageLoading.value = true
  await mangaStore.loadChapterImages(chapterId.value)
}

const toggleReadingMode = () => {
  const modes: Array<'vertical' | 'horizontal' | 'single'> = ['vertical', 'horizontal', 'single']
  const currentIndex = modes.indexOf(readingMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  mangaStore.setReadingMode(modes[nextIndex])
}

const nextPage = () => {
  if (readingMode.value === 'single' && canGoNextPage.value) {
    imageLoading.value = true
    mangaStore.setCurrentPage(currentPage.value + 1)
  } else if (canGoNextChapter.value) {
    const nextChapter = mangaStore.currentChapters[currentChapterIndex.value + 1]
    router.push(`/manga/${mangaId.value}/chapter/${nextChapter.id}`)
  }
}

const prevPage = () => {
  if (readingMode.value === 'single' && canGoPrevPage.value) {
    imageLoading.value = true
    mangaStore.setCurrentPage(currentPage.value - 1)
  } else if (canGoPrevChapter.value) {
    const prevChapter = mangaStore.currentChapters[currentChapterIndex.value - 1]
    router.push(`/manga/${mangaId.value}/chapter/${prevChapter.id}`)
  }
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
    'flex flex-col': readingMode.value === 'vertical',
    'flex flex-row overflow-x-auto': readingMode.value === 'horizontal',
    'flex justify-center': readingMode.value === 'single'
  }
})

const goToPage = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const pageNumber = parseInt(target.value, 10)
  if (pageNumber >= 0 && pageNumber < totalPages.value) {
    imageLoading.value = true
    mangaStore.setCurrentPage(pageNumber)
  }
}

const toggleNavOverlay = () => {
  showNavOverlay.value = !showNavOverlay.value
}

const hideOverlay = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('nav-overlay')) {
    showNavOverlay.value = false
  }
}

// New method to handle image load completion
const handleImageLoaded = () => {
  imageLoading.value = false
}
</script>

<template>
  <div class="manga-reader relative">
    <!-- Main content area -->
    <div :class="pagesContainerClass" @click="toggleNavOverlay">
      <template v-if="readingMode === 'vertical' || readingMode === 'horizontal'">
        <div v-for="image in mangaStore.currentChapterImages" :key="image.page" class="relative">
          <div v-show="imageLoading" class="absolute inset-0 flex items-center justify-center bg-base-200">
            <span class="loading loading-spinner loading-lg"/>
          </div>
          <img 
            :src="image.url" 
            :alt="`Page ${image.page}`"
            class="max-w-full h-auto"
            @load="handleImageLoaded"
          >
        </div>
      </template>
      <template v-else-if="readingMode === 'single' && currentPageImage">
        <div class="relative">
          <div v-show="imageLoading" class="absolute inset-0 flex items-center justify-center bg-base-200">
            <span class="loading loading-spinner loading-lg"/>
          </div>
          <img 
            :src="currentPageImage" 
            :alt="`Page ${currentPage + 1}`"
            class="max-w-full h-auto"
            @load="handleImageLoaded"
          >
        </div>
      </template>
    </div>

    <!-- Navigation overlay -->
    <div v-if="showNavOverlay" class="nav-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" @click="hideOverlay">
      <div class="bg-base-100 p-4 rounded-lg shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">{{ currentManga?.name }} - {{ currentChapter?.name }}</h2>
          <button class="btn btn-circle btn-sm" @click="toggleNavOverlay">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex space-x-2 mb-4">
          <button :disabled="!canGoPrevChapter" class="btn btn-primary flex-1" @click="prevPage">
            Previous Chapter
          </button>
          <button :disabled="!canGoNextChapter" class="btn btn-primary flex-1" @click="nextPage">
            Next Chapter
          </button>
        </div>
        <div class="flex items-center justify-between mb-4">
          <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
          <select 
            v-if="readingMode === 'single'"
            :value="currentPage"
            class="select select-bordered w-32"
            @change="goToPage"
          >
            <option v-for="page in totalPages" :key="page - 1" :value="page - 1">
              {{ page }}
            </option>
          </select>
          <button class="btn btn-secondary" @click="toggleReadingMode">
            Mode: {{ readingMode.charAt(0).toUpperCase() + readingMode.slice(1) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Floating navigation buttons with page counter -->
    <div class="fixed bottom-4 left-4 right-4 flex justify-between items-center z-40">
      <button 
        :disabled="readingMode === 'single' ? !canGoPrevPage : !canGoPrevChapter" 
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
        :disabled="readingMode === 'single' ? !canGoNextPage : !canGoNextChapter" 
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

<style scoped>
.manga-reader {
  min-height: calc(100vh - 64px); /* Adjust based on your header height */
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