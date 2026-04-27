export declare function getCompilerMatrixStatus(metaUrl?: string): {
    ok: boolean;
    compilerAdapter: string;
    contentMode: string;
    compilerMode: string;
    sampleSleeves: number;
    sampleBlocks: number;
    blockKinds: ("trigger" | "directive" | "instruction" | "subject" | "primary" | "philosophy" | "blueprint")[];
};
