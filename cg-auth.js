// ===== CG Auth Gate — คาร่า สำหรับ พ่อพีท =====
// ล็อคหน้า corporate-governance.html และ corporate-governance-quiz.html
// ใช้ SHA-256 hash เก็บในไฟล์นี้ (ไม่เก็บ plain text)
// ใส่ password ถูกต้องครั้งเดียว → localStorage จำไว้ → เข้าได้เลย
// เปลี่ยน password: แก้ HASH ด้านล่าง + เคลียร์ localStorage.cg_auth ทุก device

(function() {
  'use strict';

  // === SHA-256 hash ของ password ===
  // password = "baacprachin"
  // สร้างโดย: python3 -c "import hashlib; print(hashlib.sha256('baacprachin'.encode()).hexdigest())"
  const PASSWORD_HASH = 'fadc426c699910040e2e52dd6762f08ed09c9837e795052340b7c1a3b71b2b57';

  // === sessionStorage (ไม่ใช่ localStorage เพราะอยากให้หมดอายุเมื่อปิด browser tab) ===
  // แต่พ่อบอก "ใส่แค่ครั้งเดียว" → ใช้ localStorage เพื่อความสะดวก
  const AUTH_KEY = 'cg_auth_v1';
  const AUTH_TS = 'cg_auth_ts';
  const EXPIRE_DAYS = 30; // จำไว้ 30 วัน แล้วหมดอายุ

  function sha256(text) {
    // Web Crypto API
    if (window.crypto && crypto.subtle) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        .then(buf => {
          const arr = Array.from(new Uint8Array(buf));
          return arr.map(b => b.toString(16).padStart(2, '0')).join('');
        });
    }
    // Fallback: ใช้ SubtleCrypto แบบ sync ไม่ได้ → แจ้ง error
    return Promise.reject(new Error('Web Crypto API not available'));
  }

  function isAuthed() {
    try {
      const v = localStorage.getItem(AUTH_KEY);
      if (v !== '1') return false;
      const ts = parseInt(localStorage.getItem(AUTH_TS) || '0', 10);
      if (!ts) return false;
      const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
      return ageDays < EXPIRE_DAYS;
    } catch (e) { return false; }
  }

  function setAuthed() {
    try {
      localStorage.setItem(AUTH_KEY, '1');
      localStorage.setItem(AUTH_TS, String(Date.now()));
    } catch (e) {}
  }

  function clearAuth() {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_TS);
    } catch (e) {}
  }

  // ปุ่มออกจากระบบ — เรียกจาก console: clearCGAuth()
  window.clearCGAuth = clearAuth;

  function buildLoginOverlay(onSuccess) {
    // ลบ overlay เดิมก่อน
    const old = document.getElementById('cg-login-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cg-login-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: linear-gradient(135deg, #07101f 0%, #0d1728 50%, #1a2855 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      max-width: 420px;
      width: 100%;
      background: rgba(18, 32, 57, 0.95);
      border: 1px solid rgba(212,148,47,0.3);
      border-radius: 18px;
      padding: 32px 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    `;

    card.innerHTML = `
      <div style="text-align:center;margin-bottom:22px">
        <div style="font-size:48px;margin-bottom:8px">🔒</div>
        <h1 style="margin:0;color:#e8b84f;font-size:1.35rem;font-weight:800">เนื้อหาลับ — ธ.ก.ส.</h1>
        <p style="margin:8px 0 0;color:#a9b6c8;font-size:.92rem;line-height:1.5">
          คู่มือ CG และข้อสอบเป็น<strong style="color:#ffb4b4">ความลับของธนาคาร</strong><br>
          กรุณาใส่รหัสผ่านเพื่อเข้าใช้งาน
        </p>
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;color:#a9b6c8;font-size:.85rem;font-weight:600;margin-bottom:6px">รหัสผ่าน</label>
        <input type="password" id="cg-pw-input" autocomplete="current-password"
          style="width:100%;padding:12px 14px;background:#07101f;border:1.5px solid rgba(212,148,47,.3);
                 border-radius:10px;color:#edf2f7;font-size:1rem;font-family:inherit;
                 box-sizing:border-box;outline:none"
          placeholder="••••••••" />
      </div>
      <button id="cg-pw-submit"
        style="width:100%;padding:12px;background:linear-gradient(135deg,#d4942f,#e8b84f);
               color:#1a1a1a;border:none;border-radius:10px;font-size:1rem;font-weight:800;
               cursor:pointer;font-family:inherit;letter-spacing:.3px">
        🔓 เข้าสู่ระบบ
      </button>
      <div id="cg-pw-error" style="margin-top:10px;color:#ff9b9b;font-size:.88rem;text-align:center;display:none">
        ❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่
      </div>
      <p style="margin-top:18px;color:#6b7280;font-size:.78rem;text-align:center;line-height:1.5">
        💡 ใส่ครั้งเดียว ระบบจะจำไว้ 30 วัน<br>
        (พิมพ์ <code style="background:#0d1728;padding:1px 6px;border-radius:4px">clearCGAuth()</code> ใน Console เพื่อออกจากระบบ)
      </p>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const input = document.getElementById('cg-pw-input');
    const submit = document.getElementById('cg-pw-submit');
    const error = document.getElementById('cg-pw-error');

    async function tryLogin() {
      const pw = input.value;
      if (!pw) return;
      submit.disabled = true;
      submit.textContent = '⏳ กำลังตรวจสอบ...';
      try {
        const h = await sha256(pw);
        if (h === PASSWORD_HASH) {
          setAuthed();
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity .3s ease';
          setTimeout(() => {
            overlay.remove();
            onSuccess && onSuccess();
          }, 280);
        } else {
          error.style.display = 'block';
          error.textContent = '❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่';
          input.value = '';
          input.focus();
          submit.disabled = false;
          submit.textContent = '🔓 เข้าสู่ระบบ';
          // เขย่า
          card.style.animation = 'cg-shake .35s';
          setTimeout(() => { card.style.animation = ''; }, 400);
        }
      } catch (e) {
        error.style.display = 'block';
        error.textContent = '⚠️ Browser นี้ไม่รองรับ Web Crypto — กรุณาใช้ browser อื่น';
        submit.disabled = false;
        submit.textContent = '🔓 เข้าสู่ระบบ';
      }
    }

    submit.addEventListener('click', tryLogin);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') tryLogin();
    });

    // เพิ่ม keyframe animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cg-shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);

    // Focus input
    setTimeout(() => input.focus(), 100);

    return overlay;
  }

  // เพิ่มปุ่ม "ออกจากระบบ" มุมขวาบน (เฉพาะตอนที่ auth แล้ว)
  function addLogoutButton() {
    if (document.getElementById('cg-logout-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'cg-logout-btn';
    btn.innerHTML = '🔓 ออกจากระบบ';
    btn.title = 'ล้างการจำรหัสผ่าน';
    btn.style.cssText = `
      position: fixed;
      top: 60px;
      right: 16px;
      z-index: 9000;
      background: rgba(229,92,92,.85);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 7px 14px;
      font-size: .8rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(229,92,92,.3);
      backdrop-filter: blur(8px);
    `;
    btn.addEventListener('click', function() {
      if (confirm('ต้องการออกจากระบบและล้างการจำรหัสผ่าน?')) {
        clearAuth();
        location.reload();
      }
    });
    document.body.appendChild(btn);
  }

  // บล็อคการแสดงเนื้อหาจนกว่าจะ auth
  function lockContent() {
    // ซ่อนทุกอย่างใน body ยกเว้น overlay
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('cg-locked');

    // เพิ่ม placeholder ทึบเพื่อป้องกันการ peek content ผ่าน DevTools ก่อน auth
    const cloak = document.createElement('div');
    cloak.id = 'cg-content-cloak';
    cloak.style.cssText = `
      position: fixed;
      inset: 0;
      background: #07101f;
      z-index: 99998;
    `;
    document.body.appendChild(cloak);

    return cloak;
  }

  function unlockContent() {
    const cloak = document.getElementById('cg-content-cloak');
    if (cloak) cloak.remove();
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.documentElement.classList.remove('cg-locked');
    // Force remove inline visibility ที่อาจติดมา
    document.querySelectorAll('body > *').forEach(el => {
      if (el.id !== 'cg-login-overlay' && el.id !== 'cg-content-cloak') {
        el.style.visibility = '';
      }
    });
  }

  // === MAIN ===
  // Apply lock ทันที (ก่อน DOMContentLoaded) เพื่อป้องกัน content flash
  // หมายเหตุ: inline script ใน HTML จะ apply class cg-locked ที่ html ก่อนแล้ว
  // เราต้อง ensure ว่า overlay ถูกสร้างเมื่อ lock state

  document.addEventListener('DOMContentLoaded', function() {
    if (isAuthed()) {
      // ผ่านแล้ว → ลบ class cg-locked ที่ html + แสดงปุ่ม logout
      document.documentElement.classList.remove('cg-locked');
      addLogoutButton();
      return;
    }
    // ยังไม่ auth → ล็อคเนื้อหา และแสดงหน้า login
    lockContent();
    const overlay = buildLoginOverlay(function() {
      unlockContent();
      addLogoutButton();
    });
  });

  // Export สำหรับใช้ในไฟล์อื่น
  window.cgAuth = {
    isAuthed: isAuthed,
    clearAuth: clearAuth,
    PASSWORD_HASH: PASSWORD_HASH
  };
})();