import { mountBurger } from './burger-scene.js';

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const home = document.body.dataset.page === 'home';
const hero = document.querySelector('.hero-wrap');
const canvas = document.querySelector('.burger-stage canvas');
if (canvas) mountBurger(canvas, motion);

function splitLetters(node) {
  const label = node.textContent.trim();
  node.setAttribute('aria-label',label);
  node.replaceChildren(...label.split(/\s+/).map((word,index) => {
    const group=document.createElement('span');
    group.className='motion-word';
    group.setAttribute('aria-hidden','true');
    for(const letter of word) {
      const part=document.createElement('i');
      part.textContent=letter;
      group.append(part);
    }
    if(index) group.style.marginInlineStart='.22em';
    return group;
  }));
  return [...node.querySelectorAll('i')];
}

function rise(letters, duration, stagger, delay=0) {
  letters.forEach((letter,i)=>letter.animate([
    {transform:'translateY(120%) rotate('+ (i%2 ? 12 : -12)+'deg)',opacity:0},
    {opacity:1,offset:.22},
    {transform:'none',opacity:1}
  ],{duration,delay:delay+i*stagger,easing:'cubic-bezier(.2,1.5,.35,1)',fill:'backwards'}));
}

if (!motion.matches) {
  const curtain=document.querySelector('.food-curtain');
  if(curtain && !location.hash) {
    curtain.hidden=false;
    const title=curtain.querySelector('strong');
    splitLetters(title).forEach((letter,i)=>letter.animate([
      {transform:'translateY(-160%) rotate('+ (i%2 ? 22 : -21)+'deg)'},
      {transform:'translateY(0)',offset:.53},
      {transform:'translateY(-18%)',offset:.72},
      {transform:'translateY(0)',offset:.85},
      {transform:'translateY(-4%)',offset:.94},
      {transform:'none'}
    ],{duration:900,delay:i*70,fill:'backwards'}));
    title.animate([{opacity:1,scale:'1'},{opacity:0,scale:'1.6'}],{duration:700,delay:1150,fill:'forwards'});
    const lifts=[...curtain.querySelectorAll('.curtain-panel')].map((panel,i)=>panel.animate(
      [{transform:'translateY(0)'},{transform:'translateY(-101%)'}],
      {duration:1100,delay:1400+i*70,easing:'cubic-bezier(.87,0,.13,1)',fill:'forwards'}
    ));
    Promise.allSettled(lifts.map(a=>a.finished)).then(()=>curtain.remove());
    document.addEventListener('keydown',()=>curtain.remove(),{once:true});
  }
  if(hero) {
    const delay=curtain && !location.hash ? 1700 : 0;
    rise(splitLetters(hero.querySelector('h1')),1300,60,delay);
    const stamp=hero.querySelector('.food-sticker');
    stamp?.animate([{transform:'scale(0) rotate(-180deg)'},{transform:'scale(1) rotate(12deg)'}],
      {duration:1200,delay:delay+550,easing:'cubic-bezier(.2,1.5,.35,1)',fill:'backwards'});
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries) if(entry.isIntersecting) {
      observer.unobserve(entry.target);
      if(motion.matches) continue;
      if(entry.target.matches('h2')) rise(splitLetters(entry.target),1100,25);
      else entry.target.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0)'}],
        {duration:1600,easing:'cubic-bezier(.7,0,.3,1)'});
    }
  },{rootMargin:'0px 0px -15% 0px'});
  document.querySelectorAll(home ? '.home-content h2, .together-art' : '.shop-artwork').forEach(node=>observer.observe(node));
}
motion.addEventListener('change',()=>{
  if(motion.matches) {
    document.querySelector('.food-curtain')?.remove();
    document.getAnimations().filter(a=>a.effect?.target?.closest('.motion-word, .food-curtain, .shop-artwork, .hero-wrap, .together-art')).forEach(a=>a.cancel());
  }
});
// Translate the menu gallery across the viewport as its section scrolls past.
const gallery = document.querySelector('.shop-section');
if (gallery) {
  const track = gallery.querySelector('.home-shop-grid');
  const viewport = gallery.querySelector('.gallery-window');
  const wide = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
  let distance = 0;
  let frame = 0;
  function positionGallery() {
    frame = 0;
    if (!distance) return;
    const offset = Math.min(distance, Math.max(0, viewport.offsetTop - gallery.clientTop - parseFloat(getComputedStyle(gallery).paddingTop)));
    track.style.setProperty('--gallery-shift', -offset + 'px');
  }
  function measureGallery() {
    gallery.classList.toggle('gallery-active', wide.matches && track.children.length > 1);
    if (viewport.offsetHeight > innerHeight - 48) gallery.classList.remove('gallery-active');
    distance = gallery.classList.contains('gallery-active') ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0;
    gallery.style.setProperty('--gallery-distance', distance + 'px');
    positionGallery();
  }
  window.addEventListener('scroll', () => {
    if (distance && !frame) frame = requestAnimationFrame(positionGallery);
  }, {passive:true});
  track.addEventListener('focusin', event => {
    const card = event.target.closest('.home-shop-card');
    if (!distance || !card) return;
    const bounds = card.getBoundingClientRect(), region = viewport.getBoundingClientRect();
    if (bounds.left < region.left - 2 || bounds.right > region.right + 2) {
      viewport.scrollLeft = 0;
      window.scrollTo(0, scrollY + gallery.getBoundingClientRect().top + Math.min(distance,card.offsetLeft));
    }
  });
  wide.addEventListener('change',measureGallery);
  new ResizeObserver(measureGallery).observe(track);
  new MutationObserver(measureGallery).observe(track,{childList:true});
  measureGallery();
}
