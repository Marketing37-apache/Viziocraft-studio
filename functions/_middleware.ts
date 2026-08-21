// Cloudflare Pages SSR Middleware
// This redirects all requests to the built server worker

export async function onRequest(context: any) {
  // Import the built server
  const server = await import('../dist/server/server.js');
  
  // Pass the request to the server
  return server.default.fetch(context.request, context.env, context);
}
