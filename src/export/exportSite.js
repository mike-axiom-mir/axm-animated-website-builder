import { SCENE_RECIPES } from "../model/choreography.js";
import { MOTION_PROFILES, SCENE_STATES, validateProject } from "../model/project.js";

function escapeInlineJson(value) { return JSON.stringify(value).replaceAll("<", "\\u003c"); }
function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function safeHref(value = "") {
  const href = String(value).trim();
  if (href.startsWith("#") || href.startsWith("https://") || href.startsWith("mailto:")) return escapeHtml(href);
  return "#";
}
function renderNavigation(project) {
  return (project.page.navigation || []).map((item) => `<a href="${safeHref(item.href)}">${escapeHtml(item.label)}</a>`).join("");
}
function transitionAttrs(transition) {
  const item = transition || { type: "none", duration: 0, delay: 0 };
  return `data-transition="${escapeHtml(item.type)}" style="--reveal-duration:${Number(item.duration)}ms;--reveal-delay:${Number(item.delay)}ms"`;
}
function renderSections(project) {
  return (project.page.sections || []).map((section) => {
    const points = (section.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("");
    const links = (section.links || []).map((link) => {
      const external = String(link.href || "").startsWith("https://");
      return `<a class="section-link" href="${safeHref(link.href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`;
    }).join("");
    const visibility = `${section.visibility?.desktop === false ? " section-desktop-off" : ""}${section.visibility?.mobile === false ? " section-mobile-off" : ""}`;
    return `<section class="site-section surface-${escapeHtml(section.surface || "clear")} reveal reveal-${escapeHtml(section.transition?.type || "none")}${visibility}" id="${escapeHtml(section.id)}" data-scene-target="${escapeHtml(section.id)}" ${transitionAttrs(section.transition)}>
      <div class="section-label"><span>${escapeHtml(section.eyebrow || "")}</span><i></i></div>
      <div class="section-copy"><h2>${escapeHtml(section.title || "")}</h2><p>${escapeHtml(section.body || "")}</p>${points ? `<ul>${points}</ul>` : ""}${links ? `<div class="section-links">${links}</div>` : ""}</div>
    </section>`;
  }).join("");
}

export function buildStandaloneHtml(project) {
  const check = validateProject(project);
  if (!check.ok) throw new Error(check.holds.join(", "));

  const states = escapeInlineJson(SCENE_STATES);
  const profiles = escapeInlineJson(MOTION_PROFILES);
  const recipes = escapeInlineJson(SCENE_RECIPES);
  const data = escapeInlineJson(project);
  const navigation = renderNavigation(project);
  const sections = renderSections(project);
  const firstSection = project.page.sections?.[0]?.id ? `#${project.page.sections[0].id}` : "#";
  const footer = project.page.footer || {};
  const heroNote = project.page.heroNote ? `<small class="hero-note">${escapeHtml(project.page.heroNote)}</small>` : "";
  const actionMarkup = project.background.type === "game"
    ? '<button class="cta" id="enter" type="button">Enter world</button>'
    : `<a class="cta" href="${safeHref(firstSection)}">${escapeHtml(project.action)}</a>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(project.title)}</title><style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#030b12;color:#f5fbff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}html{scroll-behavior:smooth}body{overflow:hidden}
#world{position:fixed;inset:0;width:100%;height:100%;z-index:0}.media{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.shade{position:fixed;inset:0;z-index:1;background:radial-gradient(circle at 52% 42%,transparent 0 26%,rgba(1,7,12,.08) 54%,rgba(1,6,10,.64) 115%),linear-gradient(180deg,rgba(2,8,14,.08),rgba(2,8,14,.16) 55%,rgba(2,8,14,.72));pointer-events:none}
.page{position:fixed;inset:0;z-index:2;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth}.page::-webkit-scrollbar{width:8px}.page::-webkit-scrollbar-thumb{background:#173846;border-radius:10px}
nav{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:24px clamp(20px,4vw,60px);letter-spacing:.17em;font-size:11px;text-transform:uppercase;background:linear-gradient(180deg,rgba(2,9,14,.82),rgba(2,9,14,.38),transparent);backdrop-filter:blur(10px)}
.nav-links{display:flex;gap:28px}.nav-links a{color:#b9ced6;text-decoration:none}.nav-links a:hover{color:#fff}.brand{font-weight:800;font-size:16px;color:#eefcff;text-decoration:none}
.hero{min-height:calc(100vh - 68px);display:grid;place-items:center;padding:84px clamp(20px,4vw,60px) 64px;text-align:center}.hero>div{display:inline-block;max-width:1060px;padding:clamp(24px,4vw,58px);border-radius:10px}.glass{background:rgba(3,13,21,.48);border:1px solid rgba(126,226,255,.22);backdrop-filter:blur(18px)}.solid{background:#06121c}.clear{background:transparent}
h1{font-size:clamp(46px,7.4vw,112px);line-height:.92;margin:0 0 22px;letter-spacing:-.058em;font-weight:590;text-wrap:balance;text-shadow:0 7px 34px rgba(0,0,0,.46)}.hero p{margin:0 0 15px;letter-spacing:.44em;font-size:11px;color:#c8dce2;text-transform:uppercase}.cta{width:max-content;min-width:178px;height:54px;display:inline-flex;align-items:center;justify-content:center;margin-top:28px;border:1px solid #3de7ff;background:rgba(2,14,22,.72);color:#fff;padding:0 25px;border-radius:6px;font-weight:700;text-decoration:none;cursor:pointer}.hero-note{display:block;max-width:680px;margin:22px auto 0;color:#99b3bd;font-size:12px;line-height:1.65;letter-spacing:.04em}
.sections{width:min(1120px,calc(100% - 40px));margin:0 auto;padding:38px 0 110px;display:grid;gap:26px}.site-section{display:grid;grid-template-columns:minmax(140px,.38fr) minmax(0,1fr);gap:clamp(24px,5vw,78px);padding:clamp(30px,5vw,66px);border-radius:12px;scroll-margin-top:92px}.site-section.surface-glass{border:1px solid rgba(109,220,244,.21);background:rgba(3,17,25,.57);backdrop-filter:blur(20px)}.site-section.surface-solid{border:1px solid rgba(109,205,232,.14);background:rgba(5,20,29,.94)}.site-section.surface-clear{border-top:1px solid rgba(114,205,227,.2);border-bottom:1px solid rgba(114,205,227,.1)}
.section-label{display:flex;align-items:flex-start;gap:14px;color:#70eafa;font-size:10px;font-weight:750;letter-spacing:.28em;text-transform:uppercase}.section-label i{height:1px;flex:1;min-width:20px;margin-top:7px;background:linear-gradient(90deg,rgba(61,231,255,.55),transparent)}
.section-copy h2{max-width:820px;margin:0;color:#f3fbfd;font-size:clamp(32px,4.2vw,64px);line-height:1;letter-spacing:-.045em;font-weight:560;text-wrap:balance}.section-copy>p{max-width:790px;margin:22px 0 0;color:#b5cbd3;font-size:clamp(14px,1.45vw,18px);line-height:1.75}.section-copy ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px;margin:28px 0 0;padding:0;list-style:none}.section-copy li{position:relative;padding:13px 14px 13px 28px;border-top:1px solid rgba(121,205,226,.14);color:#d5e8ed;font-size:12px;line-height:1.45}.section-copy li:before{content:"";position:absolute;left:9px;top:18px;width:6px;height:6px;border-radius:50%;background:#3de7ff;box-shadow:0 0 12px rgba(61,231,255,.55)}
.section-links{margin-top:30px}.section-link{display:inline-flex;align-items:center;gap:9px;padding:12px 15px;border:1px solid rgba(61,231,255,.5);border-radius:5px;color:#e5fbff;text-decoration:none;background:rgba(4,27,36,.58);font-size:12px;font-weight:700}
.foot{display:flex;justify-content:space-between;gap:24px;padding:30px clamp(20px,4vw,60px) 38px;color:#90aab4;font-size:10px;letter-spacing:.18em;text-transform:uppercase}.exit{position:fixed;right:20px;bottom:20px;z-index:4;display:none}
.reveal{opacity:0;transition:opacity var(--reveal-duration,650ms) cubic-bezier(.2,.7,.2,1) var(--reveal-delay,0ms),transform var(--reveal-duration,650ms) cubic-bezier(.2,.7,.2,1) var(--reveal-delay,0ms),filter var(--reveal-duration,650ms) ease var(--reveal-delay,0ms)}.reveal-rise{transform:translateY(28px)}.reveal-slide{transform:translateX(36px)}.reveal-zoom{transform:scale(.94);filter:blur(5px)}.reveal-none,.reveal.is-revealed{opacity:1;transform:none;filter:none}.site-section.section-desktop-off{display:none}
body.playing .page{pointer-events:none;opacity:.18;filter:blur(1px)}body.playing .exit{display:flex;pointer-events:auto}
@media(max-width:720px){nav{padding:20px}.nav-links{display:none}.hero{min-height:calc(100vh - 58px);padding:54px 18px 46px}.hero>div{width:100%;padding:26px 12px}.hero p{font-size:8px;line-height:1.8;letter-spacing:.25em}h1{font-size:clamp(44px,14vw,68px)}.hero-note{font-size:11px}.sections{width:calc(100% - 26px);padding-bottom:70px}.site-section{grid-template-columns:1fr;gap:24px;padding:26px 20px}.site-section.section-desktop-off:not(.section-mobile-off){display:grid}.site-section.section-mobile-off{display:none}.section-copy h2{font-size:clamp(34px,11vw,50px)}.section-copy ul{grid-template-columns:1fr}.foot{flex-direction:column;font-size:9px;line-height:1.7}}
@media(prefers-reduced-motion:reduce){html,.page{scroll-behavior:auto}.reveal{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}}
</style></head><body>
<div id="media-root"></div><canvas id="world"></canvas><div class="shade"></div>
<main class="page" id="page"><nav><a class="brand" href="#">△ AXM</a><div class="nav-links">${navigation}</div></nav>
<section class="hero" data-scene-target="hero"><div class="${escapeHtml(project.page.surface)} reveal reveal-${escapeHtml(project.page.heroTransition.type)}" ${transitionAttrs(project.page.heroTransition)}><p>${escapeHtml(project.eyebrow)}</p><h1>${escapeHtml(project.title)}</h1>${actionMarkup}${heroNote}</div></section>
${sections ? `<div class="sections">${sections}</div>` : ""}
<footer class="foot"><span>${escapeHtml(footer.left || "IDEAS SHAPE WORLDS")}</span><span>${escapeHtml(footer.right || "BUILT WITH AXM")}</span></footer></main>
<button class="cta exit" id="exit" type="button">Return to page</button>
<script>const P=${data},STATES=${states},PROFILES=${profiles},RECIPES=${recipes};
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d'),page=document.querySelector('#page');let w=0,h=0,dpr=1,t=0,playing=false,keys={},activeScene='hero',previous=performance.now();
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();
function poly(points,fill){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function seeded(seed,index){const x=Math.sin(seed*91.31+index*74.77)*43758.5453;return x-Math.floor(x)}
function lerp(a,b,x){return a+(b-a)*x}function lerpA(a,b,x){return a.map((v,i)=>lerp(v,b[i],x))}
function sceneCue(){if(activeScene==='hero')return P.page.heroSceneCue;const s=P.page.sections.find(x=>x.id===activeScene);return s?.sceneCue||P.page.heroSceneCue}
function resolveCue(cue){const c=cue||{recipe:'inherit',overrides:{}},r=(RECIPES[c.recipe]||RECIPES.inherit).config||{},o=c.overrides||{},rc=r.camera||{},oc=o.camera||{};return{state:o.state??r.state??P.background.state,motionProfile:o.motionProfile??r.motionProfile??P.background.motionProfile,motionScale:o.motionScale??r.motionScale??P.background.motionScale,atmosphere:o.atmosphere??r.atmosphere??P.background.atmosphere,atomIntensity:o.atomIntensity??r.atomIntensity??1,camera:{x:oc.x??rc.x??0,y:oc.y??rc.y??0,zoom:oc.zoom??rc.zoom??1},blendMs:o.blendMs??r.blendMs??800}}
function targetRuntime(){const c=P.page.choreography?.enabled?resolveCue(sceneCue()):resolveCue({recipe:'inherit',overrides:{}}),s=STATES[c.state]||STATES.idle,p=PROFILES[c.motionProfile]||PROFILES.drift;return{cue:c,sky:s.sky,sun:s.sun,accent:s.accent,stateSpeed:s.speed,motionSpeed:p.speed,motionScale:c.motionScale,atmosphere:c.atmosphere,atomIntensity:c.atomIntensity,cameraX:c.camera.x,cameraY:c.camera.y,cameraZoom:c.camera.zoom}}
const initial=targetRuntime(),live={sky:[...initial.sky],sun:[...initial.sun],accent:[...initial.accent],stateSpeed:initial.stateSpeed,motionSpeed:initial.motionSpeed,motionScale:initial.motionScale,atmosphere:initial.atmosphere,atomIntensity:initial.atomIntensity,cameraX:initial.cameraX,cameraY:initial.cameraY,cameraZoom:initial.cameraZoom};
function ease(dt){const x=targetRuntime(),ms=Math.max(0,x.cue.blendMs),a=ms===0?1:1-Math.exp(-(dt*1000)/Math.max(30,ms/4));live.sky=lerpA(live.sky,x.sky,a);live.sun=lerpA(live.sun,x.sun,a);live.accent=lerpA(live.accent,x.accent,a);for(const k of['stateSpeed','motionSpeed','motionScale','atmosphere','atomIntensity','cameraX','cameraY','cameraZoom'])live[k]=lerp(live[k],x[k],a)}
function tone(e){return e.tone==='sun'?live.sun:e.tone==='ice'?[205,246,255]:e.tone==='muted'?[112,148,160]:live.accent}
function atom(e,i){const mobile=w<=720;if(mobile&&e.visibility.mobile===false)return;if(!mobile&&e.visibility.desktop===false)return;const at=P.background.motion?t*live.motionSpeed*live.motionScale*e.speed:0;let r=Math.max(5,Math.min(w,h)*e.size),x=e.x*w,y=e.y*h,ph=e.phase||0;if(e.motion==='drift')x=((x+at*r*1.25+w+r)%(w+r*2))-r;else if(e.motion==='float')y+=Math.sin(at+ph)*r*.55;else if(e.motion==='pulse')r*=1+Math.sin(at*1.6+ph)*.22;else if(e.motion==='orbit'){x+=Math.cos(at+ph)*r*.7;y+=Math.sin(at+ph)*r*.7}const [rr,gg,bb]=tone(e),a=Math.min(1,e.opacity*live.atomIntensity);r*=Math.max(.35,Math.min(1.35,live.atomIntensity));ctx.save();if(e.type==='orb'){const g=ctx.createRadialGradient(x,y,0,x,y,r*1.8);g.addColorStop(0,'rgba('+rr+','+gg+','+bb+','+a+')');g.addColorStop(.28,'rgba('+rr+','+gg+','+bb+','+(a*.38)+')');g.addColorStop(1,'rgba('+rr+','+gg+','+bb+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*1.8,0,Math.PI*2);ctx.fill()}else if(e.type==='ring'){ctx.strokeStyle='rgba('+rr+','+gg+','+bb+','+a+')';ctx.lineWidth=Math.max(1,r*.08);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke()}else if(e.type==='beacon'){ctx.strokeStyle='rgba('+rr+','+gg+','+bb+','+(a*.65)+')';ctx.lineWidth=Math.max(1,r*.05);ctx.beginPath();ctx.moveTo(x,y-r*3);ctx.lineTo(x,y+r*3);ctx.stroke();ctx.fillStyle='rgba('+rr+','+gg+','+bb+','+a+')';ctx.beginPath();ctx.arc(x,y,Math.max(2,r*.15),0,Math.PI*2);ctx.fill()}else if(e.type==='stream'){ctx.strokeStyle='rgba('+rr+','+gg+','+bb+','+a+')';ctx.lineWidth=Math.max(1,r*.06);ctx.beginPath();ctx.moveTo(x-r*2.2,y);ctx.bezierCurveTo(x-r,y-r*(.4+Math.sin(at+ph)*.3),x+r,y+r*(.4+Math.cos(at+ph)*.3),x+r*2.2,y);ctx.stroke()}else if(e.type==='dust'){for(let q=0;q<16;q++){const an=seeded(P.background.seed+i,q)*Math.PI*2,di=seeded(P.background.seed+i+9,q)*r*2.3,px=x+Math.cos(an)*di+Math.sin(at+ph+q)*r*.2,py=y+Math.sin(an)*di+Math.cos(at+q)*r*.15,aa=a*(.25+seeded(i+5,q)*.65);ctx.fillStyle='rgba('+rr+','+gg+','+bb+','+aa+')';ctx.beginPath();ctx.arc(px,py,1+seeded(i+2,q)*2.1,0,Math.PI*2);ctx.fill()}}ctx.restore()}
function world(){let g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgb('+live.sky.join(',')+')');g.addColorStop(.65,'rgb(13,43,55)');g.addColorStop(1,'#02070b');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w*.5+live.cameraX*w,h*.5+live.cameraY*h);ctx.scale(live.cameraZoom,live.cameraZoom);ctx.translate(-w*.5,-h*.5);ctx.fillStyle='rgba('+live.sun.join(',')+',.9)';ctx.beginPath();ctx.arc(w*.24,h*.31,Math.min(w,h)*.055,0,7);ctx.fill();for(let layer=0;layer<3;layer++){let base=h*(.55+layer*.12),step=Math.max(80,w/12);for(let x=-step;x<w+step;x+=step){let y=base-Math.abs(Math.sin((x*.009)+layer*1.7))*h*(.12-layer*.02);poly([[x-step,y+130],[x,y],[x+step,y+130]],['#0c2c37','#08212b','#061820'][layer])}}ctx.fillStyle='#07151c';ctx.fillRect(-w*.1,h*.72,w*1.2,h*.38);for(let i=0;i<22;i++){let x=(i*173+P.background.seed*47)%w,y=h*.48+(i%5)*38,hh=80+(i*31)%170,ww=26+(i*13)%52;ctx.fillStyle=i%3?'#0a2029':'#0e2a34';ctx.fillRect(x,y-hh,ww,hh)}const t0=P.background.motion?t*live.stateSpeed*live.motionSpeed*live.motionScale:0;ctx.strokeStyle='rgba('+live.accent.join(',')+',.65)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,h*.77);ctx.bezierCurveTo(w*.25,h*(.7+Math.sin(t0)*.01),w*.65,h*.89,w,h*.68);ctx.stroke();for(let i=0;i<9;i++){let x=((i*211+t0*22)%(w+100))-50,y=h*(.2+(i%4)*.08);ctx.fillStyle='#102e3a';ctx.fillRect(x,y,34,10)}P.background.sceneElements.forEach((e,i)=>atom(e,i));ctx.restore();ctx.fillStyle='rgba(18,48,60,'+(0.015+(live.atmosphere/100)*.055)+')';ctx.fillRect(0,0,w,h)}
function frame(ms){const dt=Math.min(.05,Math.max(0,(ms-previous)/1000));previous=ms;t=ms/1000;ease(dt);if(P.background.type==='world'||P.background.type==='game')world();requestAnimationFrame(frame)}
if(P.background.type==='video'||P.background.type==='image'){canvas.hidden=true;let el=document.createElement(P.background.type==='video'?'video':'img');el.className='media';el.src=P.background.mediaUrl;if(el.tagName==='VIDEO'){el.autoplay=true;el.muted=true;el.loop=true;el.playsInline=true}document.querySelector('#media-root').append(el)}else requestAnimationFrame(frame);
addEventListener('keydown',e=>{if(playing)keys[e.key]=true});addEventListener('keyup',e=>keys[e.key]=false);const enter=document.querySelector('#enter');if(enter)enter.onclick=()=>{playing=true;document.body.classList.add('playing')};document.querySelector('#exit').onclick=()=>{playing=false;document.body.classList.remove('playing')};
const reveals=[...document.querySelectorAll('.reveal')];if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){reveals.forEach(el=>el.classList.add('is-revealed'))}else{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}}),{threshold:.14,rootMargin:'0px 0px -5% 0px'});reveals.forEach(el=>observer.observe(el))}
function updateScene(){if(!P.page.choreography?.enabled){activeScene='hero';return}const focus=innerHeight*.46,targets=[...document.querySelectorAll('[data-scene-target]')].filter(el=>getComputedStyle(el).display!=='none');let best=targets[0],dist=Infinity;for(const el of targets){const r=el.getBoundingClientRect(),center=Math.max(r.top,0)+Math.min(r.height,innerHeight)*.5,d=Math.abs(center-focus);if(d<dist){best=el;dist=d}}activeScene=best?.dataset.sceneTarget||'hero'}let sceneRaf=0;function scheduleScene(){if(!sceneRaf)sceneRaf=requestAnimationFrame(()=>{sceneRaf=0;updateScene()})}page.addEventListener('scroll',scheduleScene,{passive:true});addEventListener('resize',scheduleScene);updateScene();setTimeout(updateScene,80);
</script></body></html>`;
}

export function downloadStandaloneSite(project) {
  const html = buildStandaloneHtml(project);
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = project.metadata?.projectId === "axm-front-door-v1" ? "axm-front-door.html" : "axm-animated-site.html";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
