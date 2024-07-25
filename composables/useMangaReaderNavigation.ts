import { ref, computed } from 'vue'
import { useMangaStore } from '../store/manga'

export function useMangaReaderNavigation(mangaId: number, chapterId: number) {
    const mangaStore = useMangaStore()

    const showNavOverlay = ref(false)

    const currentChapterIndex = computed(() =>
        mangaStore.currentChapters.findIndex(ch => ch.id === chapterId)
    )

    const canGoNextChapter = computed(() =>
        currentChapterIndex.value < mangaStore.currentChapters.length - 1
    )

    const canGoPrevChapter = computed(() => currentChapterIndex.value > 0)

    const pageCounter = computed(() => `${mangaStore.currentPage + 1} / ${mangaStore.totalPages}`)

    const nextPage = () => {
        if (mangaStore.readingMode === 'single' && mangaStore.canGoNextPage) {
            mangaStore.setCurrentPage(mangaStore.currentPage + 1)
        } else if (canGoNextChapter.value) {
            mangaStore.goToNextChapter()
        }
    }

    const prevPage = () => {
        if (mangaStore.readingMode === 'single' && mangaStore.canGoPrevPage) {
            mangaStore.setCurrentPage(mangaStore.currentPage - 1)
        } else if (canGoPrevChapter.value) {
            mangaStore.goToPrevChapter()
        }
    }

    const toggleReadingMode = () => {
        const modes: Array<'vertical' | 'single'> = ['vertical', 'single']
        const currentIndex = modes.indexOf(mangaStore.readingMode)
        const nextIndex = (currentIndex + 1) % modes.length
        mangaStore.setReadingMode(modes[nextIndex])
    }

    const toggleNavOverlay = () => {
        showNavOverlay.value = !showNavOverlay.value
    }

    const hideOverlay = (event: MouseEvent) => {
        if ((event.target as HTMLElement).classList.contains('nav-overlay')) {
            showNavOverlay.value = false
        }
    }

    const goToPage = (event: Event) => {
        const target = event.target as HTMLSelectElement
        const pageNumber = parseInt(target.value, 10)
        if (pageNumber >= 0 && pageNumber < mangaStore.totalPages) {
            mangaStore.setCurrentPage(pageNumber)
        }
    }

    return {
        showNavOverlay,
        currentChapterIndex,
        canGoNextChapter,
        canGoPrevChapter,
        pageCounter,
        nextPage,
        prevPage,
        toggleReadingMode,
        toggleNavOverlay,
        hideOverlay,
        goToPage
    }
}