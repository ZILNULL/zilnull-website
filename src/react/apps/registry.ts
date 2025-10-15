import type { AppMeta, AppId } from "../types.ts";

const modules = import.meta.glob("./*/index.tsx", { eager: true }) as Record<
    string,
    { default: AppMeta }
>;

export const APPS: Record<AppId, AppMeta> = {};

for (const path in modules) {
    const meta = modules[path].default;
    if (!meta?.id) {
        console.warn(`[apps/registry] Skipping ${path}: missing meta.id`);
        continue;
    }
    APPS[meta.id as AppId] = meta;
}