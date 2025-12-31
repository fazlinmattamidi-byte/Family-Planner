
import { FamilyMember, FamilyEvent } from './types';

export const STATUS_PRESETS = [
  { text: 'Working 💼', color: 'sky' },
  { text: 'Studying 📚', color: 'amber' },
  { text: 'Gaming 🎮', color: 'indigo' },
  { text: 'At Gym 🏋️', color: 'emerald' },
  { text: 'Nap Time 😴', color: 'rose' },
  { text: 'Driving 🚗', color: 'sky' },
  { text: 'Cooking 🍳', color: 'amber' },
  { text: 'Meeting 🤫', color: 'rose' },
];

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Mom Sarah', role: 'Parent', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', color: 'rose', status: 'In Meeting 💼', points: 150, motto: 'Keep moving forward!', familyGroup: 'Robinsons' },
  { id: '2', name: 'Dad Mike', role: 'Parent', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', color: 'sky', status: 'Grocery Shopping 🛒', points: 120, motto: 'Dad jokes are free.', familyGroup: 'Robinsons' },
  { id: '3', name: 'Maya', role: 'Kid', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya', color: 'amber', status: 'Homework 📚', points: 45, motto: 'Future NASA engineer', familyGroup: 'Robinsons', parentId: '1' },
  { id: '4', name: 'Uncle Dave', role: 'Parent', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave', color: 'emerald', status: 'At Gym 🏋️', points: 80, motto: 'Stronger every day', familyGroup: 'Millers' },
  { id: '5', name: 'Leo', role: 'Kid', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', color: 'indigo', status: 'Gaming 🎮', points: 30, motto: 'Top 1% in Roblox', familyGroup: 'Millers', parentId: '4' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

export const INITIAL_EVENTS: FamilyEvent[] = [
  { id: 'e1', title: 'Vitamin Check', type: 'Home', category: 'Routine', date: today, time: '08:00', assigneeId: '3', createdBy: '1', isCompleted: false },
  { id: 'e2', title: 'Buy Milk', type: 'Home', category: 'ToDo', date: today, assigneeId: '2', createdBy: '1', isCompleted: false },
  { id: 'e3', title: 'Piano Lesson', type: 'Tuition', category: 'Event', date: today, time: '16:00', assigneeId: '3', createdBy: '1', isCompleted: true, completedBy: '3' },
  { id: 'e4', title: 'Internet Bill', type: 'Bill', category: 'Bill', date: tomorrow, assigneeId: '1', createdBy: '1', amount: 149.00, isCompleted: false },
  { id: 'e5', title: 'School Meeting', type: 'School', category: 'Event', date: tomorrow, time: '10:00', assigneeId: '1', createdBy: '1', isCompleted: false },
];

export const COLORS: Record<string, { bg: string, text: string, border: string, dot: string }> = {
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
};

export const TYPE_ICONS: Record<string, string> = {
  School: '🏫',
  Clinic: '🏥',
  Tuition: '📚',
  Bill: '💸',
  Home: '🏠',
  Work: '💼',
};
