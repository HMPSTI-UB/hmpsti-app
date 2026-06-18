"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Loader2, Upload, Search, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
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

export function TeamManager({ initialTeams, sessions }: { initialTeams: any[], sessions: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [formData, setFormData] = useState<TeamFormData>({
    code: "",
    className: "",
    groupNumber: 1,
    title: "",
    teamMembers: "",
    bannerImageUrl: "",
    projectImageUrl: "",
    sessionId: sessions.length > 0 ? sessions[0].id : 0,
  });

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingProject, setUploadingProject] = useState(false);

  // Filter & Pagination States
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedSession, setSelectedSession] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageStr, setItemsPerPageStr] = useState<string>("ALL");
  
  // Hydration safe mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile(); // Check initially on client
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const classes = Array.from(new Set(initialTeams.map(t => t.className))).sort();

  const filteredTeams = initialTeams.filter(team => {
    const matchSearch = team.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       team.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       team.className.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchClass = selectedClass === "ALL" || team.className === selectedClass;
    const matchSession = selectedSession === "ALL" || String(team.sessionId) === selectedSession;

    return matchSearch && matchClass && matchSession;
  });

  const ITEMS_PER_PAGE = itemsPerPageStr === "ALL" ? Math.max(filteredTeams.length, 1) : Number(itemsPerPageStr);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / ITEMS_PER_PAGE));
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleOpenDialog = (team?: any) => {
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
      setFormData({
        code: "",
        className: "",
        groupNumber: 1,
        title: "",
        teamMembers: "",
        bannerImageUrl: "",
        projectImageUrl: "",
        sessionId: sessions.length > 0 ? sessions[0].id : 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'project') => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    } catch (err: any) {
      setError(`Gagal mengunggah gambar: ${err.message}`);
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
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      }
    });
  };

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      try {
        await deleteTeam(id);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Gagal menghapus tim");
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
                setCurrentPage(1);
              }}
              className="pl-9 bg-white/5 border-white/10 text-white w-full"
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-3">
            <Select value={itemsPerPageStr} onValueChange={(val) => { setItemsPerPageStr(val); setCurrentPage(1); }}>
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
                  <div className="space-y-3">
                    <Label className="text-gray-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Gambar Alat
                    </Label>
                    <div className="flex flex-col gap-2">
                      {formData.projectImageUrl ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                          <img src={formData.projectImageUrl} alt="Project" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormData({...formData, projectImageUrl: ""})} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-black/20 hover:bg-white/5 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                              {uploadingProject ? <Loader2 className="w-6 h-6 animate-spin mb-2" /> : <Upload className="w-6 h-6 mb-2" />}
                              <p className="text-xs">Upload Gambar Alat</p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'project')} disabled={uploadingProject} />
                          </label>
                        </div>
                      )}
                      <Input 
                        value={formData.projectImageUrl || ""} 
                        onChange={(e) => setFormData({...formData, projectImageUrl: e.target.value})}
                        className="bg-black/20 border-white/10 text-xs text-gray-400 h-8" 
                        placeholder="Atau paste URL gambar..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Poster / Banner
                    </Label>
                    <div className="flex flex-col gap-2">
                      {formData.bannerImageUrl ? (
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 w-full max-w-[150px] mx-auto">
                          <img src={formData.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormData({...formData, bannerImageUrl: ""})} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-black/20 hover:bg-white/5 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                              {uploadingBanner ? <Loader2 className="w-6 h-6 animate-spin mb-2" /> : <Upload className="w-6 h-6 mb-2" />}
                              <p className="text-xs">Upload Poster</p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'banner')} disabled={uploadingBanner} />
                          </label>
                        </div>
                      )}
                      <Input 
                        value={formData.bannerImageUrl || ""} 
                        onChange={(e) => setFormData({...formData, bannerImageUrl: e.target.value})}
                        className="bg-black/20 border-white/10 text-xs text-gray-400 h-8" 
                        placeholder="Atau paste URL poster..."
                      />
                    </div>
                  </div>
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
            {paginatedTeams.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Tidak ada tim yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              paginatedTeams.map((team) => (
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

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-white/10 bg-black/20">
            <span className="text-sm text-gray-400 order-2 sm:order-1">
              <span className="hidden xs:inline">Menampilkan </span>
              {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTeams.length)} 
              <span className="hidden xs:inline"> dari {filteredTeams.length} tim</span>
              <span className="xs:hidden"> / {filteredTeams.length}</span>
            </span>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-transparent border-white/10 hover:bg-white/5 text-white h-8 w-8 p-0 sm:w-auto sm:px-3"
              >
                <ChevronLeft className="w-4 h-4 sm:mr-1" /> 
                <span className="hidden sm:inline">Prev</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  // Show current page, first, last, and surrounding pages
                  // On very small screens, show fewer
                  const range = isMobile ? 0 : 1;

                  if (page === 1 || page === totalPages || (page >= currentPage - range && page <= currentPage + range)) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 text-xs sm:text-sm ${
                          currentPage === page 
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                            : "bg-transparent border-white/10 hover:bg-white/5 text-gray-300"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - (range + 1) || page === currentPage + (range + 1)) {
                    return <span key={page} className="text-gray-500 px-0.5 text-xs">..</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-transparent border-white/10 hover:bg-white/5 text-white h-8 w-8 p-0 sm:w-auto sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
