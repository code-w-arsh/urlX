// serverless function to get all urls with analytics
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
    const { sessionId } = req.query;
    
    // connect to database
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('urls');

    // get urls for specific session only
    const query = sessionId ? { sessionId } : {};
    const urls = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50) // limit to 50 most recent urls
      .toArray();

    // format response data
    const formattedUrls = urls.map(url => ({
      id: url._id.toString(),
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `https://${req.headers.host}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
      lastAccessed: url.lastAccessed
    }));

    res.status(200).json({
      success: true,
      data: formattedUrls,
      total: formattedUrls.length
    });

  } catch (error) {
    console.error('error fetching urls:', error);
    console.error('MONGODB_URI exists:', !!MONGODB_URI);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'internal server error',
      details: error.message,
      hasMongoUri: !!MONGODB_URI
    });
  }
}
