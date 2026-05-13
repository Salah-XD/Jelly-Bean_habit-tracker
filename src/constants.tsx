import React from 'react';
import {
  Dumbbell, Apple, BookOpen, Droplets, Camera,
  Heart, Bike, Timer, Activity, Coffee,
  Brain, GraduationCap, Lightbulb, Pen,
  Leaf, Sun, Moon, Flower2, Wind,
  Music, Palette, Pencil, Film, Mic,
  Target, Clock, Mail, Phone, Briefcase,
  Users, MessageCircle, Gift,
  Star, Smile, Sparkles, Flame, Shield, Zap
} from 'lucide-react';

// ═══ TYPES ═══

export type HabitType = 'workout' | 'diet' | 'book' | 'water' | 'photo';

export interface CustomTask {
  id: string;
  name: string;
  subtitle?: string;
  duration?: string;
  icon: string;
  colorIdx: number;
}

export interface DayProgress {
  workout: boolean;
  diet: boolean;
  book: boolean;
  water: boolean;
  photo: boolean;
  customDone: string[];
  note: string;
  mood: string | null;
  lastSavedAt?: string;
}

export interface ChallengeState {
  startDate: string;
  progress: Record<number, DayProgress>;
  customTasks: CustomTask[];
  version: number;
  habitOverrides?: Partial<Record<HabitType, { duration?: string; label?: string; subtitle?: string; colorIdx?: number }>>;
}

export const DEFAULT_DAY: DayProgress = {
  workout: false, diet: false, book: false, water: false, photo: false,
  customDone: [], note: '', mood: null
};

export const HABITS: HabitType[] = ['workout', 'diet', 'book', 'water', 'photo'];

// ═══ HABIT META ═══

export const HABIT_META: Record<HabitType, {
  icon: React.ReactElement; label: string;
  line1: string; line2: string; duration: string;
  bg: string; text: string;
}> = {
  workout: { icon: <Dumbbell size={20} />, label: 'Workout', line1: 'Active', line2: 'Workout', duration: '45 Min', bg: '#DDB96E', text: '#4A3810' },
  diet: { icon: <Apple size={20} />, label: 'Meals', line1: 'Clean', line2: 'Meals', duration: 'Daily', bg: '#D4A0A8', text: '#4A1F27' },
  book: { icon: <BookOpen size={20} />, label: 'Reading', line1: 'Read 10', line2: 'Pages', duration: '20 Min', bg: '#B8AED4', text: '#2D2650' },
  water: { icon: <Droplets size={20} />, label: 'Water', line1: '1.5 Litre', line2: 'Hydration', duration: 'Daily', bg: '#7CC4B8', text: '#14403A' },
  photo: { icon: <Camera size={20} />, label: 'Photo', line1: 'Progress', line2: 'Photo', duration: 'Daily', bg: '#B8C89C', text: '#2E3E1C' },
};

// ═══ CALENDAR COLORS ═══

export const CAL_COLORS = [
  { bg: '#C5B8D6', text: '#3D3566', tag: '#9B86B8' },
  { bg: '#D4A0A8', text: '#5C2D35', tag: '#C08090' },
  { bg: '#7CC4B8', text: '#14403A', tag: '#5EA89C' },
  { bg: '#C8D4A0', text: '#3D4E2C', tag: '#A8B880' },
  { bg: '#DDB96E', text: '#4A3810', tag: '#C4A24D' },
  { bg: '#A0C4D4', text: '#1A3D4E', tag: '#6B9AB8' },
  { bg: '#D4B8A0', text: '#4E3D2C', tag: '#B89A6B' },
  { bg: '#B8D4A0', text: '#2C4E1A', tag: '#9AB86B' },
  { bg: '#C4A0D4', text: '#3D1A4E', tag: '#A26BC4' },
  { bg: '#D4A0B8', text: '#4E1A3D', tag: '#C46B9A' },
  { bg: '#A0D4C4', text: '#1A4E3D', tag: '#6BC4A2' },
  { bg: '#B8A0D4', text: '#2C1A4E', tag: '#926BC4' },
];

// ═══ TASK COLORS (for custom tasks) ═══

export const TASK_COLORS = [
  { bg: '#DDB96E', text: '#4A3810' },
  { bg: '#D4A0A8', text: '#4A1F27' },
  { bg: '#B8AED4', text: '#2D2650' },
  { bg: '#7CC4B8', text: '#14403A' },
  { bg: '#B8C89C', text: '#2E3E1C' },
  { bg: '#D4B080', text: '#5C3D1A' },
  { bg: '#80B8D4', text: '#1A3D5C' },
  { bg: '#C4A0C8', text: '#4A2650' },
];

// ═══ ICON REGISTRY ═══

const S = 20;
export const ICON_MAP: Record<string, React.ReactElement> = {
  dumbbell: <Dumbbell size={S}/>, apple: <Apple size={S}/>, book: <BookOpen size={S}/>,
  droplets: <Droplets size={S}/>, camera: <Camera size={S}/>, heart: <Heart size={S}/>,
  bike: <Bike size={S}/>, timer: <Timer size={S}/>, activity: <Activity size={S}/>,
  coffee: <Coffee size={S}/>, brain: <Brain size={S}/>, grad: <GraduationCap size={S}/>,
  lightbulb: <Lightbulb size={S}/>, pen: <Pen size={S}/>, leaf: <Leaf size={S}/>,
  sun: <Sun size={S}/>, moon: <Moon size={S}/>, flower: <Flower2 size={S}/>,
  wind: <Wind size={S}/>, music: <Music size={S}/>, palette: <Palette size={S}/>,
  pencil: <Pencil size={S}/>, film: <Film size={S}/>, mic: <Mic size={S}/>,
  target: <Target size={S}/>, clock: <Clock size={S}/>, mail: <Mail size={S}/>,
  phone: <Phone size={S}/>, briefcase: <Briefcase size={S}/>, users: <Users size={S}/>,
  message: <MessageCircle size={S}/>, gift: <Gift size={S}/>, star: <Star size={S}/>,
  smile: <Smile size={S}/>, sparkles: <Sparkles size={S}/>, flame: <Flame size={S}/>,
  shield: <Shield size={S}/>, zap: <Zap size={S}/>,
};

