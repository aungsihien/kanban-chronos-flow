import React, { useState } from 'react';
import { ThreadedComment, User } from '../../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import ProfileBadge from './ProfileBadge';
import { Reply, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ThreadedCommentsProps {
  comments: ThreadedComment[];
  taskId: string;
  currentUser: User;
  onAddComment: (comment: ThreadedComment) => void;
  onAddReply: (parentId: string, reply: ThreadedComment) => void;
}

export const ThreadedComments = ({
  comments,
  taskId,
  currentUser,
  onAddComment,
  onAddReply,
}: ThreadedCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
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
    
    onAddComment(comment);
    setNewComment('');
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
    
    onAddReply(parentId, reply);
    setReplyingTo(null);
    setReplyContent('');
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
    <div key={comment.id} className={`p-3 ${isReply ? 'ml-6 border-l-2 pl-4' : 'border-b'}`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <ProfileBadge user={comment.user} size="sm" showTooltip={true} />
          <span className="font-medium text-sm">{comment.user.name}</span>
        </div>
        <span className="text-xs text-gray-500">
          {format(new Date(comment.timestamp), "MMM d, h:mm a")}
        </span>
      </div>
      
      <div className="text-sm my-2">{comment.content}</div>
      
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
        <div className="mt-2 pl-6 border-l-2">
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
  
  return (
    <div className="threaded-comments">
      <h3 className="font-semibold mb-3">Comments & Updates</h3>
      
      <div className="mb-4">
        <Textarea
          placeholder="Add a comment or update..."
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
      
      <ScrollArea className="h-[300px]">
        {comments.length > 0 ? (
          <div className="space-y-1">
            {comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">
            No comments yet. Be the first to add a comment!
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ThreadedComments;
