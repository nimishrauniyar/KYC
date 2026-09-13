const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const baseUrl = rawBaseUrl.replace(/\/+$/, '');


export async function api(path, { token, body, method = 'GET', formData = false } = {}) {
  const response = await fetch(`${baseUrl}${path}`, { method, body: formData ? body : body && JSON.stringify(body), headers: { ...(token && { Authorization: `Bearer ${token}` }), ...(!formData && body && { 'Content-Type': 'application/json' }) } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
