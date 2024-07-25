<template>
    <div
v-if="showNavOverlay"
        class="nav-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-500"
        :class="{ 'opacity-0': !isInterfaceVisible }" @click="hideOverlay">
        <div class="bg-base-100 p-4 rounded-lg shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold">{{ mangaStore.currentManga?.name }} - {{ mangaStore.currentChapter?.name
                    }}</h2>
                <button class="btn btn-circle btn-sm" @click="toggleNavOverlay">
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
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
                <span>Page {{ mangaStore.currentPage + 1 }} of {{ mangaStore.totalPages }}</span>
                <select
v-if="mangaStore.readingMode === 'single'" :value="mangaStore.currentPage"
                    class="select select-bordered w-32" @change="goToPage">
                    <option v-for="page in mangaStore.totalPages" :key="page - 1" :value="page - 1">
                        {{ page }}
                    </option>
                </select>
                <button class="btn btn-secondary" @click="toggleReadingMode">
                    Mode: {{ mangaStore.readingMode.charAt(0).toUpperCase() + mangaStore.readingMode.slice(1) }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMangaStore } from '../store/manga'

defineProps<{
    showNavOverlay: boolean
    canGoPrevChapter: boolean
    canGoNextChapter: boolean
    isInterfaceVisible: boolean
}>()

const emit = defineEmits<{
    (e: 'toggle-nav-overlay' | 'prev-page' | 'next-page' | 'toggle-reading-mode'): void
    (e: 'hide-overlay', event: MouseEvent): void
    (e: 'go-to-page', event: Event): void
}>()

const mangaStore = useMangaStore()

const toggleNavOverlay = () => emit('toggle-nav-overlay')
const hideOverlay = (event: MouseEvent) => emit('hide-overlay', event)
const prevPage = () => emit('prev-page')
const nextPage = () => emit('next-page')
const toggleReadingMode = () => emit('toggle-reading-mode')
const goToPage = (event: Event) => emit('go-to-page', event)
</script>