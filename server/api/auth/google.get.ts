export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user }) {
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
    })

    return sendRedirect(event, '/admin')
  },
  onError(event, error) {
    console.error('[Google OAuth] Error:', error)
    return sendRedirect(event, '/login?error=auth_failed')
  },
})
