// Ensemble Trackr — Media Backup Edge Function
// LiveViral Media
//
// Accepts base64-encoded media files from the native shell and fans them out
// to Google Drive (per-user folder) and Cloudinary (per-user folder, auto type).
// Supports chunked uploads for files >= 40 MB raw.
//
// Secrets required (set via supabase secrets set):
//   GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, GOOGLE_DRIVE_ROOT_FOLDER_ID
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_SA_EMAIL      = Deno.env.get('GOOGLE_SA_CLIENT_EMAIL')   ?? ''
const GOOGLE_SA_KEY        = Deno.env.get('GOOGLE_SA_PRIVATE_KEY')    ?? ''
const DRIVE_ROOT_FOLDER    = Deno.env.get('GOOGLE_DRIVE_ROOT_FOLDER_ID') ?? ''
const CLD_CLOUD            = Deno.env.get('CLOUDINARY_CLOUD_NAME')    ?? ''
const CLD_API_KEY          = Deno.env.get('CLOUDINARY_API_KEY')       ?? ''
const CLD_API_SECRET       = Deno.env.get('CLOUDINARY_API_SECRET')    ?? ''
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')             ?? ''
const SUPABASE_SERVICE     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Module-level caches — persist across requests within one function instance
let cachedToken: { value: string; exp: number } | null = null
const folderCache = new Map<string, string>()

interface BackupRequest {
  filename:             string
  data:                 string   // base64-encoded file bytes
  mime_type:            string
  user_id:              string
  user_name:            string
  device_id:            string
  // chunked upload fields (only present when file >= 40 MB)
  chunk_index?:         number   // 0-based
  total_chunks?:        number
  byte_offset?:         number   // byte start position of this chunk in the full file
  total_size_bytes?:    number   // total file size in bytes
  drive_upload_uri?:    string   // Drive resumable URI returned by chunk 0
  cloudinary_upload_id?: string  // Cloudinary X-Unique-Upload-Id returned by chunk 0
}

// ─────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────

function b64UrlEncode(input: ArrayBuffer | string): string {
  const str = typeof input === 'string'
    ? input
    : String.fromCharCode(...new Uint8Array(input))
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

async function sha1Hex(input: string): Promise<string> {
  const bytes  = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function sanitizeFolder(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '')
}

function randomId(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

// ─────────────────────────────────────────
// Google OAuth
// ─────────────────────────────────────────

async function signGoogleJWT(): Promise<string> {
  const now    = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss:   GOOGLE_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  }
  const unsigned = `${b64UrlEncode(JSON.stringify(header))}.${b64UrlEncode(JSON.stringify(claims))}`

  // Strip PEM headers, decode to DER bytes
  const pem      = GOOGLE_SA_KEY.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const keyBytes = base64ToBytes(pem)
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsigned),
  )
  return `${unsigned}.${b64UrlEncode(sig)}`
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && now < cachedToken.exp - 60) return cachedToken.value

  const jwt = await signGoogleJWT()
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const { access_token, expires_in } = await res.json() as { access_token: string; expires_in: number }
  cachedToken = { value: access_token, exp: now + expires_in }
  return access_token
}

// ─────────────────────────────────────────
// Google Drive — folder management
// ─────────────────────────────────────────

async function getOrCreateFolder(name: string, token: string): Promise<string> {
  if (folderCache.has(name)) return folderCache.get(name)!

  const q   = `name='${name}' and '${DRIVE_ROOT_FOLDER}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const { files } = await res.json() as { files: { id: string }[] }

  if (files && files.length > 0) {
    folderCache.set(name, files[0].id)
    return files[0].id
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents:  [DRIVE_ROOT_FOLDER],
    }),
  })
  const { id } = await createRes.json() as { id: string }
  folderCache.set(name, id)
  return id
}

// ─────────────────────────────────────────
// Google Drive — uploads
// ─────────────────────────────────────────

async function driveMultipartUpload(
  filename: string,
  fileBytes: Uint8Array,
  mimeType: string,
  folderId: string,
  token: string,
): Promise<string> {
  const metadata  = JSON.stringify({ name: filename, parents: [folderId] })
  const boundary  = 'et_boundary_xyz'
  const textPart  = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    '',
    '',
  ].join('\r\n')

  const textBytes    = new TextEncoder().encode(textPart)
  const closingBytes = new TextEncoder().encode(`\r\n--${boundary}--`)
  const body         = new Uint8Array(textBytes.length + fileBytes.length + closingBytes.length)
  body.set(textBytes)
  body.set(fileBytes, textBytes.length)
  body.set(closingBytes, textBytes.length + fileBytes.length)

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  )
  const { id } = await res.json() as { id: string }
  return id
}

async function initDriveResumable(
  filename: string,
  mimeType: string,
  folderId: string,
  totalBytes: number,
  token: string,
): Promise<string> {
  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method:  'POST',
      headers: {
        Authorization:              `Bearer ${token}`,
        'Content-Type':             'application/json',
        'X-Upload-Content-Type':    mimeType,
        'X-Upload-Content-Length':  String(totalBytes),
      },
      body: JSON.stringify({ name: filename, parents: [folderId] }),
    },
  )
  return res.headers.get('location') ?? ''
}

async function putDriveChunk(
  uploadUri: string,
  chunkBytes: Uint8Array,
  byteOffset: number,
  totalBytes: number,
): Promise<string | null> {
  const end       = byteOffset + chunkBytes.length - 1
  const rangeSize = (byteOffset + chunkBytes.length >= totalBytes) ? String(totalBytes) : '*'

  const res = await fetch(uploadUri, {
    method:  'PUT',
    headers: {
      'Content-Length': String(chunkBytes.length),
      'Content-Range':  `bytes ${byteOffset}-${end}/${rangeSize}`,
    },
    body: chunkBytes,
  })

  if (res.status === 200 || res.status === 201) {
    const { id } = await res.json() as { id: string }
    return id
  }
  return null // 308 Resume Incomplete — more chunks expected
}

// ─────────────────────────────────────────
// Cloudinary — SHA-1 signature
// ─────────────────────────────────────────

async function cloudinarySignature(params: Record<string, string | number>): Promise<string> {
  const sorted    = Object.keys(params).sort()
  const paramStr  = sorted.map(k => `${k}=${params[k]}`).join('&')
  return sha1Hex(`${paramStr}${CLD_API_SECRET}`)
}

// ─────────────────────────────────────────
// Cloudinary — single upload
// ─────────────────────────────────────────

async function cloudinarySingleUpload(
  filename: string,
  fileBytes: Uint8Array,
  mimeType: string,
  folder: string,
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000)
  const params    = { folder, timestamp }
  const sig       = await cloudinarySignature(params)

  const form = new FormData()
  form.append('file', new Blob([fileBytes], { type: mimeType }), filename)
  form.append('api_key',   CLD_API_KEY)
  form.append('timestamp', String(timestamp))
  form.append('folder',    folder)
  form.append('signature', sig)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/auto/upload`,
    { method: 'POST', body: form },
  )
  const { public_id } = await res.json() as { public_id: string }
  return public_id
}

