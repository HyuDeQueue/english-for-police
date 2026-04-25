import React, { useState } from "react";
import type { Unit, UserProgress, FlaggedItem, DailyTask } from "../../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Flag,
  Zap,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

interface HomeViewProps {
  lessons: Unit[];
  progress: UserProgress;
  flaggedItems: FlaggedItem[];
  dailyTasks: DailyTask;
  onSelectUnit: (unit: Unit) => void;
  onStartQuickTest: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lessons,
  progress,
  flaggedItems,
  dailyTasks,
  onSelectUnit,
  onStartQuickTest,
}) => {
  const [tasksExpanded, setTasksExpanded] = useState(true);

  const completedCount = dailyTasks.tasks.filter((t) => t.completed).length;
  const overallProgress =
    lessons.length > 0
      ? Math.round((progress.completedUnits.length / lessons.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="primary-gradient relative overflow-hidden border-none police-shadow">
        <div className="absolute -right-8 -top-8 text-[120px] font-heading font-black opacity-10 pointer-events-none select-none">
          OPS
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Zap className="h-5 w-5 fill-current" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Sẵn sàng huấn luyện
            </span>
          </div>
          <CardTitle className="text-3xl text-white font-heading">
            Chào mừng quay trở lại
          </CardTitle>
          <CardDescription className="text-white/80 text-base max-w-md">
            Tiếp tục lộ trình rèn luyện tiếng Anh chuyên ngành để nâng cao
            nghiệp vụ thực tế.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <div className="flex justify-between text-xs text-white/90 font-medium">
              <span>Tiến độ tổng thể</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Tasks */}
        <Card className="police-shadow border-t-4 border-t-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Nhiệm vụ hôm nay
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary font-bold hover:bg-primary/5"
                onClick={() => setTasksExpanded(!tasksExpanded)}
              >
                {tasksExpanded ? "Ẩn" : "Hiện"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                {completedCount}/{dailyTasks.tasks.length} mục đã hoàn thành
              </span>
            </div>

            {tasksExpanded && (
              <div className="space-y-3 mb-6">
                {dailyTasks.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${task.completed ? "bg-green-50 border-green-200" : "bg-card"}`}
                  >
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 pointer-events-none"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor={task.id}
                          className={`text-sm font-medium leading-none cursor-default ${task.completed ? "text-green-700" : ""}`}
                        >
                          {task.label}
                        </label>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {task.current}/{task.target}
                        </span>
                      </div>
                      <Progress
                        value={(task.current / task.target) * 100}
                        className={`h-1 ${task.completed ? "bg-green-100 [&>div]:bg-green-500" : ""}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                <span>Tiến độ nhiệm vụ</span>
                <span>
                  {Math.round((completedCount / dailyTasks.tasks.length) * 100)}
                  %
                </span>
              </div>
              <Progress
                value={(completedCount / dailyTasks.tasks.length) * 100}
                className="h-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Flagged Items Summary */}
        <Card className="police-shadow border-t-4 border-t-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="h-5 w-5 text-secondary fill-current" />
              Từ cần ôn lại
            </CardTitle>
            <CardDescription>
              Các từ vựng và mẫu câu bạn đã đánh dấu ưu tiên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {flaggedItems.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {flaggedItems.map((item, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20 transition-colors py-1 px-3"
                  >
                    {item.key}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Flag className="h-10 w-10 mx-auto opacity-20 mb-2" />
                <p className="text-sm">Chưa có mục nào được đánh dấu.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Test Button */}
      {progress.completedUnits.length > 0 && (
        <Button
          className="w-full h-14 text-lg font-bold bg-primary text-white hover:bg-primary/90 police-shadow group"
          onClick={onStartQuickTest}
        >
          <Zap className="mr-2 h-5 w-5 fill-current text-secondary group-hover:scale-125 transition-transform" />
          Bài test nhanh — Ôn lại từ đã học
          <ArrowUpRight className="ml-2 h-5 w-5 opacity-50" />
        </Button>
      )}

      {/* Lesson List */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Lộ trình bài học
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lessons.map((unit) => (
            <Card
              key={unit.id}
              className="group cursor-pointer hover:police-shadow border-transparent hover:border-primary/20 transition-all active:scale-[0.98]"
              onClick={() => onSelectUnit(unit)}
            >
              <CardHeader className="pb-2 flex-row justify-between items-start space-y-0">
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold border-primary/20 text-primary"
                  >
                    Tuần {unit.id}
                  </Badge>
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {unit.title}
                  </CardTitle>
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                  {unit.description}
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">
                      Tiến độ bài học
                    </span>
                    <span
                      className={
                        progress.completedUnits.includes(unit.id)
                          ? "text-green-600"
                          : "text-primary"
                      }
                    >
                      {progress.completedUnits.includes(unit.id)
                        ? "Hoàn thành"
                        : "0%"}
                    </span>
                  </div>
                  <Progress
                    value={progress.completedUnits.includes(unit.id) ? 100 : 0}
                    className={`h-1 ${progress.completedUnits.includes(unit.id) ? "bg-green-100 [&>div]:bg-green-500" : ""}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
