<template>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-primary">{{ mangaName }}</h2>
      <button class="btn btn-circle btn-ghost" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    mangaName?: string
  }>()
  
  defineEmits<{
    (e: 'close'): void
  }>()
  </script>