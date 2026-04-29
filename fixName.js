const fs = require('fs');

function rep(file, oldStr, newStr) {
  if (fs.existsSync(file)) {
    let t = fs.readFileSync(file, 'utf8');
    if (t.includes(oldStr)) {
      t = t.split(oldStr).join(newStr);
      fs.writeFileSync(file, t, 'utf8');
      console.log('Updated ' + file);
    }
  }
}

function repRegex(file, regex, newStr) {
  if (fs.existsSync(file)) {
    let t = fs.readFileSync(file, 'utf8');
    if (regex.test(t)) {
      t = t.replace(regex, newStr);
      fs.writeFileSync(file, t, 'utf8');
      console.log('Updated ' + file);
    }
  }
}

const dir = 'd:/medpuls/New folder/src';

rep(dir + '/components/Footer.tsx', 'Hassanin Salah', '<span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">Hasanain Salah</span>');

repRegex(dir + '/app/page.tsx', /<span className="text-slate-400 font-semibold">Hassanin Salah<\/span>/g, '<span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 tracking-wide">Hasanain Salah</span>');
repRegex(dir + '/app/page.tsx', /Hassanin Salah/g, 'Hasanain Salah');

repRegex(dir + '/app/about/page.tsx', /Hassanin Salah/g, '<span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 text-lg">Hasanain Salah</span>');

repRegex(dir + '/app/encyclopedia/[specialty]/page.tsx', /<p className="text-sm font-black text-slate-800 dark:text-white">Hassanin Salah<\/p>/g, '<p className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">Hasanain Salah</p>');
repRegex(dir + '/app/encyclopedia/[specialty]/page.tsx', /Hassanin Salah/g, 'Hasanain Salah');

rep(dir + '/app/layout.tsx', 'Hassanin Salah', 'Hasanain Salah');
repRegex(dir + '/components/AuthContext.tsx', /"Dr\. User"/, '"د. حسنين صلاح"');
repRegex(dir + '/components/AuthContext.tsx', /"user@medpulse\.io"/, '"dr.hasanain@medpulse.io"');
repRegex(dir + '/app/auth/register/page.tsx', /"د\. محمد أحمد"/g, '"د. حسنين صلاح"');
repRegex(dir + '/app/profile/page.tsx', /"د\. محمد أحمد"/g, '"د. حسنين صلاح"');
