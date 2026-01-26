/// <reference types="node" />

// Ensure Node.js globals are available
declare global {
  var process: NodeJS.Process;
  var console: Console;
  var setInterval: typeof globalThis.setInterval;
  var clearInterval: typeof globalThis.clearInterval;
  var setTimeout: typeof globalThis.setTimeout;
  var clearTimeout: typeof globalThis.clearTimeout;
}

export {};
