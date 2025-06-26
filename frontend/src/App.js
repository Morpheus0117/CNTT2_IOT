import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  padding: 32,
  maxWidth: 500,
  margin: '40px auto',
  textAlign: 'center',
  fontFamily: 'Segoe UI, Arial, sans-serif',
};
const statusStyle = {
  fontSize: 22,
  margin: '16px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};
const buttonStyle = {
  fontSize: 18,
  padding: '10px 28px',
  borderRadius: 8,
  border: 'none',
  background: '#1976d2',
  color: '#fff',
  marginTop: 12,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const buttonOff = {
  ...buttonStyle,
  background: '#757575',
};
const iconStyle = { fontSize: 28 };
const tabStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: 16,
  marginBottom: 24,
};
const tabBtn = isActive => ({
  ...buttonStyle,
  background: isActive ? '#1976d2' : '#e3f2fd',
  color: isActive ? '#fff' : '#1976d2',
  boxShadow: isActive ? '0 2px 8px #1976d2aa' : 'none',
});

function StatusIcon({ type, value }) {
  if (type === 'door') {
    return value === 'Mở' ? (
      <span style={iconStyle} role="img" aria-label="door-open">🚪</span>
    ) : (
      <span style={iconStyle} role="img" aria-label="door-closed">🚪🔒</span>
    );
  }
  if (type === 'light') {
    return value === 'Bật' ? (
      <span style={iconStyle} role="img" aria-label="light-on">💡</span>
    ) : (
      <span style={iconStyle} role="img" aria-label="light-off">💡❌</span>
    );
  }
  return null;
}

function App() {
  const [door, setDoor] = useState('Đóng');
  const [light, setLight] = useState('Tắt');
  const [tab, setTab] = useState('control');
  const [history, setHistory] = useState([]);
  const ws = useRef(null);

  // Lấy trạng thái ban đầu từ backend
  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then(res => res.json())
      .then(data => {
        setDoor(data.door);
        setLight(data.light);
      });
  }, []);

  // Kết nối WebSocket để nhận trạng thái thời gian thực
  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDoor(data.door);
      setLight(data.light);
    };
    return () => ws.current && ws.current.close();
  }, []);

  // Gửi lệnh điều khiển lên backend
  const toggleDoor = () => {
    fetch(`${API_URL}/door`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setDoor(data.door));
  };
  const toggleLight = () => {
    fetch(`${API_URL}/light`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setLight(data.light));
  };

  // Lấy lịch sử khi chuyển tab
  useEffect(() => {
    if (tab === 'history') {
      fetch(`${API_URL}/history`)
        .then(res => res.json())
        .then(data => setHistory(data));
    }
  }, [tab]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e3f2fd 0%, #fce4ec 100%)', padding: 0 }}>
      <div style={cardStyle}>
        <div style={tabStyle}>
          <button style={tabBtn(tab === 'control')} onClick={() => setTab('control')}>Điều khiển</button>
          <button style={tabBtn(tab === 'history')} onClick={() => setTab('history')}>Lịch sử</button>
        </div>
        {tab === 'control' && (
          <>
            <h1 style={{ color: '#1976d2', marginBottom: 32 }}>Quản lý Cổng cửa</h1>
            <div style={statusStyle}>
              <StatusIcon type="door" value={door} />
              <span><strong>Cửa:</strong> {door}</span>
            </div>
            <button
              style={door === 'Mở' ? buttonOff : buttonStyle}
              onClick={toggleDoor}
            >
              {door === 'Mở' ? 'Đóng cửa' : 'Mở cửa'}
            </button>
            <div style={{ height: 32 }} />
            <div style={statusStyle}>
              <StatusIcon type="light" value={light} />
              <span><strong>Đèn:</strong> {light}</span>
            </div>
            <button
              style={light === 'Bật' ? buttonOff : buttonStyle}
              onClick={toggleLight}
            >
              {light === 'Bật' ? 'Tắt đèn' : 'Bật đèn'}
            </button>
          </>
        )}
        {tab === 'history' && (
          <>
            <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Lịch sử hoạt động</h2>
            <div style={{ maxHeight: 350, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
                <thead>
                  <tr style={{ background: '#e3f2fd' }}>
                    <th style={{ padding: 8 }}>Thời gian</th>
                    <th style={{ padding: 8 }}>Cửa</th>
                    <th style={{ padding: 8 }}>Đèn</th>
                    <th style={{ padding: 8 }}>Nguồn</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ padding: 8 }}>{new Date(item.time).toLocaleString('vi-VN')}</td>
                      <td style={{ padding: 8 }}>{item.door}</td>
                      <td style={{ padding: 8 }}>{item.light}</td>
                      <td style={{ padding: 8 }}>{item.source}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <div style={{ textAlign: 'center', color: '#888', marginTop: 24, fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <small>© {new Date().getFullYear()} Quản lý Cổng cửa</small>
      </div>
    </div>
  );
}

export default App; 