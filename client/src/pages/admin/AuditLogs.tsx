import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Radio, 
  Terminal, 
  Filter, 
  Copy, 
  ArrowRight,
  ShieldAlert,
  Globe,
  MonitorSmartphone,
  CheckCircle2,
  ListFilter,
  Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const INITIAL_EVENTS = [
  {
    id: "evt_3x8y9z0a1b2",
    adminName: "Phạm D",
    action: "APPROVE_HOTEL",
    target: "HTL-1003",
    ipAddress: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/119.0",
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 2), // 2 mins ago
    severity: "INFO",
    details: {
      previous_state: "PENDING",
      new_state: "ACTIVE",
      approved_by: "admin_usr_004",
      notes: "Documents verified via VNeID"
    }
  },
  {
    id: "evt_6f7g8h9i0j1",
    adminName: "System",
    action: "AUTO_CANCEL_BOOKING",
    target: "BK-10296",
    ipAddress: "127.0.0.1",
    userAgent: "NestBooking-CronWorker/1.0",
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 15), // 15 mins ago
    severity: "WARNING",
    details: {
      reason: "Payment timeout (>30 mins)",
      booking_id: "BK-10296",
      auto_refund: false,
      trigger: "Cron_CheckExpiredBookings"
    }
  },
  {
    id: "evt_k1l2m3n4o5p",
    adminName: "Phạm D",
    action: "BAN_USER",
    target: "USR-003",
    ipAddress: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/119.0",
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
    severity: "CRITICAL",
    details: {
      reason: "Violating terms of service (Spam reviews)",
      duration: "PERMANENT",
      affected_bookings: 0
    }
  },
  {
    id: "evt_u1v2w3x4y5z",
    adminName: "Nguyễn Văn A",
    action: "UPDATE_PAYOUT_CONFIG",
    target: "AGT-002",
    ipAddress: "10.0.0.5",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari",
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24), // 1 day ago
    severity: "INFO",
    details: {
      bank_code: "VCB",
      account_number: "******7890",
      requires_approval: true
    }
  },
  {
    id: "evt_p6q7r8s9t0q",
    adminName: "System",
    action: "DATABASE_BACKUP_FAILED",
    target: "Cluster-01",
    ipAddress: "10.0.0.1",
    userAgent: "PostgreSQL-Agent",
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 26),
    severity: "ERROR",
    details: {
      error_code: "E_STORAGE_FULL",
      retry_count: 3
    }
  }
];

const getSeverityDot = (severity: string) => {
  switch (severity) {
    case "INFO": return <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />;
    case "WARNING": return <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />;
    case "ERROR": return <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />;
    case "CRITICAL": return <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />;
    default: return <span className="h-2 w-2 rounded-full bg-slate-500" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "INFO": return <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">INFO</Badge>;
    case "WARNING": return <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">WARN</Badge>;
    case "ERROR": return <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10">ERROR</Badge>;
    case "CRITICAL": return <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10">CRITICAL</Badge>;
    default: return <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-slate-500/30 text-slate-500 bg-slate-500/10">UNKNOWN</Badge>;
  }
};

