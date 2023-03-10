#!/usr/bin/env node
import { ResolvedOptions } from './types.js';
export declare function generateTypes(options: ResolvedOptions): Promise<void>;
export declare function getTypes(options: ResolvedOptions): Promise<{
    [k: string]: (string | undefined)[][];
}>;
//# sourceMappingURL=generate.d.ts.map