
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Bell, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Trophy,
  Star,
  Zap,
  Gift,
  Users,
  Search,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  ClipboardList,
  CreditCard,
  Network,
  SmilePlus,
  UserPlus,
  Settings2,
  Medal,
  Heart
} from 'lucide-react';
import { FAMILY_MEMBERS, INITIAL_EVENTS, COLORS, TYPE_ICONS, STATUS_PRESETS } from './constants';
import { FamilyEvent, FamilyMember, MorningSummary, Category, EventType } from './types';
import { getMorningSummary } from './geminiService';

const App: React.FC = () => {
  const [family, setFamily] = useState<FamilyMember[]>(FAMILY_MEMBERS);
  const [currentUser, setCurrentUser] = useState<FamilyMember>(FAMILY_MEMBERS[0]);
  const [events, setEvents] = useState<FamilyEvent[]>(INITIAL_EVENTS);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [activeFamilyGroup, setActiveFamilyGroup] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManageFamilyOpen, setIsManageFamilyOpen] = useState(false);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isGiftPointsOpen, setIsGiftPointsOpen] = useState(false);
  
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [summary, setSummary] = useState<MorningSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Forms
  const [formState, setFormState] = useState({
    title: '',
    type: 'Home' as EventType,
    category: 'ToDo' as Category,
    date: new Date().toISOString().split('T')[0],
    time: '',
    assigneeId: FAMILY_MEMBERS[0].id,
    amount: ''
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    role: 'Kid' as 'Parent' | 'Kid',
    familyGroup: '',
    color: 'rose'
  });

  const [giftForm, setGiftForm] = useState({
    recipientId: '',
    amount: 5,
    message: ''
  });

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    const res = await getMorningSummary(events, family);
    setSummary(res);
    setIsLoadingSummary(false);
  }, [events, family]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const triggerConfetti = () => {
    for (let i = 0; i < 15; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2500);
    }
  };

  const openAddModal = () => {
    setFormState({
      title: '',
      type: 'Home',
      category: activeCategory === 'All' ? 'ToDo' : activeCategory,
      date: selectedDate.toISOString().split('T')[0],
      time: '',
      assigneeId: currentUser.id,
      amount: ''
    });
    setIsModalOpen(true);
  };

  const toggleEvent = (id: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        const isNowCompleted = !e.isCompleted;
        if (isNowCompleted) {
            triggerConfetti();
            awardPoints(e.assigneeId, 10);
        }
        return { ...e, isCompleted: isNowCompleted, completedBy: isNowCompleted ? currentUser.id : undefined };
      }
      return e;
    }));
  };

  const awardPoints = (userId: string, amount: number) => {
    setFamily(prev => prev.map(m => m.id === userId ? { ...m, points: m.points + amount } : m));
  };

  const handleGiftPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftForm.recipientId) return;
    awardPoints(giftForm.recipientId, giftForm.amount);
    setIsGiftPointsOpen(false);
    triggerConfetti();
    setGiftForm({ recipientId: '', amount: 5, message: '' });
  };

  const updateProfile = (userId: string, updates: Partial<FamilyMember>) => {
    setFamily(prev => prev.map(m => m.id === userId ? { ...m, ...updates } : m));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'Parent') return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newMember: FamilyMember = {
      id: newId,
      name: memberForm.name,
      role: memberForm.role,
      familyGroup: memberForm.familyGroup || 'The Family',
      color: memberForm.color,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberForm.name + Date.now()}`,
      status: 'Joined the Brain! 👋',
      points: 0,
      motto: 'Ready to sync!'
    };
    setFamily([...family, newMember]);
    setMemberForm({ name: '', role: 'Kid', familyGroup: '', color: 'rose' });
    triggerConfetti();
  };

  const handleDeleteMember = (id: string) => {
    if (currentUser.role !== 'Parent') return;
    if (id === currentUser.id) {
      alert("You cannot remove yourself! 🛑");
      return;
    }
    if (confirm("Permanently remove this member from the Family Brain?")) {
      setFamily(prev => prev.filter(m => m.id !== id));
      setEvents(prev => prev.filter(e => e.assigneeId !== id));
    }
  };

  const processedEvents = useMemo(() => {
    return events.filter(e => {
        const assignee = family.find(f => f.id === e.assigneeId);
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
        const matchesFamily = activeFamilyGroup === 'All' || assignee?.familyGroup === activeFamilyGroup;
        const matchesDate = activeCategory === 'Event' ? e.date.toDateString() === selectedDate.toDateString() : true;
        return matchesSearch && matchesCategory && matchesFamily && matchesDate;
    }).sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return (a.time || '23:59').localeCompare(b.time || '23:59');
    });
  }, [events, activeCategory, activeFamilyGroup, searchQuery, family, selectedDate]);

  const familyGroups = useMemo(() => ['All', ...Array.from(new Set(family.map(m => m.familyGroup)))], [family]);
  
  const leaderboard = useMemo(() => {
    return [...family].sort((a, b) => b.points - a.points);
  }, [family]);

  const selectedProfile = useMemo(() => family.find(m => m.id === selectedProfileId), [family, selectedProfileId]);

  const calendarDays = useMemo(() => {
    const days = [];
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startOffset = date.getDay();
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    return days;
  }, [currentMonth]);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'Parent') return;
    const newEvt: FamilyEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: formState.title,
        type: formState.type,
        category: formState.category,
        date: new Date(formState.date),
        time: formState.time || undefined,
        assigneeId: formState.assigneeId,
        createdBy: currentUser.id,
        isCompleted: false,
        amount: formState.amount ? parseFloat(formState.amount) : undefined,
    };
    setEvents([...events, newEvt]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen pb-24 antialiased text-gray-800 bg-[#fefcfb]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md px-4 py-2.5 flex justify-between items-center shadow-sm sticky top-0 z-30 border-b border-rose-50">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 p-1.5 rounded-lg text-white shadow-sm">
            <Sparkles size={16} />
          </div>
          <div className="leading-tight">
            <h1 className="font-black text-sm md:text-base gradient-text">Family Brain</h1>
            <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">{activeFamilyGroup} Clan</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsLeaderboardOpen(true)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"><Trophy size={16} /></button>
          <button onClick={() => setIsTreeOpen(true)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"><Network size={16} /></button>
          <button onClick={() => setIsSummaryOpen(true)} className="p-1.5 text-rose-500 bg-rose-50 rounded-lg relative"><Bell size={16} /><div className="absolute top-1 right-1 w-1 h-1 bg-rose-600 rounded-full"></div></button>
          <div className="flex items-center gap-1.5 bg-gray-50 pl-1 pr-2 py-0.5 rounded-full border border-gray-100 cursor-pointer" onClick={() => { setSelectedProfileId(currentUser.id); setIsProfileModalOpen(true); }}>
            <img src={currentUser.avatar} className="w-5 h-5 rounded-full" alt="me" />
            <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[50px]">{currentUser.name.split(' ')[0]}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 md:p-6 space-y-4">
        {/* Morning Dashboard */}
        <section className="bg-gradient-to-br from-indigo-700 to-rose-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden cursor-pointer" onClick={() => setIsSummaryOpen(true)}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">Sync Partner Dashboard</span>
                <button onClick={(e) => { e.stopPropagation(); fetchSummary(); }} className="p-1"><RefreshCw size={12} className={isLoadingSummary ? 'animate-spin' : ''} /></button>
            </div>
            <p className="text-[11px] md:text-sm font-bold opacity-90 leading-snug line-clamp-2">"{summary?.message || "Brain is calculating household sync score..."}"</p>
            <div className="flex gap-2 mt-2">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-[8px] font-black uppercase"><Trophy size={10} /> {currentUser.points} Pts</div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-[8px] font-black uppercase"><Medal size={10} /> Rank #{leaderboard.findIndex(m => m.id === currentUser.id) + 1}</div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-2 px-1">
            <button onClick={() => setIsGiftPointsOpen(true)} className="flex-1 bg-indigo-50 text-indigo-700 p-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border border-indigo-100"><Gift size={14} /> Gift Points</button>
            <button onClick={() => setIsLeaderboardOpen(true)} className="flex-1 bg-amber-50 text-amber-700 p-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border border-amber-100"><Trophy size={14} /> Leaderboard</button>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scroll-hide px-1">
              {familyGroups.map(g => (
                <button key={g} onClick={() => setActiveFamilyGroup(g)} className={`shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeFamilyGroup === g ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}>{g}</button>
              ))}
          </div>
          <div className="relative px-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="Search the Brain..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm outline-none font-bold text-[10px]" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-50 mx-1">
            {[
              { id: 'All', icon: <LayoutGrid size={14} />, label: 'All' },
              { id: 'Routine', icon: <RefreshCw size={14} />, label: 'Daily' },
              { id: 'ToDo', icon: <ClipboardList size={14} />, label: 'ToDo' },
              { id: 'Event', icon: <CalendarIcon size={14} />, label: 'Events' },
              { id: 'Bill', icon: <CreditCard size={14} />, label: 'Bills' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveCategory(tab.id as any)} className={`flex-1 flex flex-col items-center py-1.5 rounded-xl transition-all ${activeCategory === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                {tab.icon}
                <span className="text-[7px] font-black uppercase mt-0.5">{tab.label}</span>
              </button>
            ))}
        </div>

        {/* Calendar (Events Only) */}
        {activeCategory === 'Event' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[9px] font-black uppercase text-gray-400">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex gap-1">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1"><ChevronLeft size={14} /></button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1"><ChevronRight size={14} /></button>
                </div>
             </div>
             <div className="grid grid-cols-7 gap-1">
                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[8px] font-black text-gray-200 uppercase">{d}</div>)}
                {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} className="h-8" />;
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const dayEvents = events.filter(e => e.date.toDateString() === day.toDateString());
                    return (
                        <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={`h-8 relative flex flex-col items-center justify-center rounded-lg transition-all ${isSelected ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-rose-50'}`}>
                            <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-gray-700'}`}>{day.getDate()}</span>
                            <div className="flex gap-0.5">
                                {Array.from(new Set(dayEvents.map(e => e.assigneeId))).slice(0, 3).map(uid => <div key={uid} className="w-0.5 h-0.5 rounded-full bg-current opacity-50" />)}
                            </div>
                        </button>
                    );
                })}
             </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-2 pb-10">
            {processedEvents.length > 0 ? processedEvents.map(event => {
                const assignee = family.find(m => m.id === event.assigneeId)!;
                return (
                    <div key={event.id} className={`bg-white p-3 rounded-2xl shadow-sm border-l-4 ${event.isCompleted ? 'border-gray-100 opacity-60' : COLORS[assignee.color].border.replace('border-', 'border-')} flex items-center gap-3 active:scale-95 transition-transform`}>
                      <button onClick={() => toggleEvent(event.id)} className={`shrink-0 ${event.isCompleted ? 'text-emerald-500' : 'text-gray-200'}`}>
                        {event.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">{TYPE_ICONS[event.type]}</span>
                            <h3 className={`font-black text-xs truncate ${event.isCompleted ? 'line-through text-gray-300' : 'text-gray-900'}`}>{event.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[8px] font-black text-gray-400 uppercase flex items-center gap-1"><Clock size={8} /> {event.time || 'All Day'}</span>
                           <span className={`px-1 rounded-md text-[7px] font-black uppercase ${COLORS[assignee.color].bg} ${COLORS[assignee.color].text}`}>{assignee.name.split(' ')[0]}</span>
                           {event.amount && <span className="text-[7px] font-black text-amber-600 bg-amber-50 px-1 rounded-md">RM{event.amount}</span>}
                        </div>
                      </div>
                      <img src={assignee.avatar} className="w-6 h-6 rounded-lg cursor-pointer" onClick={() => { setSelectedProfileId(assignee.id); setIsProfileModalOpen(true); }} alt="av" />
                    </div>
                )
            }) : (
                <div className="py-20 text-center opacity-30 text-[9px] font-black uppercase tracking-widest">No brain activity here</div>
            )}
        </div>
      </main>

      {/* Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-[24px] shadow-2xl p-1.5 flex justify-around items-center z-40">
        <button onClick={() => setIsManageFamilyOpen(true)} className="p-2.5 text-gray-400 hover:text-rose-500"><Users size={20} /></button>
        <button onClick={openAddModal} className="bg-gray-900 text-white p-3.5 rounded-full -mt-8 border-4 border-white shadow-lg"><Plus size={24} /></button>
        <button onClick={() => setIsTreeOpen(true)} className="p-2.5 text-gray-400 hover:text-indigo-500"><Network size={20} /></button>
      </div>

      {/* Monthly Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-[40px] p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
                <button onClick={() => setIsLeaderboardOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500"><X size={20} /></button>
                <div className="text-center mb-6">
                    <Trophy className="mx-auto text-amber-500 mb-2" size={32} />
                    <h2 className="text-xl font-black text-gray-900">Monthly Sync-Stars</h2>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Top Brain Partners</p>
                </div>
                
                <div className="flex-1 overflow-y-auto scroll-hide space-y-2 pb-4 px-1">
                    {leaderboard.map((m, idx) => (
                        <div key={m.id} className={`flex items-center justify-between p-3 rounded-2xl border ${m.id === currentUser.id ? 'bg-indigo-50 border-indigo-100 ring-1 ring-indigo-200' : 'bg-white border-gray-50 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 flex items-center justify-center font-black text-xs rounded-full ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-gray-100 text-gray-500' : idx === 2 ? 'bg-orange-50 text-orange-600' : 'text-gray-300'}`}>
                                    {idx === 0 ? <Medal size={16} /> : idx + 1}
                                </div>
                                <img src={m.avatar} className="w-10 h-10 rounded-xl" />
                                <div>
                                    <p className="font-black text-[11px] text-gray-900">{m.name} {m.id === currentUser.id && '(Me)'}</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase">{m.familyGroup}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-xs text-gray-900">{m.points}</p>
                                <p className="text-[7px] font-bold text-gray-400 uppercase">Points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Gift Points Modal */}
      {isGiftPointsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95">
                <button onClick={() => setIsGiftPointsOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500"><X size={20} /></button>
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm"><Gift size={28} /></div>
                    <h2 className="text-xl font-black text-gray-900">Spread the Love</h2>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Award sync points</p>
                </div>
                
                <form onSubmit={handleGiftPoints} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Recipient</label>
                        <select required className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-bold text-xs appearance-none" value={giftForm.recipientId} onChange={e => setGiftForm({...giftForm, recipientId: e.target.value})}>
                            <option value="">Choose someone...</option>
                            {family.filter(m => m.id !== currentUser.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Amount</label>
                        <div className="flex gap-2">
                            {[5, 10, 20, 50].map(amt => (
                                <button key={amt} type="button" onClick={() => setGiftForm({...giftForm, amount: amt})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${giftForm.amount === amt ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{amt}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Kind Words</label>
                        <input value={giftForm.message} onChange={e => setGiftForm({...giftForm, message: e.target.value})} placeholder="Why are you giving this?" className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-bold text-xs outline-none" />
                    </div>

                    <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-rose-100 mt-2 flex items-center justify-center gap-2">
                        <Heart size={16} fill="currentColor" /> Send Sync-Points
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Family Hub - Management Modal */}
      {isManageFamilyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[40px] p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
                <button onClick={() => setIsManageFamilyOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500 transition-colors"><X size={20} /></button>
                
                <h2 className="text-xl font-black text-gray-900 mb-6 px-2 flex items-center gap-2">
                    <Settings2 className="text-rose-500" /> The Family Hub
                </h2>

                <div className="flex-1 overflow-y-auto scroll-hide space-y-8 pb-4">
                    {/* Add Member Form (Parents Only) */}
                    {currentUser.role === 'Parent' && (
                        <div className="bg-gray-50 rounded-[32px] p-5 space-y-4 border border-gray-100">
                            <h4 className="text-[9px] font-black uppercase text-indigo-500 flex items-center gap-1.5">
                                <UserPlus size={14} /> Invite New Sync Partner
                            </h4>
                            <form onSubmit={handleAddMember} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} placeholder="Full Name" className="w-full p-3 bg-white rounded-xl border-none font-bold text-[10px] outline-none shadow-sm" />
                                    <select value={memberForm.familyGroup} onChange={e => setMemberForm({...memberForm, familyGroup: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none font-bold text-[10px] outline-none shadow-sm appearance-none">
                                        <option value="">Create Clan...</option>
                                        {familyGroups.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                {!memberForm.familyGroup && (
                                    <input required value={memberForm.familyGroup} onChange={e => setMemberForm({...memberForm, familyGroup: e.target.value})} placeholder="Clan Name (e.g., Robinsons)" className="w-full p-3 bg-white rounded-xl border-none font-bold text-[10px] outline-none shadow-sm animate-in slide-in-from-top-2" />
                                )}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setMemberForm({...memberForm, role: 'Kid'})} className={`flex-1 p-3 rounded-xl text-[9px] font-black uppercase transition-all ${memberForm.role === 'Kid' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-400'}`}>Kid</button>
                                    <button type="button" onClick={() => setMemberForm({...memberForm, role: 'Parent'})} className={`flex-1 p-3 rounded-xl text-[9px] font-black uppercase transition-all ${memberForm.role === 'Parent' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-400'}`}>Parent</button>
                                </div>
                                <button type="submit" className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-black uppercase text-[9px] shadow-lg shadow-gray-200">Welcome to the Brain</button>
                            </form>
                        </div>
                    )}

                    {/* Member List */}
                    <div className="space-y-6">
                        {familyGroups.filter(g => g !== 'All').map(group => (
                            <div key={group} className="space-y-3">
                                <h5 className="text-[8px] font-black uppercase text-gray-300 ml-4 tracking-[0.2em]">{group} CLAN</h5>
                                <div className="grid gap-2">
                                    {family.filter(m => m.familyGroup === group).map(m => (
                                        <div key={m.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <img src={m.avatar} className="w-10 h-10 rounded-xl" />
                                                <div>
                                                    <p className="font-black text-[11px] text-gray-900">{m.name}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{m.role} • {m.points} Pts</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {currentUser.role === 'Parent' && m.id !== currentUser.id && (
                                                    <button onClick={() => handleDeleteMember(m.id)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => { setSelectedProfileId(m.id); setIsProfileModalOpen(true); }} className="p-2 text-gray-300 hover:text-indigo-500">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Status Modal */}
      {isProfileModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xs rounded-[32px] p-6 shadow-2xl relative">
                <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-rose-500"><X size={20} /></button>
                <div className="flex flex-col items-center text-center">
                    <img src={selectedProfile.avatar} className="w-20 h-20 rounded-2xl border-4 border-white shadow-md mb-2" />
                    <h2 className="text-lg font-black text-gray-900">{selectedProfile.name}</h2>
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-4">{selectedProfile.familyGroup} Clan</p>

                    <div className="w-full bg-gray-50 rounded-2xl p-3 mb-4">
                        <label className="text-[8px] font-black text-gray-300 uppercase block mb-2 text-left">Quick Status</label>
                        <div className="grid grid-cols-4 gap-1.5 mb-3">
                            {STATUS_PRESETS.map((p, i) => (
                                <button key={i} onClick={() => updateProfile(selectedProfile.id, { status: p.text })} className={`p-1.5 rounded-lg text-xs bg-white border border-gray-100 ${selectedProfile.status === p.text ? 'ring-2 ring-indigo-500' : ''}`}>{p.text.split(' ').pop()}</button>
                            ))}
                        </div>
                        <input className="w-full p-2 bg-white rounded-lg border-none text-[10px] font-bold shadow-sm outline-none" value={selectedProfile.status} onChange={(e) => updateProfile(selectedProfile.id, { status: e.target.value })} placeholder="Type custom status..." />
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full">
                        <div className="bg-indigo-50 p-2.5 rounded-xl text-center"><p className="text-[7px] font-black uppercase text-indigo-400">Sync Pts</p><p className="text-sm font-black text-indigo-700">{selectedProfile.points}</p></div>
                        <div className="bg-amber-50 p-2.5 rounded-xl text-center"><p className="text-[7px] font-black uppercase text-amber-400">Status</p><p className="text-[10px] font-black text-amber-700">Online</p></div>
                    </div>

                    {selectedProfile.id !== currentUser.id && (
                        <button onClick={() => { setIsGiftPointsOpen(true); setIsProfileModalOpen(false); setGiftForm({...giftForm, recipientId: selectedProfile.id}); }} className="w-full mt-4 bg-gray-900 text-white py-3.5 rounded-xl font-black uppercase text-[9px] shadow-lg flex items-center justify-center gap-2">
                           <Gift size={14} /> Award Points
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[40px] p-6 shadow-2xl relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500"><X size={20} /></button>
                <h2 className="text-xl font-black text-gray-900 mb-6">Brain Addition</h2>
                <form onSubmit={handleSaveEvent} className="space-y-4">
                    <input required className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-bold text-xs" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} placeholder="Event/Task Title" />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-bold text-xs appearance-none" value={formState.assigneeId} onChange={e => setFormState({...formState, assigneeId: e.target.value})}>
                            {family.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-bold text-xs appearance-none" value={formState.category} onChange={e => setFormState({...formState, category: e.target.value as Category})}>
                            <option value="ToDo">To-Do Task</option>
                            <option value="Routine">Daily Routine</option>
                            <option value="Event">Calendar Event</option>
                            <option value="Bill">Financial Bill</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-bold text-xs" value={formState.date} onChange={e => setFormState({...formState, date: e.target.value})} />
                        <input type="time" className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-bold text-xs" value={formState.time} onChange={e => setFormState({...formState, time: e.target.value})} />
                    </div>
                    {formState.category === 'Bill' && (
                        <input type="number" step="0.01" className="w-full p-3.5 bg-amber-50 rounded-xl border-none font-black text-xs text-amber-900" placeholder="Amount (RM) 0.00" value={formState.amount} onChange={e => setFormState({...formState, amount: e.target.value})} />
                    )}
                    <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg mt-2">Sync to Brain</button>
                </form>
            </div>
        </div>
      )}

      {/* Tree Modal */}
      {isTreeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-xl rounded-[40px] p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto scroll-hide">
                <button onClick={() => setIsTreeOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500"><X size={20} /></button>
                <h2 className="text-xl font-black text-gray-900 mb-6 px-2 flex items-center gap-2"><Network className="text-indigo-500" /> Grand Family Tree</h2>
                <div className="space-y-8 pb-4">
                  {familyGroups.filter(g => g !== 'All').map(group => (
                    <div key={group} className="relative border-t border-gray-100 pt-6">
                      <h4 className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-white text-[8px] font-black uppercase text-gray-300 tracking-[0.2em]">{group} CLAN</h4>
                      <div className="flex flex-col items-center">
                        <div className="flex gap-4 mb-6">
                          {family.filter(m => m.familyGroup === group && m.role === 'Parent').map(p => (
                            <div key={p.id} className="flex flex-col items-center">
                              <img src={p.avatar} className="w-12 h-12 rounded-xl border-2 border-white shadow-md ring-1 ring-gray-100" />
                              <span className="text-[8px] font-black mt-1 uppercase">{p.name.split(' ')[0]}</span>
                            </div>
                          ))}
                        </div>
                        <div className="w-px h-6 bg-gray-100 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-gray-200 after:rounded-full" />
                        <div className="flex gap-3 mt-4">
                          {family.filter(m => m.familyGroup === group && m.role === 'Kid').map(k => (
                            <div key={k.id} className="flex flex-col items-center">
                               <img src={k.avatar} className="w-8 h-8 rounded-lg border border-gray-100 shadow-sm" />
                               <span className="text-[7px] font-bold mt-1 text-gray-500 uppercase">{k.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
        </div>
      )}

      {/* Summary Digest */}
      {isSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button onClick={() => setIsSummaryOpen(false)} className="absolute top-8 right-8 p-2 text-gray-300 hover:text-rose-500"><X size={20} /></button>
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-indigo-100 mb-4">🧠</div>
                    <h2 className="text-2xl font-black text-gray-900">Brain Brief</h2>
                    <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full mt-2">{summary?.vibe || 'SYNCED'} VIBE</span>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl text-sm font-medium italic text-gray-600 leading-relaxed mb-6 border border-gray-100">"{summary?.message || "Refreshing insight..."}"</div>
                <div className="space-y-2 mb-8">
                    {summary?.reminders.map((rem, i) => (
                        <div key={i} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-50 shadow-sm"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full" /><p className="text-[11px] font-bold text-gray-800">{rem}</p></div>
                    ))}
                </div>
                <button onClick={() => setIsSummaryOpen(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Got it!</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
