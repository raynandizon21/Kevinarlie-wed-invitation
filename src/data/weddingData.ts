import { ColorPalette, TimelineItem, EntourageCategory, GuestWish } from '../types/wedding';

// Curated 4-color palettes with the user's uploaded "Earthy Tones" as the default
export const PALETTES: ColorPalette[] = [
  {
    id: 'earthy-tones',
    title: 'Earthy Tones',
    subtitle: 'Our Official Palette (Default)',
    description: 'Inspired by nature, forests, and fresh eucalyptus. A calm, modern, and romantic blend of greens.',
    bgTint: '#F2EBDD',
    primaryHex: '#185844',
    accentHex: '#78947F',
    colors: [
      {
        name: 'Ivory',
        tagalogName: 'Ivory',
        hex: '#F2EBDD',
        role: 'Bridal Gown & Main Background',
        attireGuide: 'Ivory is reserved for the bride; also used for stationery and flowers.',
      },
      {
        name: 'Sage',
        tagalogName: 'Soft Sage',
        hex: '#78947F',
        role: 'Bridesmaids Gowns',
        attireGuide: 'Long bridesmaid dresses in flowing silk or chiffon.',
      },
      {
        name: 'Emerald',
        tagalogName: 'Emerald',
        hex: '#185844',
        role: 'Maid of Honor & Table Linens',
        attireGuide: 'Napkins, floral ribbons, and formal barong embroidery accents.',
      },
      {
        name: 'Forest',
        tagalogName: 'Deep Forest',
        hex: '#102F27',
        role: 'Groom & Groomsmen Suits',
        attireGuide: 'Formal suits for the groom and groomsmen, velvet bow ties, and neckties.',
      },
      {
        name: 'Antique Gold',
        tagalogName: 'Antique Gold',
        hex: '#B08A4F',
        role: 'Accents & Principal Sponsors',
        attireGuide: 'Jewelry, sponsor shawls, cutlery, candles, and invitation stationery details.',
      },
    ],
  },
  {
    id: 'terracotta-clay',
    title: 'Terracotta & Warm Clay',
    subtitle: 'Warm Sunset Glow',
    description: 'Rich clay warmth, dried roses, and golden sunsets for a rustic wedding.',
    bgTint: '#FDF8F5',
    primaryHex: '#8C3F2D',
    accentHex: '#C97A63',
    colors: [
      {
        name: 'Deep Terracotta',
        tagalogName: 'Deep Terracotta',
        hex: '#8C3F2D',
        role: 'Primary Accent & Velvet',
        attireGuide: 'Warm burgundy-terracotta suits or structured dresses.',
      },
      {
        name: 'Dusty Rose',
        tagalogName: 'Dusty Rose',
        hex: '#D4A39A',
        role: 'Bridesmaids Gowns',
        attireGuide: 'Muted romantic rose gowns with flowing silhouette.',
      },
      {
        name: 'Warm Ochre',
        tagalogName: 'Warm Ochre',
        hex: '#C68B45',
        role: 'Floral Foliage & Ribbons',
        attireGuide: 'Warm golden silk accessories and floral stems.',
      },
      {
        name: 'Spiced Sand',
        tagalogName: 'Spiced Sand',
        hex: '#EAD7C5',
        role: 'Linens & Guest Accents',
        attireGuide: 'Cream barongs, natural linen textures, and shawls.',
      },
    ],
  },
  {
    id: 'champagne-gold',
    title: 'Champagne & Olive Gilt',
    subtitle: 'Classic Opulent Simplicity',
    description: 'Fine gold, champagne sparkle, and soft olive greenery for timeless elegance.',
    bgTint: '#FAF8F3',
    primaryHex: '#2A3B28',
    accentHex: '#C5A059',
    colors: [
      {
        name: 'Antique Pine',
        tagalogName: 'Antique Pine',
        hex: '#2A3B28',
        role: 'Tuxedo & Deep Contrast',
        attireGuide: 'Classic dark evergreen tuxedos and evening wear.',
      },
      {
        name: 'Champagne Silk',
        tagalogName: 'Champagne Silk',
        hex: '#E6D7B8',
        role: 'Bridesmaids & Draping',
        attireGuide: 'Satin slip dresses in champagne and candlelight tone.',
      },
      {
        name: 'Burnished Gold',
        tagalogName: 'Burnished Gold',
        hex: '#C5A059',
        role: 'Jewelry & Wax Seals',
        attireGuide: 'Gold foil invitations, cuff links, and jewelry accents.',
      },
      {
        name: 'Muted Laurel',
        tagalogName: 'Muted Laurel',
        hex: '#809176',
        role: 'Botanical Garland',
        attireGuide: 'Subtle sage-olive foliage and guest accessories.',
      },
    ],
  },
  {
    id: 'coastal-navy-sage',
    title: 'Coastal Sage & Midnight',
    subtitle: 'Serene Modern Romance',
    description: 'Fresh sea breeze blending midnight blue and soft sage green.',
    bgTint: '#F6F8F8',
    primaryHex: '#1B2C3F',
    accentHex: '#6F8C83',
    colors: [
      {
        name: 'Midnight Navy',
        tagalogName: 'Midnight Navy',
        hex: '#1B2C3F',
        role: 'Groom & Formal Attire',
        attireGuide: 'Tailored navy suits and classic evening attire.',
      },
      {
        name: 'Seafoam Sage',
        tagalogName: 'Seafoam Sage',
        hex: '#8EAAA3',
        role: 'Bridesmaids & Florals',
        attireGuide: 'Cool-toned sage dresses with lightweight chiffon.',
      },
      {
        name: 'Slate Green',
        tagalogName: 'Slate Green',
        hex: '#5B726B',
        role: 'Groomsmen Neckties',
        attireGuide: 'Slate ties, pocket squares, and menu prints.',
      },
      {
        name: 'Parchment Sand',
        tagalogName: 'Parchment Sand',
        hex: '#EBE5D8',
        role: 'Linens & Stationery',
        attireGuide: 'Barong Tagalog woven pina and warm ivory linens.',
      },
    ],
  },
];

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export const FAQS_DATA: FaqItem[] = [
  {
    question: 'Can I bring a plus-one?',
    category: 'Plus-one',
    // On the FAQ page, lines starting with "1.", "2."… show as numbered steps
    answer:
      'Yes, you can! To add your plus-one in the RSVP:\n1. Choose “Accepts with pleasure”.\n2. Under “Will you bring any guests?”, tap “Yes”.\n3. Type your guest’s full name.\n4. Bringing more than one? Tap “Add another guest” for each person (one name per field).',
  },
  {
    question: 'What is the "Unplugged Ceremony" policy?',
    category: 'Unplugged ceremony',
    answer: 'We kindly ask everyone to put their phones away during the ceremony so it stays intimate and our photographers and videographers have a clear view.',
  },
  {
    question: 'Do you have a gift guide?',
    category: 'Gifts',
    answer: 'Your presence and prayers are the greatest gift. If you wish to give something, a monetary gift for our new beginning would be sincerely appreciated.',
  },
];

