<template>
    <div
class="fixed bottom-4 left-4 right-4 flex justify-between items-center z-40 transition-opacity duration-500"
        :class="{ 'opacity-0': !isInterfaceVisible }">
        <!-- <button
v-if="canGoPrevPage" class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100"
            @click="$emit('prev-page')">
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button> -->
        <span>&nbsp;</span>
        <div class="flex flex-col items-center">
            <button
class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100 mb-2"
                @click="$emit('toggle-nav-overlay')">
                <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <span class="bg-base-200 bg-opacity-70 px-2 py-1 rounded-full text-sm font-medium">
                {{ pageCounter }}
            </span>
        </div>
        <!-- <button
v-if="canGoNextPage" class="btn btn-circle btn-lg bg-base-200 bg-opacity-70 hover:bg-opacity-100"
            @click="$emit('next-page')">
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button> -->
        <span>&nbsp;</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    isInterfaceVisible: boolean
    canGoPrevPage: boolean
    canGoNextPage: boolean
    pageCounter: string
}>()

defineEmits<{
    (e: 'prev-page' | 'next-page' | 'toggle-nav-overlay'): void
}>()
</script>