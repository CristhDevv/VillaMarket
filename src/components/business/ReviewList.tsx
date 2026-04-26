"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  businessSlug: string;
  refreshTrigger?: number;
}

export function ReviewList({ businessSlug, refreshTrigger = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/businesses/${businessSlug}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setReviews(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [businessSlug, refreshTrigger]);

  if (loading) {
    return <div className="text-center py-8 text-sm text-muted">Cargando reseñas...</div>;
  }

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      {totalReviews > 0 ? (
        <div className="flex items-center gap-3 bg-surface p-4 rounded-card border border-border shadow-sm">
          <div className="text-3xl font-black text-foreground">{avgRating}</div>
          <div>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} weight={star <= Math.round(Number(avgRating)) ? "fill" : "regular"} />
              ))}
            </div>
            <div className="text-xs font-medium text-muted mt-0.5">
              Basado en {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-surface border border-border rounded-card shadow-sm">
          <Star size={32} className="mx-auto text-muted mb-2" weight="light" />
          <p className="text-sm font-medium text-foreground">Aún no hay reseñas</p>
          <p className="text-xs text-muted mt-1">Sé el primero en reseñar este negocio</p>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-border rounded-card p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-sm text-accent overflow-hidden flex-shrink-0">
                {review.user.image ? (
                  <Image src={review.user.image} alt={review.user.name || "User"} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  (review.user.name || "U")[0].toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground leading-none">
                  {review.user.name || "Usuario anónimo"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={12} weight={star <= review.rating ? "fill" : "regular"} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-foreground leading-relaxed mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
