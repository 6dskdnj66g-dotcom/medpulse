const fs = require('fs');

let code = fs.readFileSync('src/app/usmle/page.tsx', 'utf8');

if (code.includes('BookmarkPlus')) {
    code = code.replace(
        `import { Play, RotateCcw, CheckCircle, XCircle, AlertCircle, Save, Calendar, ExternalLink, Activity, Highlighter, Edit3, BookmarkPlus }`,
        `import { Play, RotateCcw, CheckCircle, XCircle, AlertCircle, Save, Calendar, ExternalLink, Activity, Highlighter, Edit3, BookmarkPlus }`
    );

    code = code.replace(
        `                      <div className="absolute right-2 top-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Activity className="w-5 h-5" />
                      </div>`,
        `                      <div className="absolute right-2 top-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Edit3 className="w-5 h-5 cursor-pointer hover:text-blue-400" onClick={() => setShowNotes(!showNotes)} />
                        <BookmarkPlus className="w-5 h-5 cursor-pointer hover:text-amber-400" onClick={() => handleSaveFlashcard(q)} />
                        <Activity className="w-5 h-5" />
                      </div>`
    );
    fs.writeFileSync('src/app/usmle/page.tsx', code);
    console.log('Patched');
} else {
    console.log('Skipping patch');
}
