# PRD — WP Test Tool (Electron Desktop App)

**Product:** WP Test Tool  
**Author:** Nguyen Duc Minh Trung — minhtrung4367@gmail.com  
**Copyright:** © 2025 Nguyen Duc Minh Trung  
**Version:** 1.0.0  
**Platform:** Desktop (Windows / macOS / Linux) — Electron  
**Stack:** Electron 34 · React 19 · TypeScript · Vite · Tailwind CSS v4

---

## 1. Tổng quan

Tool kiểm tra giao diện CSS/layout website WordPress sau mỗi lần merge code. Thay vì mở từng trang thủ công trên trình duyệt, developer dùng app này để quản lý danh sách URL, preview trực tiếp trong app, ghi chú lỗi và theo dõi tiến độ test.

---

## 2. Người dùng mục tiêu

Frontend/Fullstack developer làm việc với WordPress local (LocalWP, XAMPP, MAMP...), cần test lại toàn bộ trang sau khi merge CSS/code.

---

## 3. Kiến trúc kỹ thuật

### Tech Stack

| Layer         | Thư viện                            | Ghi chú                                           |
| ------------- | ----------------------------------- | ------------------------------------------------- |
| Runtime       | Electron 34.x                       | Main + Renderer process                           |
| Bundler       | Vite + electron-vite (latest)       | Dev server + HMR                                  |
| UI Framework  | React 19 + TypeScript 5.8+ (strict) |                                                   |
| Styling       | Tailwind CSS v4                     | Utility-first                                     |
| State         | Zustand 5.x                         | Global store cho renderer                         |
| Storage       | electron-store 10.x                 | Persist data sang JSON                            |
| Icons         | lucide-react                        | SVG icon set                                      |
| Toast         | sonner                              | Notification                                      |
| UI Primitives | @radix-ui + Tailwind                | Modal, dropdown, tooltip                          |
| Web Renderer  | WebContentsView                     | Thay thế BrowserView (deprecated từ Electron 30+) |
| Build         | electron-builder (latest)           | Package ra .exe / .dmg / .AppImage                |

> ⚠️ **Lưu ý:** Không dùng `<webview>` tag và không dùng `BrowserView` — cả hai đều deprecated. Dùng `WebContentsView` cho phần preview trang web.

### Cấu trúc file

```
wp-test-tool/
├── assets/
│   ├── icon.icns
│   ├── icon.ico
│   ├── icon.png
│   └── logo.png
├── src/
│   ├── main/
│   │   ├── index.ts         # Main process entry
│   │   ├── ipc.ts           # IPC handlers
│   │   └── store.ts         # electron-store setup
│   ├── preload/
│   │   └── index.ts         # Context bridge
│   └── renderer/
│       ├── index.html
│       ├── main.tsx         # React entry
│       ├── App.tsx
│       ├── store/           # Zustand stores
│       ├── components/      # React components
│       ├── screens/         # Màn hình chính
│       └── splash.html      # Splash screen
├── electron.vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Data storage (electron-store)

- `domain` — string, domain local đang test
- `pages` — array các page object
- `categories` — array tên category
- `testState` — object trạng thái test per page id
- `screenshots` — object lưu path ảnh per page id
- `theme` — "light" | "dark" | "system"
- `windowBounds` — lưu kích thước cửa sổ

---

## 4. Tính năng

### 4.1 Domain Management

- Ô nhập domain local (vd: `http://vietnambooking.local`)
- Nút **Lưu** riêng biệt — nhấn mới save, không auto-save theo timeout
- Sau khi lưu: toàn bộ URL trong sidebar cập nhật ngay lập tức
- Nếu đang xem page nào đó → reload webview với domain mới luôn
- Hiện toast "Domain đã cập nhật"
- Tự động trim whitespace và bỏ trailing slash

### 4.2 Quản lý Pages (CRUD)

