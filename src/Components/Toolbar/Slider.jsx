import { cn } from '../../utils/cn';
import React, { useState, useEffect, useRef } from 'react';
import HoverItem from './HoverItem';
import { useDebounce } from '../../hooks/useDebounce';

const Slider = ({ maxSlide = 10, currentSlide, onSlideChange, totalPages, pdfDocument }) => {
    const [value, setValue] = useState(1);
    const [hoverValue, setHoverValue] = useState(null);
    const [thumbPosition, setThumbPosition] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
    const sliderRef = useRef(null);
    const tooltipRef = useRef(null);
    const thumbRef = useRef(null);
    const dragStartPos = useRef(null);

    // Update thumb position on value & screen size change >>>>>>>>>
    useEffect(() => {
        const updateThumbPosition = () => {
            if (sliderRef.current && !dragging) {
                const sliderRect = sliderRef.current.getBoundingClientRect();
                const sliderWidth = sliderRect.width;
                const newPosition = ((value - 1) / (maxSlide - 1)) * sliderWidth;
                setThumbPosition(newPosition);
            }
        };
        updateThumbPosition();
        window.addEventListener('resize', updateThumbPosition);
        return () => window.removeEventListener('resize', updateThumbPosition);
    }, [value, maxSlide, dragging]);

    // Handle mouse/touch drag >>>>>>>>>
    const handleDragStart = (e) => {
        e.preventDefault();
        setDragging(true);
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        dragStartPos.current = { x: clientX, startPosition: thumbPosition };
    };

    useEffect(() => {
        if (!dragging || !sliderRef.current || !dragStartPos.current) return;

        const handleDragMove = (e) => {
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const sliderRect = sliderRef.current.getBoundingClientRect();
            const sliderWidth = sliderRect.width;
            const deltaX = clientX - dragStartPos.current.x;
            const newPosition = Math.max(0, Math.min(sliderWidth, dragStartPos.current.startPosition + deltaX));
            
            setThumbPosition(newPosition);
            
            const newValue = Math.min(
                Math.max(1, Math.round((newPosition / sliderWidth) * (maxSlide - 1) + 1)),
                maxSlide
            );
            setValue(newValue);
            setHoverValue(newValue);

            if (tooltipRef.current) {
                const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
                const tooltipLeft = Math.max(0, Math.min(newPosition - tooltipWidth / 2, sliderWidth - tooltipWidth));
                setTooltipPosition({ left: tooltipLeft, top: -20 });
            }
        };

        const handleDragEnd = () => {
            setDragging(false);
            dragStartPos.current = null;
        };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('touchend', handleDragEnd);

        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [dragging, maxSlide]);

    // Handle onClick to change slide >>>>>>>>>
    const handleSlideChange = (e) => {
        if (sliderRef.current) {
            const rect = sliderRef.current.getBoundingClientRect();
            const clickedValue = Math.min(
                Math.max(1, Math.round(((e.clientX - rect.left) / rect.width) * (maxSlide - 1) + 1)),
                maxSlide
            );
            setValue(clickedValue);
        }
    }

    // Handle hover value tooltip >>>>>>>>>
    const handlePointerMove = (e) => {
        if (sliderRef.current && tooltipRef.current && !dragging) {
            const rect = sliderRef.current.getBoundingClientRect();
            const hoverValue = Math.min(
                Math.max(1, Math.round(((e.clientX - rect.left) / rect.width) * (maxSlide - 1) + 1)),
                maxSlide
            );
            setHoverValue(hoverValue);
            const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
            const tooltipLeft = Math.max(0, Math.min(e.clientX - rect.left - tooltipWidth / 2, rect.width - tooltipWidth));
            setTooltipPosition({ left: tooltipLeft, top: -20 });
        }
    };

    // Hide hover value tooltip >>>>>>>>>
    const handlePointerLeave = () => {
        setHoverValue(null);
    };

    // Hide hover value tooltip on drag end >>>>>>>>>
    useEffect(() => {
        if (!dragging) {
            handlePointerLeave();
        }
    }, [dragging]);

    // Update value on slide change >>>>>>>>>
    useEffect(() => {
        setValue(currentSlide);
    }, [currentSlide]);

    // Update debounced value on slide change >>>>>>>>>
    const debouncedValue = useDebounce(value, 500);
    useEffect(() => {
        onSlideChange(debouncedValue);
    }, [debouncedValue, onSlideChange]);
    
    return (
        <div className="py-4">
            <div
                ref={sliderRef}
                className="relative w-full h-1 bg-gray-600 rounded-full"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerCancel={handlePointerLeave}
            >
                <div
                    ref={thumbRef}
                    className="absolute z-20 size-1 bg-blue-600 rounded-full cursor-pointer"
                    style={{ left: `${thumbPosition}px`, transform: 'translateX(-50%)' }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <div className={cn("size-3 hover:size-4 bg-blue-600 absolute -top-1 hover:-top-1.5 -left-1 hover:-left-1.5 rounded-full transition-all", dragging && 'w-3 h-3 -left-1.5 -top-1.5 rounded-full')}></div>
                </div>
                {/* // Click to change slide >>>>>>>>> */}
                <div
                    className="absolute inset-0 cursor-pointer w-full h-3 top-1/2 -translate-y-1/2 bg-transparent"
                    onClick={handleSlideChange}
                />
                {/* // Tooltip for hover value >>>>>>>>> */}
                <div
                    ref={tooltipRef}
                    className={cn('bg-gray-800/90 backdrop-blur-sm text-white rounded p-2 text-xs w-fit h-fit', hoverValue === null && 'opacity-0 w-0 h-0 select-none')}
                    style={{ position: 'absolute', left: tooltipPosition.left, bottom: '20px' }}
                >
                    {pdfDocument && hoverValue ? (
                        <HoverItem
                            slide={hoverValue}
                            totalPages={totalPages}
                            totalSlides={maxSlide}
                            pdfDocument={pdfDocument}
                        />
                    ) : (
                        null
                    )}
                </div>
            </div>
        </div>
    );
};

export default Slider;
