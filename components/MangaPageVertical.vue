<template>
    <div class="relative">
        <div v-show="isLoading" class="absolute inset-0 flex items-center justify-center bg-base-200">
            <span class="loading loading-spinner loading-lg" />
        </div>
        <img
ref="imageRef" :src="image.url" :alt="`Page ${image.page}`" class="max-w-full h-auto"
            :class="{ 'opacity-50': isRead }" @load="handleImageLoaded">
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ChapterImage } from '../api/mangaApi'

defineProps<{
    image: ChapterImage
    isRead: boolean
}>()

const emit = defineEmits<{
    (e: 'load'): void
    (e: 'set-ref', el: HTMLImageElement | null): void
}>()

const isLoading = ref(true)
const imageRef = ref<HTMLImageElement | null>(null)

const handleImageLoaded = () => {
    isLoading.value = false
    emit('load')
}

onMounted(() => {
    emit('set-ref', imageRef.value)
})
</script>