import { NextRequest } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";

/**
 * Mints an Agora RTC token for a consultation room.
 *
 * The Agora project has an App Certificate enabled, which puts it in "dynamic key"
 * mode: joining with the App ID alone is rejected with
 * `CAN_NOT_GET_GATEWAY_SERVER: dynamic use static key`. So every join needs a token.
 *
 * We prefer minting it here (needs AGORA_APP_CERTIFICATE) and fall back to the Django
 * endpoint. Going through this route rather than calling Django from the browser also
 * keeps the insecure http:// upstream server-side, which would otherwise be blocked as
 * mixed content once this site is served over https.
 */

// Comfortably longer than a session: 30 min call + a paid 30 min extension + slack.
const TOKEN_TTL_SECONDS = 3 * 60 * 60;

const APP_ID = process.env.AGORA_APP_ID || process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || "";
const UPSTREAM_URL =
  process.env.AGORA_TOKEN_UPSTREAM_URL || "https://punyam.pythonanywhere.com/api/video/agora-token/";

const MAX_UID = 4294967295; // Agora uids are unsigned 32-bit
// Channel names are limited to 64 bytes from Agora's documented character set.
const CHANNEL_NAME_RE = /^[a-zA-Z0-9!#$%&()+\-:;<=.>?@[\]^_{|}~, ]{1,64}$/;

type UpstreamResult =
  | { token: string }
  | { error: string };

async function fetchUpstreamToken(channelName: string, uid: number): Promise<UpstreamResult> {
  try {
    const res = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel_name: channelName, uid }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    const raw = await res.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      return { error: `Upstream returned non-JSON (HTTP ${res.status}): ${raw.slice(0, 200)}` };
    }

    const token = parsed.token;
    if (typeof token === "string" && token.length > 0) {
      return { token };
    }

    const upstreamMessage =
      typeof parsed.error === "string" ? parsed.error : `no token in response (HTTP ${res.status})`;
    return { error: upstreamMessage };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upstream request failed" };
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  // Accept both our camelCase and the Django endpoint's snake_case spelling.
  const rawChannel = body.channelName ?? body.channel_name;
  if (typeof rawChannel !== "string" || !CHANNEL_NAME_RE.test(rawChannel)) {
    return Response.json(
      { error: "channelName must be 1-64 characters from Agora's allowed character set." },
      { status: 400 }
    );
  }
  const channelName = rawChannel;

  const rawUid = body.uid ?? 0;
  const uid = typeof rawUid === "number" ? rawUid : Number(rawUid);
  if (!Number.isInteger(uid) || uid < 0 || uid > MAX_UID) {
    return Response.json({ error: "uid must be an integer between 0 and 4294967295." }, { status: 400 });
  }

  if (!APP_ID) {
    return Response.json(
      {
        error: "Agora is not configured on the server.",
        reason: "missing_app_id",
        fix: "Set NEXT_PUBLIC_AGORA_APP_ID (or AGORA_APP_ID) in .env.local.",
      },
      { status: 503 }
    );
  }

  // Preferred path: mint the token ourselves.
  if (APP_CERTIFICATE) {
    try {
      const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        TOKEN_TTL_SECONDS,
        TOKEN_TTL_SECONDS
      );

      return Response.json(
        {
          token,
          uid,
          channelName,
          appId: APP_ID,
          expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
          source: "local",
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (err) {
      console.error("Local Agora token generation failed:", err);
      return Response.json(
        {
          error: "Could not generate an Agora token.",
          reason: "local_generation_failed",
          detail: err instanceof Error ? err.message : String(err),
          fix: "Check that AGORA_APP_CERTIFICATE matches the App ID in the Agora console.",
        },
        { status: 500 }
      );
    }
  }

  // Fallback: ask the Django backend.
  const upstream = await fetchUpstreamToken(channelName, uid);
  if ("token" in upstream) {
    return Response.json(
      { token: upstream.token, uid, channelName, appId: APP_ID, source: "upstream" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  console.error("Agora token unavailable:", upstream.error);
  return Response.json(
    {
      error: "Could not get an Agora token, so the call cannot start.",
      reason: "missing_app_certificate",
      detail: upstream.error,
      fix:
        "Add AGORA_APP_CERTIFICATE to .env.local (Agora Console > Project > Configure > " +
        "Primary Certificate), or fix the token endpoint on the Django backend.",
    },
    { status: 503 }
  );
}
