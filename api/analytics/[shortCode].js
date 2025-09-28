// serverless function to get analytics for a specific url
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'urlshortener';

let cachedClient = null;

// connect to mongodb
async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // enable cors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    const { shortCode } = req.query;

    if (!shortCode) {
      return res.status(400).json({ error: 'short code is required' });
    }

    // connect to database
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('urls');

    // find url by short code
    const urlData = await collection.findOne({ shortCode });

    if (!urlData) {
      return res.status(404).json({ error: 'url not found' });
    }

    // return analytics data
    res.status(200).json({
      success: true,
      data: {
        shortCode: urlData.shortCode,
        originalUrl: urlData.originalUrl,
        shortUrl: `https://${req.headers.host}/${urlData.shortCode}`,
        clicks: urlData.clicks,
        createdAt: urlData.createdAt,
        lastAccessed: urlData.lastAccessed
      }
    });

  } catch (error) {
    console.error('error fetching analytics:', error);
    res.status(500).json({ error: 'internal server error' });
  }
}
