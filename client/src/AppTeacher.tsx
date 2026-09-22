import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Teacher pages
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherCurriculum from "./pages/teacher/Curriculum";
import TeacherTests from "./pages/teacher/Tests";
import TeacherStudents from "./pages/teacher/Students";
import TeacherPayments from "./pages/teacher/Payments";
import TeacherAnalytics from "./pages/teacher/Analytics";
import TeacherSettings from "./pages/teacher/Settings";
import SignInPage from "./pages/SignInPage";
import NotFound from "./pages/NotFound";

function TeacherRouter() {
  return (
    <Switch>
      {/* Teacher Portal routes */}
      <Route path="/" component={TeacherDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/teacher/curriculum" component={TeacherCurriculum} />
      <Route path="/teacher/tests" component={TeacherTests} />
      <Route path="/teacher/students" component={TeacherStudents} />
      <Route path="/teacher/payments" component={TeacherPayments} />
      <Route path="/teacher/analytics" component={TeacherAnalytics} />
      <Route path="/teacher/settings" component={TeacherSettings} />

      {/* Direct path aliases */}
      <Route path="/curriculum" component={TeacherCurriculum} />
      <Route path="/tests" component={TeacherTests} />
      <Route path="/students" component={TeacherStudents} />
      <Route path="/payments" component={TeacherPayments} />
      <Route path="/analytics" component={TeacherAnalytics} />
      <Route path="/settings" component={TeacherSettings} />

      {/* Authentication */}
      <Route path="/signin" component={SignInPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function AppTeacher() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <TeacherRouter />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
