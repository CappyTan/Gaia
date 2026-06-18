# REQUIEM — Class Compendium

> Faithfully extracted from Dara Saadat's source (`requiem-compendium.source.html`) by `parse-requiem.js`. Do not hand-edit — re-run the parser. Some ability descriptions are truncated in the source; they are reproduced as-is.

**REQUIEM** — Attunement Combat System. 45 classes · 5 attunements · 9 weapon archetypes · 246 abilities · 45 ultimates.

## Attunements

| Attunement | Domain | Mana mechanic |
|---|---|---|
| **Sol** | Expansion · Light · Fire · Entropy | SOL MNA → Scales damage output (up to +60% at 200) |
| **Nox** | Preservation · Cold · Darkness · Order · Anti-Entropy | NOX MNA → Scales damage output (up to +60% at 200) |
| **Anima** | Life · Purpose · Evolution · Vitality | ANIMA MNA → Scales healing potency (up to +60% at 200) |
| **Quanta** | Probability · Time · Observation · Possibility | QUANTA MNA → Scales SPD / Turn Order priority |
| **Umbraxis** | Gravity · Spacetime · Singularities · Cosmic Structure | UMBRAXIS MNA → Scales Defense / Damage reduction |

## Weapon archetypes

Sword & Shield · Dual Swords · Two-Handed Sword · Hammer · Dual Daggers · Dual Pistols · Rifle · Staff · Spellblade

---

## Sol
*Expansion · Light · Fire · Entropy* — SOL MNA → Scales damage output (up to +60% at 200)

### Dawnwarden
**sword & shield** · Paladin Tank · resource: **Radiance**

- **[PASSIVE] Solar Presence** — Passive: Every 25 Radiance reduces enemy accuracy by 10%.
- **[BASIC] Searing Slash** — Attacks single target. Generates 15 Radiance. If target has any Sol status effect — inflicts **Sunblind** (reduces hit chance 25% for 1 turn).
- **[BASIC] Bastion of Dawn** _(20 RES)_ — Slams shield down. Taunts all enemies for 2 turns. Grants all allies a **Morning Shield** barrier equal to 15% of Dawnwarden's max HP.
- **[SIGNATURE] Corona Aegis** — Creates burning aura around self. For 3 turns — whenever an enemy strikes the Dawnwarden with a physical attack, they take fire damage back and have SPD reduced by 15%.
- **[ULTIMATE] Daybreak** _(100 RES)_ — Raises shield releasing a blinding wave of pure dawn light. High Sol damage to all enemies. Forcefully dispels all positive enemy buffs. Allies fully cleansed of debuffs and healed

### Sunblade
**dual swords** · Duelist · resource: **Solar Charge**

- **[PASSIVE] Burning Horizon** — Passive: Consecutive hits stack attack speed and solar damage.
- **[BASIC] Ray Strike** — Quick double-slash. Deals moderate physical + Sol damage. Builds 1 stack of Solar Charge.
- **[BASIC] Solar Flare Dash** — Steps through light to reappear instantly behind an enemy. Deals Sol damage. Pushes enemy back on turn timeline. Generates 1 stack of Solar Charge.
- **[SIGNATURE] Prism Dance** — Unleashes a whirlwind of 5 slashes distributed randomly across the enemy team. Each strike consumes 1 stack of Solar Charge to deal bonus True Damage.
- **[ULTIMATE] Helios Rush** — Consumes all Solar Charge stacks. Strikes primary target 6 times in rapid succession. Each critical hit extends a team-wide SPD buff (+30%) for 2 turns.

### Starbreaker
**two-handed sword** · Berserker · resource: **Core Heat**

- **[PASSIVE] Dying Star** — Passive: Damage increases as HP decreases.
- **[BASIC] Density Strike** — Brutal overhead swing. Heavy physical damage. Generates 20 Core Heat. Pushes enemy down the turn timeline.
- **[BASIC] Gravity Well** — Slams sword into ground. Pulls all frontline enemies into a single cluster. Increases Core Heat by 15%. Inflicts **Weighed Down** — reduces enemy evasion to 0% for 2 turns.
- **[SIGNATURE] Singularity Cleave** — Sweeping arc attack hitting all adjacent enemies. Damage scales higher the lower the Starbreaker's current HP. Pairs with the Dying Star passive — low HP is maximum power.
- **[ULTIMATE] Supernova Strike** — Unleashes entire stored stellar core energy in one catastrophic blow. Massive armor-piercing explosive damage to entire enemy team. Leaves a burning aura dealing Sol DoT for 3 turn

### Solar Arbiter
**hammer** · Bruiser / Control · resource: **Judgment**

- **[PASSIVE] Eye of Sol** — Passive: Judged enemies take increased damage and cannot hide.
- **[BASIC] Righteous Gavel** — Hits single target. Applies **Judgment Mark** for 3 turns. Deals bonus damage if target has any negative status effects.
- **[BASIC] Decree of Light** — Emits pulse of truth. Cleanses 1 debuff from an ally. Grants that ally a **Verity Shield** — converts the next incoming attack into healing instead of damage. Generates 15 Ver
- **[SIGNATURE] Smite the Guilty** — Slams hammer on marked enemy. Consumes the Judgment Mark. Deals massive Sol damage. Stuns target for 1 turn.
- **[ULTIMATE] Final Verdict** — Summons a colossal spectral gavel from the heavens. High physical + Sol damage to entire enemy team. Any enemy below 25% HP is instantly executed. Surviving enemies are Silenced fo

### Eclipsedancer
**dual daggers** · Skirmisher · resource: **Eclipse Charge**

- **[PASSIVE] Afterimage** — Passive: Dashes and crits leave echoes that repeat attack damage.
- **[BASIC] Corona Stash** — Quick stab from shadows. Deals high critical damage. If it lands a critical hit — enters Solar Veil for 1 turn.
- **[BASIC] Umbral Shift** — Swaps places with an active Refraction Echo. Cleanses all tracking debuffs. Extends stealth duration.
- **[SIGNATURE] Blinding Mirror** — Throws a flurry of reflective daggers. Moderate damage to frontline. Applies **Total Eclipse** to primary target — all their attacks miss for 1 turn.
- **[ULTIMATE] Solar Eclipse** — Plunges entire battlefield into a cosmic eclipse. Eclipsedancer vanishes completely for 2 turns. Summons 3 Refraction Echoes. For 2 turns — can attack without breaking stealth

