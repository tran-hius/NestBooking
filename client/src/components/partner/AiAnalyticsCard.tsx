
import { Sparkles, Loader2, Bot, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import api from "@/api";
import { toast } from "sonner";
import type { Hotel } from "@/types";
import { useAppStore } from "@/stores/useAppStore";

export default function AiAnalyticsCard({ hotels }: { hotels: Hotel[] }) {
  const aiStatus = useAppStore(state => state.aiStatus);
  const report = useAppStore(state => state.aiReport);
  const setAiStatus = useAppStore(state => state.setAiStatus);
  const setAiReport = useAppStore(state => state.setAiReport);

  const loading = aiStatus === "PROCESSING";

  const handleAnalyze = async () => {
    if (loading) return;
    setAiStatus("PROCESSING");
    try {
      const res: any = await api.get("/ai/analytics/all");
      setAiReport(res.data?.report);
      setAiStatus("COMPLETED");
      toast.success("AI đã phân tích xong!");
    } catch (error: any) {
      setAiStatus("FAILED");
      toast.error(error.response?.data?.message || "Lỗi kết nối tới AI");
    }
  };

  if (!hotels.length) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 shadow-sm dark:border-blue-900/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Trợ lý AI Phân tích Doanh thu</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sử dụng AI để tìm ra Insight kinh doanh cho khách sạn của bạn.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="shrink-0 gap-2 rounded-xl bg-indigo-600 px-6 h-12 font-bold hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? "Đang đọc dữ liệu..." : "Phân tích"}
          </Button>
        </div>
      </div>

      {report && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-inner dark:border-indigo-900/50 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold text-indigo-700 dark:text-indigo-400">
            <TrendingUp className="h-5 w-5" /> Báo cáo từ AI:
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 prose-headings:text-indigo-900 prose-a:text-blue-600 dark:prose-invert dark:text-slate-300 dark:prose-headings:text-indigo-300">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
