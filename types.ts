export interface UserProfile {
  username: string;
  level: "A1" | "A2" | "B1";
  xp: number;
  points: number;
  streak: number;
  lastPracticeDate: string;
  completedLessons: string[];
  completedTests: string[]; // e.g. ["A1", "A2"]
  achievements: Achievement[];
  scheduledSessions: ScheduledSession[];
  dailyGoalMins: number;
  practiceDuration: { [date: string]: number }; // minutes practiced per day (YYYY-MM-DD)
  notificationsEnabled: boolean;
  widgetSetting: {
    showStreak: boolean;
    showDailyWord: boolean;
    showNextClass: boolean;
    selectedWordId: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null;
  xpReward: number;
  icon: string; // Lucide icon string
}

export interface LessonStep {
  type: "theory" | "exercise";
  title?: string;
  content?: string; // HTML-friendly markdown/text
  contentAr?: string; // Explanation in Arabic
  comparativeCard?: {
    spanish: string;
    arabic: string;
    explanation: string; // Linguistic comparison notes or tips
    etymology?: string; // For shared Arab-Spanish roots
  };
  exercise?: {
    question: string;
    questionAr?: string;
    options: string[];
    correctAnswer: string;
    arabicGrammarTip: string; // Contextual tip inside the prompt
  };
}

export interface Lesson {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: "Grammar" | "Vocabulary" | "Culture";
  level: "A1" | "A2" | "B1";
  xpReward: number;
  steps: LessonStep[];
}

export interface ScheduledSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  topic: string; // e.g., "Práctica de Vocabulario"
  notifyBefore: boolean;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  level: string;
  specialty: string;
  style: string;
  styleEn: string;
  tagline: string;
}
