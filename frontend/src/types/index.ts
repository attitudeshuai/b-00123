export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'personal' | 'study' | 'health' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  pomodoroCount: number;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'work' | 'break';
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  autoStartBreak: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
}

export interface AppSettings {
  pomodoro: PomodoroSettings;
  theme: 'light' | 'dark';
  language: string;
}

export interface AppData {
  version: string;
  tasks: Task[];
  pomodoroSessions: PomodoroSession[];
  settings: AppSettings;
}

export const CURRENT_VERSION = '1.0.0';
