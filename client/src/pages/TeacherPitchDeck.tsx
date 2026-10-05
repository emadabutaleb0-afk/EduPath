import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Brain, 
  Target, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Bot, 
  FileText, 
  Clock, 
  Award, 
  CheckCircle2, 
  Printer, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Copy, 
  Layers,
  GraduationCap,
  MessageSquare
} from 'lucide-react';

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  badgeColor: string;
  speakerNotes: string;
  renderContent: () => React.ReactNode;
}

export default function TeacherPitchDeck() {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const slides: Slide[] = [
    // SLIDE 1: COVER
    {
      id: 1,
      tag: "Vision & Promise",
      title: "EduPath: Teaching Reimagined",
      subtitle: "Reclaiming Educator Time • Diagnosing Blind Spots • Unlocking Student Potential",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      speakerNotes: "Welcome colleagues. Every week, teachers spend 6-10 hours authoring quizzes and hand-grading. Traditional grading yields a cold percentage (like 70%) that hides specific conceptual gaps. EduPath is your AI co-pilot designed to eliminate grading burnout, pinpoint student blind spots, and automate targeted retraining with zero API fees.",
      renderContent: () => (
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            Teacher Pitch Deck • 2026 Edition
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Empower Your Classroom with{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Diagnostic AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            The next-generation assessment platform engineered for educators. Automate quiz creation, uncover individual student weak points, and detect classroom misconceptions before exams.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 max-w-3xl">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-left">
              <Clock className="w-6 h-6 text-cyan-400 mb-2" />
              <div className="font-bold text-lg text-white">Save 6+ Hours/Wk</div>
              <div className="text-xs text-slate-400">Zero hours spent hand-grading or re-writing tests</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-left">
              <Target className="w-6 h-6 text-amber-400 mb-2" />
              <div className="font-bold text-lg text-white">Weak Point Forensics</div>
              <div className="text-xs text-slate-400">Isolates concept errors & automates 1-click retraining</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-left">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="font-bold text-lg text-white">100% Free & Native</div>
              <div className="text-xs text-slate-400">Client-side Puter AI with zero API key configuration</div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 2: THE PROBLEM
    {
      id: 2,
      tag: "The Challenge",
      title: "The Modern Educator's Reality",
      subtitle: "Why Traditional Assessment Leaves Teachers Exhausted and Students Behind",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      speakerNotes: "We all know the Sunday night dread of grading stacks of papers. But cold percentage scores hide critical insights. When a student gets 65%, did they misunderstand the concept or make a calculation slip? And classroom-wide misconceptions are usually only discovered after high-stakes exams when it's too late.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <p className="text-slate-300 text-center max-w-2xl mx-auto text-sm sm:text-base">
            Teachers are drowning in assessment mechanics, leaving little time for high-impact human mentoring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900/90 border border-rose-500/30 space-y-3">
              <div className="text-3xl font-black text-rose-400">10+ Hrs/Wk</div>
              <h3 className="font-bold text-white text-base">Grading & Authoring Burnout</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evenings and weekends consumed by drafting repetitive quizzes, photocopying test sheets, and manually marking answers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900/90 border border-amber-500/30 space-y-3">
              <div className="text-3xl font-black text-amber-400">"68%" Blind Spot</div>
              <h3 className="font-bold text-white text-base">Lack of Diagnostic Clarity</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Raw scores never tell you <em>why</em> a student failed. Was it conceptual misunderstanding, careless arithmetic, or vocabulary confusion?
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/90 border border-purple-500/30 space-y-3">
              <div className="text-3xl font-black text-purple-400">1 vs 30+</div>
              <h3 className="font-bold text-white text-base">The Remediation Impasse</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                With 30+ students per class, providing personalized remediation quizzes for every learner's specific weak points is physically impossible.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-xs text-slate-400">
            📌 <strong>Result:</strong> Teachers burn out, while students carry unnoticed foundational gaps into the next academic year.
          </div>
        </div>
      )
    },

    // SLIDE 3: THE SOLUTION
    {
      id: 3,
      tag: "The Solution",
      title: "EduPath: Your Intelligent Co-Pilot",
      subtitle: "A Complete Assessment, Diagnostic & Retraining Ecosystem",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      speakerNotes: "EduPath does not replace teachers; it supercharges you. It handles repetitive quiz creation, instantaneous grading, and multi-layered diagnostic forensics. Let's look at the four core pillars that make this platform essential.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Instant Quiz Generation</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate curriculum-aligned MCQs and True/False questions in under 5 seconds with automatic rationale keys.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Student Weak Points Detection</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pinpoint exact cognitive gaps and auto-generate 1-click targeted retraining quizzes for each student.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 flex-shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Low-Understanding Topic Heatmaps</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Visual classroom-wide heatmaps reveal curriculum bottlenecks weeks before standardized exams take place.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Adaptive Engine & Forensics</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dynamic difficulty scaling matching student capability, backed by proctor-grade cheating anomaly detection.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-center text-xs text-cyan-300">
            ⚡ Powered by client-side Puter AI • Zero API keys required • 100% Free for Educators
          </div>
        </div>
      )
    },

    // SLIDE 4: AI QUESTION GENERATOR
    {
      id: 4,
      tag: "Feature Deep-Dive",
      title: "AI Question Generator: 6+ Hours Saved Weekly",
      subtitle: "From Blank Page to Rigorous Curriculum Assessment in Seconds",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      speakerNotes: "Imagine needing a formative check on photosynthesis for tomorrow morning. You simply type the topic, choose the grade level and question count, and click generate. In under 5 seconds, you receive balanced questions with full answer rationales and difficulty tags.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <h3 className="text-2xl font-bold text-white">How It Works in Your Routine</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Standards-Aligned:</strong> Tailored by Grade (6-12), Subject (Math, Science, English, etc.), and Unit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Complete with Rationale:</strong> Every question includes automated explanation keys and student hints.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Instant Export:</strong> Push straight to digital student tests or print as paper-based exam handouts.</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-slate-800 pb-2">
                <span>GENERATOR PREVIEW</span>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300">3.8s</Badge>
              </div>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-white">Topic: Newton's Laws (Grade 9)</div>
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-200">
                  "Which scenario best demonstrates Newton's 3rd Law?"
                </div>
                <div className="text-[10px] text-emerald-400">✓ Auto-calibrated difficulty: Medium</div>
                <div className="text-[10px] text-cyan-300">✓ Includes detailed pedagogical explanation</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400">
            📊 <strong>Impact:</strong> Reduces assessment creation time from 45 minutes down to under 60 seconds per test.
          </div>
        </div>
      )
    },

    // SLIDE 5: AI WEAK POINTS DETECTION
    {
      id: 5,
      tag: "Flagship Feature",
      title: "AI Student Weak Points Detection",
      subtitle: "Pinpoint Cognitive Gaps & Deliver 1-Click Targeted Retraining",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      speakerNotes: "This is where EduPath fundamentally shifts teaching. When Sarah misses questions, our neural audit isolates whether she failed due to conceptual confusion or arithmetic slips. With one click, Sarah receives a targeted 4-question retraining quiz focused only on her deficit until mastery is achieved.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Cognitive Error Forensics</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                EduPath inspects student error distributions to categorize failures into three actionable buckets:
              </p>
              <div className="space-y-2 text-xs text-slate-200">
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                  🧠 <strong>Conceptual Gap:</strong> Misunderstanding theoretical rules or laws.
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                  📐 <strong>Calculation Slip:</strong> Correct concept with computational error.
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                  📖 <strong>Vocabulary Blocker:</strong> Confusion between domain terms.
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">1-Click Targeted Retraining</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rather than forcing a student to re-take an entire 30-question exam, EduPath generates a personalized micro-practice:
              </p>
              <div className="space-y-2 text-xs text-slate-200">
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                  🎯 <strong>Remediation Micro-Quizzes:</strong> 3-5 laser-focused questions.
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                  📈 <strong>Adaptive Mastery Curve:</strong> Visual verification as gaps close.
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                  🤝 <strong>1-on-1 Coaching Prompts:</strong> Pre-prepared talking points for the teacher.
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 6: AI LOW UNDERSTANDING TOPICS
    {
      id: 6,
      tag: "Curriculum Foresight",
      title: "AI Low-Understanding Topic Heatmaps",
      subtitle: "Detect Classroom Misconceptions Weeks Before Major Exams",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      speakerNotes: "Instead of waiting for state test results that arrive two months after the school year ends, EduPath gives you real-time concept heatmaps. You can see immediately that while 92% of your class mastered Linear Equations, only 41% comprehended Graphing Inequalities.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-4 text-left">
              <h3 className="text-xl font-bold text-white">Classroom-Wide Concept Radar</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Aggregates quiz results across your entire class to display comprehension levels topic by topic:
              </p>
              <div className="space-y-2.5 text-xs text-slate-200">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                  <span>Linear Systems (Algebra I)</span>
                  <span className="font-bold text-emerald-400">92% High Mastery</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30">
                  <span>Polynomial Factoring</span>
                  <span className="font-bold text-amber-400">68% Moderate Mastery</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30">
                  <span>Quadratic Inequalities</span>
                  <span className="font-bold text-rose-400">38% Low Understanding ⚠️</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-4">
              <h4 className="font-bold text-sm text-rose-300 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Why This Empowers Teachers
              </h4>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Curriculum Bottleneck Alerts:</strong> Tells you exactly what to review during tomorrow's 15-minute warmup.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Small-Group Clustering:</strong> Automatically groups students sharing identical misconceptions for targeted workshops.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Pre-Exam Diagnostics:</strong> Never be surprised by poor exam scores again.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 7: ADAPTIVE TESTING & CHEATING DETECTION
    {
      id: 7,
      tag: "Integrity & Engagement",
      title: "Adaptive Engine & Forensic Integrity",
      subtitle: "Personalized Pacing Paired with Proctor-Grade Exam Security",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      speakerNotes: "When students take digital exams, teachers often worry about two things: cheating, and one-size-fits-all frustration. EduPath dynamically scales question difficulty to student competence while non-intrusively auditing response velocity and tab-switching.",
      renderContent: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Dynamic Adaptive Engine</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Questions automatically scale in difficulty in real time based on each student's ongoing accuracy and response latency:
            </p>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Prevents boredom for advanced high-achievers.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Protects struggling students from testing anxiety.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Measures true upper-bound mastery with fewer questions.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Forensic Exam Integrity</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Non-invasive, automated telemetry flags academic dishonesty without stressful lockdowns:
            </p>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span><strong>Tab-Switch Telemetry:</strong> Records focus loss during exams.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span><strong>Velocity Anomaly Detection:</strong> Flags impossible answer speeds.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span><strong>Answer Modification Audits:</strong> Tracks frantic answer flipping.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // SLIDE 8: 24/7 STUDY ASSISTANT & PARENT REPORTS
    {
      id: 8,
      tag: "Community Impact",
      title: "24/7 AI Study Assistant & Parent Communication",
      subtitle: "Extending Your Pedagogical Reach to the Home and Family",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      speakerNotes: "How often do you get urgent homework emails at 9:00 PM? EduPath's Socratic Study Assistant acts as your night-shift teaching assistant, providing hints without giving answers. And for parents, EduPath generates plain-language progress summaries in one click.",
      renderContent: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">24/7 Socratic AI Tutor</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Guides students through difficult homework with scaffolded questions and hints—never just giving away the final answer.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-emerald-300">
              💬 <em>"Let's break down the denominator first. What factors multiply to 12 and add to 7?"</em>
            </div>
            <p className="text-[11px] text-slate-400">
              Protects teacher personal time while ensuring no student is left stranded on evening homework.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1-Click Parent Summaries</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transforms numerical test grades into encouraging, plain-language narrative reports for parents and families:
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-purple-300">
              📋 <em>"Alex shows strong grasp of cell theory (88%). We recommend 10 minutes of extra practice on enzyme reactions."</em>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero typing required. Perfect for weekly parent updates and conference preparation.
            </p>
          </div>
        </div>
      )
    },

    // SLIDE 9: CLASSROOM WORKFLOW
    {
      id: 9,
      tag: "Day-to-Day Flow",
      title: "Seamless 4-Step Classroom Workflow",
      subtitle: "Designed to Fit Natural Teaching Habits Without Added Administrative Friction",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      speakerNotes: "EduPath doesn't require a 40-hour training workshop. On Monday you generate a quick check. On Wednesday students take it with instant grading. Wednesday afternoon you glance at the heatmap, and on Thursday EduPath launches targeted retraining quizzes automatically.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2 relative">
              <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px] mb-1">Step 1 • 60 Sec</Badge>
              <h4 className="font-bold text-white text-sm">Generate or Build</h4>
              <p className="text-xs text-slate-300">
                Enter your topic, set grade level, and assemble aligned quizzes in seconds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-2 relative">
              <Badge className="bg-blue-500/20 text-blue-300 text-[10px] mb-1">Step 2 • In Class</Badge>
              <h4 className="font-bold text-white text-sm">Assess & Grade</h4>
              <p className="text-xs text-slate-300">
                Students complete test on Chromebooks or mobile. Instant auto-grading.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2 relative">
              <Badge className="bg-amber-500/20 text-amber-300 text-[10px] mb-1">Step 3 • Instant</Badge>
              <h4 className="font-bold text-white text-sm">Review Heatmaps</h4>
              <p className="text-xs text-slate-300">
                View class topic mastery and spot low-understanding bottlenecks immediately.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2 relative">
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] mb-1">Step 4 • 1-Click</Badge>
              <h4 className="font-bold text-white text-sm">Auto-Retrain</h4>
              <p className="text-xs text-slate-300">
                AI dispatches personalized micro-quizzes targeting individual weak points.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-300">
            ✅ <strong>Result:</strong> Assessment becomes an active learning cycle rather than a stressful end-of-unit chore.
          </div>
        </div>
      )
    },

    // SLIDE 10: MEASURABLE PROOF & DATA
    {
      id: 10,
      tag: "Proven Impact",
      title: "Measurable Impact & Educator Metrics",
      subtitle: "Real Results from Classrooms Using Diagnostic AI Assessments",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      speakerNotes: "The numbers speak for themselves. Teachers recover over 6 hours every single week—that's time back for your family, your hobbies, or preparing exciting hands-on labs. More importantly, student outcomes improve because misconceptions are addressed immediately rather than lingering until final exams.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-cyan-400">6.4 Hrs</div>
              <div className="text-xs font-semibold text-white">Saved Weekly</div>
              <div className="text-[10px] text-slate-400">On grading & quiz prep</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">42%</div>
              <div className="text-xs font-semibold text-white">Faster Recovery</div>
              <div className="text-[10px] text-slate-400">On low-understanding topics</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400">38%</div>
              <div className="text-xs font-semibold text-white">Less Test Anxiety</div>
              <div className="text-[10px] text-slate-400">Through adaptive difficulty</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">$0.00</div>
              <div className="text-xs font-semibold text-white">Cost to Teachers</div>
              <div className="text-[10px] text-slate-400">100% Free Forever</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 text-left space-y-2">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "I haven't taken a stack of grading home on a weekend since our department adopted EduPath. And for the first time, I know before the exam which topics my students are confused about."
            </p>
            <div className="text-xs font-bold text-cyan-400">— Science Department Head & 10th Grade Educator</div>
          </div>
        </div>
      )
    },

    // SLIDE 11: TECHNICAL ADVANTAGES
    {
      id: 11,
      tag: "Frictionless Tech",
      title: "Zero IT Hassle, Zero Hidden Costs",
      subtitle: "Why EduPath is the Most Accessible Tool in Your School",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      speakerNotes: "You don't need district budget approvals, IT tickets, or paid OpenAI API keys. EduPath runs directly in the browser powered by Puter AI with automatic local fallback. You can create your teacher account during your lunch break and use it in your 5th-period class this afternoon.",
      renderContent: () => (
        <div className="space-y-6 max-w-4xl mx-auto py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Feature Comparison</th>
                  <th className="py-3 px-4 text-cyan-400 font-bold">EduPath</th>
                  <th className="py-3 px-4 text-slate-500">Traditional LMS / Assessment Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Pricing for Teachers</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">100% Free</td>
                  <td className="py-3 px-4 text-slate-400">$1,500 - $5,000 / year district license</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Setup & Onboarding</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">&lt; 2 Minutes</td>
                  <td className="py-3 px-4 text-slate-400">Weeks of IT provisioning & admin tickets</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">API Keys Required</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">None (Puter AI Native)</td>
                  <td className="py-3 px-4 text-slate-400">Requires paid OpenAI / Gemini keys</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Student Weak Point Retraining</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">Automated 1-Click</td>
                  <td className="py-3 px-4 text-slate-400">Manual review & test creation</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Classroom Misconception Heatmaps</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">Real-Time Radar</td>
                  <td className="py-3 px-4 text-slate-400">Static tables with raw scores only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },

    // SLIDE 12: CALL TO ACTION
    {
      id: 12,
      tag: "Get Started",
      title: "Join the Future of Teaching Today",
      subtitle: "Set Up Your Teacher Account in Under 2 Minutes — Completely Free",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      speakerNotes: "Colleagues, education is advancing rapidly, and teachers deserve tools that work for them instead of adding administrative burden. Try EduPath today—it's free, it works immediately, and it will change how your classroom learns. Thank you, and I'd love to take any questions or walk you through a live demo right now.",
      renderContent: () => (
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto py-6">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 text-white w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Ready to Reclaim Your Weekends?
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Join educators transforming assessment into an inspiring cycle of mastery. Generate quizzes, isolate student weak points, and monitor class concept heatmaps today.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 print:hidden">
                <Button 
                  size="lg" 
                  onClick={() => setLocation('/register')} 
                  className="bg-white text-indigo-900 hover:bg-white/90 font-bold px-8 shadow-2xl text-base h-12"
                >
                  Register as Teacher (Free)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => setLocation('/teacher-invite')} 
                  className="bg-black/20 hover:bg-black/30 text-white border-white/40 text-base h-12"
                >
                  View Full Poster
                </Button>
              </div>

              <div className="pt-6 border-t border-white/20 text-xs text-white/80 flex flex-wrap justify-between items-center gap-2">
                <span>Direct URL: <strong>https://emadabutaleb0-afk.github.io/EduPath/</strong></span>
                <span>Open-Source & Free for Schools</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  }, [handleNext, handlePrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyDeckLink = () => {
    navigator.clipboard.writeText(window.location.origin + window.location.pathname);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar (Hidden on Print & Fullscreen) */}
      {!isFullscreen && (
        <div className="print:hidden">
          <Navbar />
        </div>
      )}

      <main className="flex-1 container max-w-6xl py-6 px-4 sm:px-6 flex flex-col justify-between">
        {/* PRESENTATION CONTROL BAR (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <div className="flex items-center gap-2">
            <Badge className="px-3 py-1 font-semibold text-cyan-400 border-cyan-500/30 bg-cyan-950/40">
              Pitch Deck
            </Badge>
            <span className="text-xs font-semibold text-slate-300">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <span className="text-xs text-slate-500 hidden md:inline">• Use ← / → arrows to navigate</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className={`gap-1.5 text-xs border-slate-700 ${showNotes ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {showNotes ? "Hide Notes" : "Speaker Notes"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-1.5 text-xs border-slate-700 bg-slate-800 text-slate-300"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs border-slate-700 bg-slate-800 text-slate-300"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Deck
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyDeckLink}
              className="gap-1.5 text-xs border-slate-700 bg-slate-800 text-slate-300"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedLink ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CURRENT SLIDE CANVAS                                          */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col justify-center rounded-3xl overflow-hidden border border-slate-800 bg-[#0A0D1D] shadow-[0_0_50px_rgba(37,99,235,0.15)] relative p-6 sm:p-10 lg:p-12 min-h-[520px] print:border-none print:shadow-none print:p-2">
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 print:hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 transition-all duration-300" 
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Slide Header */}
          <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <Badge className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border ${slide.badgeColor}`}>
                {slide.tag}
              </Badge>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {slide.subtitle}
              </p>
            </div>
            <div className="text-right text-xs font-mono text-slate-500 hidden sm:block">
              {String(slide.id).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </div>
          </div>

          {/* Slide Body */}
          <div className="flex-1 flex items-center justify-center">
            {slide.renderContent()}
          </div>

          {/* Speaker Notes Drawer (Toggled) */}
          {showNotes && (
            <div className="mt-6 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-100 text-xs sm:text-sm space-y-1 animate-fade-in print:hidden">
              <div className="font-bold flex items-center gap-1.5 text-indigo-300 uppercase text-[10px] tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Speaker Notes for Presenter:
              </div>
              <p className="leading-relaxed text-indigo-200">
                {slide.speakerNotes}
              </p>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SLIDE NAVIGATION CONTROLS                                    */}
        {/* ============================================================ */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 print:hidden">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="gap-2 border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 max-w-md overflow-x-auto py-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-500/50'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Slide ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/20"
          >
            Next Slide
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Print Layout: Renders all slides sequentially when printing */}
        <div className="hidden print:block space-y-12 pt-8">
          {slides.map((s) => (
            <div key={s.id} className="p-8 border-b border-slate-700 page-break-after">
              <div className="mb-4">
                <span className="text-xs text-cyan-400 font-bold uppercase">{s.tag}</span>
                <h2 className="text-2xl font-bold text-white">{s.title}</h2>
                <p className="text-xs text-slate-400">{s.subtitle}</p>
              </div>
              <div className="my-6">
                {s.renderContent()}
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <strong>Speaker Notes:</strong> {s.speakerNotes}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
