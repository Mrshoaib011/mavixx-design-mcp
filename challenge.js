export default function challenge(req, res) {
  if (req.method !== 'GET' || !process.env.OPENAI_APPS_CHALLENGE) return res.status(404).end('Not found');
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).end(process.env.OPENAI_APPS_CHALLENGE);
}
