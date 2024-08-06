declare module 'potrace' {
  export interface PotraceOptions {
    turdSize?: number;
    alphaMax?: number;
    optCurve?: boolean;
    optTolerance?: number;
    threshold?: number;
    blackOnWhite?: boolean;
    color?: string;
    background?: string;
  }

  export function trace(
    image: Buffer | string,
    options: PotraceOptions,
    callback: (err: Error | null, svg: string) => void
  ): void;

  export function trace(image: Buffer | string, callback: (err: Error | null, svg: string) => void): void;
}