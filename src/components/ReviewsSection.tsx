import React, { useEffect, useState } from 'react'
import { getReviews } from '../api/reviews'
import type { ReviewOut } from '../types/review'

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: '16px', color: i <= rating ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </div>
  )
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewOut[]>([])

  useEffect(() => {
    getReviews().then(setReviews).catch(() => {})
  }, [])

  if (reviews.length === 0) return null

  return (
    <section style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '0 auto', padding: '50px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '46px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '12px' }}>Témoignages</div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>
          Ce que disent nos utilisateurs
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>
          {reviews.length} avis d'utilisateurs
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {reviews.slice(0, 6).map((review) => (
          <div
            key={review.id}
            style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.03),transparent)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stars rating={review.rating} />
              {review.plan === 'pro' && (
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.04em' }}>PRO</span>
              )}
            </div>
            <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#d1d5db', fontWeight: 500, margin: 0, fontStyle: 'italic', flex: 1 }}>
              "{review.content}"
            </p>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>
              {review.author_name}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
