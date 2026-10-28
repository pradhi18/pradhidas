// Projects shown on the homepage and the projects page.
// Add `stage: 'idea' | 'making' | 'shipped'` once a project is real, and `href` if it has a page or repo.

export interface Project {
  kind: 'code' | 'design' | 'writing';
  title: string;
  description: string;
  art: 'code' | 'design' | 'writing' | 'sprout';
  stage?: 'idea' | 'making' | 'shipped';
  tape: string;
  tilt: number;
  href?: string;
}

export const PROJECTS: Project[] = [
  {
    kind: 'code',
    title: "Something's growing here",
    description: 'A code project is on its way. Check back soon.',
    art: 'sprout',
    tape: 'var(--sky)',
    tilt: -1.4,
  },
  {
    kind: 'design',
    title: 'Hole-punch flowers',
    description: 'A sticker set traced from my notebook doodles, with one flower for every kind of day.',
    art: 'design',
    stage: 'making',
    tape: 'var(--peach)',
    tilt: 1,
  },
  {
    kind: 'writing',
    title: "Something's growing here",
    description: 'A writing project is on its way. Check back soon.',
    art: 'sprout',
    tape: 'var(--lilac)',
    tilt: -0.6,
  },
];
