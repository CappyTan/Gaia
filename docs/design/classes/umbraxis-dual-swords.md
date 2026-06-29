# Abyssal Vector — UMBRAXIS × Dual Swords

> **Status: Frame RATIFIED (Dara, 2026-06-29); abilities proposed.** Greenfield design spec authored
> by the `build-class` skill against the [Class System Model](./README.md). The row, lanes, and seat
> are **`from-brief`** — locked in the ratified [Dual Swords family note](./dual-swords-family.md)
> (Dara, 2026-06-29); the kit abilities are `proposed`, pending a content review. Numberless by
> design; magnitudes are a later balance pass. Mechanics vocabulary (Drain / Crush / Anchored /
> event-horizon / time-dilation / Mass armor / damage-reflect / Singularity) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (Dara, 2026-06-28).

## Identity (derived + DNA)

- **Class:** Abyssal Vector · **Attunement × Archetype:** UMBRAXIS × Dual Swords
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** AGI (← Dual Swords) — a **DEF+AGI** durable bladesman
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it drains/steals/redirects, never made from nothing)
- **Attunement signature:** **Drain** (life/energy pulled *out* and transferred) · Crush · Anchored · **damage-reflect**

**Fantasy.** *(from family note.)* The Abyssal Vector is the **counter/redirect duelist** — a durable
bladesman who never spends the first blow, he *returns* it. He fights by reading the exchange and
**bending it back**: a blade kept in guard catches the attack and gravity throws its force onto the
striker (damage-reflect), while the other blade anchors the foe in reach and grinds gravity pressure
into it. Where the Sunblade wins on pure radiant crit and the Phasewalker dodges *through* the blow,
the Abyssal Vector **stands in it and turns it around** — DEF holds the line, AGI sharpens the parry
and the counter-crit, and every redirected newton feeds the well. *Distinct from the UMBRAXIS dagger
(The Lagrangian, the drain-siphon skirmisher): the Lagrangian **siphons life**; the Abyssal Vector
**redirects force** — the counter-bladesman, not the drain-skirmisher.*

**Duelist DNA — how this class wins the exchange.** *(shared dual-sword DNA, from the family note.)*
(1) **Crit** off AGI — clean, precise counter-cuts, not volume; (2) the signature **Riposte/Parry =
parry-and-redirect** — two blades make offense *and* defense one motion, and gravity bends the caught
attack back as reflected damage; (3) **flow/stance** — sustained counter-bladework that builds with
the exchange; (4) the Opening→Finisher payoff **reuses UMBRAXIS's own Crush→Singularity chain — no
new resource**: lane B anchors the foe and ramps **Crush** (the opening), and the **Singularity**
finishers collapse all held pressure (the payoff).

### Lanes *(from-brief — locked)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Redirect** | **Parry-and-redirect** — the signature counter: catch the incoming attack and let gravity bend its force back onto the striker (**damage-reflect**); answer with a counter-crit | **DEF**, parry/counter, AGI-crit, damage-reflect | reactive duelist / punisher | hard-hitting or many-attacker fights; a foe that swings into you |
| **B · Gravity Edge** | **Anchor/pull** the target onto your blade and grind ramping **Crush** in the exchange — the opening of the Crush→Singularity chain | AGI, DEF, Anchor, crush-ramp | single-target lockdown / pressure | bosses; pinning a key foe to ripen the collapse |
| **C · Event Blade** | **Mass-armor sustain** (DEF → damage reduction) + a little **Drain** to hold a long duel — the durable anchor that simply does not fall | DEF, mitigation, light Drain | durable front-line / self-sustain | attrition fights; little outside healing; holding the front |

**Build axes:** reactive-counter ↔ proactive-pressure (A↔B) · burst-redirect ↔ grind-sustain (A↔C) ·
crush-pressure ↔ endurance (B↔C). The DNA chain runs **B opens (Anchor + Crush pressure) → the
Singularity finishers collapse it**; **A punishes anything the foe throws at you** (reflect the blow,
counter-crit); **C keeps you on your feet long enough to land all of it** — no new combo-point
resource: the "Opening" *is* UMBRAXIS's own escalating **Crush**, and the payoff is **Singularity**.

---

## Auto-attack *(unlaned)*

