import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agora Token Generation using official algorithm
// Reference: https://github.com/AgoraIO/Tools/blob/master/DynamicKey/AgoraDynamicKey/

const VERSION = "006";

const Privileges = {
  kJoinChannel: 1,
  kPublishAudioStream: 2,
  kPublishVideoStream: 3,
  kPublishDataStream: 4,
};

// CRC32 implementation
function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  const table = new Uint32Array(256);
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Pack functions
function packUint16(value: number): Uint8Array {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setUint16(0, value, true);
  return new Uint8Array(buffer);
}

function packUint32(value: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, value, true);
  return new Uint8Array(buffer);
}

function packString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const strBytes = encoder.encode(str);
  const lenBytes = packUint16(strBytes.length);
  const result = new Uint8Array(lenBytes.length + strBytes.length);
  result.set(lenBytes, 0);
  result.set(strBytes, lenBytes.length);
  return result;
}

function packContent(privileges: Map<number, number>): Uint8Array {
  const parts: Uint8Array[] = [];
  parts.push(packUint16(privileges.size));
  
  privileges.forEach((value, key) => {
    parts.push(packUint16(key));
    parts.push(packUint32(value));
  });
  
  const totalLength = parts.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  // Create new ArrayBuffers to avoid type issues with SharedArrayBuffer
  const keyBuffer = new ArrayBuffer(key.length);
  new Uint8Array(keyBuffer).set(key);
  
  const messageBuffer = new ArrayBuffer(message.length);
  new Uint8Array(messageBuffer).set(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBuffer);
  return new Uint8Array(signature);
}

// Base64 encoding
function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Build Access Token
async function buildAccessToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number,
  privilegeExpiredTs: number
): Promise<string> {
  const encoder = new TextEncoder();
  
  // Generate random salt and timestamp
  const salt = Math.floor(Math.random() * 0xFFFFFFFF);
  const ts = Math.floor(Date.now() / 1000);
  const uidStr = uid.toString();

  // Build privileges map
  const privileges = new Map<number, number>();
  privileges.set(Privileges.kJoinChannel, privilegeExpiredTs);
  if (role === 1) { // Publisher
    privileges.set(Privileges.kPublishAudioStream, privilegeExpiredTs);
    privileges.set(Privileges.kPublishVideoStream, privilegeExpiredTs);
    privileges.set(Privileges.kPublishDataStream, privilegeExpiredTs);
  }

  // Pack message
  const message = concatBytes(
    packUint32(salt),
    packUint32(ts),
    packContent(privileges)
  );

  // Generate signature
  const toSign = concatBytes(
    encoder.encode(appId),
    encoder.encode(channelName),
    encoder.encode(uidStr),
    message
  );
  
  const signature = await hmacSha256(encoder.encode(appCertificate), toSign);

  // Calculate CRCs
  const crcChannelName = crc32(encoder.encode(channelName));
  const crcUid = crc32(encoder.encode(uidStr));

  // Pack final content
  const content = concatBytes(
    packString(Array.from(signature).map(b => String.fromCharCode(b)).join('')),
    packUint32(crcChannelName),
    packUint32(crcUid),
    packString(Array.from(message).map(b => String.fromCharCode(b)).join(''))
  );

  // Build final token
  const token = VERSION + appId + base64Encode(content);
  
  return token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AGORA_APP_ID = Deno.env.get('AGORA_APP_ID');
    const AGORA_APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      console.error('[agora-token] Missing credentials - AGORA_APP_ID or AGORA_APP_CERTIFICATE not set');
      throw new Error('Agora credentials not configured');
    }

    const { channelName, uid, role = 1 } = await req.json();

    if (!channelName) {
      throw new Error('Channel name is required');
    }

    console.log(`[agora-token] Generating token for channel: ${channelName}, uid: ${uid}, role: ${role}`);

    // Token expires in 24 hours (86400 seconds)
    const tokenExpireSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + tokenExpireSeconds;

    // Generate token
    const token = await buildAccessToken(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid || 0,
      role,
      privilegeExpiredTs
    );

    console.log('[agora-token] Token generated successfully, length:', token.length);

    return new Response(
      JSON.stringify({
        token,
        appId: AGORA_APP_ID,
        channel: channelName,
        uid: uid || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('[agora-token] Error generating Agora token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
