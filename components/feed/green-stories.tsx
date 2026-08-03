'use client';

/**
 * GreenStories — Module 3 horizontal story ring strip.
 *
 * Brand-gradient ring: emerald → teal → cyan.
 * Viewed stories show a grey ring.
 * Persists viewed state via feed store (hydration-safe via useHasMounted).
 *
 * Per pcs-tech-standards §10(a): reads persisted store, must gate behind hasMounted.
 */

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useFeedStore } from '@/store/feed-store';
import { MOCK_STORIES } from '@/lib/mock-data';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

interface StoryViewerProps {
  story: (typeof MOCK_STORIES)[number];
  isViewed: boolean;
  onView: () => void;
}

function StoryRing({ story, isViewed, onView }: StoryViewerProps) {
  return (
    <motion.button
      onClick={onView}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.enter }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Xem story của ${story.authorName}`}
    >
      {/* Ring container */}
      <div
        className="relative rounded-full p-[2.5px] transition-opacity duration-200"
        style={
          isViewed
            ? { background: '#cbd5e1' } // muted ring for viewed
            : {
                background:
                  'linear-gradient(135deg, #059669 0%, #10b981 40%, #22d3ee 100%)',
              }
        }
      >
        {/* Avatar */}
        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-card border-2 border-background">
          <Image
            src={story.authorAvatar}
            alt={story.authorName}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        </div>

        {/* Station icon badge */}
        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border border-background">
          <span className="text-[6px] text-white font-bold">♻</span>
        </div>
      </div>

      {/* Name */}
      <span
        className={`text-[9px] font-medium text-center max-w-[56px] leading-tight truncate ${
          isViewed ? 'text-muted-foreground' : 'text-foreground'
        }`}
      >
        {story.authorName}
      </span>
    </motion.button>
  );
}

export function GreenStories() {
  const hasMounted = useHasMounted();
  const { viewedStories, markStoryViewed } = useFeedStore();
  const [activeStory, setActiveStory] = useState<string | null>(null);

  function handleStoryClick(storyId: string) {
    markStoryViewed(storyId);
    setActiveStory(storyId);
    // Auto-dismiss after 3 seconds
    setTimeout(() => setActiveStory(null), 3000);
  }

  // Gate persisted "viewed" state behind hasMounted to prevent hydration mismatch
  const isViewed = (storyId: string): boolean => {
    if (!hasMounted) return false;
    return viewedStories.includes(storyId);
  };

  return (
    <>
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
          {/* "Tin của bạn" — add story CTA */}
          <motion.div
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION_TOKENS.durations.base }}
          >
            <div className="relative h-14 w-14 rounded-full border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
              <Plus className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground text-center max-w-[56px]">
              Tin của bạn
            </span>
          </motion.div>

          {/* Friend stories */}
          {MOCK_STORIES.map((story) => (
            <StoryRing
              key={story.id}
              story={story}
              isViewed={isViewed(story.id)}
              onView={() => handleStoryClick(story.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Story Viewer Overlay ── */}
      {activeStory && (() => {
        const story = MOCK_STORIES.find((s) => s.id === activeStory);
        if (!story) return null;
        return (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveStory(null)}
          >
            <div
              className="relative w-[85%] max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Story image */}
              <div className="relative w-full aspect-[9/16] bg-card">
                <Image
                  src={`https://picsum.photos/seed/story-${story.id}/400/700`}
                  alt={`Story của ${story.authorName}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

                {/* Author info */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-white">
                    <Image
                      src={story.authorAvatar}
                      alt={story.authorName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{story.authorName}</p>
                    <p className="text-white/80 text-[10px]">
                      ♻️ Check-in tại {story.stationName}
                    </p>
                  </div>
                </div>

                {/* Close hint */}
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-[10px]">
                  Chạm để đóng
                </p>
              </div>
            </div>
          </motion.div>
        );
      })()}
    </>
  );
}
