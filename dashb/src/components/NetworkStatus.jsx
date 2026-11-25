import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

function NetworkStatus() {
  const online = useOnlineStatus()
  const [backOnline, setBackOnline] = useState(false)

  useEffect(() => {
    let timer

    function handleOnline() {
      setBackOnline(true)
      clearTimeout(timer)
      timer = setTimeout(() => setBackOnline(false), 3000)
    }

    function handleOffline() {
      clearTimeout(timer)
      setBackOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!online) {
    return (
      <div className="network-status network-status--offline" role="status">
        <span className="network-status__dot" aria-hidden="true" />
        <span>You are offline. Showing saved data where available.</span>
        <Link to="/offline" className="network-status__link">
          Details
        </Link>
      </div>
    )
  }

  if (backOnline) {
    return (
      <div className="network-status network-status--back" role="status">
        <span className="network-status__dot" aria-hidden="true" />
        <span>Back online</span>
      </div>
    )
  }

  return (
    <div className="network-status network-status--online" role="status">
      <span className="network-status__dot" aria-hidden="true" />
      <span>Online</span>
    </div>
  )
}

export default NetworkStatus
