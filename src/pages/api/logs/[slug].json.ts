import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

function encodePath(path: string) {
    return path.split("/").map(encodeURIComponent).join("/");
}

function leaf(slug: string) {
    const parts = slug.split("/");
    return parts[parts.length - 1];
}

function inferOrderFromLeaf(leaf: string): number {
    const m = leaf.match(/^(\d+)[-_]?/);
    return m ? parseInt(m[1], 10) : 999999;
}

export async function getStaticPaths() {
    const all = await getCollection("logs");

    const projectSet = new Set<string>();
    for (const e of all) {
        projectSet.add(e.slug.split("/")[0]);
    }
    return Array.from(projectSet).map((id) => ({ params: { slug: id } }));
}

export const GET: APIRoute = async ({ params }) => {
    const slug = params.slug as string;

    const all = await getCollection("logs");
    const ids = new Set(all.map(e => e.slug.split("/")[0]));
    const id = Array.from(ids).find(i => i === slug);
    if (!id) {
        return new Response(JSON.stringify({ project: null, parts: [] }), { status: 404 });
    }

    const within = all.filter(e => e.slug === `${id}/index` || e.slug.startsWith(`${id}/`));
    const parts = within
        .map(e => {
        const lf = leaf(e.slug);
        const d: any = e.data;
        const order = typeof d.order === "number" ? d.order : inferOrderFromLeaf(lf);
        return {
            slug: e.slug,
            title: d.partTitle ?? d.title ?? lf,
            order,
            date: d.date ? new Date(d.date).toISOString() : undefined,
            tags: d.tags ?? [],
            embedUrl: `/embed/logs/${encodePath(e.slug)}/`,
            url: `/logs/${encodePath(e.slug)}/`,
        };
        })
        .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
    
    const def = parts[0];
    const payload = {
        project: {
            id,
            slug,
            title: (all.find(e => e.slug === def.slug)?.data as any)?.title ?? id,
            type: (all.find(e => e.slug === def.slug)?.data as any)?.type ?? "other",
            description: (all.find(e => e.slug === def.slug)?.data as any)?.description ?? "",
            embedUrl: def.embedUrl,
        },
        parts,
    };

    return new Response(JSON.stringify(payload), {
        headers: { "content-type": "application/json; charset=utf-8" },
    });
};
