import { 
  mockTests, 
  mockQuestions, 
  mockTestResults, 
  mockAllUsers, 
  mockCheatDetectionFlags, 
  mockContentVersions, 
  mockUserActivities,
  mockEnrollments,
  mockBookings,
  mockTransactions,
  mockStudentPasses,
  mockNotifications,
  availableSubjects,
  availableGrades,
  Test,
  Question,
  TestResult,
  UserAccount,
  User,
  CheatDetectionFlag,
  ContentVersion,
  UserActivity,
  Enrollment,
  LessonBooking,
  Transaction,
  StudentPass,
  Notification
} from './mockData';

// DB Mode cache
export let activeDBMode: 'mock' | 'postgres' = 'mock';

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('edupath_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Helper to parse string grades (e.g. "Grade 4") to numeric values (e.g. 4)
const parseGradeValue = (g: any): number => {
  if (typeof g === 'number') return g;
  const num = parseInt(g.toString().replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? g : num;
};

// -------------------------------------------------------------
// 1. DYNAMIC SYSTEM HYDRATION ENGINE
// -------------------------------------------------------------
export async function hydrateDatabaseState(): Promise<void> {
  console.log('🔄 Hydrating EduPath frontend memory matrices from persistent backend DB...');
  
  try {
    // 1. Fetch current db mode
    const modeRes = await fetch('/api/db-mode');
    if (modeRes.ok) {
      const modeData = await modeRes.json();
      activeDBMode = modeData.dbMode;
      console.log(`🔌 Current System Database Driver: ${activeDBMode === 'postgres' ? 'Active PostgreSQL Connection' : 'Persistent Local JSON Database'}`);
    }

    // 2. Fetch registries
    const regRes = await fetch('/api/academic-registries');
    if (regRes.ok) {
      const regData = await regRes.json();
      availableSubjects.length = 0;
      availableSubjects.push(...regData.subjects);
      
      availableGrades.length = 0;
      const parsedGrades = regData.grades.map(parseGradeValue);
      parsedGrades.sort((a: number, b: number) => a - b);
      availableGrades.push(...parsedGrades);
    }

    // 3. Fetch questions
    const qRes = await fetch('/api/questions');
    if (qRes.ok) {
      const questionsData = await qRes.json();
      mockQuestions.length = 0;
      mockQuestions.push(...questionsData);
    }

    // 4. Fetch tests
    const tRes = await fetch('/api/tests');
    if (tRes.ok) {
      const testsData = await tRes.json();
      mockTests.length = 0;
      mockTests.push(...testsData);
      
      // Load custom tests from localStorage fallback to ensure they are available in memory
      const stored = localStorage.getItem('edupath_custom_tests');
      if (stored) {
        try {
          const custom = JSON.parse(stored);
          custom.forEach((ct: any) => {
            if (!mockTests.some(t => t.id === ct.id)) {
              mockTests.unshift(ct);
            }
          });
        } catch (e) {
          console.error('Failed to parse custom tests from localStorage', e);
        }
      }
    }

    // 5. Fetch users (with auth headers if logged in)
    const uRes = await fetch('/api/users', { headers: getAuthHeaders() });
    if (uRes.ok) {
      const usersData = await uRes.json();
      mockAllUsers.length = 0;
      mockAllUsers.push(...usersData);
    }

    // 6. Fetch test results
    const rRes = await fetch('/api/test-results');
    if (rRes.ok) {
      const resultsData = await rRes.json();
      mockTestResults.length = 0;
      mockTestResults.push(...resultsData);
    }

    // 7. Fetch cheating flags
    const fRes = await fetch('/api/cheating-flags');
    if (fRes.ok) {
      const flagsData = await fRes.json();
      mockCheatDetectionFlags.length = 0;
      mockCheatDetectionFlags.push(...flagsData);
    }

    // 8. Fetch content versions
    const cvRes = await fetch('/api/content-versions');
    if (cvRes.ok) {
      const contentData = await cvRes.json();
      mockContentVersions.length = 0;
      mockContentVersions.push(...contentData);
    }

    // 9. Fetch user activities
    const actRes = await fetch('/api/user-activities');
    if (actRes.ok) {
      const actData = await actRes.json();
      mockUserActivities.length = 0;
      mockUserActivities.push(...actData);
    }

    // 10. Fetch student teacher enrollments
    const enrollRes = await fetch('/api/enrollments');
    if (enrollRes.ok) {
      const enrollData = await enrollRes.json();
      mockEnrollments.length = 0;
      mockEnrollments.push(...enrollData);
    }

    // 11. Hydrate Bookings, Transactions, and Student Passes from localStorage
    try {
      const storedBookings = localStorage.getItem('edupath_bookings');
      if (storedBookings) {
        const parsed = JSON.parse(storedBookings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          mockBookings.length = 0;
          mockBookings.push(...parsed);
        }
      }
      const storedTxs = localStorage.getItem('edupath_transactions');
      if (storedTxs) {
        const parsedTxs = JSON.parse(storedTxs);
        if (Array.isArray(parsedTxs) && parsedTxs.length > 0) {
          mockTransactions.length = 0;
          mockTransactions.push(...parsedTxs);
        }
      }
      const storedPasses = localStorage.getItem('edupath_student_passes');
      if (storedPasses) {
        const parsedPasses = JSON.parse(storedPasses);
        if (Array.isArray(parsedPasses) && parsedPasses.length > 0) {
          mockStudentPasses.length = 0;
          mockStudentPasses.push(...parsedPasses);
        }
      }
    } catch (storeErr) {
      console.warn('Could not restore bookings/transactions from localStorage:', storeErr);
    }

    console.log('✅ Database Hydration complete! Loaded memory arrays synchronized perfectly.');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('edupath:database-hydrated', {
        detail: { timestamp: Date.now() }
      }));
    }
  } catch (e) {
    console.error('❌ Failed to hydrate database state from API, operating on local mock arrays', e);
  }
}

