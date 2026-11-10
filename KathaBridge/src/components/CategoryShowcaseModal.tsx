import React from "react";
import { Story } from "../types";
import { Soundtrack } from "../services/soundtrackService";

export interface CategoryData {
  id: string;
  tag: string;
  title: string;
  desc: string;
  stat: string;
  icon: string;
  image: string;
  subTag: string;
  categoryKey: string;
}

interface Props {
  category: CategoryData;
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onFilterArchive: (categoryKey: string) => void;
  onClose: () => void;
}

export const CategoryShowcaseModal: React.FC<Props> = ({
  category,
  stories,
  onSelectStory,
  onFilterArchive,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Header with Artwork Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden border-b-2 border-brandBlack bg-brandBlack shrink-0">
          <img
            src={category.image}
            alt={category.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close category modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] z-20 cursor-pointer"
          >
            ✕
          </button>

          {/* Header Copy */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-brandPink text-white font-mono text-[10px] font-black px-2.5 py-0.5 rounded border border-brandBlack shadow-[2px_2px_0px_#080808] uppercase mb-1">
                <span>{category.icon}</span>
                <span>{category.tag}</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-4xl font-black text-white drop-shadow-md">
                {category.title}
              </h2>
            </div>
            <span className="hidden sm:inline-block bg-brandYellow text-brandBlack font-mono text-xs font-black px-3 py-1 rounded-full border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
              {category.stat}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Curatorial Description */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808]">
            <span className="font-mono text-xs font-black uppercase text-brandPink block mb-1">
              ✦ Curatorial Overview
            </span>
            <p className="text-brandBlack font-semibold text-sm leading-relaxed">
              {category.desc}
            </p>
          </div>

          {/* Curated Tales in this Category */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-black uppercase text-brandBlack tracking-wider">
                ★ Archived Stories &amp; Works ({stories.length})
              </span>
              <button
                onClick={() => {
                  Soundtrack.playClick();
                  onFilterArchive(category.categoryKey);
                  onClose();
                }}
                className="font-mono text-[11px] font-bold text-brandPink hover:underline cursor-pointer"
              >
                Filter Main Library →
              </button>
            </div>

            {stories.length === 0 ? (
              <div className="p-4 bg-white rounded-xl border border-neutral-300 text-xs font-mono text-neutral-500 text-center">
                Archival documentation in progress for this discipline. Browse related regional folklore below!
              </div>
            ) : (
              <div className="space-y-3">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 bg-white rounded-2xl border-2 border-brandBlack hover:border-brandPink transition shadow-[3px_3px_0px_#080808] flex items-center justify-between gap-4 cursor-pointer group"
                    onClick={() => {
                      Soundtrack.playModalPop();
                      onSelectStory(story);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={story.image}
                        alt={story.title.EN}
                        className="w-14 h-14 rounded-xl border border-brandBlack object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-brandBlack group-hover:text-brandPink transition">
                          {story.title.EN}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                          {story.summary.EN}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono bg-brandYellow px-1.5 py-0.5 rounded border border-brandBlack font-bold">
                            {story.readingDurationMinutes} MIN READ
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {story.originRegion}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="bg-brandPink text-white font-mono text-xs font-black px-3.5 py-2 rounded-full border-2 border-brandBlack shadow-[2px_2px_0px_#080808] group-hover:translate-x-1 transition shrink-0"
                    >
                      Read →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                Soundtrack.playClick();
                onFilterArchive(category.categoryKey);
                onClose();
              }}
              className="flex-1 bg-brandYellow hover:bg-yellow-300 text-brandBlack py-3 rounded-full font-mono text-xs font-black border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition text-center cursor-pointer"
            >
              Filter Library by {category.title} ↓
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-neutral-100 text-brandBlack py-3 px-6 rounded-full font-mono text-xs font-black border-2 border-brandBlack transition cursor-pointer"
            >
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

