import React from 'react';

const Zoom = ({ zoomScale, screenWidth, zoomControls }) => {
    const { zoomIn, zoomOut, resetTransform } = zoomControls;
    
    return (
        <>
            {screenWidth > 768 && (
                <>
                    <button 
                        onClick={() => zoomOut(0.25)} 
                        disabled={zoomScale === 1} 
                        className='h-8 w-8 min-w-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded flex items-center justify-center'
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => zoomIn(0.25)} 
                        disabled={zoomScale >= 5} 
                        className='h-8 w-8 min-w-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded flex items-center justify-center'
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => resetTransform()} 
                        className='h-8 w-8 min-w-8 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center'
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </>
            )}
        </>
    );
};

export default Zoom;
