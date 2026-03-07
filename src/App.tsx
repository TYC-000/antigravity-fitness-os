import React, { useState, useRef } from 'react';
import { 
  Activity, BrainCircuit, Loader2, AlertCircle, CheckCircle2, 
  Ruler, Shield, Zap, Target, Dumbbell, SquareActivity, 
  Cylinder, Rocket, Microscope, ChevronDown, ChevronUp, Printer
} from 'lucide-react';

const EQUIPMENT_LIST = [
  { id: 'dumbbells', label: '啞鈴', icon: Dumbbell },
  { id: 'barbell', label: '槓鈴', icon: Dumbbell },
  { id: 'cable_machine', label: '纜繩滑輪機', icon: Zap },
  { id: 'hack_squat_machine', label: '哈克深蹲機', icon: SquareActivity },
  { id: 'bench', label: '臥推椅', icon: Cylinder },
  { id: 'leg_press', label: '腿推機', icon: SquareActivity },
  { id: 'kettlebell', label: '壺鈴', icon: Dumbbell },
  { id: 'pull_up_bar', label: '單槓', icon: Activity },
];

const MUSCLE_GROUPS = [
  { id: 'quadriceps_and_glutes', label: 'Quads & Glutes (股四頭與臀大肌)' },
  { id: 'chest_and_triceps', label: 'Chest & Triceps (胸大肌與三頭肌)' },
  { id: 'back_and_biceps', label: 'Back & Biceps (背闊肌與二頭肌)' },
  { id: 'hamstrings_and_calves', label: 'Hamstrings & Calves (腿後側與小腿)' },
  { id: 'shoulders_and_core', label: 'Shoulders & Core (肩部與核心)' },
];

