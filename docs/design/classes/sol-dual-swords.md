# Sunblade — SOL × Dual Swords

> **Status: Frame RATIFIED (Dara, 2026-06-29); abilities proposed. Re-cut via a grill review of the
> build (Dara-ratified, 2026-06-29) — supersedes the prior Sunblade.** Three rulings reshaped the kit:
> **(1)** Sunblade is the **highest-risk, party-dependent glass-cannon flagship** — pure offense, no
> defensive line; lane C is a *light emergency self-pocket*, not self-sufficiency. **(2) Crit is the
> through-line across all three lanes** (lanes differ by *role*, not damage-type), so the purest-crit
> flagship stays crit no matter how the 2-of-3 rotation pushes it. **(3) One unified engine —
> Overheat:** cuts & auto build it; each lane *spends heat its own way*; **Burn is purely downstream**
> (ignited from Overheat — no separate direct-apply path). Greenfield design spec authored against the
> [Class System Model](./README.md); the seat (AGI+AGI flagship) + the three rulings are **`from-brief`**
> (the [Dual Swords family note](./dual-swords-family.md) + the grill); the abilities are `proposed`.
> Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary (Overheat / Ignite /
> Detonate / Burn / Spread / Blind / Scorched / Haste) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (SOL suite).

## Identity (derived + DNA)

- **Class:** Sunblade · **Attunement × Archetype:** SOL × Dual Swords
- **Primary stat:** AGI (← SOL) · **Secondary stat:** AGI (← Dual Swords) — the **doubled-stat
  flagship**, the purest crit duelist
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **The engine — Overheat:** cuts and the auto build **Overheat** stacks on the target; each lane
  spends that heat its own way (**A** detonates it into a crit-burst · **B** ignites it into Spreading
  **Burn** · **C** banks it on a parry, then pours it into a counter-crit). **Burn is downstream of
  Overheat** (no standalone DoT). One number to read, three spend-patterns.
- **Attunement signature:** **Burn** (the heat made into a DoT, ignited from Overheat and **Spread**) ·
  SOL suite: **Blind** (miss chance), **Scorched** (vulnerability), **Overheat → Ignite → Detonate**
  (phase chain), **Haste / extra action**. **SOL is pure offense — no defensive line.**

**Fantasy.** *(from-brief)* A radiant **pure-crit duelist** — a stand-and-duel bladesman who wins the
exchange with clean, brilliant **crits** and a parry of light. Twin blades chain escalating bladework
that builds **Overheat**; he spends that heat three ways — **detonating** it into a killing crit, or
**igniting** it into fire that catches and **Spreads** across a line, or **banking** it on a parry to
answer the next blow with a radiant counter-crit. The flagship of the dual-sword family: AGI on AGI,
crit on crit, **no armor and no need of it** — he hits the hardest and dies the fastest, the
**highest-risk carry who leans on his team**.

### The shared duelist DNA *(from-brief — how this is a dual-sword)*

1. **Crit (AGI-keyed) is the win condition — *in every lane*.** The Sunblade wins by landing clean,
   *critical* cuts; precision, not volume. Whether he kills one target, cleaves a line, or counters a
   blow, the answer is a **crit**.
2. **Riposte / Parry.** Two blades = offense *and* defense in one; the off-blade is kept back to
   **parry** an attack — the duelist's only survival tool (SOL has no armor line). Its parry is *of
   light*: a parried blow **banks heat** and answers with a counter-crit, and **Blind** keeps the enemy
   missing. It buys him survival in the exchange — *but he still wants a pocket*.
3. **Flow / stance.** Sustained bladework that builds **Overheat** across the *exchange*, not a single
   burst — escalating cuts that compound (entropy rising).
4. **Opening → Finisher reuses SOL's own phase chain.** No new combo resource: the Opening **is**
   **Overheat → Ignite → Detonate** — cuts stack heat; finishers detonate it (crit) or ignite it (Burn).

### Lanes *(from-brief — crit through-line; lanes differ by role)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Solar Edge** *(lead)* | **single-target burst-crit**: stack Overheat, **detonate** it into a killing crit — the AGI+AGI duel | **AGI**, Crit/Crit Dmg, Overheat | solo carry / single-target spike | bosses & priority kills; crit-rich gear |
| **B · Sunflare** | **AoE-cleave crit**: crits **ignite** Overheat into **Burn** that **Spreads** across the line | **AGI**, Crit, Burn/Spread | multi-target / cleave pressure | clustered foes; you want the line to catch fire |
| **C · Riposte** | **counter-crit defense**: parry → **bank heat** → radiant **counter-crit**; Blind to win the exchange. A *light emergency self-pocket* — not self-sufficiency | **AGI**, Crit, parry/Blind/Evasion | survive the exchange (still wants a pocket) | low-support moment; a hard hitter you must turn aside |

