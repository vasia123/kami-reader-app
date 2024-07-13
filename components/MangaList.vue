<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMangaStore } from '../store/manga'

const router = useRouter()
const mangaStore = useMangaStore()

onMounted(async () => {
  await mangaStore.loadMangaList()
})

const navigateToManga = (mangaId: number) => {
  router.push(`/manga/${mangaId}`)
}
</script>

<template>
  <div class="manga-list container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Manga List</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="manga in mangaStore.mangaList" :key="manga.id" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{{ manga.name }}</h2>
          <div class="card-actions justify-end">
            <button class="btn btn-primary" @click="navigateToManga(manga.id)">Read</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>