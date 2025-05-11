import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Status, User, PublicTimelineSettings, Task } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Share2, Lock, Eye, EyeOff, Link, Calendar as CalendarLucideIcon } from 'lucide-react';
import { format, addDays, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';

interface ShareTimelineDialogProps {
  tasks: Task[];
  currentUser: User;
  onCreatePublicTimeline: (settings: PublicTimelineSettings) => void;
}

const ShareTimelineDialog: React.FC<ShareTimelineDialogProps> = ({
  tasks,
  currentUser,
  onCreatePublicTimeline,
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Product Roadmap');
  const [description, setDescription] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(addMonths(new Date(), 1));
  const [visibleColumns, setVisibleColumns] = useState<Status[]>(['Backlog', 'In Progress', 'Review', 'Done']);
  const [hiddenTasks, setHiddenTasks] = useState<string[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const { toast } = useToast();

  // All possible statuses
  const allStatuses: Status[] = ['Backlog', 'In Progress', 'Review', 'Done', 'Blocked'];

  const handleStatusToggle = (status: Status) => {
    if (visibleColumns.includes(status)) {
      setVisibleColumns(visibleColumns.filter(s => s !== status));
    } else {
      setVisibleColumns([...visibleColumns, status]);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    if (hiddenTasks.includes(taskId)) {
      setHiddenTasks(hiddenTasks.filter(id => id !== taskId));
    } else {
      setHiddenTasks([...hiddenTasks, taskId]);
    }
  };

  const generateShareableLink = () => {
    const newAccessKey = uuidv4().substring(0, 8);
    setAccessKey(newAccessKey);
    // In a real app, this would be a proper URL with your domain
    setGeneratedLink(`${window.location.origin}/timeline/public/${newAccessKey}`);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Link Copied",
      description: "Shareable link copied to clipboard",
      duration: 3000,
    });
  };

  const handleCreateTimeline = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for the shared timeline",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isPasswordProtected && !password.trim()) {
      toast({
        title: "Password Required",
        description: "Please provide a password or disable password protection",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (visibleColumns.length === 0) {
      toast({
        title: "No Columns Selected",
        description: "Please select at least one column to display",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Generate a new access key if one doesn't exist
    if (!accessKey) {
      generateShareableLink();
    }

    const settings: PublicTimelineSettings = {
      id: uuidv4(),
      accessKey: accessKey,
      title,
      description,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      expiresAt: hasExpiry && expiryDate ? expiryDate.toISOString() : undefined,
      allowedFilters: true,
      visibleColumns,
      hiddenTasks,
      isPasswordProtected,
      password: isPasswordProtected ? password : undefined,
      isPublic: true,
    };

    onCreatePublicTimeline(settings);
    
    toast({
      title: "Timeline Shared",
      description: "Your timeline is now available via the shareable link",
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Timeline View</DialogTitle>
          <DialogDescription>
            Create a shareable view of your timeline for external stakeholders.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Basic Settings</TabsTrigger>
            <TabsTrigger value="visibility">Content Visibility</TabsTrigger>
            <TabsTrigger value="share">Generate Link</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Product Roadmap Q2 2025"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this timeline view"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="password-protection"
                  checked={isPasswordProtected}
                  onCheckedChange={setIsPasswordProtected}
                />
                <Label htmlFor="password-protection" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password Protection
                </Label>
              </div>

              {isPasswordProtected && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="expiry"
                  checked={hasExpiry}
                  onCheckedChange={setHasExpiry}
                />
                <Label htmlFor="expiry" className="flex items-center gap-2">
                  <CalendarLucideIcon className="h-4 w-4" />
                  Set Expiry Date
                </Label>
              </div>

              {hasExpiry && (
                <div className="grid gap-2">
                  <Label>Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarLucideIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Visible Columns</h3>
                <div className="grid grid-cols-2 gap-2">
                  {allStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={visibleColumns.includes(status)}
                        onCheckedChange={() => handleStatusToggle(status)}
                      />
                      <Label htmlFor={`status-${status}`}>{status}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Hidden Tasks</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Select sensitive tasks that should be hidden from the public view:
                </p>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 py-1 border-b last:border-0">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={hiddenTasks.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <Label htmlFor={`task-${task.id}`} className="flex items-center gap-2">
                        {hiddenTasks.includes(task.id) ? (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        ) : (
                          <Eye className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs text-gray-500">({task.status})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="flex justify-center mb-4">
                <Button
                  onClick={generateShareableLink}
                  className="flex items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  Generate Shareable Link
                </Button>
              </div>

              {generatedLink && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="share-link">Shareable Link</Label>
                    <div className="flex gap-2">
                      <Input
                        id="share-link"
                        value={generatedLink}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyLinkToClipboard}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Link Settings Summary</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Title:</span> {title}
                      </li>
                      {isPasswordProtected && (
                        <li className="flex items-center gap-2">
                          <Lock className="h-3 w-3 text-amber-500" />
                          <span>Password protected</span>
                        </li>
                      )}
                      {hasExpiry && expiryDate && (
                        <li className="flex items-center gap-2">
                          <CalendarLucideIcon className="h-3 w-3 text-amber-500" />
                          <span>Expires on {format(expiryDate, "MMMM d, yyyy")}</span>
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Visible columns:</span> {visibleColumns.join(', ')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Hidden tasks:</span> {hiddenTasks.length} tasks
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTimeline}>
            Create & Share Timeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTimelineDialog;
