import React, { useMemo } from "react";
import { Task, QuarterSummary, ProjectStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quarters } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface TimelineOverviewProps {
  tasks: Task[];
  currentQuarter: string;
}

const TimelineOverview = ({ tasks, currentQuarter }: TimelineOverviewProps) => {
  const quarterSummaries = useMemo(() => {
    const summaries: QuarterSummary[] = quarters.map((quarter) => {
      return {
        name: quarter.name,
        totalTasks: 0,
        byStatus: {
          Planned: 0,
          Ongoing: 0,
          Done: 0,
        },
        overdueTasks: 0,
        nearDeadline: 0,
      };
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    tasks.forEach((task) => {
      const taskDate = new Date(task.deadline);
      const taskQuarter = quarters.find(
        (q) =>
          taskDate.getMonth() >= q.startMonth && taskDate.getMonth() <= q.endMonth
      );

      if (taskQuarter) {
        const quarterIndex = quarters.findIndex((q) => q.name === taskQuarter.name);
        if (quarterIndex >= 0) {
          // Increment total tasks for this quarter
          summaries[quarterIndex].totalTasks++;
          
          // Increment by status
          summaries[quarterIndex].byStatus[task.projectStatus]++;
          
          // Check if overdue
          if (taskDate < now && task.projectStatus !== "Done") {
            summaries[quarterIndex].overdueTasks++;
          }
          
          // Check if near deadline (within 7 days)
          const daysToDeadline = differenceInDays(taskDate, now);
          if (daysToDeadline >= 0 && daysToDeadline <= 7 && task.projectStatus !== "Done") {
            summaries[quarterIndex].nearDeadline++;
          }
        }
      }
    });

    return summaries;
  }, [tasks]);

  const currentQuarterSummary = quarterSummaries.find(
    (summary) => summary.name === currentQuarter
  );

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "Planned":
        return "text-blue-600 dark:text-blue-400";
      case "Ongoing":
        return "text-amber-600 dark:text-amber-400";
      case "Done":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusBgColor = (status: ProjectStatus) => {
    switch (status) {
      case "Planned":
        return "bg-blue-600 dark:bg-blue-400";
      case "Ongoing":
        return "bg-amber-600 dark:bg-amber-400";
      case "Done":
        return "bg-green-600 dark:bg-green-400";
      default:
        return "bg-gray-600 dark:bg-gray-400";
    }
  };

  if (!currentQuarterSummary) {
    return null;
  }

  const totalTasks = currentQuarterSummary.totalTasks;
  const calculatePercentage = (count: number) => 
    totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{currentQuarter} Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Total Tasks: {currentQuarterSummary.totalTasks}</span>
          {currentQuarterSummary.overdueTasks > 0 && (
            <span className="text-red-500 dark:text-red-400">
              Overdue: {currentQuarterSummary.overdueTasks}
            </span>
          )}
          {currentQuarterSummary.nearDeadline > 0 && (
            <span className="text-amber-500 dark:text-amber-400">
              Due Soon: {currentQuarterSummary.nearDeadline}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {Object.entries(currentQuarterSummary.byStatus).map(([status, count]) => (
            <div key={status} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={getStatusColor(status as ProjectStatus)}>
                  {status}
                </span>
                <span>
                  {count} ({calculatePercentage(count)}%)
                </span>
              </div>
              <Progress 
                value={calculatePercentage(count)} 
                className={cn("h-2", getStatusBgColor(status as ProjectStatus))}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {quarters.map((quarter) => {
            const summary = quarterSummaries.find((s) => s.name === quarter.name);
            const isCurrentQuarter = quarter.name === currentQuarter;
            
            return (
              <div 
                key={quarter.name}
                className={`text-center p-2 rounded-md border ${
                  isCurrentQuarter 
                    ? "border-primary bg-primary/10" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="font-medium">{quarter.name}</div>
                <div className="text-sm">{summary?.totalTasks || 0} tasks</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineOverview;
