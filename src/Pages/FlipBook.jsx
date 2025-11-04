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

const PageContent = React.forwardRef(({ pageNumber, width }, ref) => {
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
    <div className="demoPage relative" ref={ref}>
      <Page
        pageNumber={pageNumber}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        width={width}
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
  
  const flipbookRef = useRef(null);
  const containerRef = useRef(null);
  const { width: screenWidth, height: screenHeight } = useScreenSize();
  const isMobile = screenWidth < 640; // tailwind 'sm' breakpoint

  // Set responsive dimensions based on screen size
  useEffect(() => {
    // Responsive dimensions derived from current screen size
    const width = screenWidth || window.innerWidth;
    const height = screenHeight || window.innerHeight;

    if (width < 640) {
      // Mobile — enforce single page sizing (portrait)
      const pageWidth = Math.max(280, Math.min(width - 32, 420)); // keep within safe bounds
      const pageHeight = Math.round(pageWidth * 1.2); // A-series aspect ratio (~√2)
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
      setDimensions({ width: 420, height: 500 }); // landscape-ish to prefer spread
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
  }, []);

  return (
    <div ref={containerRef} className="bg-gray-900 min-h-screen w-full px-2 sm:px-4 py-6 sm:py-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Left transparent library - hidden on mobile */}
        <div className="hidden sm:block">
          <LeftLibrary items={pdfLibrary} currentFile={currentFile} onSelect={handleSelectPdf} />
        </div>

        {/* Main viewer area */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold md:font-extrabold text-white mb-6 sm:mb-8 self-start">{currentTitle}</div>

          <Document
        file={currentFile}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<PdfLoading />}
      >
        {numPages && (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Zoomable viewport wrapper */}
            <div className="w-full overflow-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div
                style={{
                  margin: '0 auto',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  willChange: 'transform',
                  // Keep base dimensions so scaling works predictably
                  width: isMobile ? dimensions.width : dimensions.width * 2,
                }}
              >
                <HTMLFlipBook 
                  ref={flipbookRef}
                  width={dimensions.width} 
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
                      width={dimensions.width}
                    />
                  ))}
                </HTMLFlipBook>
              </div>
            </div>
          </div>
        )}
      </Document>
          {/* Toolbar placed under the document - hidden until document is loaded */}
          {numPages ? (
            <div className="w-full lg:w-3/4 mt-4">
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

        {/* Mobile library at bottom */}
        <div className="sm:hidden">
          <LeftLibrary items={pdfLibrary} currentFile={currentFile} onSelect={handleSelectPdf} />
        </div>
      </div>
    </div>
  );
}

export default FlipBook;
