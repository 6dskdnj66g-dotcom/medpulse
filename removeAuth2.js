const fs = require('fs');

const targetFiles = [
  'src/app/calculators/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/drug-checker/page.tsx',
  'src/app/ecg/page.tsx',
  'src/app/mdt/page.tsx',
  'src/app/notes/page.tsx',
  'src/app/simulator/page.tsx',
  'src/app/summarizer/page.tsx',
  'src/app/translator/page.tsx',
  'src/app/usmle/page.tsx'
];

targetFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');

    // Matches `useEffect(() => { if (!loading && !user) router.replace("/auth/login"); }, [loading, user, router]);`
    // across multiple lines or single line
    content = content.replace(/useEffect\(\(\) => \{\s*if \(!loading && !user\) router\.replace\("\/auth\/login"\);\s*\}, \[loading, user(?:, router)?\]\);/g, '');
    content = content.replace(/useEffect\(\(\) => \{\s*if \(!isLoading && !user\) \{\s*router\.replace\("\/auth\/login"\);\s*\}\s*\}, \[isLoading, user, router\]\);/g, '');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } catch (e) {
    console.error(`Error updating ${file}:`, e.message);
  }
});
