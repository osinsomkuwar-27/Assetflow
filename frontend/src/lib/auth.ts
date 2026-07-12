export type AuthSession = {
  email: string;
  name: string;
  role: string;
  initials: string;
};

const AUTH_SESSION_KEY = "assetflow.auth.session";
const AUTH_ACCOUNTS_KEY = "assetflow.auth.accounts";

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

function readAccounts(): Array<{ email: string; password: string; session: AuthSession }> {
  if (typeof window === "undefined") {
    return [demoAccount as typeof demoAccount & { session: AuthSession }];
  }

  const raw = window.localStorage.getItem(AUTH_ACCOUNTS_KEY);
  if (!raw) {
    return [demoAccount as typeof demoAccount & { session: AuthSession }];
  }

  try {
    const parsed = JSON.parse(raw) as Array<{ email: string; password: string; session: AuthSession }>;
    return [demoAccount as typeof demoAccount & { session: AuthSession }, ...parsed.filter(Boolean)];
  } catch {
    return [demoAccount as typeof demoAccount & { session: AuthSession }];
  }
}

function persistAccounts(accounts: Array<{ email: string; password: string; session: AuthSession }>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
}

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

  const accounts = readAccounts();
  const match = accounts.find((account) => account.email.toLowerCase() === normalizedEmail && account.password === normalizedPassword);

  if (!match) {
    return {
      ok: false,
      message: "Invalid credentials. Use the demo account or create a local account first.",
    };
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(match.session));
  }

  return { ok: true, session: match.session };
}

export function signUp(payload: { name: string; email: string; password: string; department?: string }): { ok: true; session: AuthSession } | { ok: false; message: string } {
  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();
  const password = payload.password.trim();

  if (!name || !email || !password) {
    return { ok: false, message: "Please fill in your name, email, and password." };
  }

  const accounts = readAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === email)) {
    return { ok: false, message: "An account with that email already exists." };
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const session: AuthSession = {
    email,
    name,
    role: payload.department ? "Employee" : "Employee",
    initials: initials || "U",
  };

  const nextAccounts = [...accounts, { email, password, session }];
  persistAccounts(nextAccounts);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  return { ok: true, session };
}

export function signOut() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
}