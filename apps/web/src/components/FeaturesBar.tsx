import { Puzzle, PackageCheck, ShieldCheck, Truck, Scan } from 'lucide-react';

const features = [
  { 
    Icon: Puzzle,
    title: 'Smart Furniture',
    description: 'Comes together like a perfect puzzle. No screws, no carpenter, no confusing manuals — Slide. Lock. Done.'
  },
  { 
    Icon: PackageCheck,
    title: 'Convenience',
    description: 'Compact flat pack packaging and doorstep delivery. Your furniture arrives when you need it, the way you want it'
  },
  { 
    Icon: ShieldCheck, 
    title: 'Quality Promise',
    description: 'Every piece is designed and put together with materials made for Indian homes and the Indian way of living'
  },
  { 
    Icon: Truck, 
    title: 'Made to Move',
    description: 'From first home to next home, JODO fits right in because your furniture should keep up with your life'
  },
  { 
    Icon: Scan, 
    title: 'Try before you Buy',
    description: 'Using Augmented Reality we have created virtual trial rooms for your furniture, see the pieces you like in true scale in your space before you buy'
  },
];

export default function FeaturesBar() {
  return (
    <section className="w-full py-0 bg-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4 lg:gap-5">
          {features.map(({ Icon, title, description }, idx) => (
            <div
              key={title}
              className={`bg-[#FAF9F7] p-5 md:p-6 rounded-[20px] flex flex-col items-start transition-all duration-300 hover:bg-[#F0EEEA] group h-full ${
                idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Soft Circular Icon Box */}
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-terracotta group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white transition-all duration-300">
                <Icon className="w-6 h-6" strokeWidth={2.2} />
              </div>
              
              <h3 
                className="font-heading text-[#111111] font-bold text-[15px] sm:text-[16px] xl:text-[17px] mb-1.5 tracking-tight leading-snug"
              >
                {title}
              </h3>
              
              <p className="text-[#666666] text-[12px] sm:text-[12.5px] xl:text-[13px] leading-relaxed font-medium">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
