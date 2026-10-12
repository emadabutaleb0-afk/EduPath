import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  mockBookings, 
  mockLessons, 
  mockLessonMaterials, 
  LessonBooking, 
  Lesson 
} from '@/lib/mockData';
import { completeBookingInDB, dispatchSystemNotification } from '@/lib/dbSync';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Hand, 
  CheckCircle2, 
  Circle, 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Send, 
  FileText, 
  Clock, 
  Download, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Share2, 
  BookOpen, 
  MessageSquare, 
  CheckSquare, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface LiveClassroomProps {
  params?: {
    lessonId?: string;
  };
}

export default function LiveClassroom({ params }: LiveClassroomProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const bookingId = params?.lessonId || 'booking-001';

  // Find booking
  const [booking, setBooking] = useState<LessonBooking | null>(() => {
    return mockBookings.find(b => b.id === bookingId) || mockBookings[0] || null;
  });

  // Call Controls State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeCenterTab, setActiveCenterTab] = useState<'video' | 'whiteboard' | 'slides'>('video');

  // Timer State (counts down from 45:00)
  const [secondsRemaining, setSecondsRemaining] = useState(42 * 60 + 15);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Agenda Checklist State
  const [agendaItems, setAgendaItems] = useState([
    { id: 1, text: 'Review previous foundational homework & questions', completed: true },
    { id: 2, text: 'Core concept breakdown: Linear modeling & slope formula', completed: true },
    { id: 3, text: 'Interactive guided practice: Graphing coordinate intercepts', completed: false },
    { id: 4, text: 'Student Q&A & Checkpoint preparation drill', completed: false },
  ]);

  const toggleAgendaItem = (id: number) => {
    setAgendaItems(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; isTeacher?: boolean }>>([
    {
      sender: booking?.teacherName || 'Teacher Demo',
      text: 'Welcome to our 1-on-1 session! Let me know if you can hear and see my screen clearly.',
      time: '04:30 PM',
      isTeacher: true
    },
    {
      sender: user?.name || 'Alex Johnson',
      text: 'Hello! Loud and clear. Excited to review slope and intercept equations.',
      time: '04:31 PM',
      isTeacher: false
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: user?.name || 'Student',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTeacher: false
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Teacher simulated instant response after 1.5s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: booking?.teacherName || 'Teacher Demo',
          text: `Great thought! Let's work through that equation step on the whiteboard.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isTeacher: true
        }
      ]);
    }, 1500);
  };

  // Student Notes Pad State (stored in localStorage)
  const notesStorageKey = `edupath_notes_${bookingId}`;
  const [notesText, setNotesText] = useState<string>(() => {
    return localStorage.getItem(notesStorageKey) || 
`# Lesson Notes: ${booking?.lessonTitle || 'Algebra'}
Instructor: ${booking?.teacherName || 'Teacher Demo'}
Date: ${new Date().toLocaleDateString()}

- Slope Formula: m = (y2 - y1) / (x2 - x1)
- Slope-intercept Form: y = mx + b
  * m = slope (rate of change)
  * b = y-intercept (where line crosses y-axis)
- Perpendicular lines have negative reciprocal slopes (m1 * m2 = -1)
`;
  });

  const handleNotesChange = (val: string) => {
    setNotesText(val);
    localStorage.setItem(notesStorageKey, val);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([notesText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Notes_${booking?.lessonTitle?.replace(/\s+/g, '_') || 'Lesson'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Notes downloaded to your computer!');
  };

  // Whiteboard Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#2563EB');
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    if (activeCenterTab === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw grid background or formula header
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        // draw subtle grid
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Draw sample teacher formula
        ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#1E293B';
        ctx.fillText('Slope-Intercept Model: y = mx + b', 40, 50);

        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('Example: Line passing through (2, 4) and (4, 10)', 40, 80);
        ctx.fillText('m = (10 - 4) / (4 - 2) = 6 / 2 = 3   ===>   y = 3x - 2', 40, 110);
      }
    }
  }, [activeCenterTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.info('Whiteboard cleared');
  };

  // Lesson Slides State
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 4;
  const slideContent = [
    {
      title: '1. What is Linear Rate of Change?',
      body: 'A linear relationship describes two variables where a change in one results in a proportional, constant change in the other. Graphically, this produces a straight line with slope m.'
    },
    {
      title: '2. The Slope Formula Derivation',
      body: 'Slope measures steepness (rise over run): m = Δy / Δx = (y₂ - y₁) / (x₂ - x₁). When m > 0 the line increases; when m < 0 the line falls.'
    },
    {
      title: '3. Identifying the Y-Intercept',
      body: 'The y-intercept (b) represents the initial value when x = 0. In real-world word problems, b is the upfront cost, base fee, or starting measurement.'
    },
    {
      title: '4. Summary & Checkpoint Review',
      body: 'You are now ready to demonstrate mastery on the 5-question checkpoint assessment. Remember to simplify fractions and double-check signs!'
    }
  ];

  // End Session & Launch Assessment
  const handleCompleteAndLaunchQuiz = () => {
    if (booking) {
      completeBookingInDB(booking.id, notesText);
      dispatchSystemNotification({
        userId: booking.studentId,
        type: 'result_ready',
        title: 'Lesson Completed! 🎯',
        message: `You completed "${booking.lessonTitle}". Now launch your 5-question mastery checkpoint!`,
        icon: '🏆',
        read: false,
        actionUrl: `/test-enhanced/${booking.checkpointTestId || 'test-001'}`
      });
    }

    toast.success('🎉 Lesson marked as complete! Launching mastery checkpoint...');
    setTimeout(() => {
      navigate(`/test-enhanced/${booking?.checkpointTestId || 'test-001'}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Classroom Status Top Bar */}
      <header className="border-b border-border bg-card/75 backdrop-blur px-4 py-3 sticky top-16 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-primary/10">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-foreground tracking-tight">
                {booking?.lessonTitle || 'Interactive 1-on-1 Lesson'}
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> LIVE NOW
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Instructor: <strong>{booking?.teacherName || 'Teacher Demo'}</strong></span>
              <span>•</span>
              <span className="text-primary font-semibold">{booking?.subject || 'Mathematics'}</span>
            </div>
          </div>
        </div>

        {/* Center Countdown Clock */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-muted/60 border border-border/80">
          <Clock className="w-4 h-4 text-primary animate-spin-slow" />
          <span className="font-mono text-sm font-extrabold text-foreground tracking-wider">
            {formatTime(secondsRemaining)}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Remaining</span>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCompleteAndLaunchQuiz}
            className="bg-gradient-to-r from-emerald-600 to-primary hover:opacity-95 text-white font-bold text-xs h-9 rounded-xl shadow-md shadow-emerald-500/10 hover-lift"
          >
            Finish & Launch Checkpoint <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* Main Classroom Workspace Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1600px] w-full mx-auto">
        {/* Left Column (Stage / Video / Whiteboard / Slides) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Stage Tab Navigation */}
          <div className="flex items-center justify-between bg-card border border-border/80 rounded-xl p-1.5 shadow-sm">
            <div className="flex items-center gap-1">
              <Button
                variant={activeCenterTab === 'video' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCenterTab('video')}
                className={`text-xs h-8 rounded-lg font-bold ${activeCenterTab === 'video' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
              >
                <Video className="w-3.5 h-3.5 mr-1.5" /> Live Stream
              </Button>
              <Button
                variant={activeCenterTab === 'whiteboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCenterTab('whiteboard')}
                className={`text-xs h-8 rounded-lg font-bold ${activeCenterTab === 'whiteboard' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
              >
                <PenTool className="w-3.5 h-3.5 mr-1.5" /> Whiteboard
              </Button>
              <Button
                variant={activeCenterTab === 'slides' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCenterTab('slides')}
                className={`text-xs h-8 rounded-lg font-bold ${activeCenterTab === 'slides' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Lesson Slides
              </Button>
            </div>

            <div className="text-[11px] text-muted-foreground font-medium hidden sm:flex items-center gap-1 pr-2">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> HD WebRTC Session
            </div>
          </div>

          {/* ACTIVE TAB 1: VIDEO STAGE */}
          {activeCenterTab === 'video' && (
            <div className="relative flex-1 min-h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-border/80 shadow-inner flex flex-col justify-between p-4">
              {/* Teacher Video (Main) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={booking?.teacherAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=TeacherDemo'}
                      alt="Teacher"
                      className="w-28 h-28 rounded-full border-4 border-primary/40 shadow-2xl object-cover bg-slate-900"
                    />
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping" />
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{booking?.teacherName || 'Teacher Demo'}</h3>
                    <p className="text-slate-400 text-xs">Presenting • Screen Shared: Linear Modeling Worksheet</p>
                  </div>
                </div>
              </div>

              {/* Top Stream Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <Badge className="bg-slate-900/80 text-white border-slate-800 text-xs font-semibold backdrop-blur">
                  1080p • 60 FPS
                </Badge>
                {isHandRaised && (
                  <Badge className="bg-amber-500 text-white font-bold text-xs animate-bounce">
                    ✋ Hand Raised
                  </Badge>
                )}
              </div>

              {/* Student Picture-in-Picture (Bottom-Right) */}
              <div className="absolute bottom-20 right-4 z-10 w-40 h-28 bg-slate-900 border-2 border-primary/50 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between p-2">
                <div className="flex justify-between items-center text-[10px] text-white">
                  <span className="font-bold truncate max-w-[80px]">{user?.name || 'You'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                {isVideoOn ? (
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={user?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'}
                      alt="Student"
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 bg-slate-800"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                    Camera Off
                  </div>
                )}
                <div className="text-[9px] text-slate-400 text-center font-mono">
                  {isMicOn ? '🎤 Mic Active' : '🔇 Muted'}
                </div>
              </div>

              {/* Floating Bottom Control Bar */}
              <div className="relative z-10 mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`w-10 h-10 rounded-xl transition-all ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'}`}
                  title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {isMicOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`w-10 h-10 rounded-xl transition-all ${isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'}`}
                  title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {isVideoOn ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsScreenSharing(!isScreenSharing);
                    toast.info(isScreenSharing ? 'Stopped screen sharing' : 'Sharing your desktop screen');
                  }}
                  className={`w-10 h-10 rounded-xl transition-all ${isScreenSharing ? 'bg-primary text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                  title="Share Screen"
                >
                  <Monitor className="w-4.5 h-4.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsHandRaised(!isHandRaised);
                    toast.info(isHandRaised ? 'Lowered hand' : 'Hand raised for teacher question');
                  }}
                  className={`w-10 h-10 rounded-xl transition-all ${isHandRaised ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                  title="Raise Hand"
                >
                  <Hand className="w-4.5 h-4.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ACTIVE TAB 2: WHITEBOARD */}
          {activeCenterTab === 'whiteboard' && (
            <div className="flex-1 min-h-[460px] bg-card rounded-2xl overflow-hidden border border-border/80 shadow-sm flex flex-col">
              {/* Whiteboard Toolbar */}
              <div className="p-3 bg-muted/30 border-b border-border/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Color:</span>
                  {['#2563EB', '#10B981', '#EF4444', '#0F172A'].map(color => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${brushColor === color ? 'border-foreground scale-110 shadow-sm' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="h-4 w-[1px] bg-border mx-1" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Size:</span>
                  {[2, 4, 8].map(size => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`px-2 py-0.5 rounded text-xs font-bold ${brushSize === size ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearWhiteboard}
                    className="h-8 text-xs font-semibold rounded-lg border-border"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear Board
                  </Button>
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="flex-1 bg-white relative overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={900}
                  height={500}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-full block"
                />
              </div>
            </div>
          )}

          {/* ACTIVE TAB 3: LESSON SLIDES */}
          {activeCenterTab === 'slides' && (
            <div className="flex-1 min-h-[460px] bg-card rounded-2xl overflow-hidden border border-border/80 shadow-sm flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                    Unit Slide {currentSlide} of {totalSlides}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Curriculum Mapped: Grade 8 Algebra</span>
                </div>

                <div className="p-6 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 rounded-2xl border border-border/60 min-h-[260px] flex flex-col justify-center space-y-4">
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                    {slideContent[currentSlide - 1]?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {slideContent[currentSlide - 1]?.body}
                  </p>
                </div>
              </div>

              {/* Slide Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentSlide === 1}
                  onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
                  className="rounded-xl text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous Slide
                </Button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalSlides }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx + 1)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx + 1 ? 'bg-primary w-6' : 'bg-muted-foreground/30'}`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentSlide === totalSlides}
                  onClick={() => setCurrentSlide(prev => Math.min(totalSlides, prev + 1))}
                  className="rounded-xl text-xs font-bold"
                >
                  Next Slide <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Dock: Agenda, Chat, Notes) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <Tabs defaultValue="agenda" className="w-full flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 bg-muted/40 p-1 rounded-xl border border-border/80">
              <TabsTrigger value="agenda" className="text-xs font-bold rounded-lg py-1.5">
                <CheckSquare className="w-3.5 h-3.5 mr-1" /> Agenda
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs font-bold rounded-lg py-1.5">
                <MessageSquare className="w-3.5 h-3.5 mr-1" /> Chat
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs font-bold rounded-lg py-1.5">
                <FileText className="w-3.5 h-3.5 mr-1" /> Notes
              </TabsTrigger>
            </TabsList>

            {/* TAB: AGENDA */}
            <TabsContent value="agenda" className="flex-1 mt-3">
              <Card className="h-full border border-border/80 rounded-2xl shadow-sm bg-card flex flex-col">
                <CardHeader className="p-4 pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Session Learning Goals</span>
                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">
                      {agendaItems.filter(i => i.completed).length}/{agendaItems.length} Done
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Mark topics as covered during your lesson.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 flex-1 space-y-3">
                  {agendaItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleAgendaItem(item.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                        item.completed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground'
                          : 'bg-muted/10 border-border/80 hover:bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium leading-snug ${item.completed ? 'line-through opacity-80' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}

                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Sparkles className="w-3.5 h-3.5" /> Next Step Checkpoint
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                      At the end of this live lesson, a 5-question adaptive checkpoint will assess your understanding of today's topics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: CHAT */}
            <TabsContent value="chat" className="flex-1 mt-3">
              <Card className="h-[460px] border border-border/80 rounded-2xl shadow-sm bg-card flex flex-col">
                <CardHeader className="p-3.5 border-b border-border/60">
                  <CardTitle className="text-xs font-bold flex items-center justify-between">
                    <span>Live Classroom Chat</span>
                    <span className="text-[10px] text-emerald-500 font-mono font-bold">2 Online</span>
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.isTeacher ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                        <span className="font-bold">{msg.sender}</span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          msg.isTeacher
                            ? 'bg-muted/70 text-foreground rounded-tl-sm'
                            : 'bg-primary text-white rounded-tr-sm shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 flex items-center gap-2">
                  <Input
                    placeholder="Ask teacher a question..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    className="h-8 text-xs bg-background/80"
                  />
                  <Button type="submit" size="sm" className="h-8 w-8 p-0 rounded-lg bg-primary text-white">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </Card>
            </TabsContent>

            {/* TAB: NOTES */}
            <TabsContent value="notes" className="flex-1 mt-3">
              <Card className="h-[460px] border border-border/80 rounded-2xl shadow-sm bg-card flex flex-col">
                <CardHeader className="p-3.5 border-b border-border/60 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-bold">Private Study Notes</CardTitle>
                    <CardDescription className="text-[10px]">Auto-saved locally</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadNotes}
                    className="h-7 text-[10px] font-semibold text-primary"
                  >
                    <Download className="w-3 h-3 mr-1" /> Export .txt
                  </Button>
                </CardHeader>
                <div className="flex-1 p-3">
                  <textarea
                    value={notesText}
                    onChange={e => handleNotesChange(e.target.value)}
                    placeholder="Type lesson notes, formulas, and homework questions here..."
                    className="w-full h-full p-2.5 text-xs bg-muted/15 border border-border/60 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-foreground"
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
