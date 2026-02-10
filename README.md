# Hero-SMS Dashboard

แดชบอร์ดสำหรับจัดการบัญชีและหมายเลขของบริการ [hero-sms.com](https://hero-sms.com) แบบใช้งานส่วนตัว เน้นความปลอดภัยและการใช้งานที่ง่าย

## ฟีเจอร์หลัก
- **Dashboard**: ดูยอดเงินคงเหลือ (Balance) และสถานะบัญชี
- **Prices**: ตรวจสอบราคาและจำนวนหมายเลขที่ว่างของแต่ละบริการและประเทศ
- **Numbers**: ซื้อหมายเลขใหม่และจัดการรายการที่กำลังใช้งาน (Active Orders)
- **Messages**: รับ SMS และดูรหัสยืนยัน (OTP) แบบ Real-time
- **Settings**: ตั้งค่า API Key แบบปลอดภัย (In-memory session)

## ความปลอดภัย (Security)
- **No API Key in Code**: ไม่มีการเก็บ API Key ไว้ในซอร์สโค้ด
- **Server Proxy**: Browser ไม่เรียก API ของ Hero-SMS โดยตรง เพื่อป้องกันการรั่วไหลของ Key
- **Personal Mode**: รองรับการกรอก API Key ผ่านหน้าเว็บและเก็บไว้ใน Session (HTTP-only cookie)
- **Rate Limiting**: มีระบบป้องกันการเรียกใช้งานถี่เกินไป

## การติดตั้งและรันโปรเจกต์

### 1. เตรียมความพร้อม
- ติดตั้ง [Node.js](https://nodejs.org/) (แนะนำ v18 ขึ้นไป)
- สมัครสมาชิกและรับ API Key จาก [hero-sms.com](https://hero-sms.com)

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment (Optional)
สร้างไฟล์ `server/.env` โดยคัดลอกมาจาก `server/.env.example`:
```bash
cp server/.env.example server/.env
```
และใส่ `HERO_SMS_API_KEY` ของคุณ (หรือจะกรอกผ่านหน้า Settings ของเว็บก็ได้)

### 4. รันโปรเจกต์ (Development)
```bash
npm run dev
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

## โครงสร้างโปรเจกต์
- `/server`: Node.js + Express + TypeScript (API Proxy & Logic)
- `/web`: React + Vite + TailwindCSS (UI/UX)

## Disclaimer
แอปพลิเคชันนี้สร้างขึ้นเพื่อใช้จัดการบัญชีและหมายเลขที่คุณมีสิทธิ์เข้าถึง และเพื่อการทดสอบระบบเท่านั้น ห้ามนำไปใช้ในทางที่ผิดกฎหมายหรือละเมิดเงื่อนไขการใช้งานของบริการบุคคลที่สาม
