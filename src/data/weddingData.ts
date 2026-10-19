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
    question: 'What is the dress code?',
    answer: 'Formal or semi-formal. We kindly ask guests to follow our color palette (Sage, Emerald, Forest, and Antique Gold). Please avoid white and ivory, which are reserved for the bride.',
  },
  {
    question: 'Can I bring a plus-one?',
    answer: 'Due to our seating arrangement and venue capacity, the invitation is limited to the number of seats stated on your RSVP.',
  },
  {
    question: 'Are kids allowed?',
    answer: 'We want an intimate celebration where parents can relax, so only children who are part of the entourage are invited.',
  },
  {
    question: 'Is there free parking at Jardin de Josefina?',
    answer: 'Yes, there is a spacious and secure parking area at the venue for all guests.',
  },
  {
    question: 'What time should I arrive?',
    answer: 'Please arrive between 1:45 PM and 2:00 PM so you can be seated before the ceremony begins at 2:30 PM.',
  },
  {
    question: 'What is the "Unplugged Ceremony" policy?',
    answer: 'We kindly ask everyone to put their phones away during the ceremony so it stays intimate and our photographers and videographers have a clear view.',
  },
  {
    question: 'Do you have a gift guide?',
    answer: 'Your presence and prayers are the greatest gift. If you wish to give something, a monetary gift for our new beginning would be sincerely appreciated.',
  },
];

export const WEDDING_DETAILS = {
  groom: 'Kevin',
  groomNickname: 'Kevin',
  bride: 'Arlei',
  brideNickname: 'Arlei',
  weddingDate: '2025-12-14T14:30:00+08:00',
  displayDate: 'Sunday, December 14, 2025',
  ceremonyTime: '2:30 PM',
  churchName: 'Jardin de Josefina',
  churchAddress: 'Jardin de Josefina, Bulacan, Philippines',
  receptionName: 'Jardin de Josefina Glasshouse & Pavilion',
  receptionAddress: 'Jardin de Josefina, Bulacan, Philippines',
  wazeChurchUrl: 'https://waze.com/ul?q=Jardin+de+Josefina',
  mapsChurchUrl: 'https://maps.google.com/?q=Jardin+de+Josefina',
  mapsReceptionUrl: 'https://maps.google.com/?q=Jardin+de+Josefina',
  bibleVerse: '"Above all, love each other deeply, because love covers over a multitude of sins." — 1 Peter 4:8',
  rsvpDeadline: 'November 20, 2025',
};

export const TIMELINE: TimelineItem[] = [
  {
    time: '2:00 PM',
    title: 'Wedding Ceremony',
    location: '',
    description: '',
    icon: 'rings',
  },
  {
    time: '3:00 PM',
    title: 'Photos',
    location: '',
    description: '',
    icon: 'camera',
  },
  {
    time: '4:00 PM',
    title: 'Dinner & Toasts',
    location: '',
    description: '',
    icon: 'dinner',
  },
  {
    time: '6:00 PM',
    title: 'Cake Cutting',
    location: '',
    description: '',
    icon: 'cake',
  },
  {
    time: '7:00 PM',
    title: 'First Dance',
    location: '',
    description: '',
    icon: 'dance',
  },
  {
    time: '8:30 PM',
    title: 'Buffet',
    location: '',
    description: '',
    icon: 'buffet',
  },
  {
    time: '10:00 PM',
    title: 'Fireworks',
    location: '',
    description: '',
    icon: 'fireworks',
  },
  {
    time: '12:00 AM',
    title: 'Carriages',
    location: '',
    description: '',
    icon: 'carriage',
  },
];

export const ENTOURAGE_DATA: EntourageCategory[] = [
  {
    category: 'Parents',
    members: [
      { role: 'Parents of the Groom', name: 'Mr. Roberto & Mrs. Carmen Cruz' },
      { role: 'Parents of the Bride', name: 'Mr. Eduardo & Mrs. Maria Luisa Santos' },
    ],
  },
  {
    category: 'Principal Sponsors',
    members: [
      { role: 'Sponsor', name: 'Atty. Victorio Alcantara' },
      { role: 'Sponsor', name: 'Dr. Elizabeth Reyes-Valdez' },
      { role: 'Sponsor', name: 'Engr. Danilo Mendoza' },
      { role: 'Sponsor', name: 'Mrs. Corazon De Silva' },
      { role: 'Sponsor', name: 'Hon. Manuel Roxas Jr.' },
      { role: 'Sponsor', name: 'Mrs. Theresa Gutierrez' },
    ],
  },
  {
    category: 'Best Man & Maid of Honor',
    members: [
      { role: 'Best Man', name: 'Lucas Alejandro Cruz' },
      { role: 'Maid of Honor', name: 'Isabella Patricia Santos' },
    ],
  },
  {
    category: 'Groomsmen & Bridesmaids',
    members: [
      { role: 'Groomsman', name: 'Rafael Mercado' },
      { role: 'Bridesmaid', name: 'Camille Villanueva' },
      { role: 'Groomsman', name: 'Adrian Del Rosario' },
      { role: 'Bridesmaid', name: 'Klarisse Hernandez' },
      { role: 'Groomsman', name: 'Julian Paolo Ramos' },
      { role: 'Bridesmaid', name: 'Beatrice Angela Lim' },
    ],
  },
  {
    category: 'Secondary Sponsors',
    members: [
      { role: 'Candle', name: 'Marco Antonio & Katrina Belleza' },
      { role: 'Veil', name: 'Dominic Tan & Stephanie Garcia' },
      { role: 'Cord', name: 'Carlo Miguel & Patricia Navarro' },
    ],
  },
  {
    category: 'Bearers & Flower Girls',
    members: [
      { role: 'Ring Bearer', name: 'Baby Ethan Cruz' },
      { role: 'Coin Bearer', name: 'Nathaniel Santos' },
      { role: 'Bible Bearer', name: 'Gabriel Angelo Lim' },
      { role: 'Flower Girl', name: 'Amara Celestine Ramos' },
      { role: 'Flower Girl', name: 'Maya Isabela Garcia' },
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
