<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useMangaStore } from '../store/manga'
import { mangaApi } from '../api/mangaApi'

interface FileWrapper {
  id: number;
  file: File;
}

const mangaStore = useMangaStore()

const selectedMangaId = ref<number | null>(null)
const chapterName = ref('')
const chapterImages = ref<FileWrapper[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)

onMounted(async () => {
  await mangaStore.loadMangaList()
})

const uploadChapter = async () => {
  if (!selectedMangaId.value || !chapterName.value || chapterImages.value.length === 0) {
    alert('Please fill all fields and select at least one image')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    await mangaApi.uploadChapter(
      selectedMangaId.value,
      chapterName.value,
      chapterImages.value.map(wrapper => wrapper.file)
    )
    alert('Chapter uploaded successfully')
    // Reset form
    chapterName.value = ''
    chapterImages.value = []
  } catch (error) {
    console.error('Failed to upload chapter:', error)
    alert('Failed to upload chapter')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const newFiles = Array.from(target.files).map((file, index) => ({
      id: Date.now() + index,
      file
    }))
    chapterImages.value = [...chapterImages.value, ...newFiles].sort((a, b) => {
      return a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: 'base' })
    })
  }
}

const removeImage = (id: number) => {
  chapterImages.value = chapterImages.value.filter(wrapper => wrapper.id !== id)
}
</script>

<template>
  <div class="admin-upload container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Upload New Chapter</h1>
    <form class="space-y-4" @submit.prevent="uploadChapter">
      <div>
        <label for="manga" class="block mb-2">Select Manga:</label>
        <select id="manga" v-model="selectedMangaId" required class="select select-bordered w-full">
          <option v-for="manga in mangaStore.mangaList" :key="manga.id" :value="manga.id">
            {{ manga.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="chapterName" class="block mb-2">Chapter Name:</label>
        <input id="chapterName" v-model="chapterName" type="text" required class="input input-bordered w-full">
      </div>
      <div>
        <label for="chapterImages" class="block mb-2">Chapter Images:</label>
        <input id="chapterImages" type="file" multiple accept="image/*" class="file-input file-input-bordered w-full" @change="handleFileChange">
      </div>
      <div v-if="chapterImages.length > 0" class="mt-4">
        <h3 class="text-lg font-semibold mb-2">Selected Images (drag to reorder):</h3>
        <VueDraggable v-model="chapterImages" :animation="150" item-key="id">
          <template v-for="element, index in chapterImages" :key="element.id">
            <div class="flex items-center justify-between p-2 bg-base-200 rounded cursor-move mb-2">
              <div class="flex items-center">
                <span class="mr-2">{{ index + 1 }}.</span>
                <span>{{ element.file.name }}</span>
              </div>
              <button type="button" class="btn btn-sm btn-error" @click="removeImage(element.id)">Remove</button>
            </div>
          </template>
        </VueDraggable>
      </div>
      <button type="submit" :disabled="isUploading || chapterImages.length === 0" class="btn btn-primary">
        {{ isUploading ? 'Uploading...' : 'Upload Chapter' }}
      </button>
    </form>
    <div v-if="isUploading" class="mt-4">
      <progress class="progress progress-primary w-full" :value="uploadProgress" max="100"/>
      <p class="text-center mt-2">{{ Math.round(uploadProgress) }}% uploaded</p>
    </div>
  </div>
</template>