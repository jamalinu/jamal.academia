import { Lesson, Tutor, Achievement } from "./types";

export const TUTORS: Tutor[] = [
  {
    id: "sofia",
    name: "Dra. Sofía Al-Haddad",
    avatar: "👩‍🏫",
    level: "Todos los niveles",
    specialty: "Gramática Comparada e Iniciación",
    style: "Explicativa, compara las estructuras árabes con el español, muy paciente.",
    styleEn: "De Madrid, con raíces mixtas. Se enfoca en la transición gramatical.",
    tagline: "¡La gramática española es más fácil si entiendes tu propio idioma!"
  },
  {
    id: "carlos",
    name: "Carlos de Granada",
    avatar: "👨‍🏫",
    level: "Nivel Intermedio (A2-B1)",
    specialty: "Cultura y Etimología Compartida",
    style: "Apasionado por la historia, resalta los arabismos en el español moderno.",
    styleEn: "De Andalucía, experto en el legado lingüístico de Al-Ándalus.",
    tagline: "¡Hablamos más árabe en español de lo que te imaginas!"
  },
  {
    id: "amira",
    name: "Amira Benzian",
    avatar: "👩‍🎓",
    level: "Pronunciación y Fonética",
    specialty: "Eliminación de la interferencia fonética árabe",
    style: "Dinámica y práctica, enseña cómo colocar la lengua para la 'CH' y 'P'.",
    styleEn: "Bilingüe nativa de Ceuta. Sabe exactamente dónde fallan los árabes.",
    tagline: "¡Domina el sonido de la P y la CH con técnicas sencillas!"
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "primeros_pasos",
    title: "Primeros Pasos (الخطوات الأولى)",
    description: "Completa tu primera lección interactiva.",
    unlockedAt: null,
    xpReward: 100,
    icon: "Compass"
  },
  {
    id: "transicion_cultural",
    title: "Enlace Cultural (الرابط الثقافي)",
    description: "Completa la lección de etimología árabe en el español.",
    unlockedAt: null,
    xpReward: 150,
    icon: "Heart"
  },
  {
    id: "maestro_copula",
    title: "Adiós a la Oración Nominal",
    description: "Supera el módulo de Ser y Estar con puntuación perfecta.",
    unlockedAt: null,
    xpReward: 200,
    icon: "Award"
  },
  {
    id: "perfect_score",
    title: "Políglota Certificado (دقة مثالية)",
    description: "Completa un test de nivel mensual y obtén un certificado digital.",
    unlockedAt: null,
    xpReward: 300,
    icon: "BookmarkCheck"
  },
  {
    id: "racha_fuego",
    title: "Fuego Andalusí (الحماس المستمر)",
    description: "Consigue una racha diaria de 3 días de práctica continua.",
    unlockedAt: null,
    xpReward: 250,
    icon: "Flame"
  }
];

export const DAILY_WORDS = [
  { id: "w1", word: "Almohada", meaning: "المخدة", etymology: "Del árabe 'al-mukhaddah'", example: "La almohada es muy suave.", category: "Arabismo" },
  { id: "w2", word: "Azúcar", meaning: "السكر", etymology: "Del árabe 'as-sukkar'", example: "Me gusta el café con azúcar.", category: "Arabismo" },
  { id: "w3", word: "Ojalá", meaning: "إن شاء الله / ليت", etymology: "Del árabe 'law sha Allah' (si Dios quiere)", example: "¡Ojalá apruebe el examen!", category: "Cultura" },
  { id: "w4", word: "Zanahoria", meaning: "الجزر", etymology: "Proviene de raíces hispanoárabes", example: "La zanahoria es buena para la vista.", category: "Vocabulario" },
  { id: "w5", word: "Taza", meaning: "كوب / طاسة", etymology: "Del árabe 'tassah'", example: "Una taza de té caliente.", category: "Arabismo" },
  { id: "w6", word: "Aceite", meaning: "الزيت", etymology: "Del árabe 'az-zayt'", example: "El aceite de oliva de España es famoso.", category: "Arabismo" }
];

