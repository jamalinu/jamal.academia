import React, { useState } from "react";
import { BookOpen, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { UserProfile, Lesson } from "../types";
import { LESSONS } from "../data";

interface Props {
  profile: UserProfile;
  updateProfile: (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  playXPSound: () => void;
  triggerNotification: (title: string, body: string) => void;
}

export default function LessonsTab({ profile, updateProfile, playXPSound, triggerNotification }: Props) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setStepIdx(0);
    setSelectedAnswer(null);
    setAnswerChecked(false);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !activeLesson) return;
    setAnswerChecked(true);
    const step = activeLesson.steps[stepIdx];
    if (step.exercise && selectedAnswer === step.exercise.correctAnswer) {
      playXPSound();
    }
  };

  const handleNext = () => {
    if (!activeLesson) return;
    if (stepIdx < activeLesson.steps.length - 1) {
      setStepIdx(stepIdx + 1);
      setSelectedAnswer(null);
      setAnswerChecked(false);
    } else {
      // Lesson complete
      updateProfile(prev => {
        const already = prev.completedLessons.includes(activeLesson.id);
        return {
          ...prev,
          xp: already ? prev.xp : prev.xp + activeLesson.xpReward,
          completedLessons: already ? prev.completedLessons : [...prev.completedLessons, activeLesson.id]
        };
      });
      playXPSound();
      triggerNotification("🎉 ¡Lección Completada!", `Ganaste ${activeLesson.xpReward} XP por completar "${activeLesson.title}".`);
      setActiveLesson(null);
    }
  };

  if (activeLesson) {
    const step = activeLesson.steps[stepIdx];
    const isCorrect = answerChecked && step.exercise && selectedAnswer === step.exercise.correctAnswer;

    return (
      <div className="space-y-4 animate-fade-in flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-[#222]">
          <span className="font-bold text-white line-clamp-1">{activeLesson.title}</span>
          <span>Paso {stepIdx + 1} / {activeLesson.steps.length}</span>
        </div>

        {step.type === "theory" && (
          <div className="space-y-3 flex-1">
            <h4 className="text-sm font-bold text-amber-400">{step.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{step.content}</p>
            {step.contentAr && (
              <p className="text-xs text-amber-500/80 text-right leading-relaxed font-serif border-t border-[#222] pt-2">{step.contentAr}</p>
            )}
            {step.comparativeCard && (
              <div className="bg-[#1A1A1A] rounded-xl p-3 border border-amber-500/20 space-y-1 text-xs">
                <p className="text-white font-bold">{step.comparativeCard.spanish}</p>
                <p className="text-amber-400 text-right font-serif">{step.comparativeCard.arabic}</p>
                <p className="text-slate-400 pt-1 border-t border-[#2A2A2A]">{step.comparativeCard.explanation}</p>
              </div>
            )}
            <button onClick={handleNext} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold rounded-xl mt-auto">
              Continuar →
            </button>
          </div>
        )}

        {step.type === "exercise" && step.exercise && (
          <div className="space-y-3 flex-1 flex flex-col">
            <h4 className="text-sm font-bold text-white leading-relaxed">{step.exercise.question}</h4>
            {step.exercise.questionAr && (
              <p className="text-xs text-amber-500/80 text-right font-serif">{step.exercise.questionAr}</p>
            )}
            <div className="space-y-2 flex-1">
              {step.exercise.options.map((opt, i) => {
                let cls = "bg-[#1A1A1A] border-[#2A2A2A] text-slate-300";
                if (answerChecked) {
                  if (opt === step.exercise!.correctAnswer) cls = "bg-emerald-900/30 border-emerald-500 text-emerald-300";
                  else if (opt === selectedAnswer) cls = "bg-rose-900/30 border-rose-500 text-rose-300";
                } else if (opt === selectedAnswer) {
                  cls = "bg-amber-500/20 border-amber-500 text-white";
                }
                return (
                  <button key={i} disabled={answerChecked} onClick={() => setSelectedAnswer(opt)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${cls}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {answerChecked && (
              <div className={`p-3 rounded-xl text-xs ${isCorrect ? "bg-emerald-900/20 border border-emerald-700 text-emerald-300" : "bg-rose-900/20 border border-rose-700 text-rose-300"}`}>
                {isCorrect ? "✅ ¡Correcto! " : "❌ Incorrecto. "}
                <span className="text-amber-400">{step.exercise.arabicGrammarTip}</span>
              </div>
            )}
            {!answerChecked ? (
              <button disabled={!selectedAnswer} onClick={handleCheckAnswer}
                className="w-full py-2.5 bg-amber-500 disabled:opacity-40 hover:bg-amber-600 text-black text-xs font-extrabold rounded-xl">
                Comprobar Respuesta
              </button>
            ) : (
              <button onClick={handleNext}
                className="w-full py-2.5 bg-white hover:bg-slate-200 text-black text-xs font-extrabold rounded-xl">
                {stepIdx < activeLesson.steps.length - 1 ? "Siguiente →" : "Finalizar Lección 🎉"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-white">Lecciones • الدروس</h3>
      </div>
      <p className="text-xs text-slate-400">Módulos de gramática comparada y cultura hispano-árabe ordenados por nivel.</p>
      <div className="space-y-3">
        {LESSONS.map(lesson => {
          const completed = profile.completedLessons.includes(lesson.id);
          return (
            <div key={lesson.id} className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 hover:border-amber-500/40 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-bold">{lesson.level}</span>
                    <span className="text-[10px] text-slate-500">{lesson.category}</span>
                    {completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{lesson.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{lesson.description}</p>
                </div>
                <button onClick={() => startLesson(lesson)}
                  className="shrink-0 px-3 py-1.5 bg-[#2A2A2A] hover:bg-amber-500 hover:text-black text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1">
                  {completed ? "Repetir" : "Iniciar"} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-500">
                <Sparkles className="w-3 h-3" />
                <span>+{lesson.xpReward} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
