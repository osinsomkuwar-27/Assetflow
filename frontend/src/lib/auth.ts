export type AuthSession = {
  email: string;
  name: string;
  role: string;
  initials: string;
};

const AUTH_SESSION_KEY = "assetflow.auth.session";

const demoAccount = {
  email: "aditi.rao@acme.com",
  password: "AssetFlow!42",
  session: {
    email: "aditi.rao@acme.com",
    name: "Aditi Rao",
    role: "Facilities Admin",
    initials: "AR",
  } satisfies AuthSession,
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
    return null;
  }
}

export function signIn(email: string, password: string): { ok: true; session: AuthSession } | { ok: false; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return { ok: false, message: "Enter your work email and password." };
  }

  if (normalizedEmail !== demoAccount.email || normalizedPassword !== demoAccount.password) {
    return {
      ok: false,
      message: "Invalid credentials. Use the demo account or connect the real auth backend.",
    };
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(demoAccount.session));
  }

  return { ok: true, session: demoAccount.session };
}

export function signOut() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
}