const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const sessionKey = 'sweety-token';

export const session = {
  get: () => sessionStorage.getItem(sessionKey),
  set: (token) => sessionStorage.setItem(sessionKey, token),
  clear: () => sessionStorage.removeItem(sessionKey),
};

export async function api(path, { body, ...options } = {}) {
  const token = session.get();
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not connect to Sweety. Check your connection and try again.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) {
      session.clear();
      window.dispatchEvent(new Event('sweety:session-expired'));
    }
    const error = new Error(data?.error?.message || 'Something went wrong. Please try again.');
    error.field = data?.error?.field;
    error.status = response.status;
    throw error;
  }
  return data;
}
