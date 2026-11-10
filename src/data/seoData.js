/**
 * VELTRAXX 2.0 · Single Source of Truth for Technical SEO & Schemas
 * Compliant with Schema.org standards, Google Rich Results criteria, and WCAG 2.2 AA.
 */

export const BASE_URL = 'https://veltraxx.in';
export const DEFAULT_OG_IMAGE = 'https://veltraxx.in/og-banner.jpg';

export const COMMON_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Sri Shakthi Institute of Engineering and Technology - Department of Electrical and Electronics Engineering (VLSI Design & Technology)',
  alternateName: [
    'SIET Coimbatore',
    'VELTRAXX Organizing Committee',
    'Dept of EE (VLSI Design & Tech), SIET'
  ],
  url: `${BASE_URL}/`,
  logo: `${BASE_URL}/apple-touch-icon.png`,
  image: DEFAULT_OG_IMAGE,
  description: 'Department of Electrical and Electronics Engineering (VLSI Design and Technology) at Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore. Organizers of VELTRAXX 2.0 National Hackathon.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'L&T Bypass Road, Chinniyampalayam Post',
    addressLocality: 'Coimbatore',
    addressRegion: 'Tamil Nadu',
    postalCode: '641062',
    addressCountry: 'IN'
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'Faculty Convener & Head of Department',
      name: 'Dr. P. Dhilipkumar',
      telephone: '+91-9629561731',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Student Lead Coordinator',
      name: 'R.A. Darshan',
      telephone: '+91-9751340838',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Student Co-Coordinator',
      name: 'L.Subiksha',
      telephone: '+91-9344705387',
      availableLanguage: ['English', 'Tamil']
    }
  ],
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: 'Sri Shakthi Institute of Engineering and Technology',
    url: 'https://siet.ac.in',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Coimbatore',
      addressRegion: 'Tamil Nadu',
      postalCode: '641062',
      addressCountry: 'IN'
    }
  },
  sameAs: [
    'https://siet.ac.in',
    'https://www.linkedin.com/school/sri-shakthi-institute-of-engineering-and-technology/',
    'https://instagram.com/siet_cbe'
  ]
};

export const COMMON_WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: `${BASE_URL}/`,
  name: 'VELTRAXX 2.0',
  alternateName: 'VELTRAXX Hackathon',
  inLanguage: 'en-US',
  description: 'Official portal for VELTRAXX 2.0, National-Level 24-Hour VLSI, Semiconductor & Hardware Hackathon at SIET Coimbatore.',
  publisher: {
    '@id': `${BASE_URL}/#organization`
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
};

export const HOME_EVENT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  '@id': `${BASE_URL}/#event`,
  name: 'VELTRAXX 2.0 - National-Level 24-Hour VLSI & Hardware Hackathon',
  alternateName: "VELTRAXX'26",
  description: 'National-Level 2-Stage Tech & Silicon Hackathon organized by the Department of Electrical & Electronics Engineering (VLSI Design & Technology) at Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore. Round 1 100% Free Online Pitch, followed by a 24-Hour Offline Arena on Dec 15-16, 2026.',
  startDate: '2026-12-15T08:30:00+05:30',
  endDate: '2026-12-16T12:30:00+05:30',
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  image: [
    DEFAULT_OG_IMAGE,
    `${BASE_URL}/apple-touch-icon.png`
  ],
  location: {
    '@type': 'Place',
    name: 'Sri Shakthi Institute of Engineering and Technology (SIET)',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'L&T Bypass Road, Chinniyampalayam Post',
      addressLocality: 'Coimbatore',
      addressRegion: 'Tamil Nadu',
      postalCode: '641062',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 11.0168,
      longitude: 76.9558
    }
  },
  organizer: {
    '@type': 'EducationalOrganization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Department of Electrical and Electronics Engineering (VLSI Design & Technology), SIET Coimbatore',
    url: 'https://siet.ac.in',
    logo: `${BASE_URL}/apple-touch-icon.png`
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Round 1 Online Pitch Entry',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-10-01T00:00:00+05:30',
      validThrough: '2026-12-01T23:59:59+05:30',
      url: `${BASE_URL}/register`,
      category: 'Free Registration'
    },
    {
      '@type': 'Offer',
      name: 'Round 2 24-Hour Offline Silicon Arena (Shortlisted Finalists)',
      price: '500',
      priceCurrency: 'INR',
      availability: 'https://schema.org/PreOrder',
      validFrom: '2026-12-07T10:00:00+05:30',
      validThrough: '2026-12-12T23:59:59+05:30',
      url: `${BASE_URL}/round2-confirm`,
      category: 'Finalist Seat Confirmation'
    }
  ],
  subEvent: [
    {
      '@type': 'Event',
      name: 'Round 1: 48-Hour Solution Blueprint Submission',
      startDate: '2026-12-02T00:00:00+05:30',
      endDate: '2026-12-03T23:59:59+05:30',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      description: 'Registered squads submit a 6-slide SIH-style technical presentation blueprint PDF via the online portal.'
    },
    {
      '@type': 'Event',
      name: 'Round 2: 24-Hour Offline Silicon Build Arena',
      startDate: '2026-12-15T08:30:00+05:30',
      endDate: '2026-12-16T12:30:00+05:30',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      description: 'Shortlisted squads hack live on campus with surprise engineering twists, jury audits, and cash prize defense.'
    }
  ],
  about: [
    'VLSI Design',
    'Semiconductor Engineering',
    'FPGA Acceleration',
    'Edge AI and TinyML',
    'Cyber-Physical Systems and IoT',
    'Hardware Innovation'
  ]
};

