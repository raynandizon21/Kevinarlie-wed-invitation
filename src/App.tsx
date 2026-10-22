import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PALETTES, WEDDING_DETAILS, TIMELINE, ENTOURAGE_DATA } from './data/weddingData';
import { ColorPalette } from './types/wedding';
import { initRsvpSource, isRsvpQrLink } from './rsvpSource';
import { melodyPlayer } from './utils/audioSynth';
import { EnvelopeHero } from './components/EnvelopeHero';
import { DetailsPage, TimelinePage, EntouragePage, RsvpPage, FaqPage } from './components/SubPages';
import { EditDetailsModal } from './components/EditDetailsModal';
import { DesktopSite } from './components/DesktopSite';
import { MobileHero } from './components/MobileHero';
import { PhotoPage, STORY_PHOTOS, ThanksPage } from './components/GalleryPages';
import { NextCue, StoryKind, StoryMotion, StorySlide, storyTransition, storyVariants } from './components/StorySlide';

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

// Mobile story order after the hero ('hub'); swipe up / Next moves along it
// A full-screen photo after Details, Timeline and Entourage; the closing thank-you comes after the RSVP
const STORY: AppView[] = ['hub', 'details', 'photo1', 'timeline', 'photo2', 'entourage', 'photo3', 'faqs', 'rsvp', 'thanks'];
const PHOTO_VIEWS: AppView[] = ['photo1', 'photo2', 'photo3'];
const isPhotoView = (view: AppView) => PHOTO_VIEWS.includes(view);
const STORY_LABEL: Partial<Record<AppView, string>> = {
  details: 'Details',
  timeline: 'Timeline',
  entourage: 'Entourage',
  faqs: 'FAQs',
  rsvp: 'RSVP',
  thanks: 'Thank you',
  photo1: 'Our story',
  photo2: 'Our story',
  photo3: 'Our story',
};
// Transition into each page (played backwards when going back), so every step feels different
const STORY_KIND: Partial<Record<AppView, StoryKind>> = {
  details: 'rise', // the hero lifts away like a curtain
  photo1: 'zoom', // each photo fades in with a soft zoom
  photo2: 'zoom',
  photo3: 'zoom',
  timeline: 'wipe', // ivory page wipes up over the photo
  entourage: 'push', // page turn from the right
  faqs: 'circle', // grows from the bottom
  rsvp: 'wipe', // the candlelit backdrop wipes up over the page
  thanks: 'rise',
};
const storyIndex = (view: AppView) => STORY.indexOf(view);
// Top color of each story page. Phone browsers (iPhone Safari) tint the status bar and toolbar from the
// page background, so it is updated on every step; otherwise the forest Entourage tint stays behind.
const STORY_BAR_COLOR: Partial<Record<AppView, string>> = {
  hub: '#F2EBDD',
  details: '#F2EBDD',
  timeline: '#F2EBDD',
  entourage: '#102F27',
  faqs: '#F2EBDD',
  rsvp: '#102F27',
  photo1: '#F2EBDD',
  photo2: '#78947F',
  photo3: '#102F27',
  thanks: '#F2EBDD',
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
  // Mobile story transition: direction (+1 forward, -1 back, 0 none) and which effect to play
  const [storyMotion, setStoryMotion] = useState<StoryMotion>({ dir: 0, kind: 'none' });
  // The effect belongs to the later page of the two, so going back replays it in reverse
  const moveStory = (from: AppView, to: AppView) => {
    const a = storyIndex(from);
    const b = storyIndex(to);
    if (a < 0 || b < 0 || a === b) return setStoryMotion({ dir: 0, kind: 'none' });
    setStoryMotion({ dir: Math.sign(b - a), kind: STORY_KIND[STORY[Math.max(a, b)]] ?? 'rise' });
  };
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;

  // Remember whether this visit is a guest (web) or a principal sponsor (QR link)
  useEffect(() => {
    initRsvpSource();
  }, []);

  // Sync browser back/forward
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const view = (e.state as { view?: AppView } | null)?.view;
      if (!view) return;
      moveStory(activeViewRef.current, view);
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
    setStoryMotion({ dir: 0, kind: 'none' });
    goTo(viewAfterEnvelope);
    setActiveView(viewAfterEnvelope);
  };

  // 2. Mobile story: step to the next / previous page
  const stepStory = useCallback((step: 1 | -1) => {
    const next = STORY[storyIndex(activeViewRef.current) + step];
    if (!next) return;
    moveStory(activeViewRef.current, next);
    goTo(next);
    setActiveView(next);
  }, []);
  const storyNext = useCallback(() => stepStory(1), [stepStory]);
  const storyPrev = useCallback(() => stepStory(-1), [stepStory]);
  const nextLabel = STORY_LABEL[STORY[storyIndex(activeView) + 1]];

  // Jump to any story page (closing "Back to the beginning")
  const jumpTo = useCallback((view: AppView) => {
    moveStory(activeViewRef.current, view);
    goTo(view);
    setActiveView(view);
  }, []);
  // Right after an RSVP the closing note shows, then returns to the hero on its own
  const [afterRsvp, setAfterRsvp] = useState(false);
  const handleRsvpDone = useCallback(() => {
    setAfterRsvp(true);
    jumpTo('thanks');
  }, [jumpTo]);
  useEffect(() => {
    if (activeView !== 'thanks') setAfterRsvp(false);
  }, [activeView]);
  const restartStory = useCallback(() => {
    setAfterRsvp(false);
    jumpTo('hub');
  }, [jumpTo]);

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

  // Browser bars follow the current story page (cleared on desktop and the envelope)
  useEffect(() => {
    const color = !isDesktop ? STORY_BAR_COLOR[activeView] : undefined;
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

  // Lock body scroll for the envelope and the whole mobile story (each story page scrolls by itself)
  const fixedScreen = activeView === 'sobre' || !isDesktop;
  useEffect(() => {
    if (fixedScreen) {
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
          section={activeView === 'hub' || isPhotoView(activeView) || activeView === 'thanks' ? 'top' : (activeView as 'details' | 'timeline' | 'entourage' | 'faqs' | 'rsvp')}
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
          MOBILE STORY: hero, then one full-screen page after another
          (Details -> Timeline -> Entourage -> FAQs -> RSVP), each step with its own transition
          ========================================================================= */}
      {!isDesktop && (
        <AnimatePresence initial={false} custom={storyMotion}>
          {activeView === 'hub' && (
            <motion.div
              key="hub"
              custom={storyMotion}
              variants={storyVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={storyTransition}
              className="fixed inset-x-0 top-0 h-[100lvh]"
            >
              <MobileHero
                groomName={weddingData.groomNickname || weddingData.groom.split(' ')[0]}
                brideName={weddingData.brideNickname || weddingData.bride.split(' ')[0]}
                displayDate={weddingData.displayDate}
                time={weddingData.ceremonyTime}
                onContinue={storyNext}
              />
            </motion.div>
          )}
          {activeView === 'details' && (
            <StorySlide key="details" motion={storyMotion} onNext={storyNext} onPrev={storyPrev} nextLabel={nextLabel}>
              <DetailsPage
                onBack={storyPrev}
                ceremonyTime={weddingData.ceremonyTime}
                churchName={weddingData.churchName}
                churchAddress={weddingData.churchAddress}
                receptionName={weddingData.receptionName}
                receptionAddress={weddingData.receptionAddress}
                mapsChurchUrl={weddingData.mapsChurchUrl}
                mapsReceptionUrl={weddingData.mapsReceptionUrl}
              />
            </StorySlide>
          )}
          {activeView === 'timeline' && (
            // The timeline fits one screen, so its Next cue sits inside the page
            <StorySlide key="timeline" motion={storyMotion} onNext={storyNext} onPrev={storyPrev}>
              <TimelinePage
                onBack={storyPrev}
                timeline={TIMELINE}
                coupleLine={timelineCoupleLine}
                footer={nextLabel && <NextCue label={nextLabel} onNext={storyNext} className="mt-[1.5dvh]" />}
              />
            </StorySlide>
          )}
          {activeView === 'entourage' && (
            <StorySlide key="entourage" motion={storyMotion} onNext={storyNext} onPrev={storyPrev} nextLabel={nextLabel} tone="forest">
              <EntouragePage onBack={storyPrev} categories={ENTOURAGE_DATA} />
            </StorySlide>
          )}
          {isPhotoView(activeView) && (
            // One full-screen photo between pages; it draws its own Next cue
            <StorySlide
              key={activeView}
              motion={storyMotion}
              onNext={storyNext}
              onPrev={storyPrev}
              tone={STORY_PHOTOS[PHOTO_VIEWS.indexOf(activeView)]?.layout ?? 'forest'}
            >
              <PhotoPage
                photo={PHOTO_VIEWS.indexOf(activeView)}
                onBack={storyPrev}
                onNext={storyNext}
                nextLabel={nextLabel}
                groomName={weddingData.groomNickname || weddingData.groom.split(' ')[0]}
                brideName={weddingData.brideNickname || weddingData.bride.split(' ')[0]}
              />
            </StorySlide>
          )}
          {activeView === 'faqs' && (
            <StorySlide key="faqs" motion={storyMotion} onNext={storyNext} onPrev={storyPrev} nextLabel={nextLabel}>
              <FaqPage onBack={storyPrev} />
            </StorySlide>
          )}
          {activeView === 'rsvp' && (
            // No Next here: the thank-you page only opens after a submit
            <StorySlide key="rsvp" motion={storyMotion} onPrev={storyPrev} tone="forest">
              <RsvpPage onBack={storyPrev} onDone={handleRsvpDone} rsvpDeadline={weddingData.rsvpDeadline} />
            </StorySlide>
          )}
          {activeView === 'thanks' && (
            // Shown once after a submit; the only way on is "Back to the beginning"
            <StorySlide key="thanks" motion={storyMotion}>
              <ThanksPage
                onRestart={restartStory}
                groomName={weddingData.groomNickname || weddingData.groom.split(' ')[0]}
                brideName={weddingData.brideNickname || weddingData.bride.split(' ')[0]}
                displayDate={weddingData.displayDate}
                autoReturn={afterRsvp}
              />
            </StorySlide>
          )}
        </AnimatePresence>
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
