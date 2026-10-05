import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { hydrateDatabaseState } from "@/lib/dbSync";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import TeachersList from "./pages/TeachersList";
import StudentDashboard from "./pages/StudentDashboard";
import Tests from "./pages/Tests";
import TestTaking from "./pages/TestTaking";
import TestTakingEnhanced from "./pages/TestTakingEnhanced";
import Results from "./pages/Results";
import PlacementReport from "./pages/PlacementReport";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuestions from "./pages/AdminQuestions";
import AdminTests from "./pages/AdminTests";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import Leaderboard from "./pages/Leaderboard";
import BulkImport from "./pages/BulkImport";
import ProgressTimeline from "./pages/ProgressTimeline";
import TestReview from "./pages/TestReview";
import AdminAnalytics from "./pages/AdminAnalytics";
import UserProfile from "./pages/UserProfile";
import StudentSettings from "./pages/StudentSettings";
import AIQuestionGenerator from "./pages/AIQuestionGenerator";
import AIPerformanceAnalysis from "./pages/AIPerformanceAnalysis";
import AIAdaptiveTestGenerator from "./pages/AIAdaptiveTestGenerator";
import AIParentReportSummarizer from "./pages/AIParentReportSummarizer";
import AICheatingDetection from "./pages/AICheatingDetection";
import AIDifficultyCalibration from "./pages/AIDifficultyCalibration";
import AdminAdvancedUsers from "./pages/AdminAdvancedUsers";
import AdminContentManagement from "./pages/AdminContentManagement";
import AdminPlatformSettings from "./pages/AdminPlatformSettings";
import AdminAdvancedAnalytics from "./pages/AdminAdvancedAnalytics";
import AdminModerationTools from "./pages/AdminModerationTools";
import AdminSystemAdmin from "./pages/AdminSystemAdmin";
import AdminCommunication from "./pages/AdminCommunication";
import AdminCustomization from "./pages/AdminCustomization";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: ('student' | 'parent' | 'admin' | 'teacher')[];
}

function ProtectedRoute({ path, component: Component, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          return <Redirect to="/login" />;
        }

        return <Component params={params} />;
      }}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/teachers" component={TeachersList} />
      <Route path="/test-enhanced/:id" component={TestTakingEnhanced} />
      <Route path="/placement-report" component={PlacementReport} />

      {/* Protected Student Routes */}
      <ProtectedRoute path="/student-dashboard" component={StudentDashboard} allowedRoles={['student']} />
      <ProtectedRoute path="/tests" component={Tests} allowedRoles={['student']} />
      <ProtectedRoute path="/test/:id" component={TestTaking} allowedRoles={['student']} />
      <ProtectedRoute path="/results/:id" component={Results} allowedRoles={['student']} />
      <ProtectedRoute path="/ai/adaptive-test" component={AIAdaptiveTestGenerator} allowedRoles={['student']} />
      <ProtectedRoute path="/settings" component={StudentSettings} allowedRoles={['student']} />

      {/* Protected Parent Routes */}
      <ProtectedRoute path="/parent-dashboard" component={ParentDashboard} allowedRoles={['parent']} />
      <ProtectedRoute path="/ai/parent-reports" component={AIParentReportSummarizer} allowedRoles={['parent']} />

      {/* Protected Teacher Routes */}
      <ProtectedRoute path="/teacher-dashboard" component={TeacherDashboard} allowedRoles={['teacher']} />

      {/* Protected Admin Routes */}
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/questions" component={AdminQuestions} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/tests" component={AdminTests} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/reports" component={AdminReports} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/bulk-import" component={BulkImport} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/analytics" component={AdminAnalytics} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/cheating-detection" component={AICheatingDetection} allowedRoles={['admin', 'teacher']} />
      <ProtectedRoute path="/admin/difficulty-calibration" component={AIDifficultyCalibration} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/advanced-users" component={AdminAdvancedUsers} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/content-management" component={AdminContentManagement} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/platform-settings" component={AdminPlatformSettings} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/advanced-analytics" component={AdminAdvancedAnalytics} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/moderation" component={AdminModerationTools} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/system" component={AdminSystemAdmin} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/communication" component={AdminCommunication} allowedRoles={['admin']} />
      <ProtectedRoute path="/admin/customization" component={AdminCustomization} allowedRoles={['admin']} />

      {/* Shared Protected Routes (All Roles) */}
      <ProtectedRoute path="/leaderboard" component={Leaderboard} allowedRoles={['student', 'parent', 'admin', 'teacher']} />
      <ProtectedRoute path="/progress" component={ProgressTimeline} allowedRoles={['student', 'parent', 'admin', 'teacher']} />
      <ProtectedRoute path="/test-review/:id" component={TestReview} allowedRoles={['student', 'parent', 'admin', 'teacher']} />
      <ProtectedRoute path="/profile" component={UserProfile} allowedRoles={['student', 'parent', 'admin', 'teacher']} />
      <ProtectedRoute path="/ai/question-generator" component={AIQuestionGenerator} allowedRoles={['teacher']} />
      <ProtectedRoute path="/ai/performance-analysis" component={AIPerformanceAnalysis} allowedRoles={['student', 'parent', 'admin', 'teacher']} />
      <ProtectedRoute path="/ai-performance" component={AIPerformanceAnalysis} allowedRoles={['student', 'parent', 'admin', 'teacher']} />

      {/* Fallback routes */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    hydrateDatabaseState();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
