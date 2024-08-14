<template>
    <div class="side-navigation-buttons">
      <!-- Левая кнопка для перехода к предыдущей странице -->
      <div
        class="nav-button left-button"
        :class="{ 'can-navigate': canGoPrevPage }"
        @click="handlePrevPage"
        @touchend="handleTouchEnd"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          <path fill-rule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clip-rule="evenodd" />
        </svg>
      </div>
  
      <!-- Правая кнопка для перехода к следующей странице -->
      <div
        class="nav-button right-button"
        :class="{ 'can-navigate': canGoNextPage }"
        @click="handleNextPage"
        @touchend="handleTouchEnd"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits, ref } from 'vue';
  
  const props = defineProps<{
    canGoPrevPage: boolean;
    canGoNextPage: boolean;
  }>();
  
  const emit = defineEmits<{
    (e: 'prev-page' | 'next-page'): void;
  }>();
  
  const isButtonPressed = ref(false);
  
  const handlePrevPage = () => {
    if (props.canGoPrevPage) {
      isButtonPressed.value = true;
      emit('prev-page');
    }
  };
  
  const handleNextPage = () => {
    if (props.canGoNextPage) {
      isButtonPressed.value = true;
      emit('next-page');
    }
  };
  
  const handleTouchEnd = () => {
    // Сбрасываем состояние нажатия кнопки через короткий промежуток времени
    setTimeout(() => {
      isButtonPressed.value = false;
    }, 300);
  };
  </script>
  
  <style scoped>
  .side-navigation-buttons {
    @apply fixed inset-y-0 left-0 right-0 flex justify-between items-center pointer-events-none;
  }
  
  .nav-button {
    @apply h-full w-1/4 flex items-center justify-center text-white opacity-0 transition-opacity duration-300 cursor-pointer pointer-events-auto;
  }
  
  .nav-button.can-navigate {
    @apply hover:opacity-50;
  }
  
  .left-button {
    @apply justify-start pl-4;
  }
  
  .right-button {
    @apply justify-end pr-4 ml-auto;
  }
  
  /* Стили для мобильных устройств */
  @media (max-width: 768px) {
    .nav-button {
      @apply opacity-0;
    }
    .nav-button.can-navigate:active {
      @apply opacity-30;
    }
  }
  
  /* Стили для десктопа */
  @media (min-width: 769px) {
    .nav-button {
      @apply opacity-0 hover:opacity-50;
    }
  }
  </style>