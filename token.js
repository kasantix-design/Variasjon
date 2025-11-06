// netlify/functions/token.js
import { AccessToken } from 'livekit-server-sdk';

export async function handler(event) {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;
  const params = new URLSearchParams(event.queryStringParameters || {});
  const mode = params.get('mode');           // 'ephemeral' => generer nytt romnavn
  let room = params.get('room') || 'coaching';

  if (mode === 'ephemeral') {
    room = `${room}-${Math.random().toString(36).slice(2,8)}`;
  }

  // identiteten kan settes fra cookie/innlogget bruker; for enkelhet:
  const identity = 'client-' + Math.random().toString(36).slice(2,8);

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    ttl: 60 * 60, // 1 time
  });

  at.addGrant({
    room,              // rommet som klienten får tilgang til
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return {
    statusCode: 200,
    headers: {'content-type':'application/json'},
    body: JSON.stringify({ url: LIVEKIT_URL, token })
  };
}
