import "server-only"

type KvResult<T> = { result?: T | null }

const KV_REST_API_URL = process.env.KV_REST_API_URL
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN

function assertKvEnv() {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("KV_REST_API_URL or KV_REST_API_TOKEN is not configured")
  }
}

async function kvFetch<T = unknown>(path: string, init?: RequestInit): Promise<T | null> {
  assertKvEnv()
  const res = await fetch(`${KV_REST_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("[KV] Request failed", path, res.status, text)
    throw new Error(`KV request failed (${res.status})`)
  }

  try {
    const json = (await res.json()) as KvResult<T>
    return (json as any).result ?? null
  } catch (error) {
    console.error("[KV] Failed to parse response", error)
    return null
  }
}

export async function kvGetJSON<T = unknown>(key: string): Promise<T | null> {
  return kvFetch<T>(`/get/${encodeURIComponent(key)}`)
}

export async function kvSetJSON<T = unknown>(key: string, value: T): Promise<boolean> {
  const res = await kvFetch(`/set/${encodeURIComponent(key)}`, {
    method: "POST",
    body: JSON.stringify(value),
  })
  return res === "OK" || res === true
}

export async function kvIncrBy(key: string, amount = 1): Promise<number> {
  const res = await kvFetch<number>(`/incrby/${encodeURIComponent(key)}/${amount}`)
  return typeof res === "number" ? res : 0
}

export async function kvExpire(key: string, seconds: number): Promise<boolean> {
  const res = await kvFetch(`/expire/${encodeURIComponent(key)}/${seconds}`, {
    method: "POST",
  })
  return res === "OK" || res === true || res === 1
}
