// Types pour le système de cours
export interface Course {
  id: string;
  name: string;
  semester: 'S1' | 'S2';
  professor: {
    name: string;
    handle: string;
  };
  color: string; // Couleur d'accent pour la matière
  icon: string; // Emoji ou icône
  stats: {
    notesCount: number;
    qcmCount: number;
    progress: number; // 0-100
    lastActivity: string;
  };
}

export interface CourseNote {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'markdown' | 'audio' | 'video';
  size?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface CourseQCM {
  id: string;
  courseId: string;
  title: string;
  questionsCount: number;
  duration: number; // en minutes
  lastScore?: number; // 0-100
  bestScore?: number; // 0-100
  attempts: number;
  createdAt: string;
}

export interface CourseDeadline {
  id: string;
  courseId: string;
  title: string;
  type: 'exam' | 'homework' | 'project';
  date: string;
  description?: string;
  completed: boolean;
}

// Mock data
export const mockCourses: Course[] = [
  {
    id: 'c1',
    name: 'Réseaux & Protocoles',
    semester: 'S1',
    professor: {
      name: 'Dr. Martin',
      handle: '@m.martin',
    },
    color: '#3d8fff',
    icon: '🌐',
    stats: {
      notesCount: 12,
      qcmCount: 5,
      progress: 68,
      lastActivity: 'il y a 2h',
    },
  },
  {
    id: 'c2',
    name: 'Systèmes d\'Exploitation',
    semester: 'S1',
    professor: {
      name: 'Pr. Dubois',
      handle: '@p.dubois',
    },
    color: '#f5a623',
    icon: '💻',
    stats: {
      notesCount: 18,
      qcmCount: 8,
      progress: 85,
      lastActivity: 'il y a 5h',
    },
  },
  {
    id: 'c3',
    name: 'Base de Données',
    semester: 'S1',
    professor: {
      name: 'Dr. Chen',
      handle: '@l.chen',
    },
    color: '#b164ff',
    icon: '🗄️',
    stats: {
      notesCount: 15,
      qcmCount: 6,
      progress: 72,
      lastActivity: 'hier',
    },
  },
  {
    id: 'c4',
    name: 'Algorithmique Avancée',
    semester: 'S2',
    professor: {
      name: 'Pr. Laurent',
      handle: '@j.laurent',
    },
    color: '#34c759',
    icon: '🧮',
    stats: {
      notesCount: 10,
      qcmCount: 4,
      progress: 45,
      lastActivity: 'il y a 3j',
    },
  },
  {
    id: 'c5',
    name: 'Développement Web',
    semester: 'S2',
    professor: {
      name: 'Dr. Rousseau',
      handle: '@a.rousseau',
    },
    color: '#ff3b30',
    icon: '🌍',
    stats: {
      notesCount: 22,
      qcmCount: 9,
      progress: 91,
      lastActivity: 'il y a 1h',
    },
  },
  {
    id: 'c6',
    name: 'Intelligence Artificielle',
    semester: 'S2',
    professor: {
      name: 'Pr. Zhang',
      handle: '@m.zhang',
    },
    color: '#ff2d55',
    icon: '🤖',
    stats: {
      notesCount: 8,
      qcmCount: 3,
      progress: 32,
      lastActivity: 'il y a 5j',
    },
  },
];

export const mockCourseNotes: CourseNote[] = [
  {
    id: 'n1',
    courseId: 'c1',
    title: 'Introduction aux protocoles TCP/IP',
    type: 'pdf',
    size: '2.4 MB',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    tags: ['tcp', 'ip', 'réseaux'],
  },
  {
    id: 'n2',
    courseId: 'c1',
    title: 'Modèle OSI - Les 7 couches',
    type: 'markdown',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-22',
    tags: ['osi', 'modèle'],
  },
  {
    id: 'n3',
    courseId: 'c1',
    title: 'Routage et commutation',
    type: 'pdf',
    size: '3.1 MB',
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
    tags: ['routage', 'switch'],
  },
];

export const mockCourseQCMs: CourseQCM[] = [
  {
    id: 'q1',
    courseId: 'c1',
    title: 'QCM - Protocoles réseau',
    questionsCount: 20,
    duration: 30,
    lastScore: 86,
    bestScore: 92,
    attempts: 3,
    createdAt: '2024-01-10',
  },
  {
    id: 'q2',
    courseId: 'c1',
    title: 'Test - Modèle OSI',
    questionsCount: 15,
    duration: 20,
    lastScore: 78,
    bestScore: 85,
    attempts: 2,
    createdAt: '2024-01-15',
  },
];

export const mockCourseDeadlines: CourseDeadline[] = [
  {
    id: 'd1',
    courseId: 'c1',
    title: 'Examen Final - Réseaux',
    type: 'exam',
    date: '2024-02-28',
    description: 'Examen sur l\'ensemble du cours',
    completed: false,
  },
  {
    id: 'd2',
    courseId: 'c1',
    title: 'TP - Configuration routeur',
    type: 'homework',
    date: '2024-02-15',
    description: 'Configurer un routeur Cisco',
    completed: false,
  },
];
