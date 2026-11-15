# Set map: baboon signalman (lead's layout, v1 2026-11-10)
Plan coordinates: metres, Z up, X to screen-right, Y away from the opening camera (cameras stand at negative Y and look toward +Y). Ground where actors stand is z = 0.
Look target for these three.js sets: simple toon, real sizes, warm day. Colour grammar from Rick's railroad video (refs/reference_board_v1.jpg): warm orange earth, chunky red-brown/grey ballast, dark brown sleepers, deep blue sky, saturated green trackside furniture, low lens along the rails. Take the grammar, never his shots. South Africa, 1880s, dry veld.

## Place 1: `junction` (light: day). ONE long set, the camera travels along +X without cuts
| Zone | x range | What stands there |
|---|---|---|
| A. Signal box | -3 .. 4 | Lever frame OUTDOORS on the ground: 5 tall levers (1.25 m, coloured handles red/blue/yellow/red/blue, on a wooden base) in a row from x=-1.4 to x=0.2 at y=0.9. Small open-fronted wooden signal hut (green boards, tin roof, 2.6 w x 2.2 d x 2.6 h) centred x=2.6, y=2.2, open side facing -Y. A key board on the hut's front post at [1.25, 1.1, 1.3] with 4 big brass keys on hooks. Semaphore signal post at [-3.2, 2.9], 5.5 m, red arm with white stripe. Oil lamp, bucket, coal pile, tool crate, a water barrel: all at y >= 1.4 or |x| outside the marks. |
| B. Main line | whole set | Track along X, centre y=4.4: ballast bed 3.4 wide, top z=0.12; 2 rails (gauge 1.07 m: y=3.87 and 4.93), sleepers every 0.7 m, from x=-60 to x=60. Second line branches off at x=-5 (points with a point lever) and curves away toward +Y/-X to about [-40, 16]. |
| C. Boardwalk platform | 9 .. 21 | Low wooden boardwalk flush with the ground (top z=0.0, planks along Y), y from -2.5 to 3.2. Station name board "UITENHAGE" style board WITHOUT readable text requirement (a plain board is fine), 2 lamp posts, bench, luggage trolley, crates, milk churns, all at y >= 1.6. Canopy on 4 posts over x=15..21, y=1.4..3.2, roof at z=3.2. |
| D. Far side | y 7 .. 40 | Veld: orange earth, low flat-topped hills (koppies) at y=25-40, acacia/thorn trees with flat crowns, aloes, telegraph poles every 9 m at y=7 with a sagging wire, a round water tower on legs at [13, 9.5], a windmill pump at [-12, 11]. Every camera sweep along X must have a background. Sky is the kit's. |

Movers (the set's `update(f, t)` moves them; the lead supplies events, see "Events"):
- `train`: boxy steam engine (boiler, chimney with smoke puffs as spheres, cab with an OPEN side window 0.8 x 0.7 at z=2.0-2.7 facing -Y so a driver card inside is visible, cowcatcher, 3 wheel pairs) + 2 wooden carriages (dark red-brown planks, per refs rr_060: each with 3 OPEN arched windows 0.9 w x 1.0 h facing -Y, sill at z=1.75, so a character card standing inside at y=4.0 shows head and shoulders). Local origin = engine cab centre on the track. Engine nose points +X. Carriage 1 centre is 7.4 m behind the cab (-X), carriage 2 15.2 m behind.
- `trolley`: small wooden hand cart for the signalman: 0.9 x 0.7 m box, front board 0.75 m high facing -Y (it hides his legs: he has none), 4 small flanged wheels, a push bar at the back (-X end) at z=0.8. Local origin = the cart floor centre at ground level.
- `levers`: each of the 5 levers tilts about its base (X axis pivot, -28 deg = pulled toward -Y... choose a clear readable tilt along X instead if it reads better from the front: tilt 28 deg toward +X).
- `signal_arm`: horizontal = stop, raised 45 deg = go.

Actor marks (keep 0.6 m clear around each, and keep the strip y from -3 to 0.6 free of anything taller than 0.3 m, because cameras live there):
- Jack at the lever frame: [-0.6, 0.35, 0]. Signalman in his trolley beside the hut: trolley home [1.3, 0.45, 0].
- Trolley ride (line 4): trolley travels ON the main track from x=-9 to x=-3 (y=4.4, z=0.12), Jack pushing at its back.
- Train stop mark: cab at x=3.4 (driver takes the key at the lever frame side); carriage 1 window 2 is then about x=-4. For the lady beat the train stops with cab at x=22.5 so carriage 1 sits at the boardwalk (x about 15).
- Inspector and signalman two-shot on the boardwalk: [13.2, 0.3, 0] and [14.6, 0.4, 0].

Anchors to return (name -> [x,y,z] or f => [x,y,z]): `levers` (handle height centre), `lever1`..`lever5`, `keys` (key board), `signal` (arm), `train` (cab window, follows the train), `window` (carriage 1 middle window centre, follows), `trolley` (follows), `hut`, `platform`, `points`.

Events: read `film.places.junction.events` if present: a list of `{ "f0": frame, "f1": frame, "obj": "train" | "trolley" | "lever1".."lever5" | "signal_arm", "from": value, "to": value }` where value is an x position (train: cab x; trolley: [x, y, z]) or 0..1 (levers, arm). Ease with smootherstep, hold the last value after f1, the first `from` before the first event. Without events: train parked with cab at x=3.4, trolley at home, levers at 0, arm at 0. Also keep one small always-on motion (smoke puffs rising, windmill turning).

## Place 2: `office` (light: interior). The railway boss's office, one room, one camera side
Room 5.2 wide (x -2.6..2.6), 4.2 deep (y -1.6..2.6), 3.1 high; the wall at y=-1.6 is open (camera side). Warm lamp-lit wood (ref rr_058 warm interior, hr betting-room wood). Heavy desk 1.7 x 0.8 x 0.76 centred [0.55, 0.9]; the inspector stands BESIDE it at mark [-0.75, 0.55, 0] (people stand beside furniture, not behind it). On the desk: the letter (cream sheet 0.3 x 0.21, at [0.15, 0.75, 0.77], anchor `letter`), inkwell with quill, oil desk lamp with a glowing globe (role lamp), a stack of ledgers, a rubber stamp. Back wall y=2.6: big window (1.6 x 1.4, sill z=1.0, centred x=-0.9) with a painted far view of rails and a signal, a framed route map of railway lines (centred x=1.3, z=1.8, plain lines no text), a wall clock. Side walls: bookshelf with ledgers, coat stand with a top hat, filing drawers, a rolled-map basket. Floor boards, a rug under the mark, skirting. Ceiling lamp. Anchors: `letter`, `desk`, `lamp`, `window`, `map`.
Movers: `stamp` event optional (`{obj:"stamp", f0, f1, from:0, to:1}` = lifts 0.25 m and comes down on the letter); the wall clock's hands turn always.

## Cast (heights in metres)
jack `cast:jack` 0.85 (episode sheet cast/sheets/jack.mjs) · wide (signalman) `stationmaster` 1.75, sits in the trolley · inspector `cast:railway` 1.95 · lady `form:lady` 1.6 (inside carriage 1) · driver `form:dad` 1.7 (in the cab window).
