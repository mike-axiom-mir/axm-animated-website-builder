import { SCENE_STATES, validateProject } from "../model/project.js";

function escapeInlineJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHref(value = "") {
  const href = String(value).trim();
  if (href.startsWith("#") || href.startsWith("https://") || href.startsWith("mailto:")) return escapeHtml(href);
  return "#";
}

function renderNavigation(project) {
  const items = project.page.navigation || [];
  return items.map((item) => `<a href="${safeHref(item.href)}">${escapeHtml(item.label)}</a>`).join("");
}

function renderSections(project) {
  const sections = project.page.sections || [];
  return sections.map((section) => {
    const points = (section.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("");
    const links = (section.links || []).map((link) => {
      const external = String(link.href || "").startsWith("https://");
      return `<a class="section-link" href="${safeHref(link.href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`;
    }).join("");
    return `<section class="site-section surface-${escapeHtml(section.surface || "clear")}" id="${escapeHtml(section.id)}">
      <div class="section-label"><span>${escapeHtml(section.eyebrow || "")}</span><i></i></div>
      <div class="section-copy">
        <h2>${escapeHtml(section.title || "")}</h2>
        <p>${escapeHtml(section.body || "")}</p>
        ${points ? `<ul>${points}</ul>` : ""}
        ${links ? `<div class="section-links">${links}</div>` : ""}
      </div>
    </section>`;
  }).join("");
}

export function buildStandaloneHtml(project) {
  const check = validateProject(project);
  if (!check.ok) throw new Error(check.holds.join(", "));

  const states = escapeInlineJson(SCENE_STATES);
  const data = escapeInlineJson(project);
  const navigation = renderNavigation(project);
  const sections = renderSections(project);
  const firstSection = project.page.sections?.[0]?.id ? `#${project.page.sections[0].id}` : "#";
  const footer = project.page.footer || {};
  const heroNote = project.page.heroNote ? `<small class="hero-note">${escapeHtml(project.page.heroNote)}</small>` : "";
  const actionMarkup = project.background.type === "game"
    ? `<button class="cta" id="enter" type="button">Enter world</button>`
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
body.playing .page{pointer-events:none;opacity:.18;filter:blur(1px)}body.playing .exit{display:flex;pointer-events:auto}
@media(max-width:720px){nav{padding:20px}.nav-links{display:none}.hero{min-height:calc(100vh - 58px);padding:54px 18px 46px}.hero>div{width:100%;padding:26px 12px}.hero p{font-size:8px;line-height:1.8;letter-spacing:.25em}h1{font-size:clamp(44px,14vw,68px)}.hero-note{font-size:11px}.sections{width:calc(100% - 26px);padding-bottom:70px}.site-section{grid-template-columns:1fr;gap:24px;padding:26px 20px}.section-copy h2{font-size:clamp(34px,11vw,50px)}.section-copy ul{grid-template-columns:1fr}.foot{flex-direction:column;font-size:9px;line-height:1.7}}
@media(prefers-reduced-motion:reduce){html,.page{scroll-behavior:auto}}
</style></head><body>
<div id="media-root"></div><canvas id="world"></canvas><div class="shade"></div>
<main class="page"><nav><a class="brand" href="#">△ AXM</a><div class="nav-links">${navigation}</div></nav>
<section class="hero"><div class="${escapeHtml(project.page.surface)}"><p>${escapeHtml(project.eyebrow)}</p><h1>${escapeHtml(project.title)}</h1>${actionMarkup}${heroNote}</div></section>
${sections ? `<div class="sections">${sections}</div>` : ""}
<footer class="foot"><span>${escapeHtml(footer.left || "IDEAS SHAPE WORLDS")}</span><span>${escapeHtml(footer.right || "BUILT WITH AXM")}</span></footer></main>
<button class="cta exit" id="exit" type="button">Return to page</button>
<script>const P=${data},STATES=${states};
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,t=0,playing=false,keys={};
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();
function poly(points,fill,stroke){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function world(){const s=STATES[P.background.state],t0=t*s.speed;let g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgb('+s.sky.join(',')+')');g.addColorStop(.65,'rgb(13,43,55)');g.addColorStop(1,'#02070b');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba('+s.sun.join(',')+',.9)';ctx.beginPath();ctx.arc(w*.24,h*.31,Math.min(w,h)*.055,0,7);ctx.fill();
for(let layer=0;layer<3;layer++){let base=h*(.55+layer*.12),step=Math.max(80,w/12);for(let x=-step;x<w+step;x+=step){let y=base-Math.abs(Math.sin((x*.009)+layer*1.7))*h*(.12-layer*.02);poly([[x-step,y+130],[x,y],[x+step,y+130]],['#0c2c37','#08212b','#061820'][layer])}}
ctx.fillStyle='#07151c';ctx.fillRect(0,h*.72,w,h*.28);for(let i=0;i<22;i++){let x=(i*173+P.background.seed*47)%w,y=h*.48+(i%5)*38,hh=80+(i*31)%170,ww=26+(i*13)%52;ctx.fillStyle=i%3?'#0a2029':'#0e2a34';ctx.fillRect(x,y-hh,ww,hh);ctx.fillStyle='rgba('+s.accent.join(',')+',.75)';for(let q=8;q<ww-5;q+=13)for(let z=12;z<hh-8;z+=20)if((q+z+i)%4)ctx.fillRect(x+q,y-hh+z,3,7)}
ctx.strokeStyle='rgba('+s.accent.join(',')+',.65)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,h*.77);ctx.bezierCurveTo(w*.25,h*(.7+Math.sin(t0)*.01),w*.65,h*.89,w,h*.68);ctx.stroke();for(let i=0;i<9;i++){let x=((i*211+t0*22)%(w+100))-50,y=h*(.2+(i%4)*.08);ctx.fillStyle='#102e3a';ctx.fillRect(x,y,34,10);ctx.fillStyle='rgba('+s.accent.join(',')+',.9)';ctx.fillRect(x-7,y+3,8,3)}
let px=w*.5,py=h*.52;if(P.background.type==='game'){px+=(keys.ArrowRight?1:0)*t%90;ctx.fillStyle='#48eaff';poly([[px,py-18],[px+14,py+13],[px,py+7],[px-14,py+13]],'#48eaff');ctx.fillStyle='#fff';ctx.fillText(playing?'ARROW KEYS · PILOTING':'ENTER WORLD TO PILOT',24,h-30)}
}
function frame(ms){t=ms/1000;if(P.background.type==='world'||P.background.type==='game')world();requestAnimationFrame(frame)}
if(P.background.type==='video'||P.background.type==='image'){canvas.hidden=true;let el=document.createElement(P.background.type==='video'?'video':'img');el.className='media';el.src=P.background.mediaUrl;if(el.tagName==='VIDEO'){el.autoplay=true;el.muted=true;el.loop=true;el.playsInline=true}document.querySelector('#media-root').append(el)}else requestAnimationFrame(frame);
addEventListener('keydown',e=>{if(playing)keys[e.key]=true});addEventListener('keyup',e=>keys[e.key]=false);const enter=document.querySelector('#enter');if(enter)enter.onclick=()=>{playing=true;document.body.classList.add('playing')};document.querySelector('#exit').onclick=()=>{playing=false;document.body.classList.remove('playing')};
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
