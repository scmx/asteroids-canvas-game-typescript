var v=Object.defineProperty;var _=(i,t,e)=>t in i?v(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var c=(i,t,e)=>(_(i,typeof t!="symbol"?t+"":t,e),e);const j=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerpolicy&&(s.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?s.credentials="include":r.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}};j();const S=["projectile","enemy-hit2","game-over","buzz"],E=new Map(S.map(i=>{const t=document.createElement("audio");return t.src=`/asteroids-canvas-game-typescript//audio/${i}.mp3`,t.volume=.2,[i,{audio:t}]})),b=()=>{let i=!1;return{start(){i=!0},play(t){if(!i)return;let{audio:e}=E.get(t);e.play()}}};let y;function L(i){function t(){innerWidth>innerHeight?y={factor:innerWidth/50,offsetX:0,offsetY:innerWidth-innerHeight}:y={factor:innerHeight/50,offsetX:innerHeight-innerWidth,offsetY:0},i.width=innerWidth*2,i.height=innerHeight*2,i.style.width=`${innerWidth}px`,i.style.height=`${innerHeight}px`}let e;addEventListener("resize",()=>{clearTimeout(e),e=setTimeout(()=>{t()},100)}),t()}class P{constructor({x:t,y:e}){c(this,"_x");c(this,"_y");c(this,"_speed");this._x=t,this._y=e,this._speed=Math.hypot(t,e)}get x(){return this._x}get y(){return this._y}get speed(){return this._speed}set x(t){this._x=t,this._speed=Math.hypot(this._x,this._y)}set y(t){this._y=t,this._speed=Math.hypot(this._x,this._y)}}class u{constructor({position:t,velocity:e={x:0,y:0},radius:n,color:r,alpha:s=1}){c(this,"position");c(this,"velocity");c(this,"radius");c(this,"color");c(this,"alpha");c(this,"dead",!1);this.position=t,this.velocity=new P(e),this.radius=n,this.color=r,this.alpha=s}update(){this.position.x+=this.velocity.x,this.position.y+=this.velocity.y}draw(t){const{color:e}=this,{position:{x:n,y:r},radius:s}=W(this);t.save(),t.globalAlpha=this.alpha,t.beginPath(),t.arc(n,r,s,0,Math.PI*2,!1),t.fillStyle=e,t.fill(),t.restore()}get speed(){return Math.hypot(this.velocity.x,this.velocity.y)}}class q extends u{}class O extends u{}class H extends u{constructor(){super(...arguments);c(this,"color","white")}}class I extends u{update(){super.update(),this.velocity.x*=.9999,this.velocity.y*=.9999,this.alpha-=.01}}function W(i){const{factor:t,offsetX:e,offsetY:n}=y,r={x:i.position.x*t-e,y:i.position.y*t-n},s=i.radius*t;return{position:r,radius:s}}const p=document.querySelector("#app canvas"),m=document.querySelector("#menu"),z=document.querySelector("#score"),d=p.getContext("2d");let f;L(p);T();Y();const l=b();let o;function M(){l.play("buzz"),m.classList.add("hidden"),o={running:!0,score:0,player:new q({position:{x:50,y:50},radius:5,color:"green"}),enemies:new Set,projectiles:new Set,particles:new Set},window.game=o,f||(f=requestAnimationFrame(w))}function A(){l.play("game-over"),o.running=!1,m.classList.remove("hidden")}function w(i){$(i),F(),f=requestAnimationFrame(w)}let x=-1e3;function $(i){const t=Math.max(500,1e3-Math.pow(o.score,.6666666666666666));i>x+t&&(x=i,X());for(const e of o.particles)e.update(),(g(e)||e.alpha<=0)&&o.particles.delete(e);for(const e of o.projectiles)e.update(),g(e)&&o.projectiles.delete(e);for(const e of o.enemies)if(!e.dead){e.update();for(const n of o.projectiles)Math.hypot(n.position.x-e.position.x,n.position.y-e.position.y)-n.radius>=2||(o.projectiles.delete(n),l.play("enemy-hit2"),e.radius>3?(o.score+=100,e.radius*=.5):(o.score+=250,o.enemies.delete(e)),h(e,n));for(const n of o.enemies){if(n===e||n.dead||e.dead||Math.hypot(n.position.x-e.position.x,n.position.y-e.position.y)-n.radius>=2)continue;l.play("enemy-hit2");let[s,a]=n.radius<e.radius?[n,e]:[e,n];a.speed*3<s.speed?[s,a]=[a,s]:(a.velocity.x*=.95,a.velocity.y*=.95),a.radius=Math.sqrt((Math.pow(a.radius,2)*Math.PI+Math.pow(s.radius,2))/Math.PI),s.radius>3?s.radius*=.5:(s.dead=!0,o.enemies.delete(s)),h(s,a)}e.position.x>=100&&(e.position.x=0),e.position.x<0&&(e.position.x=100),e.position.y>=100&&(e.position.y=0),e.position.y<0&&(e.position.y=100)}if(!!o.running)for(const e of o.enemies)Math.hypot(o.player.position.x-e.position.x,o.player.position.y-e.position.y)-e.radius<2&&(h(o.player,e),A())}function F(){d.fillStyle="rgba(0,0,0,0.05)",d.fillRect(0,0,p.width,p.height);for(const i of o.particles)i.draw(d);for(const i of o.projectiles)i.draw(d);for(const i of o.enemies)i.draw(d);o.running&&o.player.draw(d),z.textContent=`${o.score}`}function T(){p.addEventListener("pointerdown",i=>{l.start();const t={x:i.clientX-innerWidth/2,y:i.clientY-innerHeight/2},e=Math.atan2(t.y,t.x);o.projectiles.add(new H({position:{...o.player.position},velocity:{x:Math.cos(e),y:Math.sin(e)},color:"white",radius:1})),l.play("projectile")})}function X(){const i=Math.random()<.5?{x:Math.random()<.5?0:100,y:Math.random()*100}:{x:Math.random()*100,y:Math.random()<.5?0:100},t={x:o.player.position.x-i.x,y:o.player.position.y-i.y},e=Math.atan2(t.y,t.x),n=Math.random()*.75+.5;o.enemies.add(new O({position:i,velocity:{x:Math.cos(e)/10*n,y:Math.sin(e)/10*n},radius:Math.random()*4+1,color:`hsl(${Math.random()*360}, 50%,50%)`}))}function g(i){const{x:t,y:e}=i.position;return t<0||e<0||t>100||e>100}function Y(){var i;(i=m.querySelector("button"))==null||i.addEventListener("click",()=>{M(),l.start()})}function h(i,t){for(let e=0;e<i.radius**2+4;e++){const n={x:(Math.random()-.5)*2,y:(Math.random()-.5)*2};o.particles.add(new I({position:{...t.position},radius:.5,color:i.color,velocity:n,alpha:.5}))}}M();