const fs = require('fs');
const files = [
  'src/components/layout/DashboardShell.tsx',
  'src/components/dashboard/ManagerDashboard.tsx',
  'src/components/dashboard/InternDashboard.tsx',
  'src/pages/OverviewDashboard.tsx',
  'src/pages/TaskBoard.tsx',
  'src/pages/TimeAndStandup.tsx',
  'src/components/dashboard/MyTasksWidget.tsx'
];

const processFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Regex replacements to be safe with word boundaries
  const map = {
    'bg-white': 'bg-white dark:bg-slate-900',
    'bg-slate-50': 'bg-slate-50 dark:bg-slate-900/40',
    'bg-slate-50/50': 'bg-slate-50/50 dark:bg-slate-900/30',
    'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
    
    'text-slate-900': 'text-slate-900 dark:text-white',
    'text-slate-700': 'text-slate-700 dark:text-slate-200',
    'text-slate-600': 'text-slate-600 dark:text-slate-300',
    'text-slate-500': 'text-slate-500 dark:text-slate-400',
    'text-slate-400': 'text-slate-400 dark:text-slate-500',
    
    'border-slate-200': 'border-slate-200 dark:border-slate-700/60',
    'border-slate-100': 'border-slate-100 dark:border-slate-800',
    
    'bg-orange-50': 'bg-orange-50 dark:bg-orange-500/10',
    'bg-orange-100': 'bg-orange-100 dark:bg-orange-500/20',
    'text-orange-600': 'text-orange-600 dark:text-orange-400',
    'text-orange-700': 'text-orange-700 dark:text-orange-300',
    
    'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-500/10',
    'border-emerald-200': 'border-emerald-200 dark:border-emerald-500/20',
    'text-emerald-500': 'text-emerald-500 dark:text-emerald-400',
    'text-emerald-600': 'text-emerald-600 dark:text-emerald-400',
    'text-emerald-700': 'text-emerald-700 dark:text-emerald-300',
    
    'bg-rose-50': 'bg-rose-50 dark:bg-rose-500/10',
    'border-rose-200': 'border-rose-200 dark:border-rose-500/20',
    'text-rose-600': 'text-rose-600 dark:text-rose-400',
    'text-rose-700': 'text-rose-700 dark:text-rose-300',
    
    'text-amber-500': 'text-amber-500 dark:text-amber-400',
    'text-amber-600': 'text-amber-600 dark:text-amber-400',
    'text-amber-700': 'text-amber-700 dark:text-amber-300',
  };

  // Strip all dark: classes first to prevent duplicates
  content = content.replace(/ dark:[a-z0-9-\/]+/g, '');

  // Run replacements safely
  for (const [key, value] of Object.entries(map)) {
    // Escape for regex
    const regexKey = key.replace(/\//g, '\\/');
    const regex = new RegExp(`\\b${regexKey}(?!\\/)`, 'g');
    content = content.replace(regex, value);
  }

  fs.writeFileSync(file, content);
};

files.forEach(processFile);
console.log('done updating dark mode with regex boundaries');
