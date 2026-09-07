import router from '@/router'

export const resolveInternalRedirect = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  const target = value.trim()
  if (
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.includes('\\') ||
    [...target].some((character) => character.charCodeAt(0) < 32)
  ) {
    return fallback
  }

  const resolved = router.resolve(target)
  const finalRecord = resolved.matched.at(-1)
  if (
    resolved.path === '/login' ||
    finalRecord?.name === 'Login' ||
    finalRecord?.name === 'Fallback' ||
    !resolved.matched.length
  ) {
    return fallback
  }
  return resolved.fullPath
}
