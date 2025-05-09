import React from 'react';
import { TimeIntelligenceAlert, Task, User } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, differenceInDays } from 'date-fns';
import { AlertCircle, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeIntelligenceAlertsProps {
  alerts: TimeIntelligenceAlert[];
  tasks: Task[];
  currentUser: User;
  onAcknowledgeAlert: (alertId: string, user: User) => void;
}

export const TimeIntelligenceAlerts = ({
  alerts,
  tasks,
  currentUser,
  onAcknowledgeAlert,
}: TimeIntelligenceAlertsProps) => {
  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  
  const getAlertIcon = (type: TimeIntelligenceAlert['type']) => {
    switch (type) {
      case 'stuck':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'deadline_approaching':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'frequent_reopens':
        return <RefreshCw className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  const getAlertTitle = (type: TimeIntelligenceAlert['type']) => {
    switch (type) {
      case 'stuck':
        return 'Task Stuck';
      case 'deadline_approaching':
        return 'Deadline Approaching';
      case 'frequent_reopens':
        return 'Frequently Reopened';
      default:
        return 'Alert';
    }
  };
  
  const getAlertVariant = (severity: TimeIntelligenceAlert['severity']) => {
    return severity === 'critical' ? 'destructive' : 'default';
  };
  
  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };
  
  const handleAcknowledge = (alertId: string) => {
    onAcknowledgeAlert(alertId, currentUser);
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Time Intelligence Alerts
        </CardTitle>
        <CardDescription>
          {activeAlerts.length} active alerts requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const task = getTaskById(alert.taskId);
                if (!task) return null;
                
                return (
                  <Alert key={alert.id} variant={getAlertVariant(alert.severity)}>
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <AlertTitle className="flex justify-between items-center">
                          <span>{getAlertTitle(alert.type)}</span>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                            {alert.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription>
                          <div className="mt-1 mb-2">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm">
                              {alert.message}
                            </div>
                            <div className="text-xs mt-1">
                              {alert.type === 'stuck' && (
                                <span>
                                  Stuck in {task.status} for {differenceInDays(new Date(), new Date(task.stuckSince || task.updatedAt))} days
                                </span>
                              )}
                              {alert.type === 'deadline_approaching' && (
                                <span>
                                  Deadline: {format(new Date(task.deadline), "MMM d, yyyy")} ({differenceInDays(new Date(task.deadline), new Date())} days left)
                                </span>
                              )}
                              {alert.type === 'frequent_reopens' && (
                                <span>
                                  Reopened {task.reopenCount} times
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs flex items-center gap-1"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Acknowledge
                            </Button>
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No active alerts. All tasks are on track!
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Alerts are automatically generated based on task status, deadlines, and history.
      </CardFooter>
    </Card>
  );
};

export default TimeIntelligenceAlerts;
