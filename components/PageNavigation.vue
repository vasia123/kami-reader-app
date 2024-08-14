<template>
    <div class="flex items-center justify-between mb-6">
      <button :disabled="!canGoPrevPage" class="btn btn-primary btn-sm" @click="$emit('prev-page')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Пред. стр.
      </button>
      <select
        :value="currentPage"
        class="select select-bordered select-sm max-w-xs"
        @change="handlePageChange"
      >
        <option v-for="page in totalPages" :key="page - 1" :value="page - 1">
          {{ page }}
        </option>
      </select>
      <button :disabled="!canGoNextPage" class="btn btn-primary btn-sm" @click="$emit('next-page')">
        След. стр.
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    currentPage: number
    totalPages: number
    canGoPrevPage: boolean
    canGoNextPage: boolean
  }>()
  
  const emit = defineEmits<{
    (e: 'prev-page' | 'next-page'): void
    (e: 'go-to-page', page: number): void
  }>()
  
  const handlePageChange = (event: Event) => {
    const target = event.target as HTMLSelectElement | null
    if (target && target.value) {
      const page = parseInt(target.value, 10)
      if (!isNaN(page)) {
        emit('go-to-page', page)
      }
    }
  }
  </script>