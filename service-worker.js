// UTZLINE Viewer offline service worker.
//
// This is the SEPARATE, independently-installable read-only companion to
// UTZLINE Site Measure -- own manifest, own icon, own taskbar/Start-menu
// entry, own cache namespace ("utzline-viewer-cache-*", never sharing a
// name with the editor's "utzline-sitemeasure-cache-*" even though both
// can be installed side by side on the same machine). It shares the exact
// same underlying app (source.html) as the editor -- see VIEW_ONLY_MODE's
// own comment there -- via a mode flag read from the URL at load, which
// this app's own manifest.json start_url ("./index.html?viewer=1") always
// supplies. See redline-projects-pwa/service-worker.js for the full
// version history of the shared app itself; this file's own history only
// covers this separate packaging.
//
// Same cache-first app shell strategy as the editor: a small, fixed set of
// local files, no CDN calls once installed. Bump CACHE_NAME whenever
// index.html or any vendored asset changes (i.e. every time this is
// rebuilt from a new source.html), so installed copies pick up the update
// instead of serving stale files forever.
//
// (v20: first release -- packages the v20 read-only viewer mode (see
// source.html's VIEW_ONLY_MODE) as its own standalone installable app.)
// (v20a: HOTFIX -- the first release only switched read-only mode on via a
// "?viewer=1" URL query string, which the bare app URL (and any bookmark or
// shared link without that query string) doesn't carry, so opening this
// app's own URL directly loaded the full EDITABLE app -- same toolbar, same
// orange branding as the main editor -- with no read-only lock at all.
// build.py now hard-codes VIEW_ONLY_MODE = true in this bundle's own
// index.html, so it's read-only no matter how the URL is reached. Bumping
// the cache name here so anyone who already loaded/cached the broken v20
// build picks up this fix instead of continuing to serve it from cache.)
// (v21: new "jump to any room" dropdown in the toolbar -- grouped by level,
// lets you jump straight to any level's plan or any room in the whole open
// project from anywhere, without stepping back out through Switch level/
// Rooms first. Also re-skins the in-app accent color and logo to blue, to
// match this app's own icon, instead of the editor's orange.)
// (v22: CRITICAL SAFETY FIX -- long-press/right-click "Delete" on a
// project/level/room row used to call the exact same real, recursive
// removeEntry() the editor uses, with no read-only check at all, so this
// app could actually destroy real project files despite being the
// "read-only" Viewer (reported by Andrew, 2026-09-17). Replaced with a
// purely local, non-destructive "hide from my list" -- reversible via a
// new "Show hidden" toggle -- that never touches the real folder. Also
// hides "+ New Project/Level/Room" (no legitimate create action exists in
// read-only mode) and fixes the project-gate's own title to say "UTZLINE
// Viewer" like the header already did.)
// (v23: shares in the two fixes shipped in the editor's own v23 the same
// day -- the "jump to any room" dropdown was already here since v21 and is
// unchanged; the real change for THIS app is the multi-room save fix
// (saveActiveWorkBeforeLeaving/clearActiveWorkInMemory in source.html).
// It's a no-op here in practice -- every write it could trigger is still
// blocked by VIEW_ONLY_MODE exactly like every other mutation already was
// -- but it's the same shared source.html as the editor, so this bundle
// picks it up too. Bumping the cache name to match the editor's release.)
// (v24: shares in the editor's own v24 "save before leaving?" confirm the
// same way -- saveActiveWorkBeforeLeaving() checks VIEW_ONLY_MODE before
// anything else and bails out immediately in that case, so this is a pure
// no-op here: the Viewer already never wrote anything on navigation, and it
// still doesn't; nothing new is ever shown to a Viewer user. Bumping the
// cache name to match the editor's release, same as v23.)
// (v25: shares in the editor's own v25 toolbar layout fix -- the toolbar's
// two rows (file actions / drawing tools) are now permanently fixed and
// independently scrollable instead of one shared flex-wrap row, stopping
// the "jumping" reflow that could happen as buttons showed/hid. Same
// shared source.html as the editor, so this bundle picks it up too --
// bumping the cache name to match.)
// (v26: shares in the editor's own v26 changes. The new "export all room/
// level PDFs" batch actions are a no-op here -- both new buttons are hidden
// in Viewer mode (they write into project folders, same as every other
// create/export action already hidden there), same as Save itself always
// has been. The "Share current view" title-block overflow fix (the logo/
// timestamp block could spill off the left edge of a tightly-zoomed crop)
// is real and DOES apply here too -- Share/print is fully live in the
// Viewer, and addExportOverlays is the exact same shared function. Same
// shared source.html as the editor, so this bundle picks up both --
// bumping the cache name to match.)
// (v27: two real changes for THIS app specifically, both requested directly
// by Andrew. (1) The toolbar's scrollbar restyle (slim/rounded/theme-
// colored instead of the platform default) is cosmetic and applies exactly
// as it does in the editor -- shared CSS. (2) "My projects" is the real
// headline change here: "the open files on the viewer needs the ability to
// look in different locations, think of it like a import function." A new,
// ADDITIONAL section (on top of the existing single-Projects-root flow,
// which is unchanged) lets a drafting-office person build up their own
// personal, per-device list of project/level folders pulled in from
// wherever each one actually lives -- exactly the "different project
// managers, different source locations" gap the pending notes had been
// tracking since v20. Shown even before any Projects root is ever chosen.
// Each entry is opened straight from its own stored folder handle and
// removed (press-and-hold) without ever touching the real folder -- fully
// read-only, same as everything else in this app. Same shared source.html
// as the editor, so this bundle picks up both changes -- bumping the cache
// name to match.)
// (v28: shares in the editor's own v28 bug fix (the batch "export all room/
// level PDFs" buttons were exporting the background image with none of the
// dimensions/annotations on them -- see the editor's own service worker for
// the root cause). A pure no-op here in practice, since both batch-export
// buttons are already hidden entirely in Viewer mode (they write into
// project folders, same as every other create/export action already hidden
// there) -- rebuilt purely because it shares the same source.html as the
// editor. Bumping the cache name to match.)
// (v29: real bug fixed here specifically, reported by Andrew: "personal 'my
// projects' in the viewer does not work. does it need a certain folder
// structure." "My projects" only ever recognized a folder it was given as a
// "level" or a "project" -- a "root" shape (a folder that itself contains
// several project folders, i.e. one project manager's own Projects folder --
// exactly what "different project managers, different locations" looks like
// in practice) got silently treated as a plain "project", so opening it
// listed its real project folders as if they were levels and tapping one
// failed with a generic error, with nothing explaining why. Fixed by giving
// "root" its own real kind: opening one now lands on an actual project list
// under its own typed label, same as the existing single-Projects-root flow
// already does for a freshly-picked root folder -- so a whole project
// manager's folder of jobs can genuinely be added and browsed now. See the
// editor's own service worker for the fuller root-cause writeup; same
// shared source.html as the editor, so this bundle picks up the fix too --
// bumping the cache name to match.)
// (v30: shares in the editor's own v30 layering fix. The automatic
// reorder-on-select bug (tapping an image to look at it would silently
// promote it above the plan's annotations in memory) applied here too --
// this bundle never saves, so it was never persisted to disk, but it could
// still visibly misorder the on-screen layering the moment you tapped an
// image while browsing, until the level was reopened. Fixed the same way,
// via the same shared source.html. The new "Bring to front"/"Send to back"
// popover rows stay editor-only, same as before -- nothing in the Viewer
// writes to a save file, so there's nothing for them to do here. Bumping
// the cache name to match the editor's release.)
// (v31: two Viewer-specific requests from Andrew, part of a five-item
// message also covering three editor-side changes (Back button, a
// third "leave without saving" choice, and auto-lock-on-leave -- see the
// editor's own service-worker.js for those, and for the Back
// button/leave-dialog/auto-lock behaviour that this bundle shares
// automatically through the same source.html):
//
// (1) "the viewer can have the choice to change all line colours across
// the project with a simple colour selector in the menu bar." A new
// "Recolour lines" control (a native colour input plus a Reset button),
// visible only in this build, previews every dimension/line/angle/rect
// border/callout in the currently-loaded level or room in a single
// chosen colour. Deliberately scoped to leave a text object's own label
// colour and an image's own border colour untouched, since neither reads
// as a "line colour" the way a measurement or callout leader does.
// Deliberately, and critically, VIEW-ONLY: nothing about it ever writes
// to a save file, never marks anything dirty, and never calls
// pushHistory() -- confirmed with Andrew up front that this should be a
// this-viewing-session-only preview, not a real recolour, precisely
// because this app must never write to disk (see this file's own v-much-
// earlier history for why that invariant exists and is guarded so
// carefully). The preview naturally disappears the moment you navigate
// to a different level/room or reopen this one later, since the Viewer
// already reloads saved content fresh from disk on every navigation --
// nothing extra was needed to keep that guarantee intact.
//
// (2) "the item by item menus in the viewer app are not required." The
// per-object right-click/long-press popover (lock/unlock, bring to
// front/send to back, delete, mirror, edit text, etc. -- all previously
// gated off in this build already) is now skipped entirely in viewer
// mode rather than still opening as an empty floating box with nothing
// in it, which is all it could ever have shown here since every real row
// was already editor-only. A real roomlink marker's own "open this room"
// double-tap is completely unaffected -- that's handled earlier, before
// the popover is ever involved.
//
// New regression test run_viewer_recolor.js covers both: hidden in the
// editor/shown in the Viewer, correct type-scoping of the recolour,
// that a second colour pick still recovers the TRUE original (not the
// first pick) on Reset, that leaving and reopening the level shows the
// real saved colours with no trace of the preview left behind and no
// "save before leaving?" prompt ever appearing, and that the function is
// a defensive no-op outside viewer mode -- sanity-checked via a
// temporary revert-and-restore cycle. run_viewer_mode.js's existing
// popover assertion was strengthened to check no popover element exists
// at all now, not just an empty one. Bumping the cache name to match the
// editor's release.)
// (v32: real regression Andrew reported the same day v31 shipped: "also
// the viewer now lost the option to select rooms from the dot selector,
// maybe because its locked." Root cause: v31's own fix for the empty
// per-object popover in this build (see this file's own v31 entry, item 2)
// was a blanket "bail out in viewer mode, full stop" -- which also
// silently took out the ONE row that was never dead here: a room marker's
// own "Open room" row, a real, working, more discoverable second way into
// a room besides double-clicking its dot directly. Locking was never
// actually the cause (a locked roomlink was always still reachable both
// via long-press and via double-click) -- the real culprit was purely the
// popover function's own blanket early-return not distinguishing "nothing
// useful would show" from "we're in the viewer", which are the same thing
// for every OTHER object type but not this one. Fixed by scoping that
// early-return to real dead ends only: a roomlink marker still opens its
// popover here (with only its one real "Open room" row in it, every other
// row still exactly as gated as before); everything else still shows
// nothing at all, so the original v31 fix's own guarantee is untouched.
//
// Also carries the same day's "Recolour lines" expansion, requested
// directly by Andrew right after trying the v31 feature: "the colour
// change selector (all) on the viewer app needs to change colours of
// everything, borders, text etc." Originally scoped to just the five
// line-like types' own stroke colour, deliberately leaving text objects,
// attached labels, and image borders alone -- now sweeps every colour
// field ANY object happens to carry: a plain top-level colour (whatever it
// means for that type -- a line/dot/glyph), a separate attached label
// colour where an object has one (a dimension/angle/callout/room-marker's
// own text, independent of that object's own line/dot colour), and an
// image's optional border colour (turned on for the preview even if it was
// off beforehand). Relabelled "Recolour everything" in the toolbar to
// match. Same guarantees as before: still a pure in-memory preview, never
// written to any save file, gone the instant Reset is pressed or the
// level/room is reopened.
//
// The other three v32 changes (a "resume where I was" boot-restore
// mitigation, a pre-picker autosave flush for the same low-memory-discard
// scenario, and multi-page PDF insert with auto-resize/collate) are
// editor-focused -- Insert image, Open, and the project/level/room
// navigation this covers are already blocked/hidden throughout this build
// -- but share the exact same source.html, so this bundle picks them up as
// a no-op in practice. See the editor's own service-worker.js for the full
// write-up of all three. New regression tests: run_viewer_room_marker_popover.js
// (this fix) and run_viewer_recolor.js (the expanded recolour scope),
// each sanity-checked via a temporary revert-and-restore cycle. Bumping
// the cache name to match the editor's release.)
//
// (v37, 2026-09-19: the editor's in-page camera-capture fix for the
// Android tab-discard/crash report -- see the editor's own service-worker.js
// for the full write-up. Insert image is already hidden throughout this
// Viewer build, so this is a no-op here in practice; bumping the cache name
// purely because it shares the same source.html as the editor.)
//
// (v38, 2026-09-19: the editor's verifiedHandleWrite() retry fix for the
// "couldn't auto-save (empty_write)" reliability bug -- this Viewer build
// never writes anything at all, so it's a no-op here in practice. The
// header/project-gate wordmark DOES apply here though: "LINE" now colors
// with this build's own blue accent, matching UTZLINE ITP's header and
// this app's own icon-*.png artwork. See the editor's own
// service-worker.js for the full write-up of both.)
//
// (v39, 2026-09-21: the editor's new shared "device identity" feature --
// the toolbar button and its IndexedDB store are hidden/no-ops in this
// read-only Viewer build (see the editor's own service-worker.js for the
// full write-up), so this bump is purely because it shares the same
// source.html as the editor.)
//
// (v40, 2026-09-22: the level list now also excludes a project-wide folder
// literally named "itp-manufacture" -- the new UTZLINE Manufacture ITP
// app's own data folder, a sibling of the existing "itp" folder -- so it
// shares the editor's same fix for the same reason, again purely because
// both builds come from the same source.html.)
//
// (v41, 2026-09-22: the editor's cutover -- New Project/Level/Room, Project
// Info, and "Add joinery item here" all removed from source.html entirely
// (moved to UTZLINE Projects). This build already had none of those
// visible (body.viewer-mode CSS hid them, and createNewProject/Level/Room
// always rejected with {code:"view_only"} underneath), so this bump is
// purely because the Viewer shares the same source.html as the editor --
// see the editor's own service-worker.js for the full write-up.)
//
// (v42, 2026-09-22: Pan/Zoom colour-picker bug fix in the shared
// renderPanel() logic -- this build shares the same fix purely because it
// comes from the same source.html as the editor; see the editor's own
// service-worker.js for the full root-cause write-up. This is release 1 of
// Andrew's confirmed sequenced rollout of the UTZLINE Unified
// Implementation Brief -- see
// utzline-overlay-architecture-brief-investigation.md for the plan and
// remaining phases. No other functional change in this release.)
//
// (v43, 2026-09-22: flat-structure interop -- this build shares the same
// fix as the editor purely because it comes from the same source.html;
// see the editor's own service-worker.js for the full write-up. The
// Viewer only ever reads, so its half of this is simply: it can now open
// a UTZLINE Projects v9+ project (Project Saves/Floor Plans/ per Level,
// no Level/Room folders) read-only, the same way it's always opened a
// legacy nested-folder project -- isFlatProject()'s detection is shared
// code, and the Viewer's own detectFolderShape-based direct-pick flow
// (someone pointing "Choose Projects Folder" straight at a job folder)
// now correctly recognises a flat project as a project instead of
// misreading it as an empty/unknown root.)
//
// (v44, 2026-09-22: shares the editor's own Joinery Item dialog fix -- see
// the editor's own service-worker.js for the full write-up. The Viewer's
// half: right-click/long-press/double-click a roomlink marker now opens the
// same "Joinery item" dialog (read-only here -- the Add button is hidden
// since the Viewer never writes), instead of navigating straight into "the
// Room" the way it used to for a legacy project.)
//
// (v44.1, 2026-09-22, same-day hotfix: shares the editor's own stacking fix
// for the Add-photo picker rendering behind the Joinery Item dialog instead
// of on top of it -- see the editor's own service-worker.js for the full
// write-up. The Viewer's Add button is already hidden, so this fix mainly
// matters here for the picker never having been reachable at all in a build
// where VIEW_ONLY_MODE somehow didn't apply; bumped in lockstep with the
// editor regardless, since both builds share this one source.html.)
//
// (v44.2, 2026-09-22, same-day rebuild: shares the editor's own rebuild of
// "Add photo / image" -- see the editor's own service-worker.js for the full
// write-up. The Viewer's Add button stays hidden either way (VIEW_ONLY_MODE),
// so nothing changes for a Viewer user here; bumped in lockstep with the
// editor since both builds share this one source.html.)
//
// (v44.3, 2026-09-22, same-day rebuild again: shares the editor's own
// "each joinery item gets its own page" rebuild -- see the editor's own
// service-worker.js for the full write-up. UNLIKE v44.1/v44.2, this one
// DOES change something for a Viewer user: the dialog's button (renamed
// "Open joinery item") is pure navigation now, not a write, so it's no
// longer hidden here -- a Viewer user can open a joinery item's own page
// to look at whatever's been saved there (read-only, same as opening any
// other page in the Viewer), rather than the button being unavailable
// entirely. Bumped in lockstep with the editor since both builds share
// this one source.html.)
//
// (v44.4, 2026-09-22, same day: shares the editor's own two bug fixes --
// see the editor's own service-worker.js for the full write-up (duplicate
// joinery-code page collisions; a pasted-in photo drifting off its own
// border on a joinery item's PDF export). Neither fix changes anything
// Viewer-specific on its own -- the Viewer never writes a page, so it
// never triggers the PDF-boost mismatch itself, but it DOES now correctly
// show two same-coded items as two separate pages when navigating one
// that Site Measure has already fixed up. Bumped in lockstep with the
// editor since both builds share this one source.html.)
//
// (v44.5, 2026-09-22, same day: shares the editor's own duplicate-marker-
// id healing fix -- see the editor's own service-worker.js for the full
// write-up. The Viewer never writes, so it can't itself CREATE a
// duplicate-id marker or heal one back to disk, but the in-memory healing
// in applyRestoredState() still runs on every plan it opens, so it also
// correctly shows two id-colliding markers as two distinct, independently
// selectable/deletable... well, not deletable in the Viewer, but at least
// correctly NOT visually "linked" -- objects, the same as the editor.
// Bumped in lockstep with the editor since both builds share this one
// source.html.)
//
// (v45.0, 2026-09-22, same day: shares the editor's own multi-layer Site
// Measure overlay rewrite -- see the editor's own service-worker.js for
// the full write-up. The Viewer never writes, so it never has a draft or
// creates a permanent layer of its own; when opening a joinery item it now
// shows the single most recent overlay across everyone as its base view
// (the interim "most-recent-layer-wins" rule), with every OTHER overlay
// offered as a toggleable reference layer through the same new "Site
// Measure layers" panel/toolbar button the editor gets. Bumped in
// lockstep with the editor since both builds share this one source.html.)
// v45.1 (2026-09-22): picks up the same "itp-install" level-list exclusion
// as the editor (Install ITP's own folder rename) -- bumped in lockstep
// since both builds share this one source.html. No other functional change.
//
// v45.2 (2026-09-23): shares the editor's own joinery-status/job-notes
// feature -- see the editor's own service-worker.js for the full write-up.
// A roomlink marker's on-plan label now shows only its joinery code, and
// the shared status badge (📏/📦/🏆) renders here too. This app's read-only
// guarantee (VIEW_ONLY_MODE) rules out a bare status-flip action, so --
// per Andrew's own answer once that conflict was raised with him -- the
// Viewer gets NO "Mark as check measured" row at all, only "Add job note"
// (drag a PDF onto a popup / tap to choose one) and "View job note". Add
// job note is this app's one deliberate exception to never writing: it
// prompts for a one-time, narrowly-scoped (this project's own folder
// handle only, never the whole Projects root) write-permission upgrade,
// requested only at the moment the feature is actually used -- every other
// action in this app remains exactly as read-only as before. Bumped in
// lockstep with the editor since both builds share this one source.html.
var CACHE_NAME = "utzline-viewer-cache-v45.4";
var ICON_VERSION = CACHE_NAME.replace("utzline-viewer-cache-", "");

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./index.html?viewer=1",
  "./manifest.json?v=" + ICON_VERSION,
  "./jspdf.umd.min.js",
  "./svg2pdf.umd.min.js",
  "./pdf.min.js",
  "./pdf.worker.min.js",
  "./sans.woff2",
  "./mono.woff2",
  "./icons/icon-192.png?v=" + ICON_VERSION,
  "./icons/icon-512.png?v=" + ICON_VERSION,
  "./icons/icon-192-maskable.png?v=" + ICON_VERSION,
  "./icons/icon-512-maskable.png?v=" + ICON_VERSION
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(PRECACHE_URLS);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event){
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var networkFetch = fetch(event.request).then(function(response){
        if (response && response.status === 200){
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      }).catch(function(){
        return cached;
      });
      // Cache-first for instant offline loads; refresh the cache in the
      // background whenever the network is available.
      return cached || networkFetch;
    })
  );
});
