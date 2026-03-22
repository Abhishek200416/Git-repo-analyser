console.log('[SERVER] Starting initialization...');
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import admin from 'firebase-admin';
import axios from 'axios';

console.log('[SERVER] Imports complete');
dotenv.config();
console.log('[SERVER] Dotenv config complete');

// Initialize Firebase Admin
let db: any;
let auth: any;

try {
  if (!admin.apps.length) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    let serviceAccount = null;
    
    if (serviceAccountStr && serviceAccountStr.trim()) {
      try {
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (e) {
        console.error('[FIREBASE] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
      }
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[FIREBASE] Initialized with Service Account');
    } else {
      // Fallback for local development if service account is not provided
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0745348592'
      });
      console.log('[FIREBASE] Initialized with Project ID fallback');
    }
  }
  db = admin.firestore();
  auth = admin.auth();
} catch (error) {
  console.error('[FIREBASE] Initialization Error:', error);
  // We don't crash here, but routes using db/auth will fail gracefully
}

// Initialize Razorpay
let razorpay: any;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_STB0PCykgglINK',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'vRg2kiRsZvwVuWAX1z0RSX3L'
  });
  console.log('[RAZORPAY] Initialized');
} catch (error) {
  console.error('[RAZORPAY] Initialization Error:', error);
}

