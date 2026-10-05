import { CATALOG_COUNT } from '../src/catalog.js';
import { VERSION } from '../src/mcp.js';
export default function health(req, res) {
  res.status(200).json({ status: 'ok', version: VERSION, catalog_count: CATALOG_COUNT, image_rendering: false });
}
