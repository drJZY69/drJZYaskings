
import React, { useState } from 'react';
import { Question, QuizResult, UserResponse } from './types';
import { evaluateQuiz, generateQuestions } from './services/geminiService';
import { ChevronRight, Zap, ArrowLeft, Check, X, History, Loader2, Share2 } from 'lucide-react';
import Logo from './Logo';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'landing' | 'quiz' | 'result' | 'review'>('landing');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);

  const startQuiz = async () => {
    setIsGeneratingQuestions(true);
    try {
      const newQuestions = await generateQuestions();
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setResponses([]);
      setAiEvaluation(null);
      setCurrentStep('quiz');
    } catch (error) {
      alert("حدث خطأ أثناء توليد الأسئلة، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const shareWebsite = async () => {
    const shareData = {
      title: 'VenusAR Admin Quiz',
      text: 'هل تعتقد أنك تصلح لتكون إدارياً؟ جرب اختبار VenusAR الآن!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ رابط الموقع!');
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
  };

  const resetToLanding = () => {
    setResponses([]);
    setCurrentQuestionIndex(0);
    setAiEvaluation(null);
    setQuestions([]);
    setCurrentStep('landing');
  };

  const handleAnswer = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    const newResponse: UserResponse = {
      questionId: currentQuestion.id,
      selectedOption: optionIndex,
      isCorrect,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finalizeQuiz(updatedResponses);
    }
  };

  const finalizeQuiz = async (finalResponses: UserResponse[]) => {
    setCurrentStep('result');
    setIsLoadingEvaluation(true);
    
    const score = finalResponses.filter(r => r.isCorrect).length;
    const result: QuizResult = {
      score,
      totalQuestions: questions.length,
      responses: finalResponses
    };

    const evaluation = await evaluateQuiz(result);
    setAiEvaluation(evaluation);
    setIsLoadingEvaluation(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden select-none">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[#020617]">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      </div>

      <main className="w-full max-w-2xl glass-card rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] relative border border-white/5 animate-in fade-in duration-1000">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-t-full"></div>

        {currentStep === 'landing' && (
          <div className="text-center space-y-10 py-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-8 group">
                <div className="absolute -inset-6 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all duration-500"></div>
                <Logo size={110} className="relative transform transition-transform duration-700 hover:scale-110" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                أختبار إدارة <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">VenusAR</span>
              </h1>
              <p className="text-white text-lg md:text-xl leading-relaxed max-w-lg mx-auto font-medium">
                هل لديك ما يلزم لتصبح إداري في VenusAR؟ هذه الأسئلة بُنيت بأسباب مهنية سابقة من قبل الإداريين السابقين، نتمنى لك التوفيق.
              </p>
            </div>

            <button
              onClick={startQuiz}
              disabled={isGeneratingQuestions}
              className="group w-full py-5 px-8 bg-white text-slate-950 hover:bg-purple-50 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="animate-spin text-purple-600" size={24} />
                  جاري بناء الاختبار...
                </>
              ) : (
                <>
                  ابدأ الأختبار الأن
                  <ChevronRight size={24} className="group-hover:translate-x-[-4px] transition-transform" />
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === 'quiz' && currentQuestion && (
          <div className="space-y-10 animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-black text-xs uppercase tracking-widest mb-2">المهمة {currentQuestionIndex + 1} / {questions.length}</p>
                <div className="flex gap-1.5">
                  {questions.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === currentQuestionIndex ? 'w-10 bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 
                        i < currentQuestionIndex ? 'w-4 bg-indigo-500/50' : 'w-4 bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                  currentQuestion.difficulty === 'سهل' ? 'text-emerald-400' :
                  currentQuestion.difficulty === 'متوسط' ? 'text-amber-400' : 'text-rose-400'
                }`}>مستوى: {currentQuestion.difficulty}</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 leading-tight">
              {currentQuestion.text}
            </h2>

            <div className="grid gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full text-right p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/40 hover:bg-slate-800/60 transition-all group active:scale-[0.99] relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 right-0 w-1 bg-transparent group-hover:bg-purple-500 transition-all"></div>
                  <span className="text-lg font-semibold text-white group-hover:text-white flex items-center gap-4">
                    <span className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-white group-hover:bg-purple-500 group-hover:text-white transition-all shadow-lg">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="text-center space-y-8 animate-in zoom-in duration-500">
            <div className="relative inline-block mb-4">
              <div className="absolute -inset-10 bg-purple-600/20 blur-3xl rounded-full animate-pulse"></div>
              <Logo size={120} className="relative" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tight">تحليل الأداء الإداري</h2>
              <div className="inline-flex items-center gap-4 px-8 py-3 bg-slate-950 rounded-2xl border border-white/10 shadow-2xl">
                <span className="text-white font-bold">درجة التقييم:</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {responses.filter(r => r.isCorrect).length} <span className="text-white text-lg">/ {questions.length}</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden text-right shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Zap size={80} />
              </div>
              <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Zap size={16} fill="currentColor" /> ملاحظات VenusAR التدريبية
              </h3>
              {isLoadingEvaluation ? (
                <div className="py-8 flex flex-col items-center gap-5">
                  <div className="w-12 h-12 border-[3px] border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-white text-sm animate-pulse font-bold tracking-wide">جاري فحص بروتوكولاتك الإدارية...</p>
                </div>
              ) : (
                <p className="text-white leading-[1.9] text-lg font-medium italic">
                  "{aiEvaluation}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentStep('review')}
                className="py-5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border border-white/10 shadow-lg"
              >
                <History size={20} />
                مراجعة الأجوبة
              </button>
              <button
                onClick={resetToLanding}
                className="py-5 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-purple-900/20 hover:opacity-90 active:scale-[0.98]"
              >
                العودة للقائمة الرئيسية
              </button>
            </div>
            
            <button
              onClick={shareWebsite}
              className="w-full py-4 text-white/80 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Share2 size={16} />
              مشاركة رابط الموقع
            </button>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
            <div className="flex items-center justify-between sticky top-0 bg-[#020617]/90 backdrop-blur-xl py-4 z-20 border-b border-white/10">
              <button 
                onClick={() => setCurrentStep('result')}
                className="p-3 hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-white/5"
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
              <h2 className="text-xl font-black text-white tracking-tight">بروتوكول المراجعة</h2>
              <div className="w-12"></div>
            </div>

            <div className="space-y-6 pb-6">
              {questions.map((q, idx) => {
                const userRes = responses.find(r => r.questionId === q.id);
                return (
                  <div key={q.id} className="bg-slate-950/40 border border-white/5 rounded-3xl p-7 space-y-5 shadow-xl">
                    <div className="flex justify-between items-start gap-5">
                      <h4 className="font-bold text-slate-100 text-lg leading-snug flex-1">{idx + 1}. {q.text}</h4>
                      <div className={`p-2 rounded-xl ${userRes?.isCorrect ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {userRes?.isCorrect ? (
                          <Check className="text-emerald-400" size={20} />
                        ) : (
                          <X className="text-rose-400" size={20} />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div 
                          key={optIdx}
                          className={`p-4 rounded-2xl text-sm font-bold border transition-all ${
                            optIdx === q.correctAnswer 
                              ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                              : optIdx === userRes?.selectedOption 
                                ? 'bg-rose-500/5 border-rose-500/30 text-rose-400' 
                                : 'bg-slate-900/20 border-transparent text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {optIdx === q.correctAnswer && <span className="text-[9px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-full">إجابة نموذجية</span>}
                            {optIdx === userRes?.selectedOption && optIdx !== q.correctAnswer && <span className="text-[9px] font-black bg-rose-500/20 px-2 py-0.5 rounded-full">اختيارك</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10">
                      <p className="text-[13px] text-white leading-relaxed">
                        <span className="font-black text-indigo-400 ml-2">التحليل الإداري:</span> 
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetToLanding}
              className="w-full py-5 bg-slate-950 text-white rounded-2xl font-bold border border-white/10 hover:bg-slate-900 transition-all shadow-2xl"
            >
              العودة للقائمة الرئيسية
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 opacity-100 transition-all duration-500">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 text-white text-[10px] font-black tracking-[0.3em] uppercase">
            <div className="h-px w-12 bg-white/40"></div>
            VENUSAR OFFICIAL
            <div className="h-px w-12 bg-white/40"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