- **Counterpoise** · phys · enemy · *two measured gravity-weighted cuts, blades kept balanced to guard between* · gen **minor UMBRAXIS** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Turnblade** · phys · enemy · *a parrying cut: the foe's force is bent back, dealing bonus reflected damage if it had struck at you* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **B · Hooked Pull** · util · enemy · *a gravity-edged hook drags the foe onto your blade and Anchors it (rooted)* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Weight the Edge** · phys · enemy · *a cut that seeds Crush — gravity pressure that ramps the longer the foe is held* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Mass Stance** · buff · self · *settle into a heavy guard: gain damage reduction (Mass armor)* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Caught Blow** · phys · enemy · *catch the next strike on your guard and answer with a counter-cut; reflects a share of the caught force* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Bleed the Guard** · phys · enemy · *a holding cut that Drains a sliver of HP to you while you hold the line* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Vector Cut** · phys · enemy · *redirect the line of an incoming attack into the foe beside it; reflected hit, with a counter-crit chance* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Press the Anchor** · phys · enemy · *a heavy cut on an Anchored foe; deepens both the Anchor and the held Crush* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Tighten the Orbit** · phys · enemy · *a cut that compresses held Crush, tightening the ramp on a held foe* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Drink the Blow** · buff · self · *brace: the next hits against you are partly absorbed and converted to UMBRAXIS (conservation)* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Backthrow** · phys · enemy · *a riposte that throws the foe's own weight against it; bonus reflected damage the harder it just hit* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Steady Drain** · mag · enemy · *a patient draining cut: Drain HP and a little of the foe's energy, banking UMBRAXIS* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Riposte Vector** · phys · enemy · *parry and bend the force back: high counter-crit, reflects a share of the caught attack* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Crush the Held** · phys · enemy · *a ramping crush on an Anchored foe; pressure tightens turn over turn* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Pin to the Blade** · util · enemy · *the foe is fixed at your edge — Anchor + event-horizon: it cannot flee or swap rows* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Sump Cut** · mag · enemy · *a sustaining cut: Drain ramps a touch each turn you hold the duel* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Returned in Kind** · phys · enemy · *answer a blow with a heavier one of its own making; reflected counter-crit scaling with the force caught* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Heavy Guard** · buff · self · *raise your effective mass: large damage reduction; you cannot be moved* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Full Reversal** · phys · enemy · *a complete parry-and-redirect: catch, bend back, and counter — heavy reflected damage and a near-certain counter-crit* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Bear Down** · phys · enemy · *force the Crush toward its threshold on a held foe; bonus damage as pressure peaks* · gen **major UMBRAXIS** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Gravity Parry** · buff · self · *counter stance: catch the next attack and throw its full force back at the striker (damage-reflect) with a counter-crit* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Hooked Anchor** · util · enemy · *drag the foe to your blade and pin it: Anchor + event-horizon for several turns* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Collapse the Hold** · phys · enemy · *collapse all held Crush on an Anchored foe in one cut: burst scaling with gravity pressure built* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Drawn from the Wound** · mag · self · *for a few turns, a share of all damage you take is Drained back to you as healing — you live on what you swallow* · cost **med UMBRAXIS** · cd **long** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Reflect the Field** · buff · self · *raise a gravity guard against the whole field: for a turn, every hit on you is partly bent back onto its source* · cost **med UMBRAXIS** · cd **long** · `proposed`
- **C · Lattice Guard** · buff · self · *plant immovably: heavy damage reduction and a slow Drain off attackers while you hold* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Newton's Answer** · phys · enemy · *meet a strike with an equal-and-opposite one: a counter-cut that returns the caught force amplified, guaranteed crit on a successful parry* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Grind to Powder** · phys · enemy · *a sustained crush: damage ramps each turn the foe stays Anchored* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Event Pin** · util · enemy · *deep, uncleansable Anchor: the foe cannot move, flee, swap rows, or be freed, while Crush grinds on* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Bulwark of the Vector** · buff · allAllies · *a gravitic shell: redirect a share of party damage onto your mass and reduce it* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Hall of Mirrors** · buff · self · *for several turns, a large share of every blow against you is reflected back at its striker as gravity-bent force* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Drink the Tide** · mag · enemy · *heavy single-target Drain: steal HP and a share of the foe's attack power, healing you and banking UMBRAXIS* · cost **high UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Recoil** · phys · enemy · *a riposte that throws back everything the foe has dealt this exchange: reflected burst scaling with damage you've absorbed* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **B · Crushpoint Cut** · phys · enemy · *collapse a fully-held Crush on a pinned foe into one heavy single-target strike* · cost **high UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Anchorfall** · util · enemy · *time-dilate the Anchored foe to a crawl: its tempo is dragged far back while Crush keeps tightening* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · The Standing Mass** · buff · self · *become a fixed mass: capped incoming damage and immunity to all CC and displacement for a few turns, Draining attackers throughout* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · The Returning Blow** · phys · enemy · *catch the heaviest strike and bend its entire force back: a near-lethal reflected counter on whatever just struck you, guaranteed crit* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Undertow Guard** · buff · allAllies · *shroud the party in damage-reducing mass and Drain a share of every blow against them back as party healing* · cost **high UMBRAXIS** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · Equal and Opposite** *(Redirect)* · self · *for several turns become a perfect mirror — every attack against you is bent fully back onto its striker, each return a guaranteed crit* · `proposed`
- **B · The Killing Orbit** *(Gravity Edge)* · enemy · *pull, pin, and collapse — Anchor the foe, grind the Crush to its peak, and shear it apart in one annihilating cut* · `proposed`
- **C · Immovable Vector** *(Event Blade)* · self · *become an unbreakable fixed point — total damage reduction and CC immunity, Draining every blow against you to refill the party's UMBRAXIS* · `proposed`
- **The Bent Exchange** *(neutral/fusion)* · enemy · *take the whole exchange and turn it — Anchor the foe, reflect its force back, and collapse the held Crush around it at once* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Counterpoint** · *your parries reflect more of the caught attack back at the striker* · `proposed`
- **B · Held Fast** · *your Anchors and event-horizons last longer* · `proposed`
- **C · Heavy Hide** · *your damage reduction (Mass armor) is higher* · `proposed`

**Set @ MNA 60**
- **A · Reflex Arc** · *after you parry or reflect a blow, your next counter-cut has bonus crit* · `proposed`
- **B · Mounting Weight** · *your Crush ramps faster while a foe is Anchored* · `proposed`
- **C · Toll of the Well** · *a share of all damage you take is Drained back to you as healing* · `proposed`

**Set @ MNA 90**
- **A · Total Reversal** · *your reflected damage scales with how much you've absorbed this exchange* · `proposed`
- **B · Shear Point** · *your collapse finishers can shear very low-HP Anchored foes apart (execute)* · `proposed`
- **C · Sump of Mass** · *while at high damage reduction, the force you absorb overflows into the party's UMBRAXIS* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary AGI ← Dual Swords · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all UMBRAXIS | ✓ |
| Provenance flag on every entry (row/lanes/seat `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other specs (invariant #8) | ✓ |
| DNA distinct from The Lagrangian: **redirects** force (reflect/counter), does not **siphon** life as its core | ✓ |
