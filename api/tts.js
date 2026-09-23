import { timingSafeEqual } from 'node:crypto';

const VOICES = new Set(['Aoede', 'Erinome', 'Autonoe', 'Laomedeia', 'Sadachbia', 'Leda', 'Despina', 'Pulcherrima', 'Achernar', 'Enceladus', 'Fenrir', 'Puck', 'Orus', 'Kore', 'Charon', 'Rasalgethi', 'Alnilam', 'Algenib', 'Gacrux', 'Sulafat', 'Zephyr', 'Umbriel', 'Schedar', 'Achird', 'Algieba', 'Zubenelgenubi', 'Sadaltager', 'Callirrhoe', 'Iapetus', 'Vindemiatrix']);

function authorized(header, secret) {
  const supplied = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!supplied || !secret) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

function wav(pcm) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(pcm.length + 36, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(48000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  if (!authorized(req.headers.authorization, process.env.ECOSOKA_AUTOMATION_TOKEN)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Gemini is not configured' });

  const { text, voice = 'Aoede', style = 'Giọng nữ ấm, gần gũi, tự nhiên; đọc tiếng Việt rõ ràng và ngắt nghỉ hợp lý.' } = req.body ?? {};
  if (typeof text !== 'string' || !text.trim() || text.length > 4000 || !VOICES.has(voice) || typeof style !== 'string' || style.length > 400) {
    return res.status(400).json({ error: 'Invalid text, voice or style' });
  }

  const prompt = `Chỉ đọc chính xác đoạn văn sau bằng tiếng Việt. Không thêm lời dẫn hay kết. Cách đọc: ${style}\n\n${text.trim()}`;
  try {
    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      }),
      signal: AbortSignal.timeout(55000),
    });
    if (!upstream.ok) return res.status(502).json({ error: 'Voice provider failed', provider_status: upstream.status });
    const result = await upstream.json();
    const part = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
    if (!part) return res.status(502).json({ error: 'Voice provider returned no audio' });
    const pcm = Buffer.from(part.inlineData.data, 'base64');
    if (!pcm.length || pcm.length > 10_000_000) return res.status(502).json({ error: 'Invalid audio length' });
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'attachment; filename="ecosoka-voice.wav"');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(wav(pcm));
  } catch {
    return res.status(502).json({ error: 'Voice provider unavailable' });
  }
}
