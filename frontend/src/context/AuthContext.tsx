import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import {
  fetchProfile,
  loginUser,
  registerUser,
  type AuthResponse,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "../api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: AuthUser["role"][]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_TOKEN_KEY = "auth_token";
const LOCAL_STORAGE_USER_KEY = "auth_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    }

    const initializeProfile = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch (error) {
        console.warn("Failed to fetch profile", error);
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, []);

  const persistAuth = useCallback((auth: AuthResponse) => {
    setUser(auth.user);
    setToken(auth.token);
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, auth.token);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(auth.user));
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      try {
        const auth = await loginUser(payload);
        persistAuth(auth);
        toast.success(`Welcome back, ${auth.user.fullName}!`);
      } catch (error) {
        toast.error("Login failed. Please check your credentials.");
        throw error;
      }
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        const auth = await registerUser(payload);
        persistAuth(auth);
        toast.success("Account created successfully!");
      } catch (error) {
        toast.error("Registration failed. Please try again.");
        throw error;
      }
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }, []);

  const hasRole = useCallback(
    (...roles: AuthUser["role"][]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      hasRole,
    }),
    [user, token, loading, login, register, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

