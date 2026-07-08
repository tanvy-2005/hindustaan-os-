import { format, subDays, addDays } from 'date-fns';

export interface Intern {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  department: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  milestones: string[];
}

export interface TaskComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  milestone_id?: string;
  assignee_id: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed' | 'Blocked';
  start_date: string;
  due_date: string;
  estimated_hours: number;
  progress: number;
  tags: string[];
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: string[];
  activity: TaskActivity[];
}

const DEPARTMENTS = ['Frontend', 'Backend', 'Data Science', 'Design', 'DevOps', 'QA'];

export const INTERNS: Intern[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `USR-${1000 + i}`,
  name: `Intern ${i + 1}`,
  role: ['Developer', 'Analyst', 'Designer', 'Engineer'][Math.floor(Math.random() * 4)],
  email: `intern${i + 1}@hindustaan.in`,
  avatarUrl: `https://i.pravatar.cc/150?u=${1000 + i}`,
  department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
}));

export const PROJECTS: Project[] = [
  { id: 'PRJ-1', name: 'Authentication Portal', status: 'Active', milestones: ['Design Auth', 'API Build', 'Testing'] },
  { id: 'PRJ-2', name: 'Dashboard Analytics', status: 'Active', milestones: ['Data Modeling', 'Charts UI', 'Review'] },
  { id: 'PRJ-3', name: 'User Onboarding', status: 'Planning', milestones: ['UX Research', 'Prototyping'] },
  { id: 'PRJ-4', name: 'Notification Service', status: 'Active', milestones: ['Email Integration', 'Push Notifications'] },
  { id: 'PRJ-5', name: 'Payment Gateway', status: 'On Hold', milestones: ['Vendor Selection', 'Stripe Integration'] },
  { id: 'PRJ-6', name: 'Mobile App V1', status: 'Active', milestones: ['UI Layer', 'State Management'] },
  { id: 'PRJ-7', name: 'Data Pipeline Optimization', status: 'Planning', milestones: ['Audit', 'Refactor'] },
  { id: 'PRJ-8', name: 'Security Audit', status: 'Completed', milestones: ['Pen Test', 'Patching'] },
];

const PRIORITIES: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
const STATUSES: ('To Do' | 'In Progress' | 'Review' | 'Completed' | 'Blocked')[] = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked'];
const TAGS = ['Bug', 'Feature', 'Enhancement', 'Documentation', 'Hotfix', 'Design', 'Backend', 'Frontend'];

const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  for (let i = 0; i < 90; i++) {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const progress = status === 'Completed' ? 100 : status === 'To Do' ? 0 : Math.floor(Math.random() * 90);
    const startDate = subDays(new Date(), Math.floor(Math.random() * 15)).toISOString();
    const dueDate = addDays(new Date(), Math.floor(Math.random() * 20) - 5).toISOString();

    tasks.push({
      id: `TSK-${1000 + i}`,
      title: `Task Assignment ${i + 1} - ${TAGS[Math.floor(Math.random() * TAGS.length)]}`,
      description: `Detailed description for task ${1000 + i}. Ensure all acceptance criteria are met before moving to review.`,
      project_id: PROJECTS[Math.floor(Math.random() * PROJECTS.length)].id,
      assignee_id: INTERNS[Math.floor(Math.random() * INTERNS.length)].id,
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      status,
      start_date: startDate,
      due_date: dueDate,
      estimated_hours: Math.floor(Math.random() * 24) + 1,
      progress,
      tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => TAGS[Math.floor(Math.random() * TAGS.length)]),
      checklist: Array.from({ length: 3 }).map((_, c) => ({ id: `c-${i}-${c}`, title: `Checklist item ${c + 1}`, completed: Math.random() > 0.5 })),
      comments: Array.from({ length: Math.floor(Math.random() * 3) }).map((_, c) => ({
        id: `com-${i}-${c}`,
        userId: INTERNS[Math.floor(Math.random() * INTERNS.length)].id,
        text: `This is a comment number ${c + 1} for this task.`,
        createdAt: new Date().toISOString(),
      })),
      attachments: Math.random() > 0.7 ? ['spec_doc.pdf'] : [],
      activity: [
        { id: `act-${i}-1`, userId: INTERNS[0].id, action: 'created the task', timestamp: startDate }
      ]
    });
  }
  return tasks;
};

export const TASKS: Task[] = generateTasks();
