# Migration From Personal OpenClaw

## 1. Present in personal package but missing from public 0.1.2

- compiler smoke logic
- compiler adapter logic
- compiler adapter matrix
- runtime-facing sleeve compile/compare/validate patterns
- content selection patterns
- status reporting richer than planner-only lane
- block library inspection patterns

## 2. Already present in public 0.1.2

- package structure with package/ root
- path parser
- path validator
- path renderer
- public-safe build-path utility
- public-facing docs shells

## 3. Compiler-related components to migrate

- compiler smoke test behavior
- compiler adapter behavior
- matrix/status reporting
- tool registration pattern for compiler actions
- RuntimeSpec-like output model

## 4. Runtime-related components to migrate

- compile sleeve surface
- runtime validation surface
- sleeve comparison surface
- honest error/warning reporting

## 5. Path/planner components to preserve

- parse-path
- validate-path
- render-path
- build-path

## 6. Private or personal assumptions to remove

- absolute personal paths
- private vendor compiler roots
- private resleever content roots
- fallback reads from personal host config
- private runtime state lanes
- mutation-promote workflows by default

## 7. New public-safe replacements needed

- bundled public blocks
- bundled public sleeves
- bundled example runtime outputs
- bundled compiler adapter
- bundled runtime validator
- public-safe matrix/status reporting
