# UTZLINE Viewer — installable app

**Current version: v46** (kept in lockstep with the editor's own version, since both are built from the same `source.html` — bump this line, and add a dated changelog entry, every time a new build ships; v40 through v45.6 shipped without this line being kept in sync — see `next-version-notes.md` in the project, or the editor's own README, for the full per-version detail of that stretch. The only change specific to v45.6 itself: the level-list exclusion gained the new `itp-delivery` folder.)

**v46 (2026-09-25):** see the editor's own README for the full detail — same shared `source.html`, so this app gets everything that isn't editor-only: the device Back button now steps back through the app (dialog first, then item → plan → level list → project list) instead of closing it; returning to a plan restores the last pan/zoom with no re-read; a level file that exists but can't be read is "try again", never a blank page; marker status badges paint from a cached snapshot and re-scan in the background; "View shop drawing" is offered only when one exists; PNG "current view" sharing works again (the SVG rasterisation had been failing on "--" inside markup comments); one reused IndexedDB connection; drag re-renders coalesced per frame; level names listed from a cache instead of reading every level file. The first-open plan snapshot and Save & exit are editor-only and do not apply here.

- Cache version bumped: `utzline-viewer-cache-v46`.

**v45.14 (2026-09-24):** see the editor's own README for the full detail — same shared `source.html`, so this app gets the identical fix/feature. The other-users'-overlay-layer tint (this app's own "base view" is always the single most recent overlay across everyone, so this mainly affects any OLDER layers offered underneath it) no longer washes the plan in magenta — recolored directly per-object now, not via a CSS filter. Every overlay this app reads also now carries a flattened `overlaySnapshotDataURL` preview image alongside its vector data, for other apps (UTZLINE Projects' own Joinery Item page, to start) to show without needing this app's own renderer.

- Cache version bumped: `utzline-viewer-cache-v45.14`.

**v45.13 (2026-09-24):** see the editor's own README for the full detail — same shared `source.html`, so this app gets the identical rebuild. The shared `joinery-status.json` this app reads is now event-sourced (one immutable event file per status/job-note change under `Project Saves/Joinery Status/<Level> - <Room> - <Code>/`, folded together to compute current status) instead of one shared mutable array file, eliminating a real data-loss risk once 30 people across five writer apps (some syncing in via Dropbox) are all saving into the same project. This app's own read path (`readJoineryStatuses`) picks up the same one-time, automatic, lossless migration every sibling app does; every render/badge/history call site is unchanged.

- Cache version bumped: `utzline-viewer-cache-v45.13`.

**v45.11 (2026-09-24):** see the editor's own README for the full detail — same shared `source.html`, so this app gets the identical fix. The joinery-item storage-key instability behind Andrew's "layers... only gives you one name to exclude, needs to show all names" report affected this app too, since the Viewer reads and offers the same overlay-layer list — a colliding marker's key is now cached permanently on the marker once resolved, so this build and Site Measure always agree on it regardless of what either device happens to have synced locally.

- Cache version bumped: `utzline-viewer-cache-v45.11`.

