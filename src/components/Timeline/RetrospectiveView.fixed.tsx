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
import { PlusCircle, CheckCircle, XCircle, Trophy, History } from 'lucide-react';
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
    <div className="retrospective-view p-6 pt-0 animate-fade-in bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex justify-end mb-6">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="h-5 w-5" />
              Create Retrospective
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Team Retrospective</DialogTitle>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Capture learnings, challenges, and successes for {currentPeriod}</p>
            </DialogHeader>
            <div className="py-4 px-1">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid gap-4 px-3">
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
                    <ScrollArea className="h-[180px] border rounded-md p-2">
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
              </ScrollArea>
            </div>
            <CardFooter className="flex justify-end gap-2 mt-2">
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
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300">Team Insights</CardTitle>
                    <CardDescription className="text-sm">
                      Created on {format(new Date(retro.createdAt), "MMMM d, yyyy")}
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
        <div className="text-center p-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-blue-100 dark:border-gray-600 shadow-sm">
          <div className="flex flex-col items-center">
            <History className="h-16 w-16 text-blue-400 dark:text-blue-300 mb-6 opacity-75" />
            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">No Retrospectives Yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">Create your first retrospective for {currentPeriod} to document team learnings, challenges, and successes.</p>
            <Button 
              onClick={() => setIsCreating(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-lg"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Retrospective
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrospectiveView;
