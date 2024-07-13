<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMangaStore } from '../store/manga'

const route = useRoute()
const router = useRouter()
const mangaStore = useMangaStore()

const mangaId = computed(() => Number(route.params.id))

onMounted(async () => {
  await mangaStore.loadMangaChapters(mangaId.value)
})

const startReading = (chapterId: number) => {
  router.push(`/manga/${mangaId.value}/chapter/${chapterId}`)
}
</script>

<template>
  <div v-if="mangaStore.currentManga" class="manga-details container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row gap-8">
      <div class="flex-1">
        <h1 class="text-3xl font-bold mb-4">{{ mangaStore.currentManga.name }}</h1>
        <h2 class="text-2xl font-bold mb-4">Chapters</h2>
        <ul class="space-y-2">
          <li v-for="chapter in mangaStore.currentChapters" :key="chapter.id" class="flex justify-between items-center">
            <span>{{ chapter.name }}</span>
            <button class="btn btn-primary btn-sm" @click="startReading(chapter.id)">Read</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="container mx-auto px-4 py-8 text-center">
    Loading manga details...
  </div>
</template>