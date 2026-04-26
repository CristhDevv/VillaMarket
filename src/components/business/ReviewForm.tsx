"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star } from "@phosphor-icons/react";

interface ReviewFormProps {
  businessSlug: string;
  onReviewAdded?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export function ReviewForm({ businessSlug, onReviewAdded, existingReview }: ReviewFormProps) {
  const { data: session } = useSession();
  
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(!existingReview);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
      setIsEditing(false);
    }
  }, [existingReview]);

  if (!session) {
    return (
      <div className="bg-surface border border-border rounded-card p-5 text-center shadow-sm">
        <h3 className="font-bold text-foreground mb-2">Déjanos tu opinión</h3>
        <p className="text-sm text-muted mb-4">Inicia sesión para dejar una reseña sobre este negocio.</p>
        <Link href="/login" className="inline-flex h-10 items-center justify-center bg-accent text-white font-bold rounded-pill px-6 text-sm active:scale-95 transition-all">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const role = session.user?.role as string | undefined;
  if (role !== "CUSTOMER" && role !== "OWNER") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Por favor, selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const method = existingReview ? "PATCH" : "POST";
      const res = await fetch(`/api/businesses/${businessSlug}/reviews`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al publicar la reseña");
      } else {
        setSuccess(existingReview ? "Reseña actualizada correctamente" : "¡Gracias por tu reseña!");
        setIsEditing(false);
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing && existingReview) {
    return (
      <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-foreground text-sm">Tu reseña</h3>
            <div className="flex text-yellow-400 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} weight={star <= existingReview.rating ? "fill" : "regular"} />
              ))}
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-accent hover:underline bg-accent/10 px-3 py-1.5 rounded-pill"
          >
            Editar
          </button>
        </div>
        {existingReview.comment && (
          <p className="text-sm text-muted bg-white p-3 rounded-md border border-border/50">
            {existingReview.comment}
          </p>
        )}
        {success && <div className="mt-3 text-xs font-medium text-green-700 bg-green-50 p-2 rounded-md">{success}</div>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-card p-5 shadow-sm">
      <h3 className="font-bold text-foreground mb-4">
        {existingReview ? "Editar tu reseña" : "Escribe una reseña"}
      </h3>
      
      {error && <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-md">{error}</div>}
      {success && <div className="mb-4 text-xs font-medium text-green-700 bg-green-50 p-2.5 rounded-md">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">Tu calificación *</label>
          <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
              >
                <Star 
                  size={28} 
                  weight={(hoverRating || rating) >= star ? "fill" : "regular"} 
                  className={(hoverRating || rating) >= star ? "text-yellow-400" : "text-border"} 
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-xs font-semibold text-foreground mb-1">
            Comentario (opcional)
          </label>
          <textarea
            id="comment"
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué te pareció este negocio?"
            className="w-full px-3 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm resize-none"
          />
          <div className="text-right mt-1 text-[10px] text-muted font-medium">
            {comment.length}/500
          </div>
        </div>

        <div className="flex gap-2">
          {existingReview && (
            <button 
              type="button"
              onClick={() => {
                setIsEditing(false);
                setRating(existingReview.rating);
                setComment(existingReview.comment || "");
              }}
              className="flex-1 h-11 bg-surface border border-border text-foreground font-bold rounded-pill text-sm active:scale-95 transition-all"
            >
              Cancelar
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting || rating === 0}
            className="flex-1 h-11 bg-accent text-white font-bold rounded-pill text-sm disabled:opacity-50 active:scale-95 transition-all"
          >
            {isSubmitting ? "Guardando..." : (existingReview ? "Actualizar" : "Publicar reseña")}
          </button>
        </div>
      </form>
    </div>
  );
}
