import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { taskStorage, pomodoroStorage } from '../utils/storage';
import type { TaskCategory, TaskPriority } from '../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const categoryColors: Record<TaskCategory, string> = {
  work: '#0ea5e9',
  personal: '#22c55e',
  study: '#eab308',
  health: '#f97316',
  other: '#6b7280',
};

const priorityColors: Record<TaskPriority, string> = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#22c55e',
};

export default function Statistics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const tasks = taskStorage.getAll();
  const sessions = pomodoroStorage.getAll();

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalPomodoros = sessions.filter(s => s.type === 'work').length;
    const totalFocusTime = sessions
      .filter(s => s.type === 'work')
      .reduce((sum, s) => sum + s.duration, 0);

    const categoryData = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<TaskCategory, number>);

    const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
      name: category === 'work' ? '工作' : 
            category === 'personal' ? '个人' :
            category === 'study' ? '学习' :
            category === 'health' ? '健康' : '其他',
      value: count,
      color: categoryColors[category as TaskCategory],
    }));

    const priorityData = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);

    const priorityChartData = Object.entries(priorityData).map(([priority, count]) => ({
      name: priority === 'high' ? '高' : priority === 'medium' ? '中' : '低',
      value: count,
      color: priorityColors[priority as TaskPriority],
    }));

    const now = new Date();
    const startDate = timeRange === 'week' 
      ? startOfWeek(now, { locale: zhCN })
      : subDays(now, 30);
    
    const endDate = timeRange === 'week'
      ? endOfWeek(now, { locale: zhCN })
      : now;

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = days.map(day => {
      const dayStr = format(day, 'MM-dd');
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt);
        return format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return format(sessionDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      return {
        name: dayStr,
        tasks: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length,
        pomodoros: daySessions.filter(s => s.type === 'work').length,
      };
    });

    const timeDistribution = sessions
      .filter(s => s.type === 'work')
      .reduce((acc, session) => {
        const task = tasks.find(t => t.id === session.taskId);
        if (task) {
          acc[task.category] = (acc[task.category] || 0) + session.duration;
        }
        return acc;
      }, {} as Record<TaskCategory, number>);

    const timeDistributionData = Object.entries(timeDistribution).map(([category, duration]) => ({
      name: category === 'work' ? '工作' : 
            category === 'personal' ? '个人' :
            category === 'study' ? '学习' :
            category === 'health' ? '健康' : '其他',
      value: Math.round(duration / 60),
      color: categoryColors[category as TaskCategory],
    }));

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      totalPomodoros,
      totalFocusTime: Math.round(totalFocusTime / 60),
      categoryChartData,
      priorityChartData,
      dailyData,
      timeDistributionData,
    };
  }, [tasks, sessions, timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">数据统计</h2>
          <p className="text-slate-500 mt-1">查看你的任务完成情况和时间分配</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">总任务数</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTasks}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已完成</p>
              <p className="text-3xl font-bold text-accent-600 mt-2">{stats.completedTasks}</p>
            </div>
            <div className="p-3 bg-accent-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">完成率</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">专注时长</p>
              <p className="text-3xl font-bold text-secondary-600 mt-2">{stats.totalFocusTime}h</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-xl">
              <Clock className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">任务趋势</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === 'week' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                本周
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === 'month' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                本月
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
                name="已完成"
              />
              <Line
                type="monotone"
                dataKey="pomodoros"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
                name="番茄钟"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-6">任务分类分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoryChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stats.categoryChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-6">优先级分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {stats.priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-6">时间分配（分钟）</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.timeDistributionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {stats.timeDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
