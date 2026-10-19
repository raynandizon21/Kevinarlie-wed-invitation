export interface ColorSwatch {
  name: string;
  tagalogName: string;
  hex: string;
  role: string;
  attireGuide: string;
}

export interface ColorPalette {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  colors: ColorSwatch[];
  bgTint: string;
  primaryHex: string;
  accentHex: string;
}

export interface TimelineItem {
  time: string;
  title: string;
  location: string;
  description: string;
  icon: 'rings' | 'camera' | 'dinner' | 'cake' | 'dance' | 'buffet' | 'fireworks' | 'carriage' | 'church' | 'cocktail' | 'party';
}

export interface EntourageMember {
  role: string;
  name: string;
}

export interface EntourageCategory {
  category: string;
  members: EntourageMember[];
}

export interface GuestWish {
  id: string;
  name: string;
  message: string;
  attendance: 'attending' | 'regret';
  date: string;
}
