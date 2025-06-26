# Hệ thống Quản lý Cổng cửa IoT

## Mô tả
Hệ thống quản lý cổng cửa thông minh sử dụng cảm biến chuyển động PIR, vi điều khiển Arduino (ESP8266), backend Node.js/Express, frontend ReactJS và lưu trữ trạng thái/lịch sử trên MySQL.

- **Tự động:** Khi phát hiện chuyển động, Arduino sẽ mở cửa, bật đèn và gửi trạng thái về server.
- **Chủ động:** Người dùng có thể điều khiển cửa/đèn từ xa qua giao diện web/app.
- **Lịch sử:** Mọi thay đổi trạng thái đều được lưu lại, có thể xem lại trên giao diện.

## Kiến trúc tổng thể
- **Arduino/ESP8266:** Đọc cảm biến PIR, điều khiển relay cửa/đèn, gửi trạng thái về backend qua HTTP.
- **Backend (Node.js/Express):** Nhận/gửi trạng thái, lưu lịch sử vào MySQL, cung cấp API cho frontend, cập nhật real-time qua WebSocket.
- **Frontend (ReactJS):** Giao diện điều khiển, xem trạng thái real-time, xem lịch sử hoạt động.
- **Database (MySQL):** Lưu trạng thái hiện tại và lịch sử hoạt động.

## Sơ đồ
```
[Arduino] <---WiFi---> [Node.js Backend] <---WebSocket/API---> [ReactJS Frontend]
                                 |
                              [MySQL]
```

## Hướng dẫn cài đặt
### 1. MySQL
Tạo database và các bảng:
```sql
CREATE DATABASE gate_management;
USE gate_management;
CREATE TABLE status (
  id INT PRIMARY KEY,
  door VARCHAR(10),
  light VARCHAR(10)
);
INSERT INTO status (id, door, light) VALUES (1, 'Đóng', 'Tắt');

CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time DATETIME DEFAULT CURRENT_TIMESTAMP,
  door VARCHAR(10),
  light VARCHAR(10),
  source VARCHAR(20)
);
```

### 2. Backend
```sh
cd backend
npm install
node index.js
```
- Sửa thông tin kết nối MySQL trong `index.js` cho phù hợp.

### 3. Frontend
```sh
cd frontend
npm install
npm start
```
- Truy cập [http://localhost:3000](http://localhost:3000)

### 4. Arduino/ESP8266
- Nạp code trong `adurino/gate_control.ino` lên board.
- Sửa SSID, password WiFi và địa chỉ server cho đúng.

## Tính năng nổi bật
- Điều khiển cửa/đèn tự động và thủ công.
- Xem trạng thái real-time trên web/app.
- Lưu và xem lại lịch sử hoạt động.
- Giao diện hiện đại, dễ sử dụng.

## Liên hệ
- Tác giả: [Tên bạn]
- Email: [Email của bạn]