- **Thêm trang:** modal nhập Tên, Slug/Path, Category
- **Sửa trang:** click icon edit trên từng item
- **Xoá trang:** có confirm dialog
- Mỗi page gồm: `id`, `title`, `slug`, `category`
- Phím tắt: `Cmd/Ctrl+N` mở modal thêm trang mới

### 4.3 Quản lý Categories

- Tạo / xoá category tùy ý
- Category mặc định: "General"
- Xoá category → pages thuộc category đó chuyển về "General"
- Hiển thị dạng pill filter ở đầu sidebar, có đếm số trang

### 4.4 Preview In-App (WebContentsView)

- Hiển thị trang web ngay trong app bằng Electron `WebContentsView` (không dùng `<webview>`)
- `WebContentsView` được nhúng vào main window, resize theo layout
- Nút điều hướng: Back, Forward, Reload
- Hiện URL hiện tại trên thanh toolbar
- Tự động đánh dấu "tested" khi page load xong
- **Loading indicator:** spinner overlay khi đang load, skeleton animation trên URL bar
- **Error page:** hiện thông báo rõ khi load lỗi

### 4.5 Responsive Check

- 3 chế độ xem: Desktop (100%) / Tablet (768px) / Mobile (375px)
- Toggle bằng 3 nút icon SVG rõ ràng:
  - Desktop: icon monitor
  - Tablet: icon tablet portrait
  - Mobile: icon điện thoại
- Active state: nền xanh blue + border + icon xanh
- Inactive: icon xám, hover subtle

### 4.6 Check 404

- Nút "Check 404" kiểm tra HTTP status tất cả URL trong danh sách
- Dùng `net.request` từ Electron main process (không bị CORS)
- Chạy song song, hiện trạng thái từng page theo màu:
  - Xám: chưa check
  - Xanh: OK (< 400)
  - Đỏ: lỗi (≥ 400 hoặc network error)
  - Vàng nhấp nháy: đang kiểm tra
- Hiện HTTP status badge trên webview toolbar khi đang xem trang
- Toast thông báo tổng kết sau khi check xong

### 4.7 Screenshot

- Nút **Screenshot** chụp view hiện tại bằng `webContentsView.webContents.capturePage()`
- Lưu file PNG vào thư mục `screenshots/` trong userData
- Lưu tối đa 10 ảnh gần nhất per page
- Hiển thị thumbnail hàng ngang ở bottom panel
- Nút "Mở thư mục" → mở folder screenshots trong Finder/Explorer

### 4.8 Ghi chú lỗi

- Textarea ở bottom panel, nhập mô tả lỗi CSS/layout per page
- Lưu bằng nút **Lưu** hoặc `Cmd/Ctrl+Enter`
- Page có ghi chú hiện border đỏ bên trái trong sidebar
- Badge đếm số trang có lỗi hiển thị ở stats bar

### 4.9 Trạng thái Test & Progress

- Progress bar ở đầu sidebar: % trang đã tested
- Stats hiện: X / Y tested, Z lỗi
- Nút **Reset** — xóa toàn bộ trạng thái (có confirm)

### 4.10 Import / Export

- **Export JSON:** lưu ra file `pages.json` gồm domain + categories + pages
- **Import JSON:** load file JSON vào app, thay thế data hiện tại
- Format JSON:

```json
{
  "domain": "http://vietnambooking.local",
  "categories": ["Vé máy bay", "Du lịch"],
  "pages": [
    { "id": "1", "title": "Trang chủ", "slug": "/", "category": "General" }
  ]
}
```

### 4.11 Export Report

- Xuất file `.txt` tóm tắt kết quả test
- Gồm: domain, thời gian, từng page với status (OK / lỗi / chưa test), HTTP code, ghi chú
- Mở dialog chọn nơi lưu

### 4.12 Mở trong Browser

- Nút **Mở browser ↗** trên toolbar → mở URL hiện tại trong trình duyệt mặc định bằng `shell.openExternal`

