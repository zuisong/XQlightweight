# Plan for xq-engine-wasm Development

This document outlines the remaining tasks for translating the XiangQi game engine to Rust/WebAssembly and integrating it into the web application.

## 1. Core `Position` Logic Translation (Rust)
- [ ] Implement `null_move` and `undo_null_move` methods in `Position` struct.
- [ ] Implement `mate_value`, `ban_value`, `draw_value` methods in `Position` struct.
- [ ] Implement `evaluate`, `null_okay`, `null_safe` methods in `Position` struct.
- [ ] Implement `rep_value` and `rep_status` methods in `Position` struct.
- [ ] Implement `mirror` method in `Position` struct.
- [ ] Implement `book_move` method in `Position` struct (will need to handle `BOOK_DAT` from JS).
- [ ] Implement `history_index` method in `Position` struct.

## 2. `Search` Logic Translation (Rust)
- [ ] Translate the `Search` class from `src/engine/search.ts` to a Rust struct (`Search`).
  - [ ] Implement the constructor for `Search`.
  - [ ] Translate `searchMain` method (alpha-beta pruning, move ordering).
  - [ ] Translate `searchFull`, `searchNoNull`, `searchNull` methods.
  - [ ] Translate `quiesce` method.
  - [ ] Translate `resetHistory`, `resetKillers` methods.
  - [ ] Translate helper functions for move ordering, evaluation, etc.

## 3. WebAssembly (Wasm) Configuration & Compilation
- [ ] Ensure `wasm-pack` is installed (if not, instruct user or install).
- [ ] Build the Rust `xq-engine-wasm` project to Wasm using `wasm-pack build`.

## 4. Integration with Web Application (TypeScript)
- [ ] Update `package.json` with `xq-engine-wasm` as a dependency.
- [ ] Load the Wasm module in `src/main.ts` or a dedicated `wasm-loader.ts` module.
- [ ] Create a new Rust-backed `XiangQiEngine` class in TypeScript that wraps the Wasm `Position` and `Search` structs.
  - [ ] This `XiangQiEngine` will expose methods like `loadFen`, `getFen`, `makeMove`, `undoMove`, `findBestMove`, `getPiece`, etc.
  - [ ] It will manage the Wasm `Position` instance and potentially a Wasm `Search` instance.
- [ ] Update `src/excalibur-board.ts` to use this new Rust-backed `XiangQiEngine`.
- [ ] Ensure all necessary data (moves, FEN, scores) are correctly passed between TypeScript and Wasm.

## 5. Verification
- [ ] Run unit tests for the Rust engine.
- [ ] Run the web application and verify all game functionalities with the Wasm engine.
- [ ] Profile performance of the Wasm engine compared to the original JS engine.
