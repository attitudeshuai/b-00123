import { useState } from 'react';
import type { Task, TaskPriority, TaskCategory } from '../types';
import { taskStorage } from '../utils/storage';
import { X, Calendar, Tag, Flag } from 'lucide-react';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onSave: () => void;
}

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: '低', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: '高', color: 'bg-red-100 text-red-700' },
];

const categories: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'work', label: '工作', icon: '💼' },
  { value: 'personal', label: '个人', icon: '👤' },
  { value: 'study', label: '学习', icon: '📚' },
  { value: 'health', label: '健康', icon: '💪' },
  { value: 'other', label: '其他', icon: '📌' },
];

export default function TaskForm({ task, onClose, onSave }: TaskFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'work');
  const [dueDate, setDueDate] = useState(task?.dueDate || today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (task) {
      taskStorage.update(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate || undefined,
      });
    } else {
      taskStorage.create({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        completed: false,
        dueDate: dueDate || undefined,
        pomodoroCount: 0,
      });
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-large w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-3 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">
            {task ? '编辑任务' : '新建任务'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 leading-none">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              任务标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题..."
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              任务描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入任务描述..."
              rows={1}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                优先级
              </div>
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                    priority === p.value
                      ? p.color
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                分类
              </div>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`py-2 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 text-sm ${
                    category === c.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                截止日期
              </div>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              {task ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
