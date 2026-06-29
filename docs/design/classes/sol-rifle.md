# Photon Vanguard — SOL × Rifle

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The class fantasy, seat (the
> **charged radiant-beam marksman**), the three locked lanes (A·Photon Lance / B·Sunmark /
> C·Overwatch), and the Marksman DNA are **`from-brief`** — the LOCKED row + sketch in the
> [Rifle family note](./rifle-family.md) (row/lanes/seat/DNA `from-brief`) and the brief; the kit's
> individual abilities are `proposed`. Numberless by design; magnitudes are a later balance pass.
> Mechanics vocabulary (Burn / Blind / Scorched / Overheat → Ignite → Detonate / Haste / Spread)
> draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md) (SOL suite).
> **NOTE — this is the existing combat-animation test class:** its ability `photonBeam` is the
> natural fit for **Lane A (Photon Lance)**, which is designed here around a charged radiant beam.

## Identity (derived + DNA)

- **Class:** Photon Vanguard · **Attunement × Archetype:** SOL × Rifle
- **Primary stat:** AGI (← SOL) · **Secondary stat:** SPD (← Rifle) — an **AGI/SPD charged-beam
  marksman**: AGI sharpens the radiant shot, SPD gets it off *first*
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **Attunement signature:** **Burn** (DoT) · SOL suite: **Blind** (miss chance), **Scorched**
  (vulnerability), **Overheat → Ignite → Detonate** (phase chain, here run as the *charge of the
  beam → the marked detonation*), **Haste / extra action**, **Spread** (DoTs propagate to adjacent
  foes). SOL is **pure offense — no defensive line.**

**Fantasy.** *(from-brief)* The Photon Vanguard fights with **one shot of distilled daylight.** It
charges a piercing radiant beam — a held breath of light that **scorches and blinds the target it
paints**, then **detonates the mark** for the decisive kill. Where the SOL Pistol-gunner (Gunslinger
Solaris) buries the line under a *crit-spray volley*, the Vanguard removes **one** target with a
**single charged beam** before it can answer: it acts *first* (SPD), suppresses with Overwatch fire
to hold the angle, paints its quarry, and lances it. The charge **is** SOL's own
Overheat → Ignite → Detonate, run down the barrel: heat builds as the beam winds up, the mark
ignites, and the marked Burn detonates as the finishing shot. It owns no armor and wants none — it
survives by **shooting first, blinding what it cannot kill, and never being in reach.** Precision,
not spray; the beam, not the hail.

### The shared Marksman DNA *(from-brief — how this is a Rifle)*

1. **The aimed shot (single-target precision burst).** The auto and the lance-line are a
   **single-target radiant beam** — the headshot, not a volume of rounds. The Vanguard is the
   *precision* applicator of Burn at range, not the fastest.
2. **Charge / aim (the wind-up).** A spent beat **loads a bigger shot** — the ranged cousin of the
   greatsword's momentum. No new combo resource: the charge **is** SOL's
   **Overheat → Ignite → Detonate**, stacking heat in the beam before release.
3. **The mark.** Paint a target (**Scorched** / **Blind**) for bonus damage and signature setup,
   then **detonate the mark** — the marked Burn blows for a finishing burst that can **Spread**.
