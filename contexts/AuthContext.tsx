import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { generateId } from '@/utils/helpers';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

const CURRENT_USER_KEY = 'userSession';
const ALL_USERS_KEY = 'registeredUsers';

async function loadCurrentUser(): Promise<AuthUser | null> {
  try {
    const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.log('Error loading current user:', e);
    return null;
  }
}

async function loadAllUsers(): Promise<StoredUser[]> {
  try {
    const stored = await AsyncStorage.getItem(ALL_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.log('Error loading users:', e);
    return [];
  }
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const userQuery = useQuery({
    queryKey: ['auth_current_user'],
    queryFn: loadCurrentUser,
  });

  useEffect(() => {
    if (!userQuery.isLoading) {
      setUser(userQuery.data ?? null);
      setIsReady(true);
    }
  }, [userQuery.data, userQuery.isLoading]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const users = await loadAllUsers();
      const found = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) throw new Error('Invalid email or password');
      const { password: _pw, ...authUser } = found;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      return authUser;
    },
    onSuccess: (authUser) => {
      setUser(authUser);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const users = await loadAllUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists');
      }
      const newUser: StoredUser = {
        id: generateId(),
        name,
        email: email.toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(ALL_USERS_KEY, JSON.stringify([...users, newUser]));
      const { password: _pw, ...authUser } = newUser;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      return authUser;
    },
    onSuccess: (authUser) => {
      setUser(authUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    },
    onSuccess: () => {
      setUser(null);
    },
  });

  const login = useCallback(
    (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
    [loginMutation]
  );

  const signup = useCallback(
    (name: string, email: string, password: string) => signupMutation.mutateAsync({ name, email, password }),
    [signupMutation]
  );

  const logout = useCallback(() => logoutMutation.mutateAsync(), [logoutMutation]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: !isReady,
    login,
    signup,
    logout,
    loginError: loginMutation.error?.message ?? null,
    signupError: signupMutation.error?.message ?? null,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    setUser,
  };
});
