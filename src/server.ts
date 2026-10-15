import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} - try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

type AssetsEnv = { ASSETS?: { fetch: (request: Request) => Promise<Response> } };

/* Les fichiers statiques de Cloudflare sont servis sans "Accept-Ranges" : Safari (iPhone)
   refuse alors de lire une vidéo, et l'avance rapide ne marche nulle part.
   Pour /work/*.mp4, on relit le fichier et on répond nous-mêmes aux requêtes partielles. */
async function serveVideo(request: Request, env: AssetsEnv): Promise<Response | null> {
  const url = new URL(request.url);
  if (!env.ASSETS || !url.pathname.startsWith("/work/")) return null;
  /* miniatures et autres fichiers : servis tels quels par Cloudflare */
  if (!url.pathname.endsWith(".mp4")) return env.ASSETS.fetch(request);
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const upstream = await env.ASSETS.fetch(new Request(url.toString(), { method: "GET" }));
  if (!upstream.ok) return upstream;

  const buffer = await upstream.arrayBuffer();
  const size = buffer.byteLength;
  const headers = new Headers({
    "content-type": "video/mp4",
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable",
  });

  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (!match || (match[1] === "" && match[2] === "")) {
    headers.set("content-length", String(size));
    return new Response(request.method === "HEAD" ? null : buffer, { status: 200, headers });
  }

  let start = match[1] === "" ? size - Number(match[2]) : Number(match[1]);
  let end = match[1] === "" || match[2] === "" ? size - 1 : Number(match[2]);
  start = Math.max(0, start);
  end = Math.min(end, size - 1);
  if (start > end || start >= size) {
    headers.set("content-range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set("content-range", `bytes ${start}-${end}/${size}`);
  headers.set("content-length", String(end - start + 1));
  return new Response(request.method === "HEAD" ? null : buffer.slice(start, end + 1), {
    status: 206,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const video = await serveVideo(request, env as AssetsEnv);
      if (video) return video;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
