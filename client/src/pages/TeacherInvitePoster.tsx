import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  HelpCircle, 
  FileText, 
  Sliders, 
  Clock, 
  Award,
  Download
} from 'lucide-react';

export default function TeacherInvitePoster() {
  const [, setLocation] = useLocation();
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/register');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const aiFeatures = [
    {
      title: "AI Question Generator",
      tagline: "Instant Quizzes in Seconds",
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      color: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
      description: "Generate curriculum-aligned Multiple Choice and True/False questions for any grade, topic, and difficulty with automated explanations and scoring keys."
    },
    {
      title: "AI Adaptive Testing Engine",
      tagline: "Personalized Difficulty Scaling",
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      color: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
      description: "Diagnose student weaknesses faster. The engine adjusts question complexity dynamically based on each learner's real-time accuracy and pacing."
    },
    {
      title: "AI Cheating & Forensic Integrity",
      tagline: "Uncompromised Exam Security",
      icon: <ShieldCheck className="w-6 h-6 text-rose-500" />,
      color: "from-rose-500/10 to-rose-500/5 border-rose-500/20",
      description: "Detect timing anomalies, rapid guessing, and answer-switching patterns with automated AI forensic audit breakdowns for proctors."
    },
    {
      title: "24/7 AI Student Study Assistant",
      tagline: "Your Virtual Classroom Co-Teacher",
      icon: <Bot className="w-6 h-6 text-emerald-500" />,
      color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
      description: "Students receive personalized, step-by-step tutoring explanations on difficult homework concepts without burdening teacher office hours."
    },
    {
      title: "AI Parent Report Summarizer",
      tagline: "1-Click Family Communication",
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      color: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
      description: "Transform raw test metrics into plain-language narrative reports highlighting student achievements, areas of concern, and actionable guidance."
    },
    {
      title: "AI Difficulty Auto-Calibration",
      tagline: "Self-Optimizing Curriculum",
      icon: <Sliders className="w-6 h-6 text-indigo-500" />,
      color: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
      description: "Questions self-calibrate difficulty ratings against empirical student pass rates and response durations, keeping assessments accurate and fair."
    }
  ];

  const coreFeatures = [
    {
      title: "Custom Test Builder",
      desc: "Assemble timed checkpoints, practice quizzes, and final exams with mixed formats.",
      icon: <BookOpen className="w-5 h-5 text-primary" />
    },
    {
      title: "Deep Classroom Analytics",
      desc: "Radar charts, score velocity, and mastery graphs by subject, standard, and student.",
      icon: <BarChart3 className="w-5 h-5 text-primary" />
    },
    {
      title: "Instant Automated Grading",
      desc: "Zero hours spent hand-marking. Detailed answer keys and feedback given immediately.",
      icon: <Clock className="w-5 h-5 text-primary" />
    },
    {
      title: "Multi-Role Collaboration",
      desc: "Dedicated portals for students, teachers, parents, and administrative staff.",
      icon: <Users className="w-5 h-5 text-primary" />
    },
    {
      title: "Curriculum Alignment",
      desc: "Organized by grade levels (6-12), subjects (Math, Science, English), and units.",
      icon: <Award className="w-5 h-5 text-primary" />
    },
    {
      title: "Zero API Key Setup",
      desc: "Powered directly by Puter AI client-side engine with automatic local fallback.",
      icon: <Brain className="w-5 h-5 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 container max-w-6xl py-8 px-4 sm:px-6">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden bg-card/60 backdrop-blur border border-border/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 font-semibold text-primary border-primary/30 bg-primary/5">
              Official Invitation Poster
            </Badge>
            <span className="text-xs text-muted-foreground">Print-ready & shareable</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </Button>
            <Button size="sm" onClick={() => setLocation('/register')} className="gap-2 bg-primary text-primary-foreground shadow-sm">
              Join as Teacher
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* POSTER CANVAS (PRINT READY) */}
        <div className="border border-border/70 rounded-3xl overflow-hidden bg-card shadow-2xl relative print:border-none print:shadow-none print:rounded-none">
          {/* Top Decorative Gradient Banner */}
          <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* Hero Section */}
          <div className="p-8 sm:p-12 lg:p-14 bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  Next-Generation Teaching Ecosystem
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-foreground">
                  Empower Your Classroom with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">EduPath</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Join educators who are transforming learning through automated test creation, real-time adaptive assessments, and student performance diagnostics.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-semibold">Save 6+ Hours Weekly</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-semibold">Puter AI Engine</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-semibold">100% Free for Educators</span>
                  </div>
                </div>
              </div>

              {/* Poster Visual Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-border/80 transition-all duration-300 hover:scale-[1.02]">
                  <img 
                    src="./teacher_invite_poster.jpg" 
                    alt="EduPath Teacher Invitation Poster" 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      // Fallback if relative path needs root
                      (e.target as HTMLImageElement).src = '/EduPath/teacher_invite_poster.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 print:hidden">
                    <a 
                      href="./teacher_invite_poster.jpg" 
                      download="EduPath_Teacher_Invitation_Poster.jpg"
                      className="inline-flex items-center gap-1.5 text-xs text-white bg-black/70 hover:bg-black px-3 py-1.5 rounded-lg backdrop-blur"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Poster Art
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: CUTTING-EDGE AI SUITE */}
          <div className="p-8 sm:p-12 border-t border-border/80 bg-secondary/15">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs uppercase font-bold tracking-wider">
                Full AI Intelligence Suite
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                6 State-of-the-Art AI Capabilities Built for Teachers
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Powered directly by client-side Puter AI models without API key friction or complex setup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-2xl border bg-gradient-to-br ${item.color} shadow-sm transition-all hover:shadow-md flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-background/80 shadow-xs border border-border/50">
                        {item.icon}
                      </div>
                      <Badge variant="outline" className="text-[11px] font-semibold bg-background/60">
                        AI Powered
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                      <p className="text-xs font-semibold text-primary">{item.tagline}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: CORE CLASSROOM MANAGEMENT FEATURES */}
          <div className="p-8 sm:p-12 border-t border-border/80 bg-card">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <Badge variant="secondary" className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
                Complete Educator Toolset
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                Everything You Need to Manage & Inspire
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                A seamless ecosystem linking classroom teaching with individual student mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreFeatures.map((f, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl border border-border/70 bg-card/60 hover:bg-secondary/40 transition-colors">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary h-fit flex-shrink-0">
                    {f.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: INVITATION CALL TO ACTION */}
          <div className="p-8 sm:p-12 border-t border-border/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white text-center space-y-6">
            <div className="max-w-3xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Ready to Experience the Future of Teaching?
              </h2>
              <p className="text-base sm:text-lg text-white/90">
                Join EduPath today. Set up your teacher profile in under 2 minutes and start generating quizzes instantly.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 print:hidden">
              <Button 
                size="lg" 
                onClick={() => setLocation('/register')} 
                className="bg-white text-indigo-700 hover:bg-white/90 font-bold px-8 shadow-lg text-base h-12"
              >
                Register as a Teacher
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleCopyLink} 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base h-12"
              >
                {copiedLink ? "Link Copied! ✓" : "Copy Teacher Invite Link"}
              </Button>
            </div>

            {/* Print Footer Details */}
            <div className="pt-6 border-t border-white/20 flex flex-wrap justify-between items-center text-xs text-white/80 max-w-4xl mx-auto">
              <span>Platform: <strong>EduPath Learning & Assessment</strong></span>
              <span>Online Demo: <strong>https://emadabutaleb0-afk.github.io/EduPath/</strong></span>
              <span>Join Free: <strong>/register?role=teacher</strong></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
