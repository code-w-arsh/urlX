// serverless function to handle url redirects
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
      return res.status(404).json({ error: 'short url not found' });
    }

    // increment click count and update last accessed
    await collection.updateOne(
      { shortCode },
      { 
        $inc: { clicks: 1 },
        $set: { lastAccessed: new Date() }
      }
    );

    // redirect to original url
    res.redirect(302, urlData.originalUrl);

  } catch (error) {
    console.error('error redirecting:', error);
    res.status(500).json({ error: 'internal server error' });
  }
}
