import React, { useState, useEffect } from 'react';
import { TeamEnergyIndicator as TeamEnergyType, Task, Status } from '../types';
import TeamEnergyIndicator from '../components/UI/TeamEnergyIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, BatteryCharging, BatteryWarning, AlertTriangle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format, differenceInDays } from 'date-fns';

interface TeamEnergyPageProps {
  tasks: Task[];
}

const TeamEnergyPage = ({ tasks }: TeamEnergyPageProps) => {
  const [energyData, setEnergyData] = useState<TeamEnergyType>({
    level: 'medium',
    factors: {
      taskLoad: 0,
      wipBreaches: 0,
      stuckTasks: 0,
      reopenedTasks: 0,
    },
    timestamp: new Date().toISOString(),
  });
  
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [historicalData, setHistoricalData] = useState<TeamEnergyType[]>([]);

  // Calculate team energy metrics based on tasks
  useEffect(() => {
    const calculateTeamEnergy = () => {
      // 1. Task Load: Calculate percentage of high-priority and overdue tasks
      const highPriorityTasks = tasks.filter(task => task.priority === 'High').length;
      const overdueTasks = tasks.filter(task => {
        const deadline = new Date(task.deadline);
        return deadline < new Date() && task.status !== 'Done';
      }).length;
      
      const taskLoadPercentage = Math.min(
        Math.round(((highPriorityTasks + overdueTasks) / Math.max(tasks.length, 1)) * 100),
        100
      );
      
      // 2. WIP Breaches: Count tasks in 'In Progress' beyond WIP limits
      // Assuming WIP limit is 5 tasks per status for demonstration
      const wipLimit = 5;
      const tasksInProgress = tasks.filter(task => task.status === 'In Progress').length;
      const wipBreaches = Math.max(0, tasksInProgress - wipLimit);
      
      // 3. Stuck Tasks: Count tasks that haven't moved status in over 7 days
      const stuckTasks = tasks.filter(task => {
        if (task.stuckSince) {
          const stuckDays = differenceInDays(new Date(), new Date(task.stuckSince));
          return stuckDays > 7 && task.status !== 'Done';
        }
        return false;
      }).length;
      
      // 4. Reopened Tasks: Count tasks that have been reopened
      const reopenedTasks = tasks.filter(task => task.reopenCount > 0).length;
      
      // Update energy data
      setEnergyData({
        level: determineEnergyLevel(taskLoadPercentage, wipBreaches, stuckTasks, reopenedTasks),
        factors: {
          taskLoad: taskLoadPercentage,
          wipBreaches,
          stuckTasks,
          reopenedTasks,
        },
        timestamp: new Date().toISOString(),
      });
      
      // For demonstration, generate some historical data
      generateHistoricalData(taskLoadPercentage, wipBreaches, stuckTasks, reopenedTasks);
    };
    
    calculateTeamEnergy();
  }, [tasks]);
  
  // Determine energy level based on factors
  const determineEnergyLevel = (
    taskLoad: number,
    wipBreaches: number,
    stuckTasks: number,
    reopenedTasks: number
  ): 'low' | 'medium' | 'high' | 'critical' => {
    // Calculate weighted score
    const weightedTaskLoad = taskLoad * 0.4; // 40% weight
    const weightedWipBreaches = Math.min(wipBreaches * 10, 100) * 0.25; // 25% weight
    const weightedStuckTasks = Math.min(stuckTasks * 15, 100) * 0.25; // 25% weight
    const weightedReopenedTasks = Math.min(reopenedTasks * 20, 100) * 0.1; // 10% weight
    
    const totalScore = weightedTaskLoad + weightedWipBreaches + weightedStuckTasks + weightedReopenedTasks;
    
    if (totalScore < 30) return 'low';
    if (totalScore < 60) return 'medium';
    if (totalScore < 80) return 'high';
    return 'critical';
  };
  
  // Generate mock historical data for demonstration
  const generateHistoricalData = (
    currentTaskLoad: number,
    currentWipBreaches: number,
    currentStuckTasks: number,
    currentReopenedTasks: number
  ) => {
    const data: TeamEnergyType[] = [];
    const days = timeframe === 'day' ? 14 : timeframe === 'week' ? 8 : 6;
    
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create some variation in the historical data
      const variation = Math.random() * 20 - 10; // -10 to +10
      const taskLoad = Math.max(0, Math.min(100, currentTaskLoad + variation));
      const wipBreaches = Math.max(0, currentWipBreaches + Math.floor(Math.random() * 3 - 1));
      const stuckTasks = Math.max(0, currentStuckTasks + Math.floor(Math.random() * 3 - 1));
      const reopenedTasks = Math.max(0, currentReopenedTasks + Math.floor(Math.random() * 2 - 1));
      
      data.push({
        level: determineEnergyLevel(taskLoad, wipBreaches, stuckTasks, reopenedTasks),
        factors: {
          taskLoad,
          wipBreaches,
          stuckTasks,
          reopenedTasks,
        },
        timestamp: date.toISOString(),
      });
    }
    
    // Add current data point
    data.push(energyData);
    
    setHistoricalData(data);
  };
  
  // Get icon based on risk level
  const getRiskIcon = (level: 'low' | 'medium' | 'high' | 'critical') => {
    switch (level) {
      case 'low':
        return <BatteryCharging className="h-5 w-5 text-green-500" />;
      case 'medium':
        return <Battery className="h-5 w-5 text-yellow-500" />;
      case 'high':
        return <BatteryWarning className="h-5 w-5 text-orange-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };
  
  // Get color based on risk level
  const getRiskColor = (level: 'low' | 'medium' | 'high' | 'critical') => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
    }
  };
  
  // Get label based on risk level
  const getRiskLabel = (level: 'low' | 'medium' | 'high' | 'critical') => {
    switch (level) {
      case 'low':
        return 'Energized';
      case 'medium':
        return 'Moderate Load';
      case 'high':
        return 'High Load';
      case 'critical':
        return 'Critical Load';
    }
  };
  
  // Get insights based on current energy data
  const getInsights = () => {
    const insights = [];
    
    if (energyData.factors.taskLoad > 70) {
      insights.push({
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        text: 'High task load detected. Consider redistributing work or adjusting deadlines.',
        severity: 'high',
      });
    }
    
    if (energyData.factors.wipBreaches > 3) {
      insights.push({
        icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        text: `WIP limit breached by ${energyData.factors.wipBreaches} tasks. Team is taking on too much concurrent work.`,
        severity: 'medium',
      });
    }
    
    if (energyData.factors.stuckTasks > 2) {
      insights.push({
        icon: <Clock className="h-5 w-5 text-red-500" />,
        text: `${energyData.factors.stuckTasks} tasks are stuck for over a week. Immediate attention required.`,
        severity: 'high',
      });
    }
    
    if (energyData.factors.reopenedTasks > 3) {
      insights.push({
        icon: <RefreshCw className="h-5 w-5 text-yellow-500" />,
        text: 'Multiple tasks being reopened. Consider improving requirements gathering.',
        severity: 'medium',
      });
    }
    
    return insights.length > 0 ? insights : [{
      icon: <BatteryCharging className="h-5 w-5 text-green-500" />,
      text: 'Team energy levels are healthy. Keep up the good work!',
      severity: 'low',
    }];
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Energy Indicator */}
        <div className="md:col-span-1">
          <TeamEnergyIndicator energyData={energyData} />
        </div>
        
        {/* Insights Panel */}
        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Team Energy Insights</CardTitle>
            <CardDescription>
              Actionable recommendations based on current metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getInsights().map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                  <div className="mt-0.5">{insight.icon}</div>
                  <p className="text-sm">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Historical Trends */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Historical Trends</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={timeframe === 'day' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeframe('day')}
              >
                Daily
              </Button>
              <Button 
                variant={timeframe === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeframe('week')}
              >
                Weekly
              </Button>
              <Button 
                variant={timeframe === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeframe('month')}
              >
                Monthly
              </Button>
            </div>
          </div>
          <CardDescription>
            Team energy levels over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="energy">
            <TabsList className="mb-4">
              <TabsTrigger value="energy">Overall Energy</TabsTrigger>
              <TabsTrigger value="factors">Individual Factors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="energy">
              <div className="h-64 flex items-end gap-1">
                {historicalData.map((data, index) => {
                  // Calculate score for visualization
                  const score = 
                    data.factors.taskLoad * 0.4 + 
                    Math.min(data.factors.wipBreaches * 10, 100) * 0.25 + 
                    Math.min(data.factors.stuckTasks * 15, 100) * 0.25 + 
                    Math.min(data.factors.reopenedTasks * 20, 100) * 0.1;
                  
                  const height = `${Math.max(10, score)}%`;
                  const isToday = index === historicalData.length - 1;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center"
                    >
                      <div 
                        className={`w-full ${getRiskColor(data.level)} rounded-t-sm ${isToday ? 'ring-2 ring-primary' : ''}`} 
                        style={{ height }}
                        title={`Score: ${Math.round(score)}%`}
                      ></div>
                      <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                        {format(new Date(data.timestamp), timeframe === 'day' ? 'dd' : timeframe === 'week' ? 'MMM dd' : 'MMM')}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
            </TabsContent>
            
            <TabsContent value="factors">
              <div className="space-y-6">
                {/* Task Load Trend */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Task Load</span>
                  </div>
                  <div className="h-8 flex items-center gap-1">
                    {historicalData.map((data, index) => (
                      <div 
                        key={index} 
                        className="flex-1 h-full flex items-end"
                      >
                        <div 
                          className={`w-full ${data.factors.taskLoad > 70 ? 'bg-red-500' : data.factors.taskLoad > 40 ? 'bg-yellow-500' : 'bg-green-500'} rounded-t-sm`} 
                          style={{ height: `${data.factors.taskLoad}%` }}
                          title={`Task Load: ${data.factors.taskLoad}%`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* WIP Breaches Trend */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">WIP Breaches</span>
                  </div>
                  <div className="h-8 flex items-center gap-1">
                    {historicalData.map((data, index) => (
                      <div 
                        key={index} 
                        className="flex-1 h-full flex items-end"
                      >
                        <div 
                          className={`w-full ${data.factors.wipBreaches > 3 ? 'bg-red-500' : data.factors.wipBreaches > 1 ? 'bg-yellow-500' : 'bg-green-500'} rounded-t-sm`} 
                          style={{ height: `${Math.min(data.factors.wipBreaches * 20, 100)}%` }}
                          title={`WIP Breaches: ${data.factors.wipBreaches}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Stuck Tasks Trend */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Stuck Tasks</span>
                  </div>
                  <div className="h-8 flex items-center gap-1">
                    {historicalData.map((data, index) => (
                      <div 
                        key={index} 
                        className="flex-1 h-full flex items-end"
                      >
                        <div 
                          className={`w-full ${data.factors.stuckTasks > 2 ? 'bg-red-500' : data.factors.stuckTasks > 0 ? 'bg-yellow-500' : 'bg-green-500'} rounded-t-sm`} 
                          style={{ height: `${Math.min(data.factors.stuckTasks * 30, 100)}%` }}
                          title={`Stuck Tasks: ${data.factors.stuckTasks}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Reopened Tasks Trend */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Reopened Tasks</span>
                  </div>
                  <div className="h-8 flex items-center gap-1">
                    {historicalData.map((data, index) => (
                      <div 
                        key={index} 
                        className="flex-1 h-full flex items-end"
                      >
                        <div 
                          className={`w-full ${data.factors.reopenedTasks > 3 ? 'bg-red-500' : data.factors.reopenedTasks > 1 ? 'bg-yellow-500' : 'bg-green-500'} rounded-t-sm`} 
                          style={{ height: `${Math.min(data.factors.reopenedTasks * 25, 100)}%` }}
                          title={`Reopened Tasks: ${data.factors.reopenedTasks}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Risk Factors Breakdown */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Risk Factors Breakdown</CardTitle>
          <CardDescription>
            Detailed analysis of team energy components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Load */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm font-medium">Task Load</h3>
                </div>
                <span className={`text-sm font-medium ${
                  energyData.factors.taskLoad > 70 ? 'text-red-500' : 
                  energyData.factors.taskLoad > 40 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {energyData.factors.taskLoad}%
                </span>
              </div>
              <Progress 
                value={energyData.factors.taskLoad} 
                className={
                  energyData.factors.taskLoad > 70 ? 'bg-red-500' : 
                  energyData.factors.taskLoad > 40 ? 'bg-yellow-500' : 
                  'bg-green-500'
                } 
              />
              <p className="text-xs text-gray-500">
                Percentage of high-priority and overdue tasks in the system. 
                Values over 40% indicate increasing pressure.
              </p>
            </div>
            
            {/* WIP Breaches */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm font-medium">WIP Breaches</h3>
                </div>
                <span className={`text-sm font-medium ${
                  energyData.factors.wipBreaches > 3 ? 'text-red-500' : 
                  energyData.factors.wipBreaches > 1 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {energyData.factors.wipBreaches}
                </span>
              </div>
              <Progress 
                value={Math.min(energyData.factors.wipBreaches * 20, 100)} 
                className={
                  energyData.factors.wipBreaches > 3 ? 'bg-red-500' : 
                  energyData.factors.wipBreaches > 1 ? 'bg-yellow-500' : 
                  'bg-green-500'
                } 
              />
              <p className="text-xs text-gray-500">
                Number of tasks exceeding work-in-progress limits. 
                Each breach indicates potential context switching and reduced focus.
              </p>
            </div>
            
            {/* Stuck Tasks */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm font-medium">Stuck Tasks</h3>
                </div>
                <span className={`text-sm font-medium ${
                  energyData.factors.stuckTasks > 2 ? 'text-red-500' : 
                  energyData.factors.stuckTasks > 0 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {energyData.factors.stuckTasks}
                </span>
              </div>
              <Progress 
                value={Math.min(energyData.factors.stuckTasks * 30, 100)} 
                className={
                  energyData.factors.stuckTasks > 2 ? 'bg-red-500' : 
                  energyData.factors.stuckTasks > 0 ? 'bg-yellow-500' : 
                  'bg-green-500'
                } 
              />
              <p className="text-xs text-gray-500">
                Tasks that haven't moved status in over 7 days. 
                Stuck tasks often indicate blockers or unclear requirements.
              </p>
            </div>
            
            {/* Reopened Tasks */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm font-medium">Reopened Tasks</h3>
                </div>
                <span className={`text-sm font-medium ${
                  energyData.factors.reopenedTasks > 3 ? 'text-red-500' : 
                  energyData.factors.reopenedTasks > 1 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {energyData.factors.reopenedTasks}
                </span>
              </div>
              <Progress 
                value={Math.min(energyData.factors.reopenedTasks * 25, 100)} 
                className={
                  energyData.factors.reopenedTasks > 3 ? 'bg-red-500' : 
                  energyData.factors.reopenedTasks > 1 ? 'bg-yellow-500' : 
                  'bg-green-500'
                } 
              />
              <p className="text-xs text-gray-500">
                Number of tasks that have been reopened after being marked complete. 
                Frequent reopens suggest quality issues or changing requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamEnergyPage;
