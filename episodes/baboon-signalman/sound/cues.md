# The Signalman Who Was a Baboon: sound cues

Script: `build_mix.py` (run it again to rebuild everything here). Times come from `out/plan/sound_events.json`; the word is the anchor from `film.json` (`#n` = the nth time the word is said, `+nf` = frames). Nobody has listened to this mix: all checks below are measurements.

## Measured (`measure.json`)

| Gate | Value | Target | |
|---|---|---|---|
| voice vs background median gap db | 17.29 | >= 15 | PASS |
| background louder than voice pct | 0.0 | < 1 | PASS |
| integrated lufs | -14.0 | -14 +/- 0.5 | PASS |
| true peak dbtp | -1.8 | <= -1.5 | PASS |
| duck db while talking | -13.0 | about -13 | PASS |
| music bed under voice db | 20.74 | about 20 | PASS |
| exact length | [3726400, 77.6333] | 3726400 samples = 2329 frames at 30 fps | PASS |
| voice timing lag samples | 0 | 0 | PASS |
| whistle counts | ['whistle_1@19.73: 1 of 1 (SFX stem: 1)', 'whistle_2@47.47: 2 of 2 (SFX stem: 2)', 'whistle_4@49.67: 4 of 4 (SFX stem: 4)', "whistle_3 on 'whistled' (follows the picture: 3 puffs)@57.27: 3 of 3 (SFX stem: 3)", 'whistle_far_soft@64.43: 2 of 2 (SFX stem: 2)'] | counted = expected, on the whistle bus and on the SFX stem | PASS |
| single hits off anchor ms | 7.3 | <= 66.7 (2 frames), 17 hits checked | PASS |
| gates on words json spans | [17.51, 0.288] | >= 15, < 1 | PASS |

- ffmpeg ebur128 on `mix.wav`: I -14.0 LUFS, LRA 1.5 LU, true peak -1.8 dBTP. 3726400 samples = 77.6333 s, 48 kHz stereo, 24-bit.
- Voice against everything else (music + SFX + ambience), K-weighted, 0.4 s windows, 746 talking windows: median gap 17.3 dB, 5th percentile 9.4 dB, lowest 2.9 dB; background louder than the voice in 0.00 % of them.
- Talking = the voice file itself (voice activity, 74.8 s in 6 spans). With the word times of words.json instead (69.8 s): median 17.5 dB, background louder 0.29 %.
- Music and SFX are ducked 13 dB while he talks; the music bed measures 20.7 dB under the voice (median, talking). Ambience is ducked 6 dB and sits 26.9 dB under the voice.
- Story signals (stem `hero` in the table: whistles, scream, knocks, stamp, the accident train, the last train) are ducked only 5 dB so they stay readable under the voice.
- Loudness: own pre-master (gain +1.88 dB, peak limiter max -1.65 dB), then ffmpeg two-pass loudnorm to -14 LUFS / -1.5 dBTP, which ran linear (gain +0.050 dB).
- Voice: zero-phase 80 Hz high-pass and 3:1 compression only. Lag against `voice/voice.wav`: 0 samples (correlation 0.976).
- Whistle counts, measured on the whistle bus and again on the delivered SFX stem (1.1-1.26 kHz band): whistle_1 at 19.73 s = 1 of 1 (stem 1); whistle_2 at 47.47 s = 2 of 2 (stem 2); whistle_4 at 49.67 s = 4 of 4 (stem 4); whistle_3 on 'whistled' (follows the picture: 3 puffs) at 57.27 s = 3 of 3 (stem 3); whistle_far_soft at 64.43 s = 2 of 2 (stem 2). Every toot is the same 0.16 s unit.

## Guesses and things to check by ear

