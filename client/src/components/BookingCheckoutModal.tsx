import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  UserAccount, 
  LessonBooking, 
  Transaction, 
  mockStudentPasses 
} from '@/lib/mockData';
import { 
  saveBookingToDB, 
  saveTransactionToDB, 
  deductStudentPassCredit,
  purchaseStudentPass
} from '@/lib/dbSync';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft,
  CalendarPlus,
  Video,
  Lock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: UserAccount | null;
  initialSubject?: string;
  onBookingSuccess?: (booking: LessonBooking) => void;
}

export function BookingCheckoutModal({
  isOpen,
  onClose,
  teacher,
  initialSubject,
  onBookingSuccess
}: BookingCheckoutModalProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Wizard Steps: 1 = Schedule, 2 = Plan & Payment, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Scheduling States
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [lessonTopic, setLessonTopic] = useState<string>('Foundational Concepts & Practice Drill');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('04:30 PM');

  // Payment Tier: 'single' | 'pass_bundle' | 'credit'
  const [planTier, setPlanTier] = useState<'single' | 'pass_bundle' | 'credit'>('single');

  // Simulated Card Details
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('789');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Resulting Booking
  const [confirmedBooking, setConfirmedBooking] = useState<LessonBooking | null>(null);

  // Available Time Slots
  const availableTimeSlots = [
    '09:30 AM',
    '11:00 AM',
    '02:00 PM',
    '04:30 PM',
    '06:00 PM'
  ];

  // Quick Date Generator (Today, Tomorrow, +2d, +3d, +4d)
  const quickDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate()
    };
  });

  // Check active student passes
  const activePass = user ? mockStudentPasses.find(p => p.studentId === user.id && p.status === 'active' && p.remainingCredits > 0) : null;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmedBooking(null);
      setSelectedDate(quickDates[1]?.iso || new Date().toISOString().split('T')[0]);
      if (initialSubject) {
        setSelectedSubject(initialSubject);
      } else if (teacher?.subjects && teacher.subjects.length > 0) {
        setSelectedSubject(teacher.subjects[0]);
      } else {
        setSelectedSubject('Mathematics');
      }

      if (user) {
        setCardName(user.name);
        if (activePass && activePass.remainingCredits > 0) {
          setPlanTier('credit');
        } else {
          setPlanTier('single');
        }
      }
    }
  }, [isOpen, teacher, initialSubject, user]);

  if (!teacher) return null;

  const teacherAvatar = teacher.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(teacher.name)}`;

  const getAmountDue = () => {
    if (planTier === 'credit') return 0;
    if (planTier === 'pass_bundle') return 119;
    return 35;
  };

  const handleProcessPayment = async () => {
    if (!user) {
      toast.error('Please log in as a student to complete your booking.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate Stripe API roundtrip delay
      await new Promise(resolve => setTimeout(resolve, 1100));

      const amountDue = getAmountDue();
      const txId = `tx-${Date.now()}`;
      const bookingId = `booking-${Date.now()}`;

      // 1. If purchasing a pass bundle, register the pass
      if (planTier === 'pass_bundle') {
        purchaseStudentPass(user.id, 'Monthly Study Pass (4 Lessons)', 4);
      } else if (planTier === 'credit') {
        deductStudentPassCredit(user.id);
      }

      // 2. Record Transaction
      const transaction: Transaction = {
        id: txId,
        userId: user.id,
        userName: user.name,
        bookingId: bookingId,
        type: planTier === 'pass_bundle' ? 'monthly_pass' : 'lesson_single',
        amount: amountDue,
        currency: 'USD',
        status: 'succeeded',
        paymentMethod: planTier === 'credit' ? 'Study Pass Credit' : 'Card',
        cardLast4: planTier === 'credit' ? undefined : '4242',
        description: planTier === 'pass_bundle' 
          ? `EduPath Monthly Study Pass (4 Lessons) with ${teacher.name}`
          : `1-on-1 Tutoring Session: ${selectedSubject} with ${teacher.name}`,
        createdAt: new Date().toISOString()
      };
      saveTransactionToDB(transaction);

      // 3. Record Booking
      const booking: LessonBooking = {
        id: bookingId,
        studentId: user.id,
        studentName: user.name,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherAvatar: teacherAvatar,
        subject: selectedSubject,
        lessonTitle: lessonTopic,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        durationMinutes: 45,
        status: 'scheduled',
        amountPaid: amountDue,
        paymentMethod: planTier === 'credit' ? 'Study Pass Credit' : 'Visa •••• 4242',
        transactionId: txId,
        checkpointTestId: selectedSubject === 'Science' ? 'test-002' : 'test-001',
        notes: `Scheduled session for Grade ${user.gradeLevel || 8} ${selectedSubject}.`,
        createdAt: new Date().toISOString()
      };
      saveBookingToDB(booking);

      setConfirmedBooking(booking);
      setStep(3);
      toast.success('🎉 Booking confirmed! Your lesson is scheduled.');

      if (onBookingSuccess) {
        onBookingSuccess(booking);
      }
    } catch (err) {
      console.error('Payment error', err);
      toast.error('Payment failed. Please verify your details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCalendar = () => {
    if (!confirmedBooking) return;
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EduPath//Learning Platform//EN',
      'BEGIN:VEVENT',
      `SUMMARY:EduPath Tutoring: ${confirmedBooking.lessonTitle} with ${confirmedBooking.teacherName}`,
      `DESCRIPTION:1-on-1 ${confirmedBooking.subject} Lesson on EduPath.\\nJoin room: ${window.location.origin}/classroom/${confirmedBooking.id}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `edupath-lesson-${confirmedBooking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Calendar event (.ics) downloaded!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-card">
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-emerald-500/10 p-5 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={teacherAvatar}
                alt={teacher.name}
                className="w-12 h-12 rounded-full border-2 border-primary/20 bg-background object-cover shadow-sm"
              />
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  Book Lesson with {teacher.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">★ 4.9 (84 reviews)</span>
                  <span>•</span>
                  <span>Verified Educator</span>
                </DialogDescription>
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: SCHEDULING */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  1. Subject & Lesson Focus
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {(teacher.subjects || ['Mathematics', 'Science']).map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        selectedSubject === sub
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border/80 bg-background hover:bg-muted/30 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{sub}</span>
                        {selectedSubject === sub && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <Input
                    placeholder="E.g., Solving Quadratic Equations, Exam Review"
                    value={lessonTopic}
                    onChange={e => setLessonTopic(e.target.value)}
                    className="h-9 text-xs bg-background/80"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>2. Select Session Date</span>
                  <span className="text-[11px] font-normal text-muted-foreground">Student Timezone: EDT</span>
                </Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {quickDates.map(qd => (
                    <button
                      key={qd.iso}
                      type="button"
                      onClick={() => setSelectedDate(qd.iso)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedDate === qd.iso
                          ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20'
                          : 'border-border/80 bg-background hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase opacity-75">{qd.weekday}</div>
                      <div className="text-base font-extrabold">{qd.dayNum}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  3. Select Available Time Slot
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                  {availableTimeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                        selectedTime === slot
                          ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                          : 'border-border/80 bg-background hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-primary text-white font-bold px-6 rounded-xl hover-lift shadow-md shadow-primary/15"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PLAN & CHECKOUT */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Active pass banner if applicable */}
              {activePass && activePass.remainingCredits > 0 && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>You have an active Study Pass with <strong>{activePass.remainingCredits} credits</strong> available!</span>
                  </div>
                  <Badge className="bg-emerald-500 text-white font-bold text-[10px]">Active</Badge>
                </div>
              )}

              {/* Tier Options */}
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Payment Option
                </Label>
                <div className="space-y-2.5 mt-2">
                  {activePass && activePass.remainingCredits > 0 && (
                    <div
                      onClick={() => setPlanTier('credit')}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        planTier === 'credit'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : 'border-border/80 bg-background hover:bg-muted/20'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span>Use 1 Study Pass Credit</span>
                          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600 font-bold">No Charge</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Deducts 1 session from your active package ({activePass.remainingCredits - 1} remaining after).</p>
                      </div>
                      <div className="text-right font-extrabold text-sm text-emerald-600">$0.00</div>
                    </div>
                  )}

                  <div
                    onClick={() => setPlanTier('single')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      planTier === 'single'
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border/80 bg-background hover:bg-muted/20'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-foreground">Single 1-on-1 Tutoring Session</div>
                      <p className="text-[11px] text-muted-foreground">45-minute focused interactive lesson with {teacher.name}.</p>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-foreground">$35.00</div>
                      <div className="text-[10px] text-muted-foreground">one-time</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPlanTier('pass_bundle')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      planTier === 'pass_bundle'
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border/80 bg-background hover:bg-muted/20'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <span>Monthly Study Pass (4 Lessons)</span>
                        <Badge className="bg-primary/20 text-primary border-0 text-[9px] font-bold">Save 15%</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Book this session now + 3 credits valid across any instructor for 30 days.</p>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-foreground">$119.00</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">$29.75 / lesson</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Card Form */}
              {planTier !== 'credit' && (
                <div className="p-4 bg-muted/20 border border-border/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Method
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" /> 256-bit Encrypted Checkout
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label className="text-[11px] font-semibold text-muted-foreground">Cardholder Name</Label>
                      <Input
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Alex Johnson"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[11px] font-semibold text-muted-foreground">Card Number</Label>
                        <Input
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="•••• •••• •••• 4242"
                          className="h-8 text-xs bg-background font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px] font-semibold text-muted-foreground">Expires</Label>
                          <Input
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="h-8 text-xs bg-background font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold text-muted-foreground">CVC</Label>
                          <Input
                            value={cardCvc}
                            onChange={e => setCardCvc(e.target.value)}
                            placeholder="123"
                            className="h-8 text-xs bg-background font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guarantee Callout */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Free cancellation up to 12 hours prior
                </span>
                <span className="font-extrabold text-sm text-foreground">
                  Total: ${getAmountDue().toFixed(2)}
                </span>
              </div>

              {/* Navigation buttons */}
              <div className="pt-2 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Schedule
                </Button>

                <Button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="bg-primary text-white font-bold px-6 rounded-xl hover-lift shadow-md shadow-primary/15"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>Confirm & Pay ${getAmountDue().toFixed(2)}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & CALENDAR */}
          {step === 3 && confirmedBooking && (
            <div className="text-center space-y-5 py-2">
              <div className="w-14 h-14 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                  You're Booked! 🎉
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  Your 1-on-1 tutoring session with <strong>{confirmedBooking.teacherName}</strong> is officially scheduled.
                </p>
              </div>

              {/* Booking Pass Card */}
              <div className="p-4 bg-muted/20 border border-border/80 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                    {confirmedBooking.subject}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">ID: {confirmedBooking.id}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">{confirmedBooking.lessonTitle}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary" /> {confirmedBooking.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {confirmedBooking.scheduledTime} (45m)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Receipt Amount: <strong>${confirmedBooking.amountPaid.toFixed(2)}</strong></span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Paid via {confirmedBooking.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadCalendar}
                  className="rounded-xl text-xs font-semibold border-border/80"
                >
                  <CalendarPlus className="w-3.5 h-3.5 mr-1.5 text-primary" /> Add to Calendar (.ics)
                </Button>

                <Button
                  onClick={() => {
                    onClose();
                    navigate(`/classroom/${confirmedBooking.id}`);
                  }}
                  className="bg-primary text-white rounded-xl text-xs font-bold hover-lift shadow-md shadow-primary/20"
                >
                  <Video className="w-3.5 h-3.5 mr-1.5" /> Enter Live Classroom
                </Button>
              </div>

              <div className="pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate('/student-dashboard');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Go to Student Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
