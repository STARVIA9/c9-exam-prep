# 🎯 วิเคราะห์โครงสร้าง HTML Pattern — c9-exam-prep

## 1. ธีม CSS ที่ใช้ — 2 ธีมหลัก

### Theme A — "Compact Dark" (80% ของหน้าเว็บ)
**ใช้ใน:** policy-projects.html, quizzes.html, competency-c9.html, c9-content.html, risk-management-summary.html, aml-ctf.html, market-conduct.html, corporate-governance.html

```css
:root{--bg:#0f172a;--s:#1e293b;--s2:#334155;--a:#f59e0b;--a2:#10b981;--a3:#3b82f6;--a4:#ef4444;--t:#f1f5f9;--t2:#94a3b8;--b:#475569}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Thai','Sarabun',sans-serif;background:var(--bg);color:var(--t);line-height:1.8}
```

- CSS variables: `--bg` (พื้นหลัง), `--s` (surface/card), `--s2` (surface2/hover), `--a` (accent=gold), `--a2` (green), `--a3` (blue), `--a4` (red), `--t` (text), `--t2` (text dim), `--b` (border)
- compact, inline `<style>` — ไม่มี external CSS
- ใช้ Google Fonts: **Noto Sans Thai** + **Sarabun**

### Theme B — "Dark Elegant" (index.html, financial-ratio-quiz.html)
**ใช้ใน:** index.html, financial-ratio-quiz.html

```css
:root {
  --bg: #070b14;
  --bg2: #0d1425;
  --surface: #131d33;
  --surface2: #1a2740;
  --gold: #d4942f;
  --gold2: #e8b84f;
  --text: #edf2f7;
  --text2: #94a3b8;
  --border: rgba(255,255,255,0.05);
  --radius: 12px;
  --glow: 0 0 60px rgba(212,148,47,0.04);
}
```

- หรูหรากว่า: มี gradient background, animation, glow effects
- เหมาะกับหน้าแรกและหน้า quiz premium

---

## 2. โครงสร้าง Navigation (Theme A — มาตรฐาน)

```html
<nav>
  <h1>🏛️ นโยบายรัฐ</h1>               <!-- หัวข้อ + emoji -->
  <a href="#s16">💰 สป.กษ.</a>        <!-- anchor links ไป section -->
  <a href="#informal">📝 หนี้นอกระบบ</a>
  <a href="#qz">📝 ข้อสอบ</a>
  <a href="c9-content.html" style="margin-left:auto;color:var(--a)">⬅ กลับหน้าหลัก</a>
</nav>
```

**คุณสมบัติ nav:**
- `position: sticky; top: 0; z-index: 100;`
- `background: var(--s); border-bottom: 1px solid var(--b);`
- `padding: 10px 16px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center;`
- `h1` = gold accent (`color: var(--a)`)
- `a` = muted text (`var(--t2)`) → hover → `var(--a)`
- ปุ่มกลับหน้าแรก = `margin-left:auto; color:var(--a)`

**Class naming:**
- `.ct` = container (`max-width: 860-960px; margin:0 auto; padding: 24px 16px 80px;`)

---

## 3. โครงสร้าง Content Page (Policy-Projects Pattern)

```html
<div class="ct">

  <!-- Hero Section -->
  <div class="hero">
    <h1>🏛️ หัวข้อใหญ่</h1>
    <p>คำอธิบายสั้น</p>
    <div>
      <span class="badge gold">💰 แท็ก 1</span>
      <span class="badge red">📝 แท็ก 2</span>
    </div>
  </div>

  <!-- Content Section -->
  <section id="section-id">
    <h2>💰 ชื่อหัวข้อ</h2>          <!-- gold, border-left:4px -->
    <h4>📌 หัวข้อย่อย</h4>         <!-- blue accent -->

    <div class="c info">           <!-- card with blue left border -->
      เนื้อหา...
    </div>

    <div class="c warn">           <!-- card with red left border -->
      ข้อควรระวัง...
    </div>

    <div class="c tip">            <!-- card with gold left border -->
      เทคนิค/เคล็ดลับ...
    </div>

    <table>
      <tr><th>หัวข้อ</th><th>รายละเอียด</th></tr>
      <tr><td>...</td><td>...</td></tr>
    </table>

    <div class="grid2">            <!-- 2-column grid -->
      <div class="c">...</div>
      <div class="c">...</div>
    </div>
  </section>

  <footer>...</footer>
</div>
```