// -------------------------------------------------------------
// 2. SYNCHRONOUS DATA WRITER UTILITIES
// -------------------------------------------------------------

export async function saveTestToDB(test: Test): Promise<boolean> {
  try {
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });
    if (res.ok) {
      // Sync client in-place
      const idx = mockTests.findIndex(t => t.id === test.id);
      if (idx !== -1) {
        mockTests[idx] = test;
      } else {
        mockTests.unshift(test);
      }
      return true;
    }
  } catch (e) {
    console.error('saveTestToDB failed', e);
  }
  return false;
}

export async function deleteTestFromDB(testId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/tests/${testId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const idx = mockTests.findIndex(t => t.id === testId);
      if (idx !== -1) {
        mockTests.splice(idx, 1);
      }
      return true;
    }
  } catch (e) {
    console.error('deleteTestFromDB failed', e);
  }
  return false;
}

export async function saveQuestionToDB(question: Question): Promise<boolean> {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    if (res.ok) {
      const idx = mockQuestions.findIndex(q => q.id === question.id);
      if (idx !== -1) {
        mockQuestions[idx] = question;
      } else {
        mockQuestions.unshift(question);
      }
      return true;
    }
  } catch (e) {
    console.error('saveQuestionToDB failed', e);
  }
  return false;
}

