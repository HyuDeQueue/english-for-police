import { Activity, BarChart3, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AggregateStats } from "@/components/admin/units-progress/types";

interface OverviewStatsCardProps {
  stats: AggregateStats;
  getStatusColor: (progress: number) => string;
}

export function OverviewStatsCard({
  stats,
  getStatusColor,
}: OverviewStatsCardProps) {
  return (
    <Card className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50">
        <CardTitle className="text-lg font-bold text-slate-900">
          Tổng Quan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Tổng Học Viên</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalStudents}
            </p>
          </div>
          <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-slate-700" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Tổng Chương</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalChapters}
            </p>
          </div>
          <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6 text-slate-700" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Đã Hoàn Thành</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.completedChapters}
            </p>
          </div>
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Đang Học</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.inProgressCount}
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Tiến Độ Trung Bình
              </span>
              <span className="text-sm font-bold text-slate-900">
                {Math.round(stats.avgProgress)}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 transition-all"
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Điểm Trung Bình
              </span>
              <span
                className={`text-sm font-bold ${getStatusColor(stats.avgScore).split(" ")[0]}`}
              >
                {Math.round(stats.avgScore)}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.avgScore >= 80
                    ? "bg-emerald-600"
                    : stats.avgScore >= 50
                      ? "bg-blue-600"
                      : "bg-orange-600"
                }`}
                style={{ width: `${stats.avgScore}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
