const fs = require('fs');

let pageTsx = fs.readFileSync('src/app/simulator/[stationId]/page.tsx', 'utf8');

// Fix `onSave?.(` in handleFinish to call `saveResultLocal(`
pageTsx = pageTsx.replace(
  /onSave\?\.\(data\.total_score, data\.max_score, data\.pass_fail, station\.id\);/g,
  `saveResultLocal(data.total_score, data.max_score, data.pass_fail, station.id);`
);

// Fix unused variables `msg` and `sysRes` - simply remove them as the comment says we are bypassing it
pageTsx = pageTsx.replace(
  /const msg = \{[\s\S]*?timestamp: Date\.now\(\)\n\s*?\};/g,
  ``
);
pageTsx = pageTsx.replace(
  /const sysRes = \{[\s\S]*?timestamp: Date\.now\(\) \+ 100\n\s*?\};/g,
  ``
);

// Fix dependency warning in useCallback for saveResultLocal (add `stationId`? Wait, station.id wasn't in dependency, it's not needed, we can just remove `useCallback` or add deps)
pageTsx = pageTsx.replace(
  /saveResultLocal = useCallback\(\(scoreTotal: number, maxScore: number, passFail: string, stationId: string\) => \{/g,
  `saveResultLocal = useCallback((scoreTotal: number, maxScore: number, passFail: string, stationId: string) => {`
); // Nothing to fix here, wait, the error said `station.id` is missing? No, line 806 was about something else? 
// Let's see the error: 806:6 Warning: React Hook useCallback has a missing dependency: 'station.id'. 

// Wait, the handler where setResult(data) is, is handleFinish.
// Let's fix handleFinish dependencies to include `station.id`. Wait, it had `stationId`, but maybe we called `station.id`?
pageTsx = pageTsx.replace(
  /}, \[messages, stationId, isAr\]\);/g,
  `}, [messages, stationId, isAr, station, saveResultLocal]);`
);

fs.writeFileSync('src/app/simulator/[stationId]/page.tsx', pageTsx);
console.log('pageTsx fixed');
