"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadSimple, X, Image as ImageIcon, SpinnerGap } from "@phosphor-icons/react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string, publicId?: string) => void;
  folder: "businesses" | "products";
  aspectRatio?: "square" | "cover";
}

export function ImageUpload({ value, onChange, folder, aspectRatio = "square" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSquare = aspectRatio === "square";
  const aspectClass = isSquare ? "aspect-square" : "aspect-video md:aspect-[21/9]";

  const handleUpload = async (file: File) => {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe pesar más de 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      onChange(data.data.url, data.data.publicId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className={`relative w-full rounded-card overflow-hidden bg-surface border-2 transition-colors ${
          error ? "border-red-500" : "border-border border-dashed hover:border-accent"
        } ${aspectClass}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !value && !uploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg,image/png,image/webp" 
          className="hidden" 
        />

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
            <SpinnerGap size={32} className="animate-spin text-accent mb-2" />
            <p className="text-xs font-bold text-accent">Subiendo imagen...</p>
          </div>
        ) : value ? (
          <div className="relative w-full h-full group">
            <Image src={value} alt="Upload preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-4 py-1.5 bg-white text-foreground text-xs font-bold rounded-pill shadow"
              >
                Cambiar imagen
              </button>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-pill shadow"
              >
                Eliminar
              </button>
            </div>
            {/* Mobile quick actions */}
            <div className="absolute top-2 right-2 flex gap-1 md:hidden">
              <button type="button" onClick={() => onChange("")} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted cursor-pointer">
            <UploadSimple size={32} className="mb-2" />
            <p className="text-sm font-medium">Toca para subir imagen</p>
            <p className="text-[10px] mt-1">JPG, PNG, WEBP (Máx 5MB)</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
