import { consola } from 'consola'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: [
      'email',
      'profile',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
    authorizationParams: { access_type: 'offline', prompt: 'consent' },
  },
  async onSuccess(event, { user, tokens }) {
    const email: string = user.email || ''
    const allowedDomain = 'bigideas.co.il'

    if (!email.endsWith(`@${allowedDomain}`)) {
      await setUserSession(event, { user: {} as any })
      await clearUserSession(event)
      return sendRedirect(event, '/login?error=unauthorized')
    }

    await setUserSession(event, {
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      secure: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    })

    return sendRedirect(event, '/admin')
  },
  onError(event, error) {
    consola.error('[Google OAuth] Error:', error)
    return sendRedirect(event, '/login?error=auth_failed')
  },
})
