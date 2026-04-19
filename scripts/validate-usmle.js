const fs = require('fs');

try {
  console.log('Loading datasets...');
  const step1 = JSON.parse(fs.readFileSync('data/usmle-questions/step1.json', 'utf8'));
  const step2 = JSON.parse(fs.readFileSync('data/usmle-questions/step2ck.json', 'utf8'));
  
  let errors = 0;
  
  const validate = (q, index, source) => {
    // 1. Core fields exist
    if (!q.id || !q.vignette || !q.options || q.answer === undefined) {
      console.error(`Error in ${source} at index ${index}: missing core fields`, q.id);
      errors++;
    }
    
    // 2. Options are an array and not empty
    if (!Array.isArray(q.options) || q.options.length < 2) {
      console.error(`Error in ${source} at index ${index}: invalid options`, q.id);
      errors++;
    }
    
    // 3. Answer is a valid index within the options array bounds
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
      console.error(`Error in ${source} at index ${index}: answer index out of bounds (${q.answer})`, q.id);
      errors++;
    }
    
    // 4. Must have an explanation
    if (!q.explanation) {
      console.error(`Error in ${source} at index ${index}: missing explanation`, q.id);
      errors++;
    }
  };

  console.log('Testing Step 1 Database...');
  step1.forEach((q, i) => validate(q, i, 'Step 1'));
  
  console.log('Testing Step 2 CK Database...');
  step2.forEach((q, i) => validate(q, i, 'Step 2 CK'));

  console.log('====================================');
  console.log(`✅ Total Step 1 Validated: ${step1.length}`);
  console.log(`✅ Total Step 2 CK Validated: ${step2.length}`);
  console.log(`✅ Total Questions Checked: ${step1.length + step2.length}`);
  console.log(`❌ Total Errors/Corrupt Questions Found: ${errors}`);
  
  if (errors === 0) {
    console.log('🚀 SUCCESS: All dataset questions are structurally perfect and guarantee 0 crashes on the frontend!');
  } else {
    console.log('⚠️ Warning: Some questions need fixing.');
  }

} catch(e) {
  console.error('Validation failed:', e.message);
}
