import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Paperclip, MessageSquare, CheckCircle2, Clock, Send, MoreHorizontal, User } from 'lucide-react';
import { INTERNS, PROJECTS } from '@/data/mockTaskManagerData';
import type { Task } from '@/data/mockTaskManagerData';
import { cn } from '@/lib/utils';

interface TaskDetailsDrawerProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask?: (task: Task) => void;
}

export function TaskDetailsDrawer({ task, open, onOpenChange, onUpdateTask }: TaskDetailsDrawerProps) {
  const [commentText, setCommentText] = useState('');

  if (!task) return null;

  const project = PROJECTS.find(p => p.id === task.project_id);
  const assignee = INTERNS.find(i => i.id === task.assignee_id);
  const daysRemaining = differenceInDays(new Date(task.due_date), new Date());
  
  const completedChecklist = task.checklist.filter(c => c.completed).length;
  const totalChecklist = task.checklist.length;
  const calculatedProgress = totalChecklist === 0 ? task.progress : Math.round((completedChecklist / totalChecklist) * 100);

  const toggleChecklist = (id: string) => {
    if (!onUpdateTask) return;
    const updatedChecklist = task.checklist.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    onUpdateTask({ ...task, checklist: updatedChecklist, progress: Math.round((updatedChecklist.filter(c => c.completed).length / Math.max(updatedChecklist.length, 1)) * 100) });
  };

  const getPriorityColor = (p: string) => {
    if (p === 'High') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    if (p === 'Medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
        <SheetHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-500">{task.id}</span>
                <Badge variant="outline" className={cn("border-none", getPriorityColor(task.priority))}>{task.priority}</Badge>
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">{task.status}</Badge>
              </div>
              <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{task.title}</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Overview & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">Assignee</h4>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignee?.avatarUrl} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{assignee?.name}</p>
                      <p className="text-xs text-slate-500">{assignee?.role}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">Project & Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">{project?.name}</Badge>
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-slate-500">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">Timeline</h4>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center text-slate-500"><CalendarIcon className="mr-2 h-4 w-4" /> Start</span>
                      <span className="font-medium">{format(new Date(task.start_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center text-slate-500"><Clock className="mr-2 h-4 w-4" /> Due</span>
                      <span className={cn("font-medium", daysRemaining < 0 ? "text-rose-500" : "text-emerald-500")}>
                        {format(new Date(task.due_date), 'MMM d, yyyy')} ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-slate-800" />

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                {task.description || "No description provided."}
              </p>
            </div>

            {/* Progress & Checklist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Progress Tracking</h4>
                <span className="text-sm font-bold text-orange-600">{calculatedProgress}%</span>
              </div>
              <Progress 
                value={calculatedProgress} 
                className="h-2 bg-slate-100 dark:bg-slate-800" 
                indicatorClassName={
                  calculatedProgress === 100 ? "bg-emerald-500" : 
                  calculatedProgress >= 50 ? "bg-amber-500" : 
                  "bg-rose-500"
                }
              />
              
              {task.checklist.length > 0 && (
                <div className="mt-4 space-y-2">
                  {task.checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-colors cursor-pointer" onClick={() => toggleChecklist(item.id)}>
                      <CheckCircle2 className={cn("h-5 w-5 mt-0.5 transition-colors", item.completed ? "text-orange-500" : "text-slate-300 dark:text-slate-700")} />
                      <span className={cn("text-sm", item.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300")}>{item.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="dark:bg-slate-800" />

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Attachments</h4>
                <Button variant="outline" size="sm" className="h-7 text-xs"><Paperclip className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              {task.attachments.length > 0 ? (
                <div className="flex gap-3">
                  {task.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm cursor-pointer hover:border-orange-300 transition-colors">
                      <Paperclip className="h-4 w-4 text-slate-400" />
                      <span>{att}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No attachments.</p>
              )}
            </div>

            <Separator className="dark:bg-slate-800" />

            {/* Discussion */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center"><MessageSquare className="h-4 w-4 mr-2" /> Discussion</h4>
              <div className="space-y-4 mb-4">
                {task.comments.length > 0 ? task.comments.map(comment => {
                  const commentAuthor = INTERNS.find(i => i.id === comment.userId);
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={commentAuthor?.avatarUrl} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">{commentAuthor?.name || 'Unknown'}</span>
                          <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-slate-500 italic">No comments yet. Start the discussion!</p>
                )}
              </div>
              <div className="flex gap-3 items-end">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-700">M</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..." 
                    className="min-h-[80px] resize-none pr-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700" 
                  />
                  <Button size="icon" variant="ghost" className="absolute right-2 bottom-2 h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