- The library has no steam train, no trolley, no key ring and no steam: every train (pass, arrive, roll to a stop, pull away), the trolley wheels, the key jingle and the steam whooshes are synthesized. They are measured, not heard.
- The whistle is the library's `TrainWhistle_BWU.166.mp3` (first short toot, cut to one 0.16 s unit). 0.16 s is short because the picture draws the four puffs of 'four toots' 0.208 s apart.
- 'whistled' / 'times': follows the picture: 3 puffs. The picture draws exactly 3 counted puffs from 'whistled' (fx whistle_puffs_counted, s 1.6), so the mix plays exactly 3 toots, one on each puff, at 57.267, 57.686, 58.105 s. The sound plan's separate toots on 'times' (whistle_3 at 58.47 s) are removed: no sound is placed there. The approved picture wins over the sound plan here.
- whistle_far_soft has no count in its name: it is 2 soft far toots, one on each of the two hearing rings the picture draws on Jack.
- Knocks: the library has no door knock. Mom's = `HammerHitWood` x3 on the three knock rings of the picture; the mailman's = `Wood2X4Impact` x2 (heavier), 2 and 11 frames after his word, no picture event.
- Boots: the library has no gravel walk. Used boots on gritty concrete plus a gravel impact under each step.
- Rows marked `(extra, picture)` are not in sound_events.json: one lever clank and four train moves the picture shows, plus the steam wipe at frame 716. They are kept low; delete them in `build_mix.py` (section 'extras') if not wanted.

## Music

One library track: **Pizzicato Comedy.mp3** (110.0 bpm). Cut to the film in the track's own silences, no stretch:

| Film (s) | Track (s) | What |
|---|---|---|
| 0.00 - 57.81 | 2.79 - 60.60 | sections A + B, from the downbeat of bar 2 |
| 57.81 - 77.63 | 80.51 - 100.33 | section D + the track's own two-hit ending |

The track's own two-hit ending lands at 76.64 and 77.19 s (measured; the voice ends at 77.15 s), then a 0.16 s fade to the last sample. The last hit is let through the duck because the voice is done.

Bed EQ: 35 Hz high-pass, low shelf -8 dB at 200 Hz (the track is mostly double-bass energy; this keeps the plucked strings audible at 20 dB under the voice), -3 dB at 3 kHz for the voice.

## Ambience

| From (s) | To (s) | Set | Level (LUFS, before duck and master) | Sources |
|---|---|---|---|---|
| 0.00 | 65.43 | junction: daytime veld | -36 | wind: synth (sfx_gen.breeze); insects: AmbDayInsects_BU01.1.mp3 (looped); birds: BirdChirp_SEU02.1.mp3, BirdSandpiper_S08AN.33.mp3 |
| 65.43 | 70.13 | office: room tone + clock | room -42, clock tick 24 dB under the voice | room tone: Ambiences (Room filler).wav; clock: Clock Tick.mp3 |
| 70.13 | 77.63 | junction: daytime veld | -36 | wind: synth (sfx_gen.breeze); insects: AmbDayInsects_BU01.1.mp3 (looped); birds: BirdChirp_SEU02.1.mp3, BirdSandpiper_S08AN.33.mp3 |

## Events

Level = where the cue is set: its loudest 50 ms that many dB under the usual level of the voice while the voice ducks it. Stem `sfx` is ducked 13 dB by the voice, `hero` 5 dB; in the few pauses of the voice a cue comes up by that much. `(extra, picture)` = not in sound_events.json, added because the picture shows it.

In the mix = the cue's own loudest 50 ms as delivered (after duck and master), and how far that is under the usual level of the voice (-16.7 dBFS, median 50 ms while talking).

