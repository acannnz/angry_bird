/**
 * Helper untuk mengunci orientasi ke landscape dan masuk ke mode fullscreen
 */
export async function enterLandscapeFullscreen() {
  // 1. Coba aktifkan fullscreen pada root dokumen
  try {
    const docEl = document.documentElement
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen()
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen()
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen()
    }
  } catch (err) {
    console.debug('Fullscreen request not allowed or rejected:', err)
  }

  // 2. Coba kunci orientasi layar ke landscape jika didukung oleh browser (Android/Chrome/dll)
  try {
    if (window.screen?.orientation?.lock) {
      await window.screen.orientation.lock('landscape')
    } else if (window.screen?.lockOrientation) {
      window.screen.lockOrientation('landscape')
    } else if (window.screen?.webkitLockOrientation) {
      window.screen.webkitLockOrientation('landscape')
    } else if (window.screen?.mozLockOrientation) {
      window.screen.mozLockOrientation('landscape')
    }
  } catch (err) {
    console.debug('Screen orientation lock not supported or allowed:', err)
  }
}

export function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  } catch (err) {
    console.debug('Exit fullscreen error:', err)
  }
}
