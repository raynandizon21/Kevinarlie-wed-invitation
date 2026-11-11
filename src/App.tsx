import { useState, useEffect } from 'react';
import { PALETTES, WEDDING_DETAILS, TIMELINE, ENTOURAGE_DATA } from './data/weddingData';
import { initRsvpSource, isRsvpQrLink } from './rsvpSource';
import { melodyPlayer } from './utils/audioSynth';
import { EnvelopeHero } from './components/EnvelopeHero';
import { DesktopSite } from './components/DesktopSite';
import { MobileSite, MobileSection } from './components/MobileSite';

export type AppView = 'sobre' | 'hub' | 'rsvp' | 'details' | 'timeline' | 'faqs' | 'entourage' | 'photo1' | 'photo2' | 'photo3' | 'thanks';

// Reads an old-style hash link (e.g. #details) into a view; only used once on load
const parseHash = (): AppView | null => {
  const hash = window.location.hash.replace('#', '');
  if (['rsvp', 'details', 'timeline', 'faqs', 'entourage'].includes(hash)) return hash as AppView;
  if (hash === 'venues' || hash === 'palette') return 'details';
  if (hash === 'hub' || hash === 'menu') return 'hub';
  if (hash === 'sobre' || hash === '') return 'sobre';
  return null;
};

// Which section a view opens on (both the phone page and the desktop site are one long page)
const PAGE_SECTIONS = ['details', 'timeline', 'entourage', 'faqs', 'rsvp'] as const;
const mobileSection = (view: AppView): MobileSection =>
  (PAGE_SECTIONS as readonly string[]).includes(view) ? (view as MobileSection) : 'top';

// The URL stays clean (no #...): the current view lives in history.state so Back/Forward still work
const cleanUrl = () => `${window.location.pathname}${window.location.search}`;
const goTo = (view: AppView) => history.pushState({ view }, '', cleanUrl());

// Desktop (lg+) gets the full website layout instead of the phone-style menu & pages
const DESKTOP_QUERY = '(min-width: 1024px)';
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

export default function App() {
  const isDesktop = useIsDesktop();

  // Navigation View State
  // Every visit starts at the envelope (except the sponsor QR link, which opens RSVP directly).
  // A page named in the link (e.g. #details) is remembered and opened right after the envelope.
  const [activeView, setActiveView] = useState<AppView>(() =>
    typeof window !== 'undefined' && isRsvpQrLink() ? 'rsvp' : 'sobre'
  );
  const [viewAfterEnvelope] = useState<AppView>(() => {
    if (typeof window === 'undefined') return 'hub';
    const linked = parseHash();
    return linked && linked !== 'sobre' ? linked : 'hub';
  });

  useEffect(() => {
    history.replaceState({ view: activeView }, '', cleanUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPalette = PALETTES[0];
  const weddingData = WEDDING_DETAILS;
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  // Remember whether this visit is a guest (web) or a principal sponsor (QR link)
  useEffect(() => {
    initRsvpSource();
  }, []);

  // Sync browser back/forward
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const view = (e.state as { view?: AppView } | null)?.view;
      if (!view) return;
      setActiveView(view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showDesktopSite = isDesktop && activeView !== 'sobre';
  // "Kevin & Arlei , 02.02.2027" under the timeline title (mobile page and desktop section)
  const timelineCoupleLine = `${weddingData.groomNickname || weddingData.groom.split(' ')[0]} & ${
    weddingData.brideNickname || weddingData.bride.split(' ')[0]
  } , ${new Date(weddingData.weddingDate)
    .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    .replace(/\//g, '.')}`;

  // 1. Open Envelope -> hero (mobile) / website (desktop), or the page named in the link
  const handleOpenAndRedirectToHub = () => {
    if (!isMusicPlaying) {
      melodyPlayer.start();
      setIsMusicPlaying(true);
    }
    goTo(viewAfterEnvelope);
    setActiveView(viewAfterEnvelope);
  };

  // Phone browser bars: forest, matching the hero's faded photo edges (cleared on desktop and the envelope)
  useEffect(() => {
    const color = !isDesktop && activeView !== 'sobre' ? '#102F27' : undefined;
    document.documentElement.style.backgroundColor = color ?? '';
    document.body.style.backgroundColor = color ?? '';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (color) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = color;
    } else {
      meta?.remove();
    }
  }, [activeView, isDesktop]);

  // Lock body scroll only for the envelope; after it, phone and desktop both scroll one long page
  const fixedScreen = activeView === 'sobre';
  useEffect(() => {
    document.body.style.overflow = fixedScreen ? 'hidden' : '';
    document.documentElement.style.overflow = fixedScreen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [fixedScreen]);

  return (
    <div
      className={
        fixedScreen
          ? 'fixed inset-x-0 top-0 h-[100lvh] w-full overflow-hidden text-[#102F27] selection:bg-[#78947F]/20 selection:text-[#185844]'
          : 'min-h-screen text-[#102F27] selection:bg-[#78947F]/20 selection:text-[#185844] transition-colors duration-500 bg-[#F2EBDD]'
      }
      style={{ backgroundColor: activeView === 'sobre' ? undefined : currentPalette.bgTint }}
    >
      {/* =========================================================================
          VIEW 1: ENVELOPE FIRST (only the envelope until tapped)
          ========================================================================= */}
      {activeView === 'sobre' && (
        <EnvelopeHero onOpenAndRedirect={handleOpenAndRedirectToHub} />
      )}

      {/* =========================================================================
          DESKTOP WEBSITE (lg+): one long page; the hash picks the section
          ========================================================================= */}
      {showDesktopSite && (
        <DesktopSite
          section={mobileSection(activeView)}
          groomName={weddingData.groomNickname || weddingData.groom.split(' ')[0]}
          brideName={weddingData.brideNickname || weddingData.bride.split(' ')[0]}
          displayDate={weddingData.displayDate}
          ceremonyTime={weddingData.ceremonyTime}
          churchName={weddingData.churchName}
          churchAddress={weddingData.churchAddress}
          receptionName={weddingData.receptionName}
          receptionAddress={weddingData.receptionAddress}
          mapsChurchUrl={weddingData.mapsChurchUrl}
          mapsReceptionUrl={weddingData.mapsReceptionUrl}
          rsvpDeadline={weddingData.rsvpDeadline}
          timeline={TIMELINE}
          timelineCoupleLine={timelineCoupleLine}
          entourage={ENTOURAGE_DATA}
        />
      )}

      {/* =========================================================================
          PHONE: one long page the guest scrolls down (no prev/next)
          ========================================================================= */}
      {!isDesktop && activeView !== 'sobre' && (
        <MobileSite
          section={mobileSection(activeView)}
          groomName={weddingData.groomNickname || weddingData.groom.split(' ')[0]}
          brideName={weddingData.brideNickname || weddingData.bride.split(' ')[0]}
          weddingDate={weddingData.weddingDate}
          ceremonyTime={weddingData.ceremonyTime}
          churchName={weddingData.churchName}
          churchAddress={weddingData.churchAddress}
          receptionName={weddingData.receptionName}
          receptionAddress={weddingData.receptionAddress}
          mapsChurchUrl={weddingData.mapsChurchUrl}
          mapsReceptionUrl={weddingData.mapsReceptionUrl}
          rsvpDeadline={weddingData.rsvpDeadline}
          timeline={TIMELINE}
          entourage={ENTOURAGE_DATA}
        />
      )}
    </div>
  );
}
