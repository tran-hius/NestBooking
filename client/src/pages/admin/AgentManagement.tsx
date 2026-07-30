import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Search, Eye, Ban, Hotel } from "lucide-react";

import { userService } from "@/api/services/userService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AgentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await userService.getAllUsers();
        if (response.data) {
          setAgents(response.data.filter((u: any) => u.role === "AGENT"));
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Qu?n lý Ð?i tác</h2>
          <p className="text-muted-foreground">Xem và qu?n lý danh sách d?i tác.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo email, ID..."
            className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Xu?t báo cáo</Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-zinc-900/80">
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Tài Kho?n Ð?i Tác</TableHead>
              <TableHead>Tr?ng thái</TableHead>
              <TableHead>Ngày dang ký</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-500">{agent.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-zinc-700 rounded-md">
                        <AvatarImage src={agent.avatarUrl || ""} />
                        <AvatarFallback className="rounded-md bg-blue-100 text-blue-700">
                          <Hotel className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{agent.fullName || agent.email}</span>
                        <span className="text-xs text-muted-foreground">{agent.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.status === "ACTIVE" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Ho?t d?ng</Badge>}
                    {agent.status === "PENDING" && <Badge className="bg-amber-500 hover:bg-amber-600">Ðang ch?</Badge>}
                    {agent.status === "BLOCKED" && <Badge variant="destructive">Ðã khóa</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {agent.createdAt ? format(new Date(agent.createdAt), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">M? menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Hành d?ng</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Xem chi ti?t Ð?i tác</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-600">
                          <Ban className="mr-2 h-4 w-4" />
                          <span>Khóa / Ðình ch?</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {isLoading ? "Ðang t?i..." : "Không tìm th?y d?i tác nào."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