// ─────────────────────────────────────────
// Cloudinary — chunked upload
// ─────────────────────────────────────────

async function cloudinaryChunkUpload(
  filename: string,
  chunkBytes: Uint8Array,
  mimeType: string,
  folder: string,
  uploadId: string,
  byteOffset: number,
  totalBytes: number,
): Promise<string | null> {
  const timestamp = Math.floor(Date.now() / 1000)
  const params    = { folder, timestamp }
  const sig       = await cloudinarySignature(params)
  const end       = byteOffset + chunkBytes.length - 1

  const form = new FormData()
  form.append('file', new Blob([chunkBytes], { type: mimeType }), filename)
  form.append('api_key',   CLD_API_KEY)
  form.append('timestamp', String(timestamp))
  form.append('folder',    folder)
  form.append('signature', sig)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/auto/upload`,
    {
      method: 'POST',
      headers: {
        'X-Unique-Upload-Id': uploadId,
        'Content-Range':      `bytes ${byteOffset}-${end}/${totalBytes}`,
      },
      body: form,
    },
  )

  if (res.status === 200) {
    const { public_id } = await res.json() as { public_id: string }
    return public_id // only present on the final chunk
  }
  return null
}

// ─────────────────────────────────────────
// Supabase writes
// ─────────────────────────────────────────

async function updateDiagnostic(userId: string): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  await supabase.from('user_diagnostics').upsert(
    { user_id: userId, last_checked_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
}

// ─────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json() as BackupRequest
    const {
      filename, data, mime_type, user_id, user_name,
      chunk_index, total_chunks, byte_offset, total_size_bytes,
      drive_upload_uri, cloudinary_upload_id,
    } = payload

    const fileBytes    = base64ToBytes(data)
    const isChunked    = total_chunks !== undefined && total_chunks > 1
    const isFirstChunk = !isChunked || chunk_index === 0
    const isLastChunk  = !isChunked || chunk_index === (total_chunks! - 1)
    const sanitized    = sanitizeFolder(user_name) || 'band'

    let driveFileId:       string | null = null
    let cloudinaryPublicId: string | null = null
    let newDriveUri:       string | null = null
    let newCloudinaryId:   string | null = null

    const token    = await getAccessToken()
    const folderId = await getOrCreateFolder(sanitized, token)

    if (!isChunked) {
      // ── Single upload (file < 40 MB) ──────────────────────────────────────
      if (fileBytes.length < 5 * 1024 * 1024) {
        driveFileId = await driveMultipartUpload(filename, fileBytes, mime_type, folderId, token)
      } else {
        // Between 5–40 MB: use resumable but upload in one shot
        const uri = await initDriveResumable(filename, mime_type, folderId, fileBytes.length, token)
        driveFileId = await putDriveChunk(uri, fileBytes, 0, fileBytes.length)
      }
      cloudinaryPublicId = await cloudinarySingleUpload(filename, fileBytes, mime_type, sanitized)
      await updateDiagnostic(user_id)

    } else if (isFirstChunk) {
      // ── First chunk: initialize resumable uploads, PUT/POST first chunk ────
      newDriveUri = await initDriveResumable(
        filename, mime_type, folderId, total_size_bytes!, token,
      )
      await putDriveChunk(newDriveUri, fileBytes, byte_offset!, total_size_bytes!)

      newCloudinaryId = randomId()
      await cloudinaryChunkUpload(
        filename, fileBytes, mime_type, sanitized,
        newCloudinaryId, byte_offset!, total_size_bytes!,
      )

    } else {
      // ── Middle / last chunk ─────────────────────────────────────────────
      const driveResult = await putDriveChunk(
        drive_upload_uri!, fileBytes, byte_offset!, total_size_bytes!,
      )
      const cldResult = await cloudinaryChunkUpload(
        filename, fileBytes, mime_type, sanitized,
        cloudinary_upload_id!, byte_offset!, total_size_bytes!,
      )

      if (isLastChunk) {
        driveFileId        = driveResult
        cloudinaryPublicId = cldResult
        await updateDiagnostic(user_id)
      }
    }

    return new Response(
      JSON.stringify({
        drive_file_id:        driveFileId,
        cloudinary_public_id: cloudinaryPublicId,
        drive_upload_uri:     newDriveUri,
        cloudinary_upload_id: newCloudinaryId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('backup-media error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
