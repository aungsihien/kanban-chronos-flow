import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash2, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSettingsProps {
  isCreating: boolean;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
}

// Mock data for tags
const initialTags: Tag[] = [
  { id: '1', name: 'Urgent', color: '#ef4444' },
  { id: '2', name: 'Backlog', color: '#3b82f6' },
  { id: '3', name: 'Feature', color: '#10b981' },
  { id: '4', name: 'Bug', color: '#f97316' },
  { id: '5', name: 'Research', color: '#8b5cf6' },
  { id: '6', name: 'Design', color: '#ec4899' },
  { id: '7', name: 'Testing', color: '#6366f1' }
];

// Predefined colors for the color picker
const colorOptions = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#6b7280', // gray
  '#000000', // black
];

const TagSettings: React.FC<TagSettingsProps> = ({ isCreating, setIsCreating }) => {
  const [tags, setTags] = useState<Tag[]>(initialTags);

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  // isCreating and setIsCreating are now passed as props
  const { toast } = useToast();

  // Use all tags directly
  const filteredTags = tags;

  const handleCreateTag = () => {
    setIsCreating(true);
    setEditingTag(null);
    setNewTagName('');
    setSelectedColor('#3b82f6');
  };

  const handleEditTag = (tag: Tag) => {
    setIsCreating(false);
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
    toast({
      title: "Tag Deleted",
      description: "The tag has been successfully deleted.",
      duration: 3000,
    });
  };

  const handleSaveTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isCreating) {
      // Create new tag
      const newTag: Tag = {
        id: uuidv4(),
        name: newTagName,
        color: selectedColor
      };
      setTags([...tags, newTag]);
      toast({
        title: "Tag Created",
        description: `New tag "${newTagName}" has been created.`,
        duration: 3000,
      });
    } else if (editingTag) {
      // Update existing tag
      setTags(tags.map(tag => 
        tag.id === editingTag.id 
          ? { ...tag, name: newTagName, color: selectedColor }
          : tag
      ));
      toast({
        title: "Tag Updated",
        description: `Tag "${newTagName}" has been updated.`,
        duration: 3000,
      });
    }

    // Reset form
    setIsCreating(false);
    setEditingTag(null);
    setNewTagName('');
    setSelectedColor('#3b82f6');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTag(null);
    setNewTagName('');
    setSelectedColor('#3b82f6');
  };

  return (
    <div className="space-y-4">

      {/* Tag Form */}
      {(isCreating || editingTag) && (
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 space-y-3">
          <h3 className="text-sm font-medium">
            {isCreating ? 'Create New Tag' : 'Edit Tag'}
          </h3>
          <div className="space-y-2">
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g., Feature"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag-color">Tag Color</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    style={{ borderLeftColor: selectedColor, borderLeftWidth: '4px' }}
                  >
                    <div 
                      className="h-4 w-4 rounded-full mr-2" 
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span>{selectedColor}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className="h-8 w-8 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveTag}>
              {isCreating ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      )}

      {/* Tag List */}
      <div className="space-y-2 mt-4">
        {filteredTags.length > 0 ? (
          filteredTags.map((tag) => (
              <div 
                key={tag.id} 
                className="flex items-center justify-between p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderLeftColor: tag.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm font-medium">{tag.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => handleEditTag(tag)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" 
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No tags found
            </div>
          )}
      </div>
    </div>
  );
};

export default TagSettings;
