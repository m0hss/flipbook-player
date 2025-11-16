import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
// Use the matching pdfjs worker that ships with the installed pdfjs-dist version.
// Vite will bundle this and give us a URL at build time.
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import PdfLoading from "../Components/PdfLoading";
import Toolbar from "../Components/Toolbar/Toolbar";
import screenfull from "screenfull";
import "./styles.css";
import useScreenSize from "../hooks/useScreenSize";
import LeftLibrary from "../Components/LeftLibrary";
import { getPdfLibrary } from "../assets/pdfs";

// Point pdf.js to the correct worker script URL produced by Vite.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const PageContent = React.forwardRef(
  ({ pageNumber, width, height, pageInfo }, ref) => {
    const [isPageLoading, setIsPageLoading] = React.useState(true);

    // Reset loading state whenever the page number changes
    React.useEffect(() => {
      setIsPageLoading(true);
    }, [pageNumber]);

    // As soon as the page renders successfully, hide the loader immediately (no artificial delay)
    const handleRenderSuccess = React.useCallback(() => {
      setIsPageLoading(false);
    }, []);

    // Calculate the best fit for this specific page within the fixed viewer size
    const getPageScale = () => {
      // Always use the current container height for both portrait and landscape
      // Landscape: scale by width, but keep height fixed for consistent book size
      if (!pageInfo) return { width, height };

      if (pageInfo.isLandscape) {
        return { width, height };
      }
      // Portrait: fit by height only
      return { width: undefined, height };
    };

    const { width: pageWidth, height: pageHeight } = getPageScale();

    // Use uniform viewer width/height (passed as props) for the flipbook page container.
    // Keeping the container size consistent for all pages prevents the flipbook
    // from reflowing pages into wrong sides when flipping.
    const containerStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: width ? `${width}px` : "100%",
      height: height ? `${height}px` : "100%",
    };

    return (
      <div
        className={["demoPage relative", pageInfo?.isLandscape ? "landscape-page" : ""].join(" ")}
        ref={ref}
        style={containerStyle}
      >
        <Page
          pageNumber={pageNumber}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          width={pageWidth}
          height={pageHeight}
          className="pdf-page"
          onRenderSuccess={handleRenderSuccess}
        />
        {isPageLoading && (
          <div className="absolute inset-0 pointer-events-none">
            <PdfLoading />
          </div>
        )}
      </div>
    );
  }
);

PageContent.displayName = "PageContent";

function FlipBook() {
  const [numPages, setNumPages] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pdfLibrary, setPdfLibrary] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  // Pan state for dragging when zoomed in
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  // Fullscreen UI control
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Track if we've completed at least one successful load (for initial gating of library)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  // Page-level dimensions/orientation are tracked in `pageDimensions`
  // Store dimensions for each individual page
  const [pageDimensions, setPageDimensions] = useState({});
  // Track when flipbook is remounting to show loader overlay
  const [isRemounting, setIsRemounting] = useState(false);
  const remountTimeoutRef = useRef(null);
  const previousDimensionsRef = useRef({ width: 0, height: 0 });
  // Track the target page to restore after remount (prevents flash to page 1)
  const targetPageRef = useRef(0);

  const flipbookRef = useRef(null);
  const containerRef = useRef(null);
  const { width: screenWidth, height: screenHeight } = useScreenSize();
  const isMobile = screenWidth < 940; // tailwind 'sm' breakpoint

  // Fetch PDF library on mount
  useEffect(() => {
    let mounted = true;
    setIsLoadingLibrary(true);
    getPdfLibrary().then((library) => {
      if (mounted) {
        // Sort library by uploadedAt date - oldest first (ascending order)
        const sortedLibrary = [...library].sort((a, b) => {
          const dateA = new Date(a.uploadedAt || 0);
          const dateB = new Date(b.uploadedAt || 0);
          return dateA - dateB; // oldest first
        });
        setPdfLibrary(sortedLibrary);
        // Set initial file from library if available
        if (sortedLibrary.length > 0 && !currentFile) {
          setCurrentFile(sortedLibrary[0].file);
        }
        setIsLoadingLibrary(false);
      }
    }).catch((error) => {
      console.error('Failed to load PDF library:', error);
      if (mounted) {
        setIsLoadingLibrary(false);
      }
    });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to fullscreen state
  useEffect(() => {
    if (!screenfull?.isEnabled) return;
    const handler = () => setIsFullscreen(!!screenfull.isFullscreen);
    screenfull.on("change", handler);
    return () => {
      try {
        screenfull.off("change", handler);
      } catch {
        /* noop */
      }
    };
  }, []);

  // Fixed viewer sizes for portrait and landscape pages
  const viewerSizes = useMemo(() => {
    const availableWidth = screenWidth || window.innerWidth;
    const availableHeight = screenHeight || window.innerHeight;

    // Estimate available horizontal space by subtracting the left library (when shown)
    // and container margins (responsive: mx-4 to mx-16).
    const leftSidebarWidth = hasLoadedOnce ? 256 : 0; // tailwind 'sm:w-64' => 16rem = 256px
    
    // Calculate responsive margins based on screen width
    let containerMargins;
    if (availableWidth < 640) {
      containerMargins = 16 * 2; // mx-4: 1rem = 16px each side
    } else if (availableWidth < 768) {
      containerMargins = 32 * 2; // mx-8: 2rem = 32px each side
    } else if (availableWidth < 1024) {
      containerMargins = 36 * 2; // mx-10: 2.5rem = 40px each side
    } else if (availableWidth < 1280) {
      containerMargins = 48 * 2; // mx-12: 3rem = 48px each side
    } else if (availableWidth < 1536) {
      containerMargins = 59 * 2; // mx-14: 3.5rem = 56px each side
    } else {
      containerMargins = 64 * 2; // mx-16: 4rem = 64px each side
    }
    
    const safetyGap = 40; // additional padding/gap to avoid touching edges
    const usableWidth = Math.max(600, availableWidth - leftSidebarWidth - containerMargins - safetyGap);
    
    // Account for toolbar and vertical padding
    const toolbarHeight = 80; // approximate toolbar height
    const verticalPadding = 96; // top and bottom padding (py-6 = 24px * 2, plus margins)
    const usableHeight = Math.max(400, availableHeight - toolbarHeight - verticalPadding);

    if (isMobile) {
      // Mobile: use a fixed, screen-aware width so landscape pages don't overflow
      const screenW = screenWidth || window.innerWidth;
      const mobileBaseWidth = Math.max(280, Math.min(screenW - 32, 350));
      // Increase mobile heights slightly for better readability on small screens
      const portraitHeight = Math.round(mobileBaseWidth * (470 / 350) * 1.15); // +15%
      const landscapeHeight = Math.round(mobileBaseWidth * (250 / 395) * 1.1); // +10%

      return {
        portrait: { width: mobileBaseWidth, height: portraitHeight },
        // Keep landscape the same width on mobile but slightly taller height
        landscape: { width: mobileBaseWidth, height: landscapeHeight },
      };
    } else if (availableWidth < 1024) {
      // Tablet/Medium screens (640px - 1023px): responsive sizing based on available space
      const tabletPortraitWidth = Math.min(Math.floor(usableWidth * 0.65), 300);
      const tabletPortraitHeight = Math.min(Math.round(tabletPortraitWidth * 1.5), usableHeight);
      
      const landscapeWidth = Math.min(Math.floor(usableWidth * 0.55), 450);
      const landscapeHeight = Math.min(Math.round((420 / 600) * landscapeWidth), usableHeight);
      
      return {
        portrait: { width: tabletPortraitWidth, height: tabletPortraitHeight },
        landscape: { width: landscapeWidth, height: landscapeHeight },
      };
    } else if (availableWidth < 1536) {
      // Large screens (1024px - 1535px): optimize for common desktop resolutions
      // For spread view, calculate per-page width from usable width
      const perPageWidth = Math.min(Math.floor((usableWidth / 2) * 1.1), 550);
      const landscapeWidth = Math.max(390, perPageWidth);
      const landscapeHeight = Math.min(
        Math.round((landscapeWidth * 716) / 1024), 
        usableHeight
      );
      
      // Portrait pages can be slightly larger on large screens
      const portraitWidth = Math.min(Math.floor(usableWidth * 0.38), 550);
      const portraitHeight = Math.min(
        Math.round(portraitWidth * 1.33), 
        usableHeight
      );

      return {
        portrait: { width: portraitWidth, height: portraitHeight },
        landscape: { width: landscapeWidth, height: landscapeHeight },
      };
    } else {
      // Extra large screens (1536px+): maximize content while maintaining quality
      // Allow larger spreads on XL screens
      const perPageMax = Math.min(Math.floor((usableWidth / 2) * 0.95), 700);
      const landscapeWidth = Math.max(650, perPageMax);
      const landscapeHeight = Math.min(
        Math.round((landscapeWidth * 716) / 1024),
        usableHeight
      );
      
      // Larger portrait dimensions for XL screens
      const portraitWidth = Math.min(Math.floor(usableWidth * 0.40), 500);
      const portraitHeight = Math.min(
        Math.round(portraitWidth * 1.33),
        usableHeight
      );

      return {
        portrait: { width: portraitWidth, height: portraitHeight },
        landscape: { width: landscapeWidth, height: landscapeHeight },
      };
    }
  }, [screenWidth, screenHeight, isMobile, hasLoadedOnce]);

  // Determine current page dimensions based on whether it's landscape or portrait
  const currentPageDimensions = useMemo(() => {
    const pageNum = currentPageIndex + 1;
    const pageInfo = pageDimensions[pageNum];

    if (!pageInfo) {
      return dimensions; // fallback to default
    }

    // Use fixed sizes based on page orientation
    const selectedSize = pageInfo.isLandscape
      ? viewerSizes.landscape
      : viewerSizes.portrait;
    return selectedSize;
  }, [currentPageIndex, pageDimensions, viewerSizes, dimensions]);

  // Detect when page dimensions change (landscape <-> portrait transition) and show loader
  useEffect(() => {
    const currentWidth = currentPageDimensions.width;
    const currentHeight = currentPageDimensions.height;
    const prevWidth = previousDimensionsRef.current.width;
    const prevHeight = previousDimensionsRef.current.height;

    // If dimensions changed (and we have a previous value), trigger remount overlay
    if (prevWidth > 0 && (currentWidth !== prevWidth || currentHeight !== prevHeight)) {
      // Store current page before remount
      targetPageRef.current = currentPageIndex;
      
      setIsRemounting(true);

      // Clear any pending timeout
      if (remountTimeoutRef.current) {
        clearTimeout(remountTimeoutRef.current);
      }

      // Hide loader after a brief delay to allow flipbook to remount smoothly
      remountTimeoutRef.current = setTimeout(() => {
        setIsRemounting(false);
      }, 400); // match transition duration
    }

    // Update ref for next comparison
    previousDimensionsRef.current = { width: currentWidth, height: currentHeight };

    return () => {
      if (remountTimeoutRef.current) {
        clearTimeout(remountTimeoutRef.current);
      }
    };
  }, [currentPageDimensions, currentPageIndex]);

  // Set default/fallback dimensions based on screen size - used when page dimensions not yet available
  useEffect(() => {
    const width = screenWidth || window.innerWidth;
    const height = screenHeight || window.innerHeight;

    // Simple fallback dimensions
    if (width < 640) {
      const pageWidth = Math.max(280, Math.min(width - 32, 420));
      const pageHeight = Math.round(pageWidth * 1.5);
      const maxPageHeight = Math.max(360, height - 160);
      setDimensions({
        width: pageWidth,
        height: Math.min(pageHeight, maxPageHeight),
      });
    } else {
      setDimensions({ width: 420, height: 600 });
    }
  }, [screenWidth, screenHeight]);

  const onDocumentLoadSuccess = useCallback((pdf) => {
    try {
      const pages = pdf?.numPages ?? 0;
      setNumPages(pages);
      setPdfDocument(pdf);
      setCurrentPageIndex(0);
      setZoomLevel(1);
      setHasLoadedOnce(true);

      const analyzeAllPages = async () => {
        try {
          const dimensions = {};

          for (let i = 1; i <= pages; i++) {
            try {
              const page = await pdf.getPage(i);
              const vp = page.getViewport({ scale: 1 });

              if (vp && vp.width && vp.height) {
                const aspectRatio = vp.width / vp.height;
                const isLandscape = aspectRatio > 1;

                dimensions[i] = {
                  width: vp.width,
                  height: vp.height,
                  aspectRatio: aspectRatio,
                  isLandscape: isLandscape,
                };
              }
            } catch {
              // Failed to analyze page
            }
          }

          setPageDimensions(dimensions);
        } catch {
          pdf
            .getPage(1)
            .then((page) => {
              const vp = page.getViewport({ scale: 1 });
              if (vp && vp.height) {
                const aspect = vp.width / vp.height;
                const isLand = aspect > 1;
                setPageDimensions({
                  1: {
                    width: vp.width,
                    height: vp.height,
                    aspectRatio: aspect,
                    isLandscape: isLand,
                  },
                });
              }
            })
            .catch(() => {
              // Failed to load first page
            });
        }
      };

      analyzeAllPages();
    } catch {
      // ignore
    }
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    try {
      const msg =
        typeof error?.message === "string"
          ? error.message
          : "Failed to load PDF file.";

      if (!document.querySelector("#pdf-load-error-alert")) {
        const el = document.createElement("div");
        el.id = "pdf-load-error-alert";
        el.textContent = msg;
        Object.assign(el.style, {
          position: "fixed",
          bottom: "16px",
          left: "16px",
          padding: "10px 14px",
          background: "#1f2937",
          color: "#fefefe",
          borderRadius: "8px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          zIndex: 9999,
          maxWidth: "90vw",
          fontSize: "14px",
        });
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 5000);
      }
    } catch {
      /* noop */
    }
  }, []);

  const handleSelectPdf = useCallback(
    (file) => {
      if (!file || file === currentFile) return;
      setNumPages(null);
      setPdfDocument(null);
      setCurrentPageIndex(0);
      setCurrentFile(file);
      setPageDimensions({});
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
      targetPageRef.current = 0;
    },
    [currentFile]
  );

  // Zoom handlers controlled here and passed to Toolbar
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Ensure pan resets whenever zoom returns to base level
  useEffect(() => {
    if (zoomLevel <= 1 && (pan.x !== 0 || pan.y !== 0)) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoomLevel, pan.x, pan.y]);

  return (
    <div
      ref={containerRef}
      className={[
        "bg-gray-900 book-bg min-h-screen w-full",
        isFullscreen ? "px-0 py-0 overflow-hidden" : "overflow-x-hidden",
      ].join(" ")}
    >
      <div
        className={[
          isFullscreen
            ? "max-w-none w-full h-screen flex flex-col gap-2"
            : "w-full h-screen flex flex-col sm:flex-row",
          "book-layout"
        ].join(" ")}
      >
        {/* Left transparent library - fixed to left edge on desktop; hidden on mobile; also hide during very first load */}
        {hasLoadedOnce ? (
          <div className="hidden sm:block sm:w-64 shrink-0">
            <div className="h-full py-6 pl-4">
              <LeftLibrary
                items={pdfLibrary}
                currentFile={currentFile}
                onSelect={handleSelectPdf}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col w-full items-center">
          {/* Main viewer area - centered with responsive padding */}
          <div className="flex-1 flex flex-col items-center justify-center mx-4 sm:mx-8 md:mx-4 lg:mx-2 xl:mx-8 2xl:mx-16 py-6">
            {isLoadingLibrary ? (
              <PdfLoading />
            ) : !currentFile ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-lg mb-2">No PDFs available</p>
                <p className="text-sm">Please upload a PDF to get started</p>
              </div>
            ) : (
              <Document
                // Force a full remount when switching files to avoid stale internal caches
                key={currentFile}
                file={currentFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<PdfLoading />}
              >
                {numPages && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* Zoomable viewport wrapper with drag-to-pan when zoomed */}
                    <div
                      className="w-full"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                    {(() => {
                      // Use current page dimensions instead of static dimensions
                      const activeDimensions = currentPageDimensions;
                      const bookWidth = activeDimensions.width;
                      const bookHeight = activeDimensions.height;
                      // Spread mode on desktop for all documents (mixed portrait/landscape supported)
                      const isSpread = !isMobile;
                      const wrapperWidth = isSpread ? bookWidth * 2 : bookWidth;
                      // Pointer handlers for panning when zoomed
                      const handlePointerDown = (e) => {
                        if (zoomLevel <= 1) return;
                        // Prevent flip action and text selection
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          e.currentTarget.setPointerCapture?.(e.pointerId);
                        } catch {
                          /* noop */
                        }
                        setIsPanning(true);
                        panStartRef.current = {
                          x: e.clientX,
                          y: e.clientY,
                          panX: pan.x,
                          panY: pan.y,
                        };
                      };
                      const handlePointerMove = (e) => {
                        if (!isPanning || zoomLevel <= 1) return;
                        const dx = e.clientX - panStartRef.current.x;
                        const dy = e.clientY - panStartRef.current.y;
                        setPan({
                          x: panStartRef.current.panX + dx,
                          y: panStartRef.current.panY + dy,
                        });
                      };
                      const endPan = (e) => {
                        if (!isPanning) return;
                        try {
                          e.currentTarget.releasePointerCapture?.(e.pointerId);
                        } catch {
                          /* noop */
                        }
                        setIsPanning(false);
                      };
                      return (
                        <div
                          className="book-frame relative"
                          style={{
                            width: wrapperWidth,
                            height: bookHeight,
                            margin: "0 auto",
                            overflow: "hidden",
                            cursor: zoomLevel > 1 ? "move" : "default",
                            touchAction: zoomLevel > 1 ? "none" : "auto",
                            userSelect: isPanning ? "none" : "auto",
                            transition:
                              "width 0.4s ease-in-out, height 0.4s ease-in-out",
                          }}
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={endPan}
                          onPointerLeave={endPan}
                        >
                          {/* Show loading overlay during dimension-change remount */}
                          {isRemounting && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm pointer-events-none">
                              <PdfLoading />
                            </div>
                          )}
                          <div
                            className="book-viewport"
                            style={{
                              margin: "0 auto",
                              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                              transformOrigin: "top center",
                              willChange: "transform",
                              // Keep base dimensions so scaling works predictably
                              width: wrapperWidth,
                              opacity: isRemounting ? 0.3 : 1,
                              transition: "opacity 0.2s ease-in-out",
                            }}
                          >
                            <HTMLFlipBook
                              // Force re-initialization when file or spread mode changes to prevent stuck state
                              key={`${currentFile}-${isSpread ? "spread" : "single"}-${bookWidth}x${bookHeight}`}
                              ref={flipbookRef}
                              width={bookWidth}
                              height={bookHeight}
                              size="fixed"
                              minWidth={280}
                              maxWidth={2200}
                              minHeight={350}
                              maxHeight={1000}
                              showCover={true}
                              drawShadow={true}
                              flippingTime={600}
                              // On mobile, force single-page mode; on larger screens, use orientation
                              // Portrait mode shows single pages, landscape shows spreads
                              usePortrait={!isSpread}
                              startPage={targetPageRef.current || 0}
                              maxShadowOpacity={0.5}
                              mobileScrollSupport={true}
                              className="flipbook"
                              onFlip={() => {
                                try {
                                  const idx = flipbookRef.current
                                    ?.pageFlip()
                                    ?.getCurrentPageIndex?.();
                                  if (typeof idx === "number") {
                                    setCurrentPageIndex(idx);
                                    targetPageRef.current = idx;
                                  }
                                } catch {
                                  // ignore
                                }
                              }}
                            >
                              {Array.from(new Array(numPages), (el, index) => {
                                const pageNum = index + 1;
                                const pageInfo = pageDimensions[pageNum];

                                return (
                                  <PageContent
                                    key={`page_${pageNum}`}
                                    pageNumber={pageNum}
                                    width={bookWidth}
                                    height={bookHeight}
                                    pageInfo={pageInfo}
                                  />
                                );
                              })}
                            </HTMLFlipBook>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              </Document>
            )}
          </div>
          {/* Toolbar placed under the document - hidden until document is loaded */}
          {numPages ? (
            <div
              className={
                isFullscreen 
                  ? "w-full mt-2 px-2" 
                  : "w-full max-w-3xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl m-2 sm:m-3 md:m-4 px-2 sm:px-3"
              }
            >
              <Toolbar
                flipbookRef={flipbookRef}
                containerRef={containerRef}
                screenfull={screenfull}
                pdfDetails={{ totalPages: numPages ?? 0 }}
                viewerStates={{ currentPageIndex }}
                pdfDocument={pdfDocument}
                // Zoom controls
                zoomLevel={zoomLevel}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
              />
            </div>
          ) : null}
        </div>
        {/* Mobile library at bottom; also hide during very first load */}
        {hasLoadedOnce ? (
          <div className="sm:hidden px-4 pb-6">
            <LeftLibrary
              items={pdfLibrary}
              currentFile={currentFile}
              onSelect={handleSelectPdf}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FlipBook;
