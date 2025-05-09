import React, { useState } from 'react';
import { Task, User } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import ProfileBadge from '../UI/ProfileBadge';
import { Button } from '@/components/ui/button';

interface VerticalTimelineProps {
  tasks: Task[];
  users: User[];
}

const VerticalTimeline = ({ tasks, users }: VerticalTimelineProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'requirements': true,
    'design': true,
    'development': true,
    'testing': true,
    'promotion': true,
  });
  const [showNotes, setShowNotes] = useState(true);

  // Group tasks by section (using scope or tags)
  const tasksBySection = {
    'requirements': tasks.filter(task => 
      task.scope?.toLowerCase().includes('requirement') || 
      task.tags.includes('Research')),
    'design': tasks.filter(task => 
      task.scope?.toLowerCase().includes('design') || 
      task.tags.includes('Design')),
    'development': tasks.filter(task => 
      task.scope?.toLowerCase().includes('development') || 
      task.tags.includes('Feature')),
    'testing': tasks.filter(task => 
      task.scope?.toLowerCase().includes('testing') || 
      task.tags.includes('Testing')),
    'promotion': tasks.filter(task => 
      task.scope?.toLowerCase().includes('promotion') || 
      task.title.toLowerCase().includes('release')),
  };

  // Format dates to match requirements (November 2020 with weekly intervals)
  const formatDateHeader = (date: Date) => {
    return format(date, 'MMMM yyyy');
  };

  const formatWeek = (date: Date) => {
    return format(date, "'Week of' MMM d");
  };

  // Get weeks for a month (simplified for demonstration)
  const getWeeksInNovember = () => {
    // Mocked weeks for November 2020
    return [
      new Date(2020, 10, 1), // Nov 1
      new Date(2020, 10, 8), // Nov 8
      new Date(2020, 10, 15), // Nov 15
      new Date(2020, 10, 22), // Nov 22
      new Date(2020, 10, 29), // Nov 29
    ];
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleNotes = () => {
    setShowNotes(prev => !prev);
  };

  // Helper to find the most likely assignee for a task section
  const getSectionAssignee = (sectionName: string) => {
    const sectionTasks = tasksBySection[sectionName as keyof typeof tasksBySection];
    if (!sectionTasks || sectionTasks.length === 0) return null;
    
    // Find most common assignee
    const assigneeCounts: Record<string, number> = {};
    sectionTasks.forEach(task => {
      if (task.assignee) {
        const id = task.assignee.id;
        assigneeCounts[id] = (assigneeCounts[id] || 0) + 1;
      }
    });
    
    // Get the most frequent assignee
    let maxCount = 0;
    let maxAssigneeId = '';
    
    Object.entries(assigneeCounts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxAssigneeId = id;
      }
    });
    
    return users.find(user => user.id === maxAssigneeId) || null;
  };

  // Simple mapping of section names to user names from the example
  const sectionAssigneeMapping: Record<string, string> = {
    'requirements': 'Maria Rodriguez',
    'design': 'Katelyn Taylor',
    'development': 'James Wilson',
    'testing': 'Sarah Johnson',
    'promotion': 'Michael Chen'
  };

  // Notes for the sidebar
  const sectionNotes: Record<string, string[]> = {
    'requirements': [
      'Establish key features',
      'Get stakeholder feedback',
      'Document requirements'
    ],
    'design': [
      'Gather inspiration',
      'Wireframe pages',
      'Design mockups'
    ],
    'development': [
      'Set up environment',
      'Implement core features',
      'Code review'
    ],
    'testing': [
      'Unit testing',
      'Integration testing',
      'User acceptance'
    ],
    'promotion': [
      'Prepare marketing materials',
      'Social media announcements',
      'Blog post'
    ]
  };

  // Section titles using proper capitalization
  const sectionTitles: Record<string, string> = {
    'requirements': 'Establish Requirements',
    'design': 'Design & Wireframes',
    'development': 'Development',
    'testing': 'Testing & QA',
    'promotion': 'Promotion & Launch'
  };

  return (
    <div className="p-4 w-full max-w-6xl mx-auto relative min-h-[600px]">
      <h1 className="text-2xl font-bold mb-6">Project Timeline</h1>
      
      {/* Main timeline container */}
      <div className="flex">
        {/* Left column - Tasks */}
        <div className="w-1/3 pr-6">
          <h2 className="font-bold text-lg mb-4">## Tasks</h2>
          
          {Object.entries(tasksBySection).map(([section, sectionTasks]) => (
            <div key={section} className="mb-6">
              <div 
                className="flex items-center cursor-pointer mb-2" 
                onClick={() => toggleSection(section)}
              >
                {expandedSections[section] ? 
                  <ChevronDown className="h-4 w-4 mr-1" /> : 
                  <ChevronRight className="h-4 w-4 mr-1" />
                }
                <h3 className="font-bold">### {sectionTitles[section]}</h3>
              </div>
              
              {expandedSections[section] && (
                <ul className="list-disc pl-6 space-y-1">
                  {sectionTasks.length > 0 ? (
                    sectionTasks.map(task => (
                      <li key={task.id} className="text-sm">{task.title}</li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">• {sectionTitles[section]}</li>
                  )}
                </ul>
              )}
              
              <div className="border-b border-gray-200 my-3"></div>
            </div>
          ))}
        </div>
        
        {/* Middle column - Dates */}
        <div className="w-1/3 px-4">
          <h2 className="font-bold text-lg mb-4">## Dates</h2>
          
          <div className="mb-3">
            <h3 className="font-semibold mb-2">November 2020</h3>
            
            {getWeeksInNovember().map((week, index) => (
              <div key={index} className="mb-3">
                <p className="text-sm text-right">{format(week, "d")}</p>
                {index < getWeeksInNovember().length - 1 && (
                  <div className="border-b border-gray-200 my-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Right column - Assignees */}
        <div className="w-1/3 pl-6">
          <h2 className="font-bold text-lg mb-4">## Assignees</h2>
          
          {Object.entries(tasksBySection).map(([section, _]) => {
            // Find user that matches the name in mapping
            const mappedName = sectionAssigneeMapping[section];
            const assignee = users.find(u => u.name === mappedName) || 
                           getSectionAssignee(section) ||
                           {
                             id: section,
                             name: mappedName || 'Unassigned',
                             initials: (mappedName || 'UA').split(' ').map(n => n[0]).join(''),
                             color: '#888888',
                             email: '',
                             role: ''
                           };
            
            return (
              <div key={section} className="mb-4">
                <div className="flex items-center justify-end">
                  <span 
                    className="text-sm mr-2"
                    style={{ color: assignee.color }}
                  >
                    {assignee.name}
                  </span>
                  {assignee.id && (
                    <ProfileBadge user={assignee} size="sm" showTooltip={true} />
                  )}
                </div>
                
                {/* Add space to align with task timeline */}
                <div className="h-4 mb-3"></div>
                <div className="border-b border-gray-200 my-1"></div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Floating sidebar for notes */}
      {showNotes && (
        <div className="absolute right-4 top-16 w-64 bg-gray-50 p-4 rounded-md shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">### Notes</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotes}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm">
            {Object.entries(sectionNotes).map(([section, notes], idx) => (
              <div key={section} className={idx !== 0 ? "mt-2" : ""}>
                <p className="font-medium">{sectionTitles[section]}:</p>
                <ul className="list-disc pl-4">
                  {notes.map((note, i) => (
                    <li key={i} className="text-xs">{note}</li>
                  ))}
                </ul>
                {idx < Object.entries(sectionNotes).length - 1 && (
                  <div className="border-b border-gray-200 my-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Show notes button (when hidden) */}
      {!showNotes && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleNotes}
          className="absolute right-4 top-16"
        >
          Show Notes
        </Button>
      )}
    </div>
  );
};

export default VerticalTimeline;
