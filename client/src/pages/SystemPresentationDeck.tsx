import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Brain, 
  Target, 
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
  Video, 
  CreditCard, 
  Database, 
  Calendar, 
  GraduationCap, 
  HelpCircle, 
  Sliders, 
  History, 
  Activity, 
  Flame, 
  TrendingUp, 
  Lock, 
  Layers, 
  Check, 
  AlertTriangle,
  Play,
  Monitor,
  Share2,
  ExternalLink,
  Info
} from 'lucide-react';

interface Slide {
  id: number;
  category: 'Overview' | 'Student' | 'Teacher' | 'Parent' | 'Admin' | 'Booking';
  tag: string;
  title: string;
  subtitle: string;
  badgeColor: string;
  speakerNotes: string;
  renderContent: () => React.ReactNode;
}

export default function SystemPresentationDeck() {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const slides: Slide[] = [
    // -------------------------------------------------------------
    // SLIDE 1: PLATFORM OVERVIEW
    // -------------------------------------------------------------
    {
      id: 1,
      category: 'Overview',
      tag: 'Executive Overview',
      title: 'EduPath — AI-Powered Learning & Assessment',
      subtitle: 'Adaptive Diagnostic Testing • 1-on-1 Live Tutoring • Automated Remediation • Multi-Role Ecosystem',
      badgeColor: 'bg-primary/20 text-primary border-primary/30',
      speakerNotes: 'EduPath is an all-in-one educational platform uniting students, educators, parents, and administrators. Powered by client-side Puter.js AI and a dual-engine database architecture (Simulated JSON + PostgreSQL), EduPath diagnoses learner weaknesses in real time and automatically tailors tutoring journeys.',
      renderContent: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-cyan-500/30 bg-slate-900/70 text-slate-100 shadow-lg">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-cyan-300">Learner Space</CardTitle>
                <CardDescription className="text-xs text-slate-400">Personalized Mastery</CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5 text-slate-300">
                <div>• IRT Adaptive Diagnostic Tests</div>
                <div>• Milestone Learning Paths & Badges</div>
                <div>• Live Interactive Tutoring Hub</div>
                <div>• Instant Concept Remediations</div>
              </CardContent>
            </Card>

            <Card className="border-indigo-500/30 bg-slate-900/70 text-slate-100 shadow-lg">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-indigo-300">Teacher Center</CardTitle>
                <CardDescription className="text-xs text-slate-400">Pedagogical Command</CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5 text-slate-300">
                <div>• Verified Subject & Grade Isolation</div>
                <div>• Puter.js AI Question Generator</div>
                <div>• Drag-and-Drop Test Builder</div>
                <div>• Misconception Forensic Heatmaps</div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-slate-900/70 text-slate-100 shadow-lg">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-amber-300">Parent Portal</CardTitle>
                <CardDescription className="text-xs text-slate-400">Transparent Insights</CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5 text-slate-300">
                <div>• Real-time Child Assessment Feed</div>
                <div>• Multi-Tone AI Weekly Summaries</div>
                <div>• Session Booking & Card Receipts</div>
                <div>• Direct Tutor Messaging</div>
              </CardContent>
            </Card>

            <Card className="border-rose-500/30 bg-slate-900/70 text-slate-100 shadow-lg">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-rose-300">Admin Control</CardTitle>
                <CardDescription className="text-xs text-slate-400">Integrity & Platform Ops</CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5 text-slate-300">
                <div>• Heuristic Anti-Cheating Telemetry</div>
                <div>• Reversible Content Version Diffs</div>
                <div>• Dual DB Engine (Mock vs Postgres)</div>
                <div>• Full User & Activity Audit Trails</div>
              </CardContent>
            </Card>
          </div>

          {/* Browser UI Preview Frame */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              </div>
              <span className="ml-2 px-3 py-1 bg-slate-900 rounded-md text-slate-300 font-mono text-[11px]">
                https://edupath.app/system-architecture-2026
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <Activity className="w-3.5 h-3.5" /> All Microservices Operational (0 API Fees)
              </span>
            </div>
            <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-cyan-400 font-mono">100% Free</div>
                <div className="text-xs text-slate-400 mt-1">Client-side Puter.js AI with zero monthly subscription fees</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-indigo-400 font-mono">&lt; 250ms</div>
                <div className="text-xs text-slate-400 mt-1">Local JSON Cache + PostgreSQL Dual Synchronizer</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-emerald-400 font-mono">1-Click</div>
                <div className="text-xs text-slate-400 mt-1">Demo role switcher for seamless presentation walkthroughs</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 2: UNIFIED LIFECYCLE JOURNEY
    // -------------------------------------------------------------
    {
      id: 2,
      category: 'Overview',
      tag: 'Learner Experience',
      title: 'The Unified 7-Stage EduPath Lifecycle',
      subtitle: 'From Onboarding to Targeted Mastery: Complete Feedback Loop',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      speakerNotes: 'The platform is organized around a continuous learning loop. Students begin with an adaptive diagnostic test to identify their starting grade and conceptual gaps. They connect with specialized teachers, book lessons with simulated checkout, attend live interactive sessions, complete post-lesson checkpoints, and receive automated AI performance summaries.',
      renderContent: () => (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { step: '01', title: 'Smart Signup', desc: 'Grade & Subject Goal Profiling', icon: Users, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20' },
              { step: '02', title: 'Diagnostic Test', desc: 'IRT Adaptive Baseline Assessment', icon: Brain, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/20' },
              { step: '03', title: 'Teacher Search', desc: 'Ratings, Hourly Rates & Reviews', icon: GraduationCap, color: 'text-purple-400 border-purple-500/40 bg-purple-950/20' },
              { step: '04', title: 'Booking & Pay', desc: 'Slot Picker & Stripe Card Checkout', icon: CreditCard, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' },
              { step: '05', title: 'Live Classroom', desc: 'WebRTC Hub & Digital Notes Dock', icon: Video, color: 'text-blue-400 border-blue-500/40 bg-blue-950/20' },
              { step: '06', title: 'Retention Quiz', desc: '5-Q Adaptive Checkpoint', icon: CheckCircle2, color: 'text-amber-400 border-amber-500/40 bg-amber-950/20' },
              { step: '07', title: 'AI Digest & Feed', desc: 'Multi-Tone Parent Summaries', icon: Sparkles, color: 'text-rose-400 border-rose-500/40 bg-rose-950/20' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`p-3.5 rounded-xl border flex flex-col justify-between ${item.color} shadow-sm relative group`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">{item.step}</span>
                    <Icon className="w-4 h-4 opacity-80" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white leading-tight mb-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-snug">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lifecycle Architecture Diagram Mockup */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Automated Closed-Loop Retention Flow
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-cyan-500/20">
                <span className="font-bold text-cyan-400 block mb-1">Continuous Diagnostics</span>
                <p className="text-slate-400 text-[11px]">System dynamically adjusts difficulty based on item response parameters. High performing students get challenged; struggling students receive gentle scaffolding.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-indigo-500/20">
                <span className="font-bold text-indigo-400 block mb-1">Targeted Human Mentorship</span>
                <p className="text-slate-400 text-[11px]">Diagnostic gap tags are shared immediately with the assigned teacher, preparing custom whiteboard exercises prior to live tutoring sessions.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-emerald-500/20">
                <span className="font-bold text-emerald-400 block mb-1">Automated Stakeholder Reporting</span>
                <p className="text-slate-400 text-[11px]">Quiz submissions automatically dispatch notifications to the teacher gradebook and generate AI parent summaries with zero manual teacher effort.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 3: STUDENT DIAGNOSTIC TESTING & ADAPTIVE ENGINE
    // -------------------------------------------------------------
    {
      id: 3,
      category: 'Student',
      tag: 'Learner Experience',
      title: 'Adaptive Diagnostic Testing Engine',
      subtitle: 'Real-Time Item Response Theory (IRT) • Auto-Calibration • Question Navigation',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      speakerNotes: 'The diagnostic test interface (/test/:id) offers an uninterrupted, focus-driven environment. As the student answers questions, the difficulty dynamically adjusts. Students can review questions, flag items for review, track remaining time, and submit securely.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Mock Screenshot of Test Screen */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono">
                  Grade 8 • Mathematics Diagnostic
                </Badge>
                <span className="text-slate-400">Question 3 of 10</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" /> 14:22 remaining
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase">
                  Difficulty: Medium (Weight 1.5)
                </Badge>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Fullscreen Integrity Active
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-100 leading-relaxed">
                Solve for <span className="font-mono text-cyan-300">x</span> in the linear equation: <br />
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-bold inline-block mt-1">
                  3(x - 4) + 2 = 2x + 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { key: 'A', text: 'x = 11', correct: false },
                  { key: 'B', text: 'x = 15', correct: true, selected: true },
                  { key: 'C', text: 'x = 9', correct: false },
                  { key: 'D', text: 'x = -5', correct: false },
                ].map((opt) => (
                  <div 
                    key={opt.key}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      opt.selected 
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 font-bold shadow-md' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span><strong className="mr-2 text-slate-400">{opt.key}.</strong> {opt.text}</span>
                    {opt.selected && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 h-8">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <span 
                      key={n} 
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono ${
                        n === 3 ? 'bg-cyan-500 text-black font-bold' : n < 3 ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white h-8">
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Key Feature Highlights */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 mb-1">
                <Brain className="w-4 h-4" /> Item Response Theory (IRT)
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Scores dynamically factor question difficulty weights (1.0 - 2.0). Answering hard problems successfully pushes student placement higher without penalty on exploratory queries.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400 mb-1">
                <Sliders className="w-4 h-4" /> Anti-Guessing Penalty Safe
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Detailed step-by-step rationales are unlocked upon completion, allowing learners to understand missteps immediately on the Results Analysis page.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" /> Exam Lockdown Telemetry
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Automated detection flags window blur, copy/paste attempts, and suspiciously fast clicks (&lt;3s), maintaining absolute diagnostic authenticity.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 4: STUDENT DASHBOARD & LEARNING PATH
    // -------------------------------------------------------------
    {
      id: 4,
      category: 'Student',
      tag: 'Learner Experience',
      title: 'Student Dashboard & Milestone Mastery',
      subtitle: 'Streaks • Upcoming Bookings • Personalized Curriculum Map • Quick Actions',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      speakerNotes: 'The student dashboard serves as the central cockpit. It highlights active learning streaks, mastery progress rings across subjects, upcoming live tutoring appointments with 1-click room entry, and recommended lessons generated from diagnostic results.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Mock Screenshot of Student Dashboard */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl space-y-4">
            {/* Header Greeting */}
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Welcome back, Alex Rivera! 🚀
                </h3>
                <p className="text-xs text-slate-400">Grade 8 • Active Curriculum Track: Algebra & Geometry</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 7 Day Streak
                </Badge>
                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Level 4 Scholar
                </Badge>
              </div>
            </div>

            {/* Upcoming Lesson & Live Classroom Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    Linear Functions & Slope Masterclass
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    With Sarah Jenkins • Today at 16:00 (Starts in 25 mins)
                  </div>
                </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8">
                Join Classroom <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Subject Mastery Progress Bars */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { subject: 'Algebra I', score: 88, color: 'bg-cyan-500', status: 'Mastered' },
                { subject: 'Geometry', score: 72, color: 'bg-indigo-500', status: 'In Progress' },
                { subject: 'Probability', score: 64, color: 'bg-amber-500', status: 'Needs Practice' },
              ].map((sub, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{sub.subject}</span>
                    <span className="font-mono text-cyan-400 font-bold">{sub.score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`${sub.color} h-2 rounded-full`} style={{ width: `${sub.score}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{sub.status}</span>
                </div>
              ))}
            </div>

            {/* Diagnostic Action Bar */}
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">New Diagnostic test available: <strong>Exponents & Radicals</strong></span>
              <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 h-7 text-xs">
                Start Test <Play className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Sidebar Modules */}
          <div className="lg:col-span-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> AI Suggested Next Steps
              </h4>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400">1.</span>
                  <span>Review misstep on <em>Quadratic Factoring</em> from yesterday’s test.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400">2.</span>
                  <span>Complete practice quiz on <em>Pythagorean Triples</em> (5 mins).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400">3.</span>
                  <span>Confirm slot with Teacher Michael for Thursday chemistry session.</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Badges & Achievements
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-lg">🎯</div>
                  <div className="font-bold text-white mt-1">First Ace</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-lg">⚡</div>
                  <div className="font-bold text-white mt-1">Speedster</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-lg">🔥</div>
                  <div className="font-bold text-white mt-1">7-Day Fire</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 5: LIVE CLASSROOM HUB
    // -------------------------------------------------------------
    {
      id: 5,
      category: 'Student',
      tag: 'Live Tutoring',
      title: 'Live Classroom Hub & Notes Dock',
      subtitle: 'Simulated HD WebRTC Video • Digital Whiteboard Canvas • Dynamic Agenda • Post-Lesson Checkpoint',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      speakerNotes: 'Located at /classroom/:lessonId, the Live Classroom Hub provides an immersive environment for 1-on-1 tutoring. It includes simulated high-definition video, a collaborative whiteboard, live session agenda checklist, real-time digital notes dock, and a seamless 5-question retention bridge upon concluding the lesson.',
      renderContent: () => (
        <div className="space-y-4">
          {/* Classroom Simulated UI */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-bold text-white">Live Tutoring Room: #LSN-8042</span>
                <Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-300 ml-2">Mathematics • Grade 8</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                  00:38:14 Elapsed
                </span>
                <Button size="sm" variant="destructive" className="h-7 text-xs font-bold">
                  Conclude Session
                </Button>
              </div>
            </div>

            {/* Main Stage: Video + Whiteboard + Notes Dock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[300px]">
              {/* Left: Video & Whiteboard Canvas (7 cols) */}
              <div className="lg:col-span-7 p-3 space-y-3 bg-slate-950">
                {/* Simulated Video Frame */}
                <div className="relative rounded-lg bg-slate-900 border border-slate-800 h-44 flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-1">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-white">Instructor: Sarah Jenkins, M.Sc.</div>
                    <div className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> HD 1080p Stream Active • Latency 18ms
                    </div>
                  </div>
                  {/* PiP Student Frame */}
                  <div className="absolute bottom-2 right-2 w-24 h-16 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 shadow-lg">
                    <span>Alex (You)</span>
                  </div>
                </div>

                {/* Whiteboard / Formula Board */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1.5 text-[11px] text-slate-400">
                    <span className="font-mono font-bold text-cyan-400">Interactive Formula Board</span>
                    <span>Tools: Pen • Eraser • Graph • LaTeX</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 font-mono text-cyan-200 text-[11px]">
                    f(x) = ax² + bx + c &nbsp;→&nbsp; Vertex = (-b / 2a, f(-b / 2a))
                  </div>
                </div>
              </div>

              {/* Middle: Agenda Checklist (2.5 cols) */}
              <div className="lg:col-span-2.5 p-3 space-y-2 bg-slate-900/30">
                <div className="font-bold text-xs text-white flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Lesson Agenda
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-3 h-3" /> <span className="line-through">1. Homework check</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-3 h-3" /> <span className="line-through">2. Slope-intercept rule</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 font-bold bg-cyan-500/10 p-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> 3. Graphing exercises
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> 4. 5-Q Checkpoint
                  </div>
                </div>
              </div>

              {/* Right: Real-time Notes Dock (2.5 cols) */}
              <div className="lg:col-span-2.5 p-3 space-y-2 bg-slate-900/50">
                <div className="font-bold text-xs text-white flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <FileText className="w-3.5 h-3.5 text-amber-400" /> Digital Notes Dock
                </div>
                <div className="text-[11px] text-slate-300 space-y-1.5 font-mono">
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                    <em>Remember:</em> If m &gt; 0, line rises from left to right.
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                    <em>Key Step:</em> Isolate y before identifying slope.
                  </div>
                </div>
                <div className="pt-2">
                  <Badge variant="outline" className="w-full text-center justify-center text-[10px] text-emerald-400 border-emerald-500/30">
                    Synced with Parent Portal
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 6: TEACHER BOOKING & CHECKOUT
    // -------------------------------------------------------------
    {
      id: 6,
      category: 'Booking',
      tag: 'Commerce & Tutoring',
      title: 'Teacher Selection & BookingCheckoutModal',
      subtitle: 'Verified Educator Directory • Hourly Rates • Stripe Payment Simulation • Session Passes',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      speakerNotes: 'Parents and students discover verified teachers at /teachers. Upon clicking "Book Session", the reusable BookingCheckoutModal component opens with an interactive date/time slot picker and simulated Stripe checkout, updating the ledger instantly without third-party fees.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Teacher Profile Card */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-lg">
                SJ
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-sm">Sarah Jenkins, M.Sc.</h4>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px]">Verified</Badge>
                </div>
                <p className="text-xs text-slate-400">Senior Math Specialist • 8+ Yrs Exp</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-amber-400 font-bold">★ 4.9 (42 reviews)</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-400 font-bold font-mono">$35.00 / hr</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-slate-200">Specializations:</span>
              <div className="flex gap-1.5 flex-wrap pt-0.5">
                <Badge variant="outline" className="text-[10px]">Algebra I</Badge>
                <Badge variant="outline" className="text-[10px]">Geometry</Badge>
                <Badge variant="outline" className="text-[10px]">Calculus Prep</Badge>
              </div>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 shadow-lg">
              Book Lesson Now ($35.00)
            </Button>
          </div>

          {/* BookingCheckoutModal Preview */}
          <div className="lg:col-span-7 rounded-xl border border-emerald-500/30 bg-slate-950 p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">Booking & Checkout • Secure Stripe Sandbox</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">Simulated Card Flow</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Select Date:</span>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] flex items-center justify-between">
                  <span>Thursday, Oct 15</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Select Time Slot:</span>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] flex items-center justify-between">
                  <span>16:00 - 17:00 (EST)</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Simulated Card Form */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Card Information</span>
                <span className="font-mono text-emerald-400">Test Visa 4242</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-700 font-mono text-slate-200 text-[11px] flex items-center justify-between">
                <span>4242 •••• •••• 4242</span>
                <span className="text-slate-500 text-[10px]">12/28 • CVC 123</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="text-slate-400 text-[11px]">
                Total Due: <strong className="text-white text-sm font-mono">$35.00</strong>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 text-xs">
                Confirm & Authorize Session
              </Button>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 7: TEACHER COMMAND CENTER & VERIFICATION GUARD
    // -------------------------------------------------------------
    {
      id: 7,
      category: 'Teacher',
      tag: 'Educator Command',
      title: 'Teacher Command Center & Scope Guard',
      subtitle: 'Strict Academic Scope Isolation • Curriculum Units • Upload Materials • Earnings Ledger',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      speakerNotes: 'Educators have an isolated, authenticated workspace at /teacher-dashboard. Teachers only access curriculum, questions, and students within their assigned subject and grade level (e.g. Mathematics, Grade 8), preventing accidental cross-discipline pollution.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl space-y-4">
            {/* Academic Scope Verification Banner */}
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-white">Academic Scope Active & Verified</div>
                  <div className="text-[11px] text-slate-400">Assigned Subject: <strong>Mathematics</strong> • Grade Level: <strong>8</strong></div>
                </div>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">Scope Isolated</Badge>
            </div>

            {/* 5-Tab Navigation Bar Mockup */}
            <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
              <span className="px-3 py-1 rounded bg-indigo-600 text-white font-bold">Overview</span>
              <span className="px-3 py-1 rounded bg-slate-900 text-slate-400 hover:text-white">Question Bank</span>
              <span className="px-3 py-1 rounded bg-slate-900 text-slate-400 hover:text-white">Test Builder</span>
              <span className="px-3 py-1 rounded bg-slate-900 text-slate-400 hover:text-white">Curriculum & Materials</span>
              <span className="px-3 py-1 rounded bg-slate-900 text-slate-400 hover:text-white">Earnings Payouts</span>
            </div>

            {/* Curriculum Units Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Assigned Curriculum Units (Grade 8)</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white text-[11px]">Unit 1: Linear Equations</div>
                  <div className="text-[10px] text-slate-400 mt-1">12 Questions • 3 Tests</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white text-[11px]">Unit 2: Geometric Proofs</div>
                  <div className="text-[10px] text-slate-400 mt-1">18 Questions • 4 Tests</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white text-[11px]">Unit 3: Exponents & Roots</div>
                  <div className="text-[10px] text-slate-400 mt-1">15 Questions • 2 Tests</div>
                </div>
              </div>
            </div>

            {/* Earnings Bar */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">September Tutor Earnings:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm ml-2">$840.00</span>
              </div>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                Paid via Direct Deposit
              </Badge>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Zero Cross-Subject Bleed
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Teachers cannot alter science tests or grade foreign language exams unless explicitly granted multi-discipline credentials by the administrator.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> One-Click Materials Upload
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Upload PDFs, formulas, and diagrams that automatically display in the Live Classroom whiteboard for student downloads.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 8: QUESTION BANK & AI GENERATOR
    // -------------------------------------------------------------
    {
      id: 8,
      category: 'Teacher',
      tag: 'AI Tools',
      title: 'Question Bank & AI Question Generator',
      subtitle: 'Bloom’s Taxonomy Weights • MCQ & True/False • Puter AI Zero-Cost Generation • Bulk CSV Import',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      speakerNotes: 'Educators can curate extensive question banks at /teacher-dashboard?tab=question-bank or generate new items using Puter AI. Weights range from 1.0 to 2.0 based on cognitive complexity, and teachers can import whole question sets via CSV or JSON.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* AI Generator Frame */}
          <div className="lg:col-span-7 rounded-xl border border-cyan-500/30 bg-slate-950 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs">AI Question Generator • Puter.js Client Engine</span>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px]">Zero API Key Required</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block text-[10px]">Topic Prompt:</span>
                  <span className="font-semibold text-slate-200">Pythagorean Theorem Word Problems</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block text-[10px]">Target Bloom Level:</span>
                  <span className="font-semibold text-cyan-400">Application / Analysis (Weight 1.5)</span>
                </div>
              </div>

              {/* Generated Question Preview */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">Generated MCQ</Badge>
                  <span className="text-[10px] text-emerald-400">AI Confidence: 98%</span>
                </div>
                <div className="text-slate-200 font-medium text-[11px]">
                  A 13-foot ladder leans against a vertical wall. If the bottom of the ladder is 5 feet away from the base, what height does the ladder reach?
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 font-mono">
                  <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400">A. 10 feet</div>
                  <div className="p-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">B. 12 feet (Correct)</div>
                  <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400">C. 14 feet</div>
                  <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400">D. 8 feet</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 h-7 text-xs">Regenerate</Button>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-7 text-xs">
                  Approve to Bank <Check className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Import & Standards */}
          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Bulk CSV & JSON Import
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Teachers can upload 50+ questions in seconds. The importer validates question types, answer keys, explanations, and grade level conformity automatically.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Step-by-Step Explanations
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Every question in the bank includes mandatory pedagogical explanations shown to students immediately after submitting exams.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 9: TEST BUILDER & GRADEBOOK MISCONCEPTION FORENSICS
    // -------------------------------------------------------------
    {
      id: 9,
      category: 'Teacher',
      tag: 'Pedagogical Forensics',
      title: 'Adaptive Test Builder & Misconception Forensics',
      subtitle: 'Timed Tests • Passing Thresholds • Class Heatmaps • 1-Click Retraining Paths',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      speakerNotes: 'Teachers can craft exams by picking questions from their question bank, configuring time limits, passing scores, and enabling the adaptive engine. The gradebook provides item-level analytics highlighting which concepts tripped up the class.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Test Builder Screen */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-white">Test Builder Configuration</span>
              <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">Adaptive Mode ON</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Exam Title:</span>
                <span className="font-semibold text-white">Midterm Diagnostic: Polynomials</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-mono font-bold text-white text-xs">30 Mins</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Questions</span>
                  <span className="font-mono font-bold text-white text-xs">15 Items</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Passing Cutoff</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">70%</span>
                </div>
              </div>

              {/* Class Misconception Heatmap */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-200 text-[11px] block">Class Misconception Radar:</span>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Negative Exponents Rule</span>
                    <span className="text-rose-400 font-bold">42% Miss Rate (High Alarm)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div className="space-y-1 text-[10px] pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Distributive Property with Negatives</span>
                    <span className="text-amber-400 font-bold">28% Miss Rate</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </div>

              <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-8 text-xs">
                Launch 1-Click Targeted Remediation Assignment
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Automatic Remediation Bridge
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                When students score below 70%, EduPath generates an automated mini-quiz focusing solely on the questions they missed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Live Gradebook Sync
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Teachers receive instant notifications as each student finishes, eliminating manual paper grading entirely.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 10: PARENT PORTAL & AI WEEKLY REPORT
    // -------------------------------------------------------------
    {
      id: 10,
      category: 'Parent',
      tag: 'Parent Portal',
      title: 'Parent Oversight & AI Report Summarizer',
      subtitle: 'Real-Time Telemetry • Multi-Tone AI Summaries (Encouraging, Firm, Analytical) • Actionable Study Plans',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      speakerNotes: 'Parents access /parent-dashboard to monitor linked children. The AI Parent Report Summarizer (/ai/parent-reports) distills complex test metrics into clear, supportive language with custom tone controls (encouraging, analytical, or firm).',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Parent Report Preview */}
          <div className="lg:col-span-7 rounded-xl border border-amber-500/30 bg-slate-950 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">AI Weekly Digest for Alex Rivera</span>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">Tone: Encouraging</Badge>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-200 leading-relaxed text-[11px]">
                “Alex demonstrated tremendous effort in Mathematics this week, climbing from <strong>72% to 88%</strong> in linear equations! While quadratic factoring still poses challenges, Alex completed all scheduled tutoring sessions with Sarah Jenkins.”
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-0.5">🌟 Key Strengths</span>
                  <span className="text-slate-300">Graphing coordinates, linear slopes, punctual session attendance.</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-0.5">🎯 Growth Areas</span>
                  <span className="text-slate-300">Factoring trinomials with leading coefficients &gt; 1.</span>
                </div>
              </div>

              <div className="p-2 rounded bg-blue-950/40 border border-blue-500/20 text-[10px] text-blue-200">
                <strong>Recommended Weekend Action:</strong> 15-minute practice session on factoring trinomials before Monday’s review.
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400 text-[11px]">Tone Mode:</span>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-6 text-[10px] border-amber-500 text-amber-300">Encouraging</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-slate-400">Analytical</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-slate-400">Firm</Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Multi-Child Linked Accounts
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Parents with multiple enrolled children can switch profiles instantly with a single parent account, viewing individual schedules and test histories.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> Exportable PDF Summaries
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Parents can generate clean 1-page PDF reports to share with private tutors, school counselors, or family archives.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 11: ADMIN CHEATING DETECTION & INTEGRITY
    // -------------------------------------------------------------
    {
      id: 11,
      category: 'Admin',
      tag: 'Security & Integrity',
      title: 'AI Cheating Detection & Integrity Telemetry',
      subtitle: 'Tab Blur Monitoring • Answer Pacing Anomalies (&lt;3.5s) • Copy-Paste Traps • Incident Triage',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      speakerNotes: 'At /admin/cheating-detection, administrators and teachers inspect flagged exams. Real-time telemetry detects window unfocus, rapid clicking indicative of guessing or external script injection, and sudden abnormal score jumps.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Cheating Log Mockup */}
          <div className="lg:col-span-7 rounded-xl border border-rose-500/30 bg-slate-950 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-white">Live Cheating Telemetry Monitor</span>
              </div>
              <Badge className="bg-rose-500/20 text-rose-300 text-[10px]">2 Incidents Flagged</Badge>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { student: 'Marcus Vance', test: 'Midterm Physics', reason: 'Window Blur / Tab Switch (4 times)', time: '2 mins ago', severity: 'High', color: 'border-rose-500/40 bg-rose-950/20 text-rose-300' },
                { student: 'Elena Rostova', test: 'Grade 8 Algebra', reason: 'Pacing Anomaly: 5 questions in 7.2s', time: '14 mins ago', severity: 'Medium', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
              ].map((flag, idx) => (
                <div key={idx} className={`p-3 rounded-lg border space-y-1 ${flag.color}`}>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-white">{flag.student} — {flag.test}</span>
                    <Badge variant="outline" className="text-[10px]">{flag.severity}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-300">{flag.reason}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>{flag.time}</span>
                    <div className="flex gap-2">
                      <button className="text-emerald-400 hover:underline">Clear Incident</button>
                      <button className="text-rose-400 hover:underline">Require Retest</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Integrity Engine: <strong>Heuristic Rule-Based + Anomaly Scorer</strong></span>
              <span className="text-emerald-400">Active</span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Multi-Factor Flagging
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                EduPath combines browser visibility state checks, clipboard paste listeners, and statistical answer timing to avoid false positives.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Non-Invasive Surveillance
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Zero invasive background processes or webcam recordings; all integrity checks execute in compliance with student privacy mandates.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 12: ADMIN CONTENT VERSIONING & AUDIT TRAIL
    // -------------------------------------------------------------
    {
      id: 12,
      category: 'Admin',
      tag: 'Platform Operations',
      title: 'Content Versioning & Audit Trail',
      subtitle: 'Reversible Test Edits • Side-by-Side Diff Viewing • 1-Click Rollback • Full Activity Log',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      speakerNotes: 'Located at /admin/content-management, administrators have complete auditability over test edits and questions. Any changes can be rolled back to earlier revisions with 1 click, protecting curricular integrity.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Version Diff Preview */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">Content Version Comparison: Algebra Midterm</span>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px]">Revision v2 vs v3</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30 space-y-1">
                <div className="font-bold text-rose-400">Version 2 (Previous)</div>
                <div className="text-slate-400 text-[10px]">Author: Teacher Sarah (10/08)</div>
                <div className="text-slate-300 font-mono text-[10px] pt-1">
                  - Passing Score: 60%<br />
                  - Total Questions: 10<br />
                  - Weight: 1.00
                </div>
              </div>

              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <div className="font-bold text-emerald-400">Version 3 (Current)</div>
                <div className="text-slate-400 text-[10px]">Author: Admin Robert (10/11)</div>
                <div className="text-slate-300 font-mono text-[10px] pt-1">
                  + Passing Score: 70%<br />
                  + Total Questions: 12<br />
                  + Weight: 1.50
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 h-8 text-xs">
                View Full JSON Diff
              </Button>
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-8 text-xs">
                Rollback to Version 2
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Live Event Audit Trail
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Every user login, role elevation, test submission, and question creation is timestamped and recorded in the immutable audit log.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Data Redundancy
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Rollbacks synchronize both simulated local state and connected PostgreSQL databases simultaneously.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 13: SYSTEM DIAGNOSTICS & DUAL DATABASE ARCHITECTURE
    // -------------------------------------------------------------
    {
      id: 13,
      category: 'Admin',
      tag: 'Infrastructure',
      title: 'System Diagnostics & Dual Database Switcher',
      subtitle: 'Simulated JSON Mode &lt;–&gt; PostgreSQL Engine • Query Latency • Connection Pool Telemetry',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      speakerNotes: 'EduPath features a hybrid database architecture. For zero-config local runs and presentations, simulated JSON mode is active. Administrators can toggle into enterprise PostgreSQL mode via /admin/system, inspecting pool latency, active connections, and triggering test seeders.',
      renderContent: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* DB Telemetry Monitor */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Database Engine Telemetry</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Dual Engine Ready</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Active Engine</span>
                <span className="font-bold text-emerald-400 text-sm mt-0.5 block">Simulated JSON</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Query Latency</span>
                <span className="font-mono font-bold text-cyan-400 text-sm mt-0.5 block">&lt; 1 ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Seeded Entities</span>
                <span className="font-mono font-bold text-indigo-400 text-sm mt-0.5 block">142 Records</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">PostgreSQL Connection Pool:</span>
                <span className="text-slate-400 font-mono">STANDBY (Ready on demand)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Client Sync Engine:</span>
                <span className="text-emerald-400 font-mono">Local Storage + Indexed Sync</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 h-8 text-xs">
                Trigger Safe Seeder
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 text-xs">
                Switch to PostgreSQL Engine
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Zero DevOps Barrier
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Reviewers and teachers can launch and experience the full platform with a single <code>npm run dev</code> command without having to configure Docker or PostgreSQL.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4" /> Enterprise Ready
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Connect your production PostgreSQL instance by providing <code>DATABASE_URL</code> in environment variables for instant production migration.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 14: SUMMARY & LIVE INTERACTIVE DEMO GUIDE
    // -------------------------------------------------------------
    {
      id: 14,
      category: 'Overview',
      tag: 'Demo Walkthrough',
      title: 'Ready for Live Evaluation & Testing',
      subtitle: '1-Click Role Switcher • Direct Page Shortcuts • Complete Offline PDF Exports',
      badgeColor: 'bg-primary/20 text-primary border-primary/30',
      speakerNotes: 'Thank you for exploring EduPath. You can immediately jump into any user role using the demo switcher below or access the dedicated PDF tutorials exported to your workspace directory.',
      renderContent: () => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 text-sm">Student Role</span>
                <Badge variant="outline" className="text-[10px]">Test Account</Badge>
              </div>
              <p className="text-slate-400 text-[11px]">Experience adaptive testing, view learning streaks, and enter live classrooms.</p>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-8 text-xs"
                  onClick={() => setLocation('/student-dashboard')}
                >
                  Launch Student Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-500/40 bg-slate-900/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 text-sm">Teacher Role</span>
                <Badge variant="outline" className="text-[10px]">Verified Educator</Badge>
              </div>
              <p className="text-slate-400 text-[11px]">Generate questions with Puter AI, build tests, and review misconception heatmaps.</p>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-8 text-xs"
                  onClick={() => setLocation('/teacher-dashboard')}
                >
                  Launch Teacher Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/40 bg-slate-900/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm">Parent Role</span>
                <Badge variant="outline" className="text-[10px]">Family Portal</Badge>
              </div>
              <p className="text-slate-400 text-[11px]">Generate AI weekly digests, track child score growth, and inspect receipts.</p>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold h-8 text-xs"
                  onClick={() => setLocation('/parent-dashboard')}
                >
                  Launch Parent Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-500/40 bg-slate-900/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300 text-sm">Admin Role</span>
                <Badge variant="outline" className="text-[10px]">Full Superuser</Badge>
              </div>
              <p className="text-slate-400 text-[11px]">Inspect cheating telemetry, review content version diffs, and inspect DB health.</p>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-8 text-xs"
                  onClick={() => setLocation('/admin-dashboard')}
                >
                  Launch Admin Control <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Export & Documentation Links */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" /> Complete System Documentation PDFs Available
              </div>
              <p className="text-slate-400 text-[11px]">
                Student Tutorial • Teacher Operational Manual • System Architecture & Lifecycle Guide
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-700 text-slate-300 text-xs h-8"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save Slides PDF
              </Button>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8"
                onClick={() => setLocation('/teachers')}
              >
                Explore Teachers Directory <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Filtering slides
  const filteredSlides = filterCategory === 'All' 
    ? slides 
    : slides.filter(s => s.category === filterCategory);

  const activeSlideIndex = Math.min(currentSlide, filteredSlides.length - 1);
  const slide = filteredSlides[activeSlideIndex] || slides[0];

  const handleNext = useCallback(() => {
    if (activeSlideIndex < filteredSlides.length - 1) {
      setCurrentSlide(activeSlideIndex + 1);
    }
  }, [activeSlideIndex, filteredSlides.length]);

  const handlePrev = useCallback(() => {
    if (activeSlideIndex > 0) {
      setCurrentSlide(activeSlideIndex - 1);
    }
  }, [activeSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none ${isFullscreen ? 'p-2' : ''}`}>
      {!isFullscreen && <Navbar />}

      {/* Main Slide Presentation Canvas */}
      <main className="flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Badge className={`${slide.badgeColor} text-xs font-semibold px-3 py-1 uppercase tracking-wider`}>
              {slide.tag}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Slide {activeSlideIndex + 1} of {filteredSlides.length}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            {['All', 'Overview', 'Student', 'Teacher', 'Booking', 'Parent', 'Admin'].map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setCurrentSlide(0);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-slate-800 text-white font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-800 text-slate-300 hover:bg-slate-900 h-8 text-xs"
              onClick={() => setShowNotes(!showNotes)}
            >
              <Info className="w-3.5 h-3.5 mr-1" />
              {showNotes ? 'Hide Notes' : 'Speaker Notes'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-800 text-slate-300 hover:bg-slate-900 h-8 text-xs"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> PDF Print
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Slide Title & Subtitle */}
        <div className="py-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {slide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl">
            {slide.subtitle}
          </p>
        </div>

        {/* Slide Content Area */}
        <div className="flex-1 py-2">
          {slide.renderContent()}
        </div>

        {/* Speaker Notes Drawer (Collapsible) */}
        {showNotes && (
          <div className="my-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1 shadow-lg">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Presenter Talking Points:
            </span>
            <p className="leading-relaxed text-[11px] text-slate-300">
              {slide.speakerNotes}
            </p>
          </div>
        )}

        {/* Bottom Navigation Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <Button
            size="sm"
            variant="outline"
            disabled={activeSlideIndex === 0}
            onClick={handlePrev}
            className="border-slate-800 text-slate-300 hover:bg-slate-900 disabled:opacity-40 h-9"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous Slide
          </Button>

          {/* Quick Slide Dots Indicator */}
          <div className="hidden sm:flex items-center gap-1">
            {filteredSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeSlideIndex 
                    ? 'w-6 bg-cyan-400' 
                    : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
                aria-label={`Jump to slide ${i + 1}`}
              />
            ))}
          </div>

          <Button
            size="sm"
            disabled={activeSlideIndex === filteredSlides.length - 1}
            onClick={handleNext}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-9 shadow-lg disabled:opacity-40"
          >
            Next Slide <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}
