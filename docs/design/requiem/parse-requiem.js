#!/usr/bin/env node
// parse-requiem.js — deterministically extract Dara's REQUIEM Class Compendium
// (requiem-compendium.source.html) into structured data + a readable markdown compendium.
// FAITHFUL: every value comes straight from Dara's HTML; nothing is invented or edited.
//   node docs/design/requiem/parse-requiem.js
// writes:  classes.json  (structured)  +  REQUIEM-classes.md  (human-readable)
const fs=require("fs"), path=require("path");
const DIR=__dirname;
const html=fs.readFileSync(path.join(DIR,"requiem-compendium.source.html"),"utf8");

const clean=s=>(s||"")
  .replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
  .replace(/\\u2014/g,"—").replace(/—/g,"—").replace(/\s+/g," ").trim();

// ---- attunements (section headers: name · descriptor · mana mechanic) ----
const attunements=[];
const secRe=/class="sec-t"[^>]*>([^<]+)<\/div>\s*<div class="sec-d">([^<]+)<\/div>\s*<div class="sec-c"[^>]*>[^<]*<\/div>\s*<div class="sec-m"[^>]*>([^<]+)<\/div>/g;
let sm; while((sm=secRe.exec(html))){
  const nameRaw=clean(sm[1]); const name=nameRaw.replace(/^[^A-Za-z]+/,"").trim();   // strip leading emoji
  attunements.push({ key:name.toLowerCase(), name, descriptor:clean(sm[2]), mana:clean(sm[3]) });
}

// ---- classes ----
const classes=[];
const chunks=html.split('<div class="cc" data-attune="').slice(1);
for(const raw of chunks){
  const chunk='<div class="cc" data-attune="'+raw;
  const attr=k=>{ const m=new RegExp('data-'+k+'="([^"]*)"').exec(chunk); return m?clean(m[1]):""; };
  const nameM=/class="cc-name"[^>]*>([^<]+)<\/div>/.exec(chunk);
  const metaM=/class="cc-meta">([\s\S]*?)<span[^>]*>([^<]+)<\/span>/.exec(chunk);
  const cls={
    attunement: attr("attune"), name: nameM?clean(nameM[1]):attr("name"),
    archetype: attr("arch"), role: (metaM?clean(metaM[1]):attr("role")).replace(/[·\s]+$/,"").trim(),
    resource: metaM?clean(metaM[2]):"", abilities:[],
  };
  const abRe=/ab-badge[^>]*>(\w+)<\/span>\s*<span class="ab-name"[^>]*>([^<]*)<\/span>\s*<div class="ab-costs">([\s\S]*?)<\/div>[\s\S]*?<div class='ab-desc'>([\s\S]*?)<\/div>/g;
  let am; while((am=abRe.exec(chunk))){
    const costs=[...am[3].matchAll(/<span[^>]*>([^<]+)<\/span>/g)].map(x=>clean(x[1]));
    cls.abilities.push({ type:clean(am[1]), name:clean(am[2]), cost:costs.join(", "), desc:clean(am[4]) });
  }
  classes.push(cls);
}

const out={ system:"REQUIEM", subtitle:"Attunement Combat System",
  weaponArchetypes:["Sword & Shield","Dual Swords","Two-Handed Sword","Hammer","Dual Daggers","Dual Pistols","Rifle","Staff","Spellblade"],
  attunements, classes,
  counts:{ classes:classes.length, abilities:classes.reduce((a,c)=>a+c.abilities.length,0),
    ultimates:classes.reduce((a,c)=>a+c.abilities.filter(x=>x.type==="ULTIMATE").length,0) },
  source:"requiem-compendium.source.html (Dara Saadat)", parsedBy:"parse-requiem.js" };
fs.writeFileSync(path.join(DIR,"classes.json"), JSON.stringify(out,null,2));

// ---- markdown compendium ----
let md=`# REQUIEM — Class Compendium\n\n> Faithfully extracted from Dara Saadat's source (\`requiem-compendium.source.html\`) by \`parse-requiem.js\`. Do not hand-edit — re-run the parser. Some ability descriptions are truncated in the source; they are reproduced as-is.\n\n`;
md+=`**${out.system}** — ${out.subtitle}. ${out.counts.classes} classes · ${attunements.length} attunements · ${out.weaponArchetypes.length} weapon archetypes · ${out.counts.abilities} abilities · ${out.counts.ultimates} ultimates.\n\n`;
md+=`## Attunements\n\n| Attunement | Domain | Mana mechanic |\n|---|---|---|\n`;
attunements.forEach(a=>md+=`| **${a.name}** | ${a.descriptor} | ${a.mana} |\n`);
md+=`\n## Weapon archetypes\n\n${out.weaponArchetypes.join(" · ")}\n`;
for(const a of attunements){
  md+=`\n---\n\n## ${a.name}\n*${a.descriptor}* — ${a.mana}\n`;
  classes.filter(c=>c.attunement.toLowerCase()===a.key).forEach(c=>{
    md+=`\n### ${c.name}\n**${c.archetype}** · ${c.role} · resource: **${c.resource}**\n\n`;
    c.abilities.forEach(ab=>md+=`- **[${ab.type}] ${ab.name}**${ab.cost?` _(${ab.cost})_`:""} — ${ab.desc}\n`);
  });
}
fs.writeFileSync(path.join(DIR,"REQUIEM-classes.md"), md);

console.log(`parsed: ${out.counts.classes} classes, ${out.counts.abilities} abilities, ${out.counts.ultimates} ultimates, ${attunements.length} attunements`);
console.log("classes per attunement:", attunements.map(a=>`${a.name} ${classes.filter(c=>c.attunement.toLowerCase()===a.key).length}`).join(" | "));
const missing=classes.filter(c=>!c.abilities.length); if(missing.length) console.log("WARN classes with 0 abilities:", missing.map(c=>c.name));
