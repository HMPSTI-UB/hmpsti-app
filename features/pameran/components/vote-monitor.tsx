"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronDown, ChevronUp, Loader2, Trophy, Eye, Download } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { getTeamVotes, deleteVote } from "../actions/vote-monitor-actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-action";
import type { AdminSession, VoteRanking, TeamVote } from "../types";

import ExcelJS from "exceljs";

export function VoteMonitor({ rankings, sessions }: { rankings: VoteRanking[], sessions: AdminSession[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedTeam, setSelectedTeam] = useState<VoteRanking | null>(null);
  const [teamVotes, setTeamVotes] = useState<TeamVote[]>([]);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activeSessionId = searchParams.get('session') || "ALL";

  const handleSessionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete('session');
    } else {
      params.set('session', value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleViewVotes = async (team: VoteRanking) => {
    setSelectedTeam(team);
    setIsDialogOpen(true);
    setIsLoadingVotes(true);
    try {
      const votes = await getTeamVotes(team.id);
      setTeamVotes(votes);
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, "Gagal mengambil data vote"));
    } finally {
      setIsLoadingVotes(false);
    }
  };

  const handleDeleteVote = async (voteId: number) => {
    startTransition(async () => {
      try {
        await deleteVote(voteId);
        // Refresh local state
        setTeamVotes(prev => prev.filter(v => v.id !== voteId));
        // Refresh server data
        router.refresh();
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Gagal menghapus vote"));
      }
    });
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Hasil Vote");

    // Title & Info
    const sessionName = activeSessionId === "ALL" 
      ? "Semua Sesi" 
      : sessions.find(s => String(s.id) === activeSessionId)?.name || "Sesi";
    
    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "LAPORAN HASIL VOTING PAMERAN IOT";
    titleCell.font = { name: 'Arial', size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells("A2:G2");
    const sessionCell = worksheet.getCell("A2");
    sessionCell.value = `Sesi: ${sessionName}`;
    sessionCell.font = { name: 'Arial', size: 12, bold: true };
    sessionCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells("A3:G3");
    const dateCell = worksheet.getCell("A3");
    dateCell.value = `Dicetak pada: ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}`;
    dateCell.font = { name: 'Arial', size: 10, italic: true };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]); // Blank row

    // Table Header
    const headerRow = worksheet.addRow(["No", "Kode", "Judul Karya", "Sesi", "Kelas", "Anggota Tim", "Total Vote"]);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.font = { bold: true, name: 'Arial' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Data Rows
    rankings.forEach((team, index) => {
      const row = worksheet.addRow([
        index + 1,
        team.code,
        team.title,
        team.sessionName || "-",
        team.className || "-",
        team.teamMembers,
        team.voteCount
      ]);

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Alignment
        if (colNumber === 1 || colNumber === 2 || colNumber === 7) {
          cell.alignment = { horizontal: 'center' };
        } else {
          cell.alignment = { horizontal: 'left', wrapText: true };
        }
      });
    });

    // Column Widths
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 10;
    worksheet.getColumn(3).width = 35;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 12;
    worksheet.getColumn(6).width = 45;
    worksheet.getColumn(7).width = 12;

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Hasil_Vote_${sessionName.replace(/\s+/g, "_")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50"><Trophy className="w-3 h-3 mr-1" /> #1</Badge>;
    if (index === 1) return <Badge className="bg-gray-300/20 text-gray-300 hover:bg-gray-300/30 border-gray-300/50"><Trophy className="w-3 h-3 mr-1" /> #2</Badge>;
    if (index === 2) return <Badge className="bg-amber-700/20 text-amber-500 hover:bg-amber-700/30 border-amber-700/50"><Trophy className="w-3 h-3 mr-1" /> #3</Badge>;
    return <span className="text-gray-400 font-medium">#{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Monitoring Vote</h2>
          <p className="text-gray-400 text-sm mt-1">Pantau perolehan vote secara langsung</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleExportExcel} 
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            disabled={rankings.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Ekspor Excel (.xlsx)
          </Button>

          <Select value={activeSessionId} onValueChange={handleSessionChange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border border-white/10 text-white">
              <SelectValue placeholder="Semua Sesi" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white">
              <SelectItem value="ALL" className="focus:bg-white/10 focus:text-white cursor-pointer">Semua Sesi</SelectItem>
              {sessions.map((s) => (
                <SelectItem key={String(s.id)} value={String(s.id)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto relative">
        {isPending && (
          <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
        <Table>
          <TableHeader className="bg-black/20 hover:bg-black/20 whitespace-nowrap">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium w-[80px] text-center">Rank</TableHead>
              <TableHead className="text-gray-400 font-medium">Kode</TableHead>
              <TableHead className="text-gray-400 font-medium min-w-[200px]">Judul Karya</TableHead>
              <TableHead className="text-gray-400 font-medium">Sesi</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Total Vote</TableHead>
              <TableHead className="text-gray-400 font-medium text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Tidak ada data tim / vote
                </TableCell>
              </TableRow>
            ) : (
              rankings.map((team, index) => (
                <TableRow key={team.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-center">
                    {getRankBadge(index)}
                  </TableCell>
                  <TableCell className="font-bold text-white whitespace-nowrap">
                    {team.code}
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-1 text-sm text-gray-200" title={team.title}>
                      {team.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 whitespace-nowrap">{team.sessionName || '-'}</TableCell>
                  <TableCell className="text-center font-bold text-blue-400 text-lg">{team.voteCount}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewVotes(team)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-dark border-white/10 text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b border-white/10">
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-sm font-normal block mb-1">Detail Vote Tim {selectedTeam?.code}</span>
                {selectedTeam?.title}
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 text-lg py-1 px-3 border-none">{teamVotes.length} Vote</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-0">
            {isLoadingVotes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : teamVotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Belum ada vote untuk tim ini.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-black/20 sticky top-0 backdrop-blur-md">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400 font-medium">Waktu</TableHead>
                    <TableHead className="text-gray-400 font-medium">Nama Voter</TableHead>
                    <TableHead className="text-gray-400 font-medium">Pesan Dukungan</TableHead>
                    <TableHead className="text-gray-400 font-medium text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamVotes.map((vote) => (
                    <TableRow key={vote.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-gray-400 whitespace-nowrap text-sm">
                        {format(vote.votedAt, "dd MMM yyyy HH:mm", { locale: id })}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {vote.voterName || <span className="text-gray-500 italic">Anonim</span>}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm max-w-xs truncate" title={vote.message ?? undefined}>
                        {vote.message || <span className="text-gray-500 italic">-</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              title="Hapus Vote"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-dark border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Vote Ini?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Apakah Anda yakin ingin menghapus vote dari {vote.voterName || 'Anonim'}? 
                                Tindakan ini akan mengurangi total vote tim.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteVote(vote.id)}
                                disabled={isPending}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
             <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5 hover:text-white text-gray-300">
               Tutup
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
