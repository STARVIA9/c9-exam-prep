(function () {
  'use strict';

  var HOME = 'index.html';
  var isHome = /(?:^|\/)index\.html?$/.test(location.pathname) || location.pathname === '/' || location.pathname.endsWith('/exam-center-genius9/');

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('study-enhanced');
    addReadingProgress();
    addFloatingNavigation();
    wrapTables();
    enhanceHomePage();
    enhanceKeyboardShortcuts();
  });

  function addReadingProgress() {
    if (document.querySelector('.study-progress')) return;
    var progress = document.createElement('div');
    progress.className = 'study-progress';
    progress.innerHTML = '<div class="study-progress__bar" aria-hidden="true"></div>';
    document.body.prepend(progress);
    var bar = progress.querySelector('.study-progress__bar');

    function update() {
      var doc = document.documentElement;
      var scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      var pct = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
      bar.style.width = pct.toFixed(1) + '%';
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function addFloatingNavigation() {
    if (!document.querySelector('.study-floating-nav')) {
      var nav = document.createElement('nav');
      nav.className = 'study-floating-nav';
      nav.setAttribute('aria-label', 'Study navigation');
      nav.innerHTML = '<a class="study-fab" href="' + HOME + '" title="กลับหน้าหลัก (กด h)">⌂ หน้าหลัก</a>';
      document.body.appendChild(nav);
    }

    if (!document.querySelector('.study-fab--top')) {
      var top = document.createElement('button');
      top.className = 'study-fab study-fab--top';
      top.type = 'button';
      top.title = 'กลับด้านบน';
      top.setAttribute('aria-label', 'กลับด้านบน');
      top.textContent = '↑';
      top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
      document.body.appendChild(top);

      function toggleTop() {
        top.classList.toggle('is-visible', window.scrollY > 360);
      }
      toggleTop();
      window.addEventListener('scroll', toggleTop, { passive: true });
    }
  }

  function wrapTables() {
    document.querySelectorAll('table').forEach(function (table) {
      if (table.closest('.table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function enhanceHomePage() {
    var grid = document.querySelector('#cardGrid, .grid');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.card')) : [];
    if (!grid || cards.length === 0 || document.querySelector('.study-cockpit')) return;

    cards.forEach(function (card) {
      var title = text(card.querySelector('.card-title'));
      var desc = text(card.querySelector('.card-desc'));
      var tags = Array.prototype.map.call(card.querySelectorAll('.tag'), text).join(' ');
      card.dataset.searchText = (title + ' ' + desc + ' ' + tags + ' ' + (card.dataset.cat || '')).toLowerCase();
    });

    var counts = cards.reduce(function (acc, card) {
      var cat = card.dataset.cat || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    var cockpit = document.createElement('section');
    cockpit.className = 'study-cockpit';
    cockpit.innerHTML = [
      '<div class="study-cockpit__panel">',
      '  <label class="study-search" for="studySearch">',
      '    <span class="study-search__icon">⌕</span>',
      '    <input id="studySearch" type="search" autocomplete="off" placeholder="ค้นหา: Regulation 35, FMIS, NPL, ปปง., KCIM, Risk Culture..." />',
      '  </label>',
      '  <div class="study-cockpit__meta" aria-label="จำนวนเนื้อหา">',
      '    <span class="study-chip"><strong>' + cards.length + '</strong> รายการ</span>',
      '    <span class="study-chip"><strong>' + (counts.summary || 0) + '</strong> สรุป</span>',
      '    <span class="study-chip"><strong>' + (counts.quiz || 0) + '</strong> แบบทดสอบ</span>',
      '    <span class="study-chip"><strong>' + (counts.special || 0) + '</strong> เสริม</span>',
      '  </div>',
      '</div>'
    ].join('');

    var filterBar = document.querySelector('.filter-bar');
    if (filterBar) filterBar.parentNode.insertBefore(cockpit, filterBar);
    else grid.parentNode.insertBefore(cockpit, grid);

    var empty = document.createElement('div');
    empty.className = 'study-empty-state';
    empty.textContent = 'ไม่พบหัวข้อที่ค้นหา ลองใช้คำสั้นลง เช่น FMIS, หนี้, ปปง., เงินสด';
    grid.appendChild(empty);

    var input = cockpit.querySelector('#studySearch');
    function applySearch() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var ok = !q || card.dataset.searchText.indexOf(q) >= 0;
        card.classList.toggle('hidden', !ok);
        if (ok) {
          card.classList.add('visible');
          shown += 1;
        }
      });
      empty.classList.toggle('is-visible', shown === 0);
      var active = document.querySelector('.filter-btn.active');
      if (q && active) active.classList.remove('active');
    }
    input.addEventListener('input', applySearch);

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = '';
        empty.classList.remove('is-visible');
      });
    });
  }

  function enhanceKeyboardShortcuts() {
    if (!document.querySelector('.study-shortcuts')) {
      var shortcuts = document.createElement('div');
      shortcuts.className = 'study-shortcuts';
      shortcuts.innerHTML = '<kbd>h</kbd> หน้าหลัก <kbd>/</kbd> ค้นหา';
      document.body.appendChild(shortcuts);
    }

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var typing = target && /input|textarea|select/i.test(target.tagName || '');
      if (typing) return;

      if (event.key === 'h' || event.key === 'H') {
        location.href = HOME;
      }
      if (event.key === '/') {
        var search = document.querySelector('#studySearch');
        if (search) {
          event.preventDefault();
          search.focus();
        }
      }
    });
  }

  function text(node) {
    return (node && node.textContent ? node.textContent : '').replace(/\s+/g, ' ').trim();
  }
})();
