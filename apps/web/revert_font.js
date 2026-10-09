const fs = require('fs');
const files = [
  'src/components/coming-soon/ComingSoonSection.tsx',
  'src/components/coming-soon/HeroSection.tsx',
  'src/components/coming-soon/PhilosophySection.tsx',
  'src/components/coming-soon/Navigation.tsx',
  'src/components/coming-soon/TableScene.tsx',
  'src/components/coming-soon/FooterSection.tsx',
  'src/components/coming-soon/ComingSoonPage.tsx',
  'src/components/coming-soon/BrandStatementSection.tsx',
  'src/app/globals.css',
  'tailwind.config.ts'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/font-dmsans/g, 'font-serif');
    content = content.replace(/dmsans:\s*\["var\(--font-dm-sans\)"/g, 'serif: ["var(--font-dm-sans)"');
    fs.writeFileSync(f, content);
    console.log('Reverted ' + f);
  }
});
