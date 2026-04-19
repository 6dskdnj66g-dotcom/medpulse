const fs = require("fs");
let pageTsx = fs.readFileSync("src/app/simulator/[stationId]/page.tsx", "utf8");

const targetLocationInfo = "const isAr = lang === \"ar\";";
const insertStr = `

  const saveResultLocal = useCallback((scoreTotal: number, maxScore: number, passFail: string, stationId: string) => {
    try {
      const history = JSON.parse(localStorage.getItem("osce_history") || "[]");
      history.push({ stationId, score: scoreTotal, maxScore, passFail, date: new Date().toISOString() });
      localStorage.setItem("osce_history", JSON.stringify(history));
    } catch(e) {}
  }, []);`;

if (!pageTsx.includes("const saveResultLocal =")) {
  pageTsx = pageTsx.replace(targetLocationInfo, targetLocationInfo + insertStr);
}

pageTsx = pageTsx.replace(
  /setEvaluating\(false\);\s*\}\s*\}, \[([^\]]+)\]\);/g,
  function(match, deps) {
    if (!deps.includes("saveResultLocal")) {
      return match.replace(deps, deps + ", saveResultLocal");
    }
    return match;
  }
);

fs.writeFileSync("src/app/simulator/[stationId]/page.tsx", pageTsx);
console.log("Patch complete.");

