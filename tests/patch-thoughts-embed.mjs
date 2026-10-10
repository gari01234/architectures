import {readFileSync,writeFileSync} from 'node:fs';
import {Script} from 'node:vm';
const file='dear_thoughts.html';
let source=readFileSync(file,'utf8');
function replaceOnce(a,b){
  if(source.split(a).length!==2)throw Error('Source anchor changed: '+a.slice(0,70));
  source=source.replace(a,b);
}
replaceOnce("if(p.get('hide')==='1') toggleTexts();",
"// hide=1 must remain hidden after init; no second toggle.\n       if(p.get('hide')==='1' && textsVisible) toggleTexts();");
replaceOnce("      generateCycleScene(today);\n      toggleTexts();\n      animate();",
"      generateCycleScene(today);\n      // Default and embedded views both enter the clean scene once.\n      if(textsVisible) toggleTexts();\n      animate(performance.now());");
replaceOnce(
"    function animate(){\n  requestAnimationFrame(animate);\n \n  if (!isPaused){\n    permutationGroup.children.forEach(o=>{\n      if (o.userData && o.userData.rotationSpeed) o.rotation.y += o.userData.rotationSpeed;\n    });\n  }\n \n  if (controls) controls.update();\n  renderer.render(scene, camera);\n}",
\`    // Rotation rules are expressed as radians per nominal 60Hz frame.
    // Use visible elapsed time (not rendered frame count) for equivalent speeds.
    let animationFrameId=0, lastAnimationAt=null;
    document.addEventListener('visibilitychange',()=>{
      lastAnimationAt=null;
      if(!document.hidden&&!animationFrameId)animationFrameId=requestAnimationFrame(animate);
    });
    function animate(timestamp){
      animationFrameId=0;
      if(document.hidden){lastAnimationAt=null;return;}
      animationFrameId=requestAnimationFrame(animate);
      const now=Number.isFinite(timestamp)?timestamp:performance.now();
      // Bound long throttling gaps so a resumed tab does not suddenly jump.
      const elapsedMs=lastAnimationAt===null?0:Math.min(100,Math.max(0,now-lastAnimationAt));
      lastAnimationAt=now;
      const frameScale=elapsedMs/(1000/60);
      if(!isPaused&&frameScale>0){
        permutationGroup.children.forEach(o=>{
          if(o.userData&&o.userData.rotationSpeed)
            o.rotation.y+=o.userData.rotationSpeed*frameScale;
        });
      }
      if(controls)controls.update();
      renderer.render(scene,camera);
    }\`);
const scripts=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
for(const inline of scripts)if(inline.trim())new Script(inline,{filename:file});
if(!source.includes("&& textsVisible) toggleTexts()")||!source.includes('rotationSpeed*frameScale'))throw Error('Patch contract failed');
writeFileSync(file,source);
console.log('Patched original Thoughts without modifying its combinatorial rules. Validated '+scripts.length+' script blocks.');
