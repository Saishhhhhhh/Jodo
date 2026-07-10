'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Box, Smartphone, X, ChevronRight, Info, Plus, Star } from 'lucide-react';
import ProductActions from '@/components/ProductActions';

interface ProductPageClientProps {
  product: any;
  localIp: string;
}

export default function ProductPageClient({ product, localIp }: ProductPageClientProps) {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const modelViewerRef = useRef<any>(null);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState({ totalReviews: 0, averageRating: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, authorName: '', authorEmail: '', title: '', body: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch dynamic reviews
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/storefront/products/${product._id}/reviews`);
        const json = await res.json();
        if (json.success) {
          setReviews(json.data);
          setReviewsMeta(json.meta);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();
  }, [product._id]);

  useEffect(() => {
    // If the user arrived via the QR code
    if (searchParams.get('ar') === 'true') {
      setShow3D(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const resolveImgUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) return `http://localhost:4000${url}`;
    return url;
  };

  const images = (product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages 
    : [product.imageUrl]).map(resolveImgUrl);

  const [showQRModal, setShowQRModal] = useState(false);

  const handleARClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setShowQRModal(true);
    } else {
      setShow3D(true);
      setTimeout(() => {
        if (modelViewerRef.current) {
          try {
            modelViewerRef.current.activateAR();
          } catch (e) {}
        }
      }, 500);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:4000/api/storefront/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      const json = await res.json();
      if (json.success) {
        alert('Review submitted successfully! It will appear once approved by an admin.');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, authorName: '', authorEmail: '', title: '', body: '' });
      } else {
        alert(json.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?ar=true` : '';

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* ── Sticky Top Nav (Appears on scroll) ── */}
      <div className={`fixed top-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 transform ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900 hidden md:block">{product.title}</h2>
            <span className="text-lg font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex-shrink-0 scale-90 md:scale-100 origin-right">
            <ProductActions product={{ id: product._id, title: product.title, price: product.price, imageUrl: product.imageUrl, brand: product.vendor }} />
          </div>
        </div>
      </div>

      {/* ── Minimal Top Nav ── */}
      <div className="absolute top-0 left-0 w-full z-30 p-6 flex justify-between items-center mix-blend-difference text-white">
        <Link href="/" className="inline-flex items-center text-sm font-medium hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shop
        </Link>
      </div>

      {/* ── 1. Massive Hero Image ── */}
      <div className="relative w-full h-[85vh] md:h-[95vh] bg-[#f7f5f2]">
        {show3D ? (
          <div className="w-full h-full relative bg-gray-100 flex items-center justify-center">
            <model-viewer
              ref={modelViewerRef}
              src={product.model3dUrl || '/wooden_sofa/scene.gltf'}
              alt={`3D model`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '100%' }}
            >
              <button 
                slot="ar-button" 
                style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }}
                className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium shadow-xl flex items-center gap-2 hover:bg-black transition-colors z-50 whitespace-nowrap"
              >
                <Smartphone className="w-5 h-5" /> View in your room
              </button>
            </model-viewer>
            <button onClick={() => setShow3D(false)} className="absolute top-8 right-8 z-50 bg-black/50 text-white backdrop-blur-md p-3 rounded-full hover:bg-black transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <Image src={images[0]} alt={product.title} fill className="object-cover" unoptimized priority />
        )}
      </div>

      {/* ── 2. Clean Centered Buy Section ── */}
      <div className="max-w-[800px] mx-auto px-5 py-24 flex flex-col items-center text-center">
        <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{product.vendor}</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 leading-tight tracking-tight mb-6">
          {product.title}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed font-light">
          {product.shortDescription || 'Experience a new level of sophistication and comfort, crafted specifically for your space.'}
        </p>
        
        <div className="flex items-center gap-6 mb-12">
          <span className="text-4xl font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {product.compareAtPrice && (
            <span className="text-xl text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-8">
          <div className="w-full h-14 [&>div]:h-full [&_button]:h-full [&_button]:rounded-full [&_button]:text-lg">
            <ProductActions product={{ id: product._id, title: product.title, price: product.price, imageUrl: product.imageUrl, brand: product.vendor }} />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setShow3D(true)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Box className="w-5 h-5" /> View in 3D
          </button>
          <button onClick={handleARClick} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Smartphone className="w-5 h-5" /> AR Try-on
          </button>
        </div>

        {/* View Details Trigger */}
        <button 
          onClick={() => setShowModal(true)}
          className="mt-16 flex items-center justify-between w-full max-w-lg border-b border-gray-200 pb-4 text-left group hover:border-gray-900 transition-colors"
        >
          <span className="text-lg font-medium text-gray-900">View detailed specifications</span>
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
        </button>
      </div>

      {/* ── 3. Uninterrupted Image Flow ── */}
      <div className="w-full flex flex-col">
        {images.slice(1).map((img: string, idx: number) => (
          <div key={idx} className="relative w-full h-[70vh] md:h-[100vh]">
            <Image src={img} alt={`Lifestyle ${idx + 1}`} fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>

      {/* ── 4. Minimalist Reviews Section ── */}
      <div className="w-full bg-[#fcfbf9] py-24 md:py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 tracking-tight">What our customers say</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(reviewsMeta.averageRating) ? 'fill-gray-900 text-gray-900' : 'fill-transparent text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-900">{reviewsMeta.averageRating > 0 ? reviewsMeta.averageRating : '0.0'} / 5</span>
                <span className="text-sm text-gray-500 hidden sm:inline-block border-l border-gray-300 pl-4 ml-2">Based on {reviewsMeta.totalReviews} review{reviewsMeta.totalReviews !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="text-sm font-medium text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors"
            >
              Write a review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No reviews yet. Be the first to review this product!</div>
          ) : (
            <div className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {reviews.map(review => (
                <div key={review._id} className="flex-none w-[300px] md:w-[400px] flex flex-col gap-4 snap-start bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-gray-900 text-gray-900' : 'fill-transparent text-gray-300'}`} />
                    ))}
                  </div>
                  {review.title && <h4 className="font-medium text-gray-900">{review.title}</h4>}
                  <p className="text-gray-700 leading-relaxed font-light text-base md:text-lg">"{review.body}"</p>
                  <div className="mt-auto pt-4 flex items-center gap-3 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{review.authorName}</p>
                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Write Review Modal ── */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showReviewModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => !isSubmitting && setShowReviewModal(false)}>
        <div className={`bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-transform duration-300 ${showReviewModal ? 'scale-100' : 'scale-95'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900">Write a Review</h3>
            <button onClick={() => !isSubmitting && setShowReviewModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={submitReview} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-gray-900 text-gray-900' : 'fill-transparent text-gray-300 hover:text-gray-400'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={reviewForm.authorName} onChange={e => setReviewForm({...reviewForm, authorName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={reviewForm.authorEmail} onChange={e => setReviewForm({...reviewForm, authorEmail: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input type="text" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="Great product!" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
              <textarea required value={reviewForm.body} onChange={e => setReviewForm({...reviewForm, body: e.target.value})} rows={4} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none" placeholder="What did you think?"></textarea>
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full mt-4 bg-gray-900 text-white rounded-full py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Hidden Details Modal (Drawer style) ── */}
      <div className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowModal(false)}>
        <div className={`w-full max-w-md h-full bg-white shadow-2xl p-8 md:p-12 flex flex-col overflow-y-auto transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showModal ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-medium text-gray-900">Details</h3>
            <button onClick={() => setShowModal(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-10">
            {product.productDetails && Object.keys(product.productDetails).length > 0 && (
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Overview</h4>
                <div className="flex flex-col gap-4">
                  {Object.entries(product.productDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-100 pb-4">
                      <span className="text-sm text-gray-500">{key}</span>
                      <span className="text-sm font-medium text-gray-900 text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Materials & Build</h4>
                <div className="flex flex-col gap-4">
                  {product.specifications.map((spec: any, i: number) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                      <span className="text-sm text-gray-500">{spec.key}</span>
                      <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(product.careAndMaintenance || product.warrantyTerms) && (
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Care & Warranty</h4>
                {product.careAndMaintenance && (
                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-900 block mb-2">Care Instructions</span>
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{product.careAndMaintenance}</p>
                  </div>
                )}
                {product.warrantyTerms && (
                  <div>
                    <span className="text-sm font-medium text-gray-900 block mb-2">Warranty</span>
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{product.warrantyTerms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AR QR Code Modal for Desktop ── */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showQRModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowQRModal(false)}>
        <div className={`bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-transform duration-300 ${showQRModal ? 'scale-100' : 'scale-95'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900">AR Try-on</h3>
            <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              {typeof window !== 'undefined' && (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              )}
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Scan with your phone</h4>
            <p className="text-sm text-gray-500 mb-6">
              Open your phone's camera and scan this QR code to view this product in your space using Augmented Reality.
            </p>
            <button 
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
