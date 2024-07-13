<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
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
    mangaStore.setCurrentPage(currentPage.value + 1)
  } else if (canGoNextChapter.value) {
    const nextChapter = mangaStore.currentChapters[currentChapterIndex.value + 1]
    router.push(`/manga/${mangaId.value}/chapter/${nextChapter.id}`)
  }
}

const prevPage = () => {
  if (readingMode.value === 'single' && canGoPrevPage.value) {
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
    mangaStore.setCurrentPage(pageNumber)
  }
}
</script>

<template>
  <div class="manga-reader container mx-auto px-4 py-8">
    <div v-if="currentManga && currentChapter" class="mb-4">
      <h1 class="text-2xl font-bold">{{ currentManga.name }}</h1>
      <p>Chapter: {{ currentChapter.name }}</p>
    </div>
    
    <div class="controls mb-4 flex justify-between items-center">
      <button :disabled="readingMode === 'single' ? !canGoPrevPage : !canGoPrevChapter" class="btn btn-primary" @click="prevPage">
        {{ readingMode === 'single' ? 'Previous Page' : 'Previous Chapter' }}
      </button>
      <div class="flex items-center">
        <span class="mr-2">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <select 
          v-if="readingMode === 'single'"
          :value="currentPage"
          class="select select-bordered w-full max-w-xs"
          @change="goToPage"
        >
          <option v-for="page in totalPages" :key="page - 1" :value="page - 1">
            {{ page }}
          </option>
        </select>
        <button class="btn btn-secondary ml-2" @click="toggleReadingMode">
          Mode: {{ readingMode.charAt(0).toUpperCase() + readingMode.slice(1) }}
        </button>
      </div>
      <button :disabled="readingMode === 'single' ? !canGoNextPage : !canGoNextChapter" class="btn btn-primary" @click="nextPage">
        {{ readingMode === 'single' ? 'Next Page' : 'Next Chapter' }}
      </button>
    </div>
    
    <div :class="pagesContainerClass">
      <template v-if="readingMode === 'vertical' || readingMode === 'horizontal'">
        <img 
          v-for="image in mangaStore.currentChapterImages" 
          :key="image.page" 
          :src="image.url" 
          :alt="`Page ${image.page}`"
          class="max-w-full h-auto"
        >
      </template>
      <template v-else-if="readingMode === 'single' && currentPageImage">
        <img 
          :src="currentPageImage" 
          :alt="`Page ${currentPage + 1}`"
          class="max-w-full h-auto"
        >
      </template>
    </div>
  </div>
</template>