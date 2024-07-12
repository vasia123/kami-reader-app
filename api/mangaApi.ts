// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для генерации URL placeholder-изображения
const getPlaceholderImage = (width: number, height: number, text: string) => {
  return `https://placehold.co/${width}x${height}?text=${encodeURIComponent(text)}`;
};

// Фиктивные данные манги с placeholder-изображениями
const dummyMangaList = [
  {
    id: '1',
    title: 'Naruto',
    author: 'Masashi Kishimoto',
    coverImage: getPlaceholderImage(200, 300, 'Naruto'),
    description: 'Ninja adventure in the hidden village of Konoha.',
    genres: ['Action', 'Adventure', 'Fantasy']
  },
  {
    id: '2',
    title: 'One Piece',
    author: 'Eiichiro Oda',
    coverImage: getPlaceholderImage(200, 300, 'One Piece'),
    description: 'Pirate adventure in search of the ultimate treasure.',
    genres: ['Action', 'Adventure', 'Comedy']
  },
  {
    id: '3',
    title: 'Attack on Titan',
    author: 'Hajime Isayama',
    coverImage: getPlaceholderImage(200, 300, 'Attack on Titan'),
    description: 'Humanity fights for survival against man-eating giants.',
    genres: ['Action', 'Dark Fantasy', 'Post-apocalyptic']
  },
];

const dummyChapters = [
  { id: '1', title: 'Chapter 1', pages: 45 },
  { id: '2', title: 'Chapter 2', pages: 39 },
  { id: '3', title: 'Chapter 3', pages: 42 },
];

export const fetchMangaList = async () => {
  await delay(1000); // Имитация задержки сети
  return dummyMangaList;
};

export const fetchMangaDetails = async (mangaId: string) => {
  await delay(800); // Имитация задержки сети
  const manga = dummyMangaList.find(m => m.id === mangaId);
  
  if (manga) {
    return { ...manga, chapters: dummyChapters };
  } else {
    throw new Error('Manga not found');
  }
};

export const fetchMangaPages = async (mangaId: string, chapterId: string) => {
  await delay(1200); // Имитация задержки сети
  
  // Генерируем фиктивные URL страниц с placeholder-изображениями
  console.log('chapterId', chapterId)
  const chapter = dummyChapters.find(c => c.id === chapterId);
  if (chapter) {
    return Array.from({ length: chapter.pages }, (_, i) => ({
      pageNumber: i + 1,
      imageUrl: getPlaceholderImage(800, 1200, `Manga ${mangaId} - Chapter ${chapterId} - Page ${i + 1}`)
    }));
  } else {
    throw new Error('Chapter not found');
  }
};

export const searchManga = async (query: string) => {
  await delay(600); // Имитация задержки сети
  return dummyMangaList.filter(manga => 
    manga.title.toLowerCase().includes(query.toLowerCase()) ||
    manga.author.toLowerCase().includes(query.toLowerCase())
  );
};