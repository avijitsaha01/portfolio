/**
 * Single source of truth for identity, contact details and hero copy.
 * Content that changes often (projects, experience, education, skills) lives in
 * Markdown collections under src/content/.
 */

export const site = {
  name: 'Avijit Saha',
  firstName: 'Avijit',
  lastName: 'Saha',
  initials: 'AS',
  role: 'MERN Stack Developer',
  url: 'https://avijitsaha.netlify.app/',
  title: 'Avijit Saha | MERN Stack Developer',
  description:
    'Avijit Saha — MERN stack developer and React specialist building fast, clean web applications with JavaScript, React, Node.js, Express and MongoDB.',
  ogImage: '/assets/img/project-appit.JPG',
  email: 'avijitsahashovo2016@gmail.com',
  phone: '+8801309639153',
  phoneDisplay: '+880 1309 639153',
  location: 'Dhaka, Bangladesh',
  resumeUrl: 'https://drive.google.com/file/d/14IDpJPt0idDN1lchDIRa_w-k1km-Cgb5/view',
  github: 'https://github.com/avijitsaha01/',
  linkedin: 'https://www.linkedin.com/in/avijit2021/',
  availability: 'Available for new opportunities',
} as const;

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const;

export const hero = {
  headline: `Hi, I'm`,
  typedStrings: ['MERN Stack Developer', 'React Specialist', 'Front-End Developer', 'Fast Learner'],
  intro:
    'Self-driven, quick starter and passionate programmer with a curious mind who enjoys solving complex, real-world problems with clean, modern web technology.',
  chips: [
    { icon: 'code', label: 'React' },
    { icon: 'database', label: 'MERN' },
  ],
  stats: [
    { label: 'Featured projects', value: '5' },
    { label: 'Tools & technologies', value: '14' },
    { label: 'Curiosity', value: '∞', gradient: true },
  ],
};

export const about = {
  paragraphs: [
    "I'm a Computer Science graduate from Green University of Bangladesh with a passion for building products that feel as good as they work.",
    "Detail-oriented web application developer with hands-on experience across front-end and back-end development. I'm adept in JavaScript, ReactJS, NodeJS, MongoDB and ExpressJS — the full MERN stack.",
  ],
  facts: [
    { icon: 'pin', label: 'Dhaka, Bangladesh' },
    { icon: 'graduation', label: 'B.Sc. in CSE' },
    { icon: 'spark', label: 'MERN stack' },
  ],
  pillars: [
    {
      icon: 'monitor',
      title: 'Frontend',
      text: 'React, modern JavaScript and responsive interfaces that feel effortless.',
    },
    {
      icon: 'server',
      title: 'Backend',
      text: 'Node.js and Express APIs built for clarity, reliability and speed.',
    },
    {
      icon: 'database',
      title: 'Database',
      text: 'MongoDB data modelling and REST integrations that scale cleanly.',
    },
  ],
};

export const sectionCopy = {
  about: {
    eyebrow: 'About',
    title: 'A little about me',
    sub: 'I care about the details — the ones users feel but never notice.',
  },
  experience: {
    eyebrow: 'Experience',
    title: "Where I've worked",
    sub: 'Real-world operations taught me precision — engineering rewards the same habit.',
  },
  projects: {
    eyebrow: 'Projects',
    title: "Things I've built",
    sub: 'A selection of full-stack and front-end projects — each one shipped, live and open source.',
  },
  skills: {
    eyebrow: 'Skills',
    title: 'My toolbox',
    sub: 'The languages, libraries and platforms I reach for every day.',
  },
  education: {
    eyebrow: 'Education',
    title: 'Where I learned',
    sub: 'A formal foundation in computer science, sharpened by hands-on training.',
  },
  contact: {
    eyebrow: 'Contact',
    title: "Let's build something great",
    sub: "I'm open to frontend, backend and full-stack MERN opportunities. Send a message below or email me directly.",
  },
};