async function startServer() {
  console.log('[SERVER] Starting startServer function...');
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  console.log('[SERVER] Middleware initialized');
  console.log('[SERVER] Middleware initialized');

  // --- API Routes ---

  // 1. Auth: Send OTP
  app.post('/api/auth/otp/send', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Mock OTP: 123456
    // In a real app, you would use nodemailer or a service like SendGrid
    console.log(`[AUTH] OTP for ${email}: 123456`);
    
    // Store OTP in Firestore with expiration
    await db.collection('otps').doc(email).set({
      otp: '123456',
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000))
    });

    res.json({ message: 'OTP sent successfully' });
  });

  // 2. Auth: Verify OTP
  app.post('/api/auth/otp/verify', async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and OTP are required' });

    const otpDoc = await db.collection('otps').doc(email).get();
    if (!otpDoc.exists) return res.status(400).json({ error: 'Invalid OTP' });

    const data = otpDoc.data();
    if (data?.otp !== code || data?.expiresAt.toDate() < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Delete OTP after verification
    await db.collection('otps').doc(email).delete();

    // Get or create user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (e) {
      userRecord = await auth.createUser({ email });
      await db.collection('users').doc(userRecord.uid).set({
        email,
        uid: userRecord.uid,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
    }

    // Create custom token for client-side login
    const customToken = await auth.createCustomToken(userRecord.uid);
    res.json({ token: customToken, uid: userRecord.uid });
  });

  // 3. Subscriptions: Create Order
  app.post('/api/subscriptions/create', async (req, res) => {
    const { planId, email, uid } = req.body;
    if (!planId || !email || !uid) return res.status(400).json({ error: 'Plan ID, email, and UID are required' });

    const plans: Record<string, any> = {
      'day': { basePrice: 99, name: 'Starter Day Pass' },
      'week': { basePrice: 249, name: 'Power Week Pass' },
      'month': { basePrice: 599, name: 'Pro Month Pass' },
      'year': { basePrice: 5999, name: 'Elite Year Pass' },
      'credit_deep_1': { basePrice: 99, name: '1 Deep Scan Credit' },
      'credit_deep_3': { basePrice: 249, name: '3 Deep Scan Credits' },
      'credit_deep_5': { basePrice: 399, name: '5 Deep Scan Credits' },
      'credit_deep_10': { basePrice: 699, name: '10 Deep Scan Credits' },
      'credit_std_25': { basePrice: 99, name: '25 Standard Scan Credits' },
      'credit_std_100': { basePrice: 299, name: '100 Standard Scan Credits' }
    };

    const plan = plans[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid plan ID' });

    const gstRate = 0.18;
    const gstAmount = Math.round(plan.basePrice * gstRate);
    const totalAmount = (plan.basePrice + gstAmount) * 100; // In paise

    try {
      const order = await razorpay.orders.create({
        amount: totalAmount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: { 
          planId, 
          planName: plan.name,
          basePrice: plan.basePrice,
          gstAmount,
          email, 
          uid 
        }
      });
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
      });
    } catch (e) {
      console.error('Razorpay Order Error:', e);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // 4. Webhooks: Razorpay
  app.post('/api/webhooks/razorpay', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret';
    const signature = req.headers['x-razorpay-signature'] as string;

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'order.paid' || event === 'payment.captured') {
      const order = payload.order?.entity || payload.payment?.entity;
      const email = order?.notes?.email;
      const uid = order?.notes?.uid;
      const planId = order?.notes?.planId;

      if (email && uid && planId) {
        if (planId.startsWith('credit_')) {
          // Handle credit packs
          const creditMap: Record<string, { type: string, amount: number }> = {
            'credit_deep_1': { type: 'deep', amount: 1 },
            'credit_deep_3': { type: 'deep', amount: 3 },
            'credit_deep_5': { type: 'deep', amount: 5 },
            'credit_deep_10': { type: 'deep', amount: 10 },
            'credit_std_25': { type: 'standard', amount: 25 },
            'credit_std_100': { type: 'standard', amount: 100 }
          };
          const credit = creditMap[planId];
          if (credit) {
            const userRef = db.collection('users').doc(uid);
            await db.runTransaction(async (t) => {
              const doc = await t.get(userRef);
              const data = doc.data() || {};
              const currentCredits = data.credits || { deep: 0, standard: 0 };
              t.set(userRef, {
                credits: {
                  deep: (currentCredits.deep || 0) + (credit.type === 'deep' ? credit.amount : 0),
                  standard: (currentCredits.standard || 0) + (credit.type === 'standard' ? credit.amount : 0)
                }
              }, { merge: true });
            });
            
            await db.collection('audit_logs').add({
              email,
              uid,
              event: 'credit_purchased',
              details: `Pack: ${planId}, Added: ${credit.amount} ${credit.type}`,
              timestamp: admin.firestore.Timestamp.now()
            });
          }
        } else {
          // Handle subscriptions
          const durationMap: Record<string, number> = {
            'day': 1,
            'week': 7,
            'month': 30,
            'year': 365
          };

          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + (durationMap[planId] || 0));

          await db.collection('subscriptions').doc(uid).set({
            email,
            uid,
            planId,
            status: 'active',
            startDate: startDate.toISOString(),
            endDate: admin.firestore.Timestamp.fromDate(endDate),
            basePrice: Number(order?.notes?.basePrice || 0),
            gstAmount: Number(order?.notes?.gstAmount || 0),
            finalAmount: order.amount / 100,
            usedScans: { quick: 0, standard: 0, deep: 0 },
            updatedAt: admin.firestore.Timestamp.now()
          }, { merge: true });

          await db.collection('audit_logs').add({
            email,
            uid,
            event: 'subscription_activated',
            details: `Plan: ${planId}, Order: ${order.id}`,
            timestamp: admin.firestore.Timestamp.now()
          });
        }
      }
    }

    res.json({ status: 'ok' });
  });

  // 5. Subscriptions: Status
  app.get('/api/subscriptions/status', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const snapshot = await db.collection('subscriptions')
      .where('email', '==', email)
      .where('status', '==', 'active')
      .get();

    if (snapshot.empty) {
      return res.json({ active: false });
    }

    // Check if any subscription is still valid
    const now = new Date();
    const activeSub = snapshot.docs.find(doc => {
      const data = doc.data();
      return new Date(data.endDate) > now;
    });

    if (activeSub) {
      res.json({ active: true, plan: activeSub.data() });
    } else {
      res.json({ active: false });
    }
  });

  // 6. Proxy: GitHub API
  app.get('/api/proxy/github/*', async (req, res) => {
    const githubPath = req.params[0];
    const queryParams = req.query;
    
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const response = await axios.get(`https://api.github.com/${githubPath}`, { 
        headers,
        params: queryParams
      });
      res.json(response.data);
    } catch (error: any) {
      console.error(`[PROXY] GitHub API Error (${githubPath}):`, error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // 7. Proxy: GitHub Zip Download
  app.get('/api/proxy/github-zip', async (req, res) => {
    const { owner, repo, branch } = req.query;
    if (!owner || !repo || !branch) return res.status(400).json({ error: 'Owner, repo, and branch are required' });

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`, {
        headers,
        responseType: 'arraybuffer',
        maxRedirects: 5
      });

      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', `attachment; filename=${repo}-${branch}.zip`);
      res.send(Buffer.from(response.data));
    } catch (error: any) {
      console.error('[PROXY] GitHub Zip Error:', error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // --- Vite / Static Assets ---

  if (process.env.NODE_ENV !== 'production') {
    console.log('[SERVER] Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[SERVER] Vite middleware initialized');
  } else {
    console.log('[SERVER] Serving static files from dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Server running on http://localhost:${PORT}`);
  });
}

startServer();
