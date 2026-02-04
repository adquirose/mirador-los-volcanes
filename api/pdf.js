export default async function handler(req, res) {
  try {
    // Configurar CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Fetch del PDF desde el servidor externo
    const response = await fetch('https://www.lanube360.com/pdf/mirador-los-volcanes-panguipulli.pdf');
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch PDF' });
    }

    // Configurar headers para el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', response.headers.get('content-length'));
    
    // Stream del PDF al cliente
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('PDF Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}