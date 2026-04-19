const fs = require('fs');
let code = fs.readFileSync('src/app/usmle/page.tsx', 'utf-8');

if (!code.includes('const [specialtyPref,')) {
    code = code.replace(
        'const [stepPref, setStepPref] = useState<StepPref>("all");',
        `const [stepPref, setStepPref] = useState<StepPref>("all");
  const [specialtyPref, setSpecialtyPref] = useState<string>("all");`
    );
    
    code = code.replace(
        'specialty: "all",',
        'specialty: specialtyPref,'
    );

    const specialtyJSX = `
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject / System (UWorld Style)</label>
                <div className="relative">
                  <select 
                    value={specialtyPref} 
                    onChange={(e) => setSpecialtyPref(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer border border-gray-600 font-medium"
                  >
                    <option value="all">All Systems (Mixed Block)</option>
                    <option value="Cardiovascular">Cardiology / Cardiovascular</option>
                    <option value="Pulmonology">Pulmonology / Respiratory</option>
                    <option value="Gastroenterology">Gastroenterology / GI</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Hematology">Hematology / Oncology</option>
                    <option value="Nephrology">Nephrology / Renal</option>
                    <option value="Infectious Disease">Infectious Disease</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Rheumatology">Rheumatology / Musculoskeletal</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Reproductive">Reproductive / ObGyn</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Pharmacology">General Pharmacology</option>
                    <option value="Microbiology">General Microbiology</option>
                    <option value="Biochemistry">Biochemistry & Genetics</option>
                    <option value="Pathology">General Pathology</option>
                    <option value="Behavioral Science">Behavioral Science / Ethics</option>
                    <option value="Public Health">Public Health / Epidemiology</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>`;

    code = code.replace(
        '<div>\n                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>',
        `${specialtyJSX}\n\n              <div>\n                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>`
    );
     // space/cr workaround
     code = code.replace(
        '<div>\r\n                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>',
        `${specialtyJSX}\n\n              <div>\r\n                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>`
    );
}

fs.writeFileSync('src/app/usmle/page.tsx', code);
console.log('Patched Specialties');