**v45.10 (2026-09-24):** see the editor's own README for the full detail — same shared `source.html`, so this app gets the identical changes. Part 1: the right-click popover's "Delete" and "Add shop drawing" rows are gone (this app never had an equivalent editor-only delete action to fall back to, since it's read-only — deleting was never possible here regardless); the old "New" button is now "Home" (`#homeBtn`), deliberately kept visible in this build too, unlike its predecessor, since it's pure read-only navigation; "Open" and "Open Project" are both gone (this app never used its own file-open buttons for anything the folder-based workflow doesn't already cover). Part 2: the "Site Measure layers" panel — already correct here (this app shows the single most-recent overlay across everyone as its base view, with every other person's latest offered as a toggleable reference layer) — gets the same new always-visible count badge on `#overlayLayersBtn` and the same "N other saved layer(s)" toast Site Measure gets, for the identical discoverability reason. Verified directly against this build (not just inferred from the shared source) as part of `run_layers_discoverability_fix.js`'s own Viewer-mode section.

- Cache version bumped: `utzline-viewer-cache-v45.10`.

**v45.9 (2026-09-23, same day):** see the editor's own README for the full detail — same shared `source.html`, so this app gets the identical change. Andrew's "manufacture status" pipeline splits again: a new "machined" stage (⚙️, rank 3) now sits between `"in_manufacture"` and `"manufactured"`, written by a brand-new sibling app, Machine Schedule; every rank at or above the old `"manufactured"` shifts up by one (manufactured → 4, delivered → 5, installed → 6). This app never writes any of these stages, but renders the same shared status badge as the editor, so its rank/icon tables needed the identical renumbering to stay correct.

**v45.8 (2026-09-23):** see the editor's own README for the full detail — same shared `source.html`, so this app gets the identical change. Andrew's job-note request ("when a joinery item gets a job note (not shop drawing) it should update the joinery status to in manufacture in the joinery register") applies here too, since the Viewer is where "Add job note" actually lives (Site Measure only ever kept "View job note" — see the v45.7 entry above). Job note filenames also moved their timestamp from the front to the end of the name, same as the editor.

**v45.7 (2026-09-23):** three requests from Andrew, sent together with two
screenshots (verbatim): (1) "site measure app needs the correct user
selector in the startup menu, same way that [UTZLINE Delivery ITP] has,
also needs to be removed from the top menubar in the floor plan as well as
the rename button (see photos)"; (2) **"Utzline viewer no longer needs the
my projects option as everything runs through the projects folder
ecosystem"**; (3) "implement the username as per the delivery itp
throughout the entire system, but instead of it opening a popup, the
button is the selector, when you pick a name it opens a numberpad to input
the pin (4 digit pin)."

- **Fixed a real, long-standing bug found while packaging this release**:
  this app's browser tab title/taskbar tooltip has said "UTZLINE Site
  Measure" since it was first split into its own app — `build.py` only ever
  inserted the PWA head tags after the shared `source.html`'s `<title>`
  line, never actually overrode the title text itself for this build (even
  though `manifest.json`/`apple-mobile-web-app-title` already correctly say
  "UTZLINE Viewer"). `build.py` now replaces it too; the editor's own
  build.py is untouched since "UTZLINE Site Measure" is correct there.
- **"My projects" removed in full** (request #2, this app's own headline
  change this release) — the personal, per-device, multi-location project
  list added back in v27 (`#gateMyProjects`, "+ Add a project…", the
  screen reading "Nothing added yet — use '+ Add a project' below to bring
  one in from anywhere on this device") is gone entirely: the HTML section,
  its CSS, `loadMyProjects`/`saveMyProjects`/`populateMyProjectList`/
  `openMyProjectEntry`, the `addMyProjectBtn` click handler, and the
  `showGateState()` gating that used to show/hide it. The per-device
  `viewerMyProjects` IndexedDB entry from before this release is simply
  never read again (nothing prunes it, but nothing reads it either — a
  harmless orphan). **Everything else about browsing a single Projects
  folder (Setup/Reconnect/List/Levels/Rooms, "Show hidden" for a
  press-and-held-away entry, shape-detection for picking a project's or a
  level's own folder directly) is completely untouched** — `viewerHiddenEntries`/
  `splitHiddenNames`/`hideEntryForViewerInstead` is a *separate* feature
  (hiding a normal list entry from just this device) that this request
  does not mention and was kept exactly as it was.
- **Shared name+PIN identity now lives here too, not just the editor.**
  See the editor's own README for the full design (ported verbatim from
  UTZLINE Delivery ITP — a native `<select>` IS the button, PIN entry via
  an on-screen numberpad, a new name via this app's own "type one thing"
  dialog). **Judgment call:** this used to be entirely absent from the
  Viewer (the old toolbar button was hidden here since the Viewer never
  saved); Andrew's own instruction to roll the new pattern out "throughout
  the entire system" is read here as no longer wanting that carve-out — a
  Viewer user may still sign delivery/install/manufacture checklists
  elsewhere on the same device, so knowing who's using it is worth showing
  even though this app itself never writes a project file. The new
  `#identityGateRow`/`#identitySelector` sit on the startup screen, in the
  same visual slot "My projects" used to occupy — visible above every gate
  state, immediately on load, with no folder needing to be chosen first
  (writing a new name is guarded with a toast if no Projects folder is
  chosen yet, since the shared `utzline-users.csv` registry lives inside
  one).
- `#userIdentityBtn` and `#fileNameBtn` (the old freeform "Set your name"
  button and the pencil "plan"/rename button) are gone from the floor-plan
  toolbar in this app too, same as the editor — see its README for the
  rename-button judgment call (the underlying `state.fileBase` mechanism
  is unchanged, only the button is gone).
- New regression test `run_identity_pin.js` (in `pdftest-projects/`) loads
  this app's own real production `index.html` bundle directly and confirms
  `#gateMyProjects`/`#myProjectListItems`/`#addMyProjectBtn` and the "My
  projects" heading text are gone entirely, while `#identityGateRow`/
  `#identitySelector` exist and are populated. `run_my_projects_list.js`/
  `run_my_projects_root_folder.js` (testing the now-removed feature) were
  deleted; see the editor's own README changelog for the rest of this
  release's test-suite detail (shared source, shared suite). Full
  regression suite re-run clean afterward: 82/86 passing, the same 4
  pre-existing environment-flake failures already documented in earlier
  versions' notes, none new.

This folder is the self-contained, installable **read-only viewer**
companion to **UTZLINE Site Measure**. It shares the exact same
underlying app code as the editor (see `source.html`'s own
`VIEW_ONLY_MODE` comment) — a mode flag read from the URL at load, not
a separate fork — but it is packaged here as its own completely
separate installable app: own name ("UTZLINE Viewer"), own icon (blue,
so it's easy to tell apart from the orange editor icon at a glance),
own `manifest.json`, and own offline cache. Installing it on Windows
(or any desktop) produces its own distinct taskbar/Start-menu/desktop
icon and its own window, separate from "UTZLINE Site Measure" — so a
drafting-office person can be given only this one, and they will never
see the editor's toolbar or be able to create/edit/delete anything.

It can open a project's folder to browse projects, levels, and rooms —
pan, zoom, view markups and dimensions, follow room-link markers, and
use Share/print — with every action that would create, edit, move, or
delete something blocked, both in the app's own logic (every actual
save/delete/insert/create function is a no-op in this mode) and at the
OS level (it only ever requests **read** permission on the folder you
pick, never write).

## How this relates to the editor app

Both apps are built from the one canonical source
(`/home/claude/redline-projects/source.html`) by near-identical
`build.py` scripts — this folder's own `build.py` is the same steps as
`redline-projects-pwa/build.py` (vendor the CDN libraries locally,
swap in local fonts, wrap in a full HTML document, register a service
worker), with the one meaningful difference being this app's
`manifest.json` sets `start_url` to `./index.html?viewer=1` — that's
what puts every launch of this installed app into read-only mode.
Whenever `source.html` changes, rebuild **both** apps
(`redline-projects-pwa/build.py` and this folder's `build.py`) from it,
and bump both service workers' `CACHE_NAME` (each already carries its
own running changelog at the top of `service-worker.js`, same
convention as the editor's).

## Getting this installed as its own Windows app

**This app lives in its own separate GitHub repository from the
editor** — not a `viewer/` subfolder of Site Measure's repo. Every app
in the UTZLINE family (Site Measure, Viewer, Install ITP, Manufacture
ITP, UTZLINE Projects, UTZLINE Scheduler, UTZLINE Delivery ITP) is its
own repo with its own GitHub Pages URL. (An earlier version of this
README described a shared repo with this app in a `viewer/` subfolder —
that's no longer how these are hosted.)

1. In this app's own repo, add every file from this bundle at the repo
   root (not inside a subfolder) — keep the `icons/` folder structure
   intact, same as the editor. It'll go live at that repo's own GitHub
   Pages URL.
2. Open that URL once in a normal browser tab while online (to let the
   service worker cache it for offline use).
3. Install it: Chrome/Edge's install icon in the address bar ("Install
   this site as an app"). Because it has its own `manifest.json`
   (different `name`/`start_url`/icons from the editor), Chrome and
   Windows treat it as a wholly separate app from "UTZLINE Site
   Measure" — its own tile/shortcut, its own icon, its own window.

## Updating this app

Same process every time a new build ships: unzip whatever's shared in
chat, upload the files into this app's own repo root (overwriting
existing ones, keeping `icons/` intact), commit, wait for GitHub Pages
to redeploy, then close and reopen the installed app to pick up the
change. **Bump the "Current version" line at the top of this README
(with a dated changelog entry) and `service-worker.js`'s `CACHE_NAME`
every single time a change ships** — both need to move together.

## Things worth knowing

- **This app never needs "readwrite" permission on anything.** The
  folder picker here always asks for read-only access — even if you
  say yes to a broader prompt by accident, every actual mutating
  function in the shared app code refuses to run while in this mode.
- **Picking a project's own folder, or even a single level's own
  folder, works too** — you don't have to pick the top-level "Projects"
  folder specifically. It detects what kind of folder you picked and
  lands you straight on the right screen (that project's level list, or
  a level's own canvas) instead of an empty or confusing list.
- **"Share" (and printing) work exactly as they do in the editor** —
  read-only mode only blocks things that would change a saved
  project's files, never viewing or exporting a copy of what's on
  screen right now.

## What's in this folder

- `index.html` — the app itself (identical app code to the editor's
  `index.html`; only ever differs in which URL launches it)
- `manifest.json`, `service-worker.js` — what makes this installable
  and offline-capable as its **own** app, separate from the editor
- `icons/` — this app's own blue-accented icon set, generated from the
  editor's orange originals so the two are easy to tell apart at a
  glance while still clearly being the same family/brand
- `jspdf.umd.min.js`, `svg2pdf.umd.min.js`, `pdf.min.js`,
  `pdf.worker.min.js`, `sans.woff2`, `mono.woff2` — bundled libraries
  and fonts (all local, no CDN), same as the editor
- `build.py` — regenerates `index.html` from the canonical source;
  only relevant if you're working on the code directly rather than
  through chat