---

## 5. UI / UX

### 5.1 Layout tổng thể

```
┌─────────────────────────────────────────────────────┐
│ Titlebar: Logo · Domain input · Lưu · Actions · Theme│
├──────────────┬──────────────────────────────────────┤
│              │ Webview Toolbar (nav + viewport)      │
│   Sidebar    ├──────────────────────────────────────┤
│  (260px)     │                                      │
│              │        Webview / Preview             │
│  - Progress  │                                      │
│  - Filters   ├──────────────────────────────────────┤
│  - Page list │ Bottom: Ghi chú lỗi | Screenshots    │
│              │                                      │
│  [+Thêm]     │                                      │
└──────────────┴──────────────────────────────────────┘
```

### 5.2 Typography

- Font hệ thống: `-apple-system, 'Segoe UI', system-ui, sans-serif`
- Font mono: `'SF Mono', 'Fira Code', 'Cascadia Code', monospace`
- Kích thước tối thiểu: **12px** — không nhỏ hơn ở bất kỳ element nào
- Body text / label: **14px**
- Button: **14px**
- Page title trong sidebar: **14px**, font-weight 500
- Page slug: **12px**, mono
- Badge, stat nhỏ: **12px**

### 5.3 Color System — Blue Primary

| Token            | Light   | Dark    |
| ---------------- | ------- | ------- |
| Primary          | #2563EB | #3B82F6 |
| Primary hover    | #1D4ED8 | #2563EB |
| Primary active   | #1E40AF | #1D4ED8 |
| Primary bg light | #EFF6FF | #1E3A5F |
| Primary border   | #BFDBFE | #3B82F6 |
| Primary text     | #1E40AF | #93C5FD |
| Success (tested) | #1D9E75 | #5DCAA5 |
| Error            | #E24B4A | #F09595 |
| Warning          | #BA7517 | #EF9F27 |

Blue primary áp dụng cho: progress bar, active sidebar border, btn-primary, cat-pill active, tested indicator, HTTP status OK badge.

### 5.4 Buttons

| Loại        | Height | Font       | Style                                             |
| ----------- | ------ | ---------- | ------------------------------------------------- |
| btn-primary | 32px   | 14px / 500 | Blue solid, hover scale(1.02), active scale(0.98) |
| btn regular | 30px   | 13px       | Border outline, hover bg                          |
| btn-sm      | 26px   | 12px       | Border outline                                    |
| btn-danger  | 30px   | 13px       | Text đỏ, hover red bg                             |

Transition: `all 150ms ease` trên tất cả buttons.

Buttons nổi bật (primary): "Lưu" (domain), "+ Thêm trang".

### 5.5 Theme — 3 chế độ

- **Light / Dark / System** — lưu vào electron-store
- Nút toggle ở góc phải titlebar, icon từ lucide-react: `Sun` / `Moon` / `Monitor`
- Click → cycle qua 3 chế độ
- System: follow `prefers-color-scheme` của OS
- Manual: Tailwind dark mode class trên `<html>`
- `nativeTheme.themeSource` set tương ứng ở main process
- Apply trước khi window show → không flash
- Transition `background 200ms, color 200ms` khi switch

### 5.6 Màn hình Theme Settings

Màn hình riêng biệt (modal hoặc page), mở từ nút Settings hoặc menu.

