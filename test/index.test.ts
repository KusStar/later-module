import { describe, expect, it } from 'vitest'
import LazyModule from '../src/index';
import { readFileSync } from 'fs';
import { join } from 'path';
describe('LazyModule', () => {
  const lazyModule = new LazyModule({
    cwd: __dirname,
  });

  it('install', async () => {
    await lazyModule.install('kusstar');
    expect(lazyModule.installed.has('kusstar')).toBe(true);
    expect(lazyModule.installed.get('kusstar')).toBe('0.3.0');
  });

  it('require', () => {
    // Get the typings from devDependencies
    type Kusstar = typeof import('kusstar')
    
    const kusstar = lazyModule.require<Kusstar>('kusstar');
    expect(kusstar).not.toBe(undefined);
    if (kusstar) {
      const { positions, cells, colors, normals } = kusstar
      expect(Array.isArray(positions)).toBe(true);
      expect(Array.isArray(cells)).toBe(true);
      expect(Array.isArray(colors)).toBe(true);
      expect(Array.isArray(normals)).toBe(true);
    }
  })

  it('later-lock', () => {
    const laterLock = readFileSync(join(__dirname, './later-modules/later-lock.json'), 'utf-8')
    expect(laterLock).toBe(JSON.stringify({
      "kusstar": "0.3.0"
    }, null, 2))
  })
})