| Time (s) | Word | Event | Sound | Source | Level | Stem | Align | In the mix (dBFS) | Under the voice (dB) |
|---|---|---|---|---|---|---|---|---|---|
| 1.200 | frame 36 | lever_clank | lever thrown: ratchet travel, lands on the anchor | LeverMechanical_SEU04.39.mp3 | 10 dB under the voice | sfx | peak | -26.7 | 10.0 |
| 1.200 | frame 36 | lever_clank | lever clank: iron body | ImpactMetal_S08IM.404.mp3 | 12 dB under the voice | sfx | peak | -28.7 | 12.0 |
| 1.333 | frame 40 | signal_arm_up | signal wire cranks the arm up (arm moves f36-56) | LeverCrankLong_SEU02.34.mp3 | 15 dB under the voice | sfx | start | -31.7 | 15.0 |
| 1.453 | frame 40 +0.12 | signal_arm_up | arm pivot squeak | MetalHingeSqueak_S011FO.667.mp3 | 18 dB under the voice | sfx | start | -34.7 | 18.0 |
| 6.867 | train#1 | train_pass_far | a train rushes through, heard not seen (the accident; picture kick + red flash on the word); loudest on the anchor | synth | 9 dB under the voice | hero | start | -25.7 | 9.0 |
| 10.133 | baboon#1 | coin_ping | coin flick ping (coin glint) | CoinFlipLand_AP1.1081.mp3 | 13 dB under the voice | sfx | start | -29.9 | 13.2 |
| 13.567 | pushes#1 | trolley_wheels_loop | trolley wheels on the rails until it stops (f478): rolling hum, clack per push step, spark scrapes on trolley#1 and rails#1 | synth | 13 dB under the voice | sfx | start | -29.7 | 13.0 |
| 18.233 | pulling#1 | lever_clank | lever thrown: ratchet travel, lands on the anchor | LeverMechanical_SEU04.39.mp3 | 12 dB under the voice | sfx | peak | -28.7 | 12.0 |
| 18.233 | pulling#1 | lever_clank | lever clank: iron body | ImpactMetal_S08IM.404.mp3 | 14 dB under the voice | sfx | peak | -30.7 | 14.0 |
| 18.667 | levers#2 | lever_clank | lever thrown: ratchet travel, lands on the anchor | LeverMechanical_SEU04.39.mp3 | 12 dB under the voice | sfx | peak | -28.7 | 12.0 |
| 18.667 | levers#2 | lever_clank | lever clank: iron body | ImpactMetal_S08IM.404.mp3 | 14 dB under the voice | sfx | peak | -30.7 | 14.0 |
| 19.500 | train#2 | train_arrive_brakes | engine slides in and stops (f551-596): chuffs slowing, brake squeal from the anchor -0.4 s until just before the toot, buffer clunk at the stop, steam sigh | synth | 11 dB under the voice | sfx | start | -27.7 | 11.0 |
| 19.733 | toots#1 | whistle_1 | steam whistle, 1 toot | TrainWhistle_BWU.166.mp3 (first toot, 0.16 s unit) | 7 dB under the voice | hero | toot starts on the picture's steam puffs | -23.7 | 7.0 |
| 21.867 | key#1 | key_jingle | key ring jingle | synth | 13 dB under the voice | sfx | start | -29.7 | 13.0 |
| 21.917 | key#1 +0.05 | key_jingle | key scrape off the hook | SkeletonKeyRemove_S011FO.794.mp3 | 15 dB under the voice | sfx | start | -31.7 | 15.0 |
| 24.133 | frame 716 (steam transition) | (extra, picture) | steam wipe between the two trains | synth | 15 dB under the voice | sfx | peak | -31.4 | 14.7 |
| 24.433 | lady#1 -10f | train_roll_stop | the lady's train rolls up and stops (f711-735): slow clack, soft squeal, clunk, steam sigh | synth | 14 dB under the voice | sfx | start | -30.7 | 14.0 |
| 27.367 | baboon#2 +12f | (extra, picture) | lever clank the picture draws (fx lever_clank), no sound event | LeverMechanical_SEU04.39.mp3 | 15 dB under the voice | sfx | peak | -31.7 | 15.0 |
| 27.367 | baboon#2 +12f | (extra, picture) | lever clank: iron body | ImpactMetal_S08IM.404.mp3 | 17 dB under the voice | sfx | peak | -33.7 | 17.0 |
| 28.603 | screams#1 -0.03 | lady_scream | the lady screams | short-woman-panic-scream_zJsEZS4_-SBA-300055118.wav | 5.5 dB under the voice | hero | start | -22.2 | 5.5 |
| 30.600 | writes#1 | paper_flutter | letters flutter out of the carriage | Multiple Paper Turn.wav | 13 dB under the voice | sfx | start | -29.7 | 13.0 |
| 30.750 | writes#1 +0.15 | paper_flutter | more paper in the air | Rustling Paper 1.wav | 16 dB under the voice | sfx | start | -32.7 | 16.0 |
| 32.400 | inspector#1 | boots_on_gravel | inspector's boots, 4 steps (first step on the anchor) | FOLYFeet_Footsteps Boots Walk Concrete Gritty Distance_Ocular Sounds_All-Round Footsteps_The Complete Footsteps Collection.wav | 12 dB under the voice | sfx | clip 0.11 s on anchor | -28.7 | 12.0 |
| 32.400 | inspector#1 +0.00 | boots_on_gravel | gravel crunch under step 1 | ImpactGravel_S08IM.311.mp3 | 17 dB under the voice | sfx | peak | -33.7 | 17.0 |
| 32.600 | picture f978-1032 | (extra, picture) | the lady's train pulls away | synth | 18 dB under the voice | sfx | start | -34.7 | 18.0 |
| 32.980 | inspector#1 +0.58 | boots_on_gravel | gravel crunch under step 2 | ImpactGravel_S08IM.311.mp3 | 18 dB under the voice | sfx | peak | -34.7 | 18.0 |
| 33.540 | inspector#1 +1.14 | boots_on_gravel | gravel crunch under step 3 | ImpactGravel_S08IM.311.mp3 | 17 dB under the voice | sfx | peak | -33.7 | 17.0 |
| 34.130 | inspector#1 +1.73 | boots_on_gravel | gravel crunch under step 4 | ImpactGravel_S08IM.311.mp3 | 18 dB under the voice | sfx | peak | -34.7 | 18.0 |
| 43.767 | train#4 | train_pass_fast | train 1 of 'train after train' (f1301-1353): already loud on the anchor, loudest alongside Jack at 44.04 s (picture kick) | synth | 10 dB under the voice | sfx | start | -26.7 | 10.0 |
| 45.860 | picture f1358-1404 | (extra, picture) | another train of 'train after train' passes behind Jack, alongside at 45.86 s | synth | 15 dB under the voice | sfx | start | -31.7 | 15.0 |
| 47.467 | toots#2 | whistle_2 | steam whistle, 2 toots, 0.461 s apart | TrainWhistle_BWU.166.mp3 (first toot, 0.16 s unit) | 7 dB under the voice | hero | toot starts on the picture's steam puffs | -23.7 | 7.0 |
| 47.674 | picture f1407-1467 | (extra, picture) | another train of 'train after train' passes behind Jack, alongside at 47.67 s | synth | 15 dB under the voice | sfx | start | -31.7 | 15.0 |
| 48.867 | lever#1 | lever_clank | lever thrown: ratchet travel, lands on the anchor | LeverMechanical_SEU04.39.mp3 | 12 dB under the voice | sfx | peak | -28.7 | 12.0 |
| 48.867 | lever#1 | lever_clank | lever clank: iron body | ImpactMetal_S08IM.404.mp3 | 14 dB under the voice | sfx | peak | -30.7 | 14.0 |
| 49.667 | toots#3 | whistle_4 | steam whistle, 4 toots, 0.208 s apart | TrainWhistle_BWU.166.mp3 (first toot, 0.16 s unit) | 7 dB under the voice | hero | toot starts on the picture's steam puffs | -23.7 | 7.0 |
| 49.841 | picture f1472-1532 | (extra, picture) | another train of 'train after train' passes behind Jack, alongside at 49.84 s | synth | 15 dB under the voice | sfx | start | -31.7 | 15.0 |
| 50.567 | key#2 | key_jingle | key ring jingle | synth | 13 dB under the voice | sfx | start | -30.3 | 13.6 |
| 50.617 | key#2 +0.05 | key_jingle | key scrape off the hook | SkeletonKeyRemove_S011FO.794.mp3 | 15 dB under the voice | sfx | start | -31.7 | 15.0 |
| 51.800 | up#4 | train_pass_fast_close | the last train passes the lens on the anchor (kick 2.5), carriages stream past to f1636 | synth | 6 dB under the voice | hero | start | -22.7 | 6.0 |
| 51.800 | up#4 | train_pass_fast_close | air slap as the engine passes | Air Tail Woosh.wav | 9 dB under the voice | hero | peak | -25.7 | 9.0 |
| 55.200 | notes#1 | pages_flip | inspector flips through his notebook | ManualFlip_AP1.1243.mp3 | 12 dB under the voice | sfx | clip 0.11 s on anchor | -23.4 | 6.7 |
| 56.500 | picture f1695-1740 | (extra, picture) | a train comes up the main line and stops (seen from above) | synth | 17 dB under the voice | sfx | start | -33.7 | 17.0 |
| 57.267 | whistled#1 (follows the picture: 3 puffs; the plan said whistle_2) | whistle_3 on 'whistled' (follows the picture: 3 puffs) | steam whistle, 3 toots, 0.419 s apart | TrainWhistle_BWU.166.mp3 (first toot, 0.16 s unit) | 7 dB under the voice | hero | toot starts on the picture's steam puffs | -23.7 | 7.0 |
| 61.067 | knock#1 -2f | knock_3 | mom's knock 1 of 3 (light, quick) | HammerHitWood_S011IN.300.mp3 | 9 dB under the voice | hero | peak | -25.7 | 9.0 |
| 61.300 | knock#1 +5f | knock_3 | mom's knock 2 of 3 (light, quick) | HammerHitWood_S011IN.300.mp3 | 10 dB under the voice | hero | peak | -26.7 | 10.0 |
| 61.533 | knock#1 +12f | knock_3 | mom's knock 3 of 3 (light, quick) | HammerHitWood_S011IN.300.mp3 | 8 dB under the voice | hero | peak | -24.7 | 8.0 |
| 61.700 | mailman's#1 +0.07 | knock_2 | the mailman's knock 1 of 2 (heavy, slow) | Wood2X4Impact_AP1.1218.mp3 | 5 dB under the voice | hero | peak | -21.7 | 5.0 |
| 62.000 | mailman's#1 +0.37 | knock_2 | the mailman's knock 2 of 2 (heavy, slow) | Wood2X4Impact_AP1.1218.mp3 | 5 dB under the voice | hero | peak | -22.9 | 6.2 |
| 64.633 | listening#1 (rings -0.20 / +0.27 s) | whistle_far_soft | steam whistle, 2 toots, 0.467 s apart, far: low-passed + reverb | TrainWhistle_BWU.166.mp3 (first toot, 0.16 s unit) | 14 dB under the voice | hero | toot starts on the two hearing rings | -30.7 | 14.0 |
| 65.433 | frame 1963 | whistle_steam_whoosh | steam whites out the cut to the office | synth | 11 dB under the voice | sfx | peak | -27.7 | 11.0 |
| 65.433 | frame 1963 | whistle_steam_whoosh | air whoosh under the steam | Air Tail Woosh.wav | 13 dB under the voice | sfx | peak | -29.7 | 13.0 |
| 68.367 | letter#1 | stamp_thump | rubber stamp hits the letter: wood crack | ImpactWoodHit_S011IM.354.mp3 | 1 dB under the voice | hero | peak | -17.7 | 1.0 |
| 68.367 | letter#1 | stamp_thump | stamp: knock | HammerHitWood_S011IN.300.mp3 | 4 dB under the voice | hero | peak | -20.7 | 4.0 |
| 71.533 | cents#1 | coins_drop | twenty cents into the hand | CoinsDrop_AP1.1086.mp3 | 13 dB under the voice | sfx | peak | -29.7 | 13.0 |
| 73.000 | beer#1 | bottle_clink | beer bottle clink | GlassBottle_AP1.1198.mp3 | 12 dB under the voice | sfx | peak | -28.7 | 12.0 |
| 76.367 | single#3 | lever_creak_ready | Jack's hand settles on the lever: slow creak | LeverSqueakSlow_S08CT.101.mp3 | 12 dB under the voice | sfx | clip 0.03 s on anchor | -28.7 | 12.0 |


> Note for this edition: the mix script and the music and sound-effect files of this film are not included (they came from a private sound library). This page is kept as an example of a finished cue list and its measured gates. Build your own sound with `templates/audio/` or with files you have a licence for.
