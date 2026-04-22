export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ codigo: 0, msg: 'Método não permitido. Use POST.' });
  }

  const apiKey = process.env.PLACAFIPE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ codigo: 0, msg: 'PLACAFIPE_API_KEY não configurada no Vercel.' });
  }

  try {
    const { placa } = req.body || {};
    const placaNormalizada = String(placa || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    if (placaNormalizada.length < 7) {
      return res.status(400).json({ codigo: 0, msg: 'Placa inválida. Use ABC1234 ou ABC1D23.' });
    }

    const upstream = await fetch('https://placafipe.com/api/v1/consulta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ placa: placaNormalizada })
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ codigo: 0, msg: 'Resposta inválida da API PlacaFipe.', raw: text });
    }

    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (error) {
    return res.status(500).json({
      codigo: 0,
      msg: 'Erro interno ao consultar a API PlacaFipe.',
      detalhe: error?.message || 'Erro desconhecido'
    });
  }
}