export async function saveResultToDB(result: TestResult): Promise<boolean> {
  try {
    mockTestResults.unshift(result);
    
    const student = mockAllUsers.find(u => u.id === result.studentId);
    const studentName = student?.name || 'Alex Johnson';

    // Auto log active completed result
    await saveActivityToDB({
      id: `act-${Date.now()}`,
      userId: result.studentId,
      action: 'test_completed',
      details: `Completed exam "${result.testTitle}" with score ${result.score}/${result.totalScore} (${result.percentage}%)`,
      timestamp: new Date()
    });

    // 1. Hook Parent Notification & Report Generation
    dispatchSystemNotification({
      userId: student?.linkedParents?.[0] || 'parent-001',
      type: 'result_ready',
      title: `Test Completed by ${studentName} 📊`,
      message: `${studentName} scored ${result.score}/${result.totalScore} (${result.percentage}%) on "${result.testTitle}". AI Summary report is ready to review.`,
      icon: '📈',
      read: false,
      actionUrl: '/ai/parent-reports'
    });

    // Auto-append into parent reports ledger
    try {
      const storedReports = localStorage.getItem('edupath_parent_reports');
      const reportsList = storedReports ? JSON.parse(storedReports) : [];
      const newReport = {
        id: `report-${Date.now()}`,
        period: `Assessment: ${result.testTitle}`,
        studentName: studentName,
        summary: `${studentName} completed the ${result.subject} assessment "${result.testTitle}", achieving a score of ${result.percentage}%. The student showed solid mastery of foundational topics with opportunities for higher-level application.`,
        highlights: [
          `Achieved ${result.percentage}% on "${result.testTitle}"`,
          `Answered ${result.score} out of ${result.totalScore} questions correctly`,
          `Demonstrated proficiency in: ${(result.strengths && result.strengths.length > 0 ? result.strengths : ['Fundamental Concepts']).join(', ')}`
        ],
        areasOfConcern: [
          (result.weaknesses && result.weaknesses.length > 0 ? result.weaknesses[0] : 'Time management during multi-step problems')
        ],
        suggestions: [
          'Review question-by-question breakdown in student results page',
          'Consider a 1-on-1 tutoring checkpoint session to solidify complex areas',
          'Continue daily practice streak to maintain momentum'
        ],
        generatedAt: new Date().toISOString()
      };
      reportsList.unshift(newReport);
      localStorage.setItem('edupath_parent_reports', JSON.stringify(reportsList));
    } catch (err) {
      console.warn('Could not auto-append to parent reports localStorage:', err);
    }

    // 2. Hook Teacher Gradebook Notification
    dispatchSystemNotification({
      userId: 'teacher-001',
      type: 'result_ready',
      title: `Gradebook Update: ${result.subject} 📝`,
      message: `${studentName} submitted "${result.testTitle}" with a score of ${result.percentage}%. Mastery status: ${result.percentage >= 70 ? 'Proficient ✅' : 'Needs Review ⚠️'}.`,
      icon: '🎓',
      read: false,
      actionUrl: '/teacher-dashboard'
    });

    // Attempt backend sync
    try {
      await fetch('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
    } catch (_) {}

    return true;
  } catch (e) {
    console.error('saveResultToDB failed', e);
    return false;
  }
}

export async function saveUserToDB(user: UserAccount): Promise<boolean> {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (res.ok) {
      if (!mockAllUsers.some(u => u.id === user.id)) {
        mockAllUsers.push(user);
      }
      return true;
    }
  } catch (e) {
    console.error('saveUserToDB failed', e);
  }
  return false;
}

export async function saveProfileToDB(userId: string, updates: Partial<UserAccount>): Promise<boolean> {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const idx = mockAllUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        mockAllUsers[idx] = { ...mockAllUsers[idx], ...updates };
      }
      return true;
    }
  } catch (e) {
    console.error('saveProfileToDB failed', e);
  }
  return false;
}

export async function deleteUserFromDB(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const idx = mockAllUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        mockAllUsers.splice(idx, 1);
      }
      return true;
    }
  } catch (e) {
    console.error('deleteUserFromDB failed', e);
  }
  return false;
}

