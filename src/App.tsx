import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Check, ChevronLeft, ChevronRight, X, Save, RotateCcw, Settings, Trash2, Pen, CheckCircle2, CalendarDays, MessageCircle, BarChart3, Timer as TimerIcon, Play, Pause, Square, ChevronDown, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { format, differenceInDays, startOfDay, parseISO, addDays } from 'date-fns';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  HabitType, CustomTask, DayProgress, ChallengeState, DEFAULT_DAY, HABITS,
  HABIT_META, CAL_COLORS, TASK_COLORS, ICON_MAP, ICON_KEYS, MOODS, MOTIVATIONAL_QUOTES
} from './constants';

type TabType = 'tasks' | 'calendar' | 'thoughts' | 'stats';
type SheetType = 'addTask' | 'settings' | 'addNote' | 'pomodoro' | 'rules' | null;

function UnitDropdown({ value, onChange }: { value: 'Min' | 'H'; onChange: (v: 'Min' | 'H') => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 80, padding: '12px 10px', borderRadius: 16, border: '1px solid #E0DDD6',
          fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none',
          cursor: 'pointer', color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4
        }}
      >
        <span>{value === 'H' ? 'Hr' : value}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="#A0A0A0" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
              backgroundColor: '#fff', borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden',
              minWidth: 80, border: '1px solid #E0DDD6'
            }}
          >
            {(['Min', 'H'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                  border: 'none', background: opt === value ? '#F9F8F6' : '#fff',
                  fontSize: 14, fontWeight: 600,
                  color: opt === value ? '#1A1A1A' : '#6B6B6B', cursor: 'pointer'
                }}
              >
                {opt === 'H' ? 'Hr' : opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SegmentedToggle({ value, onChange, options, layoutId }: { value: string; onChange: (v: any) => void; options: { value: string; label: string }[]; layoutId: string }) {
  return (
    <div style={{ display: 'flex', backgroundColor: '#EFEBE4', borderRadius: 12, padding: 4, gap: 4, position: 'relative' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            border: 'none', cursor: 'pointer', backgroundColor: 'transparent',
            color: value === opt.value ? '#1A1A1A' : '#A0A0A0',
            position: 'relative', zIndex: 1
          }}
        >
          {value === opt.value && (
            <motion.div
              layoutId={layoutId}
              style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 2 }}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function dateFor(startDate: string, dayNum: number) {
  const d = addDays(parseISO(startDate), dayNum - 1);
  return {
    dayName: format(d, 'EEEE'), dayNum: format(d, 'dd'),
    monthShort: format(d, 'MMM').toUpperCase(), fullDate: format(d, 'dd.MM'),
  };
}

function parseDurationToHours(dur: string | undefined): number {
  if (!dur) return 0;
  const lower = dur.toLowerCase();
  const numMatch = lower.match(/([0-9.]+)/);
  if (!numMatch) return 0;
  const val = parseFloat(numMatch[1]);
  if (lower.includes('h')) return val;
  if (lower.includes('m')) return val / 60;
  return val / 60;
}

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p className="date-info-value">{format(currentTime, 'hh:mm a')}</p>;
};

function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="onboarding-container" style={{ position: 'fixed', inset: 0, backgroundColor: '#EFEBE4', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="splash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <img src="/logo - no background.png" alt="Jelly Bean Logo" style={{ width: 120, height: 120, objectFit: 'contain' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: '#1A1A1A', margin: 0 }}>Jelly Bean</h1>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="rules" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} style={{ padding: 32, width: '100%', maxWidth: 400, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1.1, marginBottom: 16 }}>Welcome to Jelly Bean Challenge Mode</h2>
            <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 24, fontWeight: 500 }}>Build consistency, not perfection.<br/>Complete these habits daily for the next 75 days.</p>
            
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, color: '#1A1A1A' }}>Daily Rules</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                "Exercise for 20–30 minutes",
                "Eat balanced meals with protein and vegetables",
                "Avoid fast food and excess sugar",
                "Drink 1.5–2 liters of water",
                "Read at least 10 pages",
                "Sleep for 7+ hours",
                "Take progress photos regularly"
              ].map((rule, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: '#DDB96E', fontSize: 16 }}>•</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#2D2D2D', lineHeight: 1.4 }}>{rule}</span>
                </li>
              ))}
            </ul>

            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, color: '#1A1A1A' }}>Remember</h3>
            <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 500, lineHeight: 1.5, marginBottom: 40 }}>
              Small actions repeated daily create lasting change.<br/>
              Missed a day? Reset, refocus, continue stronger.
            </p>

            <button onClick={() => setStep(2)} style={{ width: '100%', padding: 18, borderRadius: 20, backgroundColor: '#1A1A1A', color: '#fff', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              Next
            </button>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="intro" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative' }}>
            <img src="/logo - no background.png" alt="Opening" style={{ width: '100%', maxWidth: 300, marginBottom: 40, borderRadius: 24, objectFit: 'contain' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1.1, textAlign: 'center', marginBottom: 16 }}>Ready to transform?</h2>
            <p style={{ fontSize: 15, color: '#6B6B6B', textAlign: 'center', marginBottom: 40, fontWeight: 500 }}>Your 75-day journey starts today.</p>
            <button onClick={onComplete} style={{ width: '100%', maxWidth: 400, padding: 18, borderRadius: 20, backgroundColor: '#1A1A1A', color: '#fff', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              Start Challenge
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [noteDay, setNoteDay] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetType>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [spinningCards, setSpinningCards] = useState<string[]>([]);
  const [expandedCalDay, setExpandedCalDay] = useState<number | null>(null);
  const [editTaskTime, setEditTaskTime] = useState<{ id: string, name: string, isCustom: boolean } | null>(null);
  const [editTagType, setEditTagType] = useState<'time' | 'custom'>('time');
  const [editTimeVal, setEditTimeVal] = useState('15');
  const [editTimeUnit, setEditTimeUnit] = useState<'Min' | 'H'>('Min');
  const [editDurationValue, setEditDurationValue] = useState("");
  const [renameHabitItem, setRenameHabitItem] = useState<{ id: string, name: string, isCustom: boolean } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);


  const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem('jellybean_has_onboarded') === 'true');

  const [state, setState] = useState<ChallengeState>(() => {
    const saved = localStorage.getItem('jellybean_pro_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Wipe test data by bumping version to 2
        if (parsed.version !== 2) throw new Error('reset state');
        if (!parsed.customTasks) parsed.customTasks = [];
        // ensure all progress entries have customDone
        Object.keys(parsed.progress).forEach(k => {
          if (!parsed.progress[k].customDone) parsed.progress[k].customDone = [];
        });
        return parsed;
      } catch (e) { console.error(e); }
    }
    return { startDate: format(new Date(), 'yyyy-MM-dd'), progress: {}, customTasks: [], version: 2 };
  });

  const currentDay = useMemo(() => {
    const start = startOfDay(parseISO(state.startDate || format(new Date(), 'yyyy-MM-dd')));
    return Math.max(1, Math.min(75, differenceInDays(startOfDay(new Date()), start) + 1));
  }, [state.startDate]);

  const getDayProgress = (day: number): DayProgress => ({
    ...DEFAULT_DAY, ...state.progress[day], customDone: state.progress[day]?.customDone || []
  });
  const todayProgress = getDayProgress(currentDay);

  useEffect(() => {
    localStorage.setItem('jellybean_pro_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const setupNotifications = async () => {
      const alreadySetup = localStorage.getItem('jellybean_notifications_setup') === 'true';
      if (alreadySetup) return;

      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== 'granted') return;

      const quoteIdx = parseInt(localStorage.getItem('jellybean_quote_index') || '0');

      const now = new Date();
      const firstDate = new Date(now.getTime() + 5 * 60 * 1000);

      await LocalNotifications.schedule({
        notifications: [{
          title: 'Daily Motivation',
          body: MOTIVATIONAL_QUOTES[quoteIdx % MOTIVATIONAL_QUOTES.length],
          id: 1,
          schedule: { at: firstDate },
          sound: undefined,
          smallIcon: 'ic_stat_icon_config',
          iconColor: '#DDB96E',
        }]
      });

      localStorage.setItem('jellybean_quote_index', String((quoteIdx + 1) % MOTIVATIONAL_QUOTES.length));

      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      if (midnight.getTime() <= now.getTime()) midnight.setDate(midnight.getDate() + 1);

      const nextIdx = parseInt(localStorage.getItem('jellybean_quote_index') || '0');
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Daily Motivation',
          body: MOTIVATIONAL_QUOTES[nextIdx % MOTIVATIONAL_QUOTES.length],
          id: 2,
          schedule: { at: midnight, repeats: true },
          sound: undefined,
          smallIcon: 'ic_stat_icon_config',
          iconColor: '#DDB96E',
        }]
      });

      localStorage.setItem('jellybean_quote_index', String((nextIdx + 1) % MOTIVATIONAL_QUOTES.length));
      localStorage.setItem('jellybean_notifications_setup', 'true');
    };

    setupNotifications().catch(console.error);
  }, []);

  const toggleHabit = useCallback((day: number, habit: HabitType) => {
    setSpinningCards(prev => [...prev, habit]);
    setTimeout(() => setSpinningCards(prev => prev.filter(id => id !== habit)), 600);
    setState(prev => {
      const dp = { ...DEFAULT_DAY, ...prev.progress[day], customDone: prev.progress[day]?.customDone || [] };
      dp[habit] = !dp[habit];
      if (HABITS.every(h => dp[h]) && !HABITS.every(h => (prev.progress[day] || DEFAULT_DAY)[h])) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 }, colors: ['#DDB96E', '#C5B8D6', '#7CC4B8'] });
      }
      return { ...prev, progress: { ...prev.progress, [day]: dp } };
    });
  }, []);

  const toggleCustom = useCallback((day: number, taskId: string) => {
    setSpinningCards(prev => [...prev, taskId]);
    setTimeout(() => setSpinningCards(prev => prev.filter(id => id !== taskId)), 600);
    setState(prev => {
      const dp = { ...DEFAULT_DAY, ...prev.progress[day], customDone: [...(prev.progress[day]?.customDone || [])] };
      dp.customDone = dp.customDone.includes(taskId)
        ? dp.customDone.filter(id => id !== taskId)
        : [...dp.customDone, taskId];
      return { ...prev, progress: { ...prev.progress, [day]: dp } };
    });
  }, []);

  const saveNote = useCallback((day: number, note: string, mood: string | null) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [day]: { ...DEFAULT_DAY, ...prev.progress[day], customDone: prev.progress[day]?.customDone || [], note, mood, lastSavedAt: new Date().toISOString() }
      }
    }));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  }, []);

  const addTask = useCallback((name: string, subtitle: string, duration: string, icon: string, colorIdx: number) => {
    setState(prev => ({
      ...prev, customTasks: [...prev.customTasks, { id: Date.now().toString(), name, subtitle, duration, icon, colorIdx }]
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({ ...prev, customTasks: prev.customTasks.filter(t => t.id !== taskId) }));
  }, []);

  const handleReset = useCallback(() => {
    const fresh: ChallengeState = { startDate: format(new Date(), 'yyyy-MM-dd'), progress: {}, customTasks: [], version: 1 };
    setState(fresh);
    localStorage.setItem('jellybean_pro_state', JSON.stringify(fresh));
    setSheet(null);
    setExpandedCalDay(null);
    setActiveTab('tasks');
  }, []);

  const streak = useMemo(() => {
    let c = 0;
    for (let i = currentDay; i >= 1; i--) {
      const d = state.progress[i];
      if (!d) break;
      if (HABITS.every(h => d[h])) c++;
      else if (i === currentDay) continue;
      else break;
    }
    return c;
  }, [state.progress, currentDay]);

  const info = dateFor(state.startDate, currentDay);

  // ═══ TASKS VIEW ═══
  const renderTasks = () => {
    const done = HABITS.filter(h => todayProgress[h]).length;
    const totalTasks = HABITS.length + state.customTasks.length;
    const customDone = state.customTasks.filter(t => todayProgress.customDone.includes(t.id)).length;
    const allDone = done + customDone;

    return (
      <div className="animate-fade-in">
        <div className="date-section">
          <p className="day-label">{info.dayName}</p>
          <div className="date-row">
            <div>
              <p className="date-big">{info.fullDate}</p>
              <p className="date-month">{info.monthShort}</p>
            </div>
            <div className="date-divider" />
            <div className="date-info">
              <div><RealTimeClock /><p className="date-info-label">Current Time</p></div>
              <div style={{ marginTop: 12 }}><p className="date-info-value">Day {currentDay} / 75</p><p className="date-info-label">{streak} Day Streak</p></div>
            </div>
          </div>
        </div>

        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
          <div>
            <h2 className="section-title">Today's habits</h2>
            <span className="section-badge">{allDone}/{totalTasks}</span>
          </div>
          <button onClick={() => setSheet('addNote')} 
            style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#2D2D2D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Pen size={18} />
          </button>
        </div>

        <div style={{ paddingBottom: 40 }}>
          {HABITS.map(type => {
            const m = HABIT_META[type];
            const isDone = todayProgress[type];
            const isSpinning = spinningCards.includes(type);
            return (
              <motion.div key={type} 
                whileTap={{ scale: 0.97 }} onClick={() => toggleHabit(currentDay, type)}
                className={`habit-card ${isSpinning ? 'animate-spin-vertical' : ''}`} style={{ backgroundColor: m.bg, color: m.text, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div><p className={`habit-title ${isDone ? 'strikethrough' : ''}`}>{m.line1}</p><p className={`habit-title ${isDone ? 'strikethrough' : ''}`}>{m.line2}</p></div>
                  <div className="habit-icon-circle">{isDone ? <Check size={20} strokeWidth={3}/> : m.icon}</div>
                </div>
                <div className="habit-bottom">
                  <span className="habit-time">{isDone ? '✓ Completed' : '○ Pending'}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDurationValue(state.habitOverrides?.[type]?.duration || m.duration);
                      setEditTaskTime({ id: type, name: m.label, isCustom: false });
                    }}
                    className="habit-duration-badge" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }}>
                    {state.habitOverrides?.[type]?.duration || m.duration}
                  </button>
                  <span className="habit-time" style={{ marginLeft: 'auto' }}>{isDone ? 'Done' : 'Tap to log'}</span>
                </div>
              </motion.div>
            );
          })}

          {state.customTasks.map(task => {
            const col = TASK_COLORS[task.colorIdx % TASK_COLORS.length];
            const isDone = todayProgress.customDone.includes(task.id);
            const icon = ICON_MAP[task.icon] || ICON_MAP.star;
            const isSpinning = spinningCards.includes(task.id);
            return (
              <motion.div key={task.id} 
                whileTap={{ scale: 0.97 }} onClick={() => toggleCustom(currentDay, task.id)}
                className={`habit-card ${isSpinning ? 'animate-spin-vertical' : ''}`} style={{ backgroundColor: col.bg, color: col.text, cursor: 'pointer' }}>
                <button className="delete-task-btn" onClick={e => { e.stopPropagation(); deleteTask(task.id); }}>
                  <Trash2 size={12} color="#fff"/>
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className={`habit-title ${isDone ? 'strikethrough' : ''}`}>{task.name}</p>
                    {task.subtitle && <p className={`habit-title ${isDone ? 'strikethrough' : ''}`}>{task.subtitle}</p>}
                  </div>
                  <div className="habit-icon-circle">{isDone ? <Check size={20} strokeWidth={3}/> : icon}</div>
                </div>
                <div className="habit-bottom">
                  <span className="habit-time">{isDone ? '✓ Completed' : '○ Pending'}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDurationValue(task.duration || 'Custom');
                      setEditTaskTime({ id: task.id, name: task.name, isCustom: true });
                    }}
                    className="habit-duration-badge" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }}>
                    {task.duration || 'Custom'}
                  </button>
                  <span className="habit-time" style={{ marginLeft: 'auto' }}>{isDone ? 'Done' : 'Tap to log'}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══ CALENDAR VIEW ═══
  const renderCalendar = () => {
    const days: number[] = Array.from({ length: 75 }, (_, i) => i + 1);

    const monthsMap: Record<string, number[]> = {};
    const monthKeys: string[] = [];
    days.forEach(dayNum => {
      const d = addDays(parseISO(state.startDate), dayNum - 1);
      const mKey = format(d, 'MMMM yyyy');
      if (!monthsMap[mKey]) { monthsMap[mKey] = []; monthKeys.push(mKey); }
      monthsMap[mKey].push(dayNum);
    });

    const totalRequired = HABITS.length + state.customTasks.length;

    return (
      <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
        {monthKeys.map(monthKey => {
          const activeDays = monthsMap[monthKey];
          const firstDayOfBlock = addDays(parseISO(state.startDate), activeDays[0] - 1);
          const startOffset = parseInt(format(firstDayOfBlock, 'i')) - 1;

          return (
            <div key={monthKey}>
              <div className="month-nav" style={{ border: 'none', paddingTop: 24 }}>
                <span className="month-label" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', flex: 1, textAlign: 'center' }}>
                  {monthKey}
                </span>
              </div>

              <div className="cal-grid mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="cal-day-header">{d}</div>)}
              </div>

              <div className="cal-grid" style={{ paddingBottom: 24 }}>
                {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${monthKey}-${i}`} />)}

                {activeDays.map(dayNum => {
                  const d = addDays(parseISO(state.startDate), dayNum - 1);
                  const monthIdx = d.getMonth();
                  const col = CAL_COLORS[monthIdx % CAL_COLORS.length];
                  const dp = getDayProgress(dayNum);
                  const isFuture = dayNum > currentDay;
                  const isCurrent = dayNum === currentDay;

                  const completed = HABITS.filter(h => dp[h]);
                  const customCompleted = state.customTasks.filter(t => dp.customDone.includes(t.id));
                  const totalDone = completed.length + customCompleted.length;
                  const progressPct = totalRequired > 0 ? (totalDone / totalRequired) * 100 : 0;
                  const isPerfect = totalDone === totalRequired && totalRequired > 0;
                  const isExpanded = expandedCalDay === dayNum;

                  if (isExpanded) {
                    return (
                      <motion.div key={dayNum}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                        style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: col.bg, borderRadius: 24, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transformOrigin: 'top center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: col.text, opacity: 0.8, textTransform: 'uppercase' }}>Day {dayNum} • {format(d, 'MMM dd')}</p>
                            <h3 style={{ fontSize: 24, fontWeight: 800, color: col.text, fontFamily: 'var(--font-display)', marginTop: 4 }}>{Math.round(progressPct)}% Complete</h3>
                          </div>
                          <button onClick={() => setExpandedCalDay(null)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: col.text }}><X size={16} /></button>
                        </div>

                        {dp.mood && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 12, width: 'fit-content' }}>
                            <span style={{ fontSize: 20 }}>{MOODS.find(m => m.label === dp.mood)?.emoji}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: col.text, textTransform: 'uppercase' }}>{dp.mood}</span>
                          </motion.div>
                        )}

                        {dp.note && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16 }}>
                            <p style={{ fontSize: 14, color: col.text, lineHeight: 1.5, fontWeight: 500 }}>"{dp.note}"</p>
                          </motion.div>
                        )}

                        {(completed.length > 0 || customCompleted.length > 0) && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {completed.map(h => <span key={h} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.08)', color: col.text, borderRadius: 8 }}>{HABIT_META[h].label}</span>)}
                            {customCompleted.map(t => <span key={t.id} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.08)', color: col.text, borderRadius: 8 }}>{t.name}</span>)}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div key={dayNum}
                      whileTap={!isFuture ? { scale: 0.92 } : undefined}
                      className={`cal-tile ${isPerfect && !isFuture ? 'cal-tile-perfect' : ''}`}
                      style={{
                        backgroundColor: isFuture ? 'transparent' : col.bg,
                        color: isFuture ? '#A0A0A0' : col.text,
                        border: isFuture ? '1px dashed #E0DDD6' : (isCurrent ? `2px solid ${col.text}` : 'none'),
                        opacity: isFuture ? 0.6 : 1,
                        cursor: isFuture ? 'default' : 'pointer',
                        borderRadius: !isFuture ? 999 : 16
                      }}
                      onClick={() => { if (!isFuture) setExpandedCalDay(dayNum === expandedCalDay ? null : dayNum); }}>
                      <span className="cal-tile-num">{dayNum}</span>
                      <span className="cal-tile-day-badge">{format(d, 'dd')}</span>

                      {!isFuture && (
                        <div className="cal-tile-progress" style={{ height: `${progressPct}%`, backgroundColor: isPerfect ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)' }} />
                      )}
                      {dp.note && !isFuture && (
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white/70" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ═══ THOUGHTS VIEW ═══
  const ThoughtsView = () => {
    const savedNotes = useMemo(() => {
      return Object.entries(state.progress)
        .filter(([_, v]) => (v as any).note?.trim())
        .map(([k, v]) => ({ day: parseInt(k), ...(v as any) }))
        .sort((a, b) => b.day - a.day);
    }, [state.progress]);

    return (
      <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
        <div className="px-6 pt-4 pb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Daily Thoughts</h2>
          <p style={{ fontSize: 13, color: '#A0A0A0', marginTop: 4 }}>Your challenge commentary timeline</p>
        </div>

        {savedNotes.length > 0 ? (
          <div className="px-6 space-y-4">
            {savedNotes.map(n => {
              const ni = dateFor(state.startDate, n.day);
              const me = MOODS.find(m => m.label === n.mood)?.emoji;
              return (
                <div key={n.day} className="note-card" style={{ margin: 0, border: '1px solid #EFEBE4' }}>
                  <div className="note-card-header" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: '#1A1A1A', color: '#fff', padding: '2px 8px', borderRadius: 6 }}>DAY {n.day}</span>
                      <span style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}>{ni.dayNum} {ni.monthShort}</span>
                    </div>
                    {me && <span style={{ fontSize: 18 }}>{me}</span>}
                  </div>
                  <p style={{ fontSize: 14, color: '#2D2D2D', lineHeight: 1.6 }}>{n.note}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 pt-10" style={{ textAlign: 'center', color: '#A0A0A0' }}>
            <p style={{ fontSize: 14, fontWeight: 500 }}>No thoughts recorded yet.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Use the pen button on the Tasks tab to log your first thought!</p>
          </div>
        )}
      </div>
    );
  };

  // ═══ STATS VIEW ═══
  const StatsView = () => {
    const habitStats: Record<string, number> = {};
    HABITS.forEach(h => habitStats[h] = 0);
    state.customTasks.forEach(t => habitStats[t.id] = 0);

    const weekMoodData: { dayName: string, moodVal: number, moodLabel: string }[] = [];
    for (let i = Math.max(1, currentDay - 6); i <= currentDay; i++) {
      const dp = getDayProgress(i);
      let mVal = 0;
      let mLabel = '';
      if (dp.mood) {
        const m = MOODS.find(x => x.label === dp.mood);
        if (m && m.value) { mVal = m.value; mLabel = m.emoji; }
      }
      const d = addDays(parseISO(state.startDate || format(new Date(), 'yyyy-MM-dd')), i - 1);
      weekMoodData.push({ dayName: format(d, 'EEE'), moodVal: mVal, moodLabel: mLabel });
    }
    while (weekMoodData.length < 7) {
      weekMoodData.unshift({ dayName: '-', moodVal: 0, moodLabel: '' });
    }

    for (let i = 1; i <= currentDay; i++) {
       const dp = getDayProgress(i);
       HABITS.forEach(h => { if(dp[h]) habitStats[h]++; });
       state.customTasks.forEach(t => { if(dp.customDone.includes(t.id)) habitStats[t.id]++; });
    }

    return (
      <div className="animate-fade-in" style={{ paddingBottom: 120 }}>
        <div className="px-6 pt-4 pb-6">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1.1, textTransform: 'uppercase' }}>Statistics</h2>
        </div>

        <div className="px-6 space-y-6">
          
          {/* This Week Mood Chart */}
          <div style={{ backgroundColor: '#F9F8F6', borderRadius: 32, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', color: '#1A1A1A', marginBottom: 32 }}>This Week's Mood</h3>

            <div style={{ display: 'flex', height: 160, position: 'relative', marginTop: 16 }}>
              {/* Y-Axis lines */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                {[4, 3, 2, 1].map((v, i) => {
                  const m = MOODS.find(x => x.value === v);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: 12, color: '#A0A0A0', width: 24, textAlign: 'center' }}>{m?.emoji}</span>
                      <div style={{ flex: 1, borderTop: '1px dashed #E0DDD6' }} />
                    </div>
                  );
                })}
              </div>

              {/* Bars */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1, zIndex: 1, marginLeft: 32, height: '100%', paddingBottom: 20 }}>
                {weekMoodData.map((d, i) => {
                  const hPct = (d.moodVal / 4) * 100;
                  const isToday = i === weekMoodData.length - 1 && d.dayName !== '-';
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end', flex: 1 }}>
                      <div style={{ width: '60%', minWidth: 16, maxWidth: 32, height: `${hPct}%`, minHeight: hPct > 0 ? 4 : 0, backgroundColor: isToday ? '#1A1A1A' : '#D4D0C8', borderRadius: 8, transition: 'height 0.5s ease-out' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', position: 'absolute', bottom: -4 }}>{d.dayName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* All Time Stats */}
          <div style={{ backgroundColor: '#F9F8F6', borderRadius: 32, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', color: '#1A1A1A', marginBottom: 20 }}>All Time</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {HABITS.map(h => {
                const dur = state.habitOverrides?.[h]?.duration || HABIT_META[h].duration;
                const hrsPerDay = parseDurationToHours(dur);
                const isTimeTracked = hrsPerDay > 0;
                const totalPossible = isTimeTracked ? 75 * hrsPerDay : 75;
                const currentAccumulated = isTimeTracked ? habitStats[h] * hrsPerDay : habitStats[h];
                const label = state.habitOverrides?.[h]?.label || HABIT_META[h].label;
                
                return (
                  <div key={h} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: HABIT_META[h].bg, color: HABIT_META[h].text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {HABIT_META[h].icon}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#A0A0A0' }}>
                      {isTimeTracked ? `${Math.round(currentAccumulated * 10) / 10}H / ${Math.round(totalPossible * 10) / 10}H` : `${currentAccumulated} / 75 Days`}
                    </span>
                  </div>
                );
              })}
              {state.customTasks.map(t => {
                const hrsPerDay = parseDurationToHours(t.duration);
                const isTimeTracked = hrsPerDay > 0;
                const totalPossible = isTimeTracked ? 75 * hrsPerDay : 75;
                const currentAccumulated = isTimeTracked ? habitStats[t.id] * hrsPerDay : habitStats[t.id];
                const col = TASK_COLORS[t.colorIdx % TASK_COLORS.length];
                
                return (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: col.bg, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ICON_MAP[t.icon] || ICON_MAP.star}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{t.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#A0A0A0' }}>
                      {isTimeTracked ? `${Math.round(currentAccumulated * 10) / 10}H / ${Math.round(totalPossible * 10) / 10}H` : `${currentAccumulated} / 75 Days`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // ═══ ADD NOTE SHEET ═══
  const AddNoteSheet = () => {
    const activeProgress = getDayProgress(currentDay);
    const [editNote, setEditNote] = useState(activeProgress.note || '');
    const [editMood, setEditMood] = useState<string | null>(activeProgress.mood || null);
    const hasChanges = editNote !== (activeProgress.note || '') || editMood !== (activeProgress.mood || null);

    return (
      <div className="p-6 space-y-5">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Log Thought</h2>
          <button onClick={() => setSheet(null)} style={{ color: '#A0A0A0', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20}/></button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {MOODS.map(m => (
            <button key={m.label} onClick={() => setEditMood(m.label)}
              className={`mood-btn ${editMood === m.label ? 'mood-btn-active' : 'mood-btn-inactive'}`}>
              <span style={{ fontSize: '1.25rem' }}>{m.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, marginTop: 2, textTransform: 'uppercase' as const }}>{m.label}</span>
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: '#EFEBE4', borderRadius: 16, overflow: 'hidden' }}>
          <textarea value={editNote} onChange={e => setEditNote(e.target.value)}
            placeholder="How's your challenge going? Leave a thought..."
            className="journal-textarea" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 12, color: '#A0A0A0' }}>{editNote.length} characters</span>
          <button disabled={!hasChanges} onClick={() => { saveNote(currentDay, editNote, editMood); setSheet(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 16,
              fontWeight: 700, fontSize: 14, border: 'none', cursor: hasChanges ? 'pointer' : 'default',
              backgroundColor: hasChanges ? '#2D2D2D' : '#E0DDD6',
              color: hasChanges ? '#fff' : '#A0A0A0', transition: 'all 0.2s'
            }}>
            <Save size={16} /> Save Thought
          </button>
        </div>
      </div>
    );
  };

  // ═══ ADD TASK SHEET ═══
  const AddTaskSheet = () => {
    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [tagType, setTagType] = useState<'time' | 'custom'>('time');
    const [timeVal, setTimeVal] = useState('15');
    const [timeUnit, setTimeUnit] = useState<'Min' | 'H'>('Min');
    const [customVal, setCustomVal] = useState('');
    const [icon, setIcon] = useState('star');
    const [colorIdx, setColorIdx] = useState(0);

    const finalDuration = tagType === 'time' ? `${timeVal} ${timeUnit}` : customVal;

    return (
      <div className="p-6 space-y-5">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>New Task</h2>
          <button onClick={() => setSheet(null)} style={{ color: '#A0A0A0', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20}/></button>
        </div>

        {/* Name */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Line 1</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Read"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Line 2</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. 10 Pages"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none' }} />
          </div>
        </div>

        {/* Duration */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Duration Badge</label>
            <SegmentedToggle
              value={tagType}
              onChange={(v: 'time' | 'custom') => setTagType(v)}
              options={[{ value: 'time', label: 'Time' }, { value: 'custom', label: 'Custom' }]}
              layoutId="segment-add"
            />
          </div>
          
          {tagType === 'time' ? (
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <input type="number" value={timeVal} onChange={e => setTimeVal(e.target.value)} placeholder="15"
                style={{ flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: 16, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none' }} />
              <UnitDropdown value={timeUnit} onChange={setTimeUnit} />
            </div>
          ) : (
            <input value={customVal} onChange={e => setCustomVal(e.target.value)} placeholder="e.g. Daily, Morning..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none' }} />
          )}
        </div>

        {/* Icon Picker */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Choose Icon</label>
          <div className="icon-grid">
            {ICON_KEYS.map(k => (
              <button key={k} onClick={() => setIcon(k)}
                className={`icon-cell ${icon === k ? 'icon-cell-active' : ''}`}
                style={{ color: icon === k ? '#2D2D2D' : '#6B6B6B', border: 'none' }}>
                {ICON_MAP[k]}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Choose Color</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TASK_COLORS.map((c, i) => (
              <button key={i} onClick={() => setColorIdx(i)}
                className={`color-dot ${colorIdx === i ? 'color-dot-active' : ''}`}
                style={{ backgroundColor: c.bg, border: 'none' }} />
            ))}
          </div>
        </div>

        {/* Preview */}
        {name && (
          <div className="habit-card" style={{ backgroundColor: TASK_COLORS[colorIdx].bg, color: TASK_COLORS[colorIdx].text, margin: 0, cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="habit-title">{name}</p>
                {subtitle && <p className="habit-title">{subtitle}</p>}
              </div>
              <div className="habit-icon-circle">{ICON_MAP[icon]}</div>
            </div>
            <div className="habit-bottom"><span className="habit-time">○ Pending</span><span className="habit-duration-badge">{finalDuration || 'Custom'}</span></div>
          </div>
        )}

        {/* Add Button */}
        <button disabled={!name.trim()} onClick={() => { addTask(name.trim(), subtitle.trim(), finalDuration.trim(), icon, colorIdx); setSheet(null); }}
          style={{
            width: '100%', padding: '14px', borderRadius: 16, fontWeight: 700, fontSize: 14,
            border: 'none', cursor: name.trim() ? 'pointer' : 'default',
            backgroundColor: name.trim() ? '#2D2D2D' : '#E0DDD6',
            color: name.trim() ? '#fff' : '#A0A0A0', transition: 'all 0.2s'
          }}>
          Add Task
        </button>
      </div>
    );
  };

  // ═══ POMODORO SHEET ═══
  const PomodoroSheet = () => {
    const [focusMins, setFocusMins] = useState(25);
    const [breakMins, setBreakMins] = useState(5);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'break'>('work');

    const totalTime = mode === 'work' ? focusMins * 60 : breakMins * 60;

    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      } else if (timeLeft === 0) {
        setIsActive(false);
      }
      return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const switchMode = (newMode: 'work' | 'break') => {
      setMode(newMode);
      setIsActive(false);
      setTimeLeft(newMode === 'work' ? focusMins * 60 : breakMins * 60);
    };

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
    const strokeDashoffset = 283 - (283 * progress) / 100;

    return (
      <div className="p-6 space-y-6 text-center">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Pomodoro</h2>
          <button onClick={() => setSheet(null)} style={{ color: '#A0A0A0', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20}/></button>
        </div>

        {!isActive && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 8 }}>
            <div style={{ flex: 1, maxWidth: 120 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Focus (min)</label>
              <input type="number" min={1} max={120} value={focusMins} onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); setFocusMins(v); if (mode === 'work') setTimeLeft(v * 60); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 14, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none', textAlign: 'center' }} />
            </div>
            <div style={{ flex: 1, maxWidth: 120 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Break (min)</label>
              <input type="number" min={1} max={60} value={breakMins} onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); setBreakMins(v); if (mode === 'break') setTimeLeft(v * 60); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 14, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none', textAlign: 'center' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', background: '#F9F8F6', padding: 8, borderRadius: 24, width: 'max-content', margin: '0 auto' }}>
          <button onClick={() => switchMode('work')} style={{ padding: '8px 16px', borderRadius: 16, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', backgroundColor: mode === 'work' ? '#1A1A1A' : 'transparent', color: mode === 'work' ? '#fff' : '#A0A0A0', transition: 'all 0.2s' }}>Focus</button>
          <button onClick={() => switchMode('break')} style={{ padding: '8px 16px', borderRadius: 16, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', backgroundColor: mode === 'break' ? '#1A1A1A' : 'transparent', color: mode === 'break' ? '#fff' : '#A0A0A0', transition: 'all 0.2s' }}>Break</button>
        </div>

        <div style={{ position: 'relative', width: 240, height: 240, margin: '40px auto' }}>
          <svg className="pomodoro-ring" width="240" height="240" viewBox="0 0 100 100">
            <circle className="pomodoro-circle-bg" cx="50" cy="50" r="45" strokeWidth="4" />
            <circle className="pomodoro-circle-progress" cx="50" cy="50" r="45" strokeWidth="4" strokeDasharray="283" strokeDashoffset={strokeDashoffset} style={{ stroke: mode === 'work' ? '#DDB96E' : '#7CC4B8' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: '#1A1A1A', lineHeight: 1 }}>{mins}:{secs}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{mode === 'work' ? 'Stay Focused' : 'Relax'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={toggleTimer} style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: isActive ? '#F9F8F6' : '#1A1A1A', color: isActive ? '#1A1A1A' : '#fff', border: isActive ? '2px solid #E0DDD6' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isActive ? 'none' : '0 8px 24px rgba(0,0,0,0.15)' }}>
            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: 4 }} />}
          </button>
          <button onClick={() => switchMode(mode)} style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#F9F8F6', color: '#1A1A1A', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Square size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    );
  };

  // ═══ SETTINGS SHEET ═══
  const SettingsSheet = () => {
    return (
      <div className="p-6 space-y-5">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Settings</h2>
          <button onClick={() => setSheet(null)} style={{ color: '#A0A0A0', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20}/></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="stat-card"><span className="stat-value">{streak}</span><span className="stat-label">Streak</span></div>
          <div className="stat-card">
            <span className="stat-value">{Object.values(state.progress).filter((d: DayProgress) => HABITS.every(h => d[h])).length}</span>
            <span className="stat-label">Perfect</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{Math.round(((Object.values(state.progress) as DayProgress[]).reduce((a: number, d: DayProgress) => a + HABITS.filter(h => d[h]).length, 0) as number) / (75 * 5) * 100)}%</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Manage Habits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HABITS.map(h => (
              <div key={h} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F9F8F6', borderRadius: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{state.habitOverrides?.[h]?.label || HABIT_META[h].label}</span>
                <button onClick={() => { setRenameValue(state.habitOverrides?.[h]?.label || HABIT_META[h].label); setRenameHabitItem({ id: h, name: HABIT_META[h].label, isCustom: false }); setSheet(null); }} style={{ background: 'none', border: 'none', color: '#A0A0A0', cursor: 'pointer' }}><Pen size={14} /></button>
              </div>
            ))}
            {state.customTasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F9F8F6', borderRadius: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{t.name}</span>
                <button onClick={() => { setRenameValue(t.name); setRenameHabitItem({ id: t.id, name: t.name, isCustom: true }); setSheet(null); }} style={{ background: 'none', border: 'none', color: '#A0A0A0', cursor: 'pointer' }}><Pen size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setSheet('rules')} style={{ width: '100%', padding: '14px', borderRadius: 16, backgroundColor: '#F9F8F6', border: '1px solid #E0DDD6', fontWeight: 800, color: '#1A1A1A', cursor: 'pointer', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <BookOpen size={18} /> View Challenge Rules
        </button>

        <button className="reset-btn" style={{ marginTop: 24 }} onClick={() => { setShowResetModal(true); setSheet(null); }}>
          <RotateCcw size={18} /> Reset Challenge
        </button>
      </div>
    );
  };

  const RulesSheet = () => {
    return (
      <div className="p-6 space-y-5">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Challenge Rules</h2>
          <button onClick={() => setSheet(null)} style={{ color: '#A0A0A0', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20}/></button>
        </div>
        <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 24, fontWeight: 500 }}>Build consistency, not perfection.<br/>Complete these habits daily for the next 75 days.</p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {[
            "Exercise for 20–30 minutes",
            "Eat balanced meals with protein and vegetables",
            "Avoid fast food and excess sugar",
            "Drink 1.5–2 liters of water",
            "Read at least 10 pages",
            "Sleep for 7+ hours",
            "Take progress photos regularly"
          ].map((rule, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: '#DDB96E', fontSize: 16 }}>•</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#2D2D2D', lineHeight: 1.4 }}>{rule}</span>
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, color: '#1A1A1A' }}>Remember</h3>
        <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 500, lineHeight: 1.5 }}>
          Small actions repeated daily create lasting change.<br/>
          Missed a day? Reset, refocus, continue stronger.
        </p>
      </div>
    );
  };

  // ═══ MAIN RENDER ═══
  if (!hasOnboarded) {
    return <Onboarding onComplete={() => { localStorage.setItem('jellybean_has_onboarded', 'true'); setHasOnboarded(true); }} />;
  }

  return (
    <div className="app-shell" style={{ paddingBottom: 120 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 24px', paddingTop: 'calc(env(safe-area-inset-top, 40px) + 16px)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setSheet('settings')} style={{ background: 'none', border: 'none', color: '#1A1A1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)', transition: 'background 0.2s' }}>
            <Settings size={22} />
          </button>
          {activeTab === 'tasks' && (
            <button onClick={() => setSheet('addTask')} style={{ background: '#1A1A1A', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Plus size={22} strokeWidth={2.5} />
            </button>
          )}
          {activeTab === 'tasks' && (
            <button onClick={() => setSheet('pomodoro')} style={{ background: '#EFEBE4', border: '1px solid #E0DDD6', color: '#1A1A1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', transition: 'background 0.2s' }}>
              <TimerIcon size={22} />
            </button>
          )}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1, margin: 0, textTransform: 'capitalize' }}>
          {activeTab}
        </h1>
      </div>

      <main>
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'thoughts' && <ThoughtsView />}
        {activeTab === 'stats' && <StatsView />}
      </main>

      {/* Floating Island Dock (Rectangular) */}
      <div style={{ 
        position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 24px) + 32px)', left: '50%', transform: 'translateX(-50%)', 
        backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 24, padding: '8px', display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)', zIndex: 40, border: '1px solid rgba(255,255,255,0.6)'
      }}>
        {(['tasks', 'calendar', 'thoughts', 'stats']).map((tabId) => {
          const icons = { tasks: CheckCircle2, calendar: CalendarDays, thoughts: MessageCircle, stats: BarChart3 };
          const Icon = icons[tabId as keyof typeof icons];
          const isActive = activeTab === tabId;

          return (
            <button key={tabId} 
              style={{ 
                position: 'relative', width: 56, height: 56, borderRadius: 16, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent'
              }}
              onClick={() => setActiveTab(tabId as TabType)}>
              {isActive && (
                <motion.div layoutId="dock-blob" 
                  style={{ position: 'absolute', inset: 0, backgroundColor: '#EFEBE4', borderRadius: 16, zIndex: 0 }} 
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
              <div style={{ position: 'relative', zIndex: 1, color: isActive ? '#1A1A1A' : '#A0A0A0', transition: 'color 0.2s' }}>
                <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="sheet-overlay" onClick={() => setSheet(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="sheet-content">
              <div className="sheet-handle" />
              {sheet === 'addTask' && <AddTaskSheet />}
              {sheet === 'settings' && <SettingsSheet />}
              {sheet === 'addNote' && <AddNoteSheet />}
              {sheet === 'pomodoro' && <PomodoroSheet />}
              {sheet === 'rules' && <RulesSheet />}
            </motion.div>
          </>
        )}
        
        {editTaskTime && (
          <div className="sheet-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditTaskTime(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{ backgroundColor: '#fff', borderRadius: 32, padding: 24, width: '85%', maxWidth: 320, boxShadow: '0 24px 48px rgba(0,0,0,0.15)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 8 }}>Edit Time</h3>
              <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 24, fontWeight: 500 }}>Set the duration for {editTaskTime.name}.</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Duration Badge</label>
                <SegmentedToggle
                  value={editTagType}
                  onChange={(v: 'time' | 'custom') => setEditTagType(v)}
                  options={[{ value: 'time', label: 'Time' }, { value: 'custom', label: 'Custom' }]}
                  layoutId="segment-edit"
                />
              </div>
              
              {editTagType === 'time' ? (
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, width: '100%' }}>
                  <input type="number" value={editTimeVal} onChange={e => setEditTimeVal(e.target.value)} placeholder="15"
                    style={{ flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: 16, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none' }} />
                  <UnitDropdown value={editTimeUnit} onChange={setEditTimeUnit} />
                </div>
              ) : (
                <input value={editDurationValue} onChange={e => setEditDurationValue(e.target.value)} placeholder="e.g. Daily, Morning..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1px solid #E0DDD6', fontSize: 14, fontWeight: 600, backgroundColor: '#EFEBE4', outline: 'none', marginBottom: 24 }} />
              )}
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setEditTaskTime(null)} style={{ flex: 1, padding: '14px', borderRadius: 16, backgroundColor: '#F9F8F6', border: 'none', fontWeight: 800, color: '#A0A0A0', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  const finalDur = editTagType === 'time' ? `${editTimeVal} ${editTimeUnit}` : editDurationValue;
                  if (editTaskTime.isCustom) {
                    setState(s => ({ ...s, customTasks: s.customTasks.map(ct => ct.id === editTaskTime.id ? { ...ct, duration: finalDur } : ct) }));
                  } else {
                    setState(s => ({ ...s, habitOverrides: { ...(s.habitOverrides || {}), [editTaskTime.id]: { duration: finalDur } } }));
                  }
                  setEditTaskTime(null);
                }} style={{ flex: 1, padding: '14px', borderRadius: 16, backgroundColor: '#1A1A1A', border: 'none', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>Save</button>
              </div>
            </motion.div>
          </div>
        )}

        {renameHabitItem && (
          <div className="sheet-overlay modal-overlay" onClick={() => setRenameHabitItem(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={e => e.stopPropagation()} className="modal-content">
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 8 }}>Rename Habit</h3>
              <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 24, fontWeight: 500 }}>Enter a new name for {renameHabitItem.name}.</p>
              
              <input autoFocus type="text" value={renameValue} onChange={e => setRenameValue(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1px solid #EFEBE4', backgroundColor: '#F9F8F6', outline: 'none', fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 24 }} />
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setRenameHabitItem(null)} style={{ flex: 1, padding: '14px', borderRadius: 16, backgroundColor: '#F9F8F6', border: 'none', fontWeight: 800, color: '#A0A0A0', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  if (renameHabitItem.isCustom) {
                    setState(s => ({ ...s, customTasks: s.customTasks.map(ct => ct.id === renameHabitItem.id ? { ...ct, name: renameValue } : ct) }));
                  } else {
                    setState(s => ({ ...s, habitOverrides: { ...(s.habitOverrides || {}), [renameHabitItem.id]: { ...(s.habitOverrides?.[renameHabitItem.id as HabitType] || {}), label: renameValue } } }));
                  }
                  setRenameHabitItem(null);
                }} style={{ flex: 1, padding: '14px', borderRadius: 16, backgroundColor: '#1A1A1A', border: 'none', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>Save</button>
              </div>
            </motion.div>
          </div>
        )}

        {showResetModal && (
          <div className="sheet-overlay modal-overlay" onClick={() => setShowResetModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={e => e.stopPropagation()} className="modal-content">
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 8 }}>Reset Challenge</h3>
              <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 24, fontWeight: 500 }}>Are you sure you want to reset everything to Day 1? This action cannot be undone.</p>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: '14px', borderRadius: 16, backgroundColor: '#F9F8F6', border: 'none', fontWeight: 800, color: '#A0A0A0', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  handleReset();
                  setShowResetModal(false);
                }} style={{ flex: 1, padding: '14px', borderRadius: 16, backgroundColor: '#FF4D4D', border: 'none', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>Reset</button>
              </div>
            </motion.div>
          </div>
        )}

        {showSaveToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#2D2D2D', color: '#fff', padding: '12px 24px', borderRadius: 24, fontSize: 14, fontWeight: 600, zIndex: 100, pointerEvents: 'none' }}>
            Thought Saved! ✨
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