### Gunslinger Solaris
**dual pistols** · Gunslinger · resource: **Solar Charge**

- **[PASSIVE] Running Hot** — Passive: High Velocity causes shots to apply Burn effects.
- **[BASIC] Dual Discharge** — Rapid two-shot burst. Sol + Energy damage. Generates 15 Solar Charge. Increases Velocity by 5%.
- **[BASIC] Flare Shot** — High-intensity tracing round. Marks enemy with **Target Illuminated** — increases critical hit chance of ALL allies against that target by 20% for 2 turns.
- **[SIGNATURE] Bullet Time / Overcharge** — Spend 50 Solar Charge to immediately take another turn. During this bonus turn — all pistol attacks strike an additional random target simultaneously.
- **[SIGNATURE] Bullet Time** _(50 RES)_ — Spend Solar Charge for an immediate bonus attack turn.
- **[ULTIMATE] Corona Storm** — Spins in place unleashing an absolute tempest of hyper-velocity photon lasers at the entire enemy party. Fires 12 shots distributed randomly across all enemies. Each shot permanent

### Photon Vanguard
**rifle** · Precision Sniper · resource: **Light Amplification**

- **[PASSIVE] Light Finds a Way** — Passive: Shots gain armor penetration with distance.
- **[BASIC] Focused Beam** — Precise rifle shot dealing high piercing damage in a straight line. Hits both the primary target AND the enemy standing directly behind them.
- **[BASIC] Photon Lock-On** — Spend the turn entering sniper stance. Critical Damage +50%. Next attack cannot be blocked or parried. Generates 30 Photon Charge.
- **[SIGNATURE] Tactical Flare** — Launches a flare capsule at an enemy position. Dispels all enemy evasion buffs. Applies **Melt Armor** (-30% DEF) to all targets in that row.
- **[ULTIMATE] Aphelion** — Channels all weapon energy into a single massive orbital laser link. Fires a colossal beam of concentrated Sol energy piercing through a single target for catastrophic damage. If t

### Heliomancer
**staff** · Solar Mage · resource: **Radiance**

- **[PASSIVE] The Wellspring** — Passive: Sprout Nodes heal allies or damage enemies when triggered.
- **[BASIC] Solar Flare** — Casts a bolt of plasma at an enemy. Generates 20 Fusion Energy. If a Miniature Sun is active near the target — the sun fires a matching minor bolt simultaneously.
- **[BASIC] Protoplanetary Spark** — Summons a **Miniature Sun** construct with 30% of caster's HP onto an empty battlefield slot. Acts independently each turn.
- **[BASIC] Evolutionary Bolt** _(+15 RES)_ — High Spirit damage. Places Sprout Node on turn timeline.
- **[SIGNATURE] Gravitational Pull** — Commands all active Miniature Suns to shift positions simultaneously — pulling adjacent enemies toward them and applying **Immobilized** for 1 turn.
- **[SIGNATURE] Primal Growth** _(35 MP)_ — Heal self for significant HP. Grant Thick Hide (+25% DEF) for 2 turns.
- **[ULTIMATE] Starfall** — Forces all active Miniature Suns to collapse simultaneously into a massive cosmic chain reaction. Devastating Sol + Fire damage to all enemies. Leaves a **Nebula Restorative Cloud*

### Starforge Knight
**spellblade** · Battlemage · resource: **Fusion Energy**

- **[PASSIVE] Living Reactor** — Passive: High Fusion Energy grants bonus damage and passive heat aura.
- **[BASIC] Forge-Slap** — Strikes enemy with heavy hard-light blade. Shifts core toward Entropy. Generates a minor shield.
- **[BASIC] Plasma Singularity** — Casts a swirling ball of Sol energy at an enemy row. Fire damage over time. Shifts core toward Fusion.
- **[BASIC] Forge Strike** _(+15 RES)_ — Hard-light blade strike. Generates Fusion Energy.
- **[SIGNATURE] Solar Reforging** — Instantly resets Stellar Core to perfect center. Cleanses all debuffs from the Knight. Transforms weapon into a **Sun-Spear** for 2 turns — basic attacks gain 2-tile reach.
- **[ULTIMATE] Heart Of The Sun** — Plunges blade directly into armor's power core. Blinding shockwave of hard-light blades in every direction. Heavy physical + Sol damage to all enemies bypassing all defensive barri

---

## Nox
*Preservation · Cold · Darkness · Order · Anti-Entropy* — NOX MNA → Scales damage output (up to +60% at 200)

### Penumbral Bastion
**sword & shield** · Dark Sentinel · resource: **Entropy Debt**

- **[PASSIVE] Immutable Presence** — Passive: Staying stationary builds Permanence stacks.
- **[BASIC] Chill-Bite Strike** — Physical + cold damage to single target. Generates 15% Contraction. Inflicts **Frostbite** — reduces target physical damage output by 15% for 2 turns.
- **[BASIC] Gravity Pull** — Slams black shield into earth creating a vacuum. Forces Taunt on all enemies for 2 turns. Pulls frontline enemies closer, trapping them in the same row. Builds Contraction by 20%.
- **[SIGNATURE] Absolute Zero Ward** — Forms barrier of dark matter around self. For 2 turns — any enemy that casts a spell or uses an ability targets the Bastion instead. Absorbs 30% of that damage as direct heali
- **[ULTIMATE] Penumbral Collapse** — Collapses shield energy inward. Heavy cold + dark damage to all enemies. Strips all SPD and Turn Meter buffs from enemy team — freezing their current turn timeline positions f

### Rimewalker
**dual swords** · Frost Duelist · resource: **Entropy Debt**