export const LESSONS: Lesson[] = [
  {
    id: "l1",
    title: "El Choque de Géneros Gramaticales (انعكاس الجنس)",
    titleAr: "عكس الجنس بين الإسبانية والعربية",
    description: "Aprende cómo algunos sustantivos cambian de masculino a femenino entre árabe y español.",
    descriptionAr: "تعلم كيف ينعكس جنس الكلمات (الذكر والأنثى) بين اللغتين لتفادي الأخطاء الشائعة.",
    category: "Grammar",
    level: "A1",
    xpReward: 80,
    steps: [
      {
        type: "theory",
        title: "Géneros Opuestos (جنس متعاكس)",
        content: `En español, todo objeto tiene un género gramatical (masculino o femenino). Sin embargo, muchos objetos que en árabe son **masculinos**, en español son **femeninos**, y viceversa.
        
Esto suele causar mucha confusión al principio. Veamos dos ejemplos icónicos de la naturaleza: **La Luna** y **El Sol**.`,
        contentAr: `في اللغة العربية، كلمة "القمر" مذكر و"الشمس" مؤنث. لكن في الإسبانية، يحدث العكس تماماً!
كلمة القمر (Luna) تأخذ أداة التأنيث "La Luna"، وكلمة الشمس (Sol) تأخذ أداة التذكير "El Sol".`,
        comparativeCard: {
          spanish: "El Sol y La Luna",
          arabic: "الشمس والقمر",
          explanation: "El Sol es masculino en español mas femenino en árabe. La Luna es femenina en español mas masculina en árabe."
        }
      },
      {
        type: "theory",
        title: "Otros Sustantivos Invertidos",
        content: `Aquí tenemos más términos cotidianos que debes memorizar para evitar heredar el género árabe al hablar español:
        
1. **La leche** (femenino) vs **الحليب** (masculino en árabe).
2. **El coche** (masculino) vs **السيارة** (femenino en árabe).
3. **La flor** (femenino) vs **الزهرة** (masculino/femenino en árabe, generalmente se confunde con el plural).
4. **La nariz** (femenino) vs **الأنف** (masculino).`,
        contentAr: `انتبه للمشتقات اليومية الحيوية مثل:
الحليب (Leche): مؤنث بالإسبانية (La leche).
السيارة (Coche/Autómovil): مذكر بالإسبانية (El coche).
الأنف (Nariz): مؤنث بالإسبانية (La nariz).`
      },
      {
        type: "exercise",
        exercise: {
          question: "¿Cómo se dice correctamente 'La leche' o 'El leche'?",
          questionAr: "كيف نقول 'الحليب' بالإسبانية بطريقة صحيحة مع مراعاة أداة التعريف؟",
          options: [
            "El leche (porque en árabe es masculino: الحليب)",
            "La leche (porque en español 'leche' es femenino)",
            "Un leche (género neutro)"
          ],
          correctAnswer: "La leche (porque en español 'leche' es femenino)",
          arabicGrammarTip: "تذكر: كلمة Leche مؤنثة دائماً في الإسبانية بغض النظر عن تذكيرها في اللغة العربية."
        }
      },
      {
        type: "exercise",
        exercise: {
          question: "Completa la frase con el artículo correcto: '___ sol brilla mucho' (الشمس تشرق كثيراً).",
          questionAr: "أكمل الجملة بأداة التعريف المناسبة لـ Sol (الشمس):",
          options: [
            "La",
            "El",
            "Lo"
          ],
          correctAnswer: "El",
          arabicGrammarTip: "الكلمة Sol مذكر في الإسبانية، لذا تأخذ أداة التعريف للمذكر المفرد: El."
        }
      }
    ]
  },
  {
    id: "l2",
    title: "Ser y Estar vs La Oración Nominal Árabe",
    titleAr: "أفعال الكينونة مقابل الجملة الاسمية",
    description: "Comprende la diferencia entre 'ser' (permanente) y 'estar' (temporal) frente a la oración nominal sin verbo.",
    descriptionAr: "افهم الفرق بين الفعلين Ser و Estar واللذين يقابلان الجملة الاسمية في العربية بدون فعل.",
    category: "Grammar",
    level: "A1",
    xpReward: 100,
    steps: [
      {
        type: "theory",
        title: "La Copula Fantasma (الفعل المفقود)",
        content: `En árabe coloquial y estándar, existe la **oración nominal** (مبتدأ وخبر) donde no se necesita el verbo 'ser/estar' en presente.
        
Por ejemplo: 'Ana Yalil' (أنا جميل) simplemente se traduce literalmente como 'Yo hermoso'.
En español es **obligatorio** usar un verbo puente cobrando vida en dos variantes:
- **SER**: Para características permanentes, identidad, u origen.
- **ESTAR**: Para estados temporales, emociones, o localización física.`,
        contentAr: `في العربية نقول "أنا سعيد" أو "أنا مهندس" بدون فعل كينونة في المضارع. ولكن في الإسبانية، من المستحيل الاستغناء عن الفعل!
نستخدم الفعل Ser لتعريف الهوية والميزات الدائمة (أنا مهندس -> Yo **soy** ingeniero).
نستخدم الفعل Estar للتعبير عن الحالة المؤقتة أو المكان (أنا سعيد -> Yo **estoy** feliz).`,
        comparativeCard: {
          spanish: "Yo soy profesor / Yo estoy en la escuela",
          arabic: "أنا معلم / أنا في المدرسة",
          explanation: "El presente árabe no requiere verbo auxiliador en la oración nominal, mientras que el español distingue estrictamente entre características inherentes (Soy) y ubicación/estado (Estoy)."
        }
      },
      {
        type: "exercise",
        exercise: {
          question: "Si quieres decir 'Yo soy de Marruecos' (origen permanente), ¿cuál usas?",
          questionAr: "إذا أردت قول 'أنا من المغرب' (تعريف بالأصل والمنشأ)، أي فعل كينونة تستخدم؟",
          options: [
            "Yo estoy de Marruecos",
            "Yo soy de Marruecos",
            "Yo tener de Marruecos"
          ],
          correctAnswer: "Yo soy de Marruecos",
          arabicGrammarTip: "للأصل والجنسية نستخدم دائماً فعل SER (Soy)."
        }
      },
      {
        type: "exercise",
        exercise: {
          question: "Si quieres expresar tu estado actual 'Estoy cansado hoy' (حالة مؤقتة), ¿cuál usas?",
          questionAr: "للتعبير عن حالة مؤقتة مثل 'أنا متعب اليوم'، أي العبارات أصح؟",
          options: [
            "Soy cansado hoy",
            "Estoy cansado hoy",
            "Tengo cansado hoy"
          ],
          correctAnswer: "Estoy cansado hoy",
          arabicGrammarTip: "للحالات الجسدية والنفسية المؤقتة نستخدم فعل ESTAR (Estoy)."
        }
      }
    ]
  },
  {
    id: "l3",
    title: "Palabras Hermanas: Arabismos en el Español",
    titleAr: "الكلمات التوأم: الكلمات ذات الأصل العربي بالإسبانية",
    description: "Explora la increíble conexión de Al-Ándalus en más de 4000 vocablos españoles comunes.",
    descriptionAr: "اكتشف الرابط الأندلسي المذهل من خلال كلمات شائعة نستخدمها يومياً بلفظ مشابه جداً.",
    category: "Culture",
    level: "A2",
    xpReward: 90,
    steps: [
      {
        type: "theory",
        title: "La Influencia de Al-Ándalus (تأثير الأندلس)",
        content: `Casi el 8% de las palabras españolas tienen un origen árabe directo debido a los casi 800 años de convivencia en la península ibérica.
        
Muchas de estas palabras empiezan con **'al-'** (que corresponde al artículo árabe ال). Aprenderlas te dará un superpoder porque ya te sabes su significado en español sin realizar ningún esfuerzo extra.`,
        contentAr: `هل كنت تعلم أن هناك أكثر من 4000 كلمة إسبانية أصلها عربي مباشر؟ 
معظم هذه الكلمات تبدأ بالمقطع Al- وهو في الأصل (الـ) التعريفية العربية. بمجرد أن تسمع الكلمة، ستتعرف على معناها تلقائياً!`,
        comparativeCard: {
          spanish: "Alberca (البحيرة) / Alquiler (الكراء/الغلّة)",
          arabic: "بركة / إيجار (الغلّة)",
          etymology: "Alberca deriva de 'al-birkah' y Alquiler de 'al-kira'",
          explanation: "La influencia léxica del árabe andalusí estructuró palabras esenciales de la arquitectura, agricultura y vida civil."
        }
      },
      {
        type: "theory",
        title: "La gran lista culinaria",
        content: `En la comida y agricultura, la influencia es masiva:
        
- **Azúcar**: Proviene de *as-sukkar* (السكر).
- **Aceite**: Proviene de *az-zayt* (الزيت).
- **Arroz**: Proviene de *ar-ruzz* (الأرز).
- **Limón**: Proviene de *laymūn* (ليمون).
- **Naranja**: Proviene de *nāranj* (نارنج).
- **Zafra**: Proviene de *safar* (سفر).`,
        contentAr: `في المطبخ والزراعة، يظهر التقارب بشكل مذهل:
الأرز (Arroz) -> الأرز
الليمون (Limón) -> ليمون
البرتقال/النارنج (Naranja) -> نارنج
الزيت (Aceite) -> الزيت`
      },
      {
        type: "exercise",
        exercise: {
          question: "¿Cuál es el origen de la palabra española 'Almohada'?",
          questionAr: "ما هو الأصل التاريخي لكلمة 'Almohada' في اللغة الإسبانية؟",
          options: [
            "Latín clásico",
            "Del árabe 'al-mukhaddah' (المخدة)",
            "origen celta medieval"
          ],
          correctAnswer: "Del árabe 'al-mukhaddah' (المخدة)",
          arabicGrammarTip: "تطورت كلمة المخدة لتصبح Almohada في الإسبانية، مع الحفاظ على نفس الصوت العشيري تقريباً!"
        }
      }
    ]
  },
  {
    id: "l4",
    title: "Ojalá vs Insh'Allah y Cortesía",
    titleAr: "إن شاء الله والتعابير الثقافية المشتركة",
    description: "Conoce el origen de la expresión de deseo española más famosa y las fórmulas de hospitalidad cortesana.",
    descriptionAr: "تعرف على تعابير التمني والترحيب والروابط الثقافية العميقة التي تجعل الإسبان يتحدثون كالعرب.",
    category: "Culture",
    level: "A2",
    xpReward: 90,
    steps: [
      {
        type: "theory",
        title: "Ojalá: La herencia de la fe",
        content: `La palabra **Ojalá** es una de las palabras hispanas más cargadas de historia. Se utiliza de manera universal para expresar deseos vivos o anhelos y va siempre acompañada del modo subjuntivo.
        
Deriva directamente de la frase árabe **'law sha' Allah' (لَوْ شَاءَ اللَّهُ)**, que significa 'si Dios quiere' o 'ojalá que Dios quiera'. Su calco de significado y expresión es idéntico al 'Inshallah' árabe moderno.`,
        contentAr: `كلمة "Ojalá" الشهيرة التي يستخدمها متحدثو الإسبانية للتمني من قلوبهم ليست سوى النطق الأندلسي لـ "لو شاء الله". 
وتأتي دائماً متبوعة بصيغة المتكلم الغائب الملتزم Subjuntivo لتوضيح الأمل أو الرغبة الحارة.`,
        comparativeCard: {
          spanish: "¡Ojalá tengas un buen día!",
          arabic: "إن شاء الله يكون يومك جميلاً / ليت يومك جميل!",
          explanation: "Ambas expresiones canalizan la esperanza y el destino de manera profunda bajo el subjuntivo español."
        }
      },
      {
        type: "exercise",
        exercise: {
          question: "¿Qué modo verbal debe seguir siempre a la palabra 'Ojalá' al expresar un deseo?",
          questionAr: "ما هي الصيغة الصرفية (الغطاء اللغوي) التي تدعم التمني دائماً بعد Ojalá؟",
          options: [
            "Modo Indicativo habitual (ej: vienes)",
            "Modo Subjuntivo (ej: vengas)",
            "Modo Imperativo directo (ej: ven)"
          ],
          correctAnswer: "Modo Subjuntivo (ej: vengas)",
          arabicGrammarTip: "دائماً ما يتبع 'Ojalá' صيغة Subjuntivo للتعبير عن الرغبة العاطفية والتطلعات."
        }
      }
    ]
  }
];
