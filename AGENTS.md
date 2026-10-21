# Music theory

Run `npm run check` before committing code. Commit atomically and push completed work.

Reuse the Biome formatter and strict quality gate. Every production and tooling function must have CRAP < 8, and each function/file must have MI > 70 on the classic 171-point scale. Do not weaken thresholds, exclude new production modules, or invent coverage. Tests and config are excluded from the metrics; application and quality scripts are included.

Keep musical transformations pure, audio lifecycle explicit, and UI functions small. Preserve accessible native controls and local-only operation. Update tests for changes to musical invariants, playback cancellation, or persistence validation.
