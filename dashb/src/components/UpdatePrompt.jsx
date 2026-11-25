import { useRegisterSW } from 'virtual:pwa-register/react'

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({

    onRegisteredSW(swUrl, registration) {
      if (!registration) return
      setInterval(async () => {
        if (!navigator.onLine) return
        try {
          await registration.update()
        } catch (error) {
          console.warn('[SW] update check failed', error)
        }
      }, UPDATE_CHECK_INTERVAL)
    },
    onRegisterError(error) {
      console.error('[SW] registration error', error)
    },
  })

  function close() {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="update-prompt" role="alert" aria-live="polite">
      <p className="update-prompt__text">
        {needRefresh
          ? 'A new version of the app is available.'
          : 'The app is ready to work offline.'}
      </p>

      <div className="update-prompt__actions">
        {needRefresh && (

          <button
            type="button"
            className="update-prompt__btn update-prompt__btn--primary"
            onClick={() => updateServiceWorker(true)}
          >
            Update
          </button>
        )}
        <button type="button" className="update-prompt__btn" onClick={close}>
          {needRefresh ? 'Later' : 'OK'}
        </button>
      </div>
    </div>
  )
}

export default UpdatePrompt