### CSS Class Names ที่ใช้ (Content):

| Class | รายละเอียด |
|-------|-----------|
| `.ct` | Container กลาง (max-width: 960px) |
| `.hero` | หัวหน้าหน้า (border-bottom, center text) |
| `.badge` | Tag/ป้ายกำกับ (border-radius: 14px) |
| `.badge.gold` | ทอง (#78350f bg, #fbbf24 text) |
| `.badge.blue` | น้ำเงิน |
| `.badge.green` | เขียว |
| `.badge.red` | แดง |
| `.badge.purple` | ม่วง |
| `.c` | Content card (bg: var(--s), border, 8px radius) |
| `.c.info` | ขอบซ้ายสีน้ำเงิน |
| `.c.warn` | ขอบซ้ายสีแดง |
| `.c.tip` | ขอบซ้ายสีทอง |
| `.c.ok` | ขอบซ้ายสีเขียว |
| `h2` | gold, border-left: 4px solid var(--a) |
| `h3` | green (var(--a2)) |
| `h4` | blue (var(--a3)) |
| `.grid2` | `display:grid; grid-template-columns:1fr 1fr; gap:10px` |
| `.mnemo` | Mnemonic box (gold border, center) |
| `.scenario` | Scenario box (blue dashed border) |
| `.tag` | Inline tag badge |
| `.table-wrap` | Wrapper สำหรับ table responsive (overflow-x:auto) |
| `details` / `summary` | Accordion (border, gold accent) |

---

## 4. โครงสร้าง Quiz Page — มี 3 ระดับ

### 4A. Quiz แบบง่าย (Theme A — quizzes.html, policy-projects.html)

```html
<section id="qz">
  <h2>📝 ชื่อข้อสอบ</h2>
  <h4>📝 รายละเอียด</h4>
  <div id="qz3"></div>   <!-- container rendered by JS -->
  <div class="sc">
    คะแนน: <span id="sc3">0</span> / 10
    <button class="btn" onclick="rs(3)">🔄 ทำใหม่</button>
  </div>
</section>
```

**JavaScript engine (เหมือนกันทุกหน้า):**

```javascript
// 1. Question data
const Q3 = [
  {q:"คำถาม?", c:["ตัวเลือก1","ตัวเลือก2","ตัวเลือก3","ตัวเลือก4"], a:2},
];
const E3 = ["คำอธิบาย"];

// 2. Render function
function rQ(id, qs, ex) {
  const el = document.getElementById('qz'+id);
  for(let i=0; i<qs.length; i++) {
    let d = qs[i], h = '<div class="q"><p><b>'+(i+1)+'. '+d.q+'</b></p>';
    for(let j=0; j<d.c.length; j++)
      h += '<label><input type="radio" name="q'+id+'_'+i+'" value="'+j+'"><span>'+String.fromCharCode(65+j)+'. '+d.c[j]+'</span></label>';
    h += '<button class="btn" onclick="ck('+id+','+i+','+d.a+')">ตรวจ</button><div class="rb" id="r'+id+'_'+i+'"></div></div>';
    el.innerHTML += h;
  }
}

// 3. Check function
const S = {};
function ck(q, i, a) { /* check answer, lock, show explanation, update score */ }
function up(q) { /* update score display */ }
function rs(q) { /* reset quiz */ }

// 4. Initialize
rQ(3, Q3, E3);
```

**CSS Quiz Classes (ง่าย):**
- `.q` — question container (border, bg: var(--s), 8px radius)
- `.q label` — option label (block, pointer)
- `.q .btn` — check button (gold bg)
- `.rb.ok` — result correct (green)
- `.rb.no` — result wrong (red)
- `.sc` — score display

### 4B. Quiz แบบ Accordion (c9-content.html)

มีโครงสร้าง `.qq` + `details` + `summary` สำหรับ quiz แบบขยาย/ยุบได้

### 4C. Quiz แบบ Premium (financial-ratio-quiz.html)

- Tab navigation (`.tab-nav`, `.tab-btn`, `.tab-panel`)
- Accordion cards (`.card-header` + `.card-body` with max-height transition)
- Progress bar (`.quiz-progress`, `.progress-bar`)
- Option buttons (`.option-btn`) แทน radio
- Score circle (`.score-circle` with SVG ring)
- Animations (fadeInUp, fadeSlideDown)

---

## 5. Responsive Design Pattern

```css
@media(max-width:640px) {
  .grid2 { grid-template-columns: 1fr; }
  nav { padding: 8px 10px; gap: 4px; }
  nav h1 { font-size: 15px; }
  nav a { font-size: 11px; padding: 3px 7px; }
}
```

สำหรับ index.html:
```css
@media (max-width: 700px) {
  .grid { grid-template-columns: 1fr; gap: 12px; }
  .hero { padding: 36px 14px 24px; }
  .hero h1 { font-size: 1.4rem; }
}
```

- nav + container responsive โดยใช้ flex-wrap + media query
- `.table-wrap` สำหรับ table scroll แนวนอน
- `clamp()` สำหรับ font-size
- `grid-template-columns: repeat(auto-fill, minmax(310px, 1fr))` สำหรับ index

---

## 6. การเชื่อมโยงระหว่างหน้า

```
index.html (Landing)
  ├── c9-content.html (Master Content 15 หัวข้อ + สารบัญ)
  │     ├── policy-projects.html (นโยบายรัฐ)
  │     ├── central-content.html (เนื้อหากลาง)
  │     ├── quizzes.html (ข้อสอบรวม 50 ข้อ)
  │     └── (anchor links ไป sections ภายใน)
  ├── competency-c9.html
  ├── aml-ctf.html
  ├── market-conduct.html
  ├── corporate-governance.html
  ├── risk-management-summary.html
  ├── financial-ratio-quiz.html
  ├── cash-management-quiz.html
  ├── cash-key-atm-quiz.html
  ├── risk-management-quiz.html
  ├── quiz-1.html, quiz-2.html, quiz-3.html
  └── summary-all.html, se-am.html, etc.
```

**ทุกหน้า** มีลิงก์ `<a href="c9-content.html" style="margin-left:auto;color:var(--a)">⬅ กลับหน้าหลัก</a>`
หรือกลับไป index.html

---

## 7. Template สำหรับสร้าง credit-policy.html

ควรใช้ **Theme A (Compact Dark)** — pattern เดียวกับ policy-projects.html

```html
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🏦 นโยบายสินเชื่อ — สรุปเนื้อหา | Genius 9</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#0f172a;--s:#1e293b;--s2:#334155;--a:#f59e0b;--a2:#10b981;--a3:#3b82f6;--a4:#ef4444;--t:#f1f5f9;--t2:#94a3b8;--b:#475569}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Thai','Sarabun',sans-serif;background:var(--bg);color:var(--t);line-height:1.8;overflow-x:hidden}
nav{position:sticky;top:0;z-index:100;background:var(--s);border-bottom:1px solid var(--b);padding:10px 16px;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
nav h1{font-size:15px;color:var(--a);margin-right:10px;white-space:nowrap}
nav a{color:var(--t2);text-decoration:none;font-size:12px;padding:3px 8px;border-radius:5px;transition:all .2s}
nav a:hover{background:var(--s2);color:var(--a)}
.ct{max-width:960px;margin:0 auto;padding:24px 16px 80px}
.hero{text-align:center;padding:20px 16px 24px;border-bottom:2px solid var(--b);margin-bottom:28px}
.hero h1{font-size:22px;color:var(--a);margin-bottom:6px}
.hero p{color:var(--t2);font-size:14px}
.badge{display:inline-block;margin:3px;padding:4px 12px;border-radius:14px;font-size:11px;font-weight:600}
.badge.gold{background:#78350f;color:#fbbf24} .badge.red{background:#7f1d1d;color:#fca5a5} .badge.blue{background:#1e3a5f;color:#60a5fa} .badge.green{background:#064e3b;color:#34d399} .badge.purple{background:#3b0764;color:#c4b5fd}
section{margin-bottom:28px}
h2{font-size:20px;color:var(--a);border-left:4px solid var(--a);padding-left:10px;margin-bottom:14px}
h3{font-size:16px;color:var(--a2);margin:12px 0 8px}
h4{font-size:15px;color:var(--a3);margin:10px 0 6px;font-weight:600}
.c{background:var(--s);border:1px solid var(--b);border-radius:8px;padding:12px 16px;margin-bottom:8px;font-size:14px;line-height:1.7}
.c.info{border-left:4px solid var(--a3)} .c.warn{border-left:4px solid var(--a4)} .c.tip{border-left:4px solid var(--a)} .c.ok{border-left:4px solid var(--a2)}
table{width:100%;border-collapse:collapse;margin:8px 0;font-size:13px}
th{background:var(--s2);color:var(--a);padding:6px 8px;text-align:left;font-weight:600}
td{padding:6px 8px;border-bottom:1px solid var(--b)}
tr:hover td{background:var(--s2)}
ul,ol{padding-left:18px;margin:4px 0} li{margin-bottom:2px;font-size:14px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:640px){.grid2{grid-template-columns:1fr}}
details{margin:6px 0;background:var(--s);border-radius:8px;border:1px solid var(--b);padding:4px 10px}
details[open]{border-color:var(--a2)}
summary{cursor:pointer;padding:6px 0;font-weight:600;color:var(--a3);font-size:14px}
footer{text-align:center;padding:20px;color:var(--t2);font-size:12px;border-top:1px solid var(--b);margin-top:28px}
/* Quiz styles */
.qz{padding:4px 0}
.q{border:1px solid var(--b);background:var(--s);border-radius:8px;padding:12px;margin:8px 0}
.q p{font-size:14px;margin-bottom:6px}
.q label{display:block;font-size:13px;padding:3px 0;color:var(--t2);cursor:pointer}
.q label:hover{color:var(--a)}
.q .btn{background:var(--a);color:#0f172a;border:none;border-radius:6px;padding:5px 14px;font-size:13px;font-weight:600;cursor:pointer;margin-top:6px}
.q .btn:hover{opacity:.85}
.rb.ok{color:#34d399;font-size:13px;padding:4px 0} .rb.no{color:#fca5a5;font-size:13px;padding:4px 0}
.sc{margin:6px 0;font-size:14px;color:var(--t2)}
.sc .btn{background:var(--a2);color:#0f172a;border:none;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;margin-left:8px}
</style>
</head>
<body>
<nav>
  <h1>🏦 นโยบายสินเชื่อ</h1>
  <a href="#overview">📌 ภาพรวม</a>
  <a href="#policy">📋 หลักเกณฑ์</a>
  <a href="#process">📝 ขั้นตอน</a>
  <a href="#rateg">💰 อัตราดอกเบี้ย</a>
  <a href="#collateral">🏠 หลักประกัน</a>
  <a href="#qz">📝 ข้อสอบ</a>
  <a href="c9-content.html" style="margin-left:auto;color:var(--a)">⬅ กลับหน้าหลัก</a>
</nav>
<div class="ct">

<div class="hero">
  <h1>🏦 นโยบายสินเชื่อ ธ.ก.ส.</h1>
  <p>สรุปเนื้อหานโยบายสินเชื่อ — หลักเกณฑ์ ขั้นตอน อัตราดอกเบี้ย หลักประกัน</p>
  <div>
    <span class="badge gold">💰 สินเชื่อ</span>
    <span class="badge blue">📋 หลักเกณฑ์</span>
    <span class="badge green">🏠 หลักประกัน</span>
  </div>
</div>

<!-- Content sections here -->

<footer>🐶✨ สรุปโดย คาร่า — วันที่ ... · <a href="c9-content.html" style="color:#f59e0b">⬅ กลับหน้าหลัก</a></footer>
</div><!-- /ct -->

<!-- Quiz script here -->

</body>
</html>
```
