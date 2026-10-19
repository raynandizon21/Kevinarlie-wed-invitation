import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { PALETTES, WEDDING_DETAILS, TIMELINE, ENTOURAGE_DATA } from './data/weddingData';
import { ColorPalette } from './types/wedding';
import { initRsvpSource, isRsvpQrLink, markRsvpSourceWeb } from './rsvpSource';
import { melodyPlayer } from './utils/audioSynth';
import { EnvelopeHero } from './components/EnvelopeHero';
import { InvitationMenuHub, MenuModalView } from './components/InvitationMenuHub';
import { DetailsPage, TimelinePage, EntouragePage, RsvpPage, FaqPage } from './components/SubPages';
import { EditDetailsModal } from './components/EditDetailsModal';
import { DesktopSite } from './components/DesktopSite';
import { MobileHero } from './components/MobileHero';

export type AppView = 'sobre' | 'hub' | 'rsvp' | 'details' | 'timeline' | 'faqs' | 'entourage';

// Reads an old-style hash link (e.g. #details) into a view; only used once on load
const parseHash = (): AppView | null => {
  const hash = window.location.hash.replace('#', '');
  if (['rsvp', 'details', 'timeline', 'faqs', 'entourage'].includes(hash)) return hash as AppView;
  if (hash === 'venues' || hash === 'palette') return 'details';
  if (hash === 'hub' || hash === 'menu') return 'hub';
  if (hash === 'sobre' || hash === '') return 'sobre';
  return null;
};

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

  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(PALETTES[0]);
  const [weddingData, setWeddingData] = useState(WEDDING_DETAILS);
  const [guestName, setGuestName] = useState<string>('Our Dear Guest');
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  // Mobile: hero intro shown over the cards right after the envelope opens
  const [showMobileHero, setShowMobileHero] = useState<boolean>(false);

  // Remember whether this visit is a guest (web) or a principal sponsor (QR link)
  useEffect(() => {
    initRsvpSource();
  }, []);

  // Sync browser back/forward
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const view = (e.state as { view?: AppView } | null)?.view;
      if (view) setActiveView(view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Mobile: start every page at the top (the desktop site scrolls to its own sections)
  useEffect(() => {
    if (!isDesktop) window.scrollTo(0, 0);
  }, [activeView, isDesktop]);

  const showDesktopSite = isDesktop && activeView !== 'sobre';

  // 1. Open Envelope -> Redirects to 2nd Image Invitation Menu Hub
  const handleOpenAndRedirectToHub = () => {
    if (!isMusicPlaying) {
      melodyPlayer.start();
      setIsMusicPlaying(true);
    }
    goTo(viewAfterEnvelope);
    setActiveView(viewAfterEnvelope);
    if (viewAfterEnvelope === 'hub') setShowMobileHero(true);
  };

  // 2. Select a specific card from the Menu -> Opens that page
  const handleSelectView = (view: MenuModalView) => {
    const targetView: AppView = view === 'palette' || view === 'venues' ? 'details' : view;
    if (targetView === 'rsvp') markRsvpSourceWeb();
    goTo(targetView);
    setActiveView(targetView);
  };

  // 3. Return to Menu Hub
  const handleReturnToHub = useCallback(() => {
    goTo('hub');
    setActiveView('hub');
  }, []);

  // 4. Return to Envelope
  const handleReturnToEnvelope = () => {
    goTo('sobre');
    setActiveView('sobre');
  };

  // Music toggle
  const handleToggleMusic = () => {
    const playing = melodyPlayer.toggle();
    setIsMusicPlaying(playing);
  };

  // Save customized details
  const handleSaveDetails = (updated: {
    groom: string;
    bride: string;
    displayDate: string;
    churchName: string;
    receptionName: string;
    guestName: string;
  }) => {
    setWeddingData((prev) => ({
      ...prev,
      groom: updated.groom,
      bride: updated.bride,
      displayDate: updated.displayDate,
      churchName: updated.churchName,
      receptionName: updated.receptionName,
    }));
    setGuestName(updated.guestName);
  };

  // Lock body scroll on mobile for envelope and menu hub views
  useEffect(() => {
    if (activeView === 'sobre' || (activeView === 'hub' && !isDesktop)) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeView, isDesktop]);

  return (
    <div
      className={
        activeView === 'sobre' || (activeView === 'hub' && !isDesktop)
          ? 'fixed inset-0 h-[100dvh] w-full overflow-hidden text-[#102F27] selection:bg-[#78947F]/20 selection:text-[#185844]'
          : 'min-h-screen text-[#102F27] selection:bg-[#78947F]/20 selection:text-[#185844] transition-colors duration-500 bg-[#F2EBDD]'
      }
      style={{ backgroundColor: activeView === 'sobre' ? undefined : currentPalette.bgTint }}
    >
      {/* =========================================================================
          VIEW 1: ENVELOPE FIRST (only the envelope until tapped)
          ========================================================================= */}
      {activeView === 'sobre' && (
        <EnvelopeHero
          palette={currentPalette}
          onOpenAndRedirect={handleOpenAndRedirectToHub}
          groom={weddingData.groom}
          bride={weddingData.bride}
          displayDate={weddingData.displayDate}
          churchName={weddingData.churchName}
          guestName={guestName}
          onToggleMusic={handleToggleMusic}
          isMusicPlaying={isMusicPlaying}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* =========================================================================
          VIEW 2: 2ND IMAGE DIGITAL WEDDING INVITATION MENU HUB (NO NAVBAR!)
          ========================================================================= */}
      {/* =========================================================================
          DESKTOP WEBSITE (lg+): one long page; the hash picks the section
          ========================================================================= */}
      {showDesktopSite && (
        <DesktopSite
          section={activeView === 'hub' || activeView === 'faqs' ? 'top' : (activeView as 'details' | 'timeline' | 'entourage' | 'rsvp')}
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
          entourage={ENTOURAGE_DATA}
        />
      )}

      <AnimatePresence>
        {!isDesktop && activeView === 'hub' && showMobileHero && (
          <MobileHero
            groomName={weddingData.groomNickname || weddingData.groom.split(' ')[0]}
            brideName={weddingData.brideNickname || weddingData.bride.split(' ')[0]}
            onContinue={() => setShowMobileHero(false)}
          />
        )}
      </AnimatePresence>

      {/* Cards mount once the hero is dismissed, so their entrance plays as the hero slides away */}
      {!isDesktop && activeView === 'hub' && !showMobileHero && (
        <InvitationMenuHub
          palette={currentPalette}
          groom={weddingData.groom}
          bride={weddingData.bride}
          groomNickname={weddingData.groomNickname}
          brideNickname={weddingData.brideNickname}
          displayDate={weddingData.displayDate}
          churchName={weddingData.churchName}
          receptionName={weddingData.receptionName}
          rsvpDeadline={weddingData.rsvpDeadline}
          onOpenView={handleSelectView}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* =========================================================================
          SUB-PAGES (template from wedding-invitation: sticky Back + centered column)
          ========================================================================= */}
      {!isDesktop && (
        <>
        {activeView === 'details' && (
          <DetailsPage
            onBack={handleReturnToHub}
            ceremonyTime={weddingData.ceremonyTime}
            churchName={weddingData.churchName}
            churchAddress={weddingData.churchAddress}
            receptionName={weddingData.receptionName}
            receptionAddress={weddingData.receptionAddress}
            mapsChurchUrl={weddingData.mapsChurchUrl}
            mapsReceptionUrl={weddingData.mapsReceptionUrl}
          />
        )}
        {activeView === 'timeline' && <TimelinePage
            onBack={handleReturnToHub}
            timeline={TIMELINE}
            coupleLine={`${weddingData.groomNickname || weddingData.groom.split(' ')[0]} & ${
              weddingData.brideNickname || weddingData.bride.split(' ')[0]
            } , ${new Date(weddingData.weddingDate)
              .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
              .replace(/\//g, '.')}`}
          />}
        {activeView === 'entourage' && <EntouragePage onBack={handleReturnToHub} categories={ENTOURAGE_DATA} />}
        {activeView === 'rsvp' && (
          <RsvpPage onBack={handleReturnToHub} rsvpDeadline={weddingData.rsvpDeadline} />
        )}
        {activeView === 'faqs' && <FaqPage onBack={handleReturnToHub} />}
        </>
      )}

      {/* Edit Details Modal */}
      <EditDetailsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        groom={weddingData.groom}
        bride={weddingData.bride}
        displayDate={weddingData.displayDate}
        churchName={weddingData.churchName}
        receptionName={weddingData.receptionName}
        guestName={guestName}
        onSave={handleSaveDetails}
      />
    </div>
  );
}
