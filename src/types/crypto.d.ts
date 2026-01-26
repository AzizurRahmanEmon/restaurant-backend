/// <reference types="node" />

declare module "crypto" {
  import { BinaryLike } from "node:crypto";
  
  export function randomBytes(size: number): Buffer;
  export function createHash(algorithm: string): Hash;
  
  export interface Hash {
    update(data: BinaryLike): this;
    digest(encoding?: BufferEncoding): string;
  }
}
