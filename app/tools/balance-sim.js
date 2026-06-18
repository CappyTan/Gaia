// balance-sim.js — headless full-run combat simulator for tuning difficulty.
// Loads the real game script (DOM stubbed) so it uses the SHIPPING combatDamage / ENEMIES /
// SKILLS / loot / progression. Simulates a whole Greenvale run (HP + MP persist across
// fights, level-ups full-heal, party gears up from drops) with simple but reasonable AI,
// then reports difficulty metrics. Run:  node app/tools/balance-sim.js
//
// Tune by editing ENEMIES in app/gaia.html, then re-running this. Targets:
//   - avg end-of-fight party HP ~55-75%  (fights cost real HP, net of heals)
//   - boss / mini-boss end HP lower (~30-50%)  — genuine threats
//   - wipe rate low (<~10%) under decent play, but non-zero room for bad play
const fs=require("fs"), path=require("path"), vm=require("vm");

const html=fs.readFileSync(path.join(__dirname,"..","gaia.html"),"utf8");
const body=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elStub=()=>new Proxy({children:[],dataset:{},style:{}},{get(t,k){if(k in t)return t[k];
  if(k==="classList")return{toggle(){},add(){},remove(){},contains(){return false;}};
  if(k==="appendChild"||k==="remove")return()=>{};if(k==="querySelector")return()=>elStub();
  if(k==="querySelectorAll")return()=>[];if(k==="getBoundingClientRect")return()=>({left:0,top:0,width:920,height:640});
  if(k==="getContext")return()=>null;if(k==="addEventListener")return()=>{};
  if(k==="textContent"||k==="innerHTML")return"";return()=>{};},set(){return true;}});
const ctx={ document:{querySelector:()=>elStub(),createElement:()=>elStub(),body:elStub()},
  window:{addEventListener(){}}, performance:{now:()=>Date.now()},
  requestAnimationFrame:()=>0, cancelAnimationFrame:()=>{},
  localStorage:{_d:{},getItem(k){return this._d[k]||null;},setItem(k,v){this._d[k]=v;}},
  Math, JSON, console, Date };
vm.createContext(ctx);
// top-level consts in a vm script don't attach to the context; export them via a shim
// (the script's trailing `this` is the sandbox global, and the consts are in scope here).
const SHIM=`;this.__game={PARTY_DEFS,makeMember,recalc,makeItem,makeEnemy,combatDamage,SKILLS,ENEMIES,ENCOUNTERS,Field,grantXp,rollDrop,itemScore,ri,pick};`;
vm.runInContext(body+SHIM, ctx);
const {PARTY_DEFS, makeMember, recalc, makeItem, makeEnemy, combatDamage, SKILLS, ENEMIES,
  ENCOUNTERS, Field, grantXp, rollDrop, itemScore, ri, pick} = ctx.__game;

const ZERO={implicit:{},affixes:[],rIx:-1};
function freshParty(){ const p=PARTY_DEFS.map(makeMember); p.forEach(m=>m.equip.weapon=makeItem(m.cls,"weapon",0,m.cls)); recalc(p); return p; }
function affordableDmg(m){ return m.skills.map(k=>SKILLS[k]).filter(s=>s.unlock<=m.level&&s.mp<=m.mp&&(s.type==="phys"||s.type==="mag"))
  .sort((a,b)=>(b.power*(b.hits||1))-(a.power*(a.hits||1)))[0]||null; }
function affordableHeal(m){ return m.skills.map(k=>SKILLS[k]).filter(s=>s.unlock<=m.level&&s.mp<=m.mp&&s.type==="heal")[0]||null; }
function dot(u){ const st=u.status;
  for(const k of ["burn","poison","decay"]) if(st[k]){ u.hp=Math.max(0,u.hp-Math.max(2,Math.round(u.maxhp*0.05))); if(--st[k]<=0)delete st[k]; }
  if(st.regen){ u.hp=Math.min(u.maxhp,u.hp+Math.round(u.maxhp*0.08)); if(--st.regen<=0)delete st.regen; }
  for(const k of ["blind","atkup","stun","wardArmor"]) if(st[k]&&--st[k]<=0)delete st[k];
  if(u.hp<=0)u.alive=false; u.guarding=false; }