export const ICON_KEYS = Object.keys(ICON_MAP);

// ═══ MOODS ═══

export const MOODS = [
  { emoji: '🤩', label: 'Great', value: 4 },
  { emoji: '😊', label: 'Good', value: 3 },
  { emoji: '😐', label: 'Okay', value: 2 },
  { emoji: '😔', label: 'Bad', value: 1 },
];

export const MOTIVATIONAL_QUOTES = [
  "Small actions repeated daily become identities stronger than motivation ever could.",
  "Discipline builds the future your temporary emotions keep trying to destroy.",
  "One difficult day never ruins progress, quitting repeatedly always does.",
  "Consistency beats intensity when success depends on long-term transformation.",
  "Your future self is watching every excuse you make today.",
  "Habits decide your direction long before results become visible.",
  "Progress grows quietly while distractions scream for your attention.",
  "Motivation starts journeys, discipline finishes them without negotiation.",
  "Every repetition strengthens the person you are becoming daily.",
  "Greatness is usually boring routines executed with brutal consistency.",
  "Miss once, recover immediately, never allow failure to become identity.",
  "Tiny improvements compound faster than most people can imagine.",
  "Your comfort zone charges interest on every dream you abandon.",
  "Discipline is self-respect expressed through consistent daily action.",
  "Build habits that make difficult choices feel automatic over time.",
  "Momentum begins the moment excuses stop controlling your schedule.",
  "Success loves routines more than dramatic bursts of motivation.",
  "Every completed task teaches your brain to trust itself again.",
  "The strongest people master themselves before trying to master anything else.",
  "You become whatever your repeated actions silently reinforce every day.",
  "Hard days create resilient minds capable of extraordinary achievements.",
  "The life you want requires habits your current self resists.",
  "Excellence grows from repeated effort nobody else notices initially.",
  "Discipline turns impossible goals into scheduled daily responsibilities.",
  "Results appear slowly, then suddenly, after enough consistent effort.",
  "Your routines reveal priorities more honestly than your words ever will.",
  "Strong habits protect your future during moments of weakness.",
  "Improvement begins where excuses lose their emotional power over you.",
  "Action destroys anxiety faster than endless overthinking ever could.",
  "Every disciplined choice strengthens your ability to make another tomorrow.",
  "Habits create freedom by removing unnecessary daily decision-making.",
  "Your goals deserve effort even when motivation disappears completely.",
  "Consistency during difficult moments separates growth from wishful thinking.",
  "Discipline is choosing long-term pride over short-term comfort repeatedly.",
  "Tiny wins create unstoppable momentum when repeated without interruption.",
  "Growth feels uncomfortable because transformation demands leaving familiar patterns behind.",
  "Successful people protect routines like others protect their excuses.",
  "Every day is another opportunity to become harder to defeat.",
  "Self-control today creates opportunities unavailable to undisciplined people tomorrow.",
  "Dreams stay fantasies until routines begin supporting them consistently.",
  "The strongest foundation for confidence is keeping promises to yourself.",
  "Difficult routines become easy after enough repeated exposure and persistence.",
  "Every challenge completed increases your tolerance for future discomfort.",
  "Progress requires patience when results refuse to appear immediately.",
  "Discipline survives days when inspiration completely abandons you.",
  "Consistent effort eventually embarrasses natural talent lacking discipline.",
  "Habits shape character quietly while people focus only on outcomes.",
  "Small disciplined actions eventually create massive life-changing transformations.",
  "Your future depends heavily on today's repeated invisible choices.",
  "Every repetition builds evidence that you are capable of more.",
  "Real confidence comes from proving reliability to yourself repeatedly.",
  "Discipline means acting correctly despite emotional resistance and discomfort.",
  "Long-term success begins with winning ordinary daily battles consistently.",
  "Improvement becomes inevitable when quitting stops being considered an option.",
  "The hardest step is usually beginning before feeling completely ready.",
  "Successful routines remove opportunities for laziness to negotiate with you.",
  "Every disciplined morning increases the probability of a successful future.",
  "Habits determine outcomes long before motivation enters the conversation.",
  "Repetition creates mastery even when progress feels painfully slow.",
  "Your strongest weapon against failure is relentless consistent execution.",
  "Comfort delays growth while disciplined discomfort accelerates transformation.",
  "The version of yourself you admire requires daily intentional effort.",
  "Great achievements are collections of small disciplined decisions repeated consistently.",
  "Discipline creates stability when emotions become unpredictable and unreliable.",
  "Every difficult task completed increases your mental resilience significantly.",
  "Habits either build your future or quietly destroy it daily.",
  "Consistency is powerful because most people eventually stop trying.",
  "Daily discipline creates opportunities luck alone can never provide.",
  "Self-improvement starts with controlling actions before controlling outcomes.",
  "You are always training yourself, either intentionally or accidentally.",
  "Difficult habits become easier once identity aligns with the behavior.",
  "Your routines today are previews of your future tomorrow.",
  "Discipline transforms ordinary people into exceptionally reliable individuals over time.",
  "The gap between goals and reality is filled through consistent action.",
  "Success rewards persistence far more often than raw potential alone.",
];