export const WEDDING_DETAILS = {
  groom: 'Kevin',
  groomNickname: 'Kevin',
  bride: 'Arlei',
  brideNickname: 'Arlei',
  weddingDate: '2027-02-02T15:00:00+08:00',
  displayDate: 'Tuesday, February 2, 2027',
  ceremonyTime: '3:00 PM',
  churchName: 'San Vicente de Zaragoza Chapel',
  churchAddress: '2M33+8FG, Bacolor, Pampanga',
  receptionName: 'Nuan Farm & Resort',
  receptionAddress: 'Nuan Pavilion · XMX4+QH, Bacolor, Pampanga',
  wazeChurchUrl: 'https://waze.com/ul?q=San+Vicente+de+Zaragoza+Chapel+Bacolor+Pampanga',
  mapsChurchUrl: 'https://maps.google.com/?q=2M33%2B8FG+Bacolor+Pampanga',
  mapsReceptionUrl: 'https://maps.google.com/?q=XMX4%2BQH+Bacolor+Pampanga',
  bibleVerse: '"Above all, love each other deeply, because love covers over a multitude of sins." — 1 Peter 4:8',
  rsvpDeadline: 'January 2, 2027',
};

export const TIMELINE: TimelineItem[] = [
  {
    time: '2:30 PM',
    title: 'Assembly',
    location: '',
    description: '',
    icon: 'assembly',
  },
  {
    time: '3:00 PM',
    title: 'Ceremony',
    location: '',
    description: '',
    icon: 'rings',
  },
  {
    time: '4:30 PM',
    title: 'Photos',
    location: '',
    description: '',
    icon: 'camera',
  },
  {
    time: '6:00 PM',
    title: 'Cocktail Hour',
    location: '',
    description: '',
    icon: 'buffet',
  },
  {
    time: '7:00 PM',
    title: 'Program',
    location: '',
    description: '',
    icon: 'dinner',
  },
  {
    time: '9:00 PM',
    title: 'Party',
    location: '',
    description: '',
    icon: 'dance',
  },
];