function simFight(party, keys, depth){
  const enemies=keys.map((k,i)=>makeEnemy(k,i,false,depth||0));
  party.forEach(m=>{m.atb=ri(0,30);m.status={};m.guarding=false;}); enemies.forEach(e=>e.atb=ri(0,20));
  const living=()=>[...party.filter(m=>m.alive),...enemies.filter(e=>e.alive)];
  const maxTot=party.reduce((a,m)=>a+m.maxhp,0);
  const hpPct=()=>party.reduce((a,m)=>a+Math.max(0,m.hp),0)/maxTot;
  let actions=0, taken=0, minHP=1, eActs=0, pDmg=0, pHits=0;
  while(party.some(m=>m.alive)&&enemies.some(e=>e.alive)&&actions<500){
    minHP=Math.min(minHP,hpPct());
    const us=living(); if(!us.length)break;
    // continuous-time ATB: whoever's gauge reaches 100 first acts; advance all proportionally
    let act=null, bt=Infinity;
    for(const u of us){ const t=(100-u.atb)/Math.max(1,u.spd); if(t<bt){bt=t;act=u;} }
    for(const u of us){ u.atb+=Math.max(1,u.spd)*bt; }
    act.atb=0; actions++;
    dot(act); if(!act.alive)continue; if(act.status.stun){continue;}
    if(act.side==="party"){
      const m=act, wounded=party.filter(x=>x.alive&&x.hp<x.maxhp*0.55).sort((a,b)=>a.hp/a.maxhp-b.hp/b.maxhp);
      const hs=affordableHeal(m);
      if(hs&&wounded.length){ m.mp-=hs.mp; const t=wounded[0]; t.hp=Math.min(t.maxhp,t.hp+Math.round(m.mag*hs.power+6)); }
      else { const sk=affordableDmg(m), tgt=enemies.filter(e=>e.alive).sort((a,b)=>a.hp-b.hp)[0]; if(!tgt)continue;
        if(sk&&sk.mp)m.mp-=sk.mp; const hits=sk?(sk.hits||1):1;
        const targs = sk&&sk.target==="allEnemies"? enemies.filter(e=>e.alive):[tgt];
        targs.forEach(tt=>{ for(let h=0;h<hits;h++){ if(!tt.alive)break; const r=combatDamage(m,tt,{skill:sk||undefined}); if(!r.miss){tt.hp=Math.max(0,tt.hp-r.dmg); pDmg+=r.dmg; pHits++; if(tt.hp<=0)tt.alive=false;} } });
      }
    } else {
      const e=act, foes=party.filter(m=>m.alive); if(!foes.length)break; eActs++; let used=false;
      if(e.skills&&e.skills.length&&Math.random()<e.castChance){ const ab=pick(e.skills);
        if(ab==="mend"){ const h=enemies.filter(x=>x.alive&&x.hp<x.maxhp).sort((a,b)=>a.hp-b.hp)[0]; if(h){h.hp=Math.min(h.maxhp,h.hp+Math.round(e.mag*1.7+22)); used=true;} }
        else if(ab==="hex"){ pick(foes).status.blind=2; used=true; }
        else if(ab==="rally"){ enemies.filter(x=>x.alive).forEach(x=>x.status.atkup=3); used=true; } }
      if(!used){ const aoe=e.boss&&Math.random()<0.2; const targs=aoe?foes:[pick(foes)];
        targs.forEach(t=>{ const r=combatDamage(e,t,aoe?{aoe:true}:{}); if(!r.miss){ t.hp=Math.max(0,t.hp-r.dmg); taken+=r.dmg;
          if(e.leech)e.hp=Math.min(e.maxhp,e.hp+Math.round(r.dmg*e.leech/100)); if(e.onHitPoison)t.status.poison=e.onHitPoison; if(t.hp<=0)t.alive=false; } }); }
    }
  }
  minHP=Math.min(minHP,hpPct());
  const win=party.some(m=>m.alive)&&!enemies.some(e=>e.alive);
  const hp=party.reduce((a,m)=>a+Math.max(0,m.hp),0), max=party.reduce((a,m)=>a+m.maxhp,0);
  return {win, taken, actions, endHP:hp/max, minHP, enemies, eActs, pdph: pHits?pDmg/pHits:0, partyMax:max};
}
function gearUp(party, enemies){
  const drops=[];
  enemies.forEach(e=>{ const ch=(e.boss||e.miniboss)?1:e.elite?1:0.4;
    if(Math.random()<ch)drops.push(rollDrop(e,pick(party).cls));
    if(e.miniboss)drops.push(rollDrop(e,pick(party).cls));
    if(e.boss){drops.push(rollDrop(e,pick(party).cls));drops.push(rollDrop(e,pick(party).cls));} });
  drops.forEach(it=>{ if(it.slot==="weapon"){ const m=party.find(x=>x.cls===it.cls); if(m&&(!m.equip.weapon||itemScore(it)>itemScore(m.equip.weapon)))m.equip.weapon=it; }
    else { const m=party.slice().sort((a,b)=>itemScore(a.equip[it.slot]||ZERO)-itemScore(b.equip[it.slot]||ZERO))[0]; if(!m.equip[it.slot]||itemScore(it)>itemScore(m.equip[it.slot]))m.equip[it.slot]=it; } });
  recalc(party);
}
function simRun(){
  const party=freshParty(); let px=1; const bx=Field.boss.x, gx=Field.gate.x; let toEnc=ri(Field.ENC_MIN,Field.ENC_MAX);
  const fights=[]; let wiped=false;
  const prog=()=>(px-1)/(bx-1);
  const fight=(keys,kind)=>{ const r=simFight(party,keys,prog()); fights.push({kind,p:prog(),...r}); if(!r.win){wiped=true;return false;}
    let xp=0; keys.forEach(k=>xp+=ENEMIES[k].xp); grantXp(party,xp); gearUp(party,r.enemies); return true; };
  while(px<bx&&!wiped){ px++;
    if(px===gx){ if(!fight(["captain","bandit","bandit"],"mini"))break; continue; }
    toEnc--; if(toEnc<=0){ toEnc=ri(Field.ENC_MIN,Field.ENC_MAX); const p=prog(); let band=ENCOUNTERS[0]; for(const b of ENCOUNTERS)if(p>=b.at)band=b; if(!fight(pick(band.sets),"rand"))break; } }
  if(!wiped) fight(["brute"],"boss");
  return {fights, wiped, lvl:party.reduce((a,m)=>a+m.level,0)/4};
}