```
┌─────────────────────────────────────────┐
│  Appearance                        ✕   │
├─────────────────────────────────────────┤
│                                         │
│  Theme                                  │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │          │ │          │ │          ││
│  │  [Sun]   │ │  [Moon]  │ │ [Monitor]││
│  │          │ │          │ │          ││
│  │  Light   │ │   Dark   │ │  System  ││
│  └──────────┘ └──────────┘ └──────────┘│
│       ↑ active card có border blue      │
│                                         │
│  Preview                                │
│  ┌───────────────────────────────────┐  │
│  │  [live mini preview của theme]    │  │
│  │  sidebar + card + button sample   │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Chi tiết:**

- 3 card chọn theme: Light / Dark / System — mỗi card có icon lucide + label + mô tả ngắn
- Card đang active: border blue `#2563EB`, background tint `#EFF6FF` (light) / `#1E3A5F` (dark)
- Card inactive: border muted, hover subtle
- Phần **Preview** bên dưới: mini mockup live thay đổi ngay khi chọn (không cần save)
- Thay đổi apply ngay lập tức toàn app, tự động lưu vào electron-store
- Không có nút Save riêng — chọn là lưu luôn
- Có thể mở từ: nút icon góc phải titlebar hoặc menu Help → Appearance

### 5.7 Splash Screen

- Hiện khi app khởi động, trước khi main window load
- File: `src/renderer/splash.html` (static, không dùng React để load nhanh)
- Nội dung: logo từ `assets/logo.png` căn giữa + tên app + animated progress bar mỏng ở dưới
- Window: frameless, non-resizable, centered, 400×300, không có taskbar entry
- Tự đóng sau khi main window ready (tối thiểu 2 giây hiển thị)

### 5.8 About Window

- Mở từ menu Help → "About WP Test Tool"
- Window nhỏ: 400×320, frameless, centered
- Nội dung: logo, tên app, version (từ package.json), tác giả, email, copyright
- Nút Close để đóng
- Theo theme hiện tại của app

### 5.9 Native App Menu

- **macOS:** menu bar native
- **Windows/Linux:** menubar trong cửa sổ
- Cấu trúc:
  - **File:** Import JSON, Export JSON, Export Report, Separator, Quit
  - **Edit:** standard (Undo, Redo, Cut, Copy, Paste)
  - **Help:** Appearance (mở Theme Settings), About WP Test Tool

---

## 6. Keyboard Shortcuts

| Phím                            | Action         |
| ------------------------------- | -------------- |
| `Cmd/Ctrl + N`                  | Thêm trang mới |
| `Cmd/Ctrl + R`                  | Reload webview |
| `Cmd/Ctrl + Enter` (trong note) | Lưu ghi chú    |
| `Escape`                        | Đóng modal     |

---

## 7. Package & Build

### package.json metadata

```json
{
  "author": {
    "name": "Nguyen Duc Minh Trung",
    "email": "minhtrung4367@gmail.com"
  },
  "build": {
    "appId": "com.vnbk.wptesttool",
    "productName": "WP Test Tool",
    "copyright": "© 2025 Nguyen Duc Minh Trung",
    "icon": "assets/icon"
  }
}
```

### Icon files cần có

| File               | Dùng cho                     |
| ------------------ | ---------------------------- |
| `assets/icon.icns` | macOS app icon               |
| `assets/icon.ico`  | Windows installer + taskbar  |
| `assets/icon.png`  | Linux (512×512px)            |
| `assets/logo.png`  | Splash screen + About window |

### Build commands

```bash
npm run build:mac    # → dist/*.dmg
npm run build:win    # → dist/*.exe (NSIS installer)
npm run build:linux  # → dist/*.AppImage
```

> **Lưu ý Windows:** Chạy lệnh build với quyền Administrator, hoặc bật Developer Mode trong Settings → System → For Developers để tránh lỗi symbolic link khi giải nén winCodeSign.

---

## 8. Data mẫu — VietnamBooking

File `vietnambooking-pages.json` đi kèm app, gồm 63 trang phân vào 7 categories:

- Vé máy bay (12 trang)
- Du lịch (14 trang)
- Khách sạn (6 trang)
- Visa (4 trang)
- Combo (12 trang)
- Vé quốc tế (13 trang)
- Tiện ích (3 trang)

---

## 9. Out of scope (v1.0)

- Auto updater
- Sync cloud / team sharing
- Diff screenshot tự động (so sánh before/after)
- Plugin / extension system
