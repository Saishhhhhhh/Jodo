'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Box, Smartphone, X, ChevronRight, ChevronLeft, Info, Plus, Star } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);
  const modelViewerRef = useRef<any>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when any modal or drawer is open so the window scrollbar vanishes
  useEffect(() => {
    if (showModal || showReviewModal || showQRModal || lightboxOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showModal, showReviewModal, showQRModal, lightboxOpen]);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState({ totalReviews: 0, averageRating: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, authorName: '', authorEmail: '', title: '', body: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const selectedAddonsData = product.addons?.filter((a: any) => selectedAddons.includes(a._id)) || [];
  const totalPrice = product.price + selectedAddonsData.reduce((sum: number, a: any) => sum + (a.price || 0), 0);
  const totalComparePrice = product.compareAtPrice ? product.compareAtPrice + selectedAddonsData.reduce((sum: number, a: any) => sum + (a.compareAtPrice || a.price || 0), 0) : undefined;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-slide effect for reviews
  useEffect(() => {
    if (reviews.length === 0 || isSliderHovered) return;
    
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const slider = sliderRef.current;
        const scrollAmount = window.innerWidth < 768 ? 320 : 420;
        
        // If we are at the end, scroll back to start
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000); // Slide every 4 seconds

    return () => clearInterval(interval);
  }, [reviews.length, isSliderHovered]);

  useEffect(() => {
    const DUMMY_REVIEWS = [
      {
        _id: 'r1',
        rating: 5,
        title: 'Exceeded my expectations!',
        body: 'The craftsmanship is absolutely stunning. It fits perfectly in my living room and has completely elevated the space. Delivery was also incredibly smooth and professional.',
        authorName: 'Sarah Jenkins',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      },
      {
        _id: 'r2',
        rating: 5,
        title: 'Beautiful and highly durable',
        body: "I was hesitant to buy furniture online, but this piece is exceptional. The materials feel premium and it's very sturdy. Worth every penny!",
        authorName: 'Michael Chen',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
      },
      {
        _id: 'r3',
        rating: 4,
        title: 'Great design, comfortable',
        body: "Love the minimalist design. It's very comfortable and looks exactly like the photos. Took off one star because shipping took a couple days longer than expected, but otherwise perfect.",
        authorName: 'Priya Patel',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString()
      },
      {
        _id: 'r4',
        rating: 5,
        title: 'A true statement piece',
        body: 'Everyone who visits my home asks where I got this! It’s truly a statement piece. The texture and color are rich and exactly what I was looking for.',
        authorName: 'David Wright',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString()
      },
      {
        _id: 'r5',
        rating: 5,
        title: 'Perfection.',
        body: 'From the unboxing experience to the actual product, everything was flawless. Highly recommend Jodo for anyone looking to upgrade their home.',
        authorName: 'Elena Rodriguez',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
      }
    ];

    // Fetch dynamic reviews
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/products/${product._id}/reviews`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setReviews(json.data);
          setReviewsMeta(json.meta);
        } else {
          setReviews(DUMMY_REVIEWS);
          setReviewsMeta({ totalReviews: 5, averageRating: 4.8 });
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setReviews(DUMMY_REVIEWS);
        setReviewsMeta({ totalReviews: 5, averageRating: 4.8 });
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
    if (url.startsWith('/')) return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${url}`;
    return url;
  };

  // Main image is index 0 (hero), gallery images are index 1+ (lifestyle)
  const images = [product.imageUrl, ...(product.galleryImages || [])]
    .filter(Boolean)
    .map(resolveImgUrl);

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const videoId = product.videoUrl ? getYouTubeId(product.videoUrl) : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') nextLightboxImage();
      if (e.key === 'ArrowLeft') prevLightboxImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, images.length]);

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
    if (reviewForm.rating === 0) {
      alert('Please select a star rating before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      const json = await res.json();
      if (json.success) {
        alert('Review submitted successfully! It will appear once approved by an admin.');
        setShowReviewModal(false);
        setReviewForm({ rating: 0, authorName: '', authorEmail: '', title: '', body: '' });
        setHoverRating(0);
      } else {
        alert(json.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 320 : 420;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
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

      {/* ── 1. Product Layout (Gallery + Details) ── */}
      <div className="max-w-[1400px] mx-auto px-5 pt-4 md:pt-[50px] pb-12 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
        
        {/* Left Column: Image Carousel / 3D Viewer */}
        <div className="w-full mb-8 lg:mb-0 lg:sticky lg:top-[120px]">
          {show3D ? (
            <div className="w-full aspect-[4/5] md:aspect-square relative bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden">
              <model-viewer
                ref={modelViewerRef}
                src={product.model3dUrl || '/wooden_sofa/scene.gltf'}
                alt={`3D model`}
                ar
                ar-scale="fixed"
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
              <button onClick={() => setShow3D(false)} className="absolute top-6 right-6 z-50 bg-black/50 text-white backdrop-blur-md p-3 rounded-full hover:bg-black transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div className="relative w-full aspect-[4/5] md:aspect-square bg-[#efeeea] rounded-2xl overflow-hidden group cursor-pointer" onClick={() => openLightbox(currentSlide)}>
                <Image 
                  src={images[currentSlide] || ''} 
                  alt={`${product.title} - ${currentSlide + 1}`} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                  priority 
                />
                
                {/* Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black shadow-sm transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black shadow-sm transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Dots for mobile */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                      {images.map((_, idx) => (
                        <button 
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                          className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-black w-4' : 'bg-black/30'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Navigation (Desktop) */}
              {images.length > 1 && (
                <div className="hidden md:flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${currentSlide === idx ? 'border-terracotta opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Product Details */}
        <div className="w-full flex flex-col items-start text-left lg:pt-4">
          <span className="text-[11px] md:text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-3 md:mb-4">{product.vendor}</span>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 leading-tight tracking-tight mb-4 md:mb-6">
            {product.title}
          </h1>

          <p className="text-gray-500 leading-relaxed font-light text-[15px] md:text-lg mb-6 md:mb-8 max-w-xl">
            {product.shortDescription || 'Experience a new level of sophistication and comfort, crafted specifically for your space.'}
          </p>
          
          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <span className="text-3xl md:text-4xl font-medium text-gray-900 tracking-tight">₹{totalPrice.toLocaleString('en-IN')}</span>
            {totalComparePrice && (
              <span className="text-lg md:text-xl text-gray-400 line-through">₹{totalComparePrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Addons Selection */}
          {product.addons && product.addons.length > 0 && (
            <div className="w-full max-w-md mb-8">
              <h3 className="text-[13px] md:text-sm font-bold tracking-[0.1em] text-gray-900 uppercase mb-4">Complete your setup</h3>
              <div className="flex flex-col gap-3">
                {product.addons.map((addon: any) => (
                  <label key={addon._id} className={`flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer transition-all ${selectedAddons.includes(addon._id) ? 'border-terracotta bg-terracotta/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={addon.imageUrl} alt={addon.title} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] md:text-sm font-medium text-gray-900 line-clamp-1">{addon.title}</span>
                        <span className="text-[12px] md:text-sm text-gray-500">+ ₹{addon.price?.toLocaleString('en-IN') || addon.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300 shrink-0 ml-4 relative">
                       <input 
                         type="checkbox" 
                         className="opacity-0 absolute inset-0 cursor-pointer"
                         checked={selectedAddons.includes(addon._id)}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedAddons([...selectedAddons, addon._id]);
                           else setSelectedAddons(selectedAddons.filter(id => id !== addon._id));
                         }}
                       />
                       {selectedAddons.includes(addon._id) && <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-terracotta" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start gap-4 w-full max-w-md mb-8">
            <div className="w-full h-12 md:h-14 [&>div]:h-full [&>div]:mb-0 [&_button]:h-full [&_button]:rounded-full [&_button]:text-[13px] md:[&_button]:text-lg">
              <ProductActions 
                product={{ id: product._id, title: product.title, price: product.price, imageUrl: product.imageUrl, brand: product.vendor }} 
                addons={selectedAddonsData.map((a: any) => ({ id: a._id, title: a.title, price: a.price, imageUrl: a.imageUrl, brand: a.vendor }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4 justify-start mb-8">
            <button 
              onClick={() => {
                setShow3D(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="flex items-center gap-2 px-5 py-3 md:px-6 md:py-3 bg-gray-100 hover:bg-gray-200 text-jodo-dark rounded-full font-medium transition-colors shadow-sm text-[13px] md:text-base"
            >
              <Box className="w-4 h-4 md:w-5 md:h-5" /> <span>View in 3D</span>
            </button>
            <button 
              onClick={handleARClick} 
              className="flex items-center gap-2 px-5 py-3 md:px-6 md:py-3 bg-terracotta hover:bg-[#b54a2e] text-white rounded-full font-medium transition-colors shadow-sm text-[13px] md:text-base"
            >
              <Smartphone className="w-4 h-4 md:w-5 md:h-5" /> <span>AR Try-on</span>
            </button>
          </div>

          {(videoId || product.brochureUrl) && (
            <div className="w-full flex flex-col gap-6 mb-8 max-w-xl">
              {videoId && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
                  <iframe 
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`} 
                    title="Product Video" 
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              )}
              {product.brochureUrl && (
                <div className="flex gap-4">
                  <a href={product.brochureUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-4 px-6 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    DOWNLOAD BROCHURE
                  </a>
                </div>
              )}
            </div>
          )}

          {/* View Details Trigger */}
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-between w-full max-w-xl border-b border-gray-200 pb-4 group hover:border-gray-900 transition-colors text-left"
          >
            <span className="text-lg font-medium text-gray-900">View detailed specifications</span>
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </button>
        </div>
      </div>



      {/* ── 4. Minimalist Reviews Section ── */}
      <div className="w-full bg-[#fcfbf9] py-12 md:py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6 md:gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 tracking-tight">What our customers say</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(reviewsMeta.averageRating) ? 'fill-gold text-gold' : 'fill-transparent text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-900">{reviewsMeta.averageRating > 0 ? reviewsMeta.averageRating : '0.0'} / 5</span>
                <span className="text-sm text-gray-500 hidden sm:inline-block border-l border-gray-300 pl-4 ml-2">Based on {reviewsMeta.totalReviews} review{reviewsMeta.totalReviews !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={() => scrollSlider('left')}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-terracotta hover:border-terracotta transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollSlider('right')}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-terracotta hover:border-terracotta transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => setShowReviewModal(true)}
                className="text-sm font-medium text-terracotta border-b border-terracotta pb-1 hover:text-terracotta/80 hover:border-terracotta/80 transition-colors"
              >
                Write a review
              </button>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No reviews yet. Be the first to review this product!</div>
          ) : (
            <div 
              className="relative" 
              onMouseEnter={() => setIsSliderHovered(true)} 
              onMouseLeave={() => setIsSliderHovered(false)}
            >
              <div ref={sliderRef} className="flex overflow-x-auto gap-6 pb-6 md:pb-12 snap-x snap-mandatory hide-scrollbar pt-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {reviews.map(review => (
                  <div key={review._id} className="flex-none w-[320px] md:w-[420px] flex flex-col gap-4 md:gap-5 snap-start bg-white p-6 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= review.rating ? 'fill-gold text-gold' : 'fill-transparent text-gray-200'}`} />
                      ))}
                    </div>
                  {review.title && <h4 className="text-xl font-medium text-gray-900 tracking-tight">{review.title}</h4>}
                  <p className="text-gray-600 leading-relaxed font-light text-base md:text-lg italic">"{review.body}"</p>
                    <div className="mt-auto pt-6 flex items-center gap-4 border-t border-gray-50">
                      <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-base font-semibold text-terracotta shadow-inner">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.authorName}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Write Review Modal ── */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showReviewModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => !isSubmitting && setShowReviewModal(false)}>
        <div className={`bg-white rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl transform transition-transform duration-300 ${showReviewModal ? 'scale-100' : 'scale-95'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-xl font-medium text-gray-900">Write a Review</h3>
            <button onClick={() => !isSubmitting && setShowReviewModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={submitReview} className="flex flex-col gap-3 md:gap-4">
            <div>
              <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-1.5 md:gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map(star => {
                  const isActive = star <= (hoverRating || reviewForm.rating);
                  return (
                    <button 
                      type="button" 
                      key={star} 
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })} 
                      onMouseEnter={() => setHoverRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star className={`w-7 h-7 md:w-9 md:h-9 transition-colors ${isActive ? 'fill-gold text-gold' : 'fill-transparent text-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={reviewForm.authorName} onChange={e => setReviewForm({...reviewForm, authorName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 text-[13px] md:text-base focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={reviewForm.authorEmail} onChange={e => setReviewForm({...reviewForm, authorEmail: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 text-[13px] md:text-base focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input type="text" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 text-[13px] md:text-base focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta" placeholder="Great product!" />
            </div>
            <div>
              <label className="block text-[13px] md:text-sm font-medium text-gray-700 mb-1">Review</label>
              <textarea required value={reviewForm.body} onChange={e => setReviewForm({...reviewForm, body: e.target.value})} rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 text-[13px] md:text-base focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta resize-none" placeholder="What did you think?"></textarea>
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full mt-2 md:mt-4 bg-terracotta text-white rounded-full py-3 md:py-4 font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 text-sm md:text-base">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Hidden Details Modal (Drawer style) ── */}
      <style>{`
        .drawer-clean-scroll::-webkit-scrollbar,
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
          background: transparent !important;
        }
        .drawer-clean-scroll::-webkit-scrollbar-thumb,
        .hide-scrollbar::-webkit-scrollbar-thumb {
          display: none !important;
          background: transparent !important;
          border: none !important;
        }
        .drawer-clean-scroll::-webkit-scrollbar-track,
        .hide-scrollbar::-webkit-scrollbar-track {
          display: none !important;
          background: transparent !important;
          border: none !important;
        }
        .drawer-clean-scroll,
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      <div className={`fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowModal(false)}>
        <div 
          className={`w-full max-w-[700px] md:max-w-[820px] lg:max-w-[900px] h-full bg-white shadow-2xl p-6 md:p-12 lg:p-16 flex flex-col overflow-y-auto hide-scrollbar drawer-clean-scroll transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showModal ? 'translate-x-0' : 'translate-x-full'}`} 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8 md:mb-12 border-b border-gray-100 pb-6">
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1 block">{product.vendor}</span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1a1a]">Specifications</h3>
            </div>
            <button onClick={() => setShowModal(false)} className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors flex-shrink-0">
              <X className="w-6 h-6 md:w-8 md:h-8 font-light" strokeWidth={1} />
            </button>
          </div>

          <div className="flex flex-col gap-10 md:gap-14 pb-16">
            {(product.longDescription || product.shortDescription) && (
              <div>
                <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#1a1a1a] border-b border-gray-200 pb-3 mb-4 md:mb-5 flex items-center gap-2">
                  <span>Product Description</span>
                </h4>
                <div className="text-[15px] md:text-base text-gray-600 leading-relaxed space-y-3.5">
                  {(product.longDescription || product.shortDescription)
                    ?.split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((paragraph, idx) => {
                      if (paragraph.startsWith('•') || paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        const cleanText = paragraph.replace(/^[•\-\*]\s*/, '');
                        return (
                          <div key={idx} className="flex items-start gap-2.5 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0 mt-2.5" />
                            <span className="text-gray-700 leading-relaxed">{cleanText}</span>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="leading-relaxed text-gray-600">
                          {paragraph}
                        </p>
                      );
                    })}
                </div>
              </div>
            )}

            {product.productDetails && Object.keys(product.productDetails).length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] border-b border-gray-200 pb-3 mb-4 md:mb-5">
                  Overview
                </h4>
                <div className="flex flex-col">
                  {Object.entries(product.productDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 md:py-4 border-b border-gray-100">
                      <span className="text-[14px] md:text-[15px] text-gray-500">{key}</span>
                      <span className="text-[14px] md:text-[15px] font-medium text-[#1a1a1a] text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] border-b border-gray-200 pb-3 mb-4 md:mb-5">
                  Materials & Build
                </h4>
                <div className="flex flex-col">
                  {product.specifications.map((spec: any, i: number) => (
                    <div key={i} className="flex flex-col py-3 md:py-4 border-b border-gray-100 gap-1 md:gap-1.5">
                      <span className="text-[12px] md:text-[13px] font-medium text-gray-500">{spec.key}</span>
                      <span className="text-[14px] md:text-[15px] text-[#1a1a1a] leading-relaxed">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(product.careAndMaintenance || product.warrantyTerms) && (
              <div>
                <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] border-b border-gray-200 pb-3 mb-4 md:mb-5">
                  Care & Warranty
                </h4>
                {product.careAndMaintenance && (
                  <div className="mb-6 md:mb-8 pt-2">
                    <span className="text-[14px] md:text-[15px] font-bold text-[#1a1a1a] block mb-2 md:mb-3">Care Instructions</span>
                    <p className="text-[14px] md:text-[15px] text-gray-500 leading-relaxed whitespace-pre-line">{product.careAndMaintenance}</p>
                  </div>
                )}
                {product.warrantyTerms && (
                  <div className="pt-2">
                    <span className="text-[14px] md:text-[15px] font-bold text-[#1a1a1a] block mb-2 md:mb-3">Warranty terms</span>
                    <p className="text-[14px] md:text-[15px] text-gray-500 leading-relaxed whitespace-pre-line">{product.warrantyTerms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AR QR Code Modal for Desktop ── */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showQRModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowQRModal(false)}>
        <div className={`bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-transform duration-300 ${showQRModal ? 'scale-100' : 'scale-95'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900">AR Try-on</h3>
            <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gray-50 p-4 rounded-xl mb-6 min-h-[232px] flex items-center justify-center">
              {mounted && (
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

      {/* ── Lightbox Modal ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" onClick={() => setLightboxOpen(false)}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          >
            <X className="w-8 h-8" />
          </button>
          
          <button 
            className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-colors z-10"
            onClick={prevLightboxImage}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-5xl h-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black/20" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={images[lightboxIndex]} 
              alt={product.title} 
              fill 
              className="object-contain" 
              unoptimized 
              priority 
            />
          </div>
          
          <button 
            className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-colors z-10"
            onClick={nextLightboxImage}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}

    </div>
  );
}
