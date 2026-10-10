import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const src=readFileSync(new URL('../dear_thoughts.html',import.meta.url),'utf8');
test('all inline Thoughts scripts have valid JavaScript syntax',()=>{
  const scripts=[...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length>2);
  for(const [i,s] of scripts.entries())if(s[1].trim())new Script(s[1],{filename:'dear_thoughts.html#'+i});
});
test('embedded hide=1 remains a clean scene without toggling twice',()=>{
  assert.match(src,/if\(p\.get\('hide'\)==='1' && textsVisible\) toggleTexts\(\);/);
  assert.match(src,/generateCycleScene\(today\);\s*\/\/[^\n]*\n\s*if\(textsVisible\) toggleTexts\(\);/);
  assert.match(src,/const ids = \[\s*'controls'/);
  assert.ok(src.includes("const miniBtns = ['permNextButton']"));
});
test('the original per-frame rotation and animation lifecycle are preserved',()=>{
  const start=src.indexOf('    function animate(){');
  const end=src.indexOf('\n \n \n \n      init();',start);
  assert.ok(start>=0&&end>start);
  const body=src.slice(start,end);
  assert.ok(body.includes('requestAnimationFrame(animate);'));
  assert.ok(body.includes('if (!isPaused){'));
  assert.ok(body.includes('o.rotation.y += o.userData.rotationSpeed;'));
  assert.ok(body.includes('renderer.render(scene, camera);'));
  assert.ok(src.includes('      animate();'));
  assert.ok(!src.includes('frameScale'));
  assert.ok(!src.includes('lastAnimationAt'));
  assert.ok(!src.includes("document.addEventListener('visibilitychange'"));
});
test('canonical combinatorial engine remains present',()=>{
  assert.match(src,/const P120 = cperms\(\[1,2,3,4,5\]\)/);
  assert.match(src,/function isUniversallyAdmissible\(perms\)/);
  assert.match(src,/const TRIES_PER_N = 400;/);
  assert.match(src,/Math\.pow\(2,\(119-clehmer\(p\)\)\/5\)/);
});
