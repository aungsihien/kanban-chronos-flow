import React from 'react';
import { TeamEnergyIndicator as TeamEnergyType } from '../../types';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, BatteryCharging, BatteryWarning, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface TeamEnergyIndicatorProps {
  energyData: TeamEnergyType;
}

export const TeamEnergyIndicator = ({ energyData }: TeamEnergyIndicatorProps) => {
  // Calculate overall score (0-100)
  const calculateOverallScore = () => {
    const { taskLoad, wipBreaches, stuckTasks, reopenedTasks } = energyData.factors;
    
    // Weighted calculation
    // Lower is better for all these metrics
    const weightedTaskLoad = taskLoad * 0.4; // 40% weight
    const weightedWipBreaches = Math.min(wipBreaches * 10, 100) * 0.25; // 25% weight
    const weightedStuckTasks = Math.min(stuckTasks * 15, 100) * 0.25; // 25% weight
    const weightedReopenedTasks = Math.min(reopenedTasks * 20, 100) * 0.1; // 10% weight
    
    const total = weightedTaskLoad + weightedWipBreaches + weightedStuckTasks + weightedReopenedTasks;
    return Math.min(total, 100);
  };
  
  const score = calculateOverallScore();
  
  const getEnergyColor = () => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getEnergyIcon = () => {
    if (score < 30) return <BatteryCharging className="h-5 w-5 text-green-500" />;
    if (score < 60) return <Battery className="h-5 w-5 text-yellow-500" />;
    if (score < 80) return <BatteryWarning className="h-5 w-5 text-orange-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };
  
  const getEnergyLabel = () => {
    if (score < 30) return 'Energized';
    if (score < 60) return 'Moderate Load';
    if (score < 80) return 'High Load';
    return 'Critical Load';
  };
  
  const getFactorLabel = (factor: keyof TeamEnergyType['factors']) => {
    switch (factor) {
      case 'taskLoad':
        return 'Task Load';
      case 'wipBreaches':
        return 'WIP Limit Breaches';
      case 'stuckTasks':
        return 'Stuck Tasks';
      case 'reopenedTasks':
        return 'Reopened Tasks';
      default:
        return factor;
    }
  };
  
  const getFactorValue = (factor: keyof TeamEnergyType['factors']) => {
    const value = energyData.factors[factor];
    switch (factor) {
      case 'taskLoad':
        return `${value}%`;
      default:
        return value.toString();
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Team Energy</CardTitle>
          {getEnergyIcon()}
        </div>
        <CardDescription>
          Last updated: {format(new Date(energyData.timestamp), "MMM d, h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{getEnergyLabel()}</span>
            <span className="text-sm">{Math.round(score)}%</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Progress value={score} className={getEnergyColor()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Team energy level: {Math.round(score)}%</p>
                <p>Higher values indicate higher team fatigue</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-3">
          {(Object.keys(energyData.factors) as Array<keyof TeamEnergyType['factors']>).map(factor => (
            <div key={factor} className="grid grid-cols-3 text-sm">
              <span className="col-span-2">{getFactorLabel(factor)}:</span>
              <span className="text-right font-medium">{getFactorValue(factor)}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <p className="text-xs text-gray-500">
          Based on task movements, WIP breaches, and stuck tasks
        </p>
      </CardFooter>
    </Card>
  );
};

export default TeamEnergyIndicator;
