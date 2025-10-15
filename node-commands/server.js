require('dotenv').config();

const express = require('express');
const dorita980 = require('dorita980');

const fs = require('fs');

// Load add-on options
const config = JSON.parse(fs.readFileSync('/data/options.json', 'utf8'));

const {
  BLID,
  PASSWORD,
  ROBOT_IP,
  PMAP_ID,
  USER_PMAPV_ID,
  PORT
} = config;

const app = express();
app.use(express.json());

const roomba = new dorita980.Local(
  BLID,
  PASSWORD,
  ROBOT_IP
);
let robotReady = false;

roomba.on('connect', () => {
  console.log('✅ Connected to Roomba');
  robotReady = true;
});

roomba.on('close', () => {
  console.warn('⚠️ Roomba connection closed');
  robotReady = false;
});

roomba.on('error', (err) => {
  console.error('❌ Roomba error:', err);
  robotReady = false;
});

const cleanRoom = async (rooms) => {
  console.log('🧹 Sending cleanRoom command for rooms:', rooms);
  const regions = rooms.map(({ id, mop }) => ({
    region_id: `${id}`,
    type: 'rid',
    params: mop ? {
      carpetBoost: true,
      noAutoPasses: true,
      operatingMode: 6,
      padWetness: { disposable: 2, reusable: 2 },
      swScrub: 0,
      twoPass: false,
      vacHigh: false
    } : {
      carpetBoost: true,
      noAutoPasses: true,
      operatingMode: 2,
      twoPass: false,
      vacHigh: false
    },
  }));

  await roomba.cleanRoom({
    pmap_id: PMAP_ID,
    user_pmapv_id: USER_PMAPV_ID,
    regions
  });
  console.log('✅ Command sent successfully');
};

const logRequest = (req) => {
  console.log(`➡️ ${req.method} ${req.url} - Body:`, req.body);
};

const respondWith = (res, statusCode, message) => {
  console.log(`⬅️ Responding with ${statusCode}: ${message}`);
  res.status(statusCode).json({ ok: statusCode < 300, message });
};

app.post('/roomba/clean', async (req, res) => {
  logRequest(req);
  if (!robotReady) {
    return respondWith(res, 503, 'Roomba not ready yet');
  }

  const { rooms } = req.body;
  if (!rooms?.length) {
    return respondWith(res, 400, 'rooms array required');;
  }

  try {
    await cleanRoom(rooms);
    respondWith(res, 200, 'Cleaning started');
  } catch (err) {
    console.error('❌ Cleaning failed:', err);
    respondWith(res, 500, err.message);
  }
});

app.post('/roomba/pause', async (req, res) => {
  if (!robotReady) {
    return respondWith(res, 503, 'Roomba not ready yet');
  }

  try {
    await roomba.pause();
    respondWith(res, 200, 'Paused');
  } catch (err) {
    console.error('❌ pause failed:', err);
    respondWith(res, 500, err.message);
  }
});

app.post('/roomba/resume', async (req, res) => {
  if (!robotReady) {
    return respondWith(res, 503, 'Roomba not ready yet');
  }

  try {
    await roomba.resume();
    respondWith(res, 200, 'Resumed');
  } catch (err) {
    console.error('❌ resume failed:', err);
    respondWith(res, 500, err.message);
  }
});

app.post('/roomba/stop', async (req, res) => {
  if (!robotReady) {
    return respondWith(res, 503, 'Roomba not ready yet');
  }

  try {
    await roomba.stop();
    respondWith(res, 200, 'Stopped');
  } catch (err) {
    console.error('❌ stop failed:', err);
    respondWith(res, 500, err.message);
  }
});

app.post('/roomba/dock', async (req, res) => {
  if (!robotReady) {
    return respondWith(res, 503, 'Roomba not ready yet');
  }

  try {
    await roomba.dock();
    respondWith(res, 200, 'Docked');
  } catch (err) {
    console.error('❌ dock failed:', err);
    respondWith(res, 500, err.message);
  }
});

app.listen(PORT, () => console.log(`HTTP bridge to send commands to Node.js scripts running on port ${PORT}`));
