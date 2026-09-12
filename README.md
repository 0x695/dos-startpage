# startpage

A personal browser startpage styled after a real MS-DOS text-mode shell — a directory tree of categories on the left, a `dir`-style file listing on the right, box-drawn window frame, live search filter, and keyboard navigation. No frameworks, no build step: three static files.

## Features

- **Tree + file-pane browsing** — categories and link groups laid out like the classic MS-DOS Shell / Norton Commander file manager. Click (or arrow-key through) the tree on the left to filter the listing on the right.
- **Live search** — type in the `C:\>` prompt to filter every link by name across all categories; falls through to a web search if you hit Enter.
- **Keyboard shortcuts** — `/` focuses search, `Esc` clears it and resets the tree, arrow keys move through the tree, Tab/Enter behave like normal focusable links.
- **Fits your screen** — the whole app locks to your browser viewport; only the link listing scrolls internally, like a real terminal pane.
- **Real box-drawing characters** — the window frame is built from actual CP437 box-drawing glyphs, not CSS borders, using the `Perfect DOS VGA 437` bitmap font.
- **No dependencies** — plain HTML/CSS/JS, works as a local file or hosted anywhere static.

## Using it as your browser startpage

1. Download this repo (or the latest [release](../../releases) zip) and unzip it somewhere permanent.
2. Point your browser's home page / new-tab setting at the local `index.html`.
3. Edit `index.html` to replace the placeholder sections and links with your own — see below.

## Customizing your links

Everything lives in `index.html` inside `#section-container`. Each block is:

```html
<div class="section" id="section-yourname" data-cat="net">
    <h2 class="section-title">YOUR_CATEGORY_</h2>
    <hr>
    <div class="item"><a href="https://example.com/">/your_link</a></div>
</div>
```

- `id` must be unique across the page.
- `data-cat` must be one of: `net`, `life`, `games`, `media`, `make`, `scene` — these are the six top-level branches shown in the tree. Change the labels shown in the tree by editing `CAT_LABELS` near the top of `script.js`.
- Add as many `.item` links as you like inside a section, and as many sections as you like — the tree and search are generated dynamically from whatever's in the page, no other file needs to change.

This copy ships with placeholder example links so you can see the layout working before you swap in your own.

## Running it locally

No build step — just open `index.html` in a browser, or serve the folder with anything static:

```bash
python3 -m http.server
```

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure and your link data |
| `style.css` | All styling — colors, layout, the box-drawing frame |
| `script.js` | Builds the tree from the sections in the page, handles search/filter/keyboard nav |
| `favicon.png` | Browser tab icon |
| `Terminal.fon` | Legacy Windows shortcut icon font resource — not used by the browser rendering (browsers can't load `.fon` files as webfonts); kept for the desktop-shortcut use case |

## Credits

Font: [Perfect DOS VGA 437](https://www.cdnfonts.com/perfect-dos-vga-437.font), loaded from cdnfonts.com — requires an internet connection to render; falls back to Consolas/Courier New otherwise.

## License

Do whatever you want with this.
