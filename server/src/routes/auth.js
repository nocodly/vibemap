import { Router } from 'express'
import fetch from 'node-fetch'

const router = Router()

// GitHub OAuth: exchange code for token
// Called after GitHub redirects back with ?code=...
router.post('/github/callback', async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Missing code' })
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const data = await response.json()

    if (data.error) {
      return res.status(400).json({ error: data.error_description || 'GitHub OAuth failed' })
    }

    // Return token to client — client stores in localStorage
    // We never store it on the server
    res.json({ access_token: data.access_token })
  } catch (err) {
    console.error('GitHub OAuth error:', err)
    res.status(500).json({ error: 'Failed to exchange GitHub token' })
  }
})

export default router
