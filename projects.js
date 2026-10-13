// All content for the home timeline and the explorations board lives here.
// To add something, copy an entry and edit it. Newest rows go first.
//
// Card fields:
//   title   label in the pill above the card
//   href    where the card goes (leave out for no link)
//   size    "s", "m" or "l" (how wide the card is in its row)
//   image   still image shown on the front
//   video   optional screen recording (mp4/webm); replaces the image when set
//   blur    true for NDA work
//   ratio   width / height of the visual, when the default crop cuts something off
//   focus   which part of the image to keep when it is cropped, e.g. '44% 50%'
//   cover / coverNote   words shown on the front until there is an image or video
//   dots    [lit, total] draws a dot picture beside the cover words
//   badge   'powerbi' fills the space under a shorter card with the tool's mark
//   about / role / tools   the type shown behind the visual on hover
//   note    for text-only cards: the sentence on the card
//   tone    "blue" or "brown": the colour of a text-only card or a cover

// q_auto:best keeps screenshots of interfaces crisp (plain q_auto softens small text)
const CLOUD = 'https://res.cloudinary.com/df0tysd6u/image/upload/f_auto,q_auto:best/';

window.TIMELINE = [
  {
    date: 'Now',
    cards: [
      {
        title: 'Currently learning', size: 's', tone: 'blue',
        href: 'https://github.com/maitreyi-bhardwaj/leetcode-journey',
        note: 'Python and data structures, a little every day. The practice log is public.',
        cta: 'Open the practice log'
      }
    ]
  },
  {
    date: '10.26',
    cards: [
      {
        title: 'Peachtree Grid: capital program dashboard in Power BI', size: 'l', ratio: 1.775,
        href: 'powerbi.html',
        image: CLOUD + 'v1791840381/Screenshot_2026-10-12_at_2.25.54_PM_htgbej.png',
        about: 'One page that shows whether 12 transmission projects are on budget, on schedule, safe and staffed. The data is synthetic.',
        role: 'Solo',
        tools: 'Power BI, Power Query, DAX'
      }
    ]
  },
  {
    date: '10.26',
    cards: [
      {
        title: 'Reach: vaccination outreach from survey data', size: 'l',
        href: 'reach.html',
        dots: [23, 100], cover: '23 in 100',
        coverNote: 'children aged 12 to 23 months in India are missing at least one basic vaccine. NFHS-5 survey, 2019\u201321.',
        about: 'Uses India\u2019s national health survey to find where children are missing routine vaccines, then helps people plan outreach there. AI drafts, a person approves.',
        role: 'Solo',
        tools: 'Python, pandas, scikit-learn, FastAPI'
      }
    ]
  },
  {
    date: '07.26',
    cards: [
      {
        title: 'Ripe: handpicked AI tools, for me', size: 'l', ratio: 1.777,
        href: 'ripe.html',
        image: 'media/ripe/hero.jpg',
        about: 'A personal app that tells me if an AI tool is worth my time: ripe, situational, or skip. It also turns what I save into something short I finish.',
        role: 'Designer',
        tools: 'Figma, Vercel prototype'
      }
    ]
  },
  {
    date: '04.26',
    cards: [
      {
        title: 'Strata: the thinking mat', size: 'l', ratio: 1.777,
        href: 'strata.html',
        image: 'media/strata/hero.jpg',
        about: 'A concept for a floor mat that reads your body and adjusts under your head, neck and back so you can rest.',
        role: 'Industrial Designer',
        tools: 'Sketching, clay, 3D modelling, rendering'
      }
    ]
  },
  {
    date: '2026',
    cards: [
      {
        title: 'D2Bridge HMI design system', size: 'm', tone: 'blue', ratio: 1.3,
        cover: '72kW', coverNote: 'HMI design system for D2Bridge. Ask me for a walkthrough.',
        about: 'A design system for a 72kW HMI, built on contract for D2Bridge. The work is confidential, so I show it in conversation instead of on this page.',
        role: 'UI Designer (contract)',
        tools: 'Figma'
      },
      {
        title: 'Distill Chrome extension', size: 'm',
        href: 'distill.html',
        image: CLOUD + 'v1781041541/distill_02_UI_bnkfsj.png', ratio: 1.3,
        about: 'Listens to the active tab, translates the audio into 16 languages at once and streams live ASL cards over any site. Built in 36 hours at HackAZona, where it won the Microsoft Track.',
        role: 'UI Designer',
        tools: 'Figma, Azure AI, Chrome'
      },
      {
        title: 'Pastiche Figma plugin', size: 'm',
        href: 'pastiche.html',
        image: CLOUD + 'v1780963087/pastiche_07_plugin_ui_ckstkh.png', ratio: 1.3,
        about: 'Turns 500 years of museum painting into design tokens. Pick an artwork and its palette, primitives and variables are written into your Figma file.',
        role: 'Designer and engineer',
        tools: 'JavaScript, k-means, Figma API'
      }
    ]
  },
  {
    date: '2026',
    cards: [
      {
        title: 'Frontdoor: Home Passport design system', size: 'l', ratio: 2,
        href: 'frontdoor.html',
        image: CLOUD + 'v1781024360/fd_08_dashboard_yockx3.png',
        about: 'An app concept for Frontdoor and American Home Shield. Every appliance, warranty and repair in one place, and a new device registers with a single NFC tap.',
        role: 'UI Designer, with Anahi',
        tools: 'Figma, NFC, Storybook, Style Dictionary, zeroheight'
      }
    ]
  },
  {
    date: '2025',
    cards: [
      {
        title: 'Vibin iOS app', size: 'l',
        href: 'vibin.html',
        image: CLOUD + 'v1781052636/vibin_06_final_ui_gzr8sh.png', ratio: 2.02,
        about: 'A live social discovery app for Gen Z. People at a venue post the vibe in real time and the map shows what is happening right now. Co-founded, designed and shipped to the App Store.',
        role: 'Product Designer and co-founder',
        tools: 'Figma, iOS, GenAI'
      }
    ]
  },
  {
    date: '04.25',
    cards: [
      {
        title: 'Kith: 3D-printed lamps', size: 'l', ratio: 1.777,
        href: 'kith.html',
        image: 'media/kith/p66.jpg',
        about: 'A pendant lamp for the dining table. Each shade takes its form from a fruit that a community gathers and shares.',
        role: 'Industrial Designer',
        tools: 'Rhino, Grasshopper, 3D printing'
      }
    ]
  },
  {
    date: '12.24',
    cards: [
      {
        title: 'Pit Boss: in-store display', size: 'l', ratio: 1.777,
        href: 'pitboss.html',
        image: 'media/pitboss/p02.jpg',
        about: 'An in-store display for Pit Boss grills that explains the grill where people buy it. Design Excellence Award, Fall 2024.',
        role: 'Industrial Design student',
        tools: 'Sketching, cardboard models, 3D rendering'
      }
    ]
  }
];

