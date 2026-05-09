import { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, Clock, BarChart3, X, Keyboard } from 'lucide-react';
import type { Task } from './types';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import PomodoroTimer from './components/PomodoroTimer';
import Statistics from './components/Statistics';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

type Tab = 'tasks' | 'pomodoro' | 'statistics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleCreateTask = () => {
    setShowTaskForm(true);
  };

  useKeyboardShortcuts([
    { key: 'n', ctrlKey: true, action: handleCreateTask, description: '新建任务' },
    { key: '?', action: () => setShowShortcuts(!showShortcuts), description: '显示快捷键' },
    { key: 'Escape', action: () => {
      setShowTaskForm(false);
      setShowShortcuts(false);
    }, description: '关闭弹窗' },
  ]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTaskForm(false);
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">任务管理系统</h1>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                任务
              </button>
              <button
                onClick={() => setActiveTab('pomodoro')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'pomodoro'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-5 h-5" />
                番茄钟
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'statistics'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                统计
              </button>
            </nav>

            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="快捷键"
            >
              <Keyboard className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              任务
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'pomodoro'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-5 h-5" />
              番茄钟
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'statistics'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              统计
            </button>
          </div>
        </div>

        <div className="animate-fade-in">
          {activeTab === 'tasks' && (
            <TaskList />
          )}
          {activeTab === 'pomodoro' && (
            <PomodoroTimer selectedTask={selectedTask} />
          )}
          {activeTab === 'statistics' && <Statistics />}
        </div>
      </main>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSave={() => {
            setShowTaskForm(false);
            window.location.reload();
          }}
        />
      )}

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-large w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">键盘快捷键</h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-700">新建任务</span>
                <kbd className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-mono text-slate-600">Ctrl + N</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-700">关闭弹窗</span>
                <kbd className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-mono text-slate-600">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
