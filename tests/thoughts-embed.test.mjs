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
test('same rotation rule is normalized to elapsed visible time and never catches up after suspension',()=>{
  assert.match(src,/const frameScale=elapsedMs\/\(1000\/60\)/);
  assert.match(src,/o\.rotation\.y\+=o\.userData\.rotationSpeed\*frameScale/);
  assert.match(src,/const elapsedMs=lastAnimationAt===null\?0:Math\.min\(100,Math\.max\(0,now-lastAnimationAt\)\)/);
  assert.match(src,/if\(document\.hidden\)\{lastAnimationAt=null;return;\}/);
  assert.match(src,/document\.addEventListener\('visibilitychange'/);
  assert.ok(!src.includes('o.rotation.y += o.userData.rotationSpeed;'));
});
test('canonical combinatorial engine remains present',()=>{
  assert.match(src,/const P120 = cperms\(\[1,2,3,4,5\]\)/);
  assert.match(src,/function isUniversallyAdmissible\(perms\)/);
  assert.match(src,/const TRIES_PER_N = 400;/);
  assert.match(src,/Math\.pow\(2,\(119-clehmer\(p\)\)\/5\)/);
});
