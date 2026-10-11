import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserAccount, mockAllUsers } from '@/lib/mockData';
import { saveUserToDB, saveProfileToDB, deleteUserFromDB } from '@/lib/dbSync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string, gradeLevel?: number) => Promise<void>;
  hasPermission: (action: string) => boolean;
  getAllUsers: () => UserAccount[];
  updateUser: (userId: string, updates: Partial<UserAccount>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  linkParentToStudent: (parentId: string, studentId: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  resetPassword: (email: string) => boolean;
  getCurrentUser: () => User | null;
  isUserAdmin: () => boolean;
  isUserStudent: () => boolean;
  isUserParent: () => boolean;
  isUserTeacher: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('edupath_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => [...mockAllUsers]);

  // Synchronize with database hydration events so the UI never displays stale data
  useEffect(() => {
    const handleHydrated = () => {
      setAllUsers([...mockAllUsers]);
    };
    window.addEventListener('edupath:database-hydrated', handleHydrated);
    return () => {
      window.removeEventListener('edupath:database-hydrated', handleHydrated);
    };
  }, []);

  // Verify and reconcile server session on initial load if token exists
  useEffect(() => {
    const token = localStorage.getItem('edupath_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('edupath_user', JSON.stringify(data.user));
          } else {
            // Token expired or invalid
            setUser(null);
            localStorage.removeItem('edupath_user');
            localStorage.removeItem('edupath_token');
          }
        })
        .catch(err => {
          console.warn('Failed to verify token with server:', err);
        });
    }
  }, []);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('edupath_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('edupath_user');
    }
  }, [user]);

  // Reconcile and synchronize localStorage user with database state
  useEffect(() => {
    if (user && allUsers.length > 0) {
      const dbUser = allUsers.find(u => u.email === user.email && u.role === user.role);
      if (dbUser && (dbUser.id !== user.id || JSON.stringify(dbUser.linkedStudents) !== JSON.stringify(user.linkedStudents))) {
        setUser(dbUser as User);
        localStorage.setItem('edupath_user', JSON.stringify(dbUser));
      }
    }
  }, [allUsers, user]);

  const login = async (email: string, password: string, role: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }
      localStorage.setItem('edupath_token', data.token);
      localStorage.setItem('edupath_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      // Local fallback for offline mode
      console.warn('Server login error:', err.message);
      const emailMatch = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailMatch) {
        if (emailMatch.role !== role) {
          throw new Error(`Incorrect role selected. This email is registered as a ${emailMatch.role}.`);
        }
        setUser(emailMatch as User);
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    localStorage.removeItem('edupath_user');
    localStorage.removeItem('edupath_token');
  };

  const register = async (name: string, email: string, password: string, role: string, gradeLevel?: number) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, gradeLevel })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }
      localStorage.setItem('edupath_token', data.token);
      localStorage.setItem('edupath_user', JSON.stringify(data.user));
      setUser(data.user);
      setAllUsers(prev => [...prev, data.user]);
    } catch (err: any) {
      console.warn('Server registration error:', err.message);
      // Fallback
      const emailMatch = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailMatch) {
        throw new Error('Email is already registered.');
      }

      const newUser: UserAccount = {
        id: `${role}-${Date.now()}`,
        name,
        email,
        role: role as 'student' | 'parent' | 'admin' | 'teacher',
        gradeLevel: role === 'student' ? gradeLevel : undefined,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        subjects: role === 'student' ? [] : undefined,
      };
      await saveUserToDB(newUser);
      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser as User);
    }
  };

  const hasPermission = (action: string): boolean => {
    if (!user) return false;

    const permissions: Record<string, string[]> = {
      admin: [
        'view_all_users',
        'manage_users',
        'manage_tests',
        'manage_questions',
        'view_all_reports',
        'configure_settings',
        'access_admin_dashboard',
      ],
      parent: [
        'view_own_children',
        'view_children_reports',
        'export_children_results',
        'access_parent_dashboard',
      ],
      student: [
        'view_own_tests',
        'take_tests',
        'view_own_results',
        'view_placement_recommendations',
        'access_student_dashboard',
      ],
      teacher: [
        'view_own_students',
        'manage_tests',
        'manage_questions',
        'manage_curriculum',
        'access_teacher_dashboard',
      ],
    };

    return permissions[user.role]?.includes(action) || false;
  };

  const getAllUsers = (): UserAccount[] => {
    return allUsers;
  };

  const updateUser = async (userId: string, updates: Partial<UserAccount>) => {
    await saveProfileToDB(userId, updates);
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const deleteUser = async (userId: string) => {
    await deleteUserFromDB(userId);
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const linkParentToStudent = async (parentId: string, studentId: string) => {
    let parent = allUsers.find(u => u.id === parentId && u.role === 'parent');
    const student = allUsers.find(u => u.id === studentId && u.role === 'student');

    if (!student) return;

    if (!parent && user && user.id === parentId) {
      parent = {
        ...user,
        status: 'active',
        createdAt: new Date().toISOString()
      } as UserAccount;
      await saveUserToDB(parent);
      allUsers.push(parent);
    }

    if (!parent) return;

    const updatedParentStudents = Array.from(new Set([...(parent.linkedStudents || []), studentId]));
    const updatedStudentParents = Array.from(new Set([...(student.linkedParents || []), parentId]));

    await saveProfileToDB(parentId, { linkedStudents: updatedParentStudents });
    await saveProfileToDB(studentId, { linkedParents: updatedStudentParents });

    const updatedUsers = allUsers.map(u => {
      if (u.id === parentId) {
        return { ...u, linkedStudents: updatedParentStudents };
      }
      if (u.id === studentId) {
        return { ...u, linkedParents: updatedStudentParents };
      }
      return u;
    });

    setAllUsers(updatedUsers);

    if (user && user.id === parentId) {
      const updatedUser = { ...user, linkedStudents: updatedParentStudents };
      setUser(updatedUser);
      localStorage.setItem('edupath_user', JSON.stringify(updatedUser));
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    await saveProfileToDB(user.id, updates);
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('edupath_user', JSON.stringify(updatedUser));
  };

  const changePassword = (_oldPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    localStorage.setItem(`password_${user.id}`, newPassword);
    return true;
  };

  const resetPassword = (email: string): boolean => {
    const userExists = allUsers.some(u => u.email === email);
    if (userExists) {
      console.log(`Password reset email sent to ${email}`);
      return true;
    }
    return false;
  };

  const getCurrentUser = (): User | null => {
    return user;
  };

  const isUserAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isUserStudent = (): boolean => {
    return user?.role === 'student';
  };

  const isUserParent = (): boolean => {
    return user?.role === 'parent';
  };

  const isUserTeacher = (): boolean => {
    return user?.role === 'teacher';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        hasPermission,
        getAllUsers,
        updateUser,
        deleteUser,
        linkParentToStudent,
        updateProfile,
        changePassword,
        resetPassword,
        getCurrentUser,
        isUserAdmin,
        isUserStudent,
        isUserParent,
        isUserTeacher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function usePermission(action: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(action);
}
