/**
 * VELTRAXX 2.0 · Single Source of Truth for Technical SEO & Schemas
 * Compliant with Schema.org standards, Google Rich Results criteria, and WCAG 2.2 AA.
 */

export const BASE_URL = 'https://veltrax-x-2-0-web.vercel.app';
export const DEFAULT_OG_IMAGE = 'https://veltrax-x-2-0-web.vercel.app/og-banner-v2.jpg';
export const DEPARTMENT_PORTAL_IMAGE = 'https://veltrax-x-2-0-web.vercel.app/dept-og-banner.jpg';

export const COMMON_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Sri Shakthi Institute of Engineering and Technology - Department of Electronics Engineering (VLSI Design and Technology)',
  alternateName: [
    'SIET Coimbatore',
    'VELTRAXX Organizing Committee',
    'Dept of EE - VDT (VLSI Design & Tech), SIET'
  ],
  url: `${BASE_URL}/`,
  logo: `${BASE_URL}/apple-touch-icon.png`,
  image: DEFAULT_OG_IMAGE,
  description: 'Department of Electronics Engineering (VLSI Design and Technology) at Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore. Organizers of VELTRAXX 2.0 24-Hour Onsite Hackathon.',
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
      email: 'dhilipkumarece@siet.ac.in',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Faculty Coordinator',
      name: 'Mrs. T. Renita Pearlin',
      email: 'trenitacdc@siet.ac.in',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Faculty Coordinator',
      name: 'Mrs. P. Prisilla Sophia',
      email: 'priscillasobhiaece@siet.ac.in',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Faculty Coordinator',
      name: 'Mrs. C. Prema',
      email: 'premacece@siet.ac.in',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Faculty Coordinator',
      name: 'Mrs. R. Vasanthi',
      email: 'vasanthiece@siet.ac.in',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Student Lead Coordinator',
      name: 'R.A. Darshan',
      telephone: '+91-9751340838',
      email: 'darshanra24vl@srishakthi.ac.in',
      availableLanguage: ['English', 'Tamil']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'Student Coordinator',
      name: 'L.Subiksha',
      telephone: '+91-9344705387',
      email: 'subikshal24vl@srishakthi.ac.in',
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
  name: 'VELTRAXX 2.0 - National-Level 24-Hour Onsite VLSI & Hardware Hackathon',
  alternateName: "VELTRAXX'26",
  description: 'Single-round 24-hour onsite hackathon organized by the Department of Electronics Engineering (VLSI Design and Technology) at SIET Coimbatore on Dec 15-16, 2026. Strictly 3 members per team, ₹500/member (₹1,500/team), max 60 teams.',
  startDate: '2026-12-15T00:00:00+05:30',
  endDate: '2026-12-16T23:59:59+05:30',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
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
    name: 'Department of Electronics Engineering (VLSI Design and Technology), SIET Coimbatore',
    url: 'https://siet.ac.in',
    logo: `${BASE_URL}/apple-touch-icon.png`
  },
  performer: {
    '@type': 'PerformingGroup',
    name: 'VELTRAXX Organizing Committee, Technical Jury & Industry Mentors'
  },
  offers: [
    {
      '@type': 'Offer',
      name: '24-Hour Onsite Hackathon Team Registration (3 Members)',
      price: '1500',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-10-01T00:00:00+05:30',
      validThrough: '2026-12-12T23:59:59+05:30',
      url: `${BASE_URL}/register`,
      category: 'Direct Team Registration (₹500 per member)'
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
      name: 'Is there any online preliminary round or PPT submission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. VELTRAXX 2.0 is a direct single-round, 24-hour onsite hackathon held on December 15-16, 2026 at SIET Coimbatore with no preliminary PPT round or online shortlisting.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the registration fee and team capacity?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The fee is ₹500 per member (₹1,500 total per 3-member team). Maximum capacity is 60 teams (180 participants), verified manually via confirmation emails from vlsireseachlab@siet.ac.in.'
      }
    },
    {
      '@type': 'Question',
      name: 'Who is eligible to participate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VELTRAXX 2.0 is open to all academic disciplines across UG, PG, and research scholars, subject to applicable institutional eligibility and minor-safety requirements.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the allowed team size?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Team size is strictly fixed at 3 members (1 Team Leader and 2 Team Members). No post-registration member substitutions are allowed.'
      }
    },
    {
      '@type': 'Question',
      name: 'When do registrations close?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Registrations close on December 12, 2026 at 11:59 PM IST, or earlier once all 60 team seats are filled.'
      }
    },
    {
      '@type': 'Question',
      name: 'What food and rewards are included?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Food (3 meals) and 2 refreshments are provided during the 24-hour hackathon. Winning rewards include a trophy, cash prize (to be revealed later), and a VLSI internship opportunity.'
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
      title: 'VELTRAXX 2.0 · 24-Hour Onsite VLSI & Hardware Hackathon | SIET',
      description: 'VELTRAXX 2.0 at SIET Coimbatore (Dec 15-16, 2026): Direct 24-hour onsite VLSI, FPGA, Edge AI & IoT hackathon. Strictly 3 members, ₹500/head, max 60 teams.',
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
      title: 'Register Squad (₹500/Head · Max 60 Teams) | VELTRAXX 2.0',
      description: 'Complete unified 3-member paid registration (₹500/member, ₹1,500 total) for VELTRAXX 2.0 at SIET Coimbatore (Dec 15-16, 2026). Closes Dec 12, 11:59 PM IST.',
      canonical: `${BASE_URL}/register`,
      keywords: 'veltraxx registration, veltraxx 2.0 registration, 24 hour hackathon registration 2026, register for veltraxx, siet coimbatore hackathon apply online',
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      twitterCard: 'summary_large_image',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` },
        { name: 'Register Team', item: `${BASE_URL}/register` }
      ],
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Event',
          '@id': `${BASE_URL}/register#event`,
          name: 'VELTRAXX 2.0 Team Registration (24-Hour Onsite Hackathon)',
          url: `${BASE_URL}/register`,
          description: 'Register your strictly 3-member squad for VELTRAXX 2.0 at SIET Coimbatore. Fee ₹500/member (₹1,500/team), max 60 teams, closes Dec 12, 2026.',
          startDate: '2026-12-15T00:00:00+05:30',
          endDate: '2026-12-16T23:59:59+05:30',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
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
            name: '24-Hour Onsite Team Entry (3 Members)',
            price: '1500',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            validFrom: '2026-10-01T00:00:00+05:30',
            validThrough: '2026-12-12T23:59:59+05:30',
            url: `${BASE_URL}/register`,
            category: 'Team Registration'
          },
          organizer: {
            '@id': `${BASE_URL}/#organization`
          },
          performer: {
            '@type': 'PerformingGroup',
            name: 'VELTRAXX Organizing Committee, Technical Jury & Industry Mentors'
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
              name: 'Register Team',
              item: `${BASE_URL}/register`
            }
          ]
        }
      ]
    },
    '/privacy-policy': {
      path: '/privacy-policy',
      title: 'Privacy Policy · VELTRAXX 2.0 | SIET Coimbatore',
      description: 'Official Privacy Policy for VELTRAXX 2.0 at SIET Coimbatore: participant data collection, Supabase storage, Google Drive judging isolation, and retention rules.',
      canonical: `${BASE_URL}/privacy-policy`,
      keywords: 'veltraxx privacy policy, veltraxx 2.0 data protection, siet coimbatore hackathon privacy, google drive limited use veltraxx',
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      twitterCard: 'summary_large_image',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` },
        { name: 'Privacy Policy', item: `${BASE_URL}/privacy-policy` }
      ],
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${BASE_URL}/privacy-policy#webpage`,
          url: `${BASE_URL}/privacy-policy`,
          name: 'Privacy Policy · VELTRAXX 2.0 | SIET Coimbatore',
          description: 'Official Privacy Policy for VELTRAXX 2.0 at SIET Coimbatore: participant data collection, Supabase storage, Google Drive judging isolation, and retention rules.'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': `${BASE_URL}/privacy-policy#breadcrumb`,
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
              name: 'Privacy Policy',
              item: `${BASE_URL}/privacy-policy`
            }
          ]
        }
      ]
    }
  }
};

