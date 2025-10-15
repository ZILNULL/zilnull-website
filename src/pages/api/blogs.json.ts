import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection("blogs");
  const items = posts
    .sort((a: any, b: any) => +new Date(b.data.date) - +new Date(a.data.date))
    .map((p: any) => ({
      slug: p.slug,
      title: p.data.title,
      date: p.data.date,
      url: `/blog/${p.slug}/`,
      embedUrl: `/embed/blog/${p.slug}/`,
    }));
  return new Response(JSON.stringify({ items }), {
    headers: { "Content-Type": "application/json" },
  });
};