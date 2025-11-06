// netlify/functions/lk-token.js
import { AccessToken } from 'livekit-server-sdk';

function cors(json) {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      // Bytt origin her til din GitHub Pages URL:
      'access-control-allow-origin': 'https://kasantix-design.github.io',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(json)
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return cors({ ok: true });
  }

  const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return { statusCode: 500, body: 'Missing LiveKit env' };
  }

  const params = new URLSearchParams(event.queryStringParameters || {});
  const room = (params.get('room') || 'coaching').replace(/[^a-zA-Z0-9_-]/g,'');

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: 'guest-' + Math.random().toString(36).slice(2,8),
    ttl: 60 * 60
  });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true });

  const token = await at.toJwt();
  return cors({ url: LIVEKIT_URL, token, room });
}
