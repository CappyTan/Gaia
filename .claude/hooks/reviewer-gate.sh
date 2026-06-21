#!/usr/bin/env bash
# PostToolUse hook on the Task (Agent) tool.
# After a pipeline PRODUCER agent finishes, tell the main loop to run that
# producer's paired read-only QA reviewer agent before the work advances.
# Non-producer agents (incl. the reviewers themselves) produce no output, so
# this never loops. See .claude/agents/*-reviewer.md and the world-builder skill.
set -euo pipefail

input=$(cat)
producer=$(printf '%s' "$input" | jq -r '.tool_input.subagent_type // empty')
[ -z "$producer" ] && exit 0

case "$producer" in
  world-cartographer)   reviewer="cartography-reviewer" ;;
  level-designer)       reviewer="level-design-reviewer" ;;
  art-integrator)       reviewer="art-reviewer" ;;
  encounter-designer)   reviewer="encounter-reviewer" ;;
  class-designer)       reviewer="class-design-reviewer" ;;
  itemization-designer) reviewer="itemization-reviewer" ;;
  narrative-writer)     reviewer="narrative-reviewer" ;;
  audio-composer)       reviewer="audio-reviewer" ;;
  balance-tuner)        reviewer="balance-reviewer" ;;
  *) exit 0 ;;
esac

msg="QA gate: the \`${producer}\` agent just finished. Per the project's per-stage QA policy you MUST now run the \`${reviewer}\` agent (via the Agent tool) on its output before using the result or advancing to the next pipeline stage. Give the reviewer the files/diff \`${producer}\` changed plus a pointer to its summary. Relay the reviewer's findings and resolve any [Blocking] items (loop \`${producer}\` back) before proceeding. Skip only if \`${reviewer}\` has already reviewed this exact output."

jq -n --arg ctx "$msg" \
  '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$ctx}}'
