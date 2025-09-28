// serverless function to delete urls
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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    const { shortCode } = req.query;
    const { sessionId } = req.body;

    // validate input
    if (!shortCode) {
      return res.status(400).json({ error: 'short code is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'session id is required' });
    }

    // connect to database
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('urls');

    // find and verify ownership
    const urlData = await collection.findOne({ shortCode, sessionId });

    if (!urlData) {
      return res.status(404).json({ error: 'url not found or access denied' });
    }

    // delete the url
    await collection.deleteOne({ shortCode, sessionId });

    // return success response
    res.status(200).json({
      success: true,
      message: 'url deleted successfully'
    });

  } catch (error) {
    console.error('error deleting url:', error);
    res.status(500).json({ error: 'internal server error' });
  }
}
