import React, { useEffect, useCallback, useState, useRef, useMemo } from "react";
import keyboardjs from "keyboardjs";
import SliderNav from "./SliderNav";
import ShareExpanded from "./ShareExpanded";
import useScreenSize from "../../hooks/useScreenSize";

const Toolbar = ({
  flipbookRef,
  containerRef,
  screenfull,
  pdfDetails,
  viewerStates,
  pdfDocument,
  // Zoom props from parent
  zoomLevel = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const { width: screenWidth } = useScreenSize();
  const [shareExpanded, setShareExpanded] = useState(false);
  const shareButtonRef = useRef(null);
  const pagesInFlipView = viewerStates.currentPageIndex + 1;

  // Full screen >>>>>>>>>
  const fullScreen = useCallback(() => {
    if (screenfull.isEnabled) {
      screenfull.toggle(containerRef.current, { navigationUI: "hide" });
    }
    screenfull.on("error", (event) => {
      alert("Failed to enable fullscreen", event);
    });
  }, [screenfull, containerRef]);

  // Zoom handlers (delegated) >>>>>>>>
  const handleZoomIn = useCallback(() => {
    onZoomIn?.();
  }, [onZoomIn]);

  const handleZoomOut = useCallback(() => {
    onZoomOut?.();
  }, [onZoomOut]);

  const handleRefresh = useCallback(() => {
    onResetZoom?.();
    flipbookRef.current?.pageFlip()?.turnToPage(0);
  }, [flipbookRef, onResetZoom]);

  const handleShareToggle = useCallback(() => {
    setShareExpanded((prev) => !prev);
  }, []);

  // Keyboard shortcuts >>>>>>>>>
  useEffect(() => {
    const handleRight = () => flipbookRef.current?.pageFlip()?.flipNext();
    const handleLeft = () => flipbookRef.current?.pageFlip()?.flipPrev();

    keyboardjs.bind("right", null, handleRight);
    keyboardjs.bind("left", null, handleLeft);

    return () => {
      keyboardjs.unbind("right", null, handleRight);
      keyboardjs.unbind("left", null, handleLeft);
    };
  }, [flipbookRef, fullScreen]);

  const btnBase = useMemo(
    () =>
      [
        "h-8 w-8 sm:h-8 sm:w-9 min-w-9 sm:min-w-9",
        "rounded-lg flex items-center justify-center",
        "text-white/80 hover:text-white",
        "bg-transparent hover:bg-white/10",
        "disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed",
        "transition-colors",
      ].join(" "),
    []
  );

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-visible relative z-30">
      <div className="px-2 sm:px-3 py-2">
        <SliderNav
          flipbookRef={flipbookRef}
          pdfDetails={pdfDetails}
          viewerStates={viewerStates}
          screenWidth={screenWidth}
          pdfDocument={pdfDocument}
        />
      </div>

      <div className="px-2 sm:px-3 pb-3">
        <div className="flex items-center gap-1 sm:gap-2 max-xl:pt-1 flex-wrap justify-center">
          <div className="hidden lg:block flex-1"></div>

        <button
          onClick={() => {
            screenWidth < 768
              ? flipbookRef.current?.pageFlip()?.turnToPrevPage()
              : flipbookRef.current?.pageFlip()?.flipPrev();
          }}
          disabled={viewerStates.currentPageIndex === 0}
          className={btnBase}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            screenWidth < 768
              ? flipbookRef.current?.pageFlip()?.turnToNextPage()
              : flipbookRef.current?.pageFlip()?.flipNext();
          }}
          disabled={
            viewerStates.currentPageIndex === pdfDetails?.totalPages - 1 ||
            viewerStates.currentPageIndex === pdfDetails?.totalPages - 2
          }
          className={btnBase}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          className={btnBase}
          title="Zoom Out"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          className={btnBase}
          title="Zoom In"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </button>
        <button
          onClick={handleRefresh}
          className={btnBase}
          title="Refresh"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <div ref={shareButtonRef} className="relative">
          <button
            onClick={handleShareToggle}
            className={btnBase}
            title="Share"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
          <ShareExpanded
            isOpen={shareExpanded}
            onClose={() => setShareExpanded(false)}
            parentRef={shareButtonRef}
          />
        </div>
        <button
          onClick={fullScreen}
          className={btnBase}
        >
          {screenfull.isEnabled && screenfull.isFullscreen ? (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0"></div>
        {pdfDetails?.totalPages > 0 && (
          <p className='text-xs sm:text-sm font-medium text-white whitespace-nowrap'>
            {pagesInFlipView} of {pdfDetails?.totalPages}
          </p>
        )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
