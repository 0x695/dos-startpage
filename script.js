// ---- category labels ----
var CAT_LABELS = {
    net: 'NET',
    life: 'LIFE',
    games: 'GAMES',
    media: 'MEDIA',
    make: 'MAKE',
    scene: 'SCENE'
};
var CAT_ORDER = ['net', 'life', 'games', 'media', 'make', 'scene'];

var sections = Array.from(document.querySelectorAll('.section'));
var treePane = document.getElementById('tree-pane');
var dirHeader = document.getElementById('dir-header');
var noResults = document.getElementById('no-results');
var searchInput = document.getElementById('search-input');

var state = { category: null, section: null };

// ---- build the tree pane from the existing section markup (single source of truth) ----
function buildTree() {
    var byCat = {};
    CAT_ORDER.forEach(function (c) { byCat[c] = []; });
    sections.forEach(function (s) {
        var cat = s.dataset.cat;
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push(s);
    });

    var frag = document.createDocumentFragment();

    var root = document.createElement('div');
    root.className = 'tree-row root selected';
    root.tabIndex = 0;
    root.setAttribute('role', 'treeitem');
    root.textContent = 'C:\\STARTPAGE';
    root.addEventListener('click', function () { selectRoot(); });
    root.addEventListener('keydown', rowKeydown);
    frag.appendChild(root);

    CAT_ORDER.forEach(function (cat, catIdx) {
        var group = byCat[cat];
        if (!group.length) return;
        var catLast = catIdx === CAT_ORDER.length - 1 || CAT_ORDER.slice(catIdx + 1).every(function (c) { return !byCat[c].length; });
        var catConnector = catLast ? '\u2514\u2500' : '\u251c\u2500';

        var catRow = document.createElement('div');
        catRow.className = 'tree-row';
        catRow.tabIndex = 0;
        catRow.setAttribute('role', 'treeitem');
        catRow.dataset.cat = cat;
        catRow.innerHTML = '<span class="connector">' + catConnector + '</span>' + CAT_LABELS[cat] + '_';
        catRow.addEventListener('click', function () { selectCategory(cat); });
        catRow.addEventListener('keydown', rowKeydown);
        frag.appendChild(catRow);

        group.forEach(function (section, i) {
            var last = i === group.length - 1;
            var prefix = (catLast ? '  ' : '\u2502 ') + (last ? '\u2514\u2500' : '\u251c\u2500');
            var row = document.createElement('div');
            row.className = 'tree-row';
            row.tabIndex = 0;
            row.setAttribute('role', 'treeitem');
            row.dataset.section = section.id;
            var label = section.querySelector('.section-title').textContent;
            row.innerHTML = '<span class="connector">' + prefix + '</span>' + label;
            row.addEventListener('click', function () { selectSection(section.id, cat); });
            row.addEventListener('keydown', rowKeydown);
            frag.appendChild(row);
        });
    });

    treePane.appendChild(frag);
}

function rowKeydown(e) {
    var rows = Array.from(treePane.querySelectorAll('.tree-row'));
    var idx = rows.indexOf(e.currentTarget);
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = rows[Math.min(idx + 1, rows.length - 1)];
        next.focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = rows[Math.max(idx - 1, 0)];
        prev.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.currentTarget.click();
    }
}

function markSelected(el) {
    treePane.querySelectorAll('.tree-row').forEach(function (r) { r.classList.remove('selected'); });
    el.classList.add('selected');
}

function selectRoot() {
    state.category = null;
    state.section = null;
    markSelected(treePane.querySelector('.tree-row.root'));
    applyFilters();
}

function selectCategory(cat) {
    state.category = cat;
    state.section = null;
    markSelected(treePane.querySelector('.tree-row[data-cat="' + cat + '"]'));
    applyFilters();
}

function selectSection(id, cat) {
    state.category = cat;
    state.section = id;
    markSelected(treePane.querySelector('.tree-row[data-section="' + id + '"]'));
    applyFilters();
}

