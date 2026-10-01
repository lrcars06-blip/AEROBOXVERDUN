/**
 * Passerelle BUXIDA pour le site Aerobox — fichier unique à la racine (Vercel Routing Middleware).
 * Interroge l'API partenaire BUXIDA (lecture seule) pour afficher prix et disponibilités en direct.
 * La clé reste côté serveur, comme l'exige BUXIDA (« usage serveur uniquement »).
 *
 * Variable d'environnement à définir dans Vercel (Settings → Environment Variables) :
 *   BUXIDA_API_KEY   clé « bxk_live_… » créée dans BUXIDA (Module de réservation → Accès API), scope catalog:read
 *
 * Route servie :
 *   GET /api/buxida?action=dispo  → types de box publiés, prix TTC et nombre de box libres
 *   GET /api/buxida?action=ping   → vérifie la clé (nom du centre et scopes)
 */

export const config = { matcher: "/api/buxida" };

const API = "https://api.buxida.com/v1";
let cache = { at: 0, body: null };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

async function call(path, key) {
  const r = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const map = { 401: "Clé API BUXIDA refusée (INVALID_API_KEY).", 403: "La clé BUXIDA n'a pas le droit catalog:read.", 429: "Trop de requêtes vers BUXIDA, réessayez dans une minute." };
    throw new Error(map[r.status] || data.message || `BUXIDA HTTP ${r.status}`);
  }
  return data;
}

async function dispo(key) {
  if (Date.now() - cache.at < 60_000 && cache.body) return cache.body;
  const data = await call("/disponibilites", key);
  const num = (v) => (typeof v === "number" && Number.isFinite(v)) ? v : (parseFloat(String(v ?? "").replace(",", ".")) || null);
  const items = (data.data || []).map((b) => ({
    id: String(b.id),
    title: b.name || "",
    m2: num(b.areaM2),
    m3: num(b.volumeM3),
    price: num(b.priceInclTax),
    dispo: parseInt(b.availableBoxes, 10) || 0,
    total: parseInt(b.totalBoxes, 10) || 0,
    memo: b.description || "",
    family: b.familyName || "",
    image: b.imageUrl || "",
  }));
  cache = { at: Date.now(), body: { ok: true, items } };
  return cache.body;
}

export default async function middleware(request) {
  const key = process.env.BUXIDA_API_KEY;
  if (!key) return json({ ok: false, error: "BUXIDA non configuré (variable BUXIDA_API_KEY manquante)." }, 503);
  const action = new URL(request.url).searchParams.get("action");
  try {
    if (action === "dispo") return json(await dispo(key));
    if (action === "ping") { const p = await call("/ping", key); return json({ ok: true, center: p.center, scopes: p.scopes }); }
    return json({ ok: false, error: "Route inconnue." }, 404);
  } catch (e) {
    return json({ ok: false, error: e.message || "BUXIDA ne répond pas pour le moment." }, 502);
  }
}
