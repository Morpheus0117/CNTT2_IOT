import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MySQL (YÊU CẦU: đã có database gate_management và bảng status)
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root', // đổi user nếu cần
  password: '123456', // đổi password nếu cần
  database: 'gate_management'
});

// ---
// YÊU CẦU: Tạo bảng trước bằng lệnh sau trong MySQL:
// CREATE TABLE status (
//   id INT PRIMARY KEY,
//   door VARCHAR(10),
//   light VARCHAR(10)
// );
// INSERT INTO status (id, door, light) VALUES (1, 'Đóng', 'Tắt');
// ---

// YÊU CẦU: Tạo thêm bảng history trong MySQL:
// CREATE TABLE history (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   time DATETIME DEFAULT CURRENT_TIMESTAMP,
//   door VARCHAR(10),
//   light VARCHAR(10),
//   source VARCHAR(20)
// );

// Lấy trạng thái từ DB
async function getStatus() {
  const [rows] = await db.query('SELECT door, light FROM status WHERE id=1');
  return rows[0];
}
// Cập nhật trạng thái vào DB
async function setStatus({ door, light }) {
  if (door !== undefined)
    await db.query('UPDATE status SET door=? WHERE id=1', [door]);
  if (light !== undefined)
    await db.query('UPDATE status SET light=? WHERE id=1', [light]);
}

// Hàm lưu lịch sử
async function saveHistory({ door, light, source }) {
  await db.query('INSERT INTO history (door, light, source) VALUES (?, ?, ?)', [door, light, source]);
}

app.get('/api/status', async (req, res) => {
  const status = await getStatus();
  res.json(status);
});

app.post('/api/door', async (req, res) => {
  const status = await getStatus();
  const newDoor = status.door === 'Mở' ? 'Đóng' : 'Mở';
  await setStatus({ door: newDoor });
  await saveHistory({ door: newDoor, light: status.light, source: 'app' });
  broadcastStatus();
  res.json({ door: newDoor });
});

app.post('/api/light', async (req, res) => {
  const status = await getStatus();
  const newLight = status.light === 'Bật' ? 'Tắt' : 'Bật';
  await setStatus({ light: newLight });
  await saveHistory({ door: status.door, light: newLight, source: 'app' });
  broadcastStatus();
  res.json({ light: newLight });
});

// API nhận trạng thái từ Arduino và lưu lịch sử
app.post('/api/status', async (req, res) => {
  const { door, light } = req.body;
  await setStatus({ door, light });
  await saveHistory({ door, light, source: 'arduino' });
  broadcastStatus();
  res.json({ success: true });
});

// API lấy lịch sử hoạt động
app.get('/api/history', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM history ORDER BY time DESC LIMIT 100');
  res.json(rows);
});

const server = app.listen(3001, () => {
  console.log('Backend listening on port 3001');
});

const wss = new WebSocketServer({ server });

async function broadcastStatus() {
  const status = await getStatus();
  const data = JSON.stringify(status);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

wss.on('connection', async ws => {
  const status = await getStatus();
  ws.send(JSON.stringify(status));
}); 