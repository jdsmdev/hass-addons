require('dotenv').config();

const express = require('express');
const dorita980 = require('dorita980');

const fs = require('fs');

// Load add-on options
const config = JSON.parse(fs.readFileSync('/data/options.json', 'utf8'));

console.log('Loaded add-on config:', config);

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
  const regions = rooms.map(id => ({
    region_id: `${id}`,
    type: 'rid',
    params: { carpetBoost: true, noAutoPasses: true, operatingMode: 2, twoPass: false, vacHigh: false },
  }));

  await roomba.cleanRoom({
    pmap_id: PMAP_ID,
    user_pmapv_id: USER_PMAPV_ID,
    regions
  });
  console.log('✅ Command sent successfully');
};

app.post('/clean', async (req, res) => {
  if (!robotReady) {
    return res.status(503).json({ error: 'Roomba not ready yet' });
  }

  const { rooms } = req.body;
  if (!rooms?.length) {
    return res.status(400).json({ error: 'rooms array required' });
  }

  try {
    await cleanRoom(rooms);
    res.json({ ok: true, cleaned: rooms });
  } catch (err) {
    console.error('❌ cleanRoom failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log('HTTP bridge to send commands to Node.js scripts running on port 3000'));
