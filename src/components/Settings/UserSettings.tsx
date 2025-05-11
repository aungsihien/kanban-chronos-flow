import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash2, User, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUsers } from '@/data/mockData';
import { User as UserType, Role } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserSettingsProps {
  isCreating: boolean;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
}

// Mock data for roles (would typically come from API or context)
const roles: Role[] = [
  'Product Owner',
  'Product Manager',
  'Developer',
  'Tester',
  'Designer',
  'Stakeholder'
];

const UserSettings: React.FC<UserSettingsProps> = ({ isCreating, setIsCreating }) => {
  const [users, setUsers] = useState<UserType[]>([]);

  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Developer');
  // isCreating and setIsCreating are now passed as props
  const { toast } = useToast();

  // Load mock users on component mount
  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  // Use all users directly
  const filteredUsers = users;

  const handleCreateUser = () => {
    setIsCreating(true);
    setEditingUser(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Developer');
  };

  const handleEditUser = (user: UserType) => {
    setIsCreating(false);
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "The user has been successfully deleted.",
      duration: 3000,
    });
  };

  const handleSaveUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isCreating) {
      // Create new user
      const initials = newUserName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();

      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      
      const newUser: UserType = {
        id: uuidv4(),
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        initials,
        color: randomColor
      };
      
      setUsers([...users, newUser]);
      toast({
        title: "User Created",
        description: `New user "${newUserName}" has been created.`,
        duration: 3000,
      });
    } else if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              name: newUserName, 
              email: newUserEmail, 
              role: newUserRole 
            }
          : user
      ));
      toast({
        title: "User Updated",
        description: `User "${newUserName}" has been updated.`,
        duration: 3000,
      });
    }

    // Reset form
    setIsCreating(false);
    setEditingUser(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Developer');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingUser(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Developer');
  };

  return (
    <div className="space-y-4">

      {/* User Form */}
      {(isCreating || editingUser) && (
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 space-y-3">
          <h3 className="text-sm font-medium">
            {isCreating ? 'Create New User' : 'Edit User'}
          </h3>
          <div className="space-y-2">
            <Label htmlFor="user-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="user-name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g., John Doe"
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="e.g., john@example.com"
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select 
              value={newUserRole} 
              onValueChange={(value: string) => setNewUserRole(value as Role)}
            >
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveUser}>
              {isCreating ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="space-y-2 mt-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: user.color }}>
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-medium">{user.name}</h4>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => handleEditUser(user)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No users found
            </div>
          )}
      </div>
    </div>
  );
};

export default UserSettings;
