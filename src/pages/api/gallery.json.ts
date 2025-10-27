import type { APIRoute } from 'astro';

// Import the static manifest.
import galleryData from '../../content/gallery.json';

type GalleryItem = {
  url: string;
  filename: string;
  base: string;
  alt?: string;
  description?: string;
  tags?: string[];
  date?: string;
  width?: number;
  height?: number;
};

export const GET: APIRoute = async () => {
    try {
        const rawItems = Array.isArray(galleryData.items) ? galleryData.items : [];
        const items: GalleryItem[] = rawItems.map((item: any) => {
            return {
                url: item.url,
                filename: item.filename,
                base: item.base ?? item.filename?.replace(/\.[^.]+$/, '') ?? '',
                alt: item.alt ?? item.title ?? item.base ?? item.filename ?? '',
                description: item.description ?? item.alt ?? '',
                tags: Array.isArray(item.tags) ? item.tags : undefined,
                date: item.date ?? undefined,
                width: typeof item.width === 'number' ? item.width : undefined,
                height: typeof item.height === 'number' ? item.height : undefined,
            };
        });

        items.sort((a, b) => {
            const ad = a.date ? Date.parse(a.date) : 0;
            const bd = b.date ? Date.parse(b.date) : 0;
            if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) {
                return bd - ad;
            }
            return (a.filename || '').localeCompare(b.filename || '');
        });

        return new Response(JSON.stringify({ items }), {
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ items: [] }), {
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
};
