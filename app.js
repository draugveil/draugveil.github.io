const screens=[...document.querySelectorAll('.screen')];
const menu=[...document.querySelectorAll('.game-menu a')];
let keyboardNavigation=false;
document.addEventListener('pointerdown',()=>{keyboardNavigation=false},{passive:true});
document.addEventListener('keydown',()=>{keyboardNavigation=true},true);
function route(focus=false){let id=location.hash.slice(1)||'home';if(!screens.some(s=>s.id===id))id='home';screens.forEach(s=>s.hidden=s.id!==id);document.body.classList.toggle('home-open',id==='home');document.title=id==='home'?'Draugveil':`${id} — Draugveil`;window.scrollTo(0,0);if(focus&&keyboardNavigation)(id==='home'?menu[0]:document.querySelector(`#${id} .back`)).focus({preventScroll:true})}
const blackout=document.createElement('div');
blackout.className='section-blackout';blackout.setAttribute('aria-hidden','true');
document.body.append(blackout);
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let transitionId=0,fadeAnimation;
async function changeSection(){
 const id=++transitionId;
 const opacity=getComputedStyle(blackout).opacity;
 blackout.style.opacity=opacity;
 fadeAnimation?.cancel();
 
 if(reducedMotion.matches){
  document.querySelector('#main').inert=false;
  route(true);blackout.style.opacity='0';blackout.classList.remove('active');return;
 }
 blackout.classList.add('active');document.querySelector('#main').inert=true;
 fadeAnimation=blackout.animate([{opacity},{opacity:1}],{duration:140,easing:'ease-in',fill:'forwards'});
 try{await fadeAnimation.finished}catch{return}
 if(id!==transitionId)return;
 blackout.style.opacity='1';fadeAnimation.cancel();
 document.querySelector('#main').inert=false;route(true);
 document.querySelector('#main').inert=true;
 await new Promise(resolve=>setTimeout(resolve,35));
 if(id!==transitionId)return;
 fadeAnimation=blackout.animate([{opacity:1},{opacity:0}],{duration:170,easing:'ease-out',fill:'forwards'});
 try{await fadeAnimation.finished}catch{return}
 if(id!==transitionId)return;
 blackout.style.opacity='0';fadeAnimation.cancel();blackout.classList.remove('active');
 document.querySelector('#main').inert=false;
 const active=screens.find(screen=>!screen.hidden);
 if(keyboardNavigation)(active?.id==='home'?menu[0]:active?.querySelector('.back'))?.focus({preventScroll:true});
}
window.addEventListener('hashchange',changeSection);
document.querySelectorAll('[data-route]').forEach(control=>{
 const openRoute=()=>{
  const target=control.dataset.route;
  const nextHash=target==='home'?'':`#${target}`;
  if(location.hash===nextHash)route(true);else location.hash=nextHash;
 };
 control.addEventListener('click',openRoute);
 control.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  event.preventDefault();openRoute();
 });
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){location.hash='';return}if(window.matchMedia('(hover: none), (pointer: coarse)').matches||document.querySelector('#home').hidden||!['ArrowDown','ArrowUp'].includes(e.key))return;e.preventDefault();const current=menu.indexOf(document.activeElement);const next=current<0?(e.key==='ArrowDown'?0:2):(current+(e.key==='ArrowDown'?1:-1)+menu.length)%menu.length;menu[next].focus();});
const releases=document.querySelector('#releases');
window.DRAUGVEIL.releases.forEach((r,index)=>{
 const row=document.createElement('article');row.className='release-row';
 const card=document.createElement('button');card.type='button';card.className='release';
 card.setAttribute('aria-expanded','false');card.setAttribute('aria-controls',`platforms-${index}`);
 card.setAttribute('aria-label',`Listening platforms for ${r.title}`);
 const cover=document.createElement('span');cover.className='cover';
 const img=document.createElement('img');img.src=r.artwork;img.alt=r.title+' cover';cover.append(img);
 const title=document.createElement('span');title.className='release-title';title.textContent=r.title;
 const meta=document.createElement('span');meta.className='release-meta';meta.textContent=r.type;
 card.append(cover,title,meta);
 const platforms=document.createElement('nav');platforms.id=`platforms-${index}`;
 platforms.className='platform-links';platforms.hidden=true;platforms.setAttribute('aria-label',`Listen to ${r.title}`);
 for(const platform of r.platforms){
  const link=document.createElement('a');link.href=platform.url;link.textContent=platform.name;
  link.target='_blank';link.rel='noopener noreferrer';platforms.append(link);
 }
 card.addEventListener('click',()=>{
  const expanded=card.getAttribute('aria-expanded')!=='true';
  card.setAttribute('aria-expanded',String(expanded));platforms.hidden=!expanded;
  row.classList.toggle('expanded',expanded);
 });
 row.append(card,platforms);releases.append(row);
});

