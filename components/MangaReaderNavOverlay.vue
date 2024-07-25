<template>
    <div
v-if="showNavOverlay"
        class="nav-overlay fixed inset-0 bg-base-200 bg-opacity-80 z-50 flex items-center justify-center transition-opacity duration-300"
        :class="{ 'opacity-0': !isInterfaceVisible }" @click="$emit('hide-overlay')">
        <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-lg w-full mx-4" @click.stop>
            <!-- Заголовок и кнопка закрытия -->
            <OverlayHeader :manga-name="mangaStore.currentManga?.name" @close="$emit('toggle-nav-overlay')" />

            <!-- Информация о текущей главе -->
            <ChapterInfo
:chapter-name="mangaStore.currentChapter?.name" :current-page="mangaStore.currentPage"
                :total-pages="mangaStore.totalPages" :reading-mode="mangaStore.readingMode"
                @toggle-reading-mode="$emit('toggle-reading-mode')" />

            <!-- Навигация по страницам -->
            <PageNavigation
v-if="mangaStore.readingMode === 'single'" :current-page="mangaStore.currentPage"
                :total-pages="mangaStore.totalPages" :can-go-prev-page="canGoPrevPage" :can-go-next-page="canGoNextPage"
                @prev-page="$emit('prev-page')" @next-page="$emit('next-page')"
                @go-to-page="$emit('go-to-page', $event)" />

            <!-- Навигация по главам -->
            <ChapterNavigation
:can-go-prev-chapter="canGoPrevChapter" :can-go-next-chapter="canGoNextChapter"
                @go-to-prev-chapter="$emit('go-to-prev-chapter')" @go-to-next-chapter="$emit('go-to-next-chapter')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMangaStore } from '../store/manga'
import OverlayHeader from './OverlayHeader.vue'
import ChapterInfo from './ChapterInfo.vue'
import PageNavigation from './PageNavigation.vue'
import ChapterNavigation from './ChapterNavigation.vue'

defineProps<{
    showNavOverlay: boolean
    canGoPrevChapter: boolean
    canGoNextChapter: boolean
    isInterfaceVisible: boolean
}>()

defineEmits<{
    (e: 'toggle-nav-overlay' 
        | 'hide-overlay' 
        | 'prev-page' 
        | 'next-page' 
        | 'toggle-reading-mode' 
        | 'go-to-prev-chapter' 
        | 'go-to-next-chapter'
    ): void
    (e: 'go-to-page', page: number): void
}>()

const mangaStore = useMangaStore()

// Вычисляемые свойства для навигации по страницам
const canGoPrevPage = computed(() =>
    mangaStore.readingMode === 'single' ? mangaStore.canGoPrevPage : mangaStore.currentPage > 0
)

const canGoNextPage = computed(() =>
    mangaStore.readingMode === 'single' ? mangaStore.canGoNextPage : mangaStore.currentPage < mangaStore.totalPages - 1
)
</script>

<style scoped>
.nav-overlay {
    backdrop-filter: blur(5px);
}
</style>