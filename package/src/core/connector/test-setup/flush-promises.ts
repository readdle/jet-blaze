export async function flushPromises(ticks = 1): Promise<void> {
  // eslint-disable-next-line functional/no-let
  for (let currentTick = 0; currentTick < ticks; currentTick += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}
