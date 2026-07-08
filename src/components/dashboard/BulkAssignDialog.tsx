import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
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

const bulkAssignSchema = z.object({
  title: z.string().min(1, 'Task Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assigneeIds: z.array(z.string()).min(1, 'At least one assignee is required'),
  priority: z.string(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  estimatedHours: z.number().optional(),
});

type BulkAssignForm = z.infer<typeof bulkAssignSchema>;

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksCreated?: (tasks: Task[]) => void;
}

export function BulkAssignDialog({ open, onOpenChange, onTasksCreated }: BulkAssignDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<BulkAssignForm>({
    resolver: zodResolver(bulkAssignSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      assigneeIds: [],
      priority: 'Medium',
      startDate: undefined,
      dueDate: undefined,
      estimatedHours: undefined,
    },
  });

  const onSubmit = async (values: BulkAssignForm) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    
    const newTasks: Task[] = values.assigneeIds.map((assigneeId, index) => {
      const assignee = INTERNS.find(i => i.id === assigneeId);
      return {
        id: `TSK-BLK-${Math.floor(1000 + Math.random() * 9000)}-${index}`,
        title: values.title,
        description: values.description || '',
        project_id: values.projectId,
        milestone_id: 'none',
        assignee_id: assigneeId,
        priority: values.priority as Task['priority'],
        status: 'To Do',
        start_date: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
        due_date: values.dueDate ? values.dueDate.toISOString() : new Date().toISOString(),
        estimated_hours: values.estimatedHours || 0,
        progress: 0,
        tags: ['Bulk'],
        checklist: [],
        comments: [],
        attachments: [],
        activity: [{ id: `a${index}`, userId: 'USR-1', action: 'bulk assigned the task', timestamp: new Date().toISOString() }]
      };
    });

    if (onTasksCreated) {
      onTasksCreated(newTasks);
    }

    toast.success('Bulk Assignment Successful', {
      description: `Created and assigned ${newTasks.length} tasks for '${values.title}'.`
    });
    
    form.reset();
    onOpenChange(false);
  };

  const selectedAssignees = form.watch('assigneeIds') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-xl overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            Bulk Assign Tasks
            <Badge variant="outline" className="ml-3 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800">Multiple Assignees</Badge>
          </DialogTitle>
          <DialogDescription className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Instantly deploy identical tasks to multiple team members.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[80vh]">
            <div className="p-6 overflow-y-auto space-y-6">
              
              <FormField
                control={form.control}
                name="assigneeIds"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Select Assignees <span className="text-orange-500">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" role="combobox" className={cn("justify-between rounded-lg font-medium h-auto min-h-[2.5rem] py-2", selectedAssignees.length === 0 && "text-slate-500 font-normal")}>
                            {selectedAssignees.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedAssignees.map(id => {
                                  const intern = INTERNS.find(i => i.id === id);
                                  return (
                                    <Badge key={id} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1 pr-1.5 border border-slate-200 dark:border-slate-700">
                                      <Avatar className="h-4 w-4 mr-1"><AvatarImage src={intern?.avatarUrl} /><AvatarFallback>{intern?.name.charAt(0)}</AvatarFallback></Avatar>
                                      {intern?.name.split(' ')[0]}
                                      <div className="h-3 w-3 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center ml-1 cursor-pointer hover:bg-rose-200 hover:text-rose-600 transition-colors" onClick={(e) => {
                                        e.stopPropagation();
                                        field.onChange(selectedAssignees.filter(sid => sid !== id));
                                      }}>
                                        <X className="h-2 w-2" />
                                      </div>
                                    </Badge>
                                  )
                                })}
                              </div>
                            ) : "Select team members..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search intern by name or department..." />
                          <CommandList>
                            <CommandEmpty>No team members found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500">Select All</span>
                                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-blue-600" onClick={() => field.onChange(INTERNS.map(i => i.id))}>Select All</Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-slate-500" onClick={() => field.onChange([])}>Clear</Button>
                              </div>
                              {INTERNS.map((intern) => (
                                <CommandItem
                                  value={`${intern.name} ${intern.department}`}
                                  key={intern.id}
                                  onSelect={() => {
                                    if (selectedAssignees.includes(intern.id)) {
                                      field.onChange(selectedAssignees.filter(id => id !== intern.id));
                                    } else {
                                      field.onChange([...selectedAssignees, intern.id]);
                                    }
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border", selectedAssignees.includes(intern.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-700")}>
                                    {selectedAssignees.includes(intern.id) && <Check className="h-3 w-3" />}
                                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Shared Task Title <span className="text-orange-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Weekly Report Submission" className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} />
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
                    <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Shared Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide task details that all assignees will see..." className="resize-none h-20 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Est. Hours (Per Person)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.5" placeholder="e.g. 5" className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-500">
                {selectedAssignees.length} tasks will be created
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg font-bold">Cancel</Button>
                <Button type="submit" disabled={loading || selectedAssignees.length === 0} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 transition-colors">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Bulk Assign
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
