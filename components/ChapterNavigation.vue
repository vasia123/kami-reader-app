<template>
    <div class="flex justify-between items-center">
        <button :disabled="!canGoPrevChapter" class="btn btn-secondary btn-sm" @click="$emit('go-to-prev-chapter')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
fill-rule="evenodd"
                    d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd" />
            </svg>
            Предыдущая глава
        </button>
        <button :disabled="!canGoNextChapter" class="btn btn-secondary btn-sm" @click="$emit('go-to-next-chapter')">
            Следующая глава
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
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
</template>

<script setup lang="ts">
defineProps<{
    canGoPrevChapter: boolean
    canGoNextChapter: boolean
}>()

defineEmits<{
    (e: 'go-to-prev-chapter' | 'go-to-next-chapter'): void
}>()
</script>