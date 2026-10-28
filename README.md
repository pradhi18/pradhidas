# pradhidas

My personal site: a blog and portfolio that looks like a page from my office notebook, with hole-punch flowers, vines and doodles.

Live at **https://pradhi18.github.io/pradhidas** (pradhidas.com coming later).

Built with [Astro](https://astro.build), React and TypeScript. Hosted for free on GitHub Pages.

## Run it locally

Needs Node 22.23 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4321/pradhidas/. Draft posts show up locally but not on the live site.

## Write a post

1. Add `src/content/blog/my-post.md` (or `.mdx` for notes and captioned photos). The file name becomes the URL.
2. Start it with front matter:

   ```yaml
   ---
   title: My post
   description: One sentence for the list and for link previews.
   date: 2026-11-01
   tags: [tech]
   ---
   ```

3. Push to `main`. GitHub builds and deploys the site in about a minute.

`src/content/blog/how-to-write-a-post.mdx` is a draft cheat sheet showing images, code, notes and photos.

## Where things live

| What | Where |
|---|---|
| Name, email, social links, CV switch, comment settings | `src/config.ts` |
| Colours and fonts | `src/styles/global.css` (top of the file) |
| Doodle shapes (flowers, vine, waves, stickers…) | `src/lib/doodles.ts` |
| Projects | `src/data/projects.ts` |
| Pages | `src/pages/` |
| Interactive bits (vine, stickers, sprouts, copy email) | `src/components/*.tsx` |

## To do later

- **CV:** put `cv.pdf` in `public/` and set `CV.enabled = true` in `src/config.ts`.
- **Comments:** turn on Discussions for this repo, install the [giscus app](https://github.com/apps/giscus), create a "Comments" category, then copy `repoId` and `categoryId` from https://giscus.app into `src/config.ts`.
- **Domain:** after buying pradhidas.com, add it under Settings → Pages → Custom domain, then in `astro.config.mjs` set `site: 'https://pradhidas.com'` and remove `base`.

Doodles © Pradhi Das.
