import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Coffee, Zap } from 'lucide-react';
import type { Task } from '../types';
import { taskStorage, pomodoroStorage, settingsStorage } from '../utils/storage';

interface PomodoroTimerProps {
  selectedTask?: Task;
}

type TimerMode = 'work' | 'break';

export default function PomodoroTimer({ selectedTask }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [workDuration, setWorkDuration] = useState<number | string>(25);
  const [breakDuration, setBreakDuration] = useState<number | string>(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStartBreak, setAutoStartBreak] = useState(false);
  const [autoStartWork, setAutoStartWork] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const settings = settingsStorage.get().pomodoro;
    setWorkDuration(settings.workDuration);
    setBreakDuration(settings.breakDuration);
    setSoundEnabled(settings.soundEnabled);
    setAutoStartBreak(settings.autoStartBreak);
    setAutoStartWork(settings.autoStartWork);
    setTimeLeft(settings.workDuration * 60);
  }, []);

  const getWorkDuration = () => typeof workDuration === 'number' ? workDuration : parseInt(workDuration) || 25;
  const getBreakDuration = () => typeof breakDuration === 'number' ? breakDuration : parseInt(breakDuration) || 5;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    const sessions = pomodoroStorage.getAll();
    setTotalSessions(sessions.filter(s => s.type === 'work').length);
  }, []);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playNotificationSound();

    if (mode === 'work' && selectedTask) {
      taskStorage.incrementPomodoro(selectedTask.id);
      pomodoroStorage.create({
        taskId: selectedTask.id,
        duration: getWorkDuration() * 60,
        type: 'work',
      });
      setTotalSessions(prev => prev + 1);
    }

    if (mode === 'work') {
      if (autoStartBreak) {
        setMode('break');
        setTimeLeft(getBreakDuration() * 60);
        setTimeout(() => setIsRunning(true), 1000);
      } else if (confirm('工作时间结束！是否开始休息？')) {
        setMode('break');
        setTimeLeft(getBreakDuration() * 60);
      }
    } else {
      if (autoStartWork) {
        setMode('work');
        setTimeLeft(getWorkDuration() * 60);
        setTimeout(() => setIsRunning(true), 1000);
      } else if (confirm('休息时间结束！是否开始工作？')) {
        setMode('work');
        setTimeLeft(getWorkDuration() * 60);
      }
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? getWorkDuration() * 60 : getBreakDuration() * 60);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'work' ? getWorkDuration() * 60 : getBreakDuration() * 60);
  };

  const handleSaveSettings = () => {
    settingsStorage.update({
      pomodoro: {
        workDuration: getWorkDuration(),
        breakDuration: getBreakDuration(),
        autoStartBreak,
        autoStartWork,
        soundEnabled,
      },
    });
    setShowSettings(false);
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((mode === 'work' ? getWorkDuration() * 60 : getBreakDuration() * 60) - timeLeft) / (mode === 'work' ? getWorkDuration() * 60 : getBreakDuration() * 60) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">番茄钟</h2>
          <p className="text-slate-500 mt-1">
            今日已完成 {totalSessions} 个番茄钟
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {showSettings && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-semibold text-slate-900 mb-4">设置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                工作时长（分钟）
              </label>
              <input
                type="number"
                value={workDuration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setWorkDuration('');
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                      setWorkDuration(numValue);
                    }
                  }
                }}
                className="input"
                min="1"
                max="60"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                休息时长（分钟）
              </label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setBreakDuration('');
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                      setBreakDuration(numValue);
                    }
                  }
                }}
                className="input"
                min="1"
                max="30"
                step="1"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">提示音</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  soundEnabled ? 'bg-primary-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    soundEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">自动开始休息</span>
              <button
                onClick={() => setAutoStartBreak(!autoStartBreak)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoStartBreak ? 'bg-primary-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    autoStartBreak ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">自动开始工作</span>
              <button
                onClick={() => setAutoStartWork(!autoStartWork)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoStartWork ? 'bg-primary-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    autoStartWork ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={handleSaveSettings}
              className="w-full btn btn-primary"
            >
              保存设置
            </button>
          </div>
        </div>
      )}

      <div className="card p-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => handleModeChange('work')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              mode === 'work'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-5 h-5" />
            工作
          </button>
          <button
            onClick={() => handleModeChange('break')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              mode === 'break'
                ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-glow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-5 h-5" />
            休息
          </button>
        </div>

        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke={mode === 'work' ? '#0ea5e9' : '#eab308'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${progress * 7.54} 754`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-slate-900 tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {mode === 'work' ? '专注时间' : '休息时间'}
              </div>
            </div>
          </div>
        </div>

        {selectedTask && (
          <div className="text-center mb-6 p-4 bg-primary-50 rounded-xl">
            <p className="text-sm text-primary-600 font-medium">当前任务</p>
            <p className="text-lg font-semibold text-primary-900 mt-1">{selectedTask.title}</p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="btn btn-primary flex items-center gap-2 px-8"
            >
              <Play className="w-5 h-5" />
              开始
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="btn btn-secondary flex items-center gap-2 px-8"
            >
              <Pause className="w-5 h-5" />
              暂停
            </button>
          )}
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center gap-2 px-8"
          >
            <RotateCcw className="w-5 h-5" />
            重置
          </button>
        </div>
      </div>
    </div>
  );
}
