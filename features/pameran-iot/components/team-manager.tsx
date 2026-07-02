"use client";

import { useState, useTransition } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTeam, updateTeam, deleteTeam, TeamFormData } from "../actions/team-actions";
import { uploadImage } from "../actions/upload-action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-action";
import { usePagination, type PerPage } from "../hooks/use-pagination";
import { ImageUploadField } from "./image-upload-field";
import { PaginationBar } from "./pagination-bar";
import type { AdminTeam, AdminSession } from "../types";

const emptyForm = (sessions: AdminSession[]): TeamFormData => ({
  code: "",
  className: "",
  groupNumber: 1,
  title: "",
  teamMembers: "",
  bannerImageUrl: "",
  projectImageUrl: "",
  sessionId: sessions.length > 0 ? sessions[0].id : 0,
});

export function TeamManager({ initialTeams, sessions }: { initialTeams: AdminTeam[], sessions: AdminSession[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<AdminTeam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState<TeamFormData>(() => emptyForm(sessions));

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingProject, setUploadingProject] = useState(false);

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedSession, setSelectedSession] = useState<string>("ALL");
  const [itemsPerPageStr, setItemsPerPageStr] = useState<PerPage>("ALL");

  const classes = Array.from(new Set(initialTeams.map(t => t.className))).sort();

  const filteredTeams = initialTeams.filter(team => {
    const matchSearch = team.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       team.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       team.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchClass = selectedClass === "ALL" || team.className === selectedClass;
    const matchSession = selectedSession === "ALL" || String(team.sessionId) === selectedSession;

    return matchSearch && matchClass && matchSession;
  });

  const { page, setPage, totalPages, pageItems, pageSize, startIndex } =
    usePagination(filteredTeams, itemsPerPageStr);

  // Reset ke halaman 1 setiap kali filter/pencarian berubah.
  const resetToFirstPage = () => setPage(1);
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    resetToFirstPage();
  };

  const handleOpenDialog = (team?: AdminTeam) => {
    setError(null);
    if (team) {
      setEditingTeam(team);
      setFormData({
        code: team.code,
        className: team.className,
        groupNumber: team.groupNumber,
        title: team.title,
        teamMembers: team.teamMembers,
        bannerImageUrl: team.bannerImageUrl || "",
        projectImageUrl: team.projectImageUrl || "",
        sessionId: team.sessionId,
      });
    } else {
      setEditingTeam(null);
      setFormData(emptyForm(sessions));
    }
    setIsDialogOpen(true);
  };

  const handleUpload = async (file: File, type: 'banner' | 'project') => {
    if (type === 'banner') setUploadingBanner(true);
    else setUploadingProject(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const result = await uploadImage(data);

      if (type === 'banner') {
        setFormData(prev => ({ ...prev, bannerImageUrl: result.secure_url }));
      } else {
        setFormData(prev => ({ ...prev, projectImageUrl: result.secure_url }));
      }
    } catch (err: unknown) {
      setError(`Gagal mengunggah gambar: ${getErrorMessage(err)}`);
    } finally {
      if (type === 'banner') setUploadingBanner(false);
      else setUploadingProject(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        if (editingTeam) {
          await updateTeam(editingTeam.id, formData);
        } else {
          await createTeam(formData);
        }

        setIsDialogOpen(false);
        router.refresh();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    });
  };

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      try {
        await deleteTeam(id);
        router.refresh();
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Gagal menghapus tim"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Tim IoT</h2>
          <p className="text-gray-400 text-sm mt-1">Kelola data peserta pameran</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari tim..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetToFirstPage();
              }}
              className="pl-9 bg-white/5 border-white/10 text-white w-full"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-3">
            <Select value={String(itemsPerPageStr)} onValueChange={(val) => { setItemsPerPageStr(val === "ALL" ? "ALL" : Number(val)); resetToFirstPage(); }}>
              <SelectTrigger className="w-full sm:w-[90px] bg-white/5 border border-white/10 text-white">
                <SelectValue placeholder="Tampil" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="5" className="focus:bg-white/10 focus:text-white cursor-pointer">5 Data</SelectItem>
                <SelectItem value="10" className="focus:bg-white/10 focus:text-white cursor-pointer">10 Data</SelectItem>
                <SelectItem value="20" className="focus:bg-white/10 focus:text-white cursor-pointer">20 Data</SelectItem>
                <SelectItem value="ALL" className="focus:bg-white/10 focus:text-white cursor-pointer">Semua</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={handleFilterChange(setSelectedClass)}>
              <SelectTrigger className="w-full sm:w-[130px] bg-white/5 border border-white/10 text-white">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="ALL" className="focus:bg-white/10 focus:text-white cursor-pointer">Semua Kelas</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={String(c)} value={String(c)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                    Kelas {String(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSession} onValueChange={handleFilterChange(setSelectedSession)}>
              <SelectTrigger className="w-full sm:w-[130px] bg-white/5 border border-white/10 text-white">
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
          <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap gap-2">
            <Plus className="w-4 h-4" />
            Tambah Tim
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-dark border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTeam ? "Edit Tim" : "Tambah Tim Baru"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-6 pt-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Kode Tim</Label>
                    <Input
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Misal: T4A1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Sesi Voting</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.sessionId}
                      onChange={(e) => setFormData({...formData, sessionId: Number(e.target.value)})}
                      required
                    >
                      <option value={0} disabled className="bg-dark text-gray-400">Pilih Sesi</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id} className="bg-dark text-white">{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Kelas</Label>
                    <Input
                      required
                      value={formData.className}
                      onChange={(e) => setFormData({...formData, className: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Misal: T4A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Kelompok</Label>
                    <Input
                      type="number"
                      required
                      min={1}
                      value={formData.groupNumber}
                      onChange={(e) => setFormData({...formData, groupNumber: Number(e.target.value)})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Judul Karya</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Nama project IoT"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Anggota Tim</Label>
                  <Textarea
                    required
                    value={formData.teamMembers}
                    onChange={(e) => setFormData({...formData, teamMembers: e.target.value})}
                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    placeholder="Daftar nama dan NIM anggota"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl border border-white/10 bg-white/5">
                  <ImageUploadField
                    label="Gambar Alat"
                    value={formData.projectImageUrl || ""}
                    onChange={(url) => setFormData(prev => ({ ...prev, projectImageUrl: url }))}
                    onFileSelect={(file) => handleUpload(file, 'project')}
                    uploading={uploadingProject}
                    aspect="video"
                    uploadLabel="Upload Gambar Alat"
                    urlPlaceholder="Atau paste URL gambar..."
                  />

                  <ImageUploadField
                    label="Poster / Banner"
                    value={formData.bannerImageUrl || ""}
                    onChange={(url) => setFormData(prev => ({ ...prev, bannerImageUrl: url }))}
                    onFileSelect={(file) => handleUpload(file, 'banner')}
                    uploading={uploadingBanner}
                    aspect="portrait"
                    uploadLabel="Upload Poster"
                    urlPlaceholder="Atau paste URL poster..."
                  />
                </div>

                {error && <p className="text-red-400 text-sm font-medium p-3 bg-red-500/10 rounded-lg border border-red-500/20">{error}</p>}

                <div className="pt-4 flex justify-end gap-2 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5 hover:text-white text-gray-400">
                    Batal
                  </Button>
                  <Button type="submit" disabled={isPending || uploadingBanner || uploadingProject || formData.sessionId === 0} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Tim"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/20 hover:bg-black/20 whitespace-nowrap">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium">Kode</TableHead>
              <TableHead className="text-gray-400 font-medium min-w-[200px]">Judul Karya</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Kelas</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Klp</TableHead>
              <TableHead className="text-gray-400 font-medium">Sesi</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Vote</TableHead>
              <TableHead className="text-gray-400 font-medium text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Tidak ada tim yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((team) => (
                <TableRow key={team.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-bold text-white whitespace-nowrap">
                    {team.code}
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-2 text-sm text-gray-200" title={team.title}>
                      {team.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-gray-300 whitespace-nowrap">{team.className}</TableCell>
                  <TableCell className="text-center text-gray-300">{team.groupNumber}</TableCell>
                  <TableCell className="text-gray-300 whitespace-nowrap">{team.sessionName || '-'}</TableCell>
                  <TableCell className="text-center font-bold text-blue-400">{team.voteCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(team)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        title="Edit Tim"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            title="Hapus Tim"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-dark border-white/10 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Tim {team.code}?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Apakah Anda yakin ingin menghapus tim <strong>{team.title}</strong>?
                              Semua data vote yang terkait dengan tim ini juga akan ikut terhapus. Tindakan ini permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(team.id)}
                              disabled={isPending}
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
              ))
            )}
          </TableBody>
        </Table>

        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          startIndex={startIndex}
          pageSize={pageSize}
          totalItems={filteredTeams.length}
          itemLabel="tim"
        />
      </div>
    </div>
  );
}