route();

// Render the original cursor at a low resolution with transparent background.
// Use normal compositing so the cursor remains visible over white artwork.
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
const cursorArt=new Image();
cursorArt.src='assets/ruby-cursor-source.png';
cursorArt.onload=()=>{
 const cursor=document.createElement('canvas');
 cursor.width=35;cursor.height=62;cursor.className='ruby-cursor';
 cursor.setAttribute('aria-hidden','true');
 const ctx=cursor.getContext('2d');if(!ctx)return;
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(cursorArt,300,30,650,1140,0,0,35,62);
 const pixels=ctx.getImageData(0,0,cursor.width,cursor.height);
 for(let i=0;i<pixels.data.length;i+=4){
  const brightness=Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2]);
  pixels.data[i+3]=brightness<16?0:Math.min(255,Math.round((brightness-16)*255/24));
 }
 ctx.putImageData(pixels,0,0);
 document.body.append(cursor);
 const hide=()=>{cursor.style.display='none';document.documentElement.classList.remove('ruby-cursor-active')};
 document.addEventListener('pointermove',e=>{
  if(!finePointer.matches||e.pointerType==='touch'){hide();return}
  cursor.style.display='block';cursor.style.transform=`translate3d(${e.clientX-2}px,${e.clientY-1}px,0)`;
  document.documentElement.classList.add('ruby-cursor-active');
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);
 window.addEventListener('blur',hide);
 finePointer.addEventListener('change',hide);
};

const backgroundVideo=document.querySelector('.background-video');
if(backgroundVideo){
 backgroundVideo.muted=true; backgroundVideo.defaultMuted=true;
 backgroundVideo.autoplay=true; backgroundVideo.loop=true; backgroundVideo.playsInline=true;
 backgroundVideo.controls=false; backgroundVideo.disablePictureInPicture=true;
 backgroundVideo.disableRemotePlayback=true;
 let playPending=false;
 const playBackground=()=>{
  if(document.hidden||playPending||!backgroundVideo.paused)return;
  playPending=true;
  backgroundVideo.play().catch(()=>{}).finally(()=>{playPending=false});
 };
 backgroundVideo.addEventListener('loadeddata',playBackground);
 backgroundVideo.addEventListener('canplay',playBackground);
 backgroundVideo.addEventListener('pause',()=>{if(!document.hidden)setTimeout(playBackground,0)});
 backgroundVideo.addEventListener('contextmenu',event=>event.preventDefault());
 window.addEventListener('pageshow',playBackground);
 document.addEventListener('visibilitychange',playBackground);
 document.addEventListener('pointerdown',playBackground,{passive:true});
 document.addEventListener('keydown',playBackground);
 playBackground();
}

// Keep touch navigation in this window; desktop links can open a new tab.
const labelStoreLink=document.querySelector('.phantom-lure-link');
if(labelStoreLink){
 const desktopStore=window.matchMedia('(hover: hover) and (pointer: fine)');
 const updateStoreTarget=()=>{labelStoreLink.target=desktopStore.matches?'_blank':'_self';labelStoreLink.rel='noopener noreferrer'};
 updateStoreTarget();desktopStore.addEventListener('change',updateStoreTarget);
 labelStoreLink.addEventListener('click',event=>{
  if(desktopStore.matches||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();window.location.assign(labelStoreLink.href);
 });
}
