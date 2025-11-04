import React from 'react'
import './PdfLoading.css';

const PdfLoading = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="flex items-center gap-3 p-2 rounded-md">
                <div className="w-14 h-14 flex items-center justify-end relative animate-pulse">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="hsl(0 100% 72%)"
                        viewBox="0 0 126 75"
                        className="w-full h-auto shadow-sm"
                    >
                        <rect
                            strokeWidth="3"
                            stroke="rgb(17 24 39)"
                            rx="7.5"
                            height="70"
                            width="121"
                            y="2.5"
                            x="2.5"
                        ></rect>
                        <line
                            strokeWidth="2"
                            stroke="rgb(17 24 39)"
                            y2="75"
                            x2="63.5"
                            x1="63.5"
                        ></line>
                        <path
                            strokeLinecap="round"
                            strokeWidth="2"
                            stroke="rgb(17 24 39)"
                            d="M25 20H50"
                        ></path>
                        <path
                            strokeLinecap="round"
                            strokeWidth="2"
                            stroke="rgb(17 24 39)"
                            d="M101 20H76"
                        ></path>
                        <path
                            strokeLinecap="round"
                            strokeWidth="2"
                            stroke="rgb(17 24 39)"
                            d="M16 30L50 30"
                        ></path>
                        <path
                            strokeLinecap="round"
                            strokeWidth="2"
                            stroke="rgb(17 24 39)"
                            d="M110 30L76 30"
                        ></path>
                    </svg>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#00000040"
                        viewBox="0 0 65 75"
                        className="page h-1/2 w-auto absolute"
                    >
                        <path
                            strokeLinecap="round"
                            strokeWidth="2"
                            stroke="rgb(59 130 246)"
                            d="M40 20H15"
                        ></path>
                        <path
                            strokeLinecap="round"
                            strokeWidth="2"
                            stroke="rgb(59 130 246)"
                            d="M49 30L15 30"
                        ></path>
                        <path
                            stroke="none"
                            d="M2.5 2.5H55C59.1421 2.5 62.5 5.85786 62.5 10V65C62.5 69.1421 59.1421 72.5 55 72.5H2.5V2.5Z"
                        ></path>
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default PdfLoading
