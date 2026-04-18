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

    // 1. Remove the useEffect that forces login redirection
    content = content.replace(/useEffect\(\(\) => \{\s*if \(!loading && !user\)[^}]*\}\s*\}, \[loading, user\]\);/g, '');
    content = content.replace(/useEffect\(\(\) => \{\s*if \(!loading && !user\)[^}]*\}\s*\}, \[loading, user, router\]\);/g, '');
    content = content.replace(/useEffect\(\(\) => \{\s*if \(!isLoading && !user\)[^}]*\}\s*\}, \[isLoading, user, router\]\);/g, '');
    content = content.replace(/\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\s*/g, '');

    // 2. Remove the null returns that block the page from rendering without a user
    content = content.replace(/if \(isLoading \|\| !user\) return null;/g, 'if (isLoading) return null;');
    content = content.replace(/if \(loading \|\| !user\) return null;/g, 'if (loading) return null;');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } catch (e) {
    console.error(`Error updating ${file}:`, e.message);
  }
});