export const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${BASE_URL}/#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Round 1 really 100% free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Registering your team and submitting your Round 1 PPT blueprint costs ₹0. There is no fee required to pitch your idea online.'
      }
    },
    {
      '@type': 'Question',
      name: 'What happens if our team gets shortlisted for Round 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our coordinators will call your Team Leader directly to confirm your physical seat and send an exclusive invitation email containing the Round 2 passcode and nominal offline hospitality details.'
      }
    },
    {
      '@type': 'Question',
      name: 'I am a 1st-year student / from CSE or IT. Can I participate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. We feature 5 tracks covering AI, IoT, Embedded Systems, FPGA, and VLSI. Our jury normalizes evaluation relative to your academic year (1st/2nd-year UG vs Senior UG/PG/Scholars).'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the allowed team size?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Teams can consist of 2, 3, or 4 members. Cross-department collaborations (e.g. ECE + CSE or VLSI + IT) within your institution are welcome.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do we submit our PPT on Dec 2-3?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Download the official 6-slide template from this website, complete your architecture, save it as a PDF (under 3MB), and upload it directly via the "Submit PPT" portal on Dec 2-3 using your Team ID.'
      }
    },
    {
      '@type': 'Question',
      name: 'Will food and overnight stay be provided during the Dec 15-16 finale?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Comprehensive hospitality including working lunch, dinner, midnight refreshments, breakfast, and dedicated resting zones for boys and girls is provided at the SIET campus.'
      }
    }
  ]
};

