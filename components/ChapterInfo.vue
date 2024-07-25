<template>
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">{{ chapterName }}</h3>
      <div class="flex justify-between items-center">
        <span class="text-sm opacity-70">Страница {{ currentPage + 1 }} из {{ totalPages }}</span>
        <div class="flex items-center space-x-2">
          <span class="text-sm opacity-70">Режим чтения:</span>
          <button
            class="btn btn-sm btn-outline"
            :class="{ 'btn-active': readingMode === 'vertical' }"
            @click="$emit('toggle-reading-mode')"
          >
            {{ readingMode === 'vertical' ? 'Вертикальный' : 'Одиночный' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    chapterName?: string
    currentPage: number
    totalPages: number
    readingMode: 'vertical' | 'single'
  }>()
  
  defineEmits<{
    (e: 'toggle-reading-mode'): void
  }>()
  </script>