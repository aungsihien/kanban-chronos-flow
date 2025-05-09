import React, { useState } from "react";
import { Status, Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TaskMoveConfirmationProps {
  task: Task | null;
  fromStatus: Status | null;
  toStatus: Status | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (taskId: string, newStatus: Status, comment: string) => void;
}

const TaskMoveConfirmation = ({
  task,
  fromStatus,
  toStatus,
  open,
  onOpenChange,
  onConfirm,
}: TaskMoveConfirmationProps) => {
  const [comment, setComment] = useState("");

  if (!task || !fromStatus || !toStatus) return null;

  const handleConfirm = () => {
    onConfirm(task.id, toStatus, comment);
    setComment("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Task Move</DialogTitle>
          <DialogDescription>
            You are about to move "{task.title}" from {fromStatus} to {toStatus}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Add a comment (optional)</p>
            <Textarea
              placeholder="Why are you moving this task?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskMoveConfirmation;
