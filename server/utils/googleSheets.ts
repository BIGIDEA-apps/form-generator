import crypto from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface ServiceAccountCredentials {
  clientEmail: string
  privateKey: string
}

let cachedCredentials: ServiceAccountCredentials | null = null

function loadServiceAccountJson(): string {
  const pathEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH
  if (pathEnv) {
    try {
      return readFileSync(resolve(process.cwd(), pathEnv.trim()), 'utf-8')
    }
    catch (err: any) {
      throw new Error(`GOOGLE_SERVICE_ACCOUNT_JSON_PATH: ${err?.message}`)
    }
  }

  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!json) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_JSON_PATH must be set')
  }
  return json
}

export function getServiceAccountCredentials(): ServiceAccountCredentials {
  if (cachedCredentials) return cachedCredentials

  const json = loadServiceAccountJson().trim().replace(/^\uFEFF/, '')

  let parsed: Record<string, any>
  try {
    parsed = JSON.parse(json)
  }
  catch (err: any) {
    throw new Error(`Service account JSON invalid: ${err?.message}. Use minified JSON on one line, or GOOGLE_SERVICE_ACCOUNT_JSON_PATH.`)
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service account JSON must contain client_email and private_key')
  }

  cachedCredentials = {
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  }
  return cachedCredentials
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null

export async function getServiceAccountToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken
  }

  const { clientEmail, privateKey } = getServiceAccountCredentials()
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const toBase64Url = (obj: Record<string, any>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')

  const unsignedToken = `${toBase64Url(header)}.${toBase64Url(payload)}`

  const sign = crypto.createSign('RSA-SHA256')
  sign.update(unsignedToken)
  const signature = sign.sign(privateKey, 'base64url')

  const jwt = `${unsignedToken}.${signature}`

  const response = await $fetch<{ access_token: string; expires_in: number }>(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    },
  )

  cachedToken = {
    accessToken: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  }

  return cachedToken.accessToken
}

export async function readSpreadsheetHeaders(
  accessToken: string,
  spreadsheetId: string,
): Promise<string[]> {
  const response = await $fetch<{ values?: string[][] }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/1:1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )

  return response.values?.[0] ?? []
}

export async function appendSpreadsheetRow(
  accessToken: string,
  spreadsheetId: string,
  columnMapping: Record<string, string>,
  data: Record<string, any>,
): Promise<void> {
  const headers = await readSpreadsheetHeaders(accessToken, spreadsheetId)
  if (!headers.length) return

  const row: (string | number | boolean | null)[] = new Array(headers.length).fill(null)

  for (const [fieldKey, headerText] of Object.entries(columnMapping)) {
    if (!headerText) continue
    const colIndex = headers.indexOf(headerText)
    if (colIndex === -1) continue

    const raw = data[fieldKey]
    if (raw === null || raw === undefined) {
      row[colIndex] = null
    }
    else if (Array.isArray(raw)) {
      row[colIndex] = raw.join(', ')
    }
    else if (typeof raw === 'object') {
      row[colIndex] = JSON.stringify(raw)
    }
    else {
      row[colIndex] = raw
    }
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  await $fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [row] }),
  })
}
