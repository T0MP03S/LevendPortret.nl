declare module 'bcryptjs' {
  export function compare(data: string | Uint8Array, encrypted: string): Promise<boolean>;
  export function compareSync(data: string | Uint8Array, encrypted: string): boolean;
  export function hash(data: string | Uint8Array, salt: number | string): Promise<string>;
  export function hashSync(data: string | Uint8Array, salt: number | string): string;
}
