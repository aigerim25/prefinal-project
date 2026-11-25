import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { checkConnection } from '../utils/checkConnection'

function Offline() {
  const navigate = useNavigate()
  const location = useLocation()
  const online = useOnlineStatus()
  const [checking, setChecking] = useState(false)
  const [stillOffline, setStillOffline] = useState(false)

  const from = location.state?.from || '/'

  async function handleRetry() {
    setChecking(true)
    setStillOffline(false)
    const ok = await checkConnection()
    setChecking(false)

    if (ok) {
      navigate(from, { replace: true })
    } else {
      setStillOffline(true)
    }
  }

  return (
    <section className="offline-page">
      <div className="offline-page__icon" aria-hidden="true">
        ♪
      </div>
      <h1>You're offline</h1>
      <p>
        This page needs an internet connection and hasn't been saved on your
        device yet.
      </p>
      <p className="offline-page__hint">
        Pages and albums you opened before are still available offline.
      </p>

      <button
        type="button"
        className="offline-page__retry"
        onClick={handleRetry}
        disabled={checking}
      >
        {checking ? 'Checking…' : 'Retry connection'}
      </button>

      {stillOffline && (
        <p className="offline-page__error" role="alert">
          Still no connection. Check your Wi-Fi or mobile data and try again.
        </p>
      )}

      {online && !stillOffline && (
        <p className="offline-page__ok">
          Your device reports a network. Press “Retry connection” to continue.
        </p>
      )}

      <nav className="offline-page__links">
        <Link to="/">Home</Link>
        <Link to="/albums">Albums</Link>
        <Link to="/about">About</Link>
      </nav>
    </section>
  )
}

export default Offline
