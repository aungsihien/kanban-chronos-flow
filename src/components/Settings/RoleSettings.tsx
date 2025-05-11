import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface RoleSettingsProps {
  isCreating: boolean;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
}

// Mock data for roles
const initialRoles: Role[] = [
  {
    id: '1',
    name: 'Product Owner',
    permissions: ['create_task', 'edit_task', 'delete_task', 'manage_users', 'manage_roles', 'manage_tags']
  },
  {
    id: '2',
    name: 'Product Manager',
    permissions: ['create_task', 'edit_task', 'delete_task', 'manage_tags']
  },
  {
    id: '3',
    name: 'Developer',
    permissions: ['create_task', 'edit_task']
  },
  {
    id: '4',
    name: 'Tester',
    permissions: ['create_task', 'edit_task']
  }
];

// Available permissions
const availablePermissions = [
  { id: 'create_task', label: 'Create Tasks' },
  { id: 'edit_task', label: 'Edit Tasks' },
  { id: 'delete_task', label: 'Delete Tasks' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'manage_roles', label: 'Manage Roles' },
  { id: 'manage_tags', label: 'Manage Tags' }
];

const RoleSettings: React.FC<RoleSettingsProps> = ({ isCreating, setIsCreating }) => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  // isCreating and setIsCreating are now passed as props
  const { toast } = useToast();

  // Use all roles directly
  const filteredRoles = roles;

  const handleCreateRole = () => {
    setIsCreating(true);
    setEditingRole(null);
    setNewRoleName('');
    setSelectedPermissions([]);
  };

  const handleEditRole = (role: Role) => {
    setIsCreating(false);
    setEditingRole(role);
    setNewRoleName(role.name);
    setSelectedPermissions([...role.permissions]);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
    toast({
      title: "Role Deleted",
      description: "The role has been successfully deleted.",
      duration: 3000,
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleSaveRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name cannot be empty.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isCreating) {
      // Create new role
      const newRole: Role = {
        id: uuidv4(),
        name: newRoleName,
        permissions: selectedPermissions
      };
      setRoles([...roles, newRole]);
      toast({
        title: "Role Created",
        description: `New role "${newRoleName}" has been created.`,
        duration: 3000,
      });
    } else if (editingRole) {
      // Update existing role
      setRoles(roles.map(role => 
        role.id === editingRole.id 
          ? { ...role, name: newRoleName, permissions: selectedPermissions }
          : role
      ));
      toast({
        title: "Role Updated",
        description: `Role "${newRoleName}" has been updated.`,
        duration: 3000,
      });
    }

    // Reset form
    setIsCreating(false);
    setEditingRole(null);
    setNewRoleName('');
    setSelectedPermissions([]);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingRole(null);
    setNewRoleName('');
    setSelectedPermissions([]);
  };

  return (
    <div className="space-y-4">

      {/* Role Form */}
      {(isCreating || editingRole) && (
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 space-y-3">
          <h3 className="text-sm font-medium">
            {isCreating ? 'Create New Role' : 'Edit Role'}
          </h3>
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., Product Manager"
            />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission.id, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`permission-${permission.id}`}
                    className="text-xs cursor-pointer"
                  >
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveRole}>
              {isCreating ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      )}

      {/* Role List */}
      <div className="space-y-2 mt-4">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
              <div 
                key={role.id} 
                className="flex items-center justify-between p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div>
                  <h4 className="text-sm font-medium">{role.name}</h4>
                  <p className="text-xs text-gray-500">
                    {role.permissions.length} permissions
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => handleEditRole(role)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" 
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No roles found
            </div>
          )}
      </div>
    </div>
  );
};

export default RoleSettings;
