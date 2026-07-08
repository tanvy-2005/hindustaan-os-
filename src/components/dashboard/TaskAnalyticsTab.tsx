import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  BarChart, Bar, Legend
} from 'recharts';
import { TASKS, INTERNS } from '@/data/mockTaskManagerData';

const COLORS = {
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  slate: '#64748b',
  orange: '#f97316',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};

export function TaskAnalyticsTab() {
  // Aggregate Data for Charts
  const statusCounts = TASKS.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const statusData = [
    { name: 'To Do', value: statusCounts['To Do'] || 0, color: COLORS.slate },
    { name: 'In Progress', value: statusCounts['In Progress'] || 0, color: COLORS.blue },
    { name: 'Review', value: statusCounts['Review'] || 0, color: COLORS.amber },
    { name: 'Completed', value: statusCounts['Completed'] || 0, color: COLORS.emerald },
    { name: 'Blocked', value: statusCounts['Blocked'] || 0, color: COLORS.rose },
  ];

  const priorityCounts = TASKS.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {} as Record<string, number>);
  const priorityData = [
    { name: 'High', value: priorityCounts['High'] || 0, color: COLORS.rose },
    { name: 'Medium', value: priorityCounts['Medium'] || 0, color: COLORS.amber },
    { name: 'Low', value: priorityCounts['Low'] || 0, color: COLORS.emerald },
  ];

  const deptCounts = TASKS.reduce((acc, t) => {
    const dept = INTERNS.find(i => i.id === t.assignee_id)?.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const deptData = Object.keys(deptCounts).map(key => ({ name: key, tasks: deptCounts[key] })).sort((a, b) => b.tasks - a.tasks);

  // Mock Trend Data
  const trendData = [
    { name: 'Mon', completed: 4, added: 6 },
    { name: 'Tue', completed: 7, added: 3 },
    { name: 'Wed', completed: 5, added: 8 },
    { name: 'Thu', completed: 12, added: 4 },
    { name: 'Fri', completed: 9, added: 5 },
    { name: 'Sat', completed: 2, added: 1 },
    { name: 'Sun', completed: 3, added: 0 },
  ];

  const alerts = [
    { id: 1, type: 'danger', icon: <AlertCircle className="h-5 w-5 text-rose-500" />, title: "Blocked Tasks", desc: `${statusCounts['Blocked'] || 0} tasks currently blocked.` },
    { id: 2, type: 'warning', icon: <Clock className="h-5 w-5 text-amber-500" />, title: "Overdue Risk", desc: "12 tasks are past their due date." },
    { id: 3, type: 'info', icon: <AlertTriangle className="h-5 w-5 text-blue-500" />, title: "Stale Tasks", desc: "5 tasks have no updates in 3 days." },
    { id: 4, type: 'success', icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, title: "Great Pace", desc: "Team velocity is up 14% this week." },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      
      <div className="lg:col-span-3 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Donut */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Priority Pie */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Trend Line Chart */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Weekly Velocity Trend</CardTitle>
                <CardDescription>Tasks completed vs added over the last 7 days</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30"><TrendingUp className="h-3 w-3 mr-1" /> +14%</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="completed" name="Completed" stroke={COLORS.emerald} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="added" name="Added" stroke={COLORS.blue} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Dept Bar Chart */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} dx={-10} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="tasks" name="Active Tasks" fill={COLORS.orange} radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Alerts Sidebar */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Smart Alerts</h3>
        <ScrollArea className="h-[800px] pr-4">
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full bg-${alert.type === 'danger' ? 'rose' : alert.type === 'warning' ? 'amber' : alert.type === 'success' ? 'emerald' : 'blue'}-500 opacity-80 group-hover:w-1.5 transition-all`}></div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-slate-50 dark:bg-slate-900 p-2 rounded-full h-fit">{alert.icon}</div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{alert.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">{alert.desc}</p>
                    <button className="text-xs font-medium text-orange-600 hover:text-orange-700 mt-2">View details &rarr;</button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Recommendations block */}
            <div className="mt-8 p-5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
              <h4 className="font-semibold text-orange-800 dark:text-orange-400 text-sm mb-2">Manager Recommendation</h4>
              <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mb-3">Re-assign 3 tasks from Frontend to DevOps to balance the workload across the Active milestones.</p>
              <button className="text-xs font-bold bg-white dark:bg-slate-900 text-orange-600 px-3 py-1.5 rounded-md shadow-sm border border-orange-200 dark:border-orange-800 hover:bg-orange-50 transition-colors">Apply Optimization</button>
            </div>
          </div>
        </ScrollArea>
      </div>

    </div>
  );
}