/**
 * Unlisted / private portal metadata (excluded from public SEO_CONFIG.routes & sitemap.xml).
 * Marked noindex, nofollow so search engines do not surface staff-only links publicly.
 */
export const PRIVATE_PORTAL_SEO = {
  '/round2-confirm': {
    path: '/round2-confirm',
    robots: 'noindex, nofollow, noarchive',
    title: 'Legacy Payment Recovery · VELTRAXX 2.0 | SIET Coimbatore',
    description: 'Internal recovery page for pre-conversion legacy teams only. New squads register and pay together on /register.',
    canonical: `${BASE_URL}/register`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
    schemas: []
  },
  '/submit-ppt': {
    path: '/submit-ppt',
    robots: 'noindex, nofollow, noarchive',
    title: 'Single-Round Format Notice · VELTRAXX 2.0 | SIET Coimbatore',
    description: 'VELTRAXX 2.0 is now a single-round 24-hour onsite hackathon on December 15-16, 2026 with no preliminary PPT submission.',
    canonical: `${BASE_URL}/register`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
    schemas: []
  },
  '/our_department': {
    path: '/our_department',
    robots: 'noindex, nofollow, noarchive',
    siteName: 'Department of EE - VDT · SIET Coimbatore',
    title: 'Department of EE - VDT · Silicon Journey | SIET',
    description: "Official academic showcase of SIET Coimbatore's Department of EE - VDT (VLSI Design and Technology): MeitY C2S EDA labs, 17 student silicon designs & achievements.",
    canonical: `${BASE_URL}/our_department`,
    keywords: 'Department of EE - VDT, SIET Coimbatore, VLSI Design and Technology, MeitY C2S EDA labs, Sri Shakthi Institute of Engineering and Technology',
    ogType: 'website',
    ogImage: DEPARTMENT_PORTAL_IMAGE,
    ogImageAlt: 'Department of EE - VDT (VLSI Design and Technology) - SIET Coimbatore',
    twitterCard: 'summary_large_image',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${BASE_URL}/our_department#webpage`,
        url: `${BASE_URL}/our_department`,
        name: 'Department of EE - VDT · Silicon Journey | SIET',
        description: "Official academic showcase of SIET Coimbatore's Department of EE - VDT (VLSI Design and Technology): MeitY C2S EDA labs, 17 student silicon designs & achievements.",
        publisher: {
          '@type': 'EducationalOrganization',
          name: 'Department of EE - VDT (VLSI Design and Technology), Sri Shakthi Institute of Engineering and Technology',
          url: 'https://siet.ac.in',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'L&T Bypass Road, Chinniyampalayam Post',
            addressLocality: 'Coimbatore',
            addressRegion: 'Tamil Nadu',
            postalCode: '641062',
            addressCountry: 'IN'
          }
        }
      }
    ]
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
  return PRIVATE_PORTAL_SEO[normalized] || SEO_CONFIG.routes[normalized] || SEO_CONFIG.routes['/'];
}

export default SEO_CONFIG;