// Listed in Philippine processional order (bride enters last, so she isn't listed)
export const ENTOURAGE_DATA: EntourageCategory[] = [
  {
    category: 'Parents',
    showRoles: true,
    members: [
      { role: 'Parents of the Groom', name: 'Myria Ayson & Arnel Ayson' },
      { role: 'Parents of the Bride', name: 'Azenith Gonzales & Jhun Mallari' },
    ],
  },
  {
    category: 'Principal Sponsors',
    members: [
      { role: 'Sponsor', name: 'Hon. Mike Rivera' },
      { role: 'Sponsor', name: 'Mayor Celsa Rivera' },
      { role: 'Sponsor', name: 'BGen. Randy Pascua' },
      { role: 'Sponsor', name: 'Dra. Charina Pascua' },
      { role: 'Sponsor', name: 'LTC. Rafael Demafeliz Jr.' },
      { role: 'Sponsor', name: 'Mrs. Marfe Gonzalo Salvador' },
      { role: 'Sponsor', name: 'LTC. Michael Rabina' },
      { role: 'Sponsor', name: 'Mrs. Milette Garcia Ramos' },
      { role: 'Sponsor', name: 'CPT. Czar Michael Pobre' },
      { role: 'Sponsor', name: 'Mrs. Dolores Mangulabnan' },
      { role: 'Sponsor', name: 'Mr. Isagani Ayson' },
      { role: 'Sponsor', name: 'Mrs. Olivia Layug Roxas' },
      { role: 'Sponsor', name: 'Mr. Joselito Layug Roxas' },
      { role: 'Sponsor', name: 'Mrs. Perfidia Layug Eusebio' },
      { role: 'Sponsor', name: 'Mr. Sherwin Santos' },
      { role: 'Sponsor', name: 'Mrs. Cheery Santos' },
      { role: 'Sponsor', name: 'Mr. Ramon Bautista' },
      { role: 'Sponsor', name: 'Mrs. Richel Bautista' },
      { role: 'Sponsor', name: 'Mr. Arnel Gonzales' },
      { role: 'Sponsor', name: 'Mrs. Renie Gonzales' },
      { role: 'Sponsor', name: 'Mr. Ian Ocampo' },
      { role: 'Sponsor', name: 'Mrs. Annaliza Ocampo' },
      { role: 'Sponsor', name: 'Mr. Mark Gonzales' },
      { role: 'Sponsor', name: 'Mrs. Janet Gonzales' },
      { role: 'Sponsor', name: 'Mr. Lito Balot' },
      { role: 'Sponsor', name: 'Mrs. Jona Balot' },
      { role: 'Sponsor', name: 'Mr. Eric Gamboa' },
      { role: 'Sponsor', name: 'Mrs. Maricel Gamboa' },
      { role: 'Sponsor', name: 'Mr. Aristotle Mallari' },
      { role: 'Sponsor', name: 'Mrs. Jheng Mallari' },
      { role: 'Sponsor', name: 'Mr. Kenneth Mallari' },
      { role: 'Sponsor', name: 'Mrs. Gina Mallari' },
      { role: 'Sponsor', name: 'Mr. Romulo Derit' },
      { role: 'Sponsor', name: 'Mrs. Rita Derit' },
      { role: 'Sponsor', name: 'Mr. Glenn Pasion' },
      { role: 'Sponsor', name: 'Mrs. Annie Mataga' },
      { role: 'Sponsor', name: 'Mr. Jay Alfonso' },
      { role: 'Sponsor', name: 'Mrs. Jasmin Canlas' },
      { role: 'Sponsor', name: 'Mr. Randy Sotto' },
      { role: 'Sponsor', name: 'Mrs. Joan Sotto' },
    ],
  },
  {
    category: 'Best Man',
    members: [
      { role: 'Best Man', name: 'Christiane Gonzales' },
    ],
  },
  {
    category: 'Groomsmen & Bridesmaids',
    members: [
      { role: 'Groomsman', name: 'Renz Joseph Chavez' },
      { role: 'Bridesmaid', name: 'Annika Gonzales' },
      { role: 'Groomsman', name: 'Kenneth Lam' },
      { role: 'Bridesmaid', name: 'Nina Gonzales' },
      { role: 'Groomsman', name: 'Chatur Wettasinghe' },
      { role: 'Bridesmaid', name: 'Aldane Pauline Gonzales' },
      { role: 'Groomsman', name: 'John Brozas' },
      { role: 'Bridesmaid', name: 'Norelle Laine Chavez' },
      { role: 'Groomsman', name: 'Anton Valdez' },
      { role: 'Bridesmaid', name: 'Elaine Capati' },
      { role: 'Groomsman', name: 'Lord Angel Capati' },
      { role: 'Bridesmaid', name: 'Madelo Viray' },
      { role: 'Groomsman', name: 'Pio Schuster' },
      { role: 'Bridesmaid', name: 'Jorgina Ele' },
      { role: 'Groomsman', name: 'Oliver Layug' },
      { role: 'Bridesmaid', name: 'Cristine Pasion' },
      { role: 'Groomsman', name: 'Dustine Mayos' },
      { role: 'Bridesmaid', name: 'Melaine Ordono' },
    ],
  },
  {
    category: 'Secondary Sponsors',
    showRoles: true,
    members: [
      { role: 'Candle', name: 'Aezel Jirah Ayson & Miko Carabio' },
      { role: 'Veil', name: 'Collene Keley & Josh Keley' },
      { role: 'Cord', name: 'Crizel Salvador & Kenneth Charles Salvador' },
    ],
  },
  {
    category: 'Maid of Honor',
    members: [
      { role: 'Maid of Honor', name: 'Jenzen Angela Mallari' },
    ],
  },
  {
    category: 'Bearers',
    showRoles: true,
    members: [
      { role: 'Ring Bearer', name: 'Elvin Gonzales' },
      { role: 'Coin Bearer', name: 'Rafael Demafeliz III' },
      { role: 'Bible Bearer', name: 'Drey Castiel Allpio' },
      { role: 'Banner Bearer', name: 'Ashton Valdez' },
    ],
  },
  {
    category: 'Flower Girls',
    members: [
      { role: 'Flower Girl', name: 'Quelyn Rhaine Mallari' },
      { role: 'Flower Girl', name: 'Jasmine Layug' },
      { role: 'Flower Girl', name: 'Madeleine Joy Ricarama' },
      { role: 'Flower Girl', name: 'Elisha Gonzales' },
    ],
  },
];

export const INITIAL_GUEST_WISHES: GuestWish[] = [
  {
    id: 'wish-1',
    name: 'Aunt Carmen & Uncle Bert',
    message: 'Your love is beautiful! May God fill your home with peace, joy, and understanding. We are so excited for your wedding!',
    attendance: 'attending',
    date: 'Yesterday',
  },
  {
    id: 'wish-2',
    name: 'Lucas Cruz (Best Man)',
    message: 'Bro, from high school days to walking down the aisle with Arlei, I am so proud of you both. Cheers to a lifetime of love and adventures!',
    attendance: 'attending',
    date: '2 days ago',
  },
  {
    id: 'wish-3',
    name: 'Isabella Santos',
    message: 'My dearest sister Arlei, you found your forever home in Kevin. Best wishes to my favorite couple!',
    attendance: 'attending',
    date: '3 days ago',
  },
];
