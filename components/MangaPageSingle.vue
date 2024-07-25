<template>
    <div class="relative">
        <div v-show="isLoading" class="absolute inset-0 flex items-center justify-center bg-base-200">
            <span class="loading loading-spinner loading-lg" />
        </div>
        <img :src="image" :alt="altText" class="max-w-full h-auto" @load="handleImageLoaded">
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
    image: string
    altText: string
}>()

const emit = defineEmits<{
    (e: 'load'): void
}>()

const isLoading = ref(true)

const handleImageLoaded = () => {
    isLoading.value = false
    emit('load')
}
</script>