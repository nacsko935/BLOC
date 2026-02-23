// Types pour les Réels (style TikTok)
export interface Reel {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorType: 'student' | 'professor' | 'school';
  authorAvatar?: string;
  
  // Content
  type: 'video' | 'image' | 'tutorial';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  tags: string[];
  courseRelated?: string; // ID du cours si lié
  
  // Stats
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  
  // Metadata
  duration?: number; // en secondes pour vidéo
  createdAt: string;
  updatedAt: string;
}

export interface ReelComment {
  id: string;
  reelId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  text: string;
  likesCount: number;
  createdAt: string;
}

// Mock data pour les Réels
export const mockReels: Reel[] = [
  {
    id: 'r1',
    authorId: 'prof1',
    authorName: 'Dr. Martin',
    authorHandle: '@m.martin',
    authorType: 'professor',
    type: 'video',
    mediaUrl: 'https://picsum.photos/400/700?random=1',
    caption: '🔥 Astuce pour comprendre les réseaux TCP/IP en 30 secondes ! #réseaux #tutoriel',
    tags: ['réseaux', 'TCP/IP', 'tutoriel'],
    courseRelated: 'c1',
    viewsCount: 12500,
    likesCount: 890,
    commentsCount: 45,
    sharesCount: 120,
    duration: 30,
    createdAt: '2024-02-12T10:30:00Z',
    updatedAt: '2024-02-12T10:30:00Z',
  },
  {
    id: 'r2',
    authorId: 'student1',
    authorName: 'Sophie L.',
    authorHandle: '@sophie.l',
    authorType: 'student',
    type: 'image',
    mediaUrl: 'https://picsum.photos/400/700?random=2',
    caption: 'Ma fiche de révision pour l\'examen de BDD 📚✨ #révisions #fiches',
    tags: ['révisions', 'BDD', 'fiches'],
    courseRelated: 'c3',
    viewsCount: 8200,
    likesCount: 620,
    commentsCount: 32,
    sharesCount: 85,
    createdAt: '2024-02-12T09:15:00Z',
    updatedAt: '2024-02-12T09:15:00Z',
  },
  {
    id: 'r3',
    authorId: 'school1',
    authorName: 'ESGI Paris',
    authorHandle: '@esgi_paris',
    authorType: 'school',
    type: 'video',
    mediaUrl: 'https://picsum.photos/400/700?random=3',
    caption: '🎓 Découvrez notre nouveau labo d\'IA ! #innovation #campus',
    tags: ['campus', 'IA', 'innovation'],
    viewsCount: 25000,
    likesCount: 1800,
    commentsCount: 120,
    sharesCount: 450,
    duration: 45,
    createdAt: '2024-02-11T16:00:00Z',
    updatedAt: '2024-02-11T16:00:00Z',
  },
  {
    id: 'r4',
    authorId: 'prof2',
    authorName: 'Pr. Dubois',
    authorHandle: '@p.dubois',
    authorType: 'professor',
    type: 'tutorial',
    mediaUrl: 'https://picsum.photos/400/700?random=4',
    caption: '💡 Comment optimiser vos algorithmes de tri ? Thread step by step 🧵 #algo #optimisation',
    tags: ['algorithme', 'optimisation', 'tutoriel'],
    courseRelated: 'c4',
    viewsCount: 15300,
    likesCount: 1100,
    commentsCount: 78,
    sharesCount: 230,
    duration: 60,
    createdAt: '2024-02-11T14:20:00Z',
    updatedAt: '2024-02-11T14:20:00Z',
  },
  {
    id: 'r5',
    authorId: 'student2',
    authorName: 'Alex M.',
    authorHandle: '@alex.dev',
    authorType: 'student',
    type: 'video',
    mediaUrl: 'https://picsum.photos/400/700?random=5',
    caption: '🚀 Mon setup de dev pour être ultra productif ! #dev #setup #productivity',
    tags: ['dev', 'setup', 'productivity'],
    viewsCount: 9800,
    likesCount: 740,
    commentsCount: 56,
    sharesCount: 95,
    duration: 40,
    createdAt: '2024-02-11T11:45:00Z',
    updatedAt: '2024-02-11T11:45:00Z',
  },
  {
    id: 'r6',
    authorId: 'prof3',
    authorName: 'Dr. Chen',
    authorHandle: '@l.chen',
    authorType: 'professor',
    type: 'video',
    mediaUrl: 'https://picsum.photos/400/700?random=6',
    caption: '🗄️ Les 5 erreurs à éviter en conception de BDD #database #tips',
    tags: ['database', 'tips', 'BDD'],
    courseRelated: 'c3',
    viewsCount: 18500,
    likesCount: 1350,
    commentsCount: 92,
    sharesCount: 310,
    duration: 50,
    createdAt: '2024-02-10T15:30:00Z',
    updatedAt: '2024-02-10T15:30:00Z',
  },
];