export async function saveCheatingFlagToDB(flagId: string, status: 'pending' | 'reviewed' | 'cleared' | 'confirmed' | 'dismissed'): Promise<boolean> {
  try {
    const res = await fetch(`/api/cheating-flags/${flagId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const idx = mockCheatDetectionFlags.findIndex(f => f.id === flagId);
      if (idx !== -1) {
        mockCheatDetectionFlags[idx].status = status;
      }
      return true;
    }
  } catch (e) {
    console.error('saveCheatingFlagToDB failed', e);
  }
  return false;
}

export async function saveContentVersionToDB(version: ContentVersion): Promise<boolean> {
  try {
    const res = await fetch('/api/content-versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(version)
    });
    if (res.ok) {
      mockContentVersions.unshift(version);
      return true;
    }
  } catch (e) {
    console.error('saveContentVersionToDB failed', e);
  }
  return false;
}

export async function saveActivityToDB(activity: UserActivity): Promise<boolean> {
  try {
    const res = await fetch('/api/user-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    if (res.ok) {
      mockUserActivities.unshift(activity);
      return true;
    }
  } catch (e) {
    console.error('saveActivityToDB failed', e);
  }
  return false;
}

export async function syncAcademicRegistry(type: 'subject' | 'grade', value: string): Promise<boolean> {
  try {
    const res = await fetch('/api/academic-registries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value })
    });
    if (res.ok) {
      const data = await res.json();
      availableSubjects.length = 0;
      availableSubjects.push(...data.subjects);
      
      availableGrades.length = 0;
      const parsedGrades = data.grades.map(parseGradeValue);
      parsedGrades.sort((a: number, b: number) => a - b);
      availableGrades.push(...parsedGrades);
      return true;
    }
  } catch (e) {
    console.error('syncAcademicRegistry failed', e);
  }
  return false;
}

export async function toggleDBMode(mode: 'mock' | 'postgres'): Promise<{ success: boolean; dbMode: 'mock' | 'postgres'; message?: string }> {
  try {
    const res = await fetch('/api/db-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    if (res.ok) {
      const data = await res.json();
      activeDBMode = data.dbMode;
      // Re-hydrate state to fetch mode-specific tables immediately!
      await hydrateDatabaseState();
      return { success: true, dbMode: activeDBMode };
    } else {
      const data = await res.json();
      return { success: false, dbMode: activeDBMode, message: data.message };
    }
  } catch (e: any) {
    console.error('toggleDBMode failed', e);
    return { success: false, dbMode: activeDBMode, message: e.message };
  }
}

export async function runSQLSeeder(): Promise<{ success: boolean; message: string; rowsSeeded?: number }> {
  try {
    const res = await fetch('/api/run-seeder', { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.success) {
      // Re-hydrate state to pull seeded tables
      await hydrateDatabaseState();
      return { success: true, message: data.message, rowsSeeded: data.rowsSeeded };
    } else {
      return { success: false, message: data.error || 'Failed to execute seeding transaction.' };
    }
  } catch (e: any) {
    console.error('runSQLSeeder failed', e);
    return { success: false, message: e.message };
  }
}

export async function getDBStatus(): Promise<any> {
  try {
    const res = await fetch('/api/db-status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('getDBStatus failed', e);
  }
  return null;
}

// Helper: Derive a student's active subjects from enrollments (single source of truth)
export function getStudentSubjectsFromEnrollments(studentId: string): string[] {
  return Array.from(new Set(mockEnrollments.filter(e => e.studentId === studentId).map(e => e.subject)));
}

export async function enrollStudent(studentId: string, teacherId: string, subject: string): Promise<boolean> {
  try {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, teacherId, subject })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // Sync local enrollment memory
        const exists = mockEnrollments.some(
          e => e.studentId === studentId && e.teacherId === teacherId && e.subject === subject
        );
        if (!exists) {
          mockEnrollments.push(data.enrollment);
        }
        // Sync user.subjects from enrollments (single source of truth)
        const updatedSubjects = getStudentSubjectsFromEnrollments(studentId);
        await saveProfileToDB(studentId, { subjects: updatedSubjects });
        // Also sync the in-memory mockAllUsers array
        const userIdx = mockAllUsers.findIndex(u => u.id === studentId);
        if (userIdx !== -1) {
          mockAllUsers[userIdx].subjects = updatedSubjects;
        }
        return true;
      }
    }
  } catch (e) {
    console.error('enrollStudent failed', e);
  }
  return false;
}

export async function unenrollStudent(studentId: string, teacherId: string, subject: string): Promise<boolean> {
  try {
    const res = await fetch('/api/enrollments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, teacherId, subject })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // Sync local enrollment memory
        const idx = mockEnrollments.findIndex(
          e => e.studentId === studentId && e.teacherId === teacherId && e.subject === subject
        );
        if (idx !== -1) {
          mockEnrollments.splice(idx, 1);
        }
        // Recalculate user.subjects from remaining enrollments (single source of truth)
        const updatedSubjects = getStudentSubjectsFromEnrollments(studentId);
        await saveProfileToDB(studentId, { subjects: updatedSubjects });
        // Also sync the in-memory mockAllUsers array
        const userIdx = mockAllUsers.findIndex(u => u.id === studentId);
        if (userIdx !== -1) {
          mockAllUsers[userIdx].subjects = updatedSubjects;
        }
        return true;
      }
    }
  } catch (e) {
    console.error('unenrollStudent failed', e);
  }
  return false;
}

// -------------------------------------------------------------
// 3. BOOKINGS, PAYMENTS & LIVE LESSON LIFECYCLE HELPERS
// -------------------------------------------------------------

export function saveBookingToDB(booking: LessonBooking): boolean {
  try {
    const existingIdx = mockBookings.findIndex(b => b.id === booking.id);
    if (existingIdx !== -1) {
      mockBookings[existingIdx] = booking;
    } else {
      mockBookings.unshift(booking);
    }
    localStorage.setItem('edupath_bookings', JSON.stringify(mockBookings));
    
    // Auto-create notification for student
    dispatchSystemNotification({
      userId: booking.studentId,
      type: 'test_available',
      title: 'Lesson Scheduled 📅',
      message: `Your lesson "${booking.lessonTitle}" with ${booking.teacherName} is set for ${booking.scheduledDate} at ${booking.scheduledTime}.`,
      icon: '🎓',
      read: false,
      actionUrl: `/classroom/${booking.id}`
    });

    return true;
  } catch (e) {
    console.error('saveBookingToDB failed', e);
    return false;
  }
}

export function cancelBookingInDB(bookingId: string): boolean {
  try {
    const idx = mockBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      mockBookings[idx].status = 'cancelled';
      localStorage.setItem('edupath_bookings', JSON.stringify(mockBookings));
      return true;
    }
  } catch (e) {
    console.error('cancelBookingInDB failed', e);
  }
  return false;
}

export function completeBookingInDB(bookingId: string, notes?: string): boolean {
  try {
    const idx = mockBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      mockBookings[idx].status = 'completed';
      if (notes) {
        mockBookings[idx].notes = notes;
      }
      localStorage.setItem('edupath_bookings', JSON.stringify(mockBookings));
      return true;
    }
  } catch (e) {
    console.error('completeBookingInDB failed', e);
  }
  return false;
}

export function saveTransactionToDB(tx: Transaction): boolean {
  try {
    mockTransactions.unshift(tx);
    localStorage.setItem('edupath_transactions', JSON.stringify(mockTransactions));
    return true;
  } catch (e) {
    console.error('saveTransactionToDB failed', e);
    return false;
  }
}

export function deductStudentPassCredit(studentId: string): boolean {
  try {
    const pass = mockStudentPasses.find(p => p.studentId === studentId && p.status === 'active' && p.remainingCredits > 0);
    if (pass) {
      pass.remainingCredits -= 1;
      localStorage.setItem('edupath_student_passes', JSON.stringify(mockStudentPasses));
      return true;
    }
  } catch (e) {
    console.error('deductStudentPassCredit failed', e);
  }
  return false;
}

export function purchaseStudentPass(studentId: string, planName: string, credits: number): StudentPass | null {
  try {
    const newPass: StudentPass = {
      id: `pass-${Date.now()}`,
      studentId,
      planName,
      remainingCredits: credits,
      totalCredits: credits,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    };
    mockStudentPasses.unshift(newPass);
    localStorage.setItem('edupath_student_passes', JSON.stringify(mockStudentPasses));
    return newPass;
  } catch (e) {
    console.error('purchaseStudentPass failed', e);
    return null;
  }
}

export function dispatchSystemNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const newNotif: Notification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString()
  };
  mockNotifications.unshift(newNotif);
  return newNotif;
}

