import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, UploadCloud, X, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { INTERNS, PROJECTS } from '@/data/mockTaskManagerData';
import type { Task } from '@/data/mockTaskManagerData';

const MILESTONES = [
  { id: 'm1', name: 'Alpha Release' },
  { id: 'm2', name: 'Beta Testing' },
  { id: 'm3', name: 'Production Launch' },
];

const assignTaskSchema = z.object({
  title: z.string().min(1, 'Task Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().min(1, 'Assignee is required'),
  priority: z.string(),
  status: z.string(),
  department: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  estimatedHours: z.number().optional(),
  milestone: z.string().optional(),
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return data.dueDate >= data.startDate;
  }
  return true;
}, {
  message: "Due Date cannot be before Start Date",
  path: ["dueDate"],
});

type AssignTaskForm = z.infer<typeof assignTaskSchema>;

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (task: Task) => void;
}

export function AssignTaskDialog({ open, onOpenChange, onTaskCreated }: AssignTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AssignTaskForm>({
    resolver: zodResolver(assignTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      assigneeId: '',
      priority: 'Medium',
      status: 'To Do',
      department: '',
      tags: '',
      notes: '',
      startDate: undefined,
      dueDate: undefined,
      estimatedHours: undefined,
      milestone: '',
    },
  });

  const onSubmit = async (values: AssignTaskForm) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    
    const newTask: Task = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: values.title,
      description: values.description || '',
      project_id: values.projectId,
      milestone_id: values.milestone,
      assignee_id: values.assigneeId,
      priority: values.priority as Task['priority'],
      status: values.status as Task['status'],
      start_date: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
      due_date: values.dueDate ? values.dueDate.toISOString() : new Date().toISOString(),
      estimated_hours: values.estimatedHours || 0,
      progress: 0,
      tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
      checklist: [],
      comments: values.notes ? [{ id: 'c1', userId: 'USR-1', text: values.notes, createdAt: new Date().toISOString() }] : [],
      attachments: [],
      activity: [{ id: 'a1', userId: 'USR-1', action: 'created the task', timestamp: new Date().toISOString() }]
    };

    if (onTaskCreated) {
      onTaskCreated(newTask);
    }

    toast.success('Task assigned successfully.', {
      description: `Task '${values.title}' assigned to ${INTERNS.find(i => i.id === values.assigneeId)?.name}.`
    });
    
    form.reset();
    setAttachments([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-xl overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Assign New Task</DialogTitle>
          <DialogDescription className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Create and assign a new task to an intern.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[80vh]">
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Task Title <span className="text-orange-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Landing Page Design" className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Project <span className="text-orange-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROJECTS.map(project => (
                            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide task details..." className="resize-none h-20 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-1.5">
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Assign To <span className="text-orange-500">*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" role="combobox" className={cn("justify-between rounded-lg font-medium", !field.value && "text-slate-500 font-normal")}>
                              {field.value ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={INTERNS.find(i => i.id === field.value)?.avatarUrl} />
                                    <AvatarFallback>{INTERNS.find(i => i.id === field.value)?.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{INTERNS.find(i => i.id === field.value)?.name}</span>
                                </div>
                              ) : "Select intern..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search intern..." />
                            <CommandList>
                              <CommandEmpty>No intern found.</CommandEmpty>
                              <CommandGroup>
                                {INTERNS.map((intern) => (
                                  <CommandItem
                                    value={intern.name}
                                    key={intern.id}
                                    onSelect={() => {
                                      form.setValue("assigneeId", intern.id);
                                      form.setValue("department", intern.department);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", intern.id === field.value ? "opacity-100 text-orange-500" : "opacity-0")} />
                                    <Avatar className="h-6 w-6"><AvatarImage src={intern.avatarUrl} /><AvatarFallback>{intern.name.charAt(0)}</AvatarFallback></Avatar>
                                    <div className="flex flex-col">
                                      <span>{intern.name}</span>
                                      <span className="text-xs text-slate-500">{intern.department}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Department</FormLabel>
                      <FormControl>
                        <Input readOnly placeholder="Auto-filled" className="rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="milestone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Milestone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="No milestone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No milestone</SelectItem>
                          {MILESTONES.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Tags (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bug, Frontend" className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-1.5">
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal rounded-lg", !field.value && "text-slate-500")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-1.5">
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal rounded-lg", !field.value && "text-slate-500")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Est. Hours</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.5" placeholder="e.g. 5" className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel className="font-bold text-slate-700 dark:text-slate-300 mb-2 block">Attachments</FormLabel>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer mb-3"
                  >
                    <UploadCloud className="h-8 w-8 mb-2 text-slate-400" />
                    <span className="text-sm">Click to upload or drag & drop</span>
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => {
                      if (e.target.files) {
                        setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                      e.target.value = '';
                    }} />
                  </div>
                  {attachments.length > 0 && (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 hide-scrollbar">
                      {attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon className="h-4 w-4 text-orange-500 shrink-0" />
                            <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-slate-400 hover:text-rose-500" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachments(prev => prev.filter((_, idx) => idx !== i));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Internal notes, references..." className="resize-none h-[116px] rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg font-bold">Cancel</Button>
              <Button type="button" variant="secondary" className="rounded-lg font-bold">Save Draft</Button>
              <Button type="submit" disabled={loading} className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 transition-colors">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Assign Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
