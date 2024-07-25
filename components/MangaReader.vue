<template>
  <div class="manga-reader relative">
    <!-- Контейнер для отображения страниц манги -->
    <div ref="readerContent" :class="pagesContainerClass">
      <!-- Вертикальный режим чтения -->
      <template v-if="mangaStore.readingMode === 'vertical'">
        <MangaPageVertical
          v-for="(image, index) in mangaStore.currentChapterImages"
          :key="image.page"
          :image="image"
          :is-read="mangaStore.isPageRead(index)"
          @set-ref="(el) => setImageRef(el, index)"
        />
      </template>
      <!-- Режим чтения одиночными страницами -->
      <template v-else-if="mangaStore.readingMode === 'single' && mangaStore.currentPageImage">
        <MangaPageSingle
          :image="mangaStore.currentPageImage"
          :alt-text="`Page ${mangaStore.currentPage + 1}`"
        />
      </template>
    </div>

    <!-- Навигационный оверлей -->
    <MangaReaderNavOverlay
      v-bind="navOverlayProps"
      @toggle-nav-overlay="toggleNavOverlay"
      @hide-overlay="hideOverlay"
      @prev-page="prevPage"
      @next-page="nextPage"
      @toggle-reading-mode="toggleReadingMode"
      @go-to-page="goToPage"
      @go-to-prev-chapter="goToPrevChapter"
      @go-to-next-chapter="goToNextChapter"
    />

    <!-- Плавающие кнопки навигации -->
    <FloatingNavigationButtons
      :is-interface-visible="isInterfaceVisible"
      :can-go-prev-page="canGoPrevPage"
      :can-go-next-page="canGoNextPage"
      :page-counter="pageCounter"
      @prev-page="prevPage"
      @next-page="nextPage"
      @toggle-nav-overlay="toggleNavOverlay"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaStore } from '../store/manga'
import { useSettingsStore } from '../store/settings'
import { useMangaReader } from '../composables/useMangaReader'
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation'
import MangaPageVertical from './MangaPageVertical.vue'
import MangaPageSingle from './MangaPageSingle.vue'
import MangaReaderNavOverlay from './MangaReaderNavOverlay.vue'
import FloatingNavigationButtons from './FloatingNavigationButtons.vue'

const route = useRoute()
const mangaStore = useMangaStore()
const settingsStore = useSettingsStore()

// Получаем ID манги и главы из параметров маршрута
const mangaId = computed(() => Number(route.params.id))
const chapterId = computed(() => Number(route.params.chapterId))

// Используем composable для основной логики чтения манги
const {
  readerContent,
  isInterfaceVisible,
  pagesContainerClass,
  canGoPrevPage,
  canGoNextPage,
  pageCounter,
  navOverlayProps,
  toggleNavOverlay,
  hideOverlay,
  prevPage,
  nextPage,
  toggleReadingMode,
  goToPage,
  goToPrevChapter,
  goToNextChapter,
  setImageRef,
  scrollToPage,
  scrollToTop
} = useMangaReader(mangaId.value, chapterId.value)

// Используем composable для навигации с клавиатуры
useKeyboardNavigation({
  onLeftArrow: prevPage,
  onRightArrow: nextPage,
  onEscape: hideOverlay
})

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await mangaStore.loadMangaChapters(mangaId.value)
  await loadCurrentChapter()

  // Восстановление последней позиции чтения
  const lastPosition = settingsStore.getLastPosition(String(mangaId.value), String(chapterId.value))
  if (lastPosition !== null) {
    mangaStore.setCurrentPage(lastPosition)
    if (mangaStore.readingMode === 'vertical') {
      scrollToPage(lastPosition)
    } else {
      scrollToTop()
    }
  }
})

// Сохранение позиции чтения при размонтировании компонента
onUnmounted(() => {
  settingsStore.saveLastPosition(String(mangaId.value), String(chapterId.value), mangaStore.currentPage)
})

// Загрузка текущей главы
const loadCurrentChapter = async () => {
  await mangaStore.loadChapterImages(chapterId.value)
}

// Отслеживание изменений ID главы
watch(chapterId, async (newChapterId, oldChapterId) => {
  if (newChapterId !== oldChapterId) {
    await loadCurrentChapter()
    scrollToTop()
  }
})

// Отслеживание изменений в режиме чтения
watch(() => mangaStore.readingMode, (newMode, oldMode) => {
  if (newMode === 'vertical' && oldMode === 'single') {
    scrollToPage(mangaStore.currentPage)
  } else if (newMode === 'single' && oldMode === 'vertical') {
    scrollToTop()
  }
})
</script>

<style scoped>
.manga-reader {
  min-height: calc(100vh - 64px); /* Высота экрана минус высота шапки */
}

/* Стили для вертикального режима чтения */
.flex-col img {
  width: 100%;
  height: auto;
}

/* Стили для горизонтального скролла */
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