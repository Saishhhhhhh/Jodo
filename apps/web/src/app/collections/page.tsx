import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

async function getCollections() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/collections`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();
  
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-20 md:pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-12 md:mb-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1C1A17] mb-4 tracking-tight">Explore Collections</h1>
          <p className="text-gray-500 max-w-2xl text-lg px-2">
            Discover our curated sets of furniture designed to beautifully coordinate and elevate your living spaces.
          </p>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">No collections found</h3>
            <p>We are currently updating our collections. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {collections.map((collection: any) => (
              <Link 
                key={collection._id} 
                href={`/collections/${collection.slug}`}
                className="group relative flex flex-col gap-4"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 group-hover:shadow-xl transition-all duration-500">
                  <Image
                    src={collection.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'}
                    alt={collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Floating Content */}
                  <div className="absolute bottom-0 left-0 p-8 w-full flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {collection.title}
                      </h2>
                      {collection.description && (
                        <p className="text-white/80 text-sm line-clamp-2 max-w-[85%] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
