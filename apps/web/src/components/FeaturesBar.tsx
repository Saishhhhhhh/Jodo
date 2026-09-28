import { Puzzle, PackageCheck, ShieldCheck, Wrench } from 'lucide-react';

const features = [
  { 
    Icon: Puzzle,
    title: 'Tool-Free Assembly',
    description: 'Clicks together like a jigsaw. No screws, no carpenter — just you and your space.'
  },
  { 
    Icon: PackageCheck,
    title: 'Flat-Pack Delivered',
    description: 'Compact packaging, doorstep delivery. Your furniture arrives when you need it.'
  },
  { 
    Icon: ShieldCheck, 
    title: 'Made In-House',
    description: 'Every piece crafted with premium plywood — quality we control, not outsource.'
  },
  { 
    Icon: Wrench, 
    title: 'Help When You Need It',
    description: 'Prefer a hand? Our team can send a carpenter to assist — fast and hassle-free.'
  },
];

export default function FeaturesBar() {
  return (
    <section className="w-full py-0 bg-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {features.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="bg-[#FAF9F7] p-4 md:p-6 rounded-[20px] flex flex-col items-start transition-all duration-300 hover:bg-[#F0EEEA] group h-full"
            >
              {/* Soft Circular Icon Box */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-terracotta group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white transition-all duration-300">
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              
              <h3 
                className="font-heading text-[#111111] font-bold text-[14px] sm:text-[17px] mb-1.5 tracking-tight leading-snug"
              >
                {title}
              </h3>
              
              <p className="text-[#666666] text-[11px] sm:text-[13px] leading-relaxed font-medium">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