export const SEO_CONFIG = {
  baseUrl: BASE_URL,
  defaultOgImage: DEFAULT_OG_IMAGE,
  routes: {
    '/': {
      path: '/',
      title: 'VELTRAXX 2.0 · National 24-Hour VLSI & Hardware Hackathon | SIET',
      description: "Join VELTRAXX 2.0, India's premier 24-hour national VLSI, semiconductor & hardware hackathon at SIET Coimbatore. 5 industrial tracks, cash prizes & 100% free Round 1 entry.",
      canonical: `${BASE_URL}/`,
      keywords: 'veltraxx, veltraxx 2.0, hardware hackathon, vlsi hackathon, semiconductor hackathon, engineering hackathons in tamil nadu, siet hackathon, national 24-hour hackathon, fpga hackathon',
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      twitterCard: 'summary_large_image',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` }
      ],
      schemas: [
        HOME_EVENT_SCHEMA,
        COMMON_ORGANIZATION,
        HOME_FAQ_SCHEMA,
        COMMON_WEBSITE,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': `${BASE_URL}/#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${BASE_URL}/`
            }
          ]
        }
      ]
    },
    '/about': {
      path: '/about',
      title: 'Our Journey & Silicon Legacy · VELTRAXX 2.0 | SIET Coimbatore',
      description: "Explore the journey of SIET Coimbatore's Department of EE (VLSI Design & Technology). 17 silicon architectures, MeitY C2S EDA labs, Samsung fellowships & the legacy of VELTRAXX.",
      canonical: `${BASE_URL}/about`,
      keywords: 'veltraxx about, siet hackathon, sri shakthi institute vlsi department, engineering hackathons in tamil nadu, siet coimbatore vlsi, meity c2s eda labs siet, department of vlsi design and technology',
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      twitterCard: 'summary_large_image',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` },
        { name: 'Our Journey', item: `${BASE_URL}/about` }
      ],
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': `${BASE_URL}/about#webpage`,
          url: `${BASE_URL}/about`,
          name: 'Our Journey & Silicon Legacy · VELTRAXX 2.0 | SIET Coimbatore',
          description: "Explore the journey of SIET Coimbatore's Department of EE (VLSI Design & Technology). 17 silicon architectures, MeitY C2S EDA labs, Samsung fellowships & the legacy of VELTRAXX.",
          mainEntity: {
            '@id': `${BASE_URL}/#organization`
          }
        },
        COMMON_ORGANIZATION,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': `${BASE_URL}/about#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${BASE_URL}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Our Journey',
              item: `${BASE_URL}/about`
            }
          ]
        }
      ]
    },
    '/register': {
      path: '/register',
      title: 'Register Your Team (100% Free) · Round 1 Online Pitch | VELTRAXX 2.0',
      description: 'Register your team of 2-4 engineers for VELTRAXX 2.0 at ₹0. Choose your track from 25 industry problem statements. Instant Team ID generated upon registration.',
      canonical: `${BASE_URL}/register`,
      keywords: 'veltraxx registration, veltraxx 2.0 registration, hardware hackathon registration, free hackathon registration 2026, register for veltraxx, engineering hackathon apply online',
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      twitterCard: 'summary_large_image',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` },
        { name: 'Register Free', item: `${BASE_URL}/register` }
      ],
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Event',
          '@id': `${BASE_URL}/register#event`,
          name: 'VELTRAXX 2.0 Free Team Registration (Round 1 Online Pitch)',
          url: `${BASE_URL}/register`,
          description: 'Register your team of 2-4 engineers for VELTRAXX 2.0 at ₹0. Choose your track from 25 industry problem statements.',
          startDate: '2026-10-01T00:00:00+05:30',
          endDate: '2026-12-01T23:59:59+05:30',
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: 'Sri Shakthi Institute of Engineering and Technology (SIET)',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Coimbatore',
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN'
            }
          },
          offers: {
            '@type': 'Offer',
            name: 'Round 1 Online Pitch Entry',
            price: '0',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            validFrom: '2026-10-01T00:00:00+05:30',
            validThrough: '2026-12-01T23:59:59+05:30',
            url: `${BASE_URL}/register`,
            category: 'Free Registration'
          },
          organizer: {
            '@id': `${BASE_URL}/#organization`
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': `${BASE_URL}/register#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${BASE_URL}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Register Free',
              item: `${BASE_URL}/register`
            }
          ]
        }
      ]
    },
    '/submit-ppt': {
      path: '/submit-ppt',
      title: 'Submit Solution PPT · Round 1 Blueprint Portal | VELTRAXX 2.0',
      description: "Submit your team's 6-slide SIH-style technical solution blueprint for VELTRAXX 2.0. Upload your PDF pitch deck under 3MB using your Team ID for jury screening.",
      canonical: `${BASE_URL}/submit-ppt`,
      keywords: 'veltraxx submit ppt, veltraxx 2.0 solution submission, sih style ppt template hardware hackathon, veltraxx blueprint submission, round 1 ppt portal veltraxx',
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      twitterCard: 'summary_large_image',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` },
        { name: 'Submit Solution PPT', item: `${BASE_URL}/submit-ppt` }
      ],
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Action',
          '@id': `${BASE_URL}/submit-ppt#action`,
          name: 'Submit Round 1 Technical Presentation Blueprint',
          description: 'Upload completed 6-slide presentation blueprint in PDF format for VELTRAXX 2.0 Round 1 evaluation.',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/submit-ppt`,
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform'
            ]
          },
          startTime: '2026-12-02T00:00:00+05:30',
          endTime: '2026-12-03T23:59:59+05:30'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': `${BASE_URL}/submit-ppt#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${BASE_URL}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Submit Solution PPT',
              item: `${BASE_URL}/submit-ppt`
            }
          ]
        }
      ]
    },
    '/round2-confirm': {
      path: '/round2-confirm',
      title: 'Round 2 Gatekeeper · Finalist Arena Seat Confirmation | VELTRAXX 2.0',
      description: 'Exclusive Round 2 seat confirmation portal for shortlisted VELTRAXX 2.0 finalists. Enter your team passcode to lock your 24-hour offline silicon arena desk at SIET Coimbatore.',
      canonical: `${BASE_URL}/round2-confirm`,
      keywords: 'veltraxx round 2 confirmation, veltraxx finalist seat confirmation, veltraxx 2.0 round 2 pass, siet offline hackathon confirmation, veltraxx shortlisted teams',
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      twitterCard: 'summary_large_image',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` },
        { name: 'Round 2 Finalist Gatekeeper', item: `${BASE_URL}/round2-confirm` }
      ],
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${BASE_URL}/round2-confirm#webpage`,
          url: `${BASE_URL}/round2-confirm`,
          name: 'Round 2 Gatekeeper · Finalist Arena Seat Confirmation | VELTRAXX 2.0',
          description: 'Exclusive Round 2 seat confirmation portal for shortlisted VELTRAXX 2.0 finalists. Enter your team passcode to lock your 24-hour offline silicon arena desk at SIET Coimbatore.'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': `${BASE_URL}/round2-confirm#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${BASE_URL}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Round 2 Finalist Gatekeeper',
              item: `${BASE_URL}/round2-confirm`
            }
          ]
        }
      ]
    }
  }
};

/**
 * Returns SEO metadata object for a specific pathname.
 * Normalizes trailing slashes (except root) and defaults to '/' if unknown.
 * @param {string} pathname
 * @returns {object}
 */
export function getSeoData(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return SEO_CONFIG.routes['/'];
  }
  let normalized = pathname.trim();
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return SEO_CONFIG.routes[normalized] || SEO_CONFIG.routes['/'];
}

export default SEO_CONFIG;