// Explorations: smaller things tried and built. A tile has a title and either
// an image with a short caption, or a coloured note. href makes it a link.
window.EXPLORATIONS = [
  {
    title: 'A Story Passed Down', kind: 'Illustration',
    href: 'https://www.behance.net/gallery/254811507/A-Story-Passed-Down',
    image: 'media/explorations/story.jpg',
    caption: 'An illustrated story about a 300-year-old murti of Bhuvaneshwari Mata.'
  },
  {
    title: 'Onam Fest', kind: 'Illustration, Print',
    href: 'https://www.behance.net/gallery/254809147/Onam-Fest-Illustration-Lino-Printing',
    image: 'media/explorations/onam.jpg',
    caption: 'A hand-carved lino print.'
  },
  {
    title: 'Industrial tape dispenser', kind: 'Model making',
    href: 'https://www.behance.net/gallery/190143385/Model-Construction-Industrial-Tape-Dispenser',
    image: 'media/explorations/tape.jpg',
    caption: 'A hand-built model of an industrial tape dispenser.'
  },
  {
    title: 'Materials and processes, NID', kind: 'Craft',
    href: 'https://www.behance.net/gallery/183037995/Materials-And-Processes-NID-AP',
    image: 'media/explorations/materials.jpg',
    caption: 'A wooden tray with a mosaic inlay, from a materials course at NID.'
  },
  {
    title: 'Maitreyi Flow', tone: 'blue', kind: 'Code',
    note: 'A voice-to-text tool for macOS. Hold a key, speak, release, and cleaned-up English lands in whatever app you are typing in.'
  },
  {
    title: 'LeetCode journey', tone: 'paper', kind: 'Code',
    href: 'https://github.com/maitreyi-bhardwaj/leetcode-journey',
    note: 'Daily Python, data structures and algorithms practice, kept in public.'
  }
];