- **[PASSIVE] Slow Inevitability** — Passive: Enemy turn losses generate bonus damage next turn.
- **[BASIC] Frost-Lace** — Lightning-fast dual-pierce. Physical + cold damage. Applies 1 stack of Glacial Resonance.
- **[BASIC] Singularity Step** — Teleports through shadow to hit a backline target directly. Pushes target back by 20% on the Turn Meter.
- **[SIGNATURE] Blizzard Flurry** — Rapid-succession multi-strike hitting a single target 4 times. Each strike consumes 1 Glacial Resonance stack to deal bonus True Cold Damage.
- **[ULTIMATE] The Great Stillness** — Dashes through all enemies in a fraction of a second, slashing vital pressure points with absolute zero energy. High critical damage to all targets. Any enemy currently suffering a

### Worldender
**two-handed sword** · Destroyer · resource: **Entropy Debt**

- **[PASSIVE] Long Winter** — Passive: Gains damage and crit as Wintermark stacks rise.
- **[BASIC] Collapse Cleave** — Brutal downward swing. Massive physical damage. Increases Entropy Decay by 20%. Lowers Worldender's own SPD by 10% for 2 turns — stackable up to 3 times.
- **[BASIC] Shatter-Point** — Precise heavy stab aimed at enemy armor plate. Destroys 40% of target's total armor permanently. Inflicts **Brittle** — increases all incoming critical hit damage taken by 25%
- **[SIGNATURE] Void Compression** — Slashes horizontally creating a vacuum arc hitting all frontline enemies. Heavy dark damage. Prevents targets from receiving any positive status buffs for 3 turns.
- **[ULTIMATE] Cosmic Crunch** — Drives massive blade into the heart of the battlefield — reality folds inward. Catastrophic armor-ignoring dark damage to all enemies. Instantly triggers and consumes ALL acti

### Equilibrium Ascendant
**hammer** · Bruiser / Controller · resource: **Entropy Debt**

- **[PASSIVE] Universal Constant** — Passive: Strongest enemy automatically gains Imbalance.
- **[BASIC] Leveling Blow** — Physical damage to single target. Applies **Grounded** — prevents target from dodging, teleporting, or using movement abilities for 2 turns.
- **[BASIC] Stillness Domain** — Radiates a wave of heavy dark matter. Decreases Attack Power and Critical Hit chance of ALL enemies by 20% for 2 turns.
- **[SIGNATURE] Stasis Lock** — Strikes enemy over the head. Heavy physical damage. Forces target's turn meter to freeze completely for 1.5 rounds — cannot move forward or backward on the timeline.
- **[ULTIMATE] The Great Equalizer** — Slams hammer with absolute authority. Forces a team-wide reset — ALL active positive and negative status effects on all characters (allies and enemies) are instantly erased. D

### Velestra
**dual daggers** · Void Assassin · resource: **Entropy Debt**

- **[PASSIVE] Patient Predator** — Passive: Observing same target builds Precision stacks.
- **[BASIC] Dark-Stitch** — Double stab from behind. High physical + dark damage. Generates 25 Shadow Weave.
- **[BASIC] Fade to Black** — Instantly enters **Umbral Stealth** for 2 turns. Evasion increases 50%. Next attack from stealth is a guaranteed critical hit.
- **[SIGNATURE] Void Blossom** — Throws a cloud of black star-glass daggers at an enemy row. Moderate physical damage. Applies **Blindness** and **Bleeding Dark** (dark DoT) to all targets hit.
- **[ULTIMATE] Eclipse Execution** — Velestra dissolves completely into the shadows of the entire enemy team. Strikes every enemy once from their own shadow — catastrophic armor-piercing damage to all. The enemy

### Cryovex
**dual pistols** · Cryo Gunner · resource: **Cryo Charge**

- **[PASSIVE] Controlled Environment** — Passive: More Restriction stacks = higher Cryovex crit chance.
- **[BASIC] Freeze-Fire Burst** — Fires two frozen darts. Physical + cold damage. Consumes 1 Cryo-Cartridge. Applies **Chilled** to target.
- **[BASIC] Flash-Freeze Shell** — Fires heavy explosive frost canister at an enemy row. AoE cold damage. Slows Turn Meter of all targets hit by 15%. Generates 2 Cryo-Cartridges.
- **[SIGNATURE] Bitter Hail** — Unloads all remaining Cryo-Cartridges into a single target. Each bullet deals bonus damage if target is already Frozen or Chilled.
- **[ULTIMATE] Cryo-Grid Bullet Hell** — Spins firing a grid of liquid-nitrogen lasers across the entire battlefield. High cold damage to all enemies. Locks all enemies into a **Glacial Grid** for 2 turns — any enemy

### Terminus
**rifle** · Executioner / Sniper · resource: **Entropy Debt**

- **[PASSIVE] Inevitable Conclusion** — Passive: Finality marks generate Resolution each turn target survives.
- **[BASIC] Absolute Stop** — Heavy precise rifle shot. Massive piercing physical damage to single target. Pushes target's Turn Meter back by 25%.
- **[BASIC] Thermal Drain Scope** — Locks scope onto enemy target. Rips away 20% of target's SPD and Critical Hit chance — adding it to the Terminus's next shot. Generates 30% Zero-Point Charge.
- **[SIGNATURE] Void-Piercer Round** — Fires high-density dark matter bullet piercing through an entire column of enemies. High dark damage. Applies **Fractured Soul** — targets cannot be healed by support classes
- **[ULTIMATE] Heat Death Vengeance** — Fires a single devastating absolute-zero round at the speed of darkness. Catastrophic damage to a single target. If target is below 50% HP — deals triple damage. If it kills t

### Null Absolutionist
**staff** · Void Mage · resource: **Entropy Debt**

- **[PASSIVE] Return to Origin** — Passive: Enemies reaching Deviation threshold auto-Regress.
- **[BASIC] Void Bolt** — Missile of pure dark antimatter. Dark damage. If target has mana — burns 15% of their mana pool and converts it into bonus damage.
- **[BASIC] Primordial Silence** — Casts field of absolute vacuum over an enemy row. Minor cold damage. Silences all targets in that row for 1 turn — cannot use magic skills.
- **[SIGNATURE] Heat Drain** — Siphons literal thermal energy from an enemy. High cold damage. Inflicts **Hypothermia** — cold DoT and reduces health recovery by 80% for 3 turns.
- **[ULTIMATE] The Cosmic Reset** — Channels the ancient state of the pre-Big Bang universe. Opens a massive void rift swallowing the battlefield in pure darkness. Immense dark + cold damage to all enemies. Forcefull

