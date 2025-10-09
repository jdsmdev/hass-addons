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

app.post('/roomba/clean', async (req, res) => {
  if (!robotReady) {
    return res.status(503).json({ error: 'Roomba not ready yet' });
  }

  const { rooms } = req.body;
  if (!rooms?.length) {
    return res.status(400).json({ error: 'rooms array required' });
  }

  try {
    await cleanRoom(rooms);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ cleanRoom failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/roomba/pause', async (req, res) => {
  if (!robotReady) {
    return res.status(503).json({ error: 'Roomba not ready yet' });
  }

  try {
    await roomba.pause();
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ pause failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/roomba/resume', async (req, res) => {
  if (!robotReady) {
    return res.status(503).json({ error: 'Roomba not ready yet' });
  }

  try {
    await roomba.resume();
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ resume failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/roomba/stop', async (req, res) => {
  if (!robotReady) {
    return res.status(503).json({ error: 'Roomba not ready yet' });
  }

  try {
    await roomba.stop();
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ stop failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/roomba/dock', async (req, res) => {
  if (!robotReady) {
    return res.status(503).json({ error: 'Roomba not ready yet' });
  }

  try {
    await roomba.dock();
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ dock failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`HTTP bridge to send commands to Node.js scripts running on port ${PORT}`));
