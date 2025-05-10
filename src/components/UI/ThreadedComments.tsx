import React, { useState, useRef, useEffect } from 'react';
import { ThreadedComment, User, ActivityLogEntry } from '../../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import ProfileBadge from './ProfileBadge';
import { Reply, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThreadedCommentsProps {
  comments: ThreadedComment[];
  taskId: string;
  currentUser: User;
  activityLog?: ActivityLogEntry[];
  onAddComment: (comment: ThreadedComment) => void;
  onAddReply: (parentId: string, reply: ThreadedComment) => void;
}

export const ThreadedComments = ({
  comments,
  taskId,
  currentUser,
  activityLog = [],
  onAddComment,
  onAddReply,
}: ThreadedCommentsProps) => {
  // Local state to manage comments for immediate display
  const [localComments, setLocalComments] = useState<ThreadedComment[]>(comments);
  
  // Force update state to track component lifecycle
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Increment force update after component mounts
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, []);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize local comments with props, but skip the first render
  useEffect(() => {
    // Skip the first render to avoid overriding local state
    if (forceUpdate > 0) {
      // Make a deep copy to ensure we have a new reference
      setLocalComments([...comments]);
    }
  }, [comments, forceUpdate]);
  
  // Debug: log when comments change
  useEffect(() => {
    console.log('Local comments updated:', localComments);
    
    // Scroll to the bottom of comments when new comments are added
    if (localComments.length > 0 && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localComments]);
  
  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    
    const comment: ThreadedComment = {
      id: uuidv4(),
      taskId,
      content: newComment,
      timestamp: new Date().toISOString(),
      user: currentUser,
      replies: [],
    };
    
    // Create a completely new array for localComments
    // This is crucial for the first comment to trigger a re-render
    const brandNewArray = Array.isArray(localComments) ? [...localComments] : [];
    brandNewArray.push(comment);
    
    // Set the local state with the new array
    setLocalComments(brandNewArray);
    
    // Add the comment to the task (global state)
    onAddComment(comment);
    setNewComment('');
    
    // Log for debugging
    console.log('Comment added locally:', brandNewArray);
    
    // Force scroll to bottom after a short delay to ensure DOM has updated
    setTimeout(() => {
      if (commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleAddReply = (parentId: string) => {
    if (replyContent.trim() === '') return;
    
    const reply: ThreadedComment = {
      id: uuidv4(),
      taskId,
      content: replyContent,
      timestamp: new Date().toISOString(),
      user: currentUser,
      replies: [],
    };
    
    // Create a new array with the updated comments to ensure state update triggers
    const updatedComments = localComments.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    );
    
    // Update local state immediately for instant feedback
    setLocalComments(updatedComments);
    
    onAddReply(parentId, reply);
    setReplyingTo(null);
    setReplyContent('');
    
    // Force scroll to bottom after a short delay to ensure DOM has updated
    setTimeout(() => {
      if (commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleStartReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };
  
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };
  
  const renderComment = (comment: ThreadedComment, isReply = false) => (
    <div key={comment.id} className={`p-3 ${isReply ? 'ml-6 border-l-2 pl-4 border-gray-200 dark:border-gray-700' : 'border-b border-gray-200 dark:border-gray-700'}`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <ProfileBadge user={comment.user} size="sm" showTooltip={true} />
          <span className="font-medium text-sm">{comment.user.name}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-500 hover:underline cursor-help">
                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{format(new Date(comment.timestamp), "MMM d, yyyy 'at' h:mm a")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="text-sm my-2 whitespace-pre-wrap">{comment.content}</div>
      
      {!isReply && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => handleStartReply(comment.id)}
          >
            <Reply className="h-3 w-3" />
            Reply
          </Button>
        </div>
      )}
      
      {replyingTo === comment.id && (
        <div className="mt-2 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
          <Textarea
            placeholder="Add a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[80px] text-sm mb-2"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelReply}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => handleAddReply(comment.id)}>
              Reply
            </Button>
          </div>
        </div>
      )}
      
      {comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );
  
  const renderActivityItem = (entry: ActivityLogEntry) => {
    const getActivityIcon = () => {
      switch (entry.type) {
        case 'comment':
          return <MessageSquare className="h-4 w-4 text-blue-500" />;
        case 'status_change':
          return <AlertCircle className="h-4 w-4 text-amber-500" />;
        default:
          return null;
      }
    };
    
    return (
      <div key={entry.id} className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            {getActivityIcon()}
            <div>
              <div className="flex items-center gap-2">
                <ProfileBadge user={entry.user} size="sm" showTooltip={true} />
                <span className="font-medium text-sm">{entry.user.name}</span>
                {entry.type === 'micro_update' && (
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    Micro Update
                  </Badge>
                )}
              </div>
              {entry.type === 'status_change' && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Changed status from <span className="font-medium">{entry.previousValue}</span> to <span className="font-medium">{entry.newValue}</span>
                </div>
              )}
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-500 hover:underline cursor-help">
                  {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {entry.comment && (
          <div className="text-sm my-2 pl-6 whitespace-pre-wrap">{entry.comment}</div>
        )}
      </div>
    );
  };
  
  // Combine and sort comments and activity log entries by timestamp (newest first)
  const combinedActivities = [...activityLog.filter(entry => 
    entry.type === 'comment' || entry.type === 'status_change'
  )].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return (
    <div className="threaded-comments">
      <h3 className="font-semibold mb-3">Comments & Updates</h3>
      
      <div className="mb-4">
        <Textarea
          placeholder="Add a detailed comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end mt-2">
          <Button 
            onClick={handleAddComment}
            disabled={newComment.trim() === ''}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Add Comment
          </Button>
        </div>
      </div>
      
      <div className="comments-section">
        <h4 className="text-sm font-medium mb-2">Comments</h4>
        <ScrollArea 
          className="h-[300px] pr-2" 
          type="always" 
          scrollHideDelay={100}
          style={{ scrollBehavior: 'smooth' }}
          ref={scrollAreaRef}
        >
          <div className="space-y-2 pb-12"> {/* Increased bottom padding to ensure last comment's Reply button is visible */}
            {localComments.length > 0 ? (
              <>
                {localComments.map(comment => renderComment(comment))}
              </>
            ) : (
              <div className="text-center p-4 text-gray-500">
                No comments yet. Be the first to add a comment!
              </div>
            )}
            <div ref={commentsEndRef} /> {/* Invisible element to scroll to */}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ThreadedComments;
