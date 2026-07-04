# 🚀 Deploy c9-exam-prep → GitHub Pages

ระบบ deploy อัตโนมัติ — สั่งคำสั่งเดียวเสร็จครบทุกขั้นตอน

## ⚡ ใช้งานเร็วๆ

```bash
# deploy ปกติ (เช็ค + commit + push + verify)
./scripts/deploy.sh

# เช็คอย่างเดียว ไม่ deploy
./scripts/deploy.sh --check-only

# ข้าม pre-check (deploy เลย)
./scripts/deploy.sh --skip-check

# ทดลองดูว่าจะทำอะไรบ้าง (ไม่ push จริง)
./scripts/deploy.sh --dry-run
```

## 📋 มันทำอะไรบ้าง

```
[1/5] pre-check  → ตรวจ HTML tags + JS syntax + local links
[2/5] commit     → auto-commit + auto-message (timestamp + file list)
[3/5] push       → push ไป c9-prep/main (production repo with Pages)
[4/5] verify     → poll PAGES_URL ทุก 15s สูงสุด 3 รอบ
[5/5] retry      → ถ้า 404 → empty-commit rebuild ซ้ำสูงสุด 3 รอบ
```

## 🌐 URL ที่ Deploy

- **Production:** https://peatlaonado-star.github.io/c9-exam-prep/
- **Repo:** https://github.com/peatlaonado-star/c9-exam-prep

## ⚠️ เรื่อง Remote

| remote name | repo URL | มี Pages? |
|---|---|---|
| **`origin`** | `exam-center-genius9` | ❌ (mirror) |
| **`c9-prep`** | `c9-exam-prep` | ✅ **PRODUCTION** ← ตัวนี้ที่ deploy |

**HARD RULE:** push ขึ้น production ต้อง `git push c9-prep main`
ห้าม push `origin` เด็ดขาถ้า (404 ตลอด)

## 📁 ไฟล์ใน scripts/

- `deploy.sh` — orchestrator หลัก (~120 lines)
- `pre-check.sh` — HTML/JS validator (~85 lines)

## 📊 Log

- เก็บที่ `logs/deploy-YYYYMMDD-HHMMSS.log`
- ดูย้อนหลังได้ ว่า deploy ไปกี่ครั้ง, ผ่าน/ไม่ผ่านเมื่อไหร่

## 🔧 Troubleshoot

### ❌ "auth failed"
```bash
gh auth status          # เช็คสถานะ
gh auth login           # login ใหม่ถ้าจำเป็น
```

### ❌ "Pages still not live"
1. เช็ค https://github.com/peatlaonado-star/c9-exam-prep/actions
2. ดู build log
3. รอ GitHub rebuild (อาจ 1-2 นาที)

### ⚠️ pre-check ไม่ผ่าน
- ดู error ที่ขึ้น (เช่น file ไหน tag ไม่ครบ)
- แก้แล้วลองใหม่
- หรือใช้ `--skip-check` ถ้ามั่นใจ (deploy เลย)
