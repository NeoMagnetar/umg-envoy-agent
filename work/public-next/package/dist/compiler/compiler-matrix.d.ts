export declare function getCompilerMatrixStatus(metaUrl?: string): {
    ok: boolean;
    compilerAdapter: string;
    contentMode: string;
    compilerMode: string;
    sampleSleeves: number;
    sampleBlocks: number;
    blockKinds: ("trigger" | "primary" | "directive" | "instruction" | "subject" | "philosophy" | "blueprint")[];
};
