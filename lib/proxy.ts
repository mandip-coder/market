import { NextResponse, NextRequest } from "next/server";
import { auth } from "./authOptions";

const BACKEND_URL = process.env.BACKEND_URL;

export type availableMethods = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";

function filterResponseHeaders(headers: Headers): Headers {
  const out = new Headers();
  const hopByHop = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "content-length",
  ]);
  headers.forEach((v, k) => {
    if (!hopByHop.has(k.toLowerCase())) out.set(k, v);
  });
  return out;
}

/**
 * Proxy a Next.js server request to a backend, preserving auth.
 * - Safe for PATCH requests with NO body.
 * - Forwards FormData without setting Content-Type (so boundary is preserved).
 * - Filters hop-by-hop headers from backend response.
 */
export async function proxyAPI(
  req: NextRequest,
  routePath: string,
  methodOverride?: availableMethods
) {
  // Authenticate
  const token = await auth();
  if (!token) {
    return new NextResponse("Unauthorized: Invalid or expired token", { status: 401 });
  }
  const accessToken = token.accessToken;
  if (!accessToken) {
    return new NextResponse("Unauthorized: No access token", { status: 401 });
  }

  if (!BACKEND_URL) {
    return new NextResponse("Server misconfigured: BACKEND_URL missing", { status: 500 });
  }

  // Determine method (ensure uppercase)
  const method = ((methodOverride ?? req.method ?? "GET") as string).toUpperCase() as availableMethods;

  // Build backend URL (preserve original querystring)
  const backendUrl = `${BACKEND_URL}${routePath}${req.nextUrl?.search ?? ""}`;

  // Prepare outgoing headers (Authorization + Accept + maybe Content-Type)
  const outgoingHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: req.headers.get("accept") || "application/json",
  };

  // Body handling: allow empty body for PATCH/PUT/etc.
  let body: BodyInit | undefined = undefined;
  try {
    if (!["GET", "HEAD", "DELETE"].includes(method)) {
      // Read raw text first - safe for empty bodies
      const raw = await req.text(); // returns "" if no body

      if (raw && raw.trim() !== "") {
        const incomingContentType = (req.headers.get("content-type") || "").toLowerCase();

        if (incomingContentType.includes("application/json")) {
          // validate JSON and forward as string
          try {
            JSON.parse(raw); // validation only
            outgoingHeaders["Content-Type"] = "application/json";
            body = raw;
          } catch (e) {
            return new NextResponse(
              JSON.stringify({ error: "Invalid JSON body", detail: String(e) }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }
        } else if (incomingContentType.includes("multipart/form-data")) {
          // Forward FormData directly; do NOT set Content-Type so boundary is preserved
          const form = await req.formData();
          body = form as unknown as BodyInit;
          // ensure we don't set Content-Type (fetch will set boundary)
        } else if (incomingContentType.includes("application/x-www-form-urlencoded")) {
          outgoingHeaders["Content-Type"] = "application/x-www-form-urlencoded";
          body = raw;
        } else {
          // Fallback: forward raw text and set content-type if present
          const ct = req.headers.get("content-type");
          if (ct) outgoingHeaders["Content-Type"] = ct;
          body = raw;
        }
      } else {
        // No body present - leave body undefined (fetch will send a bodyless request)
        body = undefined;
      }
    }
  } catch (err) {
    // Defensive catch for body parsing problems
    return new NextResponse(JSON.stringify({ error: "Failed to read request body", detail: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Optionally: remove any incoming hop-by-hop headers from outgoingHeaders if you forwarded them earlier.
  // (We built outgoingHeaders intentionally minimal to avoid problems.)

  try {
    const apiResponse = await fetch(backendUrl, {
      method,
      headers: outgoingHeaders,
      body,
    });

    // Read response as text (safer than passing streams across some runtimes)
    const respText = await apiResponse.text();

    // Filter response headers
    const safeHeaders = filterResponseHeaders(apiResponse.headers);

    // If backend returned JSON (heuristic), ensure Content-Type header is present
    if (!safeHeaders.has("content-type")) {
      try {
        JSON.parse(respText);
        safeHeaders.set("Content-Type", "application/json");
      } catch {
        // not JSON — leave headers as-is
      }
    }

    return new NextResponse(respText, {
      status: apiResponse.status,
      headers: safeHeaders,
    });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
