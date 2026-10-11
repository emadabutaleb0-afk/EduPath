import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  Bot, 
  FileText, 
  Sliders, 
  Clock, 
  Award,
  Download,
  Target,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Radar,
  Flame,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function TeacherInvitePoster() {
  const [, setLocation] = useLocation();
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const inviteUrl = window.location.origin + window.location.pathname.replace(/\/poster|\/teacher-invite/, '') + '/register?role=teacher';
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Two Flagship Diagnostic Pillars explicitly requested
  const diagnosticSpotlights = [
    {
      title: "AI Student Weak Points Detection",
      subtitle: "Pinpoint Exact Learning Gaps & Auto-Generate Retraining",
      badge: "Student-Level Precision",
      icon: <Target className="w-8 h-8 text-amber-400" />,
      glowColor: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30",
      accentBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      description: "EduPath's neural diagnostic engine analyzes every student response, mistake pattern, and hesitation time to isolate exact cognitive deficits—not just a raw percentage.",
      bullets: [
        "Individual Skill Gap Analysis: Identifies whether failures stem from conceptual misunderstanding, calculation slips, or vocabulary gaps.",
        "Automated 1-Click Retraining: Spawns personalized remediation mini-quizzes targeting only the student's identified weak competencies.",
        "Learning Curve Acceleration: Tracks recovery over time as students eliminate weak points through adaptive micro-practice.",
        "Mistake Forensics: Automatically categorizes error patterns across test attempts to guide 1-on-1 teacher coaching."
      ]
    },
    {
      title: "AI Low-Understanding Topic Heatmaps",
      subtitle: "Detect Classroom Misconceptions Before High-Stakes Exams",
      badge: "Curriculum-Level Vision",
      icon: <TrendingDown className="w-8 h-8 text-rose-400" />,
      glowColor: "from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/30",
      accentBg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      description: "Classroom-wide AI heatmaps aggregate student test outcomes to pinpoint which specific curriculum topics and sub-standards your class struggles with most.",
      bullets: [
        "Real-Time Concept Mastery Heatmap: Color-coded radar & bar breakdown showing high, moderate, and low-understanding topics.",
        "Curriculum Bottleneck Alerts: Flags sub-topics with <50% classroom comprehension (e.g. Fractions, Cell Respiration, Kinematics).",
        "Targeted Intervention Groups: Groups students sharing identical low-mastery concepts for collaborative small-group reteaching.",
        "Pre-Exam Diagnostic Reports: Tells teachers exactly what topics to review during the final week before standardized exams."
      ]
    }
  ];

  const puterAiFeatures = [
    {
      title: "AI Question Generator",
      tagline: "Instant Standards-Aligned Quizzes",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      border: "border-amber-500/30 bg-amber-500/5",
      desc: "Produce rich Multiple Choice, True/False, and free-response questions with instant answer keys and rationale in under 10 seconds."
    },
    {
      title: "AI Adaptive Testing Engine",
      tagline: "Dynamic Real-Time Difficulty Scaling",
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      border: "border-blue-500/30 bg-blue-500/5",
      desc: "Adjusts test complexity on the fly based on student accuracy and latency to measure true upper-bound mastery."
    },
    {
      title: "AI Cheating & Forensic Integrity",
      tagline: "Proctor-Grade Exam Security",
      icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
      border: "border-rose-500/30 bg-rose-500/5",
      desc: "Monitors anomalous response times, rapid random guessing, and answer-flipping with automated anomaly risk scoring."
    },
    {
      title: "24/7 AI Student Study Assistant",
      tagline: "Your Virtual Classroom Co-Teacher",
      icon: <Bot className="w-5 h-5 text-emerald-400" />,
      border: "border-emerald-500/30 bg-emerald-500/5",
      desc: "Provides patient, step-by-step guidance, hints, and concept breakdowns so students get help anytime without waiting."
    },
    {
      title: "AI Parent Report Summarizer",
      tagline: "1-Click Family Communications",
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      border: "border-purple-500/30 bg-purple-500/5",
      desc: "Translates complex grading datasets into empathetic, human-readable narrative progress summaries for parents."
    },
    {
      title: "AI Difficulty Auto-Calibration",
      tagline: "Self-Balancing Assessment Bank",
      icon: <Sliders className="w-5 h-5 text-cyan-400" />,
      border: "border-cyan-500/30 bg-cyan-500/5",
      desc: "Empirically refines question difficulty based on historical cohort pass rates and time-on-task metrics."
    }
  ];

  const classroomTools = [
    { title: "Custom Test Builder", desc: "Build timed checkpoints, chapter quizzes, and finals with mixed formats.", icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { title: "Instant Auto-Grading", desc: "Zero hand-marking. Instant feedback & scoring for all enrolled students.", icon: <Clock className="w-4 h-4 text-emerald-400" /> },
    { title: "Multi-Role Dashboards", desc: "Distinct, purpose-built interfaces for Teachers, Students, and Parents.", icon: <Users className="w-4 h-4 text-indigo-400" /> },
    { title: "Curriculum Alignment", desc: "Organized by grade levels (6-12), subjects (Math, Science, English), and units.", icon: <Award className="w-4 h-4 text-amber-400" /> },
    { title: "Deep Visual Analytics", desc: "Radar charts, score velocity, topic mastery percentages, and trendlines.", icon: <BarChart3 className="w-4 h-4 text-violet-400" /> },
    { title: "Zero API Key Setup", desc: "Powered directly by Puter AI client-side engine with automatic local fallback.", icon: <Brain className="w-4 h-4 text-pink-400" /> }
  ];

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar (Hidden on Print) */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 container max-w-6xl py-6 px-4 sm:px-6">
        {/* ACTION / CONTROL BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Badge className="px-3 py-1 font-semibold text-cyan-400 border-cyan-500/30 bg-cyan-950/40">
              Teacher Invitation Poster • Full Color Edition
            </Badge>
            <span className="text-xs text-slate-400 hidden sm:inline">Designed for high-impact classroom adoption & sharing</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint} 
              className="gap-2 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </Button>
            <Button 
              size="sm" 
              onClick={() => setLocation('/register')} 
              className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/20"
            >
              Join as Teacher
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FULL COLORED POSTER CANVAS                                   */}
        {/* ============================================================ */}
        <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-[0_0_50px_rgba(37,99,235,0.15)] bg-[#0A0D1D] relative print:border-none print:shadow-none print:rounded-none print:bg-[#070913]">
          
          {/* Luminous Top Color Bar */}
          <div className="h-3 w-full bg-gradient-to-r from-cyan-400 via-indigo-500 via-purple-500 to-amber-400" />

          {/* ============================================================ */}
          {/* POSTER HERO: HEADER & ARTWORK SHOWCASE                      */}
          {/* ============================================================ */}
          <div className="relative p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0A0E23] to-[#080B1A]">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Bold Invitation Headline & Value Props */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Educator Invitation • Next-Gen AI Ecosystem
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  Empower Your Classroom With{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                    EduPath AI
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                  The unified platform combining <strong>automated quiz generation</strong>, <strong>AI-powered student weak point detection</strong>, and <strong>classroom low-understanding topic diagnostics</strong>.
                </p>

                {/* Key Benefits Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-100">Save 6+ Hours</div>
                      <div className="text-[11px] text-slate-400">Automated Grading & Tests</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                    <Brain className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-100">Puter AI Powered</div>
                      <div className="text-[11px] text-slate-400">Zero API Key Setup</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-purple-500/30">
                    <GraduationCap className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-100">100% Free</div>
                      <div className="text-[11px] text-slate-400">For All Teachers</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Full-Colored Poster Graphic Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 transition-all duration-300 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:scale-[1.02] bg-slate-900">
                  <img 
                    src="./teacher_invite_poster.jpg" 
                    alt="EduPath Full Color Poster Design" 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './full_color_poster.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 print:hidden">
                    <span className="text-xs font-semibold text-cyan-300">EduPath Poster Art</span>
                    <a 
                      href="./teacher_invite_poster.jpg" 
                      download="EduPath_Full_Colored_Poster.jpg"
                      className="inline-flex items-center gap-1.5 text-xs text-white bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-lg font-medium shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Image
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SPECIAL SPOTLIGHT: AI WEAK POINTS & LOW UNDERSTANDING TOPICS */}
          {/* ============================================================ */}
          <div className="p-6 sm:p-10 border-t border-slate-800 bg-[#090C1A]">
            <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
              <Badge className="bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/30 px-3 py-1 text-xs uppercase font-bold tracking-wider">
                Flagship Diagnostic Intelligence
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Never Let a Student Fall Behind
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Traditional gradebooks only give numbers. EduPath gives deep diagnostic insight into what students miss and why.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {diagnosticSpotlights.map((spot, idx) => (
                <div 
                  key={idx}
                  className={`p-6 rounded-2xl border bg-gradient-to-br ${spot.glowColor} relative overflow-hidden shadow-lg flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 shadow-md">
                        {spot.icon}
                      </div>
                      <Badge className={`text-xs font-bold ${spot.accentBg}`}>
                        {spot.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{spot.title}</h3>
                      <p className="text-xs sm:text-sm font-semibold text-cyan-300 mt-1">{spot.subtitle}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {spot.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {spot.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: COMPLETE PUTER AI SUITE                           */}
          {/* ============================================================ */}
          <div className="p-6 sm:p-10 border-t border-slate-800 bg-[#070914]">
            <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-bold tracking-wider">
                Full AI Capability Suite
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                6 Integrated AI Tools Working for You
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Puter AI models built directly into every teacher and student workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {puterAiFeatures.map((feat, fIdx) => (
                <div 
                  key={fIdx} 
                  className={`p-5 rounded-2xl border ${feat.border} bg-slate-900/60 backdrop-blur-sm hover:border-cyan-500/50 transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                        {feat.icon}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Powered</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{feat.title}</h4>
                      <p className="text-[11px] font-medium text-cyan-400">{feat.tagline}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: CLASSROOM MANAGEMENT ESSENTIALS                  */}
          {/* ============================================================ */}
          <div className="p-6 sm:p-10 border-t border-slate-800 bg-[#090C1A]">
            <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
              <Badge className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1 text-xs uppercase font-bold tracking-wider">
                Complete Educator Ecosystem
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Everything to Create, Teach & Elevate
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classroomTools.map((tool, tIdx) => (
                <div key={tIdx} className="flex gap-3.5 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 h-fit flex-shrink-0">
                    {tool.icon}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs sm:text-sm text-white">{tool.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: CALL TO ACTION BANNER (VIBRANT FULL-BLEED)        */}
          {/* ============================================================ */}
          <div className="p-8 sm:p-12 border-t border-slate-800 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 text-white text-center relative overflow-hidden">
            {/* Ambient Shine */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="max-w-3xl mx-auto space-y-3 relative z-10">
              <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 text-xs uppercase font-bold tracking-wider">
                Get Started in 2 Minutes
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Join the Future of AI-Driven Education
              </h2>
              <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
                Set up your educator account today. Experience automatic quiz generation, student weak-point retraining, and classroom concept heatmaps—completely free.
              </p>
            </div>

            {/* Buttons (Hidden on Print) */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 relative z-10 print:hidden">
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
                onClick={handleCopyLink} 
                className="bg-black/20 hover:bg-black/30 text-white border-white/40 text-base h-12"
              >
                {copiedLink ? "Invite Link Copied! ✓" : "Copy Teacher Invite Link"}
              </Button>
            </div>

            {/* Print Footer Details */}
            <div className="pt-8 mt-6 border-t border-white/20 flex flex-wrap justify-between items-center text-xs text-white/90 max-w-4xl mx-auto">
              <span>Platform: <strong>EduPath Learning & Assessment</strong></span>
              <span>Online Demo: <strong>https://emadabutaleb0-afk.github.io/EduPath/</strong></span>
              <span>Direct Route: <strong>/teacher-invite</strong></span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
