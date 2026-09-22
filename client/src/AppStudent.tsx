import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Public & Student pages
import LandingPage from "./pages/LandingPage";
import StudentHome from "./pages/student/Home";
import StudentLesson from "./pages/student/Lesson";
import StudentTest from "./pages/student/TakeTest";
import StudentProfile from "./pages/student/Profile";
import StudentWallet from "./pages/student/Wallet";
import StudentLivePass from "./pages/student/LivePass";
import RegisterPage from "./pages/RegisterPage";
import SignInPage from "./pages/SignInPage";
import NotFound from "./pages/NotFound";

function StudentRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />

      {/* Student portal routes */}
      <Route path="/student" component={StudentHome} />
      <Route path="/student/lesson/:id" component={StudentLesson} />
      <Route path="/student/test/:id" component={StudentTest} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/wallet" component={StudentWallet} />
      <Route path="/student/live/:id" component={StudentLivePass} />

      {/* Authentication */}
      <Route path="/register" component={RegisterPage} />
      <Route path="/signin" component={SignInPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function AppStudent() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <StudentRouter />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
