import { Globe, Settings, CornerUpLeft, ShieldCheck } from 'lucide-react';

const features = [
  { 
    Icon: Globe,        
    title: 'Worldwide Shipping',
    description: 'Fast, insured delivery directly to your doorstep.'
  },
  { 
    Icon: Settings,     
    title: 'Custom Design',
    description: 'Tailor dimensions and finishes to your space.'
  },
  { 
    Icon: ShieldCheck, 
    title: 'Premium Quality',
    description: 'Sustainably sourced materials built to last.'
  },
  { 
    Icon: CornerUpLeft, 
    title: 'Easy Returns',
    description: 'Simple 30-day, no-questions return policy.'
  },
];

export default function FeaturesBar() {
  return (
    <section className="w-full py-0 bg-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="bg-[#FAF9F7] p-5 md:p-6 rounded-[20px] flex flex-col items-start transition-all duration-300 hover:bg-[#F0EEEA] group"
            >
              {/* Soft Circular Icon Box */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-terracotta group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white transition-all duration-300">
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              
              <h3 
                className="font-heading text-[#111111] font-bold text-[17px] mb-1.5 tracking-tight"
              >
                {title}
              </h3>
              
              <p className="text-[#666666] text-[13px] leading-relaxed font-medium">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
