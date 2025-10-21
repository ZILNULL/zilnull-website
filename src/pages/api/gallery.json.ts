import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const GALLERY_DIR = path.join(process.cwd(), 'public', 'gallery');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif']);

export const GET: APIRoute = async () => {
    try {
        const entries = await fs.promises.readdir(GALLERY_DIR, { withFileTypes: true });
        const files = entries.filter(e => e.isFile());

        const metaMap = new Map<string, any>();
        for (const f of files) {
            if (f.name.toLowerCase().endsWith('.json')) {
                const base = path.basename(f.name, '.json');
                try {
                    const raw = await fs.promises.readFile(path.join(GALLERY_DIR, f.name), 'utf8');
                    metaMap.set(base, JSON.parse(raw));
                } catch { }
            }
        }

        const items = [] as Array<{
            url: string;
            filename: string;
            base: string;
            alt?: string;
            description?: string;
            tags?: string[];
            date?: string;
            width?: number; 
            height?: number;
        }>;

        for (const f of files) {
            const ext = path.extname(f.name).toLowerCase();
            if (!IMAGE_EXTS.has(ext)) continue;

            const base = path.basename(f.name, ext);
            const m = metaMap.get(base) ?? {};
            items.push({
                url: `/gallery/${f.name}`,
                filename: f.name,
                base,
                alt: m.alt ?? m.title ?? base,
                description: m.description ?? m.alt ?? '',
                tags: Array.isArray(m.tags) ? m.tags : undefined,
                date: m.date ?? undefined,
            });
        }

        items.sort((a, b) => {
            const ad = a.date ? Date.parse(a.date) : 0;
            const bd = b.date ? Date.parse(b.date) : 0;
            if (ad !== bd) return bd - ad;
            return a.filename.localeCompare(b.filename);
        });

        return new Response(JSON.stringify({ items }), {
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    } catch {
        return new Response(JSON.stringify({ items: [] }), {
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
};
