
export type Category = 'Routine' | 'ToDo' | 'Event' | 'Bill';
export type EventType = 'School' | 'Clinic' | 'Tuition' | 'Bill' | 'Home' | 'Work';

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Parent' | 'Kid';
  avatar: string;
  color: string;
  status: string;
  points: number;
  motto?: string;
  familyGroup: string; // e.g., "The Robinsons"
  parentId?: string; // For tree visualization
}

export interface FamilyEvent {
  id: string;
  title: string;
  type: EventType;
  category: Category;
  date: Date;
  time?: string;
  assigneeId: string;
  createdBy: string;
  completedBy?: string;
  amount?: number;
  isCompleted: boolean;
  notes?: string;
}

export interface MorningSummary {
  message: string;
  reminders: string[];
  vibe: string;
}