### Lattice Executioner
**spellblade** · Ice Battlemage · resource: **Entropy Debt**

- **[PASSIVE] Perfect Arrangement** — Passive: Each Lattice Mark increases spell and weapon damage.
- **[BASIC] Lattice Slash** — Ice-infused blade strike. Physical + cold damage. Generates 1 Lattice Layer.
- **[BASIC] Frost Spike** — Summons a massive jagged ice spike from beneath an enemy. High cold damage. Inflicts **Brittle** for 2 turns. Generates 1 Lattice Layer.
- **[SIGNATURE] Shatter-Burst Shield** — Consumes 2 Lattice Layers to create an instant 25% max HP frost barrier around an ally or self. If an enemy breaks this shield — it explodes outward dealing heavy cold damage
- **[ULTIMATE] Runic Refrigeration** — Drives spellblade into the ground, freezing the molecular structure of the entire battlefield lattice. Massive physical + cold damage to all enemies. Applies **Structural Collapse*

---

## Anima
*Life · Purpose · Evolution · Vitality* — ANIMA MNA → Scales healing potency (up to +60% at 200)

### Soul-Bound Aegis
**sword & shield** · Sacrificial Tank · resource: **Kindling Gauge**

- **[PASSIVE] Sacrificial Ignition** — All special abilities cost a percentage of current HP instead of mana. The Aegis does not spend mana. They spend themselves.
- **[PASSIVE] Solar Presence** — Passive: Every 25 Radiance reduces enemy accuracy by 10%.
- **[BASIC] Embersmith Strike** — Heavy flaming downward slash. Physical + fire damage to single target. Generates 15 Kindling. If target is already burning — transfers the burn to an adjacent enemy.
- **[BASIC] Essence Drain** — Precise thrust cauterizing wounds while extracting vital energy. Moderate Spirit damage. Heals Aegis for 150% of damage dealt. If Aegis is below 40% HP — deals double damage.
- **[BASIC] Martyr's Mantle** — Cloak a fragile ally in protective swirling soul-fire. For 2 turns that ally gains 50% damage reduction. If that ally takes damage — Aegis instantly gains 30 Kindling.
- **[BASIC] Spirit-Scourge Wave** — Massive broadsword arc sending a crescent of white spiritual energy across the enemy team. Anima AoE damage. Applies Charred to all enemies hit for 2 turns.
- **[BASIC] Searing Slash** _(+15 RES)_ — Physical attack. Generates 15 Radiance.
- **[SIGNATURE] Beacon of the Hearth** — Slam shield into earth releasing spiritual heat. Taunts all enemies for 2 turns. Aegis gains a spiritual barrier equal to 25% max HP. Intercepts 40% of all ally damage for 2 turns.
- **[SIGNATURE] Bastion of Dawn** _(20 RES)_ — Taunt all enemies. Grant Morning Shield barrier (15% max HP).
- **[ULTIMATE] Threat To The Pack** — Leaps high and slams sword down shattering the earth. Catastrophic physical damage to all enemies. Soul-Bound aura triggers — heals all allies for 30% of damage dealt. Applies Lifemark to all allies for 3 turns.

### Pulse Arbiter
**dual swords** · Rhythmic Duelist · resource: **Pulse Gauge**

- **[PASSIVE] Pulse Balance** — Passive: Ending a turn with the Pulse Gauge exactly centered grants a free defensive barrier for the next round. Rewards rhythmic play — neither gathering nor releasing.
- **[PASSIVE] Uncertainty Principle** — Passive: Damage variance increases with distance. Max potential rises dramatically.
- **[BASIC] Kinetic Cadence** — Swift double-strike — one slash per blade. Moderate physical damage. Generates 10 Anima. If the target is suffering from any status ailment — strikes a third time automatically.
- **[BASIC] Resonant Riposte** — Enter a hyper-aware state crossing swords to catch incoming vibrations. Grants 100% Counter-Attack chance for 1 round. When hit by a physical attack — instantly strike back for equal damage.
- **[BASIC] Anima Sync** _(30 RES)_ — Drive one blade into the shadow, linking life force to an ally. For 2 turns — 30% of all damage dealt by that ally flows into the Arbiter as healing. Generates massive Anima.
- **[BASIC] Echoing Flurry** _(20 RES)_ — Move so fast the Arbiter appears in three places simultaneously. Strikes the same target 3 times in succession with increasing damage each hit.
- **[BASIC] Collapse Wave** _(+20 RES)_ — Fire quantum round. Damage resolves next turn based on active debuffs.
- **[SIGNATURE] Reaver's Rhythm** _(20 RES)_ — Cruel twisting slash that siphons life force. Physical damage. Applies Arrhythmia for 3 turns — reduces target speed by 15%. Arbiter heals for 50% of damage dealt. Shifts gauge to Systole.
- **[SIGNATURE] Sovereign Verse** _(25 RES)_ — Heavy dual-overhead chop releasing a shockwave of compressed purpose. Deals True Damage — ignores armor entirely. If target is below 30% HP — deals 50% bonus damage. Shifts gauge to Diastole.
- **[SIGNATURE] Quantum Sight** _(30 RES)_ — Observe all trajectories. Next 2 attacks ignore 40% armor. Crit +20%.
- **[ULTIMATE] Resonance Cascade** — Releases all accumulated pulse energy simultaneously. Strikes all enemies in a perfect heartbeat pattern. Damage scales with current Pulse Gauge position — maximum damage at perfect center balance.

### Apex Dominion
**two-handed sword** · Apex Predator · resource: **Primordial Mana**

- **[PASSIVE] Dominance Aura** — Passive: Rising Dominance imposes fear penalties on all enemies.
- **[BASIC] Heavy Cleave** — Brutal downward hack. Heavy physical damage to single target. Splashes 30% damage to adjacent enemies. Generates 15 Dominance.
- **[BASIC] Prey Marker** — Marks the enemy with the highest HP as **The Quarry** for 3 turns. All Dominion attacks against The Quarry ignore 30% of their total armor.
- **[SIGNATURE] Ravage** — Massive physical damage. If target is below 40% HP — deals double damage. If it kills the target — cooldown instantly resets.
- **[ULTIMATE] Threat To The Pack** — Leaps high and slams sword down shattering the earth. Catastrophic physical damage to all enemies. Surviving enemies gain **Terror** for 2 turns — lose 50% of their Turn Meter

