/**
 * Central API module.
 * In Electron: uses contextBridge-exposed window.electron.invoke()
 * In browser dev (Vite only): gracefully returns null so pages fall back to mock data
 */

export const isElectron = () =>
  typeof window !== 'undefined' && !!window.electron?.isElectron

/**
 * Invoke an IPC channel.
 * @param {string} channel
 * @param {...any} args
 * @returns {Promise<any>}
 */
export async function invoke(channel, ...args) {
  if (!isElectron()) {
    // Running in plain browser — no IPC available
    return null
  }
  return window.electron.invoke(channel, ...args)
}