const N=parseInt(process.argv[2]||"60",10);
let wipes=0, endAll=[], early=[], late=[], minMini=[], minBoss=[], danger=0, total=0, lvls=[];
for(let i=0;i<N;i++){ const r=simRun(); if(r.wiped)wipes++; lvls.push(r.lvl);
  r.fights.forEach(f=>{ total++; endAll.push(f.endHP); if(f.minHP<0.4)danger++;
    if(f.kind==="rand"&&f.p<0.4)early.push(f.minHP); if(f.kind==="rand"&&f.p>0.6)late.push(f.minHP);
    if(f.kind==="mini")minMini.push(f.minHP); if(f.kind==="boss")minBoss.push(f.minHP); }); }
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const pc=x=>(x*100).toFixed(0)+"%";
console.log(`runs ${N} | wipe rate ${pc(wipes/N)} | avg final party level ${avg(lvls).toFixed(1)}`);
console.log(`LOW POINT during fight (avg):  early random ${pc(avg(early))} | late random ${pc(avg(late))} | mini-boss ${pc(avg(minMini))} | final boss ${pc(avg(minBoss))}`);
console.log(`avg end-of-fight HP ${pc(avg(endAll))}  (caster heals back up after the dip)`);
console.log(`fights that dipped <40% HP: ${pc(danger/total)} (${danger}/${total})`);
console.log(`scariest boss dip: ${pc(Math.min(...minBoss))} | scariest mini dip: ${pc(Math.min(...minMini))}`);
// diagnostics for sizing enemy HP/ATK
let pdph=[], eacts=[], pmaxLate=[], eactsBoss=[];
for(let i=0;i<20;i++){ const r=simRun(); r.fights.forEach(f=>{ pdph.push(f.pdph); eacts.push(f.eActs); if(f.kind==="boss"){eactsBoss.push(f.eActs); pmaxLate.push(f.partyMax);} }); }
console.log(`DIAG: party dmg/hit ~${avg(pdph).toFixed(0)} | enemy actions/fight ~${avg(eacts).toFixed(1)} | boss-fight enemy actions ~${avg(eactsBoss).toFixed(1)} | party total HP at boss ~${avg(pmaxLate).toFixed(0)}`);