export default function AuditLogs() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(INITIAL_EVENTS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // Simulate incoming real-time events
  useEffect(() => {
    const timer = setTimeout(() => {
      const newEvent = {
        id: `evt_${Math.random().toString(36).substring(2, 10)}`,
        adminName: "Nguyễn Văn A",
        action: "LOGIN_SUCCESS",
        target: "Admin Dashboard",
        ipAddress: "116.108.12.34",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
        createdAt: new Date(),
        severity: "INFO",
        details: {
          auth_method: "SSO",
          "2fa_used": true,
          location: "Ho Chi Minh City, Vietnam"
        },
        isNew: true // Highlight flag
      };
      setEvents((prev) => [newEvent, ...prev]);
    }, 8000); // Add a new event after 8 seconds

    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || evt.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-[#0a0a0a] animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 px-6 border-b border-slate-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Radio className="h-5 w-5 text-emerald-500 animate-pulse" />
            Security & Audit Events
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Live event stream • <span className="text-emerald-500">{events.length} events processing</span>
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              className="pl-8 h-8 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-mono text-xs focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-8 w-[120px] bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs font-mono">
              <ListFilter className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="INFO">INFO</SelectItem>
              <SelectItem value="WARNING">WARNING</SelectItem>
              <SelectItem value="ERROR">ERROR</SelectItem>
              <SelectItem value="CRITICAL">CRITICAL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Live Feed */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-[#0f0f11]">
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {filteredEvents.map((evt) => (
                <div 
                  key={evt.id} 
                  onClick={() => {
                    if ((evt as any).isNew) (evt as any).isNew = false;
                    setSelectedEvent(evt);
                  }}
                  className={`
                    group flex items-start gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-900/80 transition-colors
                    ${selectedEvent.id === evt.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}
                    ${(evt as any).isNew ? 'animate-in slide-in-from-top-2 bg-emerald-50/50 dark:bg-emerald-950/20' : ''}
                  `}
                >
                  <div className="mt-1.5 flex-shrink-0">
                    {getSeverityDot(evt.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                        {evt.action}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono tabular-nums">
                        {formatDistanceToNow(evt.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{evt.adminName}</span>
                      <ArrowRight className="h-3 w-3 mx-1 opacity-50 flex-shrink-0" />
                      <span className="truncate">{evt.target}</span>
                    </div>
                  </div>
                  
                  {/* Selected Indicator */}
                  {selectedEvent.id === evt.id && (
                    <div className="absolute left-0 w-0.5 h-8 bg-blue-500 rounded-r-full my-1"></div>
                  )}
                </div>
              ))}
              
              {filteredEvents.length === 0 && (
                <div className="p-8 text-center text-muted-foreground font-mono text-xs">
                  No events found.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Event Detail (Stripe/Cloudflare style) */}
        <div className="hidden lg:flex flex-col flex-1 bg-white dark:bg-[#0a0a0a]">
          {selectedEvent ? (
            <ScrollArea className="flex-1">
              <div className="p-8 max-w-4xl">
                
                {/* Event Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    {getSeverityBadge(selectedEvent.severity)}
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Event ID • {selectedEvent.id}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mb-2">
                    {selectedEvent.action}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {format(selectedEvent.createdAt, "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center text-slate-900 dark:text-slate-300">
                      {format(selectedEvent.createdAt, "HH:mm:ss.SSS")} UTC
                    </div>
                  </div>
                </div>

                {/* Event Flow Timeline (Mock visual) */}
                <div className="mb-10">
                  <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-4">Event Flow</h4>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-500">1</div>
                    </div>
                    <div className="h-px w-10 bg-slate-200 dark:bg-zinc-800"></div>
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">2</div>
                    </div>
                    <div className="h-px w-10 bg-blue-200 dark:bg-blue-800"></div>
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="ml-2 text-slate-600 dark:text-slate-400 flex gap-4">
                      <span>Request Received</span>
                      <ArrowRight className="h-4 w-4 opacity-30" />
                      <span>Processing</span>
                      <ArrowRight className="h-4 w-4 opacity-30" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Completed</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  {/* Actor */}
                  <div>
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Actor</h4>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                        <Terminal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedEvent.adminName}</div>
                        <div className="text-xs text-muted-foreground font-mono">System Actor</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Target */}
                  <div>
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Target Resource</h4>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                        <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedEvent.target}</div>
                        <div className="text-xs text-muted-foreground font-mono">Resource ID</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Context */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Request Context</h4>
                  <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-200 dark:border-zinc-800 p-1">
                    <table className="w-full text-sm font-mono text-left">
                      <tbody>
                        <tr className="border-b border-slate-200 dark:border-zinc-800/50 last:border-0">
                          <td className="py-2.5 px-4 text-slate-500 w-1/3 flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5" /> IP Address
                          </td>
                          <td className="py-2.5 px-4 text-slate-900 dark:text-slate-300">{selectedEvent.ipAddress}</td>
                        </tr>
                        <tr className="border-b border-slate-200 dark:border-zinc-800/50 last:border-0">
                          <td className="py-2.5 px-4 text-slate-500 w-1/3 flex items-center gap-2">
                            <MonitorSmartphone className="h-3.5 w-3.5" /> User Agent
                          </td>
                          <td className="py-2.5 px-4 text-slate-900 dark:text-slate-300 truncate max-w-[200px]" title={selectedEvent.userAgent}>
                            {selectedEvent.userAgent}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payload Tabs */}
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Payload Data</h4>
                  
                  <Tabs defaultValue="pretty" className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <TabsList className="h-8 bg-slate-100 dark:bg-zinc-900">
                        <TabsTrigger value="pretty" className="text-xs font-mono h-6">Pretty</TabsTrigger>
                        <TabsTrigger value="raw" className="text-xs font-mono h-6">Raw JSON</TabsTrigger>
                      </TabsList>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
                        <Copy className="h-3 w-3 mr-1.5" /> Copy
                      </Button>
                    </div>
                    
                    <TabsContent value="pretty" className="m-0 focus-visible:outline-none">
                      <div className="bg-[#f8f9fa] dark:bg-[#0d1117] rounded-lg p-5 border border-slate-200 dark:border-slate-800/80 overflow-x-auto shadow-inner">
                        <table className="w-full text-sm font-mono text-left">
                          <tbody>
                            {Object.entries(selectedEvent.details).map(([key, value]) => (
                              <tr key={key} className="border-b border-slate-200 dark:border-zinc-800/50 last:border-0">
                                <td className="py-2 pr-4 text-[#0550ae] dark:text-[#79c0ff] font-semibold w-1/3 align-top">
                                  {key}
                                </td>
                                <td className="py-2 text-slate-700 dark:text-[#c9d1d9] break-words whitespace-pre-wrap">
                                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="raw" className="m-0 focus-visible:outline-none">
                      <div className="bg-[#f8f9fa] dark:bg-[#0d1117] rounded-lg p-5 border border-slate-200 dark:border-slate-800/80 overflow-x-auto shadow-inner">
                        <pre className="text-[#0a3069] dark:text-[#7ee787] font-mono text-[13px] leading-relaxed">
                          {JSON.stringify(
                            {
                              id: selectedEvent.id,
                              object: "event",
                              api_version: "2026-07-22",
                              created: Math.floor(selectedEvent.createdAt.getTime() / 1000),
                              type: selectedEvent.action,
                              data: {
                                object: selectedEvent.details
                              }
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

              </div>
            </ScrollArea>
          ) : null}
        </div>
      </div>
    </div>
  );
}
