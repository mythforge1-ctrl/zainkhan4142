# solution: lock file lets parallel builders share the one-Chrome-render rule

**Problem:** the pitfall "parallel-chrome-renders-kill-batches" forces one Chrome render at a time,
which used to serialize whole build agents even though their CODE work is independent.
**Solution:** run builders in parallel but gate only the render step with a lock file:
before each render, loop while `C:/remotion-tmp/render.lock` exists (sleep 15 s, give up + report
after 10 min), then create the lock, render ONE still, delete the lock. TEMP/TMP=C:/remotion-tmp as always.
**Why it works:** renders are seconds-long; builds are minutes-long. The lock serializes only the
scarce resource (Chrome) and keeps everything else concurrent.
**Used:** EP01 build wave (S1/S4 builder + S2/S3 builder rendering first-light stills concurrently).
**Detect misuse:** a stale lock older than ~15 min means a builder crashed mid-render — delete it.
**Creativity gap:** a tiny render-queue daemon could take named jobs and return stills to all
builders, letting N agents request renders without any waiting loops.
