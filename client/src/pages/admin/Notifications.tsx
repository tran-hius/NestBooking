import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle2, Clock, ShieldAlert, UserPlus, Wrench } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const mockNotifications = [
  {
    id: "notif-1",
    type: "NEW_PARTNER",
    title: "Có 1 đối tác mới đăng ký",
    description: "Khách sạn \"Boutique Hanoi\" đang chờ duyệt để được đưa lên nền tảng.",
    date: new Date(new Date().getTime() - 1000 * 60 * 5), // 5 mins ago
    read: false,
  },
  {
    id: "notif-2",
    type: "USER_REPORT",
    title: "Người dùng báo cáo lỗi",
    description: "User USR-002 vừa gửi một phản hồi về lỗi không thể thanh toán.",
    date: new Date(new Date().getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "notif-3",
    type: "SYSTEM_MAINTENANCE",
    title: "Bảo trì hệ thống",
    description: "Lên lịch bảo trì vào 2h sáng Chủ Nhật tuần này. Hệ thống sẽ ngừng hoạt động 30 phút.",
    date: new Date(new Date().getTime() - 1000 * 60 * 60 * 24), // 1 day ago
    read: false,
  },
  {
    id: "notif-4",
    type: "PAYMENT_SUCCESS",
    title: "Giao dịch thành công",
    description: "Khách hàng Nguyễn Văn A vừa thanh toán thành công đơn đặt phòng #BK-10293.",
    date: new Date(new Date().getTime() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
  },
  {
    id: "notif-5",
    type: "PARTNER_APPROVED",
    title: "Đã duyệt đối tác",
    description: "Khách sạn \"Da Nang Riverside\" đã được duyệt và chính thức hoạt động.",
    date: new Date(new Date().getTime() - 1000 * 60 * 60 * 72), // 3 days ago
    read: true,
  },
];

const getIconForType = (type: string) => {
  switch (type) {
    case "NEW_PARTNER":
      return <UserPlus className="h-5 w-5 text-blue-500" />;
    case "USER_REPORT":
      return <ShieldAlert className="h-5 w-5 text-orange-500" />;
    case "SYSTEM_MAINTENANCE":
      return <Wrench className="h-5 w-5 text-purple-500" />;
    case "PAYMENT_SUCCESS":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case "PARTNER_APPROVED":
      return <Check className="h-5 w-5 text-emerald-500" />;
    default:
      return <Clock className="h-5 w-5 text-slate-500" />;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Thông báo
          </h2>
          <p className="text-muted-foreground mt-1">
            Bạn có {unreadCount} thông báo chưa đọc.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all duration-300 border-0 shadow-sm ${notification.read ? 'bg-white/40 dark:bg-zinc-900/40 opacity-70' : 'bg-white/80 dark:bg-zinc-900/80 shadow-md backdrop-blur-xl ring-1 ring-blue-500/20'}`}
          >
            <CardContent className="p-4 sm:p-6 flex gap-4">
              <div className="mt-1 shrink-0 bg-slate-100 dark:bg-zinc-800 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                {getIconForType(notification.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-base ${notification.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Mới</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(notification.date, "HH:mm, dd/MM/yyyy", { locale: vi })}
                  </span>
                </div>
                <p className={`text-sm ${notification.read ? 'text-slate-500 dark:text-zinc-500' : 'text-slate-600 dark:text-zinc-400'}`}>
                  {notification.description}
                </p>
                {!notification.read && (
                  <div className="pt-2">
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" onClick={() => markAsRead(notification.id)}>
                      Đánh dấu đã đọc
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {notifications.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Không có thông báo nào.
        </div>
      )}
    </div>
  );
}
