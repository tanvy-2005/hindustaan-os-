import React, { useState } from 'react';
import { CalendarDays, LayoutTemplate, Briefcase, LayoutGrid, CheckSquare, Target, ListTodo, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Mock Data ---
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const GANTT_TASKS = [
  { id: '1', name: 'Authentication Pipeline', start: 0, duration: 3, color: 'bg-emerald-500 dark:bg-emerald-600', assignee: 'Amanda S.' },
  { id: '2', name: 'Dashboard UI Revamp', start: 2, duration: 4, color: 'bg-blue-500 dark:bg-blue-600', assignee: 'Priya P.' },
  { id: '3', name: 'Supabase Migration', start: 0, duration: 5, color: 'bg-purple-500 dark:bg-purple-600', assignee: 'Rahul S.' },
  { id: '4', name: 'User Testing', start: 4, duration: 2, color: 'bg-amber-500 dark:bg-amber-600', assignee: 'Priya P.' },
  { id: '5', name: 'Marketing Launch', start: 5, duration: 2, color: 'bg-rose-500 dark:bg-rose-600', assignee: 'Rohan G.' }
];

const PROJECT_LIST = [
  { id: 'p1', name: 'ProjectOS Redesign', tasks: 12, status: 'In Progress', progress: 68, iconColor: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400', strokeColor: '#e11d48' },
  { id: 'p2', name: 'Mobile App', tasks: 8, status: 'In Progress', progress: 45, iconColor: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', strokeColor: '#2563eb' },
  { id: 'p3', name: 'Marketing Website', tasks: 6, status: 'On Hold', progress: 20, iconColor: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400', strokeColor: '#d97706' },
  { id: 'p4', name: 'Design System', tasks: 10, status: 'Completed', progress: 100, iconColor: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', strokeColor: '#059669' }
];

export default function Projects({ session }: { session?: any }) {
  const [activeTab, setActiveTab] = useState('All');
  const role = session?.user?.user_metadata?.role || 'intern';
  
  const baseProjects = role === 'manager' ? PROJECT_LIST : [PROJECT_LIST[0]];
  const displayedProjects = baseProjects.filter(p => {
    if (activeTab === 'Active') return p.status !== 'Completed';
    if (activeTab === 'Completed') return p.status === 'Completed';
    return true;
  });
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Project Timeline</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">High-level Gantt chart outlining task execution over the current week.</p>
        </div>
        {role === 'manager' && (
          <button className="flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 shrink-0">
            <Plus className="h-4 w-4 mr-1.5" /> New Project
          </button>
        )}
      </div>

      {/* Project Overview List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Active Projects</h3>
          </div>
          <div className="flex space-x-4 text-sm font-bold">
            <button 
              onClick={() => setActiveTab('All')}
              className={cn("pb-1", activeTab === 'All' ? "text-slate-900 dark:text-white border-b-2 border-orange-600 dark:border-orange-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300")}
            >All</button>
            <button 
              onClick={() => setActiveTab('Active')}
              className={cn("pb-1", activeTab === 'Active' ? "text-slate-900 dark:text-white border-b-2 border-orange-600 dark:border-orange-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300")}
            >Active</button>
            <button 
              onClick={() => setActiveTab('Completed')}
              className={cn("pb-1", activeTab === 'Completed' ? "text-slate-900 dark:text-white border-b-2 border-orange-600 dark:border-orange-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300")}
            >Completed</button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayedProjects.map((project) => (
            <div key={project.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={cn("p-4 rounded-2xl shadow-sm", project.iconColor)}>
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{project.name}</h4>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                    <ListTodo className="h-4 w-4 mr-1.5" /> {project.tasks} tasks • {project.status}
                  </p>
                </div>
              </div>
              
              {/* Radial Progress */}
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
                  <circle 
                    cx="32" cy="32" r="28" fill="transparent" 
                    stroke={project.strokeColor} strokeWidth="6" 
                    strokeDasharray="175.9" 
                    strokeDashoffset={175.9 - (175.9 * project.progress) / 100} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{project.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Panel Toolbar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center space-x-2">
            <LayoutTemplate className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Execution Timeline</h3>
          </div>
          <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Current Week
          </div>
        </div>

        {/* Gantt Chart Container */}
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[700px]">
            
            {/* Timeline Header (Days) */}
            <div className="flex">
              {/* Spacer for task names */}
              <div className="w-48 shrink-0"></div>
              {/* Day Columns */}
              <div className="flex-1 grid grid-cols-7 gap-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center pb-4 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="mt-6 space-y-6 relative">
              
              {/* Vertical Grid Lines */}
              <div className="absolute inset-0 flex ml-48 pointer-events-none">
                <div className="flex-1 grid grid-cols-7 gap-2 h-full">
                  {[0,1,2,3,4,5,6].map(i => (
                    <div key={i} className="border-r border-slate-100 dark:border-slate-800/50 h-full"></div>
                  ))}
                </div>
              </div>

              {/* Task Bars */}
              {GANTT_TASKS.map((task) => (
                <div key={task.id} className="flex items-center relative z-10 group">
                  {/* Task Name Label */}
                  <div className="w-48 shrink-0 pr-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{task.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{task.assignee}</p>
                  </div>
                  
                  {/* Task Timeline Bar */}
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    <div 
                      className={cn("h-8 rounded-lg shadow-sm flex items-center px-3 text-xs font-bold text-white whitespace-nowrap overflow-hidden transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md", task.color)}
                      style={{ 
                        gridColumn: `${task.start + 1} / span ${task.duration}` 
                      }}
                    >
                      {task.name}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