// ---- filtering: tree selection controls which sections/items show;
// a non-empty search query overrides the tree selection globally ----
function applyFilters() {
    var q = searchInput.value.trim().toLowerCase();
    var isSearching = q.length > 0;
    var anyVisible = false;
    var visibleCount = 0;

    sections.forEach(function (section) {
        var treeOk = isSearching
            ? true
            : (!state.category || section.dataset.cat === state.category)
              && (!state.section || section.id === state.section);

        var items = Array.from(section.querySelectorAll('.item'));
        var sectionMatches = false;

        items.forEach(function (item) {
            var text = item.textContent.toLowerCase();
            var textMatch = !isSearching || text.indexOf(q) !== -1;
            var visible = treeOk && textMatch;
            item.classList.toggle('hidden', !visible);
            item.classList.toggle('match', isSearching && textMatch);
            if (visible) { sectionMatches = true; visibleCount++; }
        });

        var titleMatch = section.querySelector('.section-title').textContent.toLowerCase().indexOf(q) !== -1;
        var sectionVisible = treeOk && (!isSearching || sectionMatches || titleMatch);

        if (isSearching && titleMatch && treeOk) {
            items.forEach(function (item) {
                if (!item.classList.contains('hidden')) return;
                item.classList.remove('hidden');
                visibleCount++;
            });
            sectionVisible = true;
        }

        section.classList.toggle('hidden', !sectionVisible);
        if (isSearching && sectionVisible) section.classList.remove('collapsed');
        if (sectionVisible) anyVisible = true;
    });

    noResults.hidden = anyVisible;
    updateDirHeader(isSearching, visibleCount, q);
}

function updateDirHeader(isSearching, count, q) {
    var path = 'C:\\STARTPAGE';
    if (isSearching) {
        dirHeader.innerHTML = ' Volume in drive C is STARTPAGE\n Search results for "' + escapeHtml(q) + '"\n\n ' + count + ' file(s)';
        return;
    }
    if (state.category) path += '\\' + CAT_LABELS[state.category] + '_';
    if (state.section) {
        var el = document.getElementById(state.section);
        path += '\\' + el.querySelector('.section-title').textContent;
    }
    dirHeader.innerHTML = ' Volume in drive C is STARTPAGE\n Directory of <span class="path">' + escapeHtml(path) + '</span>\n\n ' + count + ' file(s)';
}

function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

// ---- collapsible section titles still toggle within the file pane ----
document.querySelectorAll('.section-title').forEach(function (title) {
    title.addEventListener('click', function () {
        title.closest('.section').classList.toggle('collapsed');
    });
});

// ---- search input ----
searchInput.addEventListener('input', applyFilters);

// ---- bottom status bar: real keyboard shortcuts, not fake buttons ----
var fkeysEl = document.getElementById('fkeys');
var HINTS = [
    { key: '/', label: 'SEARCH', action: function () { searchInput.focus(); } },
    { key: 'TAB', label: 'NEXT PANE' },
    { key: '\u2191\u2193', label: 'MOVE' },
    { key: 'ENTER', label: 'OPEN' },
    { key: 'ESC', label: 'RESET', action: function () { searchInput.value = ''; selectRoot(); } }
];

HINTS.forEach(function (h) {
    var wrap = document.createElement('div');
    wrap.className = 'fkey';
    if (h.action) wrap.style.cursor = 'pointer';

    var num = document.createElement('span');
    num.className = 'fkey-num';
    num.textContent = h.key;

    var label = document.createElement('span');
    label.className = 'fkey-label';
    label.textContent = h.label;

    wrap.appendChild(num);
    wrap.appendChild(label);
    if (h.action) wrap.addEventListener('click', h.action);
    fkeysEl.appendChild(wrap);
});

// ---- global keyboard shortcuts ----
window.addEventListener('keydown', function (e) {
    var typing = document.activeElement === searchInput;
    if (e.key === '/' && !typing) {
        e.preventDefault();
        searchInput.focus();
    } else if (e.key === 'Escape') {
        if (searchInput.value) {
            searchInput.value = '';
            applyFilters();
        } else {
            selectRoot();
        }
        searchInput.blur();
    }
});

// ---- init ----
buildTree();
applyFilters();
