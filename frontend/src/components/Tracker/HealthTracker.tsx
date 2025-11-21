import React, { useState, useEffect, useCallback } from 'react';
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
  Users,
  MapPin,
  Phone,
  ExternalLink,
  GraduationCap,
  Shield,
  Info
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { offlineStorage } from '../../utils/offlineStorage';

interface CycleEntry {
  id: string;
  date: string;
  flow: 'none' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: 'happy' | 'sad' | 'neutral' | 'anxious' | 'energetic';
  temperature?: number;
  notes?: string;
  isPeriod: boolean;
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
  const [activeTab, setActiveTab] = useState<'tracker' | 'education' | 'ngo'>('tracker');

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

  const ngoPartners = [
    {
      id: '1',
      name: 'Ghana Women\'s Health Initiative',
      description: 'Providing comprehensive reproductive health services and education across Ghana',
      services: ['Free contraceptives', 'STI testing', 'Prenatal care', 'Health education'],
      contact: '+233-24-555-0201',
      location: 'Accra, Greater Accra, Ghana',
      website: 'www.gwhi.org.gh',
      hours: 'Mon-Fri: 8AM-5PM'
    },
    {
      id: '2',
      name: 'Youth Health Network Africa',
      description: 'Youth-friendly SRHR services and peer education programs across Africa',
      services: ['Youth counseling', 'Peer support groups', 'SRHR education', 'Emergency contraception'],
      contact: '+233-24-555-0202',
      location: 'Multiple locations across Ghana and West Africa',
      website: 'www.youthhealthnetwork.africa',
      hours: 'Mon-Sat: 9AM-6PM'
    },
    {
      id: '3',
      name: 'Family Planning Association of Ghana',
      description: 'Leading provider of family planning and reproductive health services',
      services: ['Family planning counseling', 'Contraceptive services', 'Pregnancy testing', 'Health screenings'],
      contact: '+233-24-555-0203',
      location: 'Kumasi, Ashanti, Ghana',
      website: 'www.fpaghana.org',
      hours: 'Mon-Fri: 8AM-4PM'
    },
    {
      id: '4',
      name: 'Rural Health Initiative Africa',
      description: 'Bringing SRHR services to rural communities across Africa',
      services: ['Mobile clinics', 'Community education', 'Basic health services', 'Referral services'],
      contact: '+233-24-555-0204',
      location: 'Rural communities across Ghana and West Africa',
      website: 'www.ruralhealth.africa',
      hours: 'Varies by location'
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
    } catch (error) {
      console.error('Failed to save cycle data:', error);
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
      isPeriod: currentEntry.isPeriod || false
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Add Entry Button */}
        {activeTab === 'tracker' && (
          <div className="mb-6">
            <button
              onClick={() => setShowEntryForm(true)}
              className="btn-primary flex items-center space-x-2"
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
            onClick={() => setActiveTab('ngo')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'ngo'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">NGO Partners</span>
            </div>
          </button>
        </div>
        
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm sm:text-base">Cycle Length</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{cycleData.cycleLength} days</p>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                <span className="font-medium text-pink-900 text-sm sm:text-base">Period Length</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-pink-600">{cycleData.periodLength} days</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

          {/* Recent Entries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">SRHR Education Resources</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Learn about menstrual health, reproductive health, and safe practices. All information is medically accurate and culturally appropriate.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {educationTopics.map((topic) => {
                const TopicIcon = topic.icon;
                return (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">Educational Resources</h4>
                <p className="text-blue-800 text-xs sm:text-sm mb-3">
                  All educational content is reviewed by healthcare professionals and designed specifically for Liberian youth. 
                  Information is available in multiple languages including Liberian English and local dialects.
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

      {/* NGO Partners Tab */}
      {activeTab === 'ngo' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">NGO Partners & Services</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Connect with trusted organizations providing SRHR services across Liberia. All partners are verified and offer confidential, youth-friendly services.
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              {ngoPartners.map((ngo) => (
                <div key={ngo.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-0">
                      <div className="p-2 sm:p-3 bg-green-100 rounded-xl flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">{ngo.name}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{ngo.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin size={12} className="flex-shrink-0" />
                            <span className="break-words">{ngo.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone size={12} className="flex-shrink-0" />
                            <span className="break-all">{ngo.contact}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} className="flex-shrink-0" />
                            <span className="break-words">{ngo.hours}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => window.open(`tel:${ngo.contact}`, '_self')}
                        className="btn-primary text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2"
                      >
                        <Phone size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() => window.open(`https://${ngo.website}`, '_blank')}
                        className="btn-outline text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2"
                      >
                        <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>Website</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Services Offered:</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {ngo.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-2 sm:px-3 py-1 bg-primary-50 text-primary-700 text-xs sm:text-sm rounded-full border border-primary-200"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-green-900 mb-2">Partner Verification</h4>
                <p className="text-green-800 text-xs sm:text-sm mb-3">
                  All NGO partners are verified by the Ministry of Health and provide confidential, 
                  youth-friendly services. They follow international standards for SRHR care.
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Ministry Verified</span>
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Confidential</span>
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Youth-Friendly</span>
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Free Services</span>
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
                    onChange={(e) => setCurrentEntry({ ...currentEntry, temperature: parseFloat(e.target.value) })}
                    className="input-field"
                    placeholder="36.5"
                  />
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
