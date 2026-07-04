// ===== Site-wide Auth Gate — คาร่า สำหรับ พ่อพีท =====
// ล็อคทั้งเว็บ exam-center-genius9 / c9-exam-prep
// ใส่ password ถูกต้องครั้งเดียว → localStorage จำไว้ → เข้าทุกหน้าได้เลย
// เปลี่ยน password: แก้ PASSWORD_HASH + clear localStorage.cg_auth_v1 ทุก device

(function() {
  'use strict';

  // === SHA-256 hash ของ password ===
  // password = "baacprachin"
  const PASSWORD_HASH = 'fadc426c699910040e2e52dd6762f08ed09c9837e795052340b7c1a3b71b2b57';

  // === localStorage keys ===
  const AUTH_KEY = 'cg_auth_v1';
  const AUTH_TS = 'cg_auth_ts';
  const EXPIRE_DAYS = 30;

  // ล็อคทุกหน้ารวม index.html (4 ก.ค.69)
  const PUBLIC_PATHS = [];

  function isPublicPage() {
    return false;
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

  // Public: ล้าง auth ผ่าน console
  window.clearSiteAuth = clearAuth;

  async function sha256(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      const arr = Array.from(new Uint8Array(buf));
      return arr.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('Web Crypto API not available');
  }

  function buildLoginOverlay(onSuccess) {
    const old = document.getElementById('site-login-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'site-login-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: linear-gradient(135deg, #07101f 0%, #0d1728 50%, #1a2855 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif;
      animation: site-fadein .3s ease;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      max-width: 440px;
      width: 100%;
      background: rgba(18, 32, 57, 0.97);
      border: 1px solid rgba(212,148,47,0.4);
      border-radius: 20px;
      padding: 36px 30px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,148,47,.15);
    `;

    // ตรวจ path ปัจจุบันเพื่อแสดงในข้อความ
    const currentPath = location.pathname.split('/').pop() || 'index.html';

    card.innerHTML = `
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:54px;margin-bottom:10px">🔒</div>
        <h1 style="margin:0;color:#e8b84f;font-size:1.4rem;font-weight:800;letter-spacing:.5px">เว็บไซต์ส่วนตัว — พ่อพีท</h1>
        <p style="margin:10px 0 0;color:#a9b6c8;font-size:.92rem;line-height:1.6">
          เนื้อหาและข้อสอบทุกหน้าเป็น<strong style="color:#ffb4b4">ความลับส่วนบุคคล</strong><br>
          กรุณาใส่รหัสผ่านเพื่อเข้าใช้งาน
        </p>
        <p style="margin:6px 0 0;color:#6b7280;font-size:.78rem">
          📄 หน้าที่พยายามเข้า: <code style="background:#07101f;padding:1px 6px;border-radius:4px;color:#9cc2ff">${currentPath}</code>
        </p>
      </div>
      <div style="margin-bottom:16px">
        <label style="display:block;color:#a9b6c8;font-size:.85rem;font-weight:600;margin-bottom:6px">รหัสผ่าน</label>
        <input type="password" id="site-pw-input" autocomplete="current-password"
          style="width:100%;padding:13px 14px;background:#07101f;border:1.5px solid rgba(212,148,47,.3);
                 border-radius:10px;color:#edf2f7;font-size:1rem;font-family:inherit;
                 box-sizing:border-box;outline:none;transition:border .2s"
          placeholder="••••••••"
          onfocus="this.style.borderColor='rgba(212,148,47,.7)'"
          onblur="this.style.borderColor='rgba(212,148,47,.3)'" />
      </div>
      <button id="site-pw-submit"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#d4942f,#e8b84f);
               color:#1a1a1a;border:none;border-radius:10px;font-size:1rem;font-weight:800;
               cursor:pointer;font-family:inherit;letter-spacing:.3px;transition:transform .15s"
        onmouseover="this.style.transform='translateY(-1px)'"
        onmouseout="this.style.transform=''">
        🔓 เข้าสู่ระบบ
      </button>
      <div id="site-pw-error" style="margin-top:12px;color:#ff9b9b;font-size:.88rem;text-align:center;display:none;line-height:1.5">
      </div>
      <p style="margin-top:20px;color:#6b7280;font-size:.78rem;text-align:center;line-height:1.6">
        💡 ใส่ครั้งเดียว ระบบจะจำไว้ 30 วัน เข้าได้ทุกหน้า<br>
        (ออกจากระบบ: พิมพ์ <code style="background:#0d1728;padding:1px 6px;border-radius:4px">clearSiteAuth()</code> ใน Console)
      </p>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Inject keyframes
    if (!document.getElementById('site-auth-keyframes')) {
      const style = document.createElement('style');
      style.id = 'site-auth-keyframes';
      style.textContent = `
        @keyframes site-fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes site-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `;
      document.head.appendChild(style);
    }

    const input = document.getElementById('site-pw-input');
    const submit = document.getElementById('site-pw-submit');
    const error = document.getElementById('site-pw-error');

    async function tryLogin() {
      const pw = input.value;
      if (!pw) {
        error.style.display = 'block';
        error.textContent = '⚠️ กรุณากรอกรหัสผ่าน';
        return;
      }
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
            // Force remove any leftover lock
            document.documentElement.classList.remove('site-locked');
            // Reset inline visibility on all elements
            document.querySelectorAll('body > *').forEach(el => {
              if (el.id !== 'site-login-overlay') {
                el.style.visibility = '';
              }
            });
            onSuccess && onSuccess();
          }, 280);
        } else {
          error.style.display = 'block';
          error.textContent = '❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่';
          input.value = '';
          input.focus();
          submit.disabled = false;
          submit.textContent = '🔓 เข้าสู่ระบบ';
          card.style.animation = 'site-shake .35s';
          setTimeout(() => { card.style.animation = ''; }, 400);
        }
      } catch (e) {
        error.style.display = 'block';
        error.textContent = '⚠️ Browser นี้ไม่รองรับ Web Crypto — กรุณาใช้ browser ที่ทันสมัย';
        submit.disabled = false;
        submit.textContent = '🔓 เข้าสู่ระบบ';
      }
    }

    submit.addEventListener('click', tryLogin);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') tryLogin();
    });

    setTimeout(() => input.focus(), 100);
    return overlay;
  }

  function lockSite() {
    // Add lock class + cloak background (กัน content flash)
    document.documentElement.classList.add('site-locked');

    // Cloak ทึบ
    if (!document.getElementById('site-content-cloak')) {
      const cloak = document.createElement('div');
      cloak.id = 'site-content-cloak';
      cloak.style.cssText = `
        position: fixed;
        inset: 0;
        background: #07101f;
        z-index: 999998;
      `;
      document.body.appendChild(cloak);
    }
  }

  function unlockSite() {
    const cloak = document.getElementById('site-content-cloak');
    if (cloak) cloak.remove();
    document.documentElement.classList.remove('site-locked');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    // Force remove inline visibility ที่อาจติดมา
    document.querySelectorAll('body > *').forEach(el => {
      if (el.id !== 'site-login-overlay') {
        el.style.visibility = '';
      }
    });
  }

  function addLogoutButton() {
    if (document.getElementById('site-logout-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'site-logout-btn';
    btn.innerHTML = '🔓 ออกจากระบบ';
    btn.title = 'ล้างการจำรหัสผ่าน';
    btn.style.cssText = `
      position: fixed;
      top: 8px;
      right: 12px;
      z-index: 9000;
      background: rgba(229,92,92,.92);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 6px 12px;
      font-size: .75rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 3px 10px rgba(229,92,92,.35);
      backdrop-filter: blur(8px);
    `;
    btn.addEventListener('click', function() {
      if (confirm('ต้องการออกจากระบบและล้างการจำรหัสผ่าน?\n(จะต้องใส่รหัสใหม่เมื่อเข้าหน้าถัดไป)')) {
        // Apply lock ทันทีก่อน reload เพื่อป้องกัน content flash
        document.documentElement.classList.add('site-locked');
        // Force hide body ทันที (inline style เพื่อ override ทุกอย่าง)
        document.body.style.cssText = 'visibility: hidden !important;';
        clearAuth();
        // หน่วงเวลาเล็กน้อยให้ CSS apply ก่อน reload
        setTimeout(function() { location.reload(); }, 50);
      }
    });
    document.body.appendChild(btn);
  }

  // === MAIN ===
  // Apply lock ทันที (ก่อน DOMContentLoaded) เพื่อป้องกัน content flash
  // ใช้ inline style บน documentElement แทน class เพื่อให้ CSS apply ทันที
  (function immediateLock() {
    if (isPublicPage()) return;
    if (!isAuthed()) {
      // Apply ทั้ง class + inline style เพื่อความแน่นอน
      document.documentElement.classList.add('site-locked');
      document.documentElement.style.visibility = 'visible'; // ให้ html แสดง (login overlay จะอยู่ใน body)
      // Inline style ซ่อน body — จะถูกลบเมื่อ unlock
      const style = document.createElement('style');
      style.id = 'site-immediate-lock';
      style.textContent = 'body { visibility: hidden !important; }';
      document.head.appendChild(style);
    }
  })();

  document.addEventListener('DOMContentLoaded', function() {
    // ลบ immediate lock style ถ้ามี (DOM พร้อมแล้ว)
    const immediateLock = document.getElementById('site-immediate-lock');
    if (immediateLock) immediateLock.remove();

    // หน้า public (เช่น index) — ไม่ล็อค แต่ให้ปุ่ม logout ถ้า auth แล้ว
    if (isPublicPage()) {
      if (isAuthed()) addLogoutButton();
      return;
    }

    if (isAuthed()) {
      // ผ่านแล้ว → ปลดล็อค + ปุ่ม logout
      document.documentElement.classList.remove('site-locked');
      addLogoutButton();
      return;
    }

    // ยังไม่ auth → ล็อค + แสดง login
    lockSite();
    buildLoginOverlay(function() {
      unlockSite();
      addLogoutButton();
    });
  });

  // Public API
  window.siteAuth = {
    isAuthed: isAuthed,
    clearAuth: clearAuth,
    PASSWORD_HASH: PASSWORD_HASH
  };
})();