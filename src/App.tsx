import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Activity, BrainCircuit, Loader2, AlertCircle, CheckCircle2, 
  Ruler, Shield, Zap, Target, Dumbbell, SquareActivity, 
  Cylinder, Rocket, Microscope, ChevronDown, ChevronUp, Printer
} from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      // Yield to React to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const htmlToImage = await import('html-to-image');
      const element = exportRef.current;
      
      if (!element) return;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      // Create a temporary link to trigger download
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

  const generatePrescription = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (availableEquipment.length === 0) {
        throw new Error('Please select at least one piece of available equipment.');
      }

      // --- Medical Decision Logic (Mock API) ---
      let modifiedEquipment = [...availableEquipment];
      let forcedExercises: string[] = [];
      let reasoningAdditions: string[] = [];
      let feedbackAdditions: string[] = [];

      // Rule A: Neural Fatigue Protection
      if (phaseAngle < 5.0) {
        feedbackAdditions.push('降低總容量 20%-30% (細胞層級疲勞防護)');
        modifiedEquipment = modifiedEquipment.filter(eq => eq !== 'barbell');
        reasoningAdditions.push('偵測到細胞層級疲勞 (Phase Angle < 5.0)，已排除高神經徵召之複雜自由重量 (Barbell)。');
      }

      // Rule B: Asymmetry Compensation
      if (asymmetry > 5.0) {
        forcedExercises.push('Dumbbell Bulgarian Split Squat (單側保加利亞分腿蹲)');
        reasoningAdditions.push('偵測到肌肉不對稱 (Asymmetry > 5.0%)，已強制導入單側獨立發力動作以防範雙側神經缺陷。');
        if (!modifiedEquipment.includes('dumbbells')) {
          modifiedEquipment.push('dumbbells');
        }
      }

      // Rule C: Eccentric Load Reduction (Inflammation & Edema Protection)
      if (ecwRatio > 0.395) {
        forcedExercises.push('Leg Press (蹬舉機)');
        reasoningAdditions.push('警報：偵測到細胞外水分比率 (ECW/TBW > 0.395) 異常，暗示潛在的系統性發炎或嚴重的運動誘發性肌肉損傷 (EIMD)。演算法已主動過濾高離心收縮 (Eccentric) 負荷之動作，以避免發炎反應加劇。');
        if (!modifiedEquipment.includes('leg_press')) {
          modifiedEquipment.push('leg_press');
        }
      }

      const payload = {
        user_metrics: {
          femur_to_torso_ratio: femurRatio,
          core_stability_index: coreStability,
          current_rpe_last_set: currentRPE,
          segmental_asymmetry_percent: asymmetry,
          phase_angle: phaseAngle,
          ecw_tbw_ratio: ecwRatio
        },
        available_equipment: modifiedEquipment,
        target_muscle_group: targetMuscleGroup,
        forced_exercises: forcedExercises,
        reasoning_additions: reasoningAdditions,
        feedback_additions: feedbackAdditions
      };

      const prompt = JSON.stringify(payload, null, 2);

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: `你現在是「Antigravity Fitness OS」的核心運算大腦。你結合了「運動生理與生物力學專家」與「資料科學家」的角色。你的唯一任務是接收使用者的「人體測量 JSON 數據」與「可用器材環境」，並進行約束滿足問題（Constraint Satisfaction Problem）演算，輸出最優化的個人運動處方。

【生物力學演算約束 (Biomechanical Constraints)】
肢體比例適配 (Limb Proportions)：若輸入數據顯示使用者為「長股骨/短軀幹（high femur-to-torso ratio）」，必須在下肢推（Knee Dominant）的動作中，大幅降低「傳統槓鈴背蹲舉」的推薦權重，並強制替換為「哈克深蹲機（Hack Squat）」或「保加利亞分腿蹲」，以減少腰椎剪力（Shear Force）。
環境約束過濾 (Environmental Filtering)：你所推薦的每一項動作，其所需器材必須嚴格存在於使用者提供的 available_equipment 陣列中。絕對不可推薦使用者缺乏的器材。
自律調節演算法 (Autoregulation)：若使用者輸入了上一組的 RPE（自覺感受強度，範圍 1-10），你必須依據漸進式超負荷（Progressive Overload）原則計算下一步。若前一組 RPE < 7，建議增加 2.5%-5% 的負荷；若 RPE > 9，建議維持重量但減少 1 次重複次數。

【進階代謝約束 (Advanced Metabolic Constraints)】
若 JSON 中包含 forced_exercises，必須將其加入推薦動作清單。
若 JSON 中包含 reasoning_additions，必須將其完整納入 biomechanical_reasoning 中。
若 JSON 中包含 feedback_additions，必須將其完整納入 autoregulation_feedback 中。
若 ECW/TBW > 0.395，必須強制從推薦動作中排除「Dumbbell Romanian Deadlift (啞鈴羅馬尼亞硬舉)」或其他高離心拉伸動作。

【輸出格式要求 (Output Schema)】
為了讓前端應用程式能順利解析，你必須嚴格以 JSON 格式輸出，不可包含任何 Markdown 標記（如 \`\`\`json）或額外的閒聊文字。必須包含以下鍵值：
recommended_exercises (Array): 推薦動作清單。
biomechanical_reasoning (String): 以學術語言解釋為何進行此器材適配。
autoregulation_feedback (String): 基於 RPE 的下一組負荷調整建議。`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommended_exercises: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "推薦動作清單"
              },
              biomechanical_reasoning: {
                type: Type.STRING,
                description: "以學術語言解釋為何進行此器材適配"
              },
              autoregulation_feedback: {
                type: Type.STRING,
                description: "基於 RPE 的下一組負荷調整建議"
              }
            },
            required: ["recommended_exercises", "biomechanical_reasoning", "autoregulation_feedback"]
          }
        }
      });

      const text = response.text;
      if (text) {
        setResult(JSON.parse(text));
      } else {
        throw new Error('No response from AI.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center print:p-0 print:bg-white">
      <div className="w-full max-w-6xl print:max-w-none">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Antigravity Fitness OS</h1>
              <p className="text-sm text-gray-400 font-mono mt-1">v2.0 // Biomechanical Optimization Engine</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          {/* Input Panel */}
          <div className={`lg:col-span-5 space-y-6 print:hidden ${isExporting ? 'hidden' : ''}`}>
            
            {/* User Metrics */}
            <div className="glass-panel p-6 space-y-6">
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

              {/* Advanced Metabolic Metrics (Progressive Disclosure) */}
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
                    {/* Segmental Asymmetry */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-400">
                          Segmental Asymmetry % (節段肌肉不對稱率)
                        </label>
                        <span className={`text-sm font-mono font-bold ${asymmetry > 5.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {asymmetry.toFixed(1)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        step="0.1"
                        value={asymmetry}
                        onChange={(e) => setAsymmetry(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                        <span>0% (Symmetrical)</span>
                        <span>15% (Severe)</span>
                      </div>
                    </div>

                    {/* Phase Angle */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-400">
                          Phase Angle, PhA (細胞相位角)
                        </label>
                        <span className={`text-sm font-mono font-bold ${phaseAngle < 5.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {phaseAngle.toFixed(1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="3.0"
                        max="10.0"
                        step="0.1"
                        value={phaseAngle}
                        onChange={(e) => setPhaseAngle(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                        <span>3.0 (Fatigued)</span>
                        <span>10.0 (Optimal)</span>
                      </div>
                    </div>

                    {/* ECW/TBW Ratio */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-400">
                          ECW/TBW Ratio (細胞外水分比率)
                        </label>
                        <span className={`text-sm font-mono font-bold ${ecwRatio > 0.395 ? 'text-orange-500' : 'text-emerald-400'}`}>
                          {ecwRatio.toFixed(3)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.360"
                        max="0.420"
                        step="0.001"
                        value={ecwRatio}
                        onChange={(e) => setEcwRatio(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                        <span>0.360 (Healthy)</span>
                        <span>0.420 (Edema)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Muscle Group */}
            <div className="glass-panel p-6">
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
            <div className="glass-panel p-6">
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
                    🏠 居家訓練 (Home Gym)
                  </button>
                  <button
                    onClick={() => setAvailableEquipment(EQUIPMENT_LIST.map(eq => eq.id))}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    🏢 全器材館 (Mega Gym)
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
                  <span>Computing Prescription...</span>
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
            <div className="glass-panel p-6 h-full min-h-[600px] flex flex-col">
              
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
                    <span>{isExporting ? '⏳ 渲染報告中... (Rendering...)' : '📄 匯出處方報告 (Export PDF)'}</span>
                  </button>
                )}
              </div>

              {result ? (
                <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                  {/* Recommended Exercises */}
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

                  {/* Biomechanical Reasoning */}
                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-gray-500">Biomechanical Reasoning</h3>
                    <div className="p-5 bg-blue-950/20 border border-blue-900/30 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <p className="text-sm leading-relaxed text-gray-300">
                        {result.biomechanical_reasoning}
                      </p>
                    </div>
                  </section>

                  {/* Autoregulation Feedback */}
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
                    Awaiting input parameters to compute optimal biomechanical prescription.
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
          {/* Header */}
          <div style={{ marginBottom: '32px', borderBottom: '2px solid #1e293b', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Antigravity Fitness OS // 個人化生物力學運動處方</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Generated on: {new Date().toLocaleString()}</p>
          </div>

          {/* Content */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Recommended Exercises */}
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

              {/* Biomechanical Reasoning */}
              <section>
                <h3 style={{ fontSize: '14px', fontFamily: 'monospace', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Biomechanical Reasoning</h3>
                <div style={{ padding: '20px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#3b82f6' }}></div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155', margin: 0 }}>
                    {result.biomechanical_reasoning}
                  </p>
                </div>
              </section>

              {/* Autoregulation Feedback */}
              <section>
                <h3 style={{ fontSize: '14px', fontFamily: 'monospace', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Autoregulation Feedback</h3>
                <div style={{ padding: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#10b981' }}></div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', color: '#059669' }} />
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155', margin: 0 }}>
                      {result.autoregulation_feedback}
                    </p>
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
