"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Clock, Loader2, Play, Square, RotateCcw } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { createSession, updateSession, deleteSession, startSessionNow, endSessionNow, resetSessionVotes } from "../actions/session-actions";
import { useRouter } from "next/navigation";

type Session = {
  id: number;
  name: string;
  startTime: Date;
  endTime: Date;
  teamCount: number;
  voteCount: number;
};

export function SessionManager({ initialSessions }: { initialSessions: Session[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const getStatus = (start: Date, end: Date) => {
    const now = new Date();
    if (now < start) return { label: "Belum Mulai", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
    if (now > end) return { label: "Selesai", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" };
    return { label: "Aktif", color: "bg-green-500/10 text-green-500 border-green-500/20" };
  };

  const hasActiveSession = initialSessions.some(s => {
    const status = getStatus(s.startTime, s.endTime);
    return status.label === "Aktif";
  });

  const activeSessionName = initialSessions.find(s => {
    const status = getStatus(s.startTime, s.endTime);
    return status.label === "Aktif";
  })?.name;

  const toDateTimeLocal = (date: Date) => {
    // Format to YYYY-MM-DDThh:mm
    const tzoffset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
  };

  const handleOpenDialog = (session?: Session) => {
    setError(null);
    if (session) {
      setEditingSession(session);
      setName(session.name);
      setStartTime(toDateTimeLocal(session.startTime));
      setEndTime(toDateTimeLocal(session.endTime));
    } else {
      setEditingSession(null);
      setName("");
      setStartTime("");
      setEndTime("");
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    startTransition(async () => {
      try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (start >= end) {
          setError("Waktu selesai harus setelah waktu mulai.");
          return;
        }

        if (editingSession) {
          await updateSession(editingSession.id, { name, startTime: start, endTime: end });
        } else {
          await createSession({ name, startTime: start, endTime: end });
        }
        
        setIsDialogOpen(false);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      }
    });
  };

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      try {
        await deleteSession(id);
        router.refresh();
      } catch (error: any) {
        alert(error.message || "Gagal menghapus sesi");
      }
    });
  };

  const handleStartNow = async (id: number) => {
    startTransition(async () => {
      try {
        await startSessionNow(id);
        router.refresh();
      } catch (error: any) {
        alert(error.message || "Gagal memulai sesi");
      }
    });
  };

  const handleEndNow = async (id: number) => {
    startTransition(async () => {
      try {
        await endSessionNow(id);
        router.refresh();
      } catch (error: any) {
        alert(error.message || "Gagal mengakhiri sesi");
      }
    });
  };

  const handleResetVotes = async (id: number) => {
    startTransition(async () => {
      try {
        await resetSessionVotes(id);
        router.refresh();
      } catch (error: any) {
        alert(error.message || "Gagal mereset sesi");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Sesi Voting</h2>
          <p className="text-gray-400 text-sm mt-1">Kelola jadwal sesi pameran IoT</p>
        </div>
        
        <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Tambah Sesi
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-dark border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSession ? "Edit Sesi" : "Tambah Sesi Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nama Sesi</Label>
                <Input 
                  id="name" 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500" 
                  placeholder="Misal: Sesi Pagi, Sesi 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-gray-300">Waktu Mulai</Label>
                <Input 
                  id="startTime" 
                  type="datetime-local" 
                  required
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-gray-300">Waktu Selesai</Label>
                <Input 
                  id="endTime" 
                  type="datetime-local" 
                  required
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 [color-scheme:dark]" 
                />
              </div>
              
              {error && <p className="text-red-400 text-sm">{error}</p>}
              
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5 hover:text-white text-gray-400">
                  Batal
                </Button>
                <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-black/20 hover:bg-black/20">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium">Nama Sesi</TableHead>
              <TableHead className="text-gray-400 font-medium">Jadwal</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Tim</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Vote</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Status</TableHead>
              <TableHead className="text-gray-400 font-medium text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialSessions.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Belum ada sesi yang dibuat
                </TableCell>
              </TableRow>
            ) : (
              initialSessions.map((session) => {
                const status = getStatus(session.startTime, session.endTime);
                return (
                  <TableRow key={session.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">
                      {session.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          {format(session.startTime, "dd MMM yyyy", { locale: id })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          {format(session.startTime, "HH:mm")} - {format(session.endTime, "HH:mm")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-gray-300">{session.teamCount}</TableCell>
                    <TableCell className="text-center text-gray-300">{session.voteCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {status.label !== "Aktif" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={isPending || hasActiveSession}
                                className={`h-8 w-8 ${hasActiveSession ? 'text-gray-600' : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'}`}
                                title={hasActiveSession ? `Tidak bisa memulai. Sesi "${activeSessionName}" sedang aktif.` : "Mulai Sesi Sekarang"}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            {!hasActiveSession && (
                              <AlertDialogContent className="bg-dark border-white/10 text-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Mulai Sesi Sekarang?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    Apakah Anda yakin ingin memulai sesi ini sekarang? Waktu mulai akan diubah ke waktu saat ini.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">Batal</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleStartNow(session.id)}
                                    disabled={isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Mulai
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        )}
                        {status.label === "Aktif" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={isPending}
                                className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                                title="Akhiri Sesi Sekarang"
                              >
                                <Square className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-dark border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Akhiri Sesi Sekarang?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Apakah Anda yakin ingin mengakhiri sesi ini sekarang? Waktu selesai akan diubah ke waktu saat ini.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleEndNow(session.id)}
                                  disabled={isPending}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                  Akhiri
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={isPending || session.voteCount === 0}
                              className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                              title="Reset Data Vote"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-dark border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset Semua Vote Sesi Ini?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Apakah Anda yakin ingin menghapus <strong>{session.voteCount} data vote</strong> pada sesi "{session.name}"?
                                <span className="block mt-2 font-bold text-red-400">
                                  Tindakan ini permanen dan tidak dapat dibatalkan.
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleResetVotes(session.id)}
                                disabled={isPending}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Ya, Hapus Semua Vote
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDialog(session)}
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                          title="Edit Sesi"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              title="Hapus Sesi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-dark border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Sesi?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Apakah Anda yakin ingin menghapus "{session.name}"? Tindakan ini tidak dapat dibatalkan.
                                {session.teamCount > 0 && (
                                  <span className="block mt-2 font-bold text-red-400">
                                    Peringatan: Sesi ini memiliki {session.teamCount} tim. Anda tidak dapat menghapus sesi yang masih memiliki tim.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(session.id)}
                                disabled={isPending || session.teamCount > 0}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
