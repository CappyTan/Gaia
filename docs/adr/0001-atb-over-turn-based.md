# ATB combat over pure turn-based

Dara described Gaia as a "turn-based RPG," but the FF4/FF6-era battle screens he chose as
the visual target actually run on **ATB** (Active Time Battle): gauges fill by SPD and each
combatant acts the instant its gauge is full, in real time. We chose ATB to match that
visual/feel target rather than the simpler pure round-based model.

**Trade-off:** ATB is more to build (a real-time gauge scheduler) and harder to tune for a
tight one-hour slice than round-based combat, and it diverges from the dungeon engine's
round/initiative model so none of that scheduler is reusable. We accepted that cost because
the ATB cadence is the thing that makes the battle screen *feel* like the reference.

**Consequence:** SPD becomes a real-time tempo stat (gauge fill rate), not just an
initiative tiebreaker, which raises the stakes on haste/slow effects and on the
attunement signature effects that touch SPD.
