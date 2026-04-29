# CLAUDE.md

## Project Overview

this is the project for "Shigure", a discord bot written with Node and discord.js

## Commands

```bash
npm run dev  # Run the project
npm run lint # Run ESLint
```

## Comments

-   Comments explain **why** code is written this way, not **what changed**.
-   Write for a reader encountering the code for the first time.
-   Never reference former/previous implementations or comparisons to deleted code.

**Bad:** `# Replaces the former O(n²) re-walk loop.`
**Good:** `# Iterative to avoid Python's recursion limit on deeply nested JSON.`
