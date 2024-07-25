<template>
    <div
v-if="showNavOverlay"
        class="nav-overlay fixed inset-0 bg-base-200 bg-opacity-80 z-50 flex items-center justify-center transition-opacity duration-300"
        :class="{ 'opacity-0': !isInterfaceVisible }" @click="hideOverlay">
        <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-lg w-full mx-4" @click.stop>
            <!-- Заголовок и кнопка закрытия -->
            <div class="header flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-primary">{{ mangaStore.currentManga?.name }}</h2>
                <button class="btn btn-circle btn-ghost" @click="toggleNavOverlay">
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Информация о текущей главе -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-2">{{ mangaStore.currentChapter?.name }}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-sm opacity-70">Страница {{ mangaStore.currentPage + 1 }} из {{
                        mangaStore.totalPages }}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm opacity-70">Режим чтения:</span>
                        <button
class="btn btn-sm btn-outline"
                            :class="{ 'btn-active': mangaStore.readingMode === 'vertical' }" @click="toggleReadingMode">
                            {{ mangaStore.readingMode === 'vertical' ? 'Вертикальный' : 'Одиночный' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Навигация по страницам -->
            <div v-if="mangaStore.readingMode === 'single'" class="flex items-center justify-between mb-6">
                <button :disabled="!canGoPrevPage" class="btn btn-primary btn-sm" @click="prevPage">
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
fill-rule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    Предыдущая стр.
                </button>
                <select
:value="mangaStore.currentPage" class="select select-bordered select-sm max-w-xs"
                    @change="goToPage">
                    <option v-for="page in mangaStore.totalPages" :key="page - 1" :value="page - 1">
                        {{ page }}
                    </option>
                </select>
                <button :disabled="!canGoNextPage" class="btn btn-primary btn-sm" @click="nextPage">
                    Следующая стр.
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Навигация по главам -->
            <div class="flex justify-between items-center">
                <button :disabled="!canGoPrevChapter" class="btn btn-secondary btn-sm" @click="goToPrevChapter">
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
fill-rule="evenodd"
                            d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                            clip-rule="evenodd" />
                    </svg>
                    Предыдущая глава
                </button>
                <button :disabled="!canGoNextChapter" class="btn btn-secondary btn-sm" @click="goToNextChapter">
                    Следующая глава
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
fill-rule="evenodd"
                            d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                        <path
fill-rule="evenodd"
                            d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMangaStore } from '../store/manga'

defineProps<{
    showNavOverlay: boolean
    canGoPrevChapter: boolean
    canGoNextChapter: boolean
    isInterfaceVisible: boolean
}>()

const emit = defineEmits<{
    (e: 'toggle-nav-overlay'
        | 'prev-page'
        | 'next-page'
        | 'toggle-reading-mode'
        | 'go-to-prev-chapter'
        | 'go-to-next-chapter'
    ): void
    (e: 'hide-overlay', event: MouseEvent): void
    (e: 'go-to-page', event: Event): void
}>()

const mangaStore = useMangaStore()

// Вычисляемое свойство для проверки возможности перехода на предыдущую страницу
const canGoPrevPage = computed(() =>
    mangaStore.readingMode === 'single' ? mangaStore.canGoPrevPage : mangaStore.currentPage > 0
)

// Вычисляемое свойство для проверки возможности перехода на следующую страницу
const canGoNextPage = computed(() =>
    mangaStore.readingMode === 'single' ? mangaStore.canGoNextPage : mangaStore.currentPage < mangaStore.totalPages - 1
)

// Методы для эмиттинга событий
const toggleNavOverlay = () => emit('toggle-nav-overlay')
const hideOverlay = (event: MouseEvent) => emit('hide-overlay', event)
const prevPage = () => emit('prev-page')
const nextPage = () => emit('next-page')
const toggleReadingMode = () => emit('toggle-reading-mode')
const goToPage = (event: Event) => emit('go-to-page', event)
const goToPrevChapter = () => emit('go-to-prev-chapter')
const goToNextChapter = () => emit('go-to-next-chapter')
</script>

<style scoped>
.header {
    margin-top: -20px;
    margin-right: -20px;
    margin-bottom: -15px;
}

.nav-overlay {
    backdrop-filter: blur(5px);
}
</style>