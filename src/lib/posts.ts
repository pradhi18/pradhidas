import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** All posts, newest first. Drafts are only included while developing. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function readingMinutes(post: Post): number {
  const words = (post.body ?? '').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Posts that share the most tags with this one, then the most recent. */
export function relatedPosts(post: Post, all: Post[], count = 3): Post[] {
  const tags = new Set(post.data.tags);
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, count)
    .map((x) => x.p);
}

export function allTags(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  posts.forEach((p) => p.data.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