4. **First-strike / range control.** SPD priority to **act first**, open the fight from max range,
   and **suppress** with Overwatch fire (the fragility answer = strike first, Blind, and stay out of
   reach — never armor or a ward, per SOL's pure-offense policy).

### Lanes *(from-brief — locked: A·Photon Lance / B·Sunmark / C·Overwatch)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Photon Lance** *(lead)* | **The charged radiant beam:** wind up a piercing photon beam (Overheat → Ignite → Detonate down the barrel) and lance one target — the showcase single-target shot, pierces the line behind it | **AGI**, Crit, Overheat/charge, single-target | single-target burst / boss spike | bosses & high-value targets; crit-rich charge gear; a target you can take down in one held shot |
| **B · Sunmark** | **Paint → detonate:** mark a target with **Scorched** / **Blind**, build Burn on the mark, then **detonate the mark** — the burst that can **Spread** to neighbors. The setup-and-pop lane | **AGI**/SPD, Burn, Scorched, Spread, mark-detonation | priority-kill enabler / burst-and-spread | a priority target to brand & pop; clustered foes for the detonation to Spread; coordinated party |
| **C · Overwatch** | **First-strike suppression:** SPD-priority opening fire that **Blinds** and **Hastes**, holding the angle so the line whiffs and the Vanguard always shoots first. The Marksman's *defense-by-offense* | **SPD**, Blind, Haste, first-strike/tempo | controller / opener / self-protect | fast or hard-hitting foes; low-support party where the marksman must hold its own ground; SPD/tempo gear |

**Build axes:** charged single-shot burst ↔ mark-and-detonate spread (A↔B) · kill-the-target ↔
win-the-tempo-by-shooting-first (A↔C) · self-carry beam ↔ Blind/Haste field-control (A,B ↔ C).

**Cross-lane synergy:** **C opens first and Blinds the line so it whiffs while the charge winds up →
B paints the priority target (Scorched/Blind) and stacks Burn on the mark → A lances it with the
fully-charged beam, and the marked Burn detonates and Spreads down the row.** Overwatch buys the
beat, Sunmark paints the kill, Photon Lance takes the shot.

---

## Auto-attack *(unlaned)*

- **Photon Pulse** · phys · enemy · *a quick uncharged pulse of light down the barrel — a single
  precise tap that kindles a wisp of heat (Overheat) on the target* · gen **minor SOL** · cd **none**
  *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Beam Tap** · phys · enemy · *a short charged beam at one target; builds Overheat (begins the charge)* · gen **moderate SOL** · cd **short** · `proposed`
- **B · Solar Reticle** · util · enemy · *settle the sights on a target: paint it with a light **Scorched** mark (it takes more from your fire)* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Mark of Light** · util · enemy · *lay a true mark on a foe and sear a light **Burn** into it, readying the detonation* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Holding Fire** · buff · self · *level the rifle and wait on the angle: gain **Haste** and a guaranteed first shot next turn* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Sight Picture** · phys · enemy · *a steadied charged shot; deepens **Overheat** on the target (winds the charge further)* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Suppression Beam** · util · allEnemies · *a sweeping suppressive beam across the line; lightly **Blind** the foes it rakes so they whiff* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Charge Cell** · buff · self · *vent the rifle's cell into the pool: bank a surge of **Overheat** for the next beam* · gen **major SOL** · cd **medium** · `proposed`
- **B · Scorch Mark** · util · enemy · *burn the mark deeper: heavy **Scorched** + **Burn** on a marked target* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Halo Mark** · phys · enemy · *a ringing shot on the mark; its **Burn** can jump to an adjacent foe (**Spread**)* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Sunscope** · buff · self · *sight through solar glare: **Haste** self and your next shot cannot miss (pierces **Blind** on your end)* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Coronal Charge** · phys · enemy · *a long-held charged lance; bonus damage scaling with the **Overheat** stacked on the target* · gen **major SOL** · cd **medium** · `proposed`
- **C · Watchfire** · util · allEnemies · *opening suppressive fire: **Blind** the line and drag back the enemy attack-bars (the anti-tempo beat)* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Pierce Charge** · phys · enemy · *a charged beam that passes through the target and the foe directly behind it* · gen **moderate SOL** · cd **medium** · `proposed`
- **B · Mark Cascade** · phys · enemy · *detonate a marked foe's **Burn**; the blast **Spreads** to its neighbors* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Sunpoint Mark** · phys · enemy · *a precise shot that maximizes **Burn** and **Scorched** on the mark, priming the big detonation* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Overburn Cell** · buff · self · *overcharge the cell on the draw: refund part of your attack-bar (**Haste** lean) and gain a stack of **Overheat*** · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Lining Up** · phys · enemy · *a fully steadied charge: a heavy beam that fully tops off the target's **Overheat**, priming the finisher* · gen **major SOL** · cd **medium** · `proposed`
- **C · Brand the Line** · util · allEnemies · *a raking suppressive beam; **Blind** + **Scorched** across the whole line at once* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Killbeam** · phys · enemy · *a heavy charged finisher-beam; massive vs a fully-**Overheated** target* · gen **major SOL** · cd **medium** · `proposed`
- **B · Sustained Beam** · phys · enemy · *a held continuous beam on the mark that pours **Burn** in and detonates it at the end, the burst **Spreading** onward* · gen **major SOL** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Radiant Bead** · phys · enemy · *spend the charge: a single piercing radiant shot that consumes the target's **Overheat** for a guaranteed crit* · cost **med SOL** · cd **medium** · `proposed`
- **B · First Shot** · util · enemy · *paint the priority target and open on it: deep **Scorched** + **Blind** so it whiffs and takes more from your fire* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Detonate Mark** · mag · enemy · *blow the mark: detonate all the **Burn** stacked on a marked foe, the blast **Spreading** to neighbors* · cost **med SOL** · cd **medium** · `proposed`
- **C · Glare Volley** · util · allEnemies · *a suppressive volley of light across the line: deep **Blind** so the field whiffs its next actions* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Daylance Pierce** · phys · enemy · *a deep charged beam that pierces the entire enemy column, scaling with the lead target's **Overheat*** · cost **med SOL** · cd **medium** · `proposed`
- **C · Ignition Mark** · mag · allEnemies · *open the engagement by Igniting the line: lay **Burn** on every foe so the detonations have fuel* · cost **med SOL** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Photon Verdict** · phys · enemy · *the executing beam — a colossal single charged shot, massive vs an **Overheated** or low-HP target* · cost **med SOL** · cd **medium** · `proposed`
- **B · Sunburst Mark** · mag · enemy · *brand the target with **Scorched** + heavy **Burn**; when it next takes a hit, the mark bursts and **Spreads*** · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Sear the Mark** · mag · allEnemies · *detonate every mark on the field at once, each burst **Spreading** to the next foe* · cost **high SOL** · cd **medium** · `proposed`
- **C · Overwatch Volley** · util · allEnemies · *a sustained suppressive barrage: **Blind** + **Scorched** the line and **Haste** yourself to keep firing first* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Lightpiercer** · phys · enemy · *the perfect charged shot: a guaranteed-crit beam that fully spends the target's **Overheat** and pierces the line behind it* · cost **high SOL** · cd **medium** · `proposed`
- **C · The Long Watch** · buff · self · *settle into overwatch for several turns: act first every turn, every shot **Hastes** you, and your opening fire **Blinds** what it hits* · cost **med SOL** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Sundering Beam** · phys · enemy · *a continuous charged beam held on one target that escalates each turn it stays on the mark* · cost **high SOL** · cd **long** · `proposed`
- **B · Brand Cascade** · mag · allEnemies · *paint and pop in a chain: mark the line, then detonate each mark in sequence, the **Burn** **Spreading** down the row* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Mark of the Pyre** · mag · enemy · *carve an un-cleansable burning mark; when it detonates it bursts for a crit-scaled blast that **Spreads** to all neighbors* · cost **high SOL** · cd **long** · `proposed`
- **C · Sunwatch** · util · allEnemies · *flood the field with overwatch glare: total **Blind** on all foes for several turns while you keep first-shot priority* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Solar Apex Beam** · phys · enemy · *the apex shot — a single annihilating charged beam that detonates all of the target's **Burn** and **Overheat** at once* · cost **high SOL** · cd **long** · `proposed`
- **C · First Strike Beam** · phys · allEnemies · *strike before the line can move: a pre-emptive raking beam that opens the turn, **Blinding** and **Scorching** every foe it crosses* · cost **high SOL** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Lance of the Sun** *(Photon Lance)* · enemy · *the one charged shot — wind every stack of **Overheat** into a single beam of distilled daylight and lance the target for a guaranteed maximal crit, piercing clean through the column behind it, scaling with missing HP* · `proposed`
- **B · Pyre Mark Detonation** *(Sunmark)* · allEnemies · *paint the whole field and pop it — brand every foe with max **Burn** and **Scorched**, then chain-detonate all the marks at once, each burst **Spreading** onward* · `proposed`
- **C · Annihilation Beam** *(Overwatch)* · allEnemies · *open the turn with total suppression — act first, **Blind** the entire field so nothing lands a shot, and rake a sustained first-strike beam across the line untouched* · `proposed`
- **Markfire Cascade** *(neutral/fusion)* · allEnemies · *the perfect engagement in one breath: **Blind** the line, paint every foe, then carry a single charged beam down the row that detonates and **Spreads** the **Burn** across every mark at once* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Sunlit Crosshair** · *your charged beams build **Overheat** faster and crit more vs **Overheated** foes* · `proposed`
- **B · Burning Reticle** · *your marks sear deeper — **Burn** on a marked target stacks higher* · `proposed`
- **C · Watchman's Burn** · *foes that miss you while **Blinded** by your suppressive fire take **Burn*** · `proposed`

**Set @ MNA 60**
- **A · Charged Detonation** · *your charged shots pierce one foe further and deal more the longer the beam was held* · `proposed`
- **B · Markfire** · *your mark-detonations **Spread** to more foes when they burst* · `proposed`
- **C · Killscope** · *you act earlier in the turn (first-shot priority bites deeper) and your opening shot cannot miss* · `proposed`

**Set @ MNA 90**
- **A · Sunspike** · *your charged finishers deal more to low-HP and fully-**Overheated** targets* · `proposed`
- **B · Pyre Painter** · *your **Burns** stack higher and don't expire while you keep marking foes with fire* · `proposed`
- **C · Eye on the Angle** · *while a foe is **Blinded** by your fire your beams cannot miss it, and your suppressive fire lightly **Hastes** you* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Rifles.** Photon Vanguard is the **charged
  radiant-beam marksman**: a single piercing photon beam (charge = Overheat → Ignite → Detonate down
  the barrel), a paint-and-detonate mark (Scorched/Blind → Burn → burst that Spreads), and
  first-strike Overwatch suppression. Distinct from the NOX **Terminus** (a freezing
  *kill-shot* — mark → Frozen → Shatter-shot, an HP-execute), the ANIMA **Genewarden** (precision
  *gene-injection* — mark → Infestation/mutation, non-healer), the QUANTA **Observer Prime** (the
  *collapse-shot* — observe → collapse a target's *fate*), and the UMBRAXIS **Astrolancer** (a
  *gravity* lance — Anchor/Drain at range). Only the Vanguard's shot is **fire that Spreads** and
  **light that Blinds**, and only it *detonates a marked Burn* as its decisive shot.
- **Same-archetype — vs its SOL Pistols cousin (Gunslinger Solaris, *volume*).** The split is the
  family axis itself: Gunslinger Solaris is the **doubled-AGI crit-spray volley** — fan-the-hammer,
  many fast radiant rounds raking Burn across the line, *volume of fire*. Photon Vanguard is the
  **single charged BEAM** — one held, piercing, marked shot that removes a target before it acts:
  **precision, not spray.** The Gunslinger buries the line under a hail; the Vanguard paints one
  target and lances it. Same SOL signature, opposite delivery (hail vs the one beam).
- **Same-attunement (#10) — SOL concept budget.** It reuses the SOL *signature* (Burn) and the full
  SOL suite (Blind / Scorched / Overheat → Ignite → Detonate / Haste / Spread) freely, as the
  framework intends — but it does **not** pile onto a saturated SOL role. The **single-target crit
  duel** is owned by Sunblade (Dual Swords); the **blink-execute assassin** by Eclipsedancer (Dual
  Daggers); the **back-line magic artillery/nuker** by Heliomancer (Staff); the **block off-tank** by
  Dawnwarden (Sword & Shield); the **slam→detonation point-breaker** by Solar Arbiter (Hammer); the
  **fast melee line-cleaver** by Starbreaker (Two-Handed Sword); the **crit-spray volley gunner** by
  Gunslinger Solaris (Dual Pistols). The Vanguard's seat — *the ranged single charged radiant beam:
  charge → paint the mark → detonate as the decisive precision shot, shooting first* — is held by no
  other SOL class. (SOL is by ratified policy **pure offense, no defensive line** — honored:
  Overwatch is *first-strike Blind/Haste suppression as defense-by-offense*, never a Block or ward.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary SPD ← Rifle · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL (runs hot) | ✓ |
| Provenance on every entry (fantasy/seat/lanes/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Rifle siblings *and* from Gunslinger Solaris | ✓ |
| Same-attunement concept budget (#10) — reuses SOL signature only; no saturated-role pile-on; SOL no-defense policy honored | ✓ |