### Lifekeeper
**hammer** · Bruiser / Support · resource: **Life Crystal**

- **[PASSIVE] Resonant Pulse** — Passive: Vitality Echoes amplify healing by 20% per stack.
- **[BASIC] Pulse Strike** — Slams hammer on single target. Physical damage. Generates 1 Vitality Echo. Lowest-health ally is instantly healed for 50% of the damage dealt.
- **[BASIC] Vitalizing Swing** — Sweeping attack striking up to 3 frontline enemies. For each enemy hit — grants a random ally a **Regrowth** buff restoring 5% max HP per turn for 2 turns.
- **[SIGNATURE] Font of Life** — Drives hammer handle into the ground, turning crystal head into a beacon. Instantly heals entire party. Cleanses 1 negative status condition from each ally.
- **[ULTIMATE] The Healing Anvil** — Brings hammer down with monumental force, cracking battlefield open to release pure vital energy. Heavy blunt damage to all enemies. Creates a permanent **Sanctuary Zone** on ally

### Symbiote Hunter
**dual daggers** · Symbiote Assassin · resource: **Symbiosis**

- **[PASSIVE] Parasitic Bond** — Passive: Heals 100% of all Infestation DoT damage.
- **[BASIC] Tendril Prick** — Double-dagger puncture. High physical damage. Applies 1 stack of Infestation.
- **[BASIC] Host Melding** — Dissolves into a dark pool of biological liquid — enters **Symbiotic Stealth** for 2 turns. Cannot be targeted. Next attack out of stealth transfers all negative status effect
- **[SIGNATURE] Blood Feast** — Savage rapid-fire tearing slash. Consumes all active Infestation stacks. Deals massive True Damage scaling with stacks consumed.
- **[ULTIMATE] Biological Takeover** — Teleports behind target and plunges both daggers into their spine — symbiote floods entirely into target's nervous system. Catastrophic physical damage. If target dies —

### Sporecaster
**dual pistols** · Spore Gunner · resource: **Spore Cloud**

- **[PASSIVE] Spore Saturation** — Passive: Density imposes accuracy/evasion penalties on enemies.
- **[BASIC] Fungal Burst** — Rapid two-shot burst. Nature + Anima damage. Increases Spore Cloud Density by 15%.
- **[BASIC] Toxin Tumble** — Quick acrobatic roll — dodges next incoming attack completely. While rolling drops a gas canister applying **Spore Blight** to entire enemy front row — minor DoT for 3 tu
- **[SIGNATURE] Pollen Screen** — Fires flash-capsule at an ally's feet. Creates dense cloud — instantly cleanses ally of all tracking and mark debuffs. Increases their Evasion by 40% for 2 turns.
- **[SIGNATURE] GREAT SPORE APOCALYPSE** _(50 RES)_ — Rain predatory spores on all enemies. Heal party 20% max HP.
- **[ULTIMATE] The Great Spore Apocalypse** — Unloads both pistols into the sky raining a massive dense canopy of predatory spores across the entire map. High AoE Nature damage to all enemies. Applies **Necrotic Suffocation**

### Genewarden
**rifle** · Gene Sniper · resource: **Gene Charge**

- **[PASSIVE] Genetic Mapping** — Passive: At 100% Sequenced — target loses all resistances.
- **[BASIC] Target Sequence** — Precise rifle shot. High piercing physical damage. Generates 25% Sequencing data on target. If target has a shield — destroys it instantly.
- **[BASIC] Bio-Targeting Scope** — Spend the turn calibrating the rifle. Next attack's Critical Damage +60%. Inflicts **Exposed DNA** on target — prevents all defensive stat buffs for 3 turns.
- **[SIGNATURE] Mutagen Round** — Highly unstable chemical round. Moderate physical + acid damage. Applies **Cellular Degradation** — target takes 20% increased damage from all sources for 2 turns.
- **[ULTIMATE] Chromosomal Breakdown** — Chambers a single glowing white-hot anti-biological bullet. Catastrophic armor-ignoring damage to single target. If target has active buffs — those buffs are violently convert

### Genesis Sage
**staff** · Primordial Caster · resource: **Primordial Mana**

- **[PASSIVE] The Wellspring** — Passive: Sprout Nodes heal allies or damage enemies when triggered.
- **[BASIC] Evolutionary Bolt** — Spinning missile of pure concentrated Anima energy. High Spirit damage. Generates 1 Sprout Node on the turn timeline directly ahead of the target.
- **[BASIC] Primal Growth** — Massive burst of life energy over a targeted ally row. Instantly heals all allies in that row. Grants **Thick Hide** — increases total DEF by 25% for 2 turns.
- **[SIGNATURE] Mutation Cascade** — Target ally or enemy. If ally — grants a random massive offensive buff (+40% ATK, +30% SPD, or +50% Crit) for 2 turns. If enemy — mutates their body into a fragile form r
- **[ULTIMATE] Genesis Rebirth** — Channels the absolute limit of the planet's vital fire. Massive golden wave of primordial liquid across the entire field. Immense Spirit + Nature damage to all enemies. Completely

### Biomancer
**spellblade** · Life Battlemage · resource: **Blood Crystal**

- **[PASSIVE] Bio-Molding** — Passive: Each Flesh Shard adds 6% lifesteal (max 30%).
- **[BASIC] Siphon Slash** — Quick precise thrust with blood-blade. Physical + Anima damage. Generates 1 Flesh Shard. Heals Biomancer for 30% of damage dealt.
- **[BASIC] Bone Spike** — Condenses blood from the battlefield to shoot a cluster of jagged bone spikes at an enemy row. High physical damage. Inflicts **Bleeding Anima** DoT on all targets hit for 3 turns.
- **[SIGNATURE] Exoskeleton Hardening** — Consumes 2 Flesh Shards. Creates heavy calcified bone shield around self or ally. While active — any enemy that strikes this shield takes high physical pierce damage back from
- **[ULTIMATE] The Sacred Harvest** — Drives spellblade into the heart of a bleeding enemy — all spilled vital force violently erupts outward. Massive armor-piercing physical + Spirit damage to all enemies. Every

