# Setup tutorial: from download to your first Short

This takes about 30 to 45 minutes once. You do not need to code. You install six free programs, run three test lines, and then you talk to Claude.

## 1. What you need

| Thing | Why | Cost |
|---|---|---|
| A Windows PC (Mac and Linux also work for the planning steps) | Everything runs on your own machine | |
| A graphics card with 8 GB or more | Only for the final Blender render. Storyboard and preview run on any PC | |
| Claude with Claude Code (a paid Claude plan) | Claude does the work | paid |
| A voice: a Fish Audio account, another text-to-speech tool, or your own microphone | The narration | free tier or paid |
| About 5 GB of free disk space per film | Frames and renders | |

Honest numbers from the sample film (77 seconds): storyboard about 1 minute, preview film 10 to 20 minutes, final Blender render about 4 hours on an RTX 2070 Super.

## 2. Install the programs

Install these in any order. Use the normal installer of each and keep the default options.

1. **Claude Code**: the Claude desktop app (Code tab) or the `claude` command line. https://claude.com/claude-code
2. **Python 3.10 or newer**: https://www.python.org/downloads/ . On Windows, tick **"Add python.exe to PATH"** on the first installer screen.
3. **Node.js LTS (18 or newer)**: https://nodejs.org
4. **ffmpeg**: on Windows open a terminal and run `winget install Gyan.FFmpeg`, then close and reopen the terminal. On Mac: `brew install ffmpeg`.
5. **Blender 4.2 LTS or newer**: https://www.blender.org/download/ (the sample was made with Blender 5.2 LTS).
6. Optional: a free **BlenderKit** account and add-on inside Blender, if you want ready-made 3D props.

## 3. Unzip the skill

Unzip `cartoon-3d-short.zip` to a place you will find again and where you have lots of free space, for example:

```
C:\Users\<you>\Documents\cartoon-3d-short
```

This folder is your studio. The tools, the characters and all your films (`episodes/`) live here. Do not put it inside OneDrive or another synced folder: a film writes thousands of files.

## 4. Install the parts the skill needs

Open a terminal **in the skill folder** (Windows: open the folder, click the address bar, type `cmd`, press Enter). Run these lines one at a time:

```
pip install numpy pillow scipy opencv-python faster-whisper
npm install
npx playwright install chromium
python tools/install.py
```

What they do: the first line adds the Python parts for measuring and for word timing of the voice. The next two add the small browser that draws the storyboard. The last line installs the skill and its two agents for Claude Code (into your `.claude` folder) and then checks your PC.

At the end you should see a list where every needed line says `ok`, and:

```
All needed parts are there.
```

If a line says `MISS`, it tells you what to install. Do that and run `python tools/install.py` again. Blender is marked `opt` because you only need it for the final look and render.

## 5. Test with the sample film

Still in the skill folder:

```
python tools/film_plan.py check episodes/baboon-signalman/film.json
```

The last line should read `RESULT: 0 FAIL, 11 WARN of 42 gates`. This is the plan check: it reads the whole film plan (camera, acting, timing) and tests it against the measured rules.

```
node templates/threejs_film/render.mjs episodes/baboon-signalman/film.json --storyboard
```

Open `episodes/baboon-signalman/out/storyboard.html` in your browser. You see every camera stop of the film with its start and end picture.

```
node templates/threejs_film/render.mjs episodes/baboon-signalman/film.json --animatic
```

This writes `episodes/baboon-signalman/out/animatic.mp4`: the whole film as a moving preview with the voice and captions. It draws every frame, so it can take 10 to 20 minutes. For a quick rough version add `--step 5` at the end of the line (every fifth frame, about 4 minutes). If all three work, your setup is complete.

## 6. Look at how the sample is built

Open `episodes/baboon-signalman/`. This is one complete film, and Claude reads it as a pattern:

| File | What it is |
|---|---|
| `SCRIPT.md` | The script with seconds per line |
| `voice/voice.wav`, `voice/words.json` | The narration and the time of every word |
| `film.json` | The whole film in one file: cast, places, camera stops, acting, effects, sound, all tied to words |
| `out/gen_film.py` | The generator that wrote film.json from the word times |
| `CAMERA_NOTE.md`, `SET_MAP.md`, `BLUEPRINT_NOTES.md` | The camera idea, the map of the set, the shot notes |
| `sets/junction.js`, `sets/office.js` | The two places as simple 3D sets |
| `cast/` | The baboon and the inspector, two custom characters on the shared rig |
| `look/` | The Blender scripts that add materials, light and air, and the final render driver |
| `sound/cues.md` | The cue list of the finished mix (the sound files are not included) |

## 7. Make your first Short

Open Claude Code **in the skill folder** and write, in your own words:

> Use the cartoon-3d-short skill. Pitch me 3 story ideas about [your topic].

Claude then works through the pipeline and stops at these points for your OK:

1. **Story.** You pick one of three pitches.
2. **Script.** You approve the script. It opens on action and runs 55 to 80 seconds.
3. **Voice.** Give Claude your voice file (`voice/raw.mp3` in the episode folder), or connect your text-to-speech account and tell Claude which voice to use. Claude trims it and times every word.
4. **Storyboard.** Claude plans the film, runs the plan check until it shows 0 FAIL, builds the sets and shows you every scene.
5. **Preview film.** The whole film as an animatic with voice and captions. Ask for changes here: this stage is fast and cheap.
6. **Look.** Claude moves the locked film into Blender and shows you one finished frame per place.
7. **Final render, sound, captions.** The long step. Let the PC run.

Good to know:
- Change things at the storyboard and preview stages. After the lock, layout, camera and timing stay fixed.
- Characters: say "use the doctor" or "use the grandma" for one of the 20 starter characters (pictures in `templates/vector2d_characters/sheets_png/`), or ask Claude to design a new one on the same rig and show it to you first.
- Sound: Claude can make effects and music in code with `templates/audio/`. If you use your own music, use only files you have a licence for.
- Your stories and characters must be your own. Study other channels for craft; never copy their story, characters or shots.

## 8. Common problems

| What you see | What to do |
|---|---|
| `python` or `node` "is not recognized" | Close and reopen the terminal. If it stays, install again and tick "Add to PATH" |
| `Cannot find module 'playwright'` | Run `npm install` in the skill folder (not in a subfolder), then `npx playwright install chromium` |
| `Executable doesn't exist` (Chromium) | Run `npx playwright install chromium` |
| `No out/plan/camera_baked.json` | Run the plan check first: `python tools/film_plan.py check <path to film.json>` |
| The animatic is silent | The voice must be at `episodes/<name>/voice/voice.wav` |
| `ffmpeg failed` or "ffmpeg not found" | Install ffmpeg (step 2) and reopen the terminal |
| Claude does not know the skill | Run `python tools/install.py` again and restart Claude Code. Start your request with "Use the cartoon-3d-short skill" |
| The plan check shows FAIL lines | Normal while a film is being planned. Every FAIL prints its fix; Claude repairs them until 0 FAIL |
| The Blender render is very slow | Close other programs that use the graphics card. Render one job at a time. Ask Claude for a short test stretch first |
| You moved the skill folder | Run `python tools/install.py` again so Claude finds the new place |

## 9. Share your result

Post your first storyboard or Short in the community, also when it is not finished. Questions go there too:
https://www.skool.com/viral-shorts-by-cb-3069
