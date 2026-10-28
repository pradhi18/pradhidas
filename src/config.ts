// Everything you might want to change about the site lives here.

export const SITE = {
  title: 'Pradhi Das',
  description: 'Software engineer. Notes, doodles and things I make.',
  author: 'Pradhi Das',
  role: 'Software engineer',
  company: 'JPMorganChase',
  email: 'daspradhi1812@gmail.com',
};

export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pradhi-das/' },
  { label: 'GitHub', href: 'https://github.com/pradhi18' },
  { label: 'LeetCode', href: 'https://leetcode.com/u/pradhidas/' },
  { label: 'Instagram', href: 'https://www.instagram.com/pradhidas/' },
];

// The words written around the "now" mind-map on the homepage.
export const NOW = ['plan posts', 'dancing', 'record', 'study & prepare'];

// Set `enabled` to true once cv.pdf is in the public/ folder.
export const CV = { enabled: false, file: 'cv.pdf' };

// Comments use Giscus (stored in this repo's GitHub Discussions).
// Fill in repoId and categoryId from https://giscus.app once Discussions is on.
export const GISCUS = {
  repo: 'pradhi18/pradhidas',
  repoId: '',
  category: 'Comments',
  categoryId: '',
};
