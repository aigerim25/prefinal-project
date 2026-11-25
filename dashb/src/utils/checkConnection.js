export async function checkConnection(timeoutMs = 4000) {
  if (!navigator.onLine) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`/manifest.json?ping=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
