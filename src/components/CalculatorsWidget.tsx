"use client";

import { useState } from "react";
import { Calculator, X, ChevronRight, Activity } from "lucide-react";

export function CalculatorsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCalc, setActiveCalc] = useState<"menu" | "gcs" | "chads">(
    "menu"
  );

  // GCS State
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);

  // CHADS State
  const [chads, setChads] = useState({
    c: false, h: false, a2: false, d: false, s2: false, v: false, a: false, sc: false
  });

  const calculateGCS = () => eye + verbal + motor;
  
  const calculateChads = () => {
    let score = 0;
    if (chads.c) score += 1;
    if (chads.h) score += 1;
    if (chads.a2) score += 2;
    if (chads.d) score += 1;
    if (chads.s2) score += 2;
    if (chads.v) score += 1;
    if (chads.a) score += 1;
    if (chads.sc) score += 1;
    return score;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center justify-center group"
      >
        <Calculator className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm bg-slate-900 group-hover:pl-2 group-hover:pr-1">
          Clinical Tools
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[600px] animate-in fade-in slide-in-from-bottom-8">
      <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
        <h3 className="font-bold flex items-center">
          <Activity className="w-4 h-4 mr-2 text-sky-400" />
          {activeCalc === "menu" ? "Clinical Calculators" : activeCalc === "gcs" ? "GCS Calculator" : "CHADS₂-VASc"}
        </h3>
        <div className="flex items-center space-x-2">
          {activeCalc !== "menu" && (
            <button onClick={() => setActiveCalc("menu")} className="text-slate-400 hover:text-white text-xs font-semibold">Back</button>
          )}
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {activeCalc === "menu" && (
          <div className="space-y-2">
            <button
              onClick={() => setActiveCalc("gcs")}
              className="w-full bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 shadow-sm flex items-center justify-between transition-colors text-left"
            >
              <div>
                <p className="font-bold text-slate-800 text-sm">Glasgow Coma Scale</p>
                <p className="text-xs text-slate-500">Assess level of consciousness</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setActiveCalc("chads")}
              className="w-full bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 shadow-sm flex items-center justify-between transition-colors text-left"
            >
              <div>
                <p className="font-bold text-slate-800 text-sm">CHA₂DS₂-VASc</p>
                <p className="text-xs text-slate-500">Stroke risk in atrial fibrillation</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {activeCalc === "gcs" && (
          <div className="space-y-4">
            <div className="bg-sky-50 p-4 rounded-xl text-center border border-sky-100">
              <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-4xl font-extrabold text-sky-700">{calculateGCS()}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Eye Opening (1-4)</label>
              <input type="range" min="1" max="4" value={eye} onChange={(e) => setEye(Number(e.target.value))} className="w-full accent-sky-500" />
              <div className="text-xs text-slate-500 text-center font-medium bg-white p-1 rounded border border-slate-200">{eye} - {eye===4?'Spontaneous':eye===3?'To sound':eye===2?'To pressure':'None'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Verbal Response (1-5)</label>
              <input type="range" min="1" max="5" value={verbal} onChange={(e) => setVerbal(Number(e.target.value))} className="w-full accent-sky-500" />
              <div className="text-xs text-slate-500 text-center font-medium bg-white p-1 rounded border border-slate-200">{verbal} - {verbal===5?'Oriented':verbal===4?'Confused':verbal===3?'Words':verbal===2?'Sounds':'None'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Motor Response (1-6)</label>
              <input type="range" min="1" max="6" value={motor} onChange={(e) => setMotor(Number(e.target.value))} className="w-full accent-sky-500" />
              <div className="text-xs text-slate-500 text-center font-medium bg-white p-1 rounded border border-slate-200">{motor} - {motor===6?'Obeys':motor===5?'Localizes':motor===4?'Normal Flexion':motor===3?'Abnormal Flexion':motor===2?'Extension':'None'}</div>
            </div>
          </div>
        )}

        {activeCalc === "chads" && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-4 rounded-xl text-center border border-rose-100">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-4xl font-extrabold text-rose-700">{calculateChads()}</p>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { k: 'c', l: 'Congestive Heart Failure (+1)' },
                { k: 'h', l: 'Hypertension (+1)' },
                { k: 'a2', l: 'Age ≥ 75 (+2)' },
                { k: 'd', l: 'Diabetes Mellitus (+1)' },
                { k: 's2', l: 'Stroke/TIA/TE (+2)' },
                { k: 'v', l: 'Vascular Disease (+1)' },
                { k: 'a', l: 'Age 65-74 (+1)' },
                { k: 'sc', l: 'Sex Category (Female) (+1)' }
              ].map(item => (
                <label key={item.k} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300">
                  <input type="checkbox" checked={chads[item.k as keyof typeof chads]} onChange={(e) => setChads({...chads, [item.k]: e.target.checked})} className="accent-rose-500 w-4 h-4" />
                  <span className="font-medium text-slate-700">{item.l}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
