#!/usr/bin/env python3
"""
Inject site-wide auth guard ลงในทุก HTML file
- Inline script ใน <head>: check localStorage → add site-locked class ถ้าไม่ auth
- Inline CSS: html.site-locked body { visibility: hidden }
- Script tag ก่อน </body>: load auth.js
"""
import re
from pathlib import Path

HTML_DIR = Path('/home/kara/exam-center-genius9')
PUBLIC_PAGES = set()  # ล็อคทุกหน้ารวม index.html (ตามคำสั่งพ่อ 4 ก.ค.69)

# Inline guard script — apply class ทันทีเพื่อป้องกัน content flash
INLINE_GUARD = '''<script>
/* Inline auth guard — apply site-locked ทันทีก่อน JS โหลด ป้องกัน content flash */
(function(){
  try {
    if (localStorage.getItem('cg_auth_v1') !== '1') {
      document.documentElement.classList.add('site-locked');
    }
  } catch(e){ document.documentElement.classList.add('site-locked'); }
})();
</script>
<style>
/* Site-wide auth gate: ซ่อนทุกอย่างเมื่อ html มี class site-locked */
html.site-locked body { visibility: hidden !important; }
html.site-locked body #site-login-overlay,
html.site-locked body #site-content-cloak { visibility: visible !important; }
</style>'''

SCRIPT_TAG = '<script src="auth.js" defer></script>'

def process_file(html_path: Path):
    """Inject auth guard into a single HTML file"""
    name = html_path.name
    text = html_path.read_text(encoding='utf-8')

    # ข้าม public pages
    if name in PUBLIC_PAGES:
        # index.html: ลบ cg-auth.js (ถ้ามี) + ไม่ใส่ inline guard
        # แต่ยัง load auth.js เพื่อให้ปุ่ม logout ทำงานถ้า auth แล้ว
        new_text = text
        if 'cg-auth.js' in new_text:
            new_text = re.sub(r'<script src="cg-auth\.js"[^>]*></script>\s*', '', new_text)
        if 'src="auth.js"' not in new_text:
            new_text = new_text.replace('</body>', f'  {SCRIPT_TAG}\n</body>')
        if new_text != text:
            html_path.write_text(new_text, encoding='utf-8')
            print(f'[public] {name}: added auth.js (no inline guard)')
        return False

    original = text
    changes = []

    # 1. ลบ inline guard เก่า (cg-locked) ถ้ามี
    old_guard_pattern = r'<script>\s*/\* Inline immediate lock.*?</script>\s*<style>\s*/\* ซ่อนทุกอย่างเมื่อ html มี class cg-locked.*?</style>'
    if re.search(old_guard_pattern, text, re.DOTALL):
        text = re.sub(old_guard_pattern, '', text, flags=re.DOTALL)
        changes.append('removed old cg-locked guard')

    # 2. ลบ body.cg-locked class ใน <body>
    text = re.sub(r'<body class="cg-locked">', '<body>', text)
    text = re.sub(r'<body class="cg-locked([^"]*)"', r'<body\1', text)
    text = re.sub(r'<body([^>]*?)class="cg-locked"([^>]*?)>', r'<body\1\2>', text)

    # 3. ลบ style เก่าที่ใช้ body.cg-locked
    text = re.sub(r'/\* === Auth Gate[^*]*?\{[^}]*?\}\s*\}?\s*\*/\s*', '', text)

    # 4. ลบ cg-auth.js script tag (เปลี่ยนเป็น auth.js)
    if 'cg-auth.js' in text:
        text = re.sub(r'<script src="cg-auth\.js"[^>]*></script>\s*', '', text)
        changes.append('removed cg-auth.js')

    # 5. เพิ่ม inline guard ถ้ายังไม่มี
    if 'site-locked' not in text and 'INLINE AUTH GUARD' not in text.upper() and 'site-locked' not in text:
        # หา <link rel="stylesheet" href="study-ui.css"> หรือหลัง <style>
        # Insert หลัง <head> หรือหลัง </style> สุดท้ายก่อน </head>
        if '</head>' in text:
            text = text.replace('</head>', f'  {INLINE_GUARD}\n</head>', 1)
            changes.append('added inline guard')

    # 6. เพิ่ม auth.js script ก่อน </body> ถ้ายังไม่มี
    if 'src="auth.js"' not in text:
        if '</body>' in text:
            text = text.replace('</body>', f'  {SCRIPT_TAG}\n</body>', 1)
            changes.append('added auth.js script')

    if text != original:
        html_path.write_text(text, encoding='utf-8')
        print(f'[protected] {name}: {", ".join(changes)}')
        return True
    else:
        return False


def main():
    files = sorted(HTML_DIR.glob('*.html'))
    print(f'Processing {len(files)} HTML files...\n')

    modified = 0
    for f in files:
        if process_file(f):
            modified += 1

    print(f'\n✅ Modified {modified}/{len(files)} files')


if __name__ == '__main__':
    main()