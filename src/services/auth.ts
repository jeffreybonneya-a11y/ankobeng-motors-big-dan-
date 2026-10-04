export interface AdminRecord {
  phone: string;
  displayName: string;
  role: string;
  active: boolean;
}

const SESSION_TOKEN_KEY = 'ankobeng_admin_session_token';

/**
 * Get current session token from client storage
 */
export function getStoredSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save session token in client storage
 */
export function setStoredSessionToken(token: string): void {
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Clear session token from client storage
 */
export function clearStoredSessionToken(): void {
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // ignore errors
  }
}

/**
 * Authenticate with Phone Number + Password via secure server endpoint
 */
export async function loginWithPhone(phoneInput: string, passwordInput: string): Promise<AdminRecord> {
  const cleanPhone = phoneInput ? phoneInput.trim() : '';
  const cleanPass = passwordInput ? passwordInput.trim() : '';

  if (!cleanPhone || !cleanPass) {
    throw new Error('Invalid phone number or password.');
  }

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: cleanPhone,
        password: cleanPass
      })
    });

    const data = await response.json();

    if (response.ok && data.success && data.token) {
      setStoredSessionToken(data.token);
      return {
        phone: data.user?.phone || cleanPhone,
        displayName: data.user?.displayName || 'Big Dan Admin',
        role: data.user?.role || 'superadmin',
        active: true
      };
    } else {
      throw new Error(data.error || 'Invalid phone number or password.');
    }
  } catch (err: any) {
    if (err.message && err.message !== 'Failed to fetch') {
      throw new Error('Invalid phone number or password.');
    }
    throw new Error('Invalid phone number or password.');
  }
}

/**
 * Verify current admin session with server
 */
export async function verifyAdminSession(): Promise<AdminRecord | null> {
  const token = getStoredSessionToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      clearStoredSessionToken();
      return null;
    }

    const data = await response.json();
    if (data.valid && data.user) {
      return {
        phone: data.user.phone || '0244148534',
        displayName: data.user.displayName || 'Big Dan Admin',
        role: data.user.role || 'superadmin',
        active: true
      };
    } else {
      clearStoredSessionToken();
      return null;
    }
  } catch {
    // If server check fails, invalidate session
    clearStoredSessionToken();
    return null;
  }
}

/**
 * Sign out admin user and invalidate session on server
 */
export async function signOutAdmin(): Promise<void> {
  const token = getStoredSessionToken();
  clearStoredSessionToken();

  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });
    } catch {
      // ignore network errors on signout
    }
  }
}