---

## Quanta
*Probability · Time · Observation · Possibility* — QUANTA MNA → Scales SPD / Turn Order priority

### Paradox Bastion
**sword & shield** · Phase Sentinel · resource: **Probability Charge**

- **[PASSIVE] Superposition Shield** — Passive: Chance to phase out when hit — damage reduced to 0.
- **[BASIC] Chrono-Strike** — Physical + Quantum damage. Generates 15% Probability. Applies **Uncertain State** — target has 25% chance to miss their next action.
- **[BASIC] Retrocausal Taunt** — Slams shield creating a localized gravity warp. Forces Taunt on all enemies for 2 turns. If an enemy attacks an ally during this time — damage is retroactively transferred to
- **[SIGNATURE] Entangled Aegis** — Select an ally. For 3 turns — Bastion and ally are quantum entangled. Ally gains 50% of Bastion's current DEF stat. Any negative status effects applied to the ally are automat
- **[ULTIMATE] Paradox Engine** — Drives shield deep into the timeline. For 2 turns entire party enters absolute superposition. All damage taken during these 2 turns is recorded — at the end there is a 50% cha

### Phasewalker
**dual swords** · Phase Duelist · resource: **Probability Charge**

- **[PASSIVE] Wave-Particle Duality** — Passive: Toggle Wave/Particle Form for different combat advantages.
- **[BASIC] Interference Slash** — Wave Form: hits entire row, pushes all back 10% on Turn Meter.
- **[BASIC] State Shift** — Swaps between Wave and Particle forms without consuming a turn action. Grants a temporary 1-turn barrier upon switching.
- **[SIGNATURE] Quantum Tunneling** — Phases through the enemy frontline to strike a backline target. Bypasses all Taunts, covers, and defensive shields. Deals pure True Quantum damage.
- **[ULTIMATE] Phasecollapse Flurry** — Splits into four identical timeline duplicates surrounding the entire enemy party. All duplicates strike simultaneously — heavy Quantum damage to all targets. Phasewalker land

### Timeline Breaker
**two-handed sword** · Time Destroyer · resource: **Probability Charge**

- **[PASSIVE] Splintered Realities** — Passive: At 100 Tachyon Stress — next attack triggers Timeline Fracture.
- **[BASIC] Fracture Chop** — Heavy overhead swing. High physical damage. Generates 20 Tachyon Stress. Applies **Decaying Reality** — target takes 10% more damage from all sources for 2 turns.
- **[BASIC] Spatial Tear** — Slams sword horizontally tearing a rift. Pulls all backrow enemies into the frontrow. Moderate Quantum damage. Removes their ability to dodge.
- **[SIGNATURE] Parallel Strike** — Breaker swings — an echo of their blade from an alternate universe strikes a split-second later. Deals two separate instances of heavy physical damage to a single target.
- **[ULTIMATE] The Grand Shatter** — Raises blade and slams down with catastrophic force — shattering the current timeline for the enemy team. Immense armor-ignoring damage to all enemies. Forcefully resets ALL e

### Causality Arbiter
**hammer** · Bruiser / Control · resource: **Causality**

- **[PASSIVE] Cause & Effect** — Passive: Causality Chains cause attackers to take 50% damage back.
- **[BASIC] Logic Gavel** — Blunt physical damage to single target. Applies **Causality Chain** for 3 turns.
- **[BASIC] Event Horizon Slap** — Slams ground emitting a heavy gravitational pulse. Reduces SPD of all enemies by 20%. Prevents any enemy from gaining extra turns or Turn Meter buffs for 2 turns.
- **[SIGNATURE] Delayed Reaction** — High physical damage. Inflicts **Stasis Lock** — any actions taken on the target's next turn have no effect until the turn after next. A one-turn delay on all their actions.
- **[ULTIMATE] Reversal Of Causality** — Flashes a blinding white grid across the arena. All damage dealt by the enemy team during the previous round is completely undone — restoring the party's health pools. The tot

### The Anomaly
**dual daggers** · Quantum Assassin · resource: **Tunneling Charges**

