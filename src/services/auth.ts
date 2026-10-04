export interface AdminRecord {
  phone: string;
  displayName: string;
  role: string;
  active: boolean;
}

/**
 * Authenticate with Phone Number + Password via secure server endpoint.
 * This will set an HttpOnly session cookie on the server.
 */
export async function loginWithPhone(phoneInput: string, passwordInput: string): Promise<AdminRecord> {
  const cleanPhone = phoneInput ? phoneInput.trim() : '';
  const cleanPass = passwordInput ? passwordInput.trim() : '';

  if (!cleanPhone || !cleanPass) {
    throw new Error('Invalid phone number or password.');
  }

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

  if (response.ok && data.success && data.user) {
    return {
      phone: data.user.phone,
      displayName: data.user.displayName || 'Big Dan Admin',
      role: data.user.role || 'superadmin',
      active: true
    };
  } else {
    throw new Error(data.error || 'Invalid phone number or password.');
  }
}

/**
 * Verify current admin session with server.
 * Since the session cookie is HttpOnly, the browser automatically includes it with the request.
 */
export async function verifyAdminSession(): Promise<AdminRecord | null> {
  try {
    const response = await fetch('/api/admin/session', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.authenticated && data.user) {
      return {
        phone: data.user.phone,
        displayName: data.user.displayName || 'Big Dan Admin',
        role: data.user.role || 'superadmin',
        active: true
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sign out admin user and invalidate session on server (clears cookie).
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST'
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
}
