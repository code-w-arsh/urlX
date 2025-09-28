// serverless function to create shortened urls
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

// generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// validate url format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default async function handler(req, res) {
  // enable cors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    const { originalUrl, customCode, sessionId } = req.body;

    // validate input
    if (!originalUrl) {
      return res.status(400).json({ error: 'original url is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'invalid url format' });
    }

    // connect to database
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('urls');

    // generate or use custom short code
    let shortCode = customCode || generateShortCode();

    // check if custom code already exists
    if (customCode) {
      const existingUrl = await collection.findOne({ shortCode: customCode });
      if (existingUrl) {
        return res.status(409).json({ error: 'custom code already exists' });
      }
    } else {
      // ensure generated code is unique
      let attempts = 0;
      while (attempts < 10) {
        const existingUrl = await collection.findOne({ shortCode });
        if (!existingUrl) break;
        shortCode = generateShortCode();
        attempts++;
      }
      
      if (attempts >= 10) {
        return res.status(500).json({ error: 'failed to generate unique code' });
      }
    }

    // create url document with session id
    const urlData = {
      originalUrl,
      shortCode,
      clicks: 0,
      createdAt: new Date(),
      lastAccessed: null,
      sessionId: sessionId || 'anonymous'
    };

    // save to database
    await collection.insertOne(urlData);

    // return success response
    res.status(201).json({
      success: true,
      data: {
        id: urlData._id,
        originalUrl: urlData.originalUrl,
        shortCode: urlData.shortCode,
        shortUrl: `https://${req.headers.host}/${urlData.shortCode}`,
        clicks: urlData.clicks,
        createdAt: urlData.createdAt
      }
    });

  } catch (error) {
    console.error('error creating short url:', error);
    res.status(500).json({ error: 'internal server error' });
  }
}