- **[PASSIVE] Quantum Tunneling** — Passive: Ghost State grants 100% evasion and full armor bypass.
- **[BASIC] Subatomic Puncture** — Double stab from behind. High physical damage. Generates 1 Tunneling Charge.
- **[BASIC] Superposition Vanish** — Instantly dissolves into a cloud of quantum probabilities — enters stealth for 2 turns. Cleanses all tracking and DoT debuffs currently affecting them.
- **[SIGNATURE] Chromatic Slice** — Swift cross-slash dealing Quantum damage. Inflicts **Entropic Bleed** — every time the infected target takes a turn, they lose 5% current HP and SPD is reduced by 10% (stacks
- **[ULTIMATE] Zero-State Execution** — Spends all remaining Tunneling Charges to erase themselves from current reality — reappears directly inside the target's space. Catastrophic True Damage to single target. If i

### Entropic Echo
**dual pistols** · Static Gunner · resource: **Probability Charge**

- **[PASSIVE] Probability Matrix** — Passive: Entropic Variance bar shifts per shot — affects evasion and crit.
- **[BASIC] Stochastic Burst** — Rapid three-shot volley. Each bullet independently has 50% chance to deal double damage OR 50% chance to apply a random minor debuff. Generates 15% Variance shift.
- **[BASIC] Vector Tumble** — Quick acrobatic dive — repositions on battlefield. Evasion +30% for 1 turn. Next pistol attack fires an extra bonus bullet.
- **[SIGNATURE] Quantum Ricochet** — High-velocity tracking round. If it lands — bullet splits into three energy beams that automatically strike the remaining enemies with the lowest current HP.
- **[ULTIMATE] Corona Of Echoes** — Unloads both pistols in a blinding circle creating a localized storm of temporal copies. Fires 10 high-velocity photon shots distributed randomly across enemy team. Every critical

### Observer Prime
**rifle** · Quantum Sniper · resource: **Probability Charge**

- **[PASSIVE] Uncertainty Principle** — Passive: Damage variance increases with distance. Max potential rises dramatically.
- **[BASIC] Collapsing Round** — Heavy hyper-velocity rifle shot. High piercing damage. Generates 25% Measurement on target. Pushes enemy back 20% on the Turn Meter.
- **[BASIC] Quantum Lock-On** — Enters immobile aiming stance. Critical Damage +50%. Measurement generation against selected target is doubled while active.
- **[BASIC] Collapse Wave** _(+20 RES)_ — Fire quantum round. Damage resolves next turn based on active debuffs.
- **[SIGNATURE] Entangled Bullet** — Fires specialized round at an enemy. If it hits — a second enemy in the same row takes 100% of the damage as an entangled echo.
- **[SIGNATURE] Quantum Sight** _(30 RES)_ — Observe all trajectories. Next 2 attacks ignore 40% armor. Crit +20%.
- **[ULTIMATE] The Ultimate Observer** — Fires a single cataclysmic bullet traveling through alternate realities to find the target. Immense armor-ignoring damage to single enemy. If target is below 40% HP — instantl

### Chronosage
**staff** · Time Mage · resource: **Probability Charge**

- **[PASSIVE] The Wellspring** — Passive: Sprout Nodes heal allies or damage enemies when triggered.
- **[BASIC] Temporal Bolt** — Spinning missile of pure chronal energy. High Spirit damage. Moves target's turn icon backward 15% on the timeline.
- **[BASIC] Past-State Recall** — Target an ally. Restores that ally's HP and resource pools to exactly what they were at the start of the previous round. Cleanses all debuffs applied this turn.
- **[BASIC] Evolutionary Bolt** _(+15 RES)_ — High Spirit damage. Places Sprout Node on turn timeline.
- **[SIGNATURE] Chrono-Loop** — Traps an enemy in a localized time loop for 2 turns. At the start of their turn — they automatically repeat the exact action they took on their previous turn, and any damage t
- **[SIGNATURE] Primal Growth** _(35 MP)_ — Heal self for significant HP. Grant Thick Hide (+25% DEF) for 2 turns.
- **[ULTIMATE] Time Stop** — Massive reality-freezing expansion wave. ALL enemies completely frozen in time for 1 full round — cannot act, cooldowns do not tick, turn bars locked. Party gains 30% SPD buff

### Quantum Exarch
**spellblade** · Quantum Battlemage · resource: **Coherence**

- **[PASSIVE] Absolute Coherence** — Passive: At 5 Coherence Layers — attacks deal True Damage splashing all.
- **[BASIC] Lattice Slice** — Vibrating energy blade strike. Physical + Quantum damage. Generates 1 Coherence Layer.
- **[BASIC] Vector Flash** — Burst of hard-light particles at an enemy row. High Quantum damage. Applies **Vector Distortion** — attacks made by those enemies split and deal 30% less damage for 2 turns. G
- **[SIGNATURE] Quantum Disruption** — Drives blade into earth sending a ripple of destabilizing energy through the floor. Destroys ALL enemy shields and defensive barriers instantly. High AoE damage.
- **[ULTIMATE] Matrix Collapse** — Sweeping circular slash cutting through the molecular bonds of the entire arena. Massive armor-piercing physical + Quantum damage to all enemies. Leaves a **Coherent Field** on the

---

## Umbraxis
*Gravity · Spacetime · Singularities · Cosmic Structure* — UMBRAXIS MNA → Scales Defense / Damage reduction

### Tidal Sovereign
**sword & shield** · Gravity Sentinel · resource: **Stellar Mass**

- **[PASSIVE] Gravitational Inversion** — Passive: G-Force meter center gives 25% passive block bonus.
- **[BASIC] Event Horizon Smash** — Physical + Umbraxis damage. Shifts meter +15% High-G. Inflicts **Crushed** — reduces target armor by 20% for 2 turns.
- **[BASIC] Orbital Pull** — Releases sweeping gravitational vortex. Pulls all enemies toward Sovereign's row. Forces Taunt for 2 turns. Shifts meter +25% High-G.
- **[SIGNATURE] Anti-Gravity Field** — Releases pulse of low-gravity energy around ally party. Cleanses all SPD-reducing debuffs. Grants all allies **Weightless** for 2 turns — SPD and Evasion +25%. Shifts meter -4
- **[ULTIMATE] Tidal Collapse** — Drives blade into shield and slams down creating a catastrophic localized singularity. All enemies violently pulled into a single point — massive blunt + gravity damage. Infli

### Abyssal Vector
**dual swords** · Void Duelist · resource: **Stellar Mass**

- **[PASSIVE] Slingshot Velocity** — Passive: At 5 Vector Momentum stacks — next attack is True Damage.
- **[BASIC] Slingshot Strike** — Swift double-slash that moves Vector to an adjacent row. Physical damage. Generates 1 Vector Momentum stack.
- **[BASIC] Warp Dash** — Blinks through an enemy to reappear behind them. Umbraxis damage. Lowers target's Turn Meter by 15% from spatial disorientation. Generates 1 Vector Momentum stack.
- **[SIGNATURE] Spaghettification** — Horrific flurry of 4 rapid twisting slashes at a single enemy's joints. High physical + gravity damage. Pulls target's turn icon down by 25%.
- **[SIGNATURE] EVENT HORIZON DANCE** _(55 RES)_ — Infinite Momentum state — strikes hit all adjacent enemies.
- **[ULTIMATE] The Event Horizon Dance** — Enters over-clocked state moving along a perfect gravitational matrix. For 2 turns — infinite Vector Momentum stacks, movement skills cost no actions, every strike automatical

### Singularity Reaver
**two-handed sword** · Singularity Destroyer · resource: **Accretion**

- **[PASSIVE] Accretion Disk** — Passive: At 100 Accretion — attacks ignore shields and covers.
- **[BASIC] Dense Cleave** — Brutal downward swing. Massive physical damage to single target. 40% splash damage to entire row. Generates 20 Accretion.
- **[BASIC] Pull of the Core** — Slams heavy hilt into ground creating a miniature gravity well. Pulls a backline enemy into the frontrow. Inflicts **Weighed Down** — Evasion -30% for 2 turns. Generates 15 Ac
- **[SIGNATURE] Crushing Void** — Massive horizontal swing targeting enemy frontline. Heavy gravity damage. Applies **Fractured Guard** — physical DEF -35% for 3 turns.
- **[ULTIMATE] Black Hole Dropdown** — Leaps into air, focuses all Accretion into greatsword tip, drives it into the center of the enemy team. Catastrophic armor-piercing damage to all enemies. Dispels all positive stat

### Graviton Warden
**hammer** · Gravity Bruiser · resource: **G-Matrix**

- **[PASSIVE] Graviton Matrix** — Passive: G-Anchors detonate on Hyper-Mass Drop for bonus AoE.
- **[BASIC] Anchor Slam** — Blunt damage to single target. Places a **G-Anchor** on their location for 3 turns.
- **[BASIC] Matrix Shift** — Alters the gravity of the battlefield grid. Instantly swaps locations of two enemies or two allies without resetting their turn bars. Generates 20 Warden Energy.
- **[SIGNATURE] Hyper-Mass Drop** — Swings hammer upward then increases its mass tenfold as it falls. Immense blunt physical damage to single target. If target has a G-Anchor — anchor explodes dealing bonus AoE
- **[ULTIMATE] The Kinetic Crush** — Lifts hammer pulling all active G-Anchors into a single massive orbital ring above the enemy team — slams them down like meteorites. Devastating blunt + Umbraxis damage to all

### The Lagrangian
**dual daggers** · Phase Assassin · resource: **Lagrange Nodes**

- **[PASSIVE] Stable Nodes** — Passive: Near a Lagrange Node — Spatial Cloak and +30% crit.
- **[BASIC] Zero-G Pierce** — Swift weightless double-stab from behind. High critical damage. Generates 1 Lagrange Node.
- **[BASIC] Node Blink** — Instantly blinks to any active Lagrange Node on the field. Cleanses all negative status effects. Resets stealth duration. Does not break stealth if already active.
- **[SIGNATURE] Spacial Tear** — Vicious cross-slash cutting the spatial fabric around the target. Heavy physical damage. Inflicts **Bleeding Space** — continuous Umbraxis DoT for 3 turns that cannot be clean
- **[ULTIMATE] Libration Point Execution** — Consumes all active Lagrange Nodes to launch a multi-dimensional execution strike. Strikes primary target once per node consumed — each hit deals massive armor-ignoring True D

### Orbitalist
**dual pistols** · Orbital Gunner · resource: **Orbital Bullets**

- **[PASSIVE] Planetary Orbit** — Passive: Orbital Ring builds to 6 bullets before crashing inward.
- **[BASIC] Kinetic Rotation** — Rapid two-shot burst. Umbraxis damage. Adds 1 bullet to Planetary Orbit ring per shot (max 6).
- **[BASIC] Gravitational Slide** — Low-gravity slide that switches the Orbitalist's row position. Evasion +40% for 1 turn. Adds 2 bullets to the orbit ring.
- **[SIGNATURE] Decay Command** — Commands all active Planetary Orbit bullets to crash into a single target. Each bullet deals bonus True Damage and permanently lowers target's DEF by 5% for the rest of the fight.
- **[ULTIMATE] Meteoric Corona** — Triggers massive gravity expansion — all 6 orbital bullets split into 12 hyper-velocity fragments. Fragments rain down randomly across entire enemy party — massive AoE da

### Astrolancer
**rifle** · Spatial Sniper · resource: **Stellar Mass**

- **[PASSIVE] Spatial Compression** — Passive: At 100% Compression — next shot folds space, bypasses everything.
- **[BASIC] Coordinate Shot** — Precise rifle shot. High piercing damage. Generates 25% Compression data. Pushes enemy back 15% on Turn Meter from spatial shockwave.
- **[BASIC] Folding Lens** — Enters deep aiming stance. Next attack Critical Damage +50%. Prevents targeted enemy from receiving shields or healing for 2 turns.
- **[SIGNATURE] Warp Round** — High-density gravity bullet warping through a row of enemies. Moderate damage to all targets hit. Forcefully row-swaps them — scattering their formation.
- **[ULTIMATE] Apex Singularity Drive** — Fires a hyper-dense projectile creating a localized black hole inside the target's chest. Catastrophic damage to single enemy. If target survives — singularity violently colla

### The Singularitan
**staff** · Void Mage · resource: **Distortion Field**

- **[PASSIVE] Distortion Field** — Passive: Gravity Rifts on timeline damage and debuff enemies who cross them.
- **[BASIC] Dark Matter Bolt** — Swirling sphere of dense space-time particles. High Spirit damage. Generates 1 Gravity Rift on the turn timeline.
- **[BASIC] Temporal Dilatation** — Target an ally or enemy row. Ally row: grants **Haste** (+30% SPD) for 2 turns. Enemy row: inflicts **Slow** (-30% SPD), skill cooldowns take an extra turn to refresh.
- **[SIGNATURE] Event Horizon Loop** — Traps an enemy in a localized spatial loop for 2 turns. Any damage that enemy deals to the party is gathered — at the start of their next turn that exact damage pool is slamme
- **[ULTIMATE] Unmaking Of The Lattice** — Raises staff causing the visual graphics of the screen to fold inward. Opens a massive cataclysmic void rift beneath the entire enemy team. Immense gravity + space-time damage to a

### Voidstar Exarch
**spellblade** · Void Battlemage · resource: **Stellar Mass**

- **[PASSIVE] Mass Modulation** — Passive: At 5 Density Layers — attacks are True Damage splashing entire line.
- **[BASIC] Vector Slice** — Vibrating energy blade strike. Physical + Umbraxis damage. Generates 1 Density Layer.
- **[BASIC] Cosmic Fracture** — Burst of dense gravity waves at an enemy row. High Umbraxis damage. Applies **Mass Distortion** — reduces attack power of those enemies by 25% for 2 turns. Generates 1 Density
- **[SIGNATURE] Singularity Strike** — Overhead slam creating a localized gravity warp at point of impact. Destroys ALL enemy shields and defensive barriers instantly. High AoE damage to target and adjacent enemies.
- **[ULTIMATE] Voidstar Collapse** — Massive sweeping circular slash shattering the spatial bonds of the entire arena grid. Massive armor-piercing physical + gravity damage to all enemies. Leaves a **Singularity Field
