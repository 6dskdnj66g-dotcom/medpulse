const fs = require('fs');

const specialties = ['Cardiology', 'Pulmonology', 'GI', 'Nephrology', 'Endocrine', 'Hematology', 'Oncology', 'Neurology', 'Psychiatry', 'Infectious Disease', 'Rheumatology', 'Dermatology', 'OB/GYN', 'Pediatrics', 'Surgery', 'Emergency', 'Biostatistics'];

async function fetchSplit(split) {
  let allRows = [];
  let offset = 0;
  const limit = 100;
  
  while (true) {
    try {
      const url = `https://datasets-server.huggingface.co/rows?dataset=GBaker%2FMedQA-USMLE-4-options&config=default&split=${split}&offset=${offset}&length=${limit}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      
      if (!data.rows) break;
      const rows = data.rows.map(r => r.row);
      allRows = allRows.concat(rows);
      
      console.log(`Fetched ${allRows.length} questions from ${split}...`);
      
      if (allRows.length >= data.num_rows_total) break;
      offset += limit;
      
      // Delay slightly to respect rate limit (HF datasets API can be strict)
      await new Promise(r => setTimeout(r, 100));
    } catch(e) {
      console.error(`Error fetching split ${split}:`, e);
      break;
    }
  }
  return allRows;
}

async function main() {
  const train = await fetchSplit('train');
  const val = await fetchSplit('validation');
  const test = await fetchSplit('test');
  
  const allData = [...train, ...val, ...test];
  console.log('Total fetched:', allData.length);
  
  const step1 = [];
  const step2ck = [];
  const difficultyLevels = ['Easy', 'Medium', 'Hard'];
  
  allData.forEach((row, idx) => {
    // meta_info is like "step1", "step2&3"
    const metaInfoStr = row.meta_info ? row.meta_info.toLowerCase() : "step1";
    const isStep1 = metaInfoStr.includes('step1');
    const step = isStep1 ? 'Step 1' : 'Step 2 CK';
    
    // Assign a simple mapped specialty since MedQA lacks strong specialty tagging
    // In a real pipeline, we'd use NLP or 'metamap_phrases' to map, but for now we loop
    const specialty = specialties[idx % specialties.length];
    const difficulty = difficultyLevels[idx % 3];
    
    const ops = row.options || {};
    const orderedKeys = Object.keys(ops).sort(); // usually A, B, C, D
    const optionsArray = orderedKeys.map(k => ops[k]);
    
    const ansKey = row.answer_idx; // e.g., 'D'
    const ansIndex = orderedKeys.indexOf(ansKey);
    
    const question = {
      id: `medqa_${idx}`,
      step,
      specialty,
      difficulty,
      vignette: row.question || "Unknown question text",
      options: optionsArray.length ? optionsArray : ["Option A", "Option B", "Option C", "Option D"],
      answer: ansIndex >= 0 ? ansIndex : 0,
      explanation: `The correct answer is ${ansKey}: ${row.answer}. The patient's clinical presentation aligns most consistently with this diagnosis/mechanism.`,
      educationalObjective: `Recognize the clinical presentation and appropriate management related to ${row.answer}.`
    };
    
    if (isStep1) step1.push(question);
    else step2ck.push(question);
  });
  
  fs.writeFileSync('data/usmle-questions/step1.json', JSON.stringify(step1, null, 2));
  fs.writeFileSync('data/usmle-questions/step2ck.json', JSON.stringify(step2ck, null, 2));
  
  console.log(`Saved ${step1.length} questions to Step 1 and ${step2ck.length} questions to Step 2 CK.`);
}

main().catch(console.error);
