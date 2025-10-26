import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getImage } from "astro:assets";

export const prerender = true;

function encodePath(path: string) {
    return path.split("/").map(encodeURIComponent).join("/");
}

function leaf(slug: string) {
    const parts = slug.split("/");
    return parts[parts.length - 1];
}

function inferOrderFromLeaf(leafName: string) {
    const m = leafName.match(/^(\d+)[-_]?/);
    return m ? parseInt(m[1], 10) : 999999;
}

export const GET: APIRoute = async () => {
    const entries = await getCollection("logs");
    const groups = new Map<string, typeof entries>();
    for (const e of entries) {
        const projectId = e.slug.split("/")[0];
        if (!groups.has(projectId)) groups.set(projectId, []);
        groups.get(projectId)!.push(e);
    }

    const items = [] as Array<{
        id: string;
        title: string;
        type: string;
        description: string;
        cover?: string;
        embedUrl: string;
        url: string;
    }>;

    for (const [id, arr] of groups) {
        const scored = arr.map((e) => {
            const lf = leaf(e.slug);
            const fm: any = e.data;
            const order = typeof fm.order === "number" ? fm.order : inferOrderFromLeaf(lf);
            return { e, lf, fm, order };
        });
        scored.sort((a, b) => a.order - b.order || a.lf.localeCompare(b.lf));

        const def = scored[0];
        const meta = def.fm ?? {};

        let cover: string | undefined;
        if (typeof meta.cover === "string") {
            cover = meta.cover;
        } else if (meta.cover) {
            cover = (await getImage({ src: meta.cover, width: 640, format: "webp" })).src;
        }

        items.push({
            id,
            title: meta.title ?? id,
            type: meta.type ?? "other",
            description: meta.description ?? "",
            cover,
            embedUrl: `/embed/logs/${encodePath(def.e.slug)}/`,
            url: `/logs/${encodePath(id)}/`,
        });
    }

    items.sort((a, b) => a.title.localeCompare(b.title));
    return new Response(JSON.stringify({ items }), {
        headers: { "content-type": "application/json; charset=utf-8" },
    });
};