export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const { password, messages, system, max_tokens } = body;

    const APP_PASSWORD = process.env.APP_PASSWORD || 'deeptrading2025';
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_KEY) {
      return res.status(500).json({ error: 'Clé API non configurée. Va dans Vercel → Settings → Environment Variables.' });
    }

    if (password !== APP_PASSWORD) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages manquants.' });
    }

    const payload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: max_tokens || 1500,
      messages: messages,
    };
    if (system) payload.system = system;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erreur API Anthropic' });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
  }
}
