<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMangaStore } from '../store/manga'

const router = useRouter()
const mangaStore = useMangaStore()

onMounted(async () => {
  await mangaStore.loadMangaList()
})

const navigateToManga = (mangaId: string) => {
  router.push(`/manga/${mangaId}`)
}
</script>

<template>
  <div class="manga-list container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Manga List</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="manga in mangaStore.mangaList" :key="manga.id" class="card bg-base-100 shadow-xl">
        <figure><img :src="manga.coverImage" :alt="manga.title" ></figure>
        <div class="card-body">
          <h2 class="card-title">{{ manga.title }}</h2>
          <p>{{ manga.description.substring(0, 100) }}...</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary" @click="navigateToManga(manga.id)">Read</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>