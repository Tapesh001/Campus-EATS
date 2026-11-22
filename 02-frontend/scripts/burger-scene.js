// Draw a layered burger in orthographic projection. Every face is sorted by
// depth so the same geometry can rotate, separate and stack without image swaps.
export function mountBurger(canvas, motion) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const faces = [];
  const tau = Math.PI * 2;
  const profile = (layer, color, rings, sides = 48, ripple = 0) => {
    const vertices = rings.map(([y, radius]) => Array.from({ length: sides }, (_, i) => {
      const angle = i * tau / sides;
      const radiusAtAngle = radius * (1 + ripple * Math.sin(7 * angle + layer));
      return [radiusAtAngle * Math.cos(angle), y + ripple * radius * Math.cos(9 * angle), radiusAtAngle * Math.sin(angle)];
    }));
    for (let j = 1; j < rings.length; j++) {
      for (let i = 0; i < sides; i++) {
        const k = (i + 1) % sides;
        faces.push({ layer, color, points: [vertices[j-1][i], vertices[j-1][k], vertices[j][k], vertices[j][i]] });
      }
    }
  };
  profile(0, [220,133,56], [[-47,0],[-47,66],[-44,77],[-36,81],[-26,80],[-24,72],[-24,0]]);
  profile(1, [99,51,31], [[-27,0],[-27,73],[-22,81],[-10,82],[-6,73],[-6,0]], 64,.025);
  profile(2, [255,189,44], [[-8,0],[-8,102],[-5,102],[-5,0]], 4);
  profile(3, [101,165,53], [[-4,0],[-4,85],[1,86],[1,0]], 72,.085);
  profile(4, [218,50,35], [[2,0],[2,69],[5,76],[11,75],[13,68],[13,0]]);
  profile(5, [199,107,143], [[13,70],[15,72],[19,70],[19,60],[14,60],[13,70]]);
  profile(6, [232,152,64], [[21,0],[21,77],[24,82],[32,82],[43,76],[54,62],[63,43],[68,22],[69,0]]);
  // Sesame seeds follow the dome and rotate with the bun.
  for (let i=0; i<46; i++) {
    const radius = 70 * Math.sqrt((i+.5)/46), angle = i*2.4;
    const x = radius*Math.cos(angle), z = radius*Math.sin(angle);
    const y = 31 + 39*Math.sqrt(1-(radius/82)**2);
    faces.push({layer:6, color:[255,231,171], points:Array.from({length:8}, (_,n) => {
      const a=n*tau/8, dx=3*Math.cos(a), dz=1.35*Math.sin(a);
      return [x+dx*Math.cos(angle)-dz*Math.sin(angle),y+.4,z+dx*Math.sin(angle)+dz*Math.cos(angle)];
    })});
  }
  let width=0,height=0,frame=0,visible=false,last=0,elapsed=0;
  let yaw=-.4,targetX=0,targetY=0,tilt=0,turn=0;
  const hero=canvas.closest('.hero-wrap');
  const scene=hero.closest('.food-scroll');
  function draw(time) {
    frame=0;
    const dt=last ? Math.min(time-last,50)/1000 : 0;
    last=time;
    const quiet=motion.matches;
    elapsed+=dt;
    const rect=scene.getBoundingClientRect();
    const travel=Math.max(rect.height-hero.offsetHeight,hero.offsetHeight*.35);
    const scroll=Math.min(1,Math.max(0,-rect.top/travel));
    const gather=quiet ? 0 : Math.max(0,1-Math.max(0,elapsed-1.15)/1.8)**2;
    const spread=quiet ? 0 : gather*.92 + scroll*.85 + .05*(1+Math.sin(elapsed*1.4));
    const wanted=quiet ? -.4 : -.4+elapsed*.18+targetX*.32+turn+scroll*.9;
    yaw=quiet ? wanted : yaw+(wanted-yaw)*Math.min(1,dt*6);
    tilt+=((quiet?0:targetY*.09)-tilt)*Math.min(1,dt*6);
    const cy=Math.cos(yaw),sy=Math.sin(yaw),pitch=.23+tilt,cp=Math.cos(pitch),sp=Math.sin(pitch);
    const scale=Math.min(width/285,height/300);
    const project=([x,y,z],layer)=>{
      y+=(layer-3)*23*spread;
      x+=Math.sin(layer*2)*38*spread;
      z+=Math.cos(layer*2)*18*spread;
      const side=x*cy-z*sy, depth=x*sy+z*cy;
      return [width/2+side*scale,height*.53-(y*cp-depth*sp)*scale,y*sp+depth*cp];
    };
    ctx.clearRect(0,0,width,height);
    const polygons=faces.map(face=>{
      const p=face.points.map(point=>project(point,face.layer));
      return {p,color:face.color,depth:p.reduce((sum,v)=>sum+v[2],0)/p.length};
    }).sort((a,b)=>a.depth-b.depth);
    for (const {p,color} of polygons) {
      const [a,b,c]=p;
      const u=b.map((v,i)=>v-a[i]),v=c.map((n,i)=>n-a[i]);
      const nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];
      const light=.89+.19*Math.abs((-.42*nx-.75*ny+.47*nz)/(Math.hypot(nx,ny,nz)||1));
      ctx.fillStyle=ctx.strokeStyle='rgb('+color.map(x=>Math.min(255,Math.round(x*light))).join(',')+')';
      ctx.beginPath();ctx.moveTo(a[0],a[1]);for(const pt of p.slice(1))ctx.lineTo(pt[0],pt[1]);
      ctx.closePath();ctx.fill();ctx.lineWidth=.55;ctx.stroke();
    }
    if(visible && !quiet && !document.hidden) frame=requestAnimationFrame(draw);
  }
  function wake() {
    cancelAnimationFrame(frame);last=0;frame=0;
    if(visible && !document.hidden)frame=requestAnimationFrame(draw);
  }
  new ResizeObserver(([entry])=>{
    width=entry.contentRect.width;height=entry.contentRect.height;
    const ratio=Math.min(devicePixelRatio||1,1.75);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);wake();
  }).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;wake();}).observe(canvas);
  canvas.parentElement.addEventListener('click',()=>{turn+=Math.PI;});
  hero.addEventListener('pointermove',event=>{
    const r=hero.getBoundingClientRect();
    targetX=(event.clientX-r.left)/r.width-.5;targetY=(event.clientY-r.top)/r.height-.5;
  },{passive:true});
  motion.addEventListener('change',wake);
  document.addEventListener('visibilitychange',wake);
}
