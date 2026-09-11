const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5098/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('shopnest_token')
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Something went wrong. Please try again.')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export { API_URL }
