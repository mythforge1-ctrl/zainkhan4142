# LOCKED NEW CHARACTER STYLE (CB 2026-11-09 22:53: "lock, that is so good ... this will be our new style")
Coded 2D vector puppets (SVG in Node), our own designs in a Rick-like cartoon look.
- code/char2d.mjs: rig (body, head shapes, ink, views). bodies.mjs: 14 body forms. memes.mjs (28 meme faces), memes2.mjs (female/baby/elder + lip-sync + blinks), memes3.mjs + faces_*.mjs (teen/villain/monster).
- code/castkit.mjs: build a character from a spec; code/sheets/sheet06.mjs and sheet13.mjs: the 20 starter characters of this edition (CAST arrays, find by name).
- Render a sheet: node castsheet.mjs sheets/sheetNN.mjs (needs playwright). One character: drawCharacter(buildChar(spec, x)).
Rules: limbs always one ink colour, white skin, meme-level expressions, one giant silhouette signature per character, no copyrighted characters.
- VIEWS (CB locked 2026-11-10): front, 3/4, side, back. Rules and approved pictures: VIEW_RULES.md and views_golden/. Guard: node tools/check_views.mjs (from the skill root) must PASS after any change to this package or to templates/threejs_film/puppets.mjs.
