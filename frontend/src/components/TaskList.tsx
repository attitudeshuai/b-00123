import { useState } from 'react';
import type { Task, TaskPriority, TaskCategory } from '../types';
import { Check, Trash2, Edit2, Clock, Play, Search, Filter, Plus } from 'lucide-react';
import { taskStorage } from '../utils/storage';
import TaskForm from './TaskForm';

interface TaskListProps {
  onTaskSelect?: (task: Task) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const categoryIcons: Record<TaskCategory, string> = {
  work: '💼',
  personal: '👤',
  study: '📚',
  health: '💪',
  other: '📌',
};

export default function TaskList({ onTaskSelect }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(taskStorage.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const refreshTasks = () => setTasks(taskStorage.getAll());

  const handleToggleComplete = (id: string) => {
    taskStorage.toggleComplete(id);
    refreshTasks();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      taskStorage.delete(id);
      refreshTasks();
    }
  };

  const handleStartPomodoro = (task: Task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCompleted = showCompleted || !task.completed;
    return matchesSearch && matchesCategory && matchesPriority && matchesCompleted;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">任务列表</h2>
            <p className="text-slate-500 mt-1">
              共 {stats.total} 个任务 · {stats.completed} 已完成 · {stats.pending} 进行中
            </p>
          </div>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新建任务
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showCompleted
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Check className="w-4 h-4" />
              显示已完成
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-slide-up">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
                className="input"
              >
                <option value="all">所有分类</option>
                <option value="work">工作</option>
                <option value="personal">个人</option>
                <option value="study">学习</option>
                <option value="health">健康</option>
                <option value="other">其他</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
                className="input"
              >
                <option value="all">所有优先级</option>
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">
            <p className="text-lg">暂无任务</p>
            <p className="text-sm mt-2">点击"新建任务"开始创建你的第一个任务</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`card p-4 transition-all duration-200 ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-slate-300 hover:border-primary-500'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`font-medium ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      {categoryIcons[task.category]}
                      {task.category === 'work' ? '工作' : 
                       task.category === 'personal' ? '个人' :
                       task.category === 'study' ? '学习' :
                       task.category === 'health' ? '健康' : '其他'}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                    {task.pomodoroCount > 0 && (
                      <span className="flex items-center gap-1 text-primary-600">
                        <Play className="w-4 h-4" />
                        {task.pomodoroCount} 个番茄钟
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!task.completed && (
                    <button
                      onClick={() => handleStartPomodoro(task)}
                      className="p-2 hover:bg-primary-50 rounded-lg transition-colors text-primary-600"
                      title="开始番茄钟"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                    title="编辑"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={() => {
            setEditingTask(null);
            refreshTasks();
          }}
        />
      )}

      {showNewTaskForm && (
        <TaskForm
          onClose={() => setShowNewTaskForm(false)}
          onSave={() => {
            setShowNewTaskForm(false);
            refreshTasks();
          }}
        />
      )}
    </div>
  );
}
