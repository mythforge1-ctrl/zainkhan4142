# Cartoon 3D Short: free Claude skill (Viral Shorts by CB)

A Claude Code skill that makes narrated cartoon story Shorts: flat 2D puppet characters in a 3D world, planned in three.js and finished in Blender on your own PC. No AI video generator is used.

**Start with [SETUP.md](SETUP.md).** It takes you from a fresh PC to your first storyboard.

## What is inside

| Path | What it is |
|---|---|
| `SETUP.md` | The setup tutorial: what to install, how to test, your first Short |
| `SKILL.md` | The skill Claude reads: the pipeline, every rule and its reason |
| `WORKFLOW.md` | The same pipeline in plain words |
| `CINEMATOGRAPHY.md`, `DENSITY_RULES.md` | Camera rules and how full a frame has to be |
| `agents/` | Two helper agents: the camera director and the storyboard judge |
| `tools/` | The plan checker (about 42 gates), the film checker, voice prep, measuring tools, the installer |
| `templates/threejs_film/` | The film kit: storyboard, animatic, stills, export to Blender |
| `templates/vector2d_characters/` | The character rig, body forms, face sets and a starter cast of 20 characters |
| `templates/motion_styles/` | Funny walks, runs, sits and other moves |
| `templates/blender_look/`, `templates/blender_cine/` | The Blender look: materials, light, air, effects, action camera rigs |
| `templates/audio/` | Sound effects and music made in code |
| `templates/film_example/` | A 15 s example film |
| `episodes/baboon-signalman/` | The full sample: "The Signalman Who Was a Baboon", 77 s, with script, voice, plan, sets and cast |
| `references/` | The measured numbers behind the gates and the written style reports |
| `library/` | Mistakes already made and how they were fixed |

## What is not inside

- Reference frames or videos from other channels. Study a style privately; never copy a story, character or shot.
- Music and sound-effect libraries. Use the code-made sound in `templates/audio/` or files you have a licence for.
- BlenderKit models. Optional, with your own BlenderKit account.
- A voice. You need a text-to-speech account (Fish Audio works well) or your own recording.
- The full cast of 150 characters. This edition has 20, and Claude can build new ones on the same rig.

## Quick test (after SETUP.md)

```
python tools/install.py
python tools/film_plan.py check episodes/baboon-signalman/film.json
node templates/threejs_film/render.mjs episodes/baboon-signalman/film.json --storyboard
```

The second line should end with `RESULT: 0 FAIL`. The third writes `episodes/baboon-signalman/out/storyboard.html`.

## Licence

MIT, see `LICENSE`. This skill grew out of Mr omi's free "Claude Animated Shorts" skill; his copyright notice stays in the licence. The character drawings, the sample film and its voice are shared for learning: make your own stories and characters, and do not re-upload the baboon film as your own.

Community: https://www.skool.com/viral-shorts-by-cb-3069
