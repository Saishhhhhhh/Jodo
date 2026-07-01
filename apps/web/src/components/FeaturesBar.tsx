import { Globe, Settings, CornerUpLeft } from 'lucide-react';

const features = [
  { Icon: Globe,        label: 'Worldwide Free Shipping' },
  { Icon: Settings,     label: 'Unique & Custom Design' },
  { Icon: CornerUpLeft, label: 'No Questions Refund' },
];

export default function FeaturesBar() {
  return (
    <section
      className="w-full my-20"
      style={{ borderTop: '1px solid rgba(200,168,130,0.5)', borderBottom: '1px solid rgba(200,168,130,0.5)' }}
    >
      <div className="max-w-[1280px] mx-auto px-10 lg:px-16">
        <div className="flex items-center gap-10 lg:gap-16">

          {features.map(({ Icon, label }, i) => (
            <div
              key={label}
              className="flex-1 flex items-center gap-5 py-10 px-6"
              style={{
                borderLeft:  '1px solid rgba(200,168,130,0.5)',
                borderRight: '1px solid rgba(200,168,130,0.5)',
              }}
            >
              <div className="shrink-0">
                <Icon className="w-9 h-9 text-[#1C1A17]" strokeWidth={1.25} />
              </div>
              <span className="text-[#1C1A17] font-bold text-[15px] tracking-wide whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
