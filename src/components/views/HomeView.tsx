import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Info,
  ArrowUpRight,
  ClipboardCheck,
  Flag,
  BookOpen,
  ChevronRight,
  Zap,
  Check,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react";
import type { Unit, UserProgress, FlaggedItem, DailyTask } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HomeViewProps {
  lessons: Unit[];
  progress: UserProgress;
  flaggedItems: FlaggedItem[];
  dailyTasks: DailyTask;
  onSelectUnit: (unit: Unit) => void;
  onNavigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lessons,
  progress,
  flaggedItems,
  dailyTasks,
  onSelectUnit,
  onNavigate,
}) => {
  const completedCount = dailyTasks.tasks.filter((t) => t.completed).length;
  const overallProgress =
    lessons.length > 0
      ? Math.round((progress.completedUnits.length / lessons.length) * 100)
      : 0;

  const displayedTasks = [...dailyTasks.tasks].sort((a, b) => {
    const hash = (value: string) => {
      let result = 0;
      const input = `${dailyTasks.date}-${value}`;
      for (let index = 0; index < input.length; index++) {
        result = (result * 31 + input.charCodeAt(index)) % 1000003;
      }
      return result;
    };

    return hash(a.id) - hash(b.id);
  });

  const handleNavigate = (path: string | undefined) => {
    if (path) {
      onNavigate(path);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_320px] gap-8 items-start">
      {/* Column 1: Profile & Progress */}
      <div className="xl:sticky xl:top-20 self-start">
        <div className="space-y-6">
          {/* Hero Section Moved to Left */}
          <Card className="primary-gradient relative overflow-hidden border-none police-shadow rounded-2xl p-5 text-white">
            <div className="absolute -right-4 -top-4 text-[80px] font-heading font-black opacity-10 pointer-events-none select-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <Zap className="h-4 w-4 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Huấn luyện
                </span>
              </div>
              <h1 className="text-2xl font-heading font-black mb-1.5 leading-tight">
                Chào mừng quay trở lại
              </h1>
              <p className="text-white/80 text-xs leading-relaxed">
                Tiếp tục lộ trình rèn luyện để nâng cao nghiệp vụ.
              </p>
            </div>
          </Card>

          {/* Mini Progress Card */}
          <Card className="police-shadow border-none bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl primary-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Tiến độ chung
                </p>
                <p className="text-xl font-black text-slate-800">
                  {overallProgress}%
                </p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </Card>

          {/* Suggested Lesson */}
          <Card className="police-shadow border-none bg-slate-700 text-white overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Sparkles className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Gợi ý bài học
                </span>
              </div>
              <CardTitle className="text-base font-black">
                {lessons.find((l) => !progress.completedUnits.includes(l.id))
                  ?.title || lessons[0]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-white/80 group-hover:text-secondary transition-colors"
                onClick={() => {
                  const nextUnit = lessons.find(
                    (l) => !progress.completedUnits.includes(l.id),
                  );
                  if (nextUnit) onSelectUnit(nextUnit);
                }}
              >
                Tiếp tục ngay <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard Placeholder */}
          <Card className="police-shadow border-dashed border-2 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center opacity-60">
            <Trophy className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Bảng xếp hạng
            </p>
            <p className="text-[10px] text-slate-400 mt-1 italic">
              Sắp ra mắt trong bản cập nhật tới
            </p>
          </Card>
        </div>
      </div>

      {/* Column 2: Main Content */}
      <div className="space-y-8">
        {/* Tasks and Review */}
        <div className="space-y-6">
          <Card className="police-shadow border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Nhiệm vụ hôm nay
                </CardTitle>
                <Badge className="primary-gradient border-none">
                  {completedCount}/{dailyTasks.tasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion
                type="single"
                collapsible
                className="w-full space-y-3 mb-6"
              >
                {displayedTasks.map((task) => (
                  <AccordionItem
                    key={task.id}
                    value={task.id}
                    className={`border rounded-xl px-4 transition-all duration-300 ${task.completed ? "bg-emerald-50/30 border-emerald-100 shadow-sm" : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-md"}`}
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center space-x-4 text-left w-full mr-2">
                        <span
                          aria-hidden="true"
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                            task.completed
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          {task.completed && <Check className="h-4 w-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <span
                              className={`text-sm font-bold tracking-tight ${task.completed ? "text-emerald-700" : "text-slate-700"}`}
                            >
                              {task.label}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              {task.current}/{task.target}
                            </span>
                          </div>
                          <Progress
                            value={(task.current / task.target) * 100}
                            className={`h-1.5 ${task.completed ? "bg-emerald-100 [&>div]:bg-emerald-500" : "bg-slate-100"}`}
                          />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 border-t border-dashed border-slate-100 mt-2">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                          <p className="leading-relaxed">
                            {task.description ||
                              "Hoàn thành các hoạt động tương ứng để đạt mục tiêu huấn luyện của bạn."}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={task.completed ? "outline" : "default"}
                          className={`w-full text-xs font-bold h-10 rounded-xl transition-all ${!task.completed ? "primary-gradient border-none shadow-lg shadow-primary/20" : ""}`}
                          onClick={() => handleNavigate(task.navigatePath)}
                        >
                          {task.completed
                            ? "Xem lại kết quả"
                            : "Thực hiện ngay"}
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Review Card */}
          <Card className="police-shadow border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Flag className="h-4 w-5 text-secondary fill-current" />
                Từ cần ôn lại
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {flaggedItems.length > 0 ? (
                <div className="flex flex-wrap gap-2 pb-2">
                  {flaggedItems.slice(0, 15).map((item, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-secondary transition-all py-1.5 px-4 rounded-xl"
                    >
                      {item.key}
                    </Badge>
                  ))}
                  {flaggedItems.length > 15 && (
                    <Badge
                      variant="ghost"
                      className="text-slate-400 text-[10px] font-bold"
                    >
                      +{flaggedItems.length - 15} từ khác
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <Flag className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">
                    Chưa có mục nào được đánh dấu.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Column 3: Roadmap */}
      <div className="space-y-6 xl:sticky xl:top-20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Lộ trình học
          </h3>
          <Badge variant="outline" className="text-[10px] font-black uppercase">
            {lessons.length} Bài
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {lessons.map((unit) => (
            <Card
              key={unit.id}
              className={`group cursor-pointer border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${
                progress.completedUnits.includes(unit.id)
                  ? "border-emerald-100 bg-emerald-50/10"
                  : "border-slate-100 bg-white hover:border-primary/30"
              }`}
              onClick={() => onSelectUnit(unit)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                        Chương {unit.id}
                      </span>
                      {progress.completedUnits.includes(unit.id) && (
                        <Check className="h-3 w-3 text-emerald-500" />
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">
                      {unit.title}
                    </h4>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:primary-gradient group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Hoàn thành</span>
                    <span
                      className={
                        progress.completedUnits.includes(unit.id)
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }
                    >
                      {progress.completedUnits.includes(unit.id)
                        ? "100%"
                        : "0%"}
                    </span>
                  </div>
                  <Progress
                    value={progress.completedUnits.includes(unit.id) ? 100 : 0}
                    className={`h-1 ${progress.completedUnits.includes(unit.id) ? "bg-emerald-100 [&>div]:bg-emerald-500" : "bg-slate-100"}`}
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
