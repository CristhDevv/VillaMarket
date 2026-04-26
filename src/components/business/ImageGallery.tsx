"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, SpinnerGap, Plus } from "@phosphor-icons/react";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface GalleryImage {
  id: string;
  url: string;
  publicId: string;
}

export function ImageGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/business/images")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setImages(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddImage = async (url: string, publicId?: string) => {
    if (!url || !publicId) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/dashboard/business/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, publicId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al agregar la imagen");
      } else {
        setImages((prev) => [...prev, data.data]);
        setSuccess("Imagen agregada exitosamente");
        setIsAdding(false);
      }
    } catch (err) {
      setError("Error de conexión al agregar imagen");
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    setSuccess("");
    
    // Optimistic update
    const imgToDelete = images.find(img => img.id === id);
    if (!imgToDelete) return;
    
    setImages(prev => prev.filter(img => img.id !== id));

    try {
      const res = await fetch(`/api/dashboard/business/images/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al eliminar la imagen");
        setImages(prev => [...prev, imgToDelete]);
      } else {
        setSuccess("Imagen eliminada");
      }
    } catch (err) {
      setError("Error de red al eliminar");
      setImages(prev => [...prev, imgToDelete]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <SpinnerGap size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  const limitReached = images.length >= 6;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
          {images.length}/6 fotos permitidas
        </span>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {success && <span className="text-xs text-green-600 font-medium">{success}</span>}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square rounded-card overflow-hidden bg-surface border border-border group">
            <Image src={img.url} alt="Business photo" fill className="object-cover" sizes="(max-width: 640px) 33vw, 16vw" />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        ))}

        {!limitReached && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="aspect-square rounded-card border-2 border-dashed border-border hover:border-accent bg-surface flex flex-col items-center justify-center text-muted transition-colors active:scale-95"
          >
            <Plus size={24} className="mb-1" />
            <span className="text-[10px] font-medium">Agregar foto</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mt-4 p-4 border border-border rounded-card bg-surface/50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-foreground">Sube una nueva foto</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <ImageUpload 
            value="" 
            onChange={(url, publicId) => handleAddImage(url, publicId)} 
            folder="businesses" 
            aspectRatio="square" 
          />
        </div>
      )}
    </div>
  );
}
