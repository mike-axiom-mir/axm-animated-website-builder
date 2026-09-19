import { SCENE_STATES, validateProject } from "../model/project.js";

function escapeInlineJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function buildStandaloneHtml(project) {
  const check = validateProject(project);
  if (!check.ok) throw new Error(check.holds.join(", "));

  const states = escapeInlineJson(SCENE_STATES);
  const data = escapeInlineJson(project);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${project.title.replaceAll("<", "&lt;")}</title><style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#030b12;color:#f5fbff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}body{overflow:hidden}
#world{position:fixed;inset:0;width:100%;height:100%;z-index:0}.media{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.shade{position:fixed;inset:0;z-index:1;background:linear-gradient(180deg,rgba(2,8,14,.06),rgba(2,8,14,.15) 55%,rgba(2,8,14,.7));pointer-events:none}
.page{position:relative;z-index:2;min-height:100vh;display:grid;grid-template-rows:auto 1fr auto;padding:clamp(20px,4vw,60px)}nav{display:flex;justify-content:space-between;letter-spacing:.18em;font-size:12px}.brand{font-weight:800;font-size:18px}.hero{align-self:center;text-align:center}.hero>div{display:inline-block;padding:clamp(24px,4vw,56px);border-radius:8px}.glass{background:rgba(3,13,21,.48);border:1px solid rgba(126,226,255,.22);backdrop-filter:blur(18px)}.solid{background:#06121c}.clear{background:transparent}
h1{font-size:clamp(42px,7vw,94px);line-height:.94;margin:0 0 20px;letter-spacing:-.055em}p{letter-spacing:.42em;font-size:11px;color:#b8d1dd}.cta{margin-top:28px;border:1px solid #3de7ff;background:rgba(2,14,22,.72);color:#fff;padding:15px 25px;border-radius:6px;font-weight:700}.foot{display:flex;justify-content:space-between;color:#9ab0bc;font-size:11px;letter-spacing:.12em}.exit{position:fixed;right:20px;bottom:20px;z-index:4;display:none}
body.playing .page{pointer-events:none;opacity:.24}body.playing .exit{display:block;pointer-events:auto}
</style></head><body>
<div id="media-root"></div><canvas id="world"></canvas><div class="shade"></div>
<main class="page"><nav><span class="brand">△ AXM</span><span>ANIMATED WEBSITE</span></nav><section class="hero"><div class="${project.page.surface}"><h1>${project.title.replaceAll("<", "&lt;")}</h1><p>${project.eyebrow.replaceAll("<", "&lt;")}</p><button class="cta" id="enter">${project.background.type === "game" ? "Enter world" : project.action.replaceAll("<", "&lt;")}</button></div></section><footer class="foot"><span>LIVE FRONTEND LAYER</span><span>BUILT WITH AXM</span></footer></main>
<button class="cta exit" id="exit">Return to page</button>
<script>const P=${data},STATES=${states};
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,t=0,playing=false,keys={};
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();
function poly(points,fill,stroke){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function world(){const s=STATES[P.background.state],t0=t*s.speed;let g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgb('+s.sky.join(',')+')');g.addColorStop(.65,'rgb(13,43,55)');g.addColorStop(1,'#02070b');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba('+s.sun.join(',')+',.9)';ctx.beginPath();ctx.arc(w*.24,h*.31,Math.min(w,h)*.055,0,7);ctx.fill();
for(let layer=0;layer<3;layer++){let base=h*(.55+layer*.12),step=Math.max(80,w/12);for(let x=-step;x<w+step;x+=step){let y=base-Math.abs(Math.sin((x*.009)+layer*1.7))*h*(.12-layer*.02);poly([[x-step,y+130],[x,y],[x+step,y+130]],['#0c2c37','#08212b','#061820'][layer])}}
ctx.fillStyle='#07151c';ctx.fillRect(0,h*.72,w,h*.28);for(let i=0;i<22;i++){let x=(i*173+P.background.seed*47)%w,y=h*.48+(i%5)*38,hh=80+(i*31)%170,ww=26+(i*13)%52;ctx.fillStyle=i%3?'#0a2029':'#0e2a34';ctx.fillRect(x,y-hh,ww,hh);ctx.fillStyle='rgba('+s.accent.join(',')+',.75)';for(let q=8;q<ww-5;q+=13)for(let z=12;z<hh-8;z+=20)if((q+z+i)%4)ctx.fillRect(x+q,y-hh+z,3,7)}
ctx.strokeStyle='rgba('+s.accent.join(',')+',.65)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,h*.77);ctx.bezierCurveTo(w*.25,h*(.7+Math.sin(t0)*.01),w*.65,h*.89,w,h*.68);ctx.stroke();for(let i=0;i<9;i++){let x=((i*211+t0*22)% (w+100))-50,y=h*(.2+(i%4)*.08);ctx.fillStyle='#102e3a';ctx.fillRect(x,y,34,10);ctx.fillStyle='rgba('+s.accent.join(',')+',.9)';ctx.fillRect(x-7,y+3,8,3)}
let px=w*.5,py=h*.52;if(P.background.type==='game'){px+=(keys.ArrowRight?1:0)*t%90;ctx.fillStyle='#48eaff';poly([[px,py-18],[px+14,py+13],[px,py+7],[px-14,py+13]],'#48eaff');ctx.fillStyle='#fff';ctx.fillText(playing?'ARROW KEYS · PILOTING':'ENTER WORLD TO PILOT',24,h-30)}
}
function frame(ms){t=ms/1000;if(P.background.type==='world'||P.background.type==='game')world();requestAnimationFrame(frame)}
if(P.background.type==='video'||P.background.type==='image'){canvas.hidden=true;let el=document.createElement(P.background.type==='video'?'video':'img');el.className='media';el.src=P.background.mediaUrl;if(el.tagName==='VIDEO'){el.autoplay=true;el.muted=true;el.loop=true;el.playsInline=true}document.querySelector('#media-root').append(el)}else requestAnimationFrame(frame);
addEventListener('keydown',e=>keys[e.key]=true);addEventListener('keyup',e=>keys[e.key]=false);document.querySelector('#enter').onclick=()=>{if(P.background.type==='game'){playing=true;document.body.classList.add('playing')}};document.querySelector('#exit').onclick=()=>{playing=false;document.body.classList.remove('playing')};
</script></body></html>`;
}

export function downloadStandaloneSite(project) {
  const html = buildStandaloneHtml(project);
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "axm-animated-site.html";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
