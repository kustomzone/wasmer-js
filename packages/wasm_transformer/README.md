# wasm_transformer

Library to run transformations on WebAssembly binaries. 🦀♻️

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Rust](#rust)
  - [Javascript](#javascript)
- [Quick Start](#quick-start)
  - [Rust](#rust-1)
  - [Javascript](#javascript-1)
- [Reference API](#reference-api)
- [Contributing](#contributing)
  - [Guidelines](#guidelines)
  - [Building the project](#building-the-project)

## Features

This project depends on [wasmparser](https://github.com/yurydelendik/wasmparser.rs), and the [wasm-pack](https://github.com/rustwasm/wasm-pack) workflow. Huge shoutout to them! 🙏

- Runs transformations on wasm binaries to modify the actual code that gets run, and introduces new features (such as introducing trampoline functions for i64 WASI imports). ✨

- Installable on both crates.io, and npm! 📦

- The project builds with [wasm-pack](https://github.com/rustwasm/wasm-pack). Thus, you can use this library in a Javascript library, to modify WebAssembly Binaries, with WebAssembly. 🤯

- Super fast! Can run the `lower_i64_imports` transformations on my 2018 MackBook Pro, with the Chrome Devtools 6x CPU slowdown in ~ 1 second. ⚡

## Installation

### Rust

```
# Cargo.toml
[dependencies]
wasm_transformer = "LATEST_VERSION_HERE"
```

### Javascript

```
npm install --save @wasmer/wasm_transformer
```

## Quick Start

### Rust

For a larger example, see the simple [wasm_transformer_cli](../../examples/wasm_transformer_cli).

```rust
use wasm_transformer::*;

// Some Code here

// Read in a wasm file as a Vec<u8>
let mut wasm = fs::read(wasm_file_path).unwrap();
// Add trampoline functions to lower the i64 imports in the wasm file
let lowered_wasm = wasm_transformer::lower_i64_imports(wasm);
// Write back out the new wasm file
fs::write("./out.wasm", &lowered_wasm).expect("Unable to write file");
```

### Javascript

For a larger example, see the [wasm_terminal](../../packages/wasm-terminal) package.

```js
import wasm_transformer_init, {
  lower_i64_imports
} from "@wasmer/wasm_transformer";

const fetchAndTransformWasmBinary = async () => {
  // Get the original wasm binary
  const fetchedOriginalWasmBinary = await fetch("/original-wasm-module.wasm");
  const originalWasmBinaryBuffer = await fetchedOriginalWasmBinary.arrayBuffer();
  const originalWasmBinary = new Uint8Array(originalWasmBinaryBuffer);

  // Initialize our wasm_transformer
  await wasm_transformer_init("/wasm_transformer_bg.wasm"); // IMPORTANT: This URL points to wherever the wasm_transformer_bg.wasm is hosted

  // Transform the binary, by running the lower_i64_imports from the wasm_transformer
  const transformedBinary = lower_i64_imports(originalWasmBinary);

  // Compile the transformed binary
  const transformedWasmModule = await WebAssembly.compile(transformedBinary);
  return transformedWasmModule;
};
```

## Reference API

`version()`

Returns the version of the crate/package

---

`lower_i64_imports(mut wasm_binary: Vec<u8>) -> Vec<u8>`

Inserts trampoline functions for imports that have i64 params or returns. This is useful for running wasm modules in browsers that [do not support JavaScript BigInt -> Wasm i64 integration](https://github.com/WebAssembly/proposals/issues/7). Especially in the case for [i64 WASI Imports](https://github.com/CraneStation/wasmtime/blob/master/docs/WASI-api.md#clock_time_get).

## Contributing

### Guidelines

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.

Contributions of any kind are welcome! 👍

### Building the project

To get started using the project:

- Install [Rust](https://www.rust-lang.org/tools/install).

- Install [wasm-pack](https://github.com/rustwasm/wasm-pack).

- [OPTIONAL]: For updating the `wasm_transformer` npm package, please also install the latest LTS version of Node.js (which includes `npm` and `npx`). An easy way to do so is with nvm. (Mac and Linux: [here](https://github.com/creationix/nvm), Windows: [here](https://github.com/coreybutler/nvm-windows)).

To test and build the project, run the `wasm_transformer_build.sh` script. Or, feel free to [look through the script](./wasm_transformer_build.sh) to see the documented commands for performing their respective actions individually.