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

const { currentManga, currentPage, readingMode, currentPageImage, totalPages } = storeToRefs(mangaStore)

const mangaId = computed(() => route.params.id as string)
const chapterId = computed(() => route.params.chapterId as string)

const currentChapterIndex = computed(() => 
  currentManga.value?.chapters.findIndex(ch => ch.id === chapterId.value) ?? -1
)

const canGoNextChapter = computed(() => 
  currentChapterIndex.value < (currentManga.value?.chapters.length ?? 0) - 1
)

const canGoPrevChapter = computed(() => currentChapterIndex.value > 0)

const canGoNextPage = computed(() => 
  readingMode.value === 'single' && currentPage.value < (totalPages.value - 1)
)

const canGoPrevPage = computed(() => 
  readingMode.value === 'single' && currentPage.value > 0
)

const nextButtonText = computed(() => {
  if (readingMode.value !== 'single') return 'Next Chapter'
  return canGoNextPage.value ? 'Next Page' : (canGoNextChapter.value ? 'Next Chapter' : 'Last Page')
})

const prevButtonText = computed(() => {
  if (readingMode.value !== 'single') return 'Previous Chapter'
  return canGoPrevPage.value ? 'Previous Page' : (canGoPrevChapter.value ? 'Previous Chapter' : 'First Page')
})

const isNextButtonDisabled = computed(() => 
  (readingMode.value === 'single' && !canGoNextPage.value && !canGoNextChapter.value) ||
  (readingMode.value !== 'single' && !canGoNextChapter.value)
)

const isPrevButtonDisabled = computed(() => 
  (readingMode.value === 'single' && !canGoPrevPage.value && !canGoPrevChapter.value) ||
  (readingMode.value !== 'single' && !canGoPrevChapter.value)
)

onMounted(async () => {
  await mangaStore.loadMangaDetails(mangaId.value)
  await loadCurrentChapter()
  
  const lastPosition = settingsStore.getLastPosition(mangaId.value, chapterId.value)
  if (lastPosition !== null) {
    mangaStore.setCurrentPage(lastPosition)
  }
})

onUnmounted(() => {
  settingsStore.saveLastPosition(mangaId.value, chapterId.value, currentPage.value)
})

const loadCurrentChapter = async () => {
  await mangaStore.loadMangaPages(mangaId.value, chapterId.value)
  mangaStore.setCurrentPage(0)
}

const toggleReadingMode = () => {
  const modes: Array<'vertical' | 'horizontal' | 'single'> = ['vertical', 'horizontal', 'single']
  const currentIndex = modes.indexOf(readingMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  mangaStore.setReadingMode(modes[nextIndex])
}

const goToNextChapter = () => {
  if (canGoNextChapter.value) {
    const nextChapter = currentManga.value?.chapters[currentChapterIndex.value + 1]
    router.push(`/manga/${mangaId.value}/chapter/${nextChapter?.id}`)
  }
}

const goToPrevChapter = () => {
  if (canGoPrevChapter.value) {
    const prevChapter = currentManga.value?.chapters[currentChapterIndex.value - 1]
    router.push(`/manga/${mangaId.value}/chapter/${prevChapter?.id}`)
  }
}

const nextPage = () => {
  if (canGoNextPage.value) {
    mangaStore.setCurrentPage(currentPage.value + 1)
  } else if (canGoNextChapter.value) {
    goToNextChapter()
  }
}

const prevPage = () => {
  if (canGoPrevPage.value) {
    mangaStore.setCurrentPage(currentPage.value - 1)
  } else if (canGoPrevChapter.value) {
    goToPrevChapter()
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
    <div v-if="currentManga" class="mb-4">
      <h1 class="text-2xl font-bold">{{ currentManga.title }}</h1>
      <p>Chapter: {{ currentManga.chapters.find(ch => ch.id === chapterId)?.title }}</p>
    </div>
    
    <div class="controls mb-4 flex justify-between items-center">
      <button :disabled="isPrevButtonDisabled" class="btn btn-primary" @click="prevPage">
        {{ prevButtonText }}
      </button>
      <div class="flex items-center">
        <template v-if="readingMode === 'single' && currentPageImage">
            <span class="mr-2">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        </template>
        <div class="flex">
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
      </div>
      <button :disabled="isNextButtonDisabled" class="btn btn-primary" @click="nextPage">
        {{ nextButtonText }}
      </button>
    </div>
    
    <div :class="pagesContainerClass">
      <template v-if="readingMode === 'vertical' || readingMode === 'horizontal'">
        <img 
          v-for="page in mangaStore.currentChapterPages" 
          :key="page.pageNumber" 
          :src="page.imageUrl" 
          :alt="`Page ${page.pageNumber}`"
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