import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Download, FileUp, Filter, MoreHorizontal, LayoutGrid, List, Clock, AlertCircle, Copy, Users, Folder, X, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { TASKS, INTERNS, PROJECTS } from '@/data/mockTaskManagerData';
import type { Task } from '@/data/mockTaskManagerData';
import { TaskDetailsDrawer } from '@/components/dashboard/TaskDetailsDrawer';
import { AssignTaskDialog } from '@/components/dashboard/AssignTaskDialog';
import { BulkAssignDialog } from '@/components/dashboard/BulkAssignDialog';
import { ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const KANBAN_COLS = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const DEPARTMENTS = Array.from(new Set(INTERNS.map(i => i.department)));

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      const matchesProject = filterProject === 'all' || t.project_id === filterProject;
      const assignee = INTERNS.find(i => i.id === t.assignee_id);
      const matchesDept = filterDept === 'all' || assignee?.department === filterDept;
      const matchesAssignee = filterAssignee === 'all' || t.assignee_id === filterAssignee;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesDept && matchesAssignee;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority, filterProject, filterDept, filterAssignee]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'], progress: newStatus === 'Completed' ? 100 : t.progress } : t));
    }
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterProject('all');
    setFilterDept('all');
    setFilterAssignee('all');
  };

  // KPI Metrics
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Review').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
  const completionPercent = Math.round((completedTasks / Math.max(totalTasks, 1)) * 100);
  const overdueTasks = tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'Completed').length;
  const dueTodayTasks = tasks.filter(t => new Date(t.due_date).toDateString() === new Date().toDateString() && t.status !== 'Completed').length;

  const sparklineData = Array.from({ length: 14 }).map(() => ({ value: Math.floor(Math.random() * 20) + 5 }));
  
  const statusCounts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const donutData = [
    { name: 'To Do', value: statusCounts['To Do'] || 0, color: '#64748b' },
    { name: 'In Progress', value: statusCounts['In Progress'] || 0, color: '#3b82f6' },
    { name: 'Review', value: statusCounts['Review'] || 0, color: '#f59e0b' },
    { name: 'Completed', value: statusCounts['Completed'] || 0, color: '#10b981' },
    { name: 'Blocked', value: statusCounts['Blocked'] || 0, color: '#f43f5e' },
  ];

  return (
    <div className={cn("flex-1 w-full flex flex-col h-screen bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden transition-opacity duration-500", !isMounted && "opacity-0")}>
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tasks Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage 90+ intern tasks across 8 active projects dynamically.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsBulkAssignDialogOpen(true)} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 shadow-sm font-bold transition-all hover:scale-105 active:scale-95">
              <Users className="h-4 w-4 mr-2" /> Bulk Assign
            </Button>
            <Button onClick={() => setIsAssignDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-500/25 font-bold transition-all hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4 mr-2" /> Assign New Task
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
        
        {/* Modern KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <Card className="border-t-4 border-t-slate-500 hover:shadow-lg transition-all duration-300 group rounded-xl bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <LayoutGrid className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Total Tasks</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200"><TrendingUp className="h-3 w-3 mr-1"/> +8%</Badge>
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{totalTasks}</span>
              <div className="h-10 w-full mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%"><LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="#64748b" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-all duration-300 group rounded-xl bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Active Tasks</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200"><TrendingUp className="h-3 w-3 mr-1"/> +12%</Badge>
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{activeTasks}</span>
              <p className="text-xs text-slate-500 mt-2 font-medium">In Progress & Review</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-all duration-300 group rounded-xl bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Completed</p>
                </div>
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{completedTasks}</span>
              <div className="h-10 w-full mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%"><LineChart data={sparklineData.map(d=>({value: d.value*1.2}))}><Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-orange-500 hover:shadow-lg transition-all duration-300 group rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start z-10">
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Completion</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center mt-2">
                <div className="h-20 w-20 relative flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="absolute inset-0 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={[{ name: 'progress', value: completionPercent, fill: '#f97316' }]} startAngle={90} endAngle={-270}>
                        <RadialBar background={{ fill: '#fff7ed' }} dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white z-10">{completionPercent}%</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2">{completedTasks} of {totalTasks} Tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-rose-500 hover:shadow-lg transition-all duration-300 group rounded-xl bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Overdue</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-600 border-rose-200"><TrendingDown className="h-3 w-3 mr-1"/> -2%</Badge>
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{overdueTasks}</span>
              <p className="text-xs text-slate-500 mt-2 font-medium">Requires immediate action</p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-amber-500 hover:shadow-lg transition-all duration-300 group rounded-xl bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                <Clock className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Due Today</p>
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{dueTodayTasks}</span>
              <p className="text-xs text-slate-500 mt-2 font-medium">Ensure completion</p>
            </CardContent>
          </Card>
        </div>



        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search tasks by title or ID..." className="pl-9 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[130px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"><Filter className="h-3 w-3 mr-2 text-slate-500" /><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Priorities</SelectItem>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Statuses</SelectItem>{KANBAN_COLS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[140px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"><Folder className="h-3 w-3 mr-2 text-slate-500" /><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Projects</SelectItem>{PROJECTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-[140px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Depts</SelectItem>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-[140px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"><Users className="h-3 w-3 mr-2 text-slate-500" /><SelectValue placeholder="Assignee" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Assignees</SelectItem>{INTERNS.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={resetFilters} className="h-10 w-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>Reset Filters</TooltipContent>
          </Tooltip>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both flex-1">
          {KANBAN_COLS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col);
            return (
              <div 
                key={col} 
                className="flex-shrink-0 w-[420px] flex flex-col bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col)}
              >
                <div className="p-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center text-sm">
                    {col} 
                    <Badge variant="secondary" className="ml-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold shadow-sm">{colTasks.length}</Badge>
                  </h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-slate-800"><Plus className="h-4 w-4" /></Button>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {colTasks.length === 0 ? (
                    <div className="h-full min-h-[150px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 p-6 text-center bg-white/30 dark:bg-slate-950/30">
                      <Folder className="h-8 w-8 mb-3 text-slate-300 dark:text-slate-700" />
                      <p className="font-medium text-sm text-slate-500 dark:text-slate-400">No tasks here yet</p>
                      <p className="text-xs mt-1">Drag tasks here or <button className="text-orange-500 hover:underline font-semibold" onClick={() => setIsAssignDialogOpen(true)}>Create new</button></p>
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const assignee = INTERNS.find(i => i.id === task.assignee_id);
                      const project = PROJECTS.find(p => p.id === task.project_id);
                      return (
                        <div 
                          key={task.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => openTask(task)}
                          className="bg-white dark:bg-slate-950 p-5 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:border-orange-300 dark:hover:border-orange-500/50 transition-all group hover:-translate-y-0.5"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                "text-[10px] uppercase font-bold border-transparent px-2 py-0.5 shadow-sm rounded-md",
                                task.priority === 'High' ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" :
                                task.priority === 'Medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              )}>{task.priority}</Badge>
                              <span className="text-[11px] text-slate-400 font-mono font-semibold bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">{task.id}</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                <DropdownMenuItem className="text-rose-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <h4 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{task.title}</h4>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 truncate max-w-[120px]">{project?.name}</Badge>
                            <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700">{assignee?.department}</Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <Progress 
                              value={task.progress} 
                              className="h-1.5 bg-slate-100 dark:bg-slate-800" 
                              indicatorClassName={
                                task.progress === 100 ? "bg-emerald-500" : 
                                task.progress >= 50 ? "bg-amber-500" : 
                                "bg-rose-500"
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {format(new Date(task.due_date), 'MMM d')}</span>
                              <span className="flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" /> {task.estimated_hours}h</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-medium">{assignee?.name.split(' ')[0]}</span>
                              <Avatar className="h-7 w-7 border-2 border-white dark:border-slate-950 shadow-sm">
                                <AvatarImage src={assignee?.avatarUrl} />
                                <AvatarFallback className="text-[10px] bg-slate-100 dark:bg-slate-800">{assignee?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AssignTaskDialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen} onTaskCreated={(task) => setTasks(prev => [task, ...prev])} />
      <BulkAssignDialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen} onTasksCreated={(newTasks) => setTasks(prev => [...newTasks, ...prev])} />
      <TaskDetailsDrawer task={selectedTask} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onUpdateTask={updateTask} />
    </div>
  );
}
