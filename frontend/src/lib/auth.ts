import { api, AUTH_TOKEN_KEY, AUTH_SESSION_KEY } from "./api";

export type AuthSession = {
  id: string;
  email: string;
  name: string;
  role: string;
  initials: string;
};

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ ok: true; session: AuthSession } | { ok: false; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return { ok: false, message: "Enter your work email and password." };
  }

  try {
    const data = await api.post<{ token: string; user: any }>("/api/auth/login", {
      email: normalizedEmail,
      password: normalizedPassword,
    });

    const initials = data.user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();

    const session: AuthSession = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      initials,
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    }

    return { ok: true, session };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || "Invalid credentials. Please try again.",
    };
  }
}

export async function signUp(payload: {
  name: string;
  email: string;
  password: string;
  department?: string;
}): Promise<{ ok: true; session: AuthSession } | { ok: false; message: string }> {
  try {
    await api.post("/api/auth/signup", {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      department: payload.department || undefined,
    });

    // Auto-login after successful signup
    const loginResult = await signIn(payload.email, payload.password);
    return loginResult;
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || "Sign up failed. Please try again.",
    };
  }
}

export function signOut() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}