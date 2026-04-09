import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Heart, 
  Droplets, 
  Smile, 
  Frown, 
  Meh,
  Plus,
  Save,
  Target,
  AlertCircle,
  BookOpen,
  Sparkles,
  GraduationCap,
  Shield,
  Info,
  Moon,
  Activity,
  Droplet,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from 'date-fns';
import { offlineStorage } from '../../utils/offlineStorage';
import { apiService } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ReproBotTrackerPanel from './ReproBotTrackerPanel';

interface CycleEntry {
  id: string;
  date: string;
  flow: 'none' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: 'happy' | 'sad' | 'neutral' | 'anxious' | 'energetic';
  temperature?: number;
  notes?: string;
  isPeriod: boolean;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  exerciseType?: string;
  exerciseMinutes?: number;
  waterGlasses?: number;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white' | 'none';
}

interface CycleData {
  entries: CycleEntry[];
  cycleLength: number;
  periodLength: number;
  lastPeriod: string;
  predictions: {
    nextPeriod: string;
    ovulation: string;
    fertileWindow: { start: string; end: string };
  };
}

const HealthTracker: React.FC = () => {
  const [cycleData, setCycleData] = useState<CycleData>({
    entries: [],
    cycleLength: 28,
    periodLength: 5,
    lastPeriod: '',
    predictions: {
      nextPeriod: '',
      ovulation: '',
      fertileWindow: { start: '', end: '' }
    }
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<CycleEntry>>({
    flow: 'none',
    symptoms: [],
    mood: 'neutral',
    isPeriod: false
  });
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics' | 'education' | 'ai'>('tracker');
  const [showReproBotPanel, setShowReproBotPanel] = useState(false);
  const [reproBotInitialPrompt, setReproBotInitialPrompt] = useState<string | null>(null);

  const flowOptions = [
    { value: 'none', label: 'None', color: 'bg-gray-100' },
    { value: 'light', label: 'Light', color: 'bg-blue-100' },
    { value: 'medium', label: 'Medium', color: 'bg-orange-100' },
    { value: 'heavy', label: 'Heavy', color: 'bg-red-100' }
  ];

  const moodOptions = [
    { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-600' },
    { value: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-600' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-600' },
    { value: 'anxious', label: 'Anxious', icon: AlertCircle, color: 'text-yellow-600' },
    { value: 'energetic', label: 'Energetic', icon: Heart, color: 'text-red-600' }
  ];

  const symptomOptions = [
    'Cramps', 'Bloating', 'Headache', 'Nausea', 'Fatigue', 'Mood swings',
    'Breast tenderness', 'Acne', 'Food cravings', 'Insomnia', 'Hot flashes'
  ];

  const educationTopics = [
    {
      id: 'menstrual-basics',
      title: 'Understanding Your Menstrual Cycle',
      icon: BookOpen,
      color: 'bg-pink-100 text-pink-600',
      content: 'Learn about the phases of your menstrual cycle, what\'s normal, and when to seek help.',
      articles: [
        'What is a menstrual cycle?',
        'Normal vs. abnormal bleeding',
        'Understanding ovulation',
        'Hormonal changes during your cycle'
      ]
    },
    {
      id: 'period-health',
      title: 'Period Health & Hygiene',
      icon: Shield,
      color: 'bg-blue-100 text-blue-600',
      content: 'Essential information about period hygiene, products, and staying healthy during menstruation.',
      articles: [
        'Safe period products',
        'Hygiene during menstruation',
        'Managing period pain',
        'When to see a doctor'
      ]
    },
    {
      id: 'contraception',
      title: 'Contraception & Family Planning',
      icon: Heart,
      color: 'bg-green-100 text-green-600',
      content: 'Learn about different contraceptive methods and family planning options.',
      articles: [
        'Types of contraception',
        'How to choose the right method',
        'Emergency contraception',
        'Family planning services'
      ]
    },
    {
      id: 'reproductive-health',
      title: 'Reproductive Health',
      icon: GraduationCap,
      color: 'bg-purple-100 text-purple-600',
      content: 'Comprehensive information about reproductive health, STIs, and safe practices.',
      articles: [
        'STI prevention and testing',
        'Safe sex practices',
        'Reproductive health check-ups',
        'Understanding fertility'
      ]
    }
  ];

  const loadCycleData = async () => {
    try {
      const stored = await offlineStorage.getData('cycle_data');
      if (stored) {
        setCycleData(stored);
      }
    } catch (error) {
      console.error('Failed to load cycle data:', error);
    }
  };

  const saveCycleData = async (newData: CycleData) => {
    try {
      await offlineStorage.storeData('cycle_data', newData);
      setCycleData(newData);
      
      // Sync with backend API
      await syncWithBackend(newData);
    } catch (error) {
      console.error('Failed to save cycle data:', error);
    }
  };

  // Sync cycle data with backend health records API
  const syncWithBackend = async (data: CycleData) => {
    try {
      // Get current user via checkAuth
      const userResponse = await apiService.checkAuth?.() as { success?: boolean; user?: { id: number } } | undefined;
      
      if (!userResponse?.success || !userResponse.user?.id) {
        console.log('No authenticated user, skipping backend sync');
        return;
      }

      const userId = userResponse.user.id;
      
      // Create health record entries for each cycle entry
      for (const entry of data.entries.slice(-5)) { // Only sync last 5 entries
        const healthRecord = {
          userId,
          recordType: 'cycle_tracking',
          data: {
            date: entry.date,
            flow: entry.flow,
            symptoms: entry.symptoms,
            mood: entry.mood,
            isPeriod: entry.isPeriod,
            sleepHours: entry.sleepHours,
            energyLevel: entry.energyLevel,
            notes: entry.notes
          },
          recordedAt: entry.date
        };
        
        try {
          await apiService.createHealthRecord?.(healthRecord);
        } catch (err) {
          console.warn('Failed to sync entry to backend:', err);
        }
      }
      
      console.log('Cycle data synced with backend');
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
  };

  const calculatePredictions = useCallback(() => {
    const entries = cycleData.entries;
    if (entries.length === 0) return;

    // Find last period
    const lastPeriodEntry = entries
      .filter(entry => entry.isPeriod)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastPeriodEntry) return;

    const lastPeriodDate = new Date(lastPeriodEntry.date);
    const nextPeriodDate = addDays(lastPeriodDate, cycleData.cycleLength);
    const ovulationDate = addDays(lastPeriodDate, cycleData.cycleLength - 14);
    const fertileStart = subDays(ovulationDate, 5);
    const fertileEnd = addDays(ovulationDate, 1);

    const newPredictions = {
      nextPeriod: format(nextPeriodDate, 'yyyy-MM-dd'),
      ovulation: format(ovulationDate, 'yyyy-MM-dd'),
      fertileWindow: {
        start: format(fertileStart, 'yyyy-MM-dd'),
        end: format(fertileEnd, 'yyyy-MM-dd')
      }
    };

    setCycleData(prev => ({
      ...prev,
      predictions: newPredictions
    }));
  }, [cycleData.entries, cycleData.cycleLength]);

  const getEntryForDate = (date: Date): CycleEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return cycleData.entries.find(entry => entry.date === dateStr);
  };

  // Cycle regularity and analytics
  const { cycleLengths, avgCycleLength, regularityScore, symptomFrequency, chartData } = useMemo(() => {
    const periodEntries = cycleData.entries
      .filter(e => e.isPeriod)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lengths: number[] = [];
    for (let i = 1; i < periodEntries.length; i++) {
      const days = differenceInDays(new Date(periodEntries[i].date), new Date(periodEntries[i - 1].date));
      if (days >= 21 && days <= 45) lengths.push(days);
    }
    const avg = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : cycleData.cycleLength;
    const variance = lengths.length > 1
      ? lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length
      : 0;
    const regularity = variance < 9 ? 95 : variance < 25 ? 80 : variance < 49 ? 65 : 50;

    const symptomCount: Record<string, number> = {};
    cycleData.entries.forEach(e => {
      e.symptoms.forEach(s => { symptomCount[s] = (symptomCount[s] || 0) + 1; });
    });

    const last12Entries = [...cycleData.entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12)
      .reverse();
    const chartData = last12Entries.map(e => ({
      date: format(new Date(e.date), 'MMM d'),
      mood: ['sad', 'neutral', 'happy', 'anxious', 'energetic'].indexOf(e.mood) + 1,
      energy: e.energyLevel || 3,
      sleep: e.sleepHours || 0,
      flow: e.flow === 'heavy' ? 4 : e.flow === 'medium' ? 3 : e.flow === 'light' ? 2 : 0
    }));

    return {
      cycleLengths: lengths,
      avgCycleLength: avg,
      regularityScore: regularity,
      symptomFrequency: Object.entries(symptomCount).sort((a, b) => b[1] - a[1]).slice(0, 8),
      chartData
    };
  }, [cycleData.entries, cycleData.cycleLength]);

  const aiInsights = useMemo(() => {
    const insights: { id: string; title: string; description: string; icon: 'trend' | 'alert' | 'tip' | 'pattern'; confidence?: number }[] = [];
    if (regularityScore >= 85) {
      insights.push({ id: '1', title: 'Cycle regularity', description: 'Your cycle shows consistent patterns. AI analysis suggests your predictions are highly reliable.', icon: 'trend', confidence: 92 });
    } else if (regularityScore >= 65) {
      insights.push({ id: '1', title: 'Moderate variation', description: 'Some cycle variation detected. Tracking more data will improve prediction accuracy.', icon: 'pattern', confidence: 78 });
    }
    if (symptomFrequency.length > 0) {
      const topSymptom = symptomFrequency[0];
      insights.push({ id: '2', title: 'Symptom pattern', description: `"${topSymptom[0]}" appears most often. Consider discussing patterns with a healthcare provider if it concerns you.`, icon: 'pattern', confidence: 85 });
    }
    if (chartData.length >= 3) {
      const avgMood = chartData.reduce((s, d) => s + d.mood, 0) / chartData.length;
      if (avgMood <= 2) {
        insights.push({ id: '3', title: 'Mood awareness', description: 'Your mood data suggests lower energy recently. Rest, hydration, and gentle exercise may help.', icon: 'tip', confidence: 80 });
      } else if (avgMood >= 4) {
        insights.push({ id: '3', title: 'Positive trend', description: 'Your mood and energy trends look positive. Keep up your current habits.', icon: 'trend', confidence: 88 });
      }
    }
    if (cycleData.predictions.fertileWindow?.start) {
      insights.push({ id: '4', title: 'Fertility window', description: `Based on your data, your fertile window is around ${format(new Date(cycleData.predictions.fertileWindow.start), 'MMM d')}–${format(new Date(cycleData.predictions.fertileWindow.end), 'MMM d')}.`, icon: 'tip', confidence: 82 });
    }
    if (insights.length === 0) {
      insights.push({ id: '0', title: 'More data needed', description: 'Track at least 2–3 cycle entries to unlock AI-powered insights and personalized recommendations.', icon: 'tip' });
    }
    return insights;
  }, [regularityScore, symptomFrequency, chartData, cycleData.predictions.fertileWindow]);

  const reproBotContext = useMemo(() => ({
    nextPeriod: cycleData.predictions.nextPeriod,
    ovulation: cycleData.predictions.ovulation,
    fertileWindow: cycleData.predictions.fertileWindow,
    cycleLength: cycleData.cycleLength,
    periodLength: cycleData.periodLength,
    lastPeriod: cycleData.entries.filter(e => e.isPeriod).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date,
    recentSymptoms: Array.from(new Set(cycleData.entries.flatMap(e => e.symptoms))).slice(0, 6),
    avgCycleLength,
    regularityScore
  }), [cycleData, avgCycleLength, regularityScore]);

  useEffect(() => {
    loadCycleData();
  }, []);

  useEffect(() => {
    calculatePredictions();
  }, [calculatePredictions]);

  const getDateColor = (date: Date): string => {
    const entry = getEntryForDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (entry?.isPeriod) {
      switch (entry.flow) {
        case 'light': return 'bg-blue-200';
        case 'medium': return 'bg-orange-200';
        case 'heavy': return 'bg-red-200';
        default: return 'bg-gray-200';
      }
    }
    
    if (dateStr === cycleData.predictions.nextPeriod) return 'bg-pink-100';
    if (dateStr === cycleData.predictions.ovulation) return 'bg-yellow-100';
    if (dateStr >= cycleData.predictions.fertileWindow.start && 
        dateStr <= cycleData.predictions.fertileWindow.end) return 'bg-green-100';
    
    return 'bg-white';
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const existingEntry = getEntryForDate(date);
    if (existingEntry) {
      setCurrentEntry(existingEntry);
    } else {
      setCurrentEntry({
        flow: 'none',
        symptoms: [],
        mood: 'neutral',
        isPeriod: false
      });
    }
    setShowEntryForm(true);
  };

  const handleSaveEntry = () => {
    const entry: CycleEntry = {
      id: currentEntry.id || Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      flow: currentEntry.flow || 'none',
      symptoms: currentEntry.symptoms || [],
      mood: currentEntry.mood || 'neutral',
      temperature: currentEntry.temperature,
      notes: currentEntry.notes,
      isPeriod: currentEntry.isPeriod || false,
      sleepHours: currentEntry.sleepHours,
      sleepQuality: currentEntry.sleepQuality,
      exerciseType: currentEntry.exerciseType,
      exerciseMinutes: currentEntry.exerciseMinutes,
      waterGlasses: currentEntry.waterGlasses,
      stressLevel: currentEntry.stressLevel,
      energyLevel: currentEntry.energyLevel,
      cervicalMucus: currentEntry.cervicalMucus
    };

    const existingIndex = cycleData.entries.findIndex(e => e.id === entry.id);
    let newEntries;
    
    if (existingIndex >= 0) {
      newEntries = [...cycleData.entries];
      newEntries[existingIndex] = entry;
    } else {
      newEntries = [...cycleData.entries, entry];
    }

    const newCycleData = { ...cycleData, entries: newEntries };
    saveCycleData(newCycleData);
    setShowEntryForm(false);
  };

  const handleSymptomToggle = (symptom: string) => {
    const symptoms = currentEntry.symptoms || [];
    const newSymptoms = symptoms.includes(symptom)
      ? symptoms.filter(s => s !== symptom)
      : [...symptoms, symptom];
    setCurrentEntry({ ...currentEntry, symptoms: newSymptoms });
  };

  const generateCalendarDays = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => ({
      date: day,
      isCurrentMonth: day.getMonth() === selectedDate.getMonth(),
      isToday: isSameDay(day, new Date())
    }));
  };

  return (
    <div className="app-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 pb-20 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Add Entry Button */}
        {activeTab === 'tracker' && (
          <div className="mb-6">
            <button
              onClick={() => setShowEntryForm(true)}
              className="py-3 px-5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Plus size={16} />
              <span>Add Entry</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'tracker'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Tracker</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'education'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Education</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Insights</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'ai'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">AI Tools</span>
            </div>
          </button>
        </div>
        
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm sm:text-base">Cycle Length</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{cycleData.cycleLength} days</p>
            </div>
            
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                <span className="font-medium text-pink-900 text-sm sm:text-base">Period Length</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-pink-600">{cycleData.periodLength} days</p>
            </div>
            
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="font-medium text-green-900 text-sm sm:text-base">Next Period</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-green-600">
                {cycleData.predictions.nextPeriod ? format(new Date(cycleData.predictions.nextPeriod), 'MMM dd') : 'Unknown'}
              </p>
            </div>
          </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tracker' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map(({ date, isCurrentMonth, isToday }) => (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    p-2 text-sm rounded-lg border transition-colors
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isToday ? 'ring-2 ring-primary-500' : ''}
                    ${getDateColor(date)}
                    hover:bg-gray-100
                  `}
                >
                  {format(date, 'd')}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span>Heavy Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-200 rounded"></div>
                <span>Medium Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>Light Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-100 rounded"></div>
                <span>Predicted Period</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                <span>Ovulation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>Fertile Window</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Predictions */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next Period:</span>
                <span className="text-sm font-medium">
                  {cycleData.predictions.nextPeriod ? format(new Date(cycleData.predictions.nextPeriod), 'MMM dd') : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ovulation:</span>
                <span className="text-sm font-medium">
                  {cycleData.predictions.ovulation ? format(new Date(cycleData.predictions.ovulation), 'MMM dd') : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fertile Window:</span>
                <span className="text-sm font-medium">
                  {cycleData.predictions.fertileWindow.start ? 
                    `${format(new Date(cycleData.predictions.fertileWindow.start), 'MMM dd')} - ${format(new Date(cycleData.predictions.fertileWindow.end), 'MMM dd')}` 
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* ReproBot AI Panel */}
          <ReproBotTrackerPanel
            cycleContext={reproBotContext}
            isExpanded={showReproBotPanel}
            onToggle={() => setShowReproBotPanel(!showReproBotPanel)}
            initialPrompt={reproBotInitialPrompt}
            onPromptSent={() => setReproBotInitialPrompt(null)}
          />

          {/* Recent Entries */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
            <div className="space-y-3">
              {cycleData.entries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{format(new Date(entry.date), 'MMM dd')}</p>
                      <p className="text-xs text-gray-500">
                        {entry.flow} • {entry.mood} • {entry.symptoms.length} symptoms
                      </p>
                    </div>
                    {entry.isPeriod && (
                      <Droplets className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
        </div>
        </div>
      )}

      {/* Analytics Tab - AI-Powered Insights */}
      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-6">
          {/* AI Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-white/25 backdrop-blur-sm rounded-full text-xs font-semibold text-white uppercase tracking-wide">AI-Powered</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Cycle Insights</h2>
                  <p className="text-sm text-white/90 mt-0.5">Personalized analysis powered by ReproBot AI</p>
                </div>
              </div>
              <button
                onClick={() => { setActiveTab('tracker'); setShowReproBotPanel(true); }}
                className="flex-shrink-0 px-5 py-2.5 bg-white text-primary-600 font-semibold rounded-xl hover:bg-white/95 transition-all shadow-lg flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Ask ReproBot
              </button>
            </div>
          </div>

          {/* Stats - Modern cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:border-primary-200/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] sm:text-xs font-medium text-blue-600/80 uppercase tracking-wider">AI analyzed</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{avgCycleLength}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Avg cycle (days)</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:border-green-200/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-[10px] sm:text-xs font-medium text-green-600/80 uppercase tracking-wider">Pattern</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{regularityScore}%</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Regularity score</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:border-pink-200/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-400/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  <span className="text-[10px] sm:text-xs font-medium text-pink-600/80 uppercase tracking-wider">Tracked</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{cycleLengths.length || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Cycles</p>
              </div>
            </div>
            <div className="col-span-2 lg:col-span-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-200/50 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">AI Assistant</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">Get personalized cycle insights and SRHR answers</p>
                <button
                  onClick={() => { setActiveTab('tracker'); setShowReproBotPanel(true); }}
                  className="w-full py-2 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all shadow-md"
                >
                  Chat with ReproBot
                </button>
              </div>
            </div>
          </div>

          {/* AI-Generated Insights */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200/80 bg-gradient-to-r from-gray-50/80 to-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">AI Insights</h3>
                <span className="text-xs text-gray-500">Based on your tracking data</span>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="flex gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-primary-50/30 border border-gray-100 hover:border-primary-200/40 transition-all duration-200">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      insight.icon === 'trend' ? 'bg-green-100 text-green-600' :
                      insight.icon === 'pattern' ? 'bg-purple-100 text-purple-600' :
                      insight.icon === 'alert' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{insight.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.confidence && (
                        <p className="text-[10px] text-gray-400 mt-2">AI confidence: {insight.confidence}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {chartData.length > 0 && (
            <>
              <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200/80 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Mood & Energy Trend</h3>
                  <span className="text-xs text-gray-500">AI-analyzed patterns</span>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="h-56 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', strokeWidth: 0 }} name="Mood" />
                        <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0 }} name="Energy" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {symptomFrequency.length > 0 && (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200/80 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Symptom Frequency</h3>
                    <span className="text-xs text-gray-500">AI pattern detection</span>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="h-52 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={symptomFrequency.map(([name, count]) => ({ name, count }))} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <defs>
                            <linearGradient id="symptomBar" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="count" fill="url(#symptomBar)" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {chartData.length === 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/80 p-8 sm:p-12 text-center">
              <div className="inline-flex p-4 bg-primary-100 rounded-2xl mb-4">
                <BarChart3 className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock AI insights</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Track at least 2–3 entries to see AI-powered analysis, mood trends, and personalized recommendations.</p>
              <button onClick={() => setActiveTab('tracker')} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all shadow-lg">
                Add Entry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">SRHR Education Resources</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Learn about menstrual health, reproductive health, and safe practices. All information is medically accurate and culturally appropriate.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {educationTopics.map((topic) => {
                const TopicIcon = topic.icon;
                return (
                  <div key={topic.id} className="rounded-2xl border border-gray-200/80 p-4 sm:p-6 hover:shadow-lg hover:border-primary-200/60 transition-all">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`p-2 sm:p-3 rounded-xl ${topic.color} flex-shrink-0`}>
                        <TopicIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{topic.content}</p>
                        <div className="space-y-2">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700">Topics covered:</h4>
                          <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                            {topic.articles.map((article, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                                <span className="break-words">{article}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button className="mt-3 sm:mt-4 btn-outline text-xs sm:text-sm px-3 py-2">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">Educational Resources</h4>
                <p className="text-blue-800 text-xs sm:text-sm mb-3">
                  All educational content is reviewed by healthcare professionals and designed specifically for Ghanaian youth. 
                  Information is available in multiple languages including Ghanaian English and local dialects.
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Medically Reviewed</span>
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Culturally Appropriate</span>
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Multiple Languages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced AI Tools Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-primary-50 via-white to-purple-50 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Advanced AI Tools</h2>
                <p className="text-sm text-gray-600">AI-powered cycle insights and personalized recommendations</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              ReproBot uses advanced AI to analyze your cycle data and provide personalized insights. Get explanations for your predictions, understand symptom patterns, and receive tailored health recommendations.
            </p>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary-600" />
                    Ask ReproBot
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">Chat with ReproBot about your cycle, symptoms, and get personalized SRHR answers.</p>
                  <button
                    onClick={() => { setActiveTab('tracker'); setShowReproBotPanel(true); }}
                    className="w-full py-2 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all"
                  >
                    Open ReproBot
                  </button>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary-600" />
                    Cycle Analysis
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">AI analyzes your patterns to explain predictions and fertility windows.</p>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all"
                  >
                    View Insights
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">Quick AI prompts</h4>
                <p className="text-sm text-gray-600 mb-3">Try these questions with ReproBot for cycle-specific insights:</p>
                <div className="flex flex-wrap gap-2">
                  {['Explain my cycle predictions', 'Why might I feel tired?', 'When am I most fertile?', 'What do my symptoms mean?', 'How can I manage cramps?'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setReproBotInitialPrompt(prompt);
                        setActiveTab('tracker');
                        setShowReproBotPanel(true);
                      }}
                      className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors border border-primary-200/50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Form Modal */}
      {showEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Entry for {format(selectedDate, 'MMM dd, yyyy')}
                </h3>
                <button
                  onClick={() => setShowEntryForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Flow */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flow</label>
                  <div className="grid grid-cols-2 gap-2">
                    {flowOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setCurrentEntry({ ...currentEntry, flow: option.value as any })}
                        className={`p-2 rounded-lg text-sm ${
                          currentEntry.flow === option.value ? option.color : 'bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Period Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPeriod"
                    checked={currentEntry.isPeriod || false}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, isPeriod: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isPeriod" className="text-sm font-medium text-gray-700">
                    This is a period day
                  </label>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                  <div className="flex space-x-2">
                    {moodOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setCurrentEntry({ ...currentEntry, mood: option.value as any })}
                          className={`p-2 rounded-lg ${
                            currentEntry.mood === option.value ? 'bg-gray-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${option.color}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                  <div className="flex flex-wrap gap-2">
                    {symptomOptions.map(symptom => (
                      <button
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          currentEntry.symptoms?.includes(symptom) 
                            ? 'bg-primary-100 text-primary-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentEntry.temperature || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, temperature: parseFloat(e.target.value) || undefined })}
                    className="input-field"
                    placeholder="36.5"
                  />
                </div>

                {/* Extended metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Moon size={14} /> Sleep (hours)</label>
                    <input type="number" min={0} max={24} step={0.5} value={currentEntry.sleepHours ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, sleepHours: parseFloat(e.target.value) || undefined })} className="input-field" placeholder="7" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Quality (1-5)</label>
                    <select value={currentEntry.sleepQuality ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, sleepQuality: (e.target.value ? parseInt(e.target.value) : undefined) as 1|2|3|4|5 })} className="input-field">
                      <option value="">—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n===1?'Poor':n===5?'Great':''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Activity size={14} /> Exercise (min)</label>
                    <input type="number" min={0} max={300} value={currentEntry.exerciseMinutes ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, exerciseMinutes: parseInt(e.target.value) || undefined })} className="input-field" placeholder="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Droplet size={14} /> Water (glasses)</label>
                    <input type="number" min={0} max={20} value={currentEntry.waterGlasses ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, waterGlasses: parseInt(e.target.value) || undefined })} className="input-field" placeholder="8" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stress (1-5)</label>
                    <select value={currentEntry.stressLevel ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, stressLevel: (e.target.value ? parseInt(e.target.value) : undefined) as 1|2|3|4|5 })} className="input-field">
                      <option value="">—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n===1?'Low':n===5?'High':''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Energy (1-5)</label>
                    <select value={currentEntry.energyLevel ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, energyLevel: (e.target.value ? parseInt(e.target.value) : undefined) as 1|2|3|4|5 })} className="input-field">
                      <option value="">—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n===1?'Low':n===5?'High':''}</option>)}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={currentEntry.notes || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowEntryForm(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
  );
};

export default HealthTracker;
