# REQUIEM — Battle Mechanics (Ascension · Soul Burn · Harmonic Ascension · Archon Types)

> **See also:** [`../battle-system-2.0.md`](../battle-system-2.0.md) — the newer, buildable spec for
> Ascension / Soul Burn (the *Ascension Matrix* affix, the 4-category ability rework, MP removal).
> That draft is the design intent to implement toward; this file remains the original concept capture.

Canon from Dara Saadat, captured 2026-06-18 (design notes + IRL STONKS chat). This is the
combat-systems layer that sits **on top of** the class compendium
([`REQUIEM-classes.md`](REQUIEM-classes.md)) — it is not yet in the compendium HTML, so it
lives here as its own faithful capture. Transcribed verbatim where quoted; nothing invented.

> **Not in the POC.** `app/gaia.html` does not implement any of this yet — its combat is the
> invented placeholder ring + signature effects. These mechanics are REQUIEM canon to reconcile
> toward, per the canon-vs-POC rule in `CLAUDE.md` / `CONTEXT.md`.

## The three mechanics (verbatim)

**ASCENSION** — proc effect that allows SOUL BURN, can be force cast with rare gear. Better
gear gives higher proc chance and uptime.

**HARMONIC ASCENSION** — synergy of two ascended players who harmonize attunements AND proc
ascension at the exact same time, allowing for power greatly magnified more so than the
combined mana attunement of the two players. Best for two players who are of the same mana
attunement (ie both Quantum Spellblades), but can be different classes (Quantum Spellblade and
Quantum Marksman).

**SOUL BURN** — draw dps/hps boost from life drain. Dangerous yet increases output. Many ways
to increase throughput: increase attack speed, reduce global cool downs, higher dmg or healing
and mitigation, and best of all, provides a jump in mana proficiency which unlocks more
powerful abilities. Mana restores at a specific rate […]. *(Note tails off in the source.)*

## Design intent (Dara's words, from chat)

On **Soul Burn**:
> One idea I thought was good is this Soul burn effect where you immediately start to life
> drain yourself to amp up damage. This is where the game gets good because good healers will
> allow you to push the envelope by not just healing you for HP, but allow you to really pump
> if the healer is insane.
>
> So in an indirect way, good healers actually make just as good of a contribution to damage
> output. And it encourages riskier play.

On **Harmonic Ascension**:
> Harmonic ascension is fun because two players who are in alignment can actually work as a
> team among the greater party and try to tag team. I imagined raids or large party fights
> where it wasn't WHO topped dps meters … it's what group of two really synergized.

**Takeaways for reconciliation:**
- Soul Burn turns self-inflicted life drain into an output multiplier → healers become a *damage*
  enabler, not just sustain. Risk/reward lever; rewards a strong healer pocketing a burning DPS.
- Ascension is the gear-gated proc gate that unlocks Soul Burn (rare gear can force-cast it;
  better gear → more proc chance + uptime).
- Harmonic Ascension is a two-player co-op super: same-instant ascension + harmonized attunement
  yields more than the sum. Designed around synergized duos in raids/large fights, not solo DPS
  rankings.

## Archon Types (from the `requiem-lore` note, verbatim)

An **Archon** is an attunement-mastery threshold — a fighter who has embodied a faction's
ontology deeply enough to manifest it physically. The tier referenced by the super-ability
sketch below (Archon Type I / II) maps to these definitions:

**Archon Type I — Mortal Mastery.** A fighter who has achieved sufficient mastery of a single
faction's ontology that their body begins to embody it physically. Eyes change color. Weapons
manifest attunement effects naturally. The first threshold of what was once called "divine
gift."
*Requirement: 100 MNA in a single attunement.*

**Archon Type II — Dual Convergence.** A being who has partially embodied two faction
philosophies simultaneously. This is considered theoretically contradictory by scholars — Sol
and Nox cannot both be true. And yet. Type II Archons exist as living paradoxes, wielding
incompatible realities at once.
*Requirement: 100 MNA in two different attunements simultaneously.*

**Archon Type III — (intentionally mysterious).** The design note literally reads: intentionally
mysterious. This is the pathway that leads toward the **Sixth Deity** — a being or state that
exists beyond the five-faction framework entirely. No class in the current roster reaches this.
It is what lies beyond the game. *(Unknown. Perhaps unknowable.)*

## Fragment — Archon-tier supers (still incomplete)

A separate sketch of tiered "super" abilities on Graviton / Archon-type classes; the top of that
note was cut off, so the list is partial. The Archon Type tags now resolve to the definitions
above. **Treat the abilities as partial/unconfirmed** until Dara provides the full list.

- *(Quanta)* … super — **Wave Collapse**
- **Sol Graviton Breaker** (Archon Type …) — Second Tier super — **Nova …**, plus damage
- **Nox Graviton Adjudicator** (Archon Type II) — Second Tier super — **Absolute Zero
  Singularity**, tank plus slow CC
- **Graviton Battlemage** (Archon Type I) — First Tier super — **Schwarzschild Collapse**

Cross-reference: the only Graviton class currently in the compendium is **Graviton Warden**
(Umbraxis, Hammer). The "Breaker / Adjudicator / Battlemage" Archon variants and the
First/Second-Tier super system are **not** in the 45-class roster — they read as a newer
super/Archon layer above the base classes that Dara is still drafting.

## Source

Dara Saadat's design notes + `requiem-lore` note (screenshots) + IRL STONKS chat, 2026-06-18.
The accompanying updated class compendium from the same drop is captured in
`requiem-compendium.source.html` (250 abilities — more complete ability text than the prior
send).