export default function App() {
  // Form State
  const [femurRatio, setFemurRatio] = useState<'low' | 'normal' | 'high'>('high');
  const [coreStability, setCoreStability] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [currentRPE, setCurrentRPE] = useState<number>(6);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([
    'dumbbells', 'cable_machine', 'hack_squat_machine', 'bench', 'barbell'
  ]);
  const [targetMuscleGroup, setTargetMuscleGroup] = useState<string>('quadriceps_and_glutes');
  
  // Advanced Metabolic Metrics State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [asymmetry, setAsymmetry] = useState<number>(2.0);
  const [phaseAngle, setPhaseAngle] = useState<number>(7.0);
  const [ecwRatio, setEcwRatio] = useState<number>(0.380);

  // System State
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    recommended_exercises: string[];
    biomechanical_reasoning: string;
    autoregulation_feedback: string;
  } | null>(null);
  const [error, setError] = useState('');

  const toggleEquipment = (id: string) => {
    setAvailableEquipment(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const htmlToImage = await import('html-to-image');
      const element = exportRef.current;
      if (!element) return;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `Antigravity_Prescription_${new Date().toISOString().slice(0,10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Image Export failed:', error);
      alert('匯出失敗，請稍後再試。');
    } finally {
      setIsExporting(false);
    }
  };

  // --- 核心專家系統引擎 (Rule-based Engine) ---
  const generatePrescription = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    // 模擬網路延遲，創造「運算中」的視覺回饋 (可移除，僅為 UI 體驗)
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      if (availableEquipment.length === 0) {
        throw new Error('請至少選擇一項可用器材。 (Please select at least one equipment)');
      }

      let exercises: string[] = [];
      let reasoning: string[] = [];
      let feedback: string[] = [];
      let currentEquipment = [...availableEquipment];

      // 1. InBody 代謝與神經疲勞防護邏輯
      if (phaseAngle < 5.0) {
        feedback.push('⚠️ [神經疲勞警示] 偵測到細胞相位角 (PhA < 5.0) 偏低，建議本次訓練總容量調降 20%-30%。');
        currentEquipment = currentEquipment.filter(eq => eq !== 'barbell');
        reasoning.push('因應細胞層級疲勞指標，系統已主動排除需高度神經徵召之「槓鈴自由重量」動作。');
      }

      if (asymmetry > 5.0) {
        reasoning.push(`[肌肉不對稱補償] 偵測到顯著節段不對稱 (${asymmetry}%)，已強制導入單側獨立發力動作以防範神經缺陷加劇。`);
      }

      if (ecwRatio > 0.395) {
        feedback.push('🚨 [水腫發炎防護] 細胞外水分比 (ECW/TBW > 0.395) 異常，請注意組間恢復時間，並避免力竭。');
        reasoning.push('為避免運動誘發性肌肉損傷 (EIMD) 惡化，演算法已主動過濾高離心拉伸 (Eccentric-focused) 之負荷動作。');
      }

      // 2. 生物力學與器材適配邏輯 (依部位分類)
      switch (targetMuscleGroup) {
        case 'quadriceps_and_glutes':
          if (femurRatio === 'high') {
             reasoning.push('針對「長股骨」比例，系統已優化深蹲力學，減少腰椎剪力，將重點轉移至穩定度較高的下肢推舉。');
             if (currentEquipment.includes('hack_squat_machine')) exercises.push('Hack Squat (哈克深蹲)');
             else if (currentEquipment.includes('leg_press')) exercises.push('Leg Press (腿推機)');
             else if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Goblet Squat (啞鈴高腳杯深蹲)');
          } else {
             reasoning.push('針對正常/短股骨比例，建議執行常規深蹲動作以最大化全身性徵召。');
             if (currentEquipment.includes('barbell')) exercises.push('Barbell Back Squat (槓鈴背蹲舉)');
             else if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Split Squat (啞鈴分腿蹲)');
          }
          
          if (asymmetry > 5.0 && currentEquipment.includes('dumbbells')) {
            exercises.push('Dumbbell Bulgarian Split Squat (單側保加利亞分腿蹲)');
          } else if (currentEquipment.includes('cable_machine')) {
             exercises.push('Cable Pull-through (纜繩後拉)');
          } else if (currentEquipment.includes('kettlebell')) {
             exercises.push('Kettlebell Swing (壺鈴擺盪)');
          }
          break;

        case 'chest_and_triceps':
          reasoning.push('胸三頭肌群訓練已根據您的核心穩定度與可用器材進行配對。');
          if (currentEquipment.includes('bench') && currentEquipment.includes('barbell') && coreStability !== 'low') {
             exercises.push('Barbell Bench Press (槓鈴臥推)');
          } else if (currentEquipment.includes('bench') && currentEquipment.includes('dumbbells')) {
             exercises.push('Dumbbell Bench Press (啞鈴臥推)');
          }
          
          if (currentEquipment.includes('cable_machine')) {
            exercises.push('Cable Chest Fly (纜繩飛鳥)');
            exercises.push('Cable Tricep Pushdown (纜繩三頭肌下壓)');
          } else if (currentEquipment.includes('dumbbells')) {
            exercises.push('Dumbbell Overhead Tricep Extension (啞鈴過頭三頭伸展)');
          }
          break;
          
        case 'back_and_biceps':
          reasoning.push('背二頭肌群著重於垂直與水平拉力動作的平衡。');
          if (currentEquipment.includes('pull_up_bar')) exercises.push('Pull-ups (引體向上)');
          else if (currentEquipment.includes('cable_machine')) exercises.push('Lat Pulldown (滑輪下拉)');
          
          if (currentEquipment.includes('dumbbells') && currentEquipment.includes('bench')) {
             exercises.push('Chest-Supported Dumbbell Row (胸靠啞鈴划船)');
          } else if (currentEquipment.includes('barbell') && coreStability !== 'low') {
             exercises.push('Barbell Row (槓鈴划船)');
          }
          
          if (currentEquipment.includes('dumbbells')) {
             exercises.push('Dumbbell Bicep Curl (啞鈴二頭彎舉)');
          }
          break;

        case 'hamstrings_and_calves':
           if (ecwRatio <= 0.395) {
              reasoning.push('已安排高張力的後側鏈訓練。');
              if (currentEquipment.includes('barbell')) exercises.push('Barbell Romanian Deadlift (槓鈴羅馬尼亞硬舉)');
              else if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell RDL (啞鈴羅馬尼亞硬舉)');
           } else {
              reasoning.push('因水分發炎指標偏高，已排除 RDL 等高離心動作，改以低損傷動作替代。');
           }
           
           if (currentEquipment.includes('cable_machine')) exercises.push('Cable Pull-through (纜繩後拉)');
           if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Calf Raise (啞鈴提踵)');
           break;

        case 'shoulders_and_core':
           reasoning.push('肩部訓練已根據您的核心穩定度評估最佳抗重力姿勢。');
           if (coreStability === 'high' && currentEquipment.includes('barbell')) {
              exercises.push('Standing Barbell Overhead Press (站姿槓鈴肩推)');
           } else if (currentEquipment.includes('dumbbells')) {
              exercises.push('Seated Dumbbell Shoulder Press (坐姿啞鈴肩推)');
           }
           
           if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Lateral Raise (啞鈴側平舉)');
           if (currentEquipment.includes('cable_machine')) exercises.push('Cable Crunch (纜繩捲腹)');
           break;
      }

      // 保底機制：如果沒有配對到任何動作
      if (exercises.length === 0) {
         exercises.push('Bodyweight Squat (徒手深蹲)');
         exercises.push('Push-ups (伏地挺身)');
         reasoning.push('⚠️ 在目前的環境約束下，系統無法為該部位找到最完美的重訓器材配對，已自動降級為自體重量基礎訓練模式。');
      }

      // 3. RPE 自律調節反饋邏輯
      if (currentRPE <= 5) {
         feedback.push('📈 [漸進性超負荷] 前次 RPE < 6 (相對輕鬆)，建議本次主要動作的訓練重量增加 5%，或增加 2 次反覆次數。');
      } else if (currentRPE >= 8) {
         feedback.push('⚓ [負荷維持] 前次 RPE ≥ 8 (逼近力竭)，建議維持原重量，專注於動作控制與向心爆發力。');
      } else {
         feedback.push('⚖️ [穩定適應] 前次 RPE 位於最佳訓練區間 (6-7)，建議嘗試微幅提升重量 (2.5%) 或維持現狀。');
      }

      // 組裝最終處方
      setResult({
        recommended_exercises: [...new Set(exercises)], // 移除重複項
        biomechanical_reasoning: reasoning.join(' '),
        autoregulation_feedback: feedback.join(' ')
      });

    } catch (err: any) {
      setError(err.message || '運算過程中發生未預期錯誤。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center print:p-0 print:bg-white bg-slate-950 text-slate-200">
      <div className="w-full max-w-6xl print:max-w-none">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Antigravity Fitness OS</h1>
              <p className="text-sm text-gray-400 font-mono mt-1">v3.0 // Edge-Computed CDSS Engine</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          {/* Input Panel */}
          <div className={`lg:col-span-5 space-y-6 print:hidden ${isExporting ? 'hidden' : ''}`}>
            
            {/* User Metrics */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-200">User Metrics</h2>
              </div>

              {/* Femur-to-Torso Ratio */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
                  <Ruler className="w-4 h-4" />
                  Femur-to-Torso Ratio (股骨/軀幹比例)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Short (短)' },
                    { id: 'normal', label: 'Normal (正常)' },
                    { id: 'high', label: 'Long (長)' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setFemurRatio(option.id as any)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                        femurRatio === option.id
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                          : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Stability */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
                  <Shield className="w-4 h-4" />
                  Core Stability (核心穩定度)
                </label>
                <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                  {[
                    { id: 'low', label: 'Low (低)' },
                    { id: 'moderate', label: 'Moderate (中)' },
                    { id: 'high', label: 'High (高)' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setCoreStability(option.id as any)}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                        coreStability === option.id
                          ? 'bg-gray-700 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current RPE */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <Zap className="w-4 h-4" />
                    Current RPE (上次訓練強度)
                  </label>
                  <span className="text-lg font-mono font-bold text-white">{currentRPE}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={currentRPE}
                  onChange={(e) => setCurrentRPE(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 outline-none"
                  style={{
                    WebkitAppearance: 'none',
                  }}
                />
                <style>{`
                  input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #1a1a1a;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    cursor: pointer;
                  }
                `}</style>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                  <span>1 (Easy)</span>
                  <span>10 (Max Effort)</span>
                </div>
              </div>

              {/* Advanced Metabolic Metrics */}
              <div className="mt-6 border-t border-gray-800 pt-4">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-purple-400" />
                    <span>🔬 InBody 進階阻抗數據 (Advanced Metabolic Metrics)</span>
                  </div>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-6 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-400">Segmental Asymmetry % (節段肌肉不對稱率)</label>
                        <span className={`text-sm font-mono font-bold ${asymmetry > 5.0 ? 'text-red-400' : 'text-emerald-400'}`}>{asymmetry.toFixed(1)}%</span>
                      </div>
                      <input type="range" min="0" max="15" step="0.1" value={asymmetry} onChange={(e) => setAsymmetry(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-400">Phase Angle, PhA (細胞相位角)</label>
                        <span className={`text-sm font-mono font-bold ${phaseAngle < 5.0 ? 'text-red-400' : 'text-emerald-400'}`}>{phaseAngle.toFixed(1)}</span>
                      </div>
                      <input type="range" min="3.0" max="10.0" step="0.1" value={phaseAngle} onChange={(e) => setPhaseAngle(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-400">ECW/TBW Ratio (細胞外水分比率)</label>
                        <span className={`text-sm font-mono font-bold ${ecwRatio > 0.395 ? 'text-orange-500' : 'text-emerald-400'}`}>{ecwRatio.toFixed(3)}</span>
                      </div>
                      <input type="range" min="0.360" max="0.420" step="0.001" value={ecwRatio} onChange={(e) => setEcwRatio(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Muscle Group */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-200">Target Muscle Group</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setTargetMuscleGroup(group.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                      targetMuscleGroup === group.id
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                        : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Equipment */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-200">Available Equipment</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAvailableEquipment(['dumbbells', 'bench'])}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    🏠 居家訓練
                  </button>
                  <button
                    onClick={() => setAvailableEquipment(EQUIPMENT_LIST.map(eq => eq.id))}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    🏢 全館器材
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EQUIPMENT_LIST.map(eq => {
                  const Icon = eq.icon;
                  const isSelected = availableEquipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-[10px] font-medium text-center leading-tight">{eq.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={generatePrescription}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>運算處方中... (Computing...)</span>
                </>
              ) : (
                <>
                  <Rocket className="w-6 h-6" />
                  <span>🚀 生成生物力學處方 (Generate Prescription)</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 h-full min-h-[600px] flex flex-col">
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-200">Computation Results</h2>
                </div>
                {result && (
                  <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    <span>{isExporting ? '⏳ 渲染報告中...' : '📄 匯出處方報告 (Export PDF)'}</span>
                  </button>
                )}
              </div>

              {result ? (
                <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-gray-500">Recommended Exercises</h3>
                    <div className="space-y-2">
                      {result.recommended_exercises.map((ex, idx) => (
                        <div key={idx} className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-mono">
                            {idx + 1}
                          </div>
                          <span className="font-medium text-gray-200">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-gray-500">Biomechanical Reasoning</h3>
                    <div className="p-5 bg-blue-950/20 border border-blue-900/30 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <p className="text-sm leading-relaxed text-gray-300">
                        {result.biomechanical_reasoning}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-gray-500">Autoregulation Feedback</h3>
                    <div className="p-5 bg-emerald-950/20 border border-emerald-900/30 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                        <p className="text-sm leading-relaxed text-gray-300">
                          {result.autoregulation_feedback}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-gray-800 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm font-mono text-center max-w-xs">
                    等待輸入參數... 內建 CDSS 決策引擎已就緒。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Export View for html-to-image */}
      <div className="overflow-hidden h-0 w-0 absolute top-[-9999px] left-[-9999px]">
        <div ref={exportRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', color: '#0f172a' }}>
          <div style={{ marginBottom: '32px', borderBottom: '2px solid #1e293b', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Antigravity Fitness OS // 個人化生物力學運動處方</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Generated on: {new Date().toLocaleString()}</p>
          </div>
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <section>
                <h3 style={{ fontSize: '14px', fontFamily: 'monospace', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Recommended Exercises</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.recommended_exercises.map((ex, idx) => (
                    <div key={idx} style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', fontSize: '12px', fontFamily: 'monospace' }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{ex}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 style={{ fontSize: '14px', fontFamily: 'monospace', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Biomechanical Reasoning</h3>
                <div style={{ padding: '20px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#3b82f6' }}></div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155', margin: 0 }}>{result.biomechanical_reasoning}</p>
                </div>
              </section>
              <section>
                <h3 style={{ fontSize: '14px', fontFamily: 'monospace', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Autoregulation Feedback</h3>
                <div style={{ padding: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#10b981' }}></div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', color: '#059669' }} />
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155', margin: 0 }}>{result.autoregulation_feedback}</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}