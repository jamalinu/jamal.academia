import React, { useState, useEffect, useRef, FormEvent } from "react";
import {
  BookOpen,
  Mic,
  Award,
  TrendingUp,
  Settings,
  Flame,
  User,
  Plus,
  Trash2,
  Lock,
  Calendar,
  Download,
  Wifi,
  WifiOff,
  Volume2,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  Save,
  CheckCircle2,
  Share2,
  RefreshCw,
  Bell,
  Heart,
  Grid,
  FileText
} from "lucide-react";
import { UserProfile, Lesson, Tutor, Achievement, ScheduledSession, Message } from "./types";
import { TUTORS, INITIAL_ACHIEVEMENTS, LESSONS, DAILY_WORDS } from "./data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import LessonsTab from "./components/LessonsTab";

// Web Audio API Award Chime Helper
const playXPSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Quick ascending scale (C5 -> E5 -> G5 -> C6)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    osc.frequency.setValueAtTime(1046.50, now + 0.3);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    
    osc.start();
    osc.stop(now + 0.55);
  } catch (e) {
    console.warn("Audio Context not supported or allowed yet.");
  }
};

// Fail-safe buzzer sound
const playFailSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.3);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.start();
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn("Audio context error.");
  }
};

export default function App() {
  // Navigation Tabs: 'lessons' | 'voice' | 'misiones' | 'progreso' | 'ajustes'
  const [activeTab, setActiveTab] = useState<"lessons" | "voice" | "misiones" | "progreso" | "ajustes">("lessons");

  // User Profile with standard key-value local state cached in LocalStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("andalus_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      username: "Ahmad Al-Khatib",
      level: "B1",
      xp: 2450,
      points: 180,
      streak: 18,
      lastPracticeDate: new Date().toISOString().split("T")[0],
      completedLessons: ["l1"],
      completedTests: [],
      achievements: INITIAL_ACHIEVEMENTS,
      scheduledSessions: [
        { id: "s1", date: "2026-06-02", time: "18:30", topic: "Clase de Gramática con Sofía", notifyBefore: true }
      ],
      dailyGoalMins: 20,
      practiceDuration: {
        "2026-05-22": 15,
        "2026-05-23": 25,
        "2026-05-24": 30,
        "2026-05-25": 10,
        "2026-05-26": 22,
        "2026-05-27": 18,
        "2026-05-28": 15
      },
      notificationsEnabled: true,
      widgetSetting: {
        showStreak: true,
        showDailyWord: false,
        showNextClass: false,
        selectedWordId: "w1"
      }
    };
  });

  // Save profile helper
  const updateProfile = (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfile(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("andalus_profile", JSON.stringify(next));
      return next;
    });
  };

  // State definitions
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isBiometricLocked, setIsBiometricLocked] = useState<boolean>(false);
  const [biometricAuthenticated, setBiometricAuthenticated] = useState<boolean>(true);
  const [currentNotification, setCurrentNotification] = useState<{ title: string; body: string } | null>(null);

  // Widget settings simulator State
  const [activeWidgetWordIdx, setActiveWidgetWordIdx] = useState<number>(0);

  // Scheduling State
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [scheduleTopic, setScheduleTopic] = useState<string>("Gramática Comparada");

  // Voice Lab state
  const [selectedVoicePhraseIdx, setSelectedVoicePhraseIdx] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [microphoneAllowed, setMicrophoneAllowed] = useState<boolean | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(18).fill(10));
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<string>("");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const voiceTimerRef = useRef<any>(null);

  // Chat integration State
  const [selectedTutor, setSelectedTutor] = useState<Tutor>(TUTORS[0]);
  const [chatMessages, setChatMessages] = useState<{ [tutorId: string]: Message[] }>({
    sofia: [
      { role: "model", text: "¡Hola! السلام عليكم. Soy la Dra. Sofía. ¿Qué tal tu día? Estoy aquí para resolver tus dudas gramaticales comparando el español con el árabe en todo momento. ¡Pregúntame lo que quieras!", timestamp: "10:30" }
    ],
    carlos: [
      { role: "model", text: "¡Ahlan! Me apasiona la conexión histórica entre el español y el árabe. ¿Sabías que cuando comes 'Arroz' o te reclinas sobre una 'Almohada' estás hablando árabe con acento hispanico? ¡Cuéntame qué quieres descubrir hoy!", timestamp: "10:31" }
    ],
    amira: [
      { role: "model", text: "¡Hola, futuro bilingüe! Pronunciar la 'P' y la 'CH' puede ser un reto para nosotros por asimilaciones acústicas cotidianas. Hagamos unos ejercicios prácticos de fonética. ¡Escríbeme una frase para ensayar hoy!", timestamp: "10:32" }
    ]
  });
  const [currentInputText, setCurrentInputText] = useState<string>("");
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  // Monthly test State
  const [activeTestLevel, setActiveTestLevel] = useState<"A1" | "A2" | "B1" | null>(null);
  const [testQuestionIdx, setTestQuestionIdx] = useState<number>(0);
  const [testAnswers, setTestAnswers] = useState<string[]>([]);
  const [testScore, setTestScore] = useState<number | null>(null);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Custom daily goal minutes slider helper
  const [sliderMins, setSliderMins] = useState<number>(profile.dailyGoalMins);

  // Dynamic system notifications triggering
  const triggerNotification = (title: string, body: string) => {
    if (!profile.notificationsEnabled) return;
    setCurrentNotification({ title, body });
    setTimeout(() => {
      setCurrentNotification(null);
    }, 4500);
  };

  // Speaks spanish phrases dynamically
  const speakSpanishPhrase = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Filter out bracket explanations or Arabic additions
      const cleanText = text.replace(/[\u0600-\u06FF]/g, "").replace(/\(.*?\)/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-ES";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("La síntesis de voz no es compatible con este navegador.");
    }
  };

  // Simulated live voice analysis & microphone permission request
  const startRecording = async () => {
    try {
      if (isListening) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneAllowed(true);
      setIsListening(true);
      setPronunciationScore(null);
      setVoiceFeedback("");

      // Start simulating waveform movement
      let steps = 0;
      const interval = setInterval(() => {
        setWaveformBars(() =>
          Array(18).fill(0).map(() => Math.floor(Math.random() * 60) + 12)
        );
        steps++;
        if (steps > 20) {
          clearInterval(interval);
          finishRecording();
        }
      }, 150);
      voiceTimerRef.current = interval;
    } catch (e) {
      // Fallback if mic permission is denied or frame blocks it
      setMicrophoneAllowed(false);
      setIsListening(true);
      setPronunciationScore(null);
      setVoiceFeedback("");

      let steps = 0;
      const interval = setInterval(() => {
        setWaveformBars(() =>
          Array(18).fill(0).map(() => Math.floor(Math.random() * 40) + 8)
        );
        steps++;
        if (steps > 15) {
          clearInterval(interval);
          finishRecording();
        }
      }, 150);
      voiceTimerRef.current = interval;
    }
  };

  const finishRecording = () => {
    setIsListening(false);
    // Calculated mock score with personalized grammar correction and tips based on selected phrase
    const scores = [88, 92, 95, 76, 82];
    const finalScore = scores[Math.floor(Math.random() * scores.length)];
    setWaveformBars(Array(18).fill(10));
    setPronunciationScore(finalScore);

    const phrase = VOICE_PHRASES[selectedVoicePhraseIdx];
    let tip = "";
    if (phrase.word.toLowerCase().includes("perro")) {
      tip = "Consejo para hablantes árabes: La 'rr' múltiple inexistente en la dárija y el fusha requiere vibrar el ápice en el paladar sin forzar la glotis.";
    } else if (phrase.word.toLowerCase().includes("computadora") || phrase.word.toLowerCase().includes("padre")) {
      tip = "Consejo: Evita sonorizar la pronunciación de la 'P'. Asegura la eyección de aire colocándote un trozo de papel frente a los labios.";
    } else if (phrase.word.toLowerCase().includes("choque") || phrase.word.toLowerCase().includes("leche")) {
      tip = "Consejo para la 'ch': No la asimiles simplemente con la 'sh' (ش). En español es oclusiva sorda, suena como 't' + 'sh' unidas.";
    } else {
      tip = "¡Increíble melodía acústica! Tu cadencia respeta el compás de las sílabas agudas españolas.";
    }

    setVoiceFeedback(tip);

    if (finalScore >= 80) {
      playXPSound();
      updateProfile(prev => ({
        ...prev,
        xp: prev.xp + 15,
        points: prev.points + 5
      }));
      triggerNotification("🎤 ¡Buena Pronunciación!", `Obtuviste un ${finalScore}% en tu práctica diaria vocálica.`);
    } else {
      playFailSound();
    }
  };

  // Call API for Gemini chat tutoring
  const handleSendChatMessage = async () => {
    if (!currentInputText.trim() || isLoadingChat) return;

    const userMsgText = currentInputText.trim();
    const newMsg: Message = { role: "user", text: userMsgText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    
    // Add User message synchronously
    setChatMessages(prev => ({
      ...prev,
      [selectedTutor.id]: [...(prev[selectedTutor.id] || []), newMsg]
    }));
    setCurrentInputText("");
    setIsLoadingChat(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...(chatMessages[selectedTutor.id] || []), newMsg],
          tutorInfo: {
            name: selectedTutor.name,
            style: `${selectedTutor.specialty}. Estilo: ${selectedTutor.style}. ${selectedTutor.styleEn}`,
            level: selectedTutor.level
          }
        })
      });

      if (!response.ok) {
        throw new Error("Server communication fault");
      }

      const resData = await response.json();
      const rawText = resData.text || "Disculpa, no he podido asimilar tu frase correctamente. ¿Podrías repetirla de otra manera?";

      setChatMessages(prev => ({
        ...prev,
        [selectedTutor.id]: [
          ...(prev[selectedTutor.id] || []),
          { role: "model", text: rawText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }));
    } catch (e) {
      console.error(e);
      // Beautiful high fidelity localized fallback offline responses
      let fallbackText = "";
      if (selectedTutor.id === "sofia") {
        fallbackText = `¡Excelente intento! Como estamos operando en modo asíncrono o fuera de línea temporalmente, te aclaro: recuerda que 'el mapa' es masculino (mientras que 'casa' es femenino). ¡Pregúntame en línea para análisis sintácticos complejos en tiempo real!`;
      } else if (selectedTutor.id === "carlos") {
        fallbackText = `Soberbia observación. Te recuerdo un dato clave: de la palabra árabe 'al-matrah' (المطرح) sacamos la hermosa palabra española 'colchón' medieval. ¡Los arabismos son infinitos!`;
      } else {
        fallbackText = `¡Suena fantástico! Sigue insistiendo en la asimilación vibratoria de la doble 'r' y la sutil expulsión de aire en la 'p'. ¡Sigue ensayando diariamente!`;
      }

      setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          [selectedTutor.id]: [
            ...(prev[selectedTutor.id] || []),
            { role: "model", text: fallbackText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        }));
      }, 1200);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Mini test database
  const TEST_QUESTIONS = {
    A1: [
      {
        question: "¿Cuál frase usa correctamente la diferencia de géneros gramaticales?",
        questionAr: "أي جملة تستخدم الفروقات الجنسية الثقافية للكلمات بطريقة صحيحة؟",
        options: ["Me gusta el leche frío", "La leche está fría y el sol está alto", "El luna es muy brillante hoy"],
        correct: "La leche está fría y el sol está alto"
      },
      {
        question: "En español, a diferencia de la oración nominal árabe, es obligatorio usar:",
        questionAr: "في الإسبانية، على عكس الجملة الاسمية العربية بدون أفعال، من الضروري استخدام:",
        options: ["Los pronombres dobles", "Los verbos Ser o Estar en presente", "El infinitivo directo sin enlaces"],
        correct: "Los verbos Ser o Estar en presente"
      },
      {
        question: "¿Cómo se traduce 'Yo soy médico' (profesión permanente)?",
        questionAr: "كيف تترجم عبارة 'أنا طبيب' كمهنة ثابتة ومستقرة؟",
        options: ["Yo soy médico", "Yo estoy médico", "Yo tengo médico"],
        correct: "Yo soy médico"
      },
      {
        question: "¿Cómo se dice 'La almohada es suave' recordando su etimología árabe?",
        questionAr: "كيف نقول 'المخدة ناعمة' مستحضرين أصلها العربي؟",
        options: ["El almohada es suave", "La almohada es suave", "Un almohado es suave"],
        correct: "La almohada es suave"
      },
      {
        question: "La palabra 'Ojalá' deriva exactamente de la frase árabe:",
        questionAr: "كلمة 'Ojalá' مشتقة أساساً من العبارة العربية تمني القضاء:",
        options: ["Al-Mukhaddah (المخدة)", "In Sha Allah / Law Sha' Allah (لو شاء الله)", "As-Sukkar (السكر)"],
        correct: "In Sha Allah / Law Sha' Allah (لو شاء الله)"
      }
    ],
    A2: [
      {
        question: "¿Cuál de estos alimentos es un arabismo célebre en España?",
        questionAr: "أي من هذه الأطعمة يعتبر من الكلمات الأندلسية المستعارة الشهيرة بالإسبانية؟",
        options: ["La manzana", "El aceite que viene de 'az-zayt'", "La patata andina"],
        correct: "El aceite que viene de 'az-zayt'"
      },
      {
        question: "Diga la frase correcta sobre ubicación temporal:",
        options: ["Yo soy en Al-Andalus", "Yo estoy en Al-Andalus", "Yo tengo en Al-Andalus"],
        correct: "Yo estoy en Al-Andalus"
      },
      {
        question: "En español la letra 'P' es:",
        options: ["Sonora como la B árabe", "Sorda y requiere expulsar un soplo de aire", "Nasalizada profunda"],
        correct: "Sorda y requiere expulsar un soplo de aire"
      },
      {
        question: "'El coche' en español es de género regulado:",
        options: ["Femenino como la palabra 'السيارة'", "Masculino a la inversa del árabe", "Neutro"],
        correct: "Masculino a la inversa del árabe"
      },
      {
        question: "El artículo 'al-' al principio de palabras españolas como 'alberca' representa:",
        options: ["La preposición de origen", "El artículo definido árabe 'الـ'", "Una redundancia moderna"],
        correct: "El artículo definido árabe 'الـ'"
      }
    ],
    B1: [
      {
        question: "El subjuntivo en oraciones que expresan deseos como '¡Ojalá tengas buen viaje!' equivale al:",
        options: ["Modo imperativo estricto", "Modo condicional de expectativa", "Modo subjuntivo para situaciones hipotéticas o de fe"],
        correct: "Modo subjuntivo para situaciones hipotéticas o de fe"
      },
      {
        question: "La palabra 'Alquiler' deriva de la expresión islámica:",
        options: ["Al-kira (الإيجار/الكراء)", "Al-ghalla (الغلّة)", "Al-birkah (البركة)"],
        correct: "Al-kira (الإيجar/الكراء)"
      },
      {
        question: "¿Cuál de ellas se asocia a un género gramatical idéntico en árabe y español?",
        options: ["El sol", "La casa (الدار / البيت coincidente en sentido femenino)", "La leche"],
        correct: "La casa (الدار / البيت coincidente en sentido femenino)"
      },
      {
        question: "La pronunciación correcta de la 'CH' se describe fonéticamente como:",
        options: ["Africada postalveolar sorda", "Fricativa velar sorda", "Fricativa alveolar sonora"],
        correct: "Africada postalveolar sorda"
      },
      {
        question: "La oracion nominal árabe 'Hua muhandis' requiere en su paso al español:",
        options: ["Omitir el verbo de enlace", "El uso de la cópula obligatoria 'Él es ingeniero'", "Invertir el pronombre directo"],
        correct: "El uso de la cópula obligatoria 'Él es ingeniero'"
      }
    ]
  };

  // Launch Monthly level test
  const startMonthlyTest = (lvl: "A1" | "A2" | "B1") => {
    setActiveTestLevel(lvl);
    setTestQuestionIdx(0);
    setTestAnswers([]);
    setTestScore(null);
    setShowCertificate(false);
  };

  const submitTestAnswer = (opt: string) => {
    const updated = [...testAnswers, opt];
    setTestAnswers(updated);
    
    if (testQuestionIdx < 4) {
      setTestQuestionIdx(prev => prev + 1);
    } else {
      // Calculate final score
      const list = TEST_QUESTIONS[activeTestLevel!];
      let correctCount = 0;
      updated.forEach((ans, idx) => {
        if (ans === list[idx].correct) correctCount++;
      });
      const percent = (correctCount / 5) * 100;
      setTestScore(percent);

      if (percent >= 80) {
        playXPSound();
        updateProfile(prev => {
          const passedTests = prev.completedTests.includes(activeTestLevel!)
            ? prev.completedTests
            : [...prev.completedTests, activeTestLevel!];
          
          // Unlock test achievement
          const updatedAchievements = [...prev.achievements];
          const testAch = updatedAchievements.find(a => a.id === "perfect_score");
          if (testAch && !testAch.unlockedAt) {
            testAch.unlockedAt = new Date().toISOString().split("T")[0];
          }

          return {
            ...prev,
            xp: prev.xp + 300,
            points: prev.points + 50,
            completedTests: passedTests,
            achievements: updatedAchievements
          };
        });
        setShowCertificate(true);
        triggerNotification("🎓 ¡Certificado Desbloqueado!", `Aprobaste el test de proficiencia de nivel ${activeTestLevel} con un ${percent}%.`);
      } else {
        playFailSound();
        triggerNotification("⚠️ Examen No Superado", `Obtuviste un ${percent}%. Se requiere 80% para certificar.`);
      }
    }
  };

  // Mini-Calendar Scheduling Helper
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleTime) return;

    const newSess: ScheduledSession = {
      id: Math.random().toString(),
      date: scheduleDate,
      time: scheduleTime,
      topic: scheduleTopic,
      notifyBefore: true
    };

    updateProfile(prev => ({
      ...prev,
      scheduledSessions: [...prev.scheduledSessions, newSess]
    }));

    triggerNotification("📅 Sesión Agendada", `Tu clase de "${scheduleTopic}" quedó registrada para el día ${scheduleDate} a las ${scheduleTime}.`);
    setScheduleDate("");
    setScheduleTime("");
  };

  const handleRemoveSchedule = (id: string) => {
    updateProfile(prev => ({
      ...prev,
      scheduledSessions: prev.scheduledSessions.filter(s => s.id !== id)
    }));
  };

  // Simulated Cloud Sync
  const [syncingCloud, setSyncingCloud] = useState<boolean>(false);
  const handleCloudSync = () => {
    setSyncingCloud(true);
    setTimeout(() => {
      setSyncingCloud(false);
      triggerNotification("☁️ Sincronización Exitosa", "Toda tu bitácora de progreso, logros y audios ha sido guardada en la nube de Al-Andalus.");
    }, 1800);
  };

  // Change sliders variables
  const handleSavePreferences = () => {
    updateProfile(prev => ({
      ...prev,
      dailyGoalMins: sliderMins
    }));
    triggerNotification("⚙️ Preferencias Guardadas", "Tu meta de práctica diaria se ajustó con éxito.");
  };

  // CSV Report Generator
  const exportProgressCSV = () => {
    const headers = "Fecha (التاريخ),Minutos Practicados (دقائق التدريب)\n";
    const rows = Object.entries(profile.practiceDuration)
      .map(([date, duration]) => `${date},${duration}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Andalus_Progreso_${profile.username.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("📥 CSV Exportado", "Se generó tu reporte detallado de minutos semanales.");
  };

  // Recharts metric data formatting
  const chartData = Object.entries(profile.practiceDuration).map(([date, mins]) => ({
    name: date.slice(5), // Keep MM-DD
    meta: profile.dailyGoalMins,
    minutos: mins,
    xpGained: Number(mins) * 5
  }));

  // Home widget target values selector
  const activeWidgetWord = DAILY_WORDS[activeWidgetWordIdx];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Dynamic Push Notification Notification toast */}
      {currentNotification && (
        <div id="smart_toast" className="fixed top-4 right-4 z-50 max-w-sm bg-[#121212] border-l-4 border-amber-500 rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in border border-[#333]">
          <div className="bg-amber-500/10 p-2 rounded text-amber-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{currentNotification.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentNotification.body}</p>
          </div>
        </div>
      )}

      {/* Simulated Biometric Authentication Screen lock overlay */}
      {isBiometricLocked && (
        <div id="biometric_screen_lock" className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="max-w-md w-full bg-[#121212] border border-[#2A2A2A] rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 border-2 border-dashed border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-light text-white tracking-widest">AUTENTICACIÓN REQUERIDA</h2>
              <p className="text-slate-400 text-xs mt-2">Seguridad biométrica activa para resguardo de bitácora y certificados de {profile.username}.</p>
            </div>

            {/* Simulated interactive fingerprint scan option */}
            <div className="border border-[#222] bg-[#1A1A1A]/80 p-5 rounded-xl space-y-4">
              <p className="text-xs text-amber-500 font-mono">Simulador de Sensor Biométrico Activo</p>
              <button
                id="sim_fingerprint_btn"
                onClick={() => {
                  setBiometricAuthenticated(true);
                  setIsBiometricLocked(false);
                  triggerNotification("🔓 Acceso Concedido", "Tu pase biométrico ha desbloqueado la academia.");
                }}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-sm font-extrabold rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>Colocar Huella / Rostro</span>
              </button>
              <p className="text-[10px] text-slate-500">Haz clic para emular la lectura biómetra certificada por dispositivo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Indicator Band */}
      {isOffline && (
        <div id="offline_state_banner" className="bg-amber-600 text-black text-xs font-bold py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>MODO DE APRENDIZAJE SIN CONEXIÓN ACTIVO • Todos los módulos se guardarán de forma local</span>
        </div>
      )}

      {/* Brand Header Navigation */}
      <header className="h-20 flex items-center justify-between px-4 lg:px-8 border-b border-[#2A2A2A] bg-[#121212] sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FF4500] rounded-xl flex items-center justify-center font-black text-black text-lg shadow-md animate-pulse">
            AL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg lg:text-xl font-light tracking-widest text-white">AL-ANDALUS</span>
              <span className="text-xs bg-[#FFD700] text-black font-extrabold px-1.5 py-0.5 rounded">SPANISH</span>
            </div>
            <p className="text-[10px] text-amber-500/80 tracking-widest uppercase">التعليم التفاعلي للأوساط العربية</p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Level Indicator Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[#1A1A1A] px-3.5 py-1.5 rounded-full border border-[#333] text-xs">
            <span className="text-[#FFD700] font-bold">NIVEL</span>
            <span className="text-white font-extrabold font-mono">{profile.level}</span>
          </div>

          {/* Counters row */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-[#1A1A1A]/80 px-2.5 py-1.5 rounded-lg border border-[#222]" title="Racha activa">
              <span className="text-orange-500 animate-bounce">🔥</span>
              <span className="font-mono text-white text-xs whitespace-nowrap">{profile.streak} DÍAS</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1A1A1A]/80 px-2.5 py-1.5 rounded-lg border border-[#222]" title="Puntos de experiencia">
              <span className="text-amber-400">🪙</span>
              <span className="font-mono text-amber-400 text-xs whitespace-nowrap">{profile.xp} XP</span>
            </div>
          </div>

          {/* Toggle connection simulation */}
          <button
            id="toggle_connection_btn"
            onClick={() => {
              setIsOffline(!isOffline);
              triggerNotification(
                !isOffline ? "🔌 Modo Desconectado" : "🌐 Conexión Restablecida",
                !isOffline 
                  ? "Se ha simulado la pérdida de señal de red. Puedes seguir operando sin cortes."
                  : "Se ha sincronizado de nuevo el progreso automáticamente en el servidor."
              );
            }}
            className={`p-2 rounded-lg border transition ${
              isOffline 
                ? "bg-amber-600/10 border-amber-500 text-amber-500" 
                : "bg-[#1A1A1A] border-[#333] text-slate-400 hover:text-white"
            }`}
            title={isOffline ? "Habilitar Conexión" : "Simular Pérdida de Conexión"}
          >
            {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </button>

          {/* Biometric trigger lock lock-simulate screen */}
          <button
            id="test_fingerprint_lock_btn"
            onClick={() => {
              setIsBiometricLocked(true);
              setBiometricAuthenticated(false);
            }}
            className="p-2 rounded-lg bg-[#1A1A1A] border border-[#333] text-slate-400 hover:text-white hover:border-[#444] transition"
            title="Bloquear con Biometría"
          >
            <Lock className="w-4 h-4 text-slate-400" />
          </button>

          {/* Little avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#333] to-[#222] border border-[#FFD700] p-0.5 flex items-center justify-center font-bold text-[#FFD700] text-sm">
            {profile.username[0]}
          </div>
        </div>
      </header>

      {/* APP WORKSPACE CONTAINER GRID: 12 Cols */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
        
        {/* LEFT COLUMN: PROGRESS, GOALS & CERTIFICATES (3 Cols) */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Daily Goal card with relative progress SVG circle */}
          <div className="bg-[#121212] rounded-2xl p-5 border border-[#222] flex flex-col items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 self-start">
              Meta Diaria • الهدف اليومي
            </h3>
            
            <div className="relative w-36 h-36 my-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="64" stroke="#1A1A1A" strokeWidth="8" fill="transparent" />
                {/* 75% display progress */}
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#FFD700"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="402"
                  strokeDashoffset="100.5"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-light text-white font-mono">75%</span>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Completado</span>
              </div>
            </div>

            <div className="text-center mt-3 space-y-1">
              <p className="text-sm font-semibold text-white">Práctica de Hoy</p>
              <p className="text-xs text-slate-400 font-mono">15 min de {profile.dailyGoalMins} min planeados</p>
            </div>

            <div className="w-full space-y-3 mt-5 pt-4 border-t border-[#1F1F1F]">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse"></div>
                <span>Vocales y Transición Genérica</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]"></div>
                <span>Uso de 'Ser/Estar' Comparado</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                <span>Grabación de Audio • Pendiente</span>
              </div>
            </div>
          </div>

          {/* Certifications status card */}
          <div className="bg-[#121212] rounded-2xl p-5 border border-[#222] space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Certificaciones • الشهادات</span>
            </h3>

            <div className="bg-[#1A1A1A] p-4 rounded-xl border-l-4 border-[#FFD700] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Nivel de Pruebas</h4>
                  <p className="text-[10px] text-amber-500/80 mt-1">Examen de evaluación mensual</p>
                </div>
                <span className="text-[11px] bg-amber-500/20 text-[#FFD700] font-mono px-1.5 py-0.5 rounded font-extrabold">B1</span>
              </div>

              <div className="space-y-2 pt-1.5">
                <p className="text-[10px] text-slate-400">Aprueba el examen de 5 reactivos gramaticales para descargar la certificación con firma de la academia.</p>
                
                {profile.completedTests.length > 0 ? (
                  <div className="p-2 bg-emerald-950/20 border border-emerald-900/40 rounded text-center text-xs text-emerald-400 font-semibold">
                    Certificado {profile.completedTests.join(", ")} Adquirido
                  </div>
                ) : (
                  <p className="text-[10px] text-amber-500 font-medium">No has emitido certificados este mes.</p>
                )}
              </div>

              <button
                id="exam_tab_shortcut_btn"
                onClick={() => {
                  setActiveTab("misiones");
                  startMonthlyTest("B1");
                }}
                className="w-full py-2 bg-[#262626] hover:bg-[#333] rounded-lg transition text-xs font-bold text-white uppercase tracking-wider"
              >
                Hacer Test Mensual (B1)
              </button>
            </div>
          </div>

          {/* Dynamic interactive Study Schedule Planner */}
          <div className="bg-[#121212] rounded-2xl p-5 border border-[#222] space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Calendario y Tutorías • الحصص</span>
            </h3>

            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 block mb-1">Materia / Enfoque</label>
                <select
                  value={scheduleTopic}
                  onChange={(e) => setScheduleTopic(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Gramática: Ser vs Estar">Gramática: Ser vs Estar</option>
                  <option value="Vocabulario de Arabismos">Vocabulario de Arabismos</option>
                  <option value="Práctica Fonológica (P / CH)">Práctica Fonológica (P / CH)</option>
                  <option value="Revisión de Textos Literarios">Revisión de Textos Literarios</option>
                </select>
              </div>

              <button
                type="submit"
                id="add_class_schedule_btn"
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-black font-extrabold rounded text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar Práctica</span>
              </button>
            </form>

            {/* List of study schedule items */}
            <div className="space-y-2 pt-2 border-t border-[#1F1F1F]">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Próximos Recordatorios:</span>
              {profile.scheduledSessions.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No tienes sesiones reservadas.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {profile.scheduledSessions.map((session) => (
                    <div key={session.id} className="p-2.5 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] flex justify-between items-center text-xs gap-2">
                      <div>
                        <p className="font-bold text-white line-clamp-1">{session.topic}</p>
                        <p className="text-[10px] text-[#FFD700] whitespace-nowrap mt-0.5">📅 {session.date} • 🕒 {session.time}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSchedule(session.id)}
                        className="text-slate-500 hover:text-rose-500 p-1"
                        title="Eliminar sesión"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: LESSON STUDY MODULE & AUDIO LAB (6 Cols) */}
        <section className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Main dynamic Tabs View Navigation bar */}
          <div className="bg-[#121212] p-2 rounded-xl border border-[#222] flex items-center justify-between gap-1">
            <button
              id="tab_lessons_btn"
              onClick={() => setActiveTab("lessons")}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${
                activeTab === "lessons"
                  ? "bg-[#1A1A1A] text-[#FFD700] border border-[#333] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Lecciones</span>
            </button>

            <button
              id="tab_voice_btn"
              onClick={() => setActiveTab("voice")}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${
                activeTab === "voice"
                  ? "bg-[#1A1A1A] text-[#FFD700] border border-[#333] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mic className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Laboratorio</span>
            </button>

            <button
              id="tab_misiones_btn"
              onClick={() => setActiveTab("misiones")}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${
                activeTab === "misiones"
                  ? "bg-[#1A1A1A] text-[#FFD700] border border-[#333] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Evaluación</span>
            </button>

            <button
              id="tab_progreso_btn"
              onClick={() => setActiveTab("progreso")}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${
                activeTab === "progreso"
                  ? "bg-[#1A1A1A] text-[#FFD700] border border-[#333] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Rendimiento</span>
            </button>

            <button
              id="tab_ajustes_btn"
              onClick={() => setActiveTab("ajustes")}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${
                activeTab === "ajustes"
                  ? "bg-[#1A1A1A] text-[#FFD700] border border-[#333] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Preferencias</span>
            </button>
          </div>

          {/* DYNAMIC CONTENT SWITCHBOARD */}
          <div className="flex-1 bg-[#121212] rounded-2xl p-6 border border-[#222] min-h-[460px] flex flex-col">
            
            {/* TAB 1: LESSONS & GRAMMAR */}
            {activeTab === "lessons" && (
              <LessonsTab
                profile={profile}
                updateProfile={updateProfile}
                playXPSound={playXPSound}
                triggerNotification={triggerNotification}
              />
            )}

            {/* TAB 2: PRONUNCIATION VOICE LAB */}
            {activeTab === "voice" && (
              <div id="voice_lab_module" className="space-y-5 animate-fade-in flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-amber-500" />
                      <span>Laboratorio de Pronunciación • نطق الحروف</span>
                    </h3>
                    <span className="text-[11px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold">FONÉTICA</span>
                  </div>
                  
                  <p className="text-xs text-slate-400">
                    Muchos sonidos españoles (como la P, la CH o la doble R) no existen idénticamente en árabe estándar. Practica con oraciones modelo y recibe ayuda fonética del tutor de inmediato.
                  </p>
                </div>

                {/* Phrase Select slider */}
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
                  <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">Selecciona frase de entrenamiento:</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {VOICE_PHRASES.map((phrase, idx) => (
                      <button
                        key={idx}
                        id={`phrase_btn_${idx}`}
                        onClick={() => {
                          setSelectedVoicePhraseIdx(idx);
                          setPronunciationScore(null);
                          setVoiceFeedback("");
                        }}
                        className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                          selectedVoicePhraseIdx === idx
                            ? "bg-amber-500 text-black border-amber-400 font-extrabold"
                            : "bg-[#121212] text-slate-300 border-[#222] hover:bg-[#1C1C1C]"
                        }`}
                      >
                        <p className="font-sans line-clamp-1">{phrase.word}</p>
                        <p className="text-[10px] opacity-80 line-clamp-1 mt-0.5">{phrase.trans}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main active phrase player and checker board */}
                <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#2A2A2A] space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] text-[#FFD700] font-bold block uppercase mb-1">FRASE EN ESPAÑOL</span>
                      <p className="text-xl font-bold text-white tracking-wide">
                        "{VOICE_PHRASES[selectedVoicePhraseIdx].word}"
                      </p>
                    </div>
                    
                    <button
                      id="play_phrase_tts_btn"
                      onClick={() => speakSpanishPhrase(VOICE_PHRASES[selectedVoicePhraseIdx].word)}
                      className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-bold"
                      title="Escuchar audio modelo"
                    >
                      <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Escuchar Modelo</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#1C1C1C] text-right">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1">الترجمة التقريبية</span>
                    <p className="text-sm font-semibold text-slate-300 dir-rtl font-serif">
                      {VOICE_PHRASES[selectedVoicePhraseIdx].trans}
                    </p>
                  </div>

                  {/* Audio wave dynamic visualization */}
                  <div className="bg-[#121212] px-4 py-6 rounded-xl border border-[#222] flex flex-col items-center justify-center space-y-4">
                    <div className="flex justify-center items-end gap-1.5 h-16 w-full max-w-xs mx-auto">
                      {waveformBars.map((val, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-500 rounded-sm w-2 transition-all duration-150"
                          style={{
                            height: `${val}%`,
                            opacity: isListening ? 1 : 0.35,
                            backgroundColor: isListening ? "#FFD700" : "#E0E0E0"
                          }}
                        />
                      ))}
                    </div>
                    
                    <button
                      id="toggle_record_microphone_btn"
                      disabled={isListening}
                      onClick={startRecording}
                      className={`px-8 py-3 rounded-full font-bold text-sm tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 ${
                        isListening
                          ? "bg-[#2A1010] border border-rose-600/40 text-rose-500 animate-pulse"
                          : "bg-white hover:bg-slate-200 text-black active:scale-95"
                      }`}
                    >
                      <span>{isListening ? "Escuchando Voz..." : "Iniciar Grabación 🎙️"}</span>
                    </button>

                    <p className="text-[10px] text-slate-500">
                      Pulse el botón y pronuncie la frase en alta voz. Se requiere acceso al micrófono.
                    </p>
                  </div>

                  {/* Pronunciation score indicator */}
                  {pronunciationScore !== null && (
                    <div className="p-4 bg-[#121212] border border-[#222] rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-mono ${
                          pronunciationScore >= 80 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                        }`}>
                          {pronunciationScore}%
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Precisión de Vocales</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Frecuencia y retención vocal analizadas.</p>
                        </div>
                      </div>

                      <div className="flex-1 text-xs text-slate-300 bg-[#1A1A1A] p-2.5 rounded-lg border border-[#2C2C2C] dir-rtl text-right leading-loose font-medium">
                        {voiceFeedback}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MONTHLY TESTS & DIGITAL CERTIFICATE */}
            {activeTab === "misiones" && (
              <div id="misiones_level_tests" className="space-y-6 animate-fade-in flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-500" />
                    <span>Evaluación Mensual y Certificación • اختبارات المستوى</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pon a prueba tus habilidades resolviendo preguntas de interferencias gramaticales y vocabulario histórico para obtener tu pergamino digital con firma de Al-Andalus.
                  </p>
                </div>

                {!activeTestLevel && !showCertificate && (
                  // Select level screen 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {["A1", "A2", "B1"].map((lvl) => {
                      const completed = profile.completedTests.includes(lvl);
                      return (
                        <div key={lvl} className="bg-[#1A1A1A] rounded-xl border border-[#2B2B2B] p-5 space-y-4 hover:border-amber-500 transition">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-2xl font-black text-amber-500 tracking-wider font-mono">{lvl}</span>
                            {completed && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Aprobado</span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase">
                              {lvl === "A1" && "Iniciación de Género"}
                              {lvl === "A2" && "Estudio de Arabismos"}
                              {lvl === "B1" && "Habilidades Sintácticas"}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">5 preguntas sobre morfología y enlaces de lengua materna árabe.</p>
                          </div>
                          <button
                            id={`start_test_${lvl.toLowerCase()}`}
                            onClick={() => startMonthlyTest(lvl as any)}
                            className="w-full py-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white text-xs font-bold rounded-lg transition"
                          >
                            {completed ? "Repetir Test" : "Comenzar Test"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTestLevel && !showCertificate && (
                  // Active test view
                  <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#2A2A2A] space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center text-xs text-slate-400 pb-3 border-b border-[#2C2C2C]">
                      <span>Test de Nivel <strong className="text-[#FFD700]">{activeTestLevel}</strong></span>
                      <span>Pregunta {testQuestionIdx + 1} de 5</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white leading-relaxed">
                        {TEST_QUESTIONS[activeTestLevel][testQuestionIdx].question}
                      </h4>
                      {TEST_QUESTIONS[activeTestLevel][testQuestionIdx].questionAr && (
                        <p className="text-right text-xs text-amber-500/80 dir-rtl font-serif pt-1.5 leading-relaxed">
                          {TEST_QUESTIONS[activeTestLevel][testQuestionIdx].questionAr}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      {TEST_QUESTIONS[activeTestLevel][testQuestionIdx].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          id={`test_option_${oIdx}`}
                          onClick={() => submitTestAnswer(opt)}
                          className="w-full text-left p-4 rounded-xl border border-[#2C2C2C] bg-[#121212] hover:bg-amber-500/10 hover:border-amber-500/30 text-xs text-slate-300 transition-all font-sans"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between">
                      <button
                        id="cancel_test_btn"
                        onClick={() => setActiveTestLevel(null)}
                        className="text-xs text-slate-500 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {showCertificate && (
                  // Beautiful Golden digital certificate template 
                  <div id="issued_certificate" className="bg-[#121212] p-5 rounded-2xl border border-[#222] space-y-5 animate-scale-up">
                    <div className="bg-gradient-to-br from-[#1F1D17] to-[#121212] border-2 border-[#FFD700] rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
                      
                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-24 h-24 border-r border-b border-amber-500/10 rounded-br-3xl pointer-events-none"></div>
                      <div className="absolute top-0 right-0 w-24 h-24 border-l border-b border-amber-500/10 rounded-bl-3xl pointer-events-none"></div>

                      <div className="w-12 h-12 bg-amber-500/10 border border-[#FFD700]/30 rounded-full flex items-center justify-center text-amber-500">
                        <Award className="w-6 h-6 animate-pulse" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-serif text-[#FFD700] tracking-widest uppercase">Academia de Español Al-Andalus</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Documento acreditado de proficiencia</p>
                      </div>

                      <div className="py-2.5">
                        <p className="text-[10px] text-slate-400">Por cuanto este estudiante ha superado con mención de honor las pruebas mensuales:</p>
                        <h2 className="text-xl font-extrabold text-[#E0E0E0] mt-1.5 uppercase tracking-wide">{profile.username}</h2>
                        <p className="text-[10px] text-slate-400 mt-1">Bajo dictamen e interferencias lingüísticas hispano-árabes bilingües.</p>
                      </div>

                      <div className="px-4 py-1.5 bg-[#FFD700]/10 rounded border border-[#FFD700]/30">
                        <span className="font-mono text-xs font-bold text-[#FFD700]">GRADO COMPROBADO: {activeTestLevel}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-8 w-full max-w-sm pt-4 border-t border-[#2C2A24] text-center text-[9px] text-slate-500 font-mono">
                        <div>
                          <p className="text-[#E0E0E0] opacity-80 italic">Dirección Académica</p>
                          <p className="mt-1">Dra. S. Al-Haddad</p>
                        </div>
                        <div>
                          <p className="text-[#E0E0E0] opacity-80">Código Verificación</p>
                          <p className="mt-1">AND-2026-B1-99</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        id="download_certificate_pdf_btn"
                        onClick={() => {
                          triggerNotification("📥 Certificado Guardado", "Se ha simulado la descarga del pdf del certificado oficial.");
                        }}
                        className="flex-1 py-3 bg-white text-black text-xs font-extrabold rounded-xl hover:bg-slate-200 transition uppercase tracking-widest flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCertificate(false);
                          setActiveTestLevel(null);
                        }}
                        className="py-3 px-5 bg-[#222] border border-[#333] hover:bg-[#2F2F2F] text-slate-300 rounded-xl text-xs font-bold"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PERFORMANCE GRAPH AND REPORT (D3/Recharts) */}
            {activeTab === "progreso" && (
              <div id="performance_analytics" className="space-y-6 animate-fade-in flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                      <span>Analíticas de Rendimiento Personal • لوحة التحليلات</span>
                    </h3>
                    <button
                      id="export_csv_btn"
                      onClick={exportProgressCSV}
                      className="px-2.5 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] rounded text-xs text-amber-500 font-bold flex items-center gap-1"
                      title="Descargar historial"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Estudio longitudinal de los minutos empleados diariamente y su comparación con la meta configurada para mantener tu constancia de racha activa.
                  </p>
                </div>

                {/* Simulated metrics highlights boxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#282828] text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Práctica Total</span>
                    <span className="text-lg font-bold text-white font-mono">153 min</span>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#282828] text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Meta Promedio</span>
                    <span className="text-lg font-bold text-white font-mono">{profile.dailyGoalMins} min</span>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#282828] text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Eficiencia Global</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">92%</span>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#282828] text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">XP Clave</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">+765 XP</span>
                  </div>
                </div>

                {/* Recharts Area Chart */}
                <div className="bg-[#151515] p-3 rounded-xl border border-[#222] h-60">
                  <span className="text-[10px] text-slate-400 font-bold block mb-2 uppercase tracking-wide">Minutos por Día (Últimos 7 Días)</span>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: 8 }} labelStyle={{ color: "#FFF" }} />
                        <Area type="monotone" dataKey="minutos" stroke="#FFD700" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMins)" name="Minutos" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar chart of Daily XP accumulated */}
                <div className="bg-[#151515] p-3 rounded-xl border border-[#222]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Bitácora de Sincronización</span>
                    <span className="text-[9px] text-slate-500 font-mono">Última subida: Hace un instante</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Todos tus informes semanales se guardan localmente para operar sin conexión y se sincronizan instantáneamente cuando detectan una red estable.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 5: SYSTEM PREFERENCES & WIDGET CONFIGURATION */}
            {activeTab === "ajustes" && (
              <div id="settings_module" className="space-y-6 animate-fade-in flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    <span>Configuración de Academia • الضبط</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Gestiona tus recordatorios diarios, ajusta tus metas de estudio, sincroniza tus datos en la nube y configura tu widget educativo interactivo para pantalla de inicio.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Goal and notification controls form */}
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2B2B2B] space-y-4">
                    <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">Objetivos de Práctica</span>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Minutos Diarios</span>
                        <strong className="text-amber-400 font-mono">{sliderMins} min</strong>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={sliderMins}
                        onChange={(e) => setSliderMins(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2C]">
                      <div>
                        <span className="text-xs font-bold block">Recordatorios Inteligentes</span>
                        <span className="text-[9px] text-slate-400">Notificaciones push diarias</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.notificationsEnabled}
                        onChange={(e) => updateProfile(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 bg-black border-[#333]"
                      />
                    </div>

                    <button
                      id="save_pref_btn"
                      onClick={handleSavePreferences}
                      className="w-full py-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FFD700] text-xs font-bold rounded-lg transition text-center uppercase tracking-widest mt-2"
                    >
                      Aplicar Cambios
                    </button>
                  </div>

                  {/* Offline Widget configuration preview block */}
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2B2B2B] space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-orange-500 font-bold block uppercase tracking-wider">Simulador de Widget (Pantalla Inicio)</span>
                      <p className="text-[10px] text-slate-400 mt-1">Configura el widget que verás en tu pantalla principal sin necesidad de abrir la aplicación.</p>
                    </div>

                    {/* Widget simulator render box */}
                    <div className="p-3.5 bg-[#121212] rounded-xl border border-dashed border-amber-500/30 space-y-2 relative">
                      <span className="absolute top-1.5 right-2 text-[8px] text-[#FFD700]/70 uppercase tracking-widest font-bold">WIDGET</span>
                      
                      {profile.widgetSetting.showStreak ? (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🔥</span>
                          <div>
                            <p className="text-xs font-bold text-white">Al-Andalus Academia</p>
                            <p className="text-[9px] text-slate-400">Racha Diaria: <strong className="text-amber-500 font-mono">{profile.streak} días</strong></p>
                          </div>
                        </div>
                      ) : profile.widgetSetting.showDailyWord ? (
                        <div>
                          <p className="text-[8px] text-slate-500">PALABRA DEL DÍA</p>
                          <p className="text-sm font-bold text-amber-500">{activeWidgetWord.word}</p>
                          <p className="text-[9px] text-slate-300">Sentido: {activeWidgetWord.meaning} • <span className="italic text-slate-400 text-[8px]">{activeWidgetWord.etymology}</span></p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[8px] text-slate-500">PRÓXIMA CLASE</p>
                          <p className="text-xs font-bold text-white truncate">{profile.scheduledSessions[0]?.topic || "Sin tutorías agendadas"}</p>
                          {profile.scheduledSessions[0] && (
                            <p className="text-[9px] text-amber-500">📅 {profile.scheduledSessions[0].date} • {profile.scheduledSessions[0].time}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selector triggers */}
                    <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                      <button
                        onClick={() => updateProfile(p => ({ ...p, widgetSetting: { ...p.widgetSetting, showStreak: true, showDailyWord: false, showNextClass: false } }))}
                        className={`py-1 text-[8px] rounded uppercase font-bold border ${profile.widgetSetting.showStreak ? "bg-amber-500 text-black border-amber-400" : "bg-[#121212] text-slate-400 border-[#222]"}`}
                      >
                        Racha
                      </button>
                      <button
                        onClick={() => {
                          updateProfile(p => ({ ...p, widgetSetting: { ...p.widgetSetting, showStreak: false, showDailyWord: true, showNextClass: false } }));
                          setActiveWidgetWordIdx((activeWidgetWordIdx + 1) % DAILY_WORDS.length);
                        }}
                        className={`py-1 text-[8px] rounded uppercase font-bold border ${profile.widgetSetting.showDailyWord ? "bg-amber-500 text-black border-amber-400" : "bg-[#121212] text-slate-400 border-[#222]"}`}
                      >
                        Palabra
                      </button>
                      <button
                        onClick={() => updateProfile(p => ({ ...p, widgetSetting: { ...p.widgetSetting, showStreak: false, showDailyWord: false, showNextClass: true } }))}
                        className={`py-1 text-[8px] rounded uppercase font-bold border ${profile.widgetSetting.showNextClass ? "bg-amber-500 text-black border-amber-400" : "bg-[#121212] text-slate-400 border-[#222]"}`}
                      >
                        Clase
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secure cloud sync module */}
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2B2B2B] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-full text-amber-500">
                      <RefreshCw className={`w-5 h-5 ${syncingCloud ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Sincronización en la Nube de Al-Andalus</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mantiene tus datos e informes unificados entre dispositivos móviles y la web de forma automática.</p>
                    </div>
                  </div>
                  <button
                    id="trigger_cloud_sync_btn"
                    disabled={syncingCloud}
                    onClick={handleCloudSync}
                    className="px-5 py-2.5 bg-amber-500 text-black text-xs font-extrabold rounded-lg hover:bg-amber-600 transition tracking-wider uppercase whitespace-nowrap"
                  >
                    {syncingCloud ? "Guardando..." : "Sincronizar Ahora"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: AI NATIVE SPEAKERS TUTOR CHAT (3 Cols) */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Chat con Nativos Certified card */}
          <div className="bg-[#121212] rounded-2xl p-4 border border-[#222] flex-1 flex flex-col justify-between min-h-[460px]">
            
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#222]">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Tutor Chat de IA • الدردشة مع المعلمين
                  </h3>
                  <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Hablantes Certificados por Al-Andalus</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-extrabold font-mono">En Línea</span>
              </div>

              {/* Tutor Selector tabs */}
              <div className="grid grid-cols-3 gap-1 mb-3 bg-[#1A1A1A] p-1 rounded-lg">
                {TUTORS.map((tutor) => (
                  <button
                    key={tutor.id}
                    id={`tutor_tab_${tutor.id}`}
                    onClick={() => setSelectedTutor(tutor)}
                    className={`py-1.5 rounded text-center transition-all flex flex-col items-center justify-center ${
                      selectedTutor.id === tutor.id
                        ? "bg-amber-500 text-black font-extrabold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">{tutor.avatar}</span>
                    <span className="text-[8px] font-bold block mt-0.5 truncate max-w-[50px]">{tutor.name.split(" ")[1]}</span>
                  </button>
                ))}
              </div>

              {/* Selected Tutor mini-intro */}
              <div className="bg-[#1A1A1A] p-2.5 rounded-lg border border-[#2A2A2A] mb-3 text-[10px] leading-relaxed relative">
                <span className="absolute top-1 right-2 bg-amber-500/10 text-[#FFD700] text-[7px] font-bold px-1 rounded uppercase">{selectedTutor.level}</span>
                <p className="font-bold text-white text-[11px] truncate">{selectedTutor.name}</p>
                <p className="text-[#FFD700] font-medium mt-0.5">{selectedTutor.specialty}</p>
                <p className="text-slate-400 font-serif dir-rtl text-right mt-1 leading-normal italic text-[9px]">{selectedTutor.style}</p>
              </div>

              {/* Chat Speech bubble box */}
              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222] h-60 overflow-y-auto space-y-3 pr-1 text-xs">
                {(chatMessages[selectedTutor.id] || []).map((msg, mIdx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={mIdx}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`p-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                          isUser
                            ? "bg-amber-500 text-black font-medium rounded-tr-none"
                            : "bg-[#1A1A1A] border border-[#2B2B2B] text-slate-200 rounded-tl-none font-sans"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-slate-500 mt-0.5 px-1 font-mono">{msg.timestamp}</span>
                    </div>
                  );
                })}

                {isLoadingChat && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 italic px-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    <span>{selectedTutor.name.split(" ")[0]} está respondiendo en bilingüe...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message input area */}
            <div className="flex gap-1.5 pt-3 border-t border-[#1F1F1F]">
              <input
                type="text"
                id="tutor_chat_input"
                placeholder="Escribe en español... (Escríbele algo)"
                value={currentInputText}
                onChange={(e) => setCurrentInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
              />
              <button
                id="send_tutor_msg_btn"
                onClick={handleSendChatMessage}
                className="bg-amber-500 hover:bg-amber-600 font-extrabold text-black text-xs px-3 py-2 rounded-xl"
              >
                Enviar
              </button>
            </div>
          </div>

          {/* Gamified Leaderboard card: Liga de Al-Andalus */}
          <div className="bg-[#121212] rounded-2xl p-5 border border-[#222] space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Liga Diamante Al-Andalus • قائمة الصدارة</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="text-[#FFD700] font-bold">1</span>
                  <span className="text-slate-200">Omar Al-Fatah</span>
                </span>
                <span className="font-mono text-slate-400">3,840 XP</span>
              </div>

              <div className="flex items-center justify-between text-xs bg-[#1A1A1A]/80 p-2 border.5 border-[#333] rounded-lg">
                <span className="flex items-center gap-2">
                  <span className="text-[#CD7F32] font-extrabold animate-bounce">2</span>
                  <span className="text-white font-extrabold">Tú ({profile.username.split(" ")[0]})</span>
                </span>
                <span className="font-mono text-[#FFD700] font-extrabold">{profile.xp} XP</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="text-[#C0C0C0] font-bold">3</span>
                  <span className="text-slate-200">Fatima Zahra</span>
                </span>
                <span className="font-mono text-slate-400">2,100 XP</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span>4</span>
                  <span>Yussef Al-M.</span>
                </span>
                <span className="font-mono">1,950 XP</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER TAB NAV BAR */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-[#121212] border-t border-[#2A2A2A] z-40 flex items-center justify-around px-2 text-center shadow-2xl">
        <button
          id="footer_tab_lessons"
          onClick={() => {
            setActiveTab("lessons");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
            activeTab === "lessons" ? "text-[#FFD700] font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <span className="text-lg">📚</span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold">LECCIONES</span>
        </button>

        <button
          id="footer_tab_voice"
          onClick={() => {
            setActiveTab("voice");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
            activeTab === "voice" ? "text-[#FFD700] font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <span className="text-lg">🗣️</span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold">HABLAR</span>
        </button>

        <button
          id="footer_tab_misiones"
          onClick={() => {
            setActiveTab("misiones");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
            activeTab === "misiones" ? "text-[#FFD700] font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <span className="text-lg">🏆</span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold">MISIONES</span>
        </button>

        <button
          id="footer_tab_progreso"
          onClick={() => {
            setActiveTab("progreso");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
            activeTab === "progreso" ? "text-[#FFD700] font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <span className="text-lg">📊</span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold">PROGRESO</span>
        </button>

        <button
          id="footer_tab_ajustes"
          onClick={() => {
            setActiveTab("ajustes");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
            activeTab === "ajustes" ? "text-[#FFD700] font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold">AJUSTES</span>
        </button>
      </footer>
    </div>
  );
}

// Fixed constant data list for Voice PHRASES with detailed pronunciation feedback targets
const VOICE_PHRASES = [
  {
    word: "La almohada está en la cama.",
    trans: "المخدة على السرير. (تركيز على أصل الكلمة وتصريف أداة التأنيث 'la')"
  },
  {
    word: "Me gustaría tomar café con azúcar.",
    trans: "أود شرب القهوة مع السكر. (تمثيل نطق صوت الـ 'P' والـ 'z' والـ 'c' اللغوي)"
  },
  {
    word: "El coche arranca rápido por la mañana.",
    trans: "السيارة تنطلق بسرعة في الصباح. (تذكير: كلمة coche مذكر بالإسبانية ومؤنث بالعربية)"
  },
  {
    word: "Ojalá mi padre venga hoy temprano.",
    trans: "إن شاء الله يأتي والدي مبكراً اليوم. (مطبقة النطق السليم للـ 'P' ومفهوم التمني)"
  },
  {
    word: "El perro corre mucho en el jardín.",
    trans: "الكلب يجري كثيراً في الحديقة. (تدريب على حرف الـ 'rr' المزدوج الصعب)"
  }
];
