import { CURRENT_VERSION } from '../types';
import type { AppData, Task, PomodoroSession, AppSettings } from '../types';

const STORAGE_KEY = 'task-manager-data';

const defaultSettings: AppSettings = {
  pomodoro: {
    workDuration: 25,
    breakDuration: 5,
    autoStartBreak: false,
    autoStartWork: false,
    soundEnabled: true,
  },
  theme: 'light',
  language: 'zh-CN',
};

const createDefaultData = (): AppData => ({
  version: CURRENT_VERSION,
  tasks: [],
  pomodoroSessions: [],
  settings: defaultSettings,
});

export const storage = {
  getData: (): AppData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return createDefaultData();
      
      const parsed = JSON.parse(data) as AppData;
      return migrateData(parsed);
    } catch (error) {
      console.error('Failed to load data:', error);
      return createDefaultData();
    }
  },

  saveData: (data: AppData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  },

  exportData: (): string => {
    const data = storage.getData();
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString) as AppData;
      const migrated = migrateData(data);
      storage.saveData(migrated);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  clearData: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};

function migrateData(data: AppData): AppData {
  if (data.version === CURRENT_VERSION) return data;
  
  return {
    ...data,
    version: CURRENT_VERSION,
  };
}

export const taskStorage = {
  getAll: (): Task[] => {
    return storage.getData().tasks;
  },

  getById: (id: string): Task | undefined => {
    return storage.getData().tasks.find(t => t.id === id);
  },

  create: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const data = storage.getData();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pomodoroCount: 0,
    };
    data.tasks.push(newTask);
    storage.saveData(data);
    return newTask;
  },

  update: (id: string, updates: Partial<Task>): Task | null => {
    const data = storage.getData();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    data.tasks[index] = {
      ...data.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.saveData(data);
    return data.tasks[index];
  },

  delete: (id: string): boolean => {
    const data = storage.getData();
    const initialLength = data.tasks.length;
    data.tasks = data.tasks.filter(t => t.id !== id);
    if (data.tasks.length !== initialLength) {
      storage.saveData(data);
      return true;
    }
    return false;
  },

  toggleComplete: (id: string): Task | null => {
    const task = taskStorage.getById(id);
    if (!task) return null;
    return taskStorage.update(id, { completed: !task.completed });
  },

  incrementPomodoro: (id: string): Task | null => {
    const task = taskStorage.getById(id);
    if (!task) return null;
    return taskStorage.update(id, { pomodoroCount: task.pomodoroCount + 1 });
  },
};

export const pomodoroStorage = {
  getAll: (): PomodoroSession[] => {
    return storage.getData().pomodoroSessions;
  },

  getByTaskId: (taskId: string): PomodoroSession[] => {
    return storage.getData().pomodoroSessions.filter(s => s.taskId === taskId);
  },

  create: (session: Omit<PomodoroSession, 'id' | 'startTime' | 'endTime'>): PomodoroSession => {
    const data = storage.getData();
    const now = new Date().toISOString();
    const newSession: PomodoroSession = {
      ...session,
      id: crypto.randomUUID(),
      startTime: now,
      endTime: now,
    };
    data.pomodoroSessions.push(newSession);
    storage.saveData(data);
    return newSession;
  },

  update: (id: string, updates: Partial<PomodoroSession>): PomodoroSession | null => {
    const data = storage.getData();
    const index = data.pomodoroSessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    data.pomodoroSessions[index] = {
      ...data.pomodoroSessions[index],
      ...updates,
    };
    storage.saveData(data);
    return data.pomodoroSessions[index];
  },

  delete: (id: string): boolean => {
    const data = storage.getData();
    const initialLength = data.pomodoroSessions.length;
    data.pomodoroSessions = data.pomodoroSessions.filter(s => s.id !== id);
    if (data.pomodoroSessions.length !== initialLength) {
      storage.saveData(data);
      return true;
    }
    return false;
  },
};

export const settingsStorage = {
  get: (): AppSettings => {
    return storage.getData().settings;
  },

  update: (updates: Partial<AppSettings>): AppSettings => {
    const data = storage.getData();
    data.settings = { ...data.settings, ...updates };
    storage.saveData(data);
    return data.settings;
  },
};
