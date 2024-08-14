import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMangaStore } from '../store/manga'

export function useMangaReader(mangaId: number, chapterId: number) {
  const mangaStore = useMangaStore()
  const readerContent = ref<HTMLElement | null>(null)
  const isInterfaceVisible = ref(true)
  const showNavOverlay = ref(false)
  const imageRefs = ref<(HTMLImageElement | null)[]>([])
  let intersectionObserver: IntersectionObserver | null = null

  const pagesContainerClass = computed(() => ({
    'flex flex-col': mangaStore.readingMode === 'vertical',
    'flex justify-center': mangaStore.readingMode === 'single'
  }))

  const canGoPrevPage = computed(() => {
    if (mangaStore.readingMode === 'vertical') {
      return mangaStore.currentPage > 0 || mangaStore.currentChapters.findIndex(ch => ch.id === chapterId) > 0
    }
    return mangaStore.canGoPrevPage || mangaStore.currentChapters.findIndex(ch => ch.id === chapterId) > 0
  })

  const canGoNextPage = computed(() => {
    if (mangaStore.readingMode === 'vertical') {
      return mangaStore.currentPage < mangaStore.totalPages - 1 || 
             mangaStore.currentChapters.findIndex(ch => ch.id === chapterId) < mangaStore.currentChapters.length - 1
    }
    return mangaStore.canGoNextPage || mangaStore.currentChapters.findIndex(ch => ch.id === chapterId) < mangaStore.currentChapters.length - 1
  })

  const pageCounter = computed(() => `${mangaStore.currentPage + 1} / ${mangaStore.totalPages}`)

  const navOverlayProps = computed(() => ({
    showNavOverlay: showNavOverlay.value,
    canGoPrevChapter: mangaStore.currentChapters.findIndex(ch => ch.id === chapterId) > 0,
    canGoNextChapter: mangaStore.currentChapters.findIndex(ch => ch.id === chapterId) < mangaStore.currentChapters.length - 1,
    isInterfaceVisible: isInterfaceVisible.value
  }))

  const toggleNavOverlay = () => {
    showNavOverlay.value = !showNavOverlay.value
  }

  const hideOverlay = () => {
    showNavOverlay.value = false
  }

  const scrollToTopAfterHeader = () => {
    nextTick(() => {
      const header = document.querySelector('header');
      if (header) {
        const headerHeight = header.getBoundingClientRect().height;
        window.scrollTo({
          top: headerHeight,
          behavior: 'smooth'
        });
      }
    });
  };


  const prevPage = () => {
    if (mangaStore.readingMode === 'single') {
      if (mangaStore.canGoPrevPage) {
        mangaStore.setCurrentPage(mangaStore.currentPage - 1)
        scrollToTopAfterHeader()
      } else {
        goToPrevChapter()
      }
    } else if (canGoPrevPage.value) {
      goToPrevChapter()
    }
  }

  const nextPage = () => {
    if (mangaStore.readingMode === 'single') {
      if (mangaStore.canGoNextPage) {
        mangaStore.setCurrentPage(mangaStore.currentPage + 1)
        scrollToTopAfterHeader()
      } else {
        goToNextChapter()
      }
    } else if (canGoNextPage.value) {
      goToNextChapter()
    }
  }

  const goToPage = (pageNumber: number) => {
    mangaStore.setCurrentPage(pageNumber)
    if (mangaStore.readingMode === 'vertical') {
      scrollToPage(pageNumber)
    } else {
      scrollToTopAfterHeader()
    }
  }

  const toggleReadingMode = () => {
    const newMode = mangaStore.readingMode === 'vertical' ? 'single' : 'vertical'
    mangaStore.setReadingMode(newMode)
    if (newMode === 'vertical') {
      // При переключении на вертикальный режим прокручиваем к текущей странице
      nextTick(() => scrollToPage(mangaStore.currentPage))
    } else {
      scrollToTop()
    }
  }

  const goToPrevChapter = async () => {
    const currentChapterIndex = mangaStore.currentChapters.findIndex(ch => ch.id === chapterId)
    if (currentChapterIndex > 0) {
      const prevChapter = mangaStore.currentChapters[currentChapterIndex - 1]
      await mangaStore.loadChapterImages(prevChapter.id)
      mangaStore.setCurrentPage(0)
      scrollToTop()
    }
  }

  const goToNextChapter = async () => {
    const currentChapterIndex = mangaStore.currentChapters.findIndex(ch => ch.id === chapterId)
    if (currentChapterIndex < mangaStore.currentChapters.length - 1) {
      const nextChapter = mangaStore.currentChapters[currentChapterIndex + 1]
      await mangaStore.loadChapterImages(nextChapter.id)
      mangaStore.setCurrentPage(0)
      scrollToTop()
    }
  }

  const scrollToPage = (pageIndex: number) => {
    const targetImage = imageRefs.value[pageIndex]
    if (targetImage) {
      targetImage.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const setupIntersectionObserver = () => {
    intersectionObserver?.disconnect()

    intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = imageRefs.value.findIndex(img => img === entry.target)
          if (index !== -1) {
            mangaStore.setCurrentPage(index)
          }
        }
      })
    }, { threshold: 0.5 })

    updateObservedImages()
  }

  const updateObservedImages = () => {
    if (!intersectionObserver) return

    imageRefs.value.forEach(img => {
      if (img) intersectionObserver?.observe(img)
    })
  }

  const setImageRef = (el: HTMLImageElement | null, index: number) => {
    if (el !== imageRefs.value[index]) {
      imageRefs.value[index] = el
      updateObservedImages()
    }
  }

  watch([() => mangaStore.readingMode, () => chapterId], () => {
    imageRefs.value = []
    setupIntersectionObserver()
    if (mangaStore.readingMode === 'vertical') {
      scrollToPage(mangaStore.currentPage)
    }
  })

  onMounted(() => {
    setupIntersectionObserver()
  })

  onUnmounted(() => {
    intersectionObserver?.disconnect()
  })
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    readerContent,
    isInterfaceVisible,
    pagesContainerClass,
    showNavOverlay,
    canGoPrevPage,
    canGoNextPage,
    pageCounter,
    navOverlayProps,
    toggleNavOverlay,
    hideOverlay,
    prevPage,
    nextPage,
    toggleReadingMode,
    goToPage,
    goToPrevChapter,
    goToNextChapter,
    setImageRef,
    scrollToPage,
    scrollToTop,
    scrollToTopAfterHeader,
  }
}