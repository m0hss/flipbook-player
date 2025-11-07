import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import PdfLoading from '../Components/PdfLoading';
import Toolbar from "../Components/Toolbar/Toolbar";
import screenfull from "screenfull";
import "./styles.css";
import useScreenSize from "../hooks/useScreenSize";
import LeftLibrary from "../Components/LeftLibrary";
import pdfLibrary from "../assets/pdfs";

// Use local worker file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PageContent = React.forwardRef(({ pageNumber, maxWidth, maxHeight }, ref) => {
  const [isPageLoading, setIsPageLoading] = React.useState(true);

  // Reset loading state whenever the page number changes
  React.useEffect(() => {
    setIsPageLoading(true);
    return () => {
      // no-op cleanup; ensure no lingering timers (none are used now)
    };
  }, [pageNumber]);

  // As soon as the page renders successfully, hide the loader immediately (no artificial delay)
  const handleRenderSuccess = React.useCallback(() => {
    setIsPageLoading(false);
  }, []);

  return (
    <div className="demoPage relative" ref={ref} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: maxWidth,
      height: maxHeight
    }}>
      <Page
        pageNumber={pageNumber}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        height={maxHeight}
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
});

PageContent.displayName = 'PageContent';

function FlipBook() {
  const [numPages, setNumPages] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [currentFile, setCurrentFile] = useState(pdfLibrary?.[0]?.file || '/py-scripting.pdf');
  const [zoomLevel, setZoomLevel] = useState(1);
  // Pan state for dragging when zoomed in
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  // Fullscreen UI control
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Track if we've completed at least one successful load (for initial gating of library)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  // PDF page aspect ratio (width / height) for proper fit within flipbook page
  const [pdfAspect, setPdfAspect] = useState(null);
  
  const flipbookRef = useRef(null);
  const containerRef = useRef(null);
  const { width: screenWidth, height: screenHeight } = useScreenSize();
  const isMobile = screenWidth < 640; // tailwind 'sm' breakpoint

  // Listen to fullscreen state
  useEffect(() => {
    if (!screenfull?.isEnabled) return;
    const handler = () => setIsFullscreen(!!screenfull.isFullscreen);
    screenfull.on('change', handler);
    return () => {
      try { screenfull.off('change', handler); } catch { /* noop */ }
    };
  }, []);

  // Set responsive dimensions based on screen size
  useEffect(() => {
    // Responsive dimensions derived from current screen size
    const width = screenWidth || window.innerWidth;
    const height = screenHeight || window.innerHeight;

    if (width < 640) {
      // Mobile — enforce single page sizing (portrait)
      const pageWidth = Math.max(280, Math.min(width - 32, 420)); // keep within safe bounds
      const pageHeight = Math.round(pageWidth * 1.4); // A-series aspect ratio (~√2)
      const maxPageHeight = Math.max(360, height - 160); // leave space for header/controls
      setDimensions({ width: pageWidth, height: Math.min(pageHeight, maxPageHeight) });
    } else if (width < 768) {
      // Small tablets — single page
      setDimensions({ width: 420, height: 594 });
    } else if (width < 1024) {
      // Large tablets — allow double page
      setDimensions({ width: 360, height: 480 });
    } else {
      // Desktop — double page
      setDimensions({ width: 420, height: 600 }); // landscape-ish to prefer spread
    }
  }, [screenWidth, screenHeight]);

  const onDocumentLoadSuccess = useCallback((pdf) => {
    try {
      const pages = pdf?.numPages ?? 0;
      console.log('PDF loaded successfully with', pages, 'pages');
      setNumPages(pages);
      setPdfDocument(pdf);
      setCurrentPageIndex(0);
      // reset zoom when a new document loads
      setZoomLevel(1);
      // mark the initial load complete so library can remain visible on later loads
      setHasLoadedOnce(true);
      // Read first page to detect intrinsic aspect ratio (width/height)
      pdf.getPage(1)
        .then((page) => {
          const vp = page.getViewport({ scale: 1 });
          // Avoid zero division
          if (vp && vp.height) {
            setPdfAspect(vp.width / vp.height);
          } else {
            setPdfAspect(null);
          }
        })
        .catch(() => setPdfAspect(null));
    } catch {
      // ignore
    }
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error('Error loading PDF:', error);
  }, []);

  const handleSelectPdf = useCallback((file) => {
    if (!file || file === currentFile) return;
    setNumPages(null);
    setPdfDocument(null);
    setCurrentPageIndex(0);
    setCurrentFile(file);
  }, [currentFile]);

  const currentTitle = useMemo(() => {
    const item = pdfLibrary.find((p) => p.file === currentFile);
    if (item?.title) return item.title;
    try {
      const raw = decodeURIComponent(currentFile.split('/').pop() || 'Document');
      const noExt = raw.replace(/\.pdf$/i, '');
      const spaced = noExt.replace(/[-_]+/g, ' ');
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    } catch {
      return 'Document';
    }
  }, [currentFile]);

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
        'bg-gray-900 min-h-screen w-full',
        isFullscreen ? 'px-0 py-0 overflow-hidden' : 'px-2 sm:px-4 py-6 sm:py-8 overflow-x-hidden',
      ].join(' ')}
    >
      <div
        className={[
          isFullscreen
            ? 'max-w-none w-full mx-auto flex flex-col gap-2'
            : 'max-w-7xl mx-auto w-full flex flex-col sm:flex-row gap-4 sm:gap-6',
        ].join(' ')}
      >
        {/* Left transparent library - hidden on mobile; also hide during very first load */}
        {hasLoadedOnce ? (
          <div className="hidden sm:block">
            <LeftLibrary items={pdfLibrary} currentFile={currentFile} onSelect={handleSelectPdf} />
          </div>
        ) : null}

        {/* Main viewer area */}
        <div className="flex-1 flex flex-col items-center">
          {!isFullscreen && (
            <div className="text-3xl sm:text-4xl font-bold md:font-extrabold text-white mb-6 sm:mb-8 self-start">{currentTitle}</div>
          )}

          <Document
        file={currentFile}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<PdfLoading />}
      >
        {numPages && (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Zoomable viewport wrapper with drag-to-pan when zoomed */}
            <div className="w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
              {(() => {
                // Compute a per-page width that guarantees the PDF fits within flipbook page width/height
                // If we know the aspect ratio (w/h), limit by both dimensions; otherwise fallback to width
                const targetByHeight = pdfAspect ? Math.floor(dimensions.height * pdfAspect) : dimensions.width;
                const pageWidthFit = Math.min(dimensions.width, targetByHeight);
                const bookWidth = pageWidthFit; // each page width
                const wrapperWidth = isMobile ? bookWidth : bookWidth * 2; // two pages on desktop
                // Pointer handlers for panning when zoomed
                const handlePointerDown = (e) => {
                  if (zoomLevel <= 1) return;
                  // Prevent flip action and text selection
                  e.preventDefault();
                  e.stopPropagation();
                  try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* noop */ }
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
                  try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
                  setIsPanning(false);
                };
                return (
                  <div
                    style={{
                      width: wrapperWidth,
                      height: dimensions.height,
                      margin: '0 auto',
                      overflow: 'hidden',
                      cursor: zoomLevel > 1 ? 'move' : 'default',
                      touchAction: zoomLevel > 1 ? 'none' : 'auto',
                      userSelect: isPanning ? 'none' : 'auto',
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endPan}
                    onPointerLeave={endPan}
                  >
                    <div
                      style={{
                        margin: '0 auto',
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        willChange: 'transform',
                        // Keep base dimensions so scaling works predictably
                        width: wrapperWidth,
                      }}
                    >
                      <HTMLFlipBook 
                        ref={flipbookRef}
                        width={bookWidth} 
                        height={dimensions.height}
                        size="fixed"
                        minWidth={280}
                        maxWidth={600}
                        minHeight={350}
                        maxHeight={900}
                        showCover={true}
                        drawShadow={true}
                        flippingTime={600}
                        // On mobile, force single-page mode; on larger screens, let spreads show
                        usePortrait={isMobile}
                        startPage={0}
                        maxShadowOpacity={0.5}
                        mobileScrollSupport={true}
                        className="flipbook"
                        onFlip={() => {
                          try {
                            const idx = flipbookRef.current?.pageFlip()?.getCurrentPageIndex?.();
                            if (typeof idx === 'number') setCurrentPageIndex(idx);
                          } catch {
                            // ignore
                          }
                        }}
                      >
                        {Array.from(new Array(numPages), (el, index) => (
                          <PageContent 
                            key={`page_${index + 1}`} 
                            pageNumber={index + 1}
                            maxWidth={bookWidth}
                            maxHeight={dimensions.height}
                          />
                        ))}
                      </HTMLFlipBook>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Document>
          {/* Toolbar placed under the document - hidden until document is loaded */}
          {numPages ? (
            <div className={isFullscreen ? 'w-full mt-2' : 'w-full lg:w-3/4 mt-4'}>
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
          <div className="sm:hidden">
            <LeftLibrary items={pdfLibrary} currentFile={currentFile} onSelect={handleSelectPdf} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FlipBook;
