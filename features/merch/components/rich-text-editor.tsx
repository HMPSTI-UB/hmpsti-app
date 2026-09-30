"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  Eye,
  Edit3,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tuliskan deskripsi lengkap produk, spesifikasi, garansi, bahan, dll...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isFocused, setIsFocused] = useState(false);

  // Sync value into contenteditable DOM when value changes externally or initially
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Avoid resetting innerHTML if content is equivalent
      if (value === "" && editorRef.current.innerHTML === "<br>") return;
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html === "<br>" ? "" : html);
    }
  };

  const addLink = () => {
    const url = prompt("Masukkan URL link:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-[#0e131f]/80 overflow-hidden transition-all duration-200",
        isFocused ? "border-[#33A5D3] ring-1 ring-[#33A5D3]" : "border-white/10"
      )}
    >
      {/* Editor Header Bar & Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-[#141824]">
        {/* Toolbar Buttons Group */}
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            onClick={() => execCommand("bold")}
            title="Bold (Tebal)"
            icon={Bold}
          />
          <ToolbarButton
            onClick={() => execCommand("italic")}
            title="Italic (Miring)"
            icon={Italic}
          />
          <ToolbarButton
            onClick={() => execCommand("underline")}
            title="Underline (Garis Bawah)"
            icon={Underline}
          />
          <ToolbarButton
            onClick={() => execCommand("strikeThrough")}
            title="Strikethrough (Coret)"
            icon={Strikethrough}
          />

          <span className="w-px h-5 bg-white/10 mx-1" />

          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<h1>")}
            title="Judul Utama (H1)"
            icon={Heading1}
          />
          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<h2>")}
            title="Sub Judul (H2)"
            icon={Heading2}
          />
          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<h3>")}
            title="Sub Judul Kecil (H3)"
            icon={Heading3}
          />

          <span className="w-px h-5 bg-white/10 mx-1" />

          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            title="Daftar Bullet (Unordered List)"
            icon={List}
          />
          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            title="Daftar Angka (Ordered List)"
            icon={ListOrdered}
          />
          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<blockquote>")}
            title="Kutipan (Blockquote)"
            icon={Quote}
          />
          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<pre>")}
            title="Kode Monospace"
            icon={Code}
          />

          <span className="w-px h-5 bg-white/10 mx-1" />

          <ToolbarButton onClick={addLink} title="Tambah Link" icon={LinkIcon} />
          <ToolbarButton
            onClick={() => execCommand("removeFormat")}
            title="Hapus Format Text"
            icon={RemoveFormatting}
          />

          <span className="w-px h-5 bg-white/10 mx-1" />

          <ToolbarButton
            onClick={() => execCommand("undo")}
            title="Undo"
            icon={RotateCcw}
          />
          <ToolbarButton
            onClick={() => execCommand("redo")}
            title="Redo"
            icon={RotateCw}
          />
        </div>

        {/* View Mode Toggle (Tulis / Live Preview) */}
        <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              activeTab === "write"
                ? "bg-[#33A5D3] text-black font-bold"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Edit3 size={13} />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              activeTab === "preview"
                ? "bg-[#33A5D3] text-black font-bold"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Eye size={13} />
            Preview
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === "write" ? (
        <div className="relative min-h-[220px]">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full min-h-[220px] max-h-[500px] overflow-y-auto p-4 text-sm text-gray-200 focus:outline-none leading-relaxed prose prose-invert max-w-none"
            style={{ minHeight: "220px" }}
          />
          {(!value || value.trim() === "" || value === "<br>") && (
            <div className="absolute top-4 left-4 text-sm text-gray-500 pointer-events-none italic">
              {placeholder}
            </div>
          )}
        </div>
      ) : (
        /* Live Preview Mode */
        <div className="p-4 min-h-[220px] max-h-[500px] overflow-y-auto bg-[#07090e] border-t border-white/5">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
            Tampilan Deskripsi di Halaman Produk:
          </div>
          {value && value.trim() !== "" ? (
            <div
              className="text-sm text-gray-200 leading-relaxed space-y-3 prose prose-invert max-w-none border-t border-white/10 pt-3"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <p className="text-sm text-gray-500 italic">Belum ada deskripsi yang ditulis.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  icon: Icon,
}: {
  onClick: () => void;
  title: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
    >
      <Icon size={14} />
    </button>
  );
}
