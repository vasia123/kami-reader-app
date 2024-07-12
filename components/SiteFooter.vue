<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-neutral text-neutral-content p-4 mt-8">
    <div class="container mx-auto text-center">
      <p>&copy; {{ currentYear }} MangaReader. All rights reserved.</p>
    </div>
  </footer>
</template>