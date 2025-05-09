import React, { useState } from 'react';
import { RetrospectiveEntry, Task, User } from '../../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProfileBadge from '../UI/ProfileBadge';

interface RetrospectiveViewProps {
  tasks: Task[];
  users: User[];
  currentPeriod: string;
  retrospectives: RetrospectiveEntry[];
  onCreateRetrospective: (retrospective: Omit<RetrospectiveEntry, 'id' | 'createdAt'>) => void;
}

export const RetrospectiveView = ({
  tasks,
  users,
  currentPeriod,
  retrospectives,
  onCreateRetrospective,
}: RetrospectiveViewProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLessons, setNewLessons] = useState<string[]>(['']);
  const [newBlockers, setNewBlockers] = useState<string[]>(['']);
  const [newWins, setNewWins] = useState<string[]>(['']);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  const periodRetrospectives = retrospectives.filter(retro => retro.period === currentPeriod);
  const completedTasks = tasks.filter(task => task.status === 'Done' && 
    new Date(task.updatedAt).toISOString().includes(currentPeriod));
  
  const handleAddItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList([...list, '']);
  };
  
  const handleUpdateItem = (index: number, value: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };
  
  const handleRemoveItem = (index: number, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.length > 1) {
      const newList = list.filter((_, i) => i !== index);
      setList(newList);
    } else {
      // If it's the last item, just clear it
      const newList = [''];
      setList(newList);
    }
  };
  
  const handleTaskSelection = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };
  
  const handleCreateRetrospective = () => {
    // Filter out empty entries
    const filteredLessons = newLessons.filter(item => item.trim() !== '');
    const filteredBlockers = newBlockers.filter(item => item.trim() !== '');
    const filteredWins = newWins.filter(item => item.trim() !== '');
    
    onCreateRetrospective({
      period: currentPeriod,
      lessonsLearned: filteredLessons,
      blockers: filteredBlockers,
      wins: filteredWins,
      relatedTaskIds: selectedTaskIds,
      createdBy: users[0], // Default to first user, in a real app this would be the current user
    });
    
    // Reset form
    setNewLessons(['']);
    setNewBlockers(['']);
    setNewWins(['']);
    setSelectedTaskIds([]);
    setIsCreating(false);
  };
  
  return (
    <div className="retrospective-view p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Retrospective - {currentPeriod}</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Retrospective
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Retrospective for {currentPeriod}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Lessons Learned
                </h3>
                {newLessons.map((lesson, index) => (
                  <div key={`lesson-${index}`} className="flex items-center gap-2 mb-2">
                    <Textarea
                      value={lesson}
                      onChange={(e) => handleUpdateItem(index, e.target.value, newLessons, setNewLessons)}
                      placeholder="What did we learn?"
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveItem(index, newLessons, setNewLessons)}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddItem(newLessons, setNewLessons)}
                  className="mt-1"
                >
                  Add Lesson
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Blockers
                </h3>
                {newBlockers.map((blocker, index) => (
                  <div key={`blocker-${index}`} className="flex items-center gap-2 mb-2">
                    <Textarea
                      value={blocker}
                      onChange={(e) => handleUpdateItem(index, e.target.value, newBlockers, setNewBlockers)}
                      placeholder="What blocked our progress?"
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveItem(index, newBlockers, setNewBlockers)}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddItem(newBlockers, setNewBlockers)}
                  className="mt-1"
                >
                  Add Blocker
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Wins
                </h3>
                {newWins.map((win, index) => (
                  <div key={`win-${index}`} className="flex items-center gap-2 mb-2">
                    <Textarea
                      value={win}
                      onChange={(e) => handleUpdateItem(index, e.target.value, newWins, setNewWins)}
                      placeholder="What went well?"
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveItem(index, newWins, setNewWins)}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddItem(newWins, setNewWins)}
                  className="mt-1"
                >
                  Add Win
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Related Tasks</h3>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {completedTasks.length > 0 ? (
                    completedTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                        onClick={() => handleTaskSelection(task.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => {}} // Handled by div click
                          className="h-4 w-4"
                        />
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-500">Completed: {format(new Date(task.updatedAt), "MMM d, yyyy")}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-gray-500">No completed tasks found for this period</div>
                  )}
                </ScrollArea>
              </div>
            </div>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreateRetrospective}>Create Retrospective</Button>
            </CardFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {periodRetrospectives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {periodRetrospectives.map((retro) => (
            <Card key={retro.id} className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Retrospective</CardTitle>
                    <CardDescription>
                      Created on {format(new Date(retro.createdAt), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <ProfileBadge user={retro.createdBy} size="sm" showTooltip={true} />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="lessons">
                    <AccordionTrigger className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Lessons Learned ({retro.lessonsLearned.length})</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {retro.lessonsLearned.map((lesson, index) => (
                          <li key={`lesson-${index}`}>{lesson}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="blockers">
                    <AccordionTrigger className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>Blockers ({retro.blockers.length})</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {retro.blockers.map((blocker, index) => (
                          <li key={`blocker-${index}`}>{blocker}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="wins">
                    <AccordionTrigger className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span>Wins ({retro.wins.length})</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {retro.wins.map((win, index) => (
                          <li key={`win-${index}`}>{win}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {retro.relatedTaskIds.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium mb-2">Related Tasks</h4>
                      <div className="flex flex-wrap gap-2">
                        {retro.relatedTaskIds.map(taskId => {
                          const task = tasks.find(t => t.id === taskId);
                          return task ? (
                            <Badge key={taskId} variant="outline" className="py-1">
                              {task.title}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Retrospectives Yet</h3>
          <p className="text-gray-500 mb-4">Create your first retrospective for {currentPeriod} to track lessons learned, blockers, and wins.</p>
          <Button onClick={() => setIsCreating(true)}>Create Retrospective</Button>
        </div>
      )}
    </div>
  );
};

export default RetrospectiveView;
