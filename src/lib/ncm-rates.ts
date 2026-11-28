/**
 * Nepal Can Move (NCM) delivery-rate lookups for the product page.
 * Server-only: the API token never reaches the browser.
 *
 * Env:
 *   NCM_API_TOKEN      required — sent as `Authorization: Token <token>`
 *   NCM_BASE_URL       optional — default https://portal.nepalcanmove.com/api/v1
 *                      (use https://demo.nepalcanmove.com/api/v1 for the sandbox)
 *   NCM_ORIGIN_BRANCH  optional — pickup branch name, default TINKUNE
 *                      (the branch your parcels start from, e.g. CHANDRAGIRI)
 *   NCM_TYPE_HOME / NCM_TYPE_BRANCH  optional — rate `type` strings (see below)
 */

const BASE = (process.env.NCM_BASE_URL || "https://portal.nepalcanmove.com/api/v1").replace(/\/$/, "");
export const ORIGIN_BRANCH = (process.env.NCM_ORIGIN_BRANCH || "TINKUNE").trim();

// NCM's /shipping-rate `type` values. Door2Door is "Pickup/Collect" and
// Branch2Branch is "B2B" in NCM's v1 docs; overridable in case your account differs.
const TYPE_HOME = process.env.NCM_TYPE_HOME || "Pickup/Collect"; // Door2Door
const TYPE_BRANCH = process.env.NCM_TYPE_BRANCH || "B2B"; // Branch2Branch

export interface NcmBranch {
  name: string; // what NCM expects as `destination`, e.g. "POKHARA"
  district: string;
}

export class NcmNotConfiguredError extends Error {
  constructor() {
    super("NCM_API_TOKEN is not set.");
  }
}

async function ncmGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const token = process.env.NCM_API_TOKEN;
  if (!token) throw new NcmNotConfiguredError();

  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);

  const res = await fetch(url, {
    headers: { Authorization: `Token ${token}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`NCM ${path} responded ${res.status}`);
  return res.json();
}

// Small in-memory TTL cache (per server instance) so each product-page visit
// doesn't hit NCM, and its daily API limits stay safe.
const cache = new Map<string, { at: number; value: unknown }>();
async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

/** Pulls the branch array out of whichever envelope NCM returns. */
function extractList(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    for (const k of ["data", "branches", "results"]) if (Array.isArray(o[k])) return o[k] as unknown[];
  }
  return [];
}

export async function getBranches(): Promise<NcmBranch[]> {
  return cached("branches", 60 * 60 * 1000, async () => {
    const list = extractList(await ncmGet("branchlist"));
    const out: NcmBranch[] = [];
    for (const row of list) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const name = typeof r.name === "string" ? r.name.trim() : "";
      if (!name) continue;
      out.push({ name, district: typeof r.district === "string" ? r.district.trim() : "" });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  });
}

async function getCharge(destination: string, type: string): Promise<number | null> {
  return cached(`rate:${destination}:${type}`, 30 * 60 * 1000, async () => {
    try {
      const json = (await ncmGet("shipping-rate", { creation: ORIGIN_BRANCH, destination, type })) as Record<string, unknown>;
      const n = Number(json?.charge);
      return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
    } catch (err) {
      if (err instanceof NcmNotConfiguredError) throw err;
      return null; // NCM doesn't offer this service to that branch
    }
  });
}

export async function getDeliveryRates(destination: string) {
  const [home, branch] = await Promise.all([getCharge(destination, TYPE_HOME), getCharge(destination, TYPE_BRANCH)]);
  return { home, branch };
}