**Build axes:** kill-one ↔ cleave-many (A↔B) · all-in offense ↔ counter-survival (A↔C) ·
spread-the-fire ↔ turn-aside-and-counter (B↔C). **Every lane crits** — they differ by *aim* (one /
many / counter), not by whether you crit.

**The engine, one line:** *build Overheat → **A** detonates it (crit one) · **B** ignites it (Burn the
line) · **C** banks it on a parry (counter-crit). Burn only ever comes from igniting your own heat.*

---

## Auto-attack *(unlaned)*

- **Sunblade Flourish** · phys · enemy · *two flowing radiant cuts (two crit rolls), each kindling a wisp of heat (builds Overheat)* · gen **minor SOL** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Solflare Cut** · phys · enemy · *a quick crit-leaning cut; builds Overheat on the target (the Opening)* · gen **moderate SOL** · cd **short** · `proposed`
- **B · Searing Slice** · phys · allEnemies · *a sweeping twin cut at the line; on a crit, ignite a little Overheat into Spreading Burn* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Glare Cut** · phys · allEnemies · *a flashing cleave; crits lightly Blind and ignite a wisp of Spreading Burn* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Parry of Light** · buff · self · *raise the off-blade: brace to parry the next hit and **bank heat** for a radiant counter-crit* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Radiant Lunge** · phys · enemy · *a heavy crit-leaning thrust; deepens Overheat on the target* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Counter Spark** · phys · enemy · *a strike; if you parried last turn it's a **guaranteed crit** fuelled by banked heat* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Brightblade Combo** · phys · enemy · *a flowing single-target crit chain; bonus crit vs Overheated targets* · gen **major SOL** · cd **medium** · `proposed`
- **B · Cinder Slash** · phys · allEnemies · *a cleaving cut; crits ignite Overheat into Burn that **Spreads** to adjacent foes* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Ignite Edge** · phys · allEnemies · *a cleave that ignites the foes' Overheat into stacking, Spreading Burn* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Sunder Riposte** · phys · enemy · *a counter-cut fuelled by **banked heat**, scaling with how recently you parried; Scorched on hit* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Flowing Edge** · phys · enemy · *a sustained single-target crit chain; each clean crit refunds attack-bar (Haste) and builds Overheat* · gen **major SOL** · cd **medium** · `proposed`
- **C · Dazzling Guard** · buff · self · *a stance: for a few turns a parried hit Blinds the attacker and **banks heat*** · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Heat Edge** · phys · enemy · *a crit combo; the final crit **detonates** Overheat for a single-target burst* · gen **moderate SOL** · cd **medium** · `proposed`
- **B · Burning Exchange** · phys · allEnemies · *a cleaving duel; crits deal bonus vs Burning foes and feed the Spread* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Flashpoint Cut** · phys · allEnemies · *a crit cleave that **detonates** the foes' Burn; the blast Spreads onward* · gen **major SOL** · cd **medium** · `proposed`
- **C · Mirrorlight Parry** · buff · self · *a stance: for a few turns a parried hit reflects fire back as a **banked-heat** counter-crit* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Sunpoint Strike** · phys · enemy · *a precise crit thrust that maximizes Overheat, priming the finisher* · gen **major SOL** · cd **medium** · `proposed`
- **C · Riposte Flurry** · phys · enemy · *a chain of counter-cuts fuelled by **banked heat**; bonus per parry banked this fight* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Solar Apex** · phys · enemy · *a heavy single-target crit finisher; massive vs fully-Overheated targets* · gen **major SOL** · cd **medium** · `proposed`
- **B · Wildfire Exchange** · phys · allEnemies · *a sweeping crit cleave; crits ignite Burn that **Spreads** among every foe it touches* · gen **major SOL** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Solar Verdict Cut** · phys · enemy · ***detonate** the target's Overheat: a guaranteed-crit burst* · cost **med SOL** · cd **medium** · `proposed`
- **B · Blazing Flash** · phys · allEnemies · *a searing cleave; crits deep-Blind and ignite Spreading Burn* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Detonating Cut** · phys · allEnemies · *a crit cleave that **detonates** the foes' Burn on the spot, Spreading to neighbours* · cost **med SOL** · cd **medium** · `proposed`
- **C · Riposte Stance** · buff · self · *a parry stance: parry the next several hits, each **banking heat** for a Burning counter-crit* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Coronal Lunge** · phys · enemy · *a deep single-target crit scaling with the target's Overheat stacks* · cost **med SOL** · cd **medium** · `proposed`
- **C · Blinding Parry** · buff · self · *brace: the next hit is parried, Blinds the whole enemy line, and **banks a surge of heat*** · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Sunlight Execution** · phys · enemy · *a crit execution; massive vs Overheated or low-HP foes* · cost **med SOL** · cd **medium** · `proposed`
- **B · Scorch Brand** · phys · allEnemies · *a cleave that brands foes **Scorched** and, on crit, ignites heavy Spreading Burn* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Pyre Exchange** · phys · allEnemies · *a crit cleave that **detonates** every Burn on the field at once, each blast Spreading onward* · cost **high SOL** · cd **medium** · `proposed`
- **C · Radiant Reprisal** · phys · enemy · *a counter that unleashes all your **banked heat** at once as a single crit* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Zenith Cut** · phys · enemy · *the perfect single strike: a guaranteed-crit finisher that fully **detonates** Overheat* · cost **high SOL** · cd **medium** · `proposed`
- **C · Sunward Guard** · buff · self · *for several turns every hit you take is parried, each a **banked-heat** Burning counter-crit* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Brilliant Duel** · buff · self · *a flow stance: crits grant Haste and a chance at an extra action for several turns* · cost **high SOL** · cd **long** · `proposed`
- **B · Conflagrant Blade** · phys · allEnemies · *a cleave; crits keep igniting escalating, Spreading Burn across the line each turn* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Sunblind Field** · phys · allEnemies · *a radiant cleave that deep-**Blinds** all foes and, on crit, ignites Spreading Burn* · cost **high SOL** · cd **long** · `proposed`
- **C · Aegis of Light** · buff · self · *a wall of parrying light: parry nearly every incoming hit briefly, each a **banked-heat** counter-crit* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Searing Verdict** · phys · enemy · *a colossal guaranteed-crit finisher; **detonates** all the target's Overheat and Burn at once* · cost **high SOL** · cd **long** · `proposed`
- **C · Sunburst Counter** · phys · allEnemies · *convert all your **banked heat** into a single radiant crit-nova; Scorched on every foe it catches* · cost **high SOL** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Edge of the Sun** *(Solar Edge)* · enemy · *a single perfect cut — a guaranteed maximal crit that **detonates** all the target's Overheat at once, scaling with missing HP* · `proposed`
- **B · Solar Conflagration** *(Sunflare)* · allEnemies · *a sweeping crit that ignites max Burn across the line and chain-**detonates** it, each blast Spreading onward, Blinding the survivors* · `proposed`
- **C · Mirror of Dawn** *(Riposte)* · self → allEnemies · *raise a perfect parry for the turn — turn aside every incoming blow and answer the whole line with **banked-heat** counter-crits* · `proposed`
- **Sunblade Ascendant** *(neutral/fusion)* · allEnemies · *become a blade of pure daylight: Blind every foe, then a flowing crit-chain that ignites, Spreads, and detonates Burn across the whole line* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Sunkindle** · *your strikes build Overheat faster* · `proposed`
- **B · Emberspread** · *the Burn your crits ignite spreads to more foes* · `proposed`
- **C · Lightguard** · *after you parry a hit, gain Evasion and bank extra heat* · `proposed`

**Set @ MNA 60**
- **A · Radiant Precision** · *your crit chance rises against Overheated foes* · `proposed`
- **B · Combustion Bloom** · *your crit-ignited Burn detonations hit harder* · `proposed`
- **C · Counterlight** · *your banked-heat counters always critically strike* · `proposed`

**Set @ MNA 90**
- **A · Sunkiller** · *your finishers deal more to low-HP foes* · `proposed`
- **B · Solar Wildfire** · *your Burns stack higher and don't expire while you keep critting* · `proposed`
- **C · Radiant Bulwark** · *while you have Evasion, foes that miss you take Burn* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary AGI ← Dual Swords · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL | ✓ |
| **Grill rulings applied:** crit through-line in all 3 lanes · one Overheat engine (Burn downstream) · lane C = light self-pocket (not self-sufficient) | ✓ |
| Provenance flag on every entry (fantasy/lanes/DNA/rulings `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
