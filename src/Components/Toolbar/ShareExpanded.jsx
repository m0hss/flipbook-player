import React, { useEffect, useState, useRef } from 'react';
import { CheckCheck, Copy, X } from 'lucide-react';
import { WhatsappShareButton, FacebookShareButton, TwitterShareButton, LinkedinShareButton } from 'react-share';

const ShareExpanded = ({ shareUrl, isOpen, onClose, parentRef }) => {
    const [url, setUrl] = useState(shareUrl || '');
    const [copied, setCopied] = useState(false);
    const containerRef = useRef(null);

    // Copy link to clipboard
    const copyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    // Get the window url if url is not provided
    useEffect(() => {
        if (!shareUrl && typeof window !== 'undefined') {
            setUrl(window.location.href);
        }
    }, [shareUrl]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside both the dropdown and the parent button
            const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
            const isOutsideParent = parentRef?.current && !parentRef.current.contains(event.target);
            
            if (isOutsideContainer && isOutsideParent && onClose) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, parentRef]);

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className="absolute top-full mt-2 right-0 left-0 rounded-xl border border-white/10 bg-gray-800 p-2 shadow-lg flex flex-col items-start gap-2 z-50 min-w-40"
        >
            {/* Copy link */}
            <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-white text-xs px-2 py-1 cursor-pointer rounded-md hover:bg-white/10"
                title="Copy link"
            >
                {copied ? (
                    <CheckCheck className="w-4 h-4 text-green-400" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
                <span className="select-none text-white text-xs">{copied ? 'Copied!' : 'Copy link'}</span>
            </button>

            {/* WhatsApp */}
            <WhatsappShareButton url={url} className="flex items-center gap-1.5 ml-2 cursor-pointer rounded-md hover:bg-white/10 px-2 py-1">
                <svg className="w-4 h-4" width={40} height={40} viewBox="-1.5 0 259 259" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="currentColor">
                    <path d="M67.663 221.823l4.185 2.093c17.44 10.463 36.971 15.346 56.503 15.346 61.385 0 111.609-50.224 111.609-111.609 0-29.297-11.859-57.897-32.785-78.824-20.927-20.927-48.83-32.785-78.824-32.785-61.385 0-111.609 50.224-110.912 112.307 0 20.926 6.278 41.156 16.741 58.594l2.79 4.186-11.16 41.156 41.853-11.16z" fill="#00E676" />
                    <path d="M219.033 37.668C195.316 13.254 162.531 0 129.048 0 57.897 0 .698 57.897 1.395 128.35c0 22.322 6.278 43.947 16.742 63.478L0 258.096l67.663-17.439c18.834 10.464 39.76 15.347 60.687 15.347 70.453 0 127.653-57.898 127.653-128.35 0-34.181-13.254-66.269-36.97-89.986zM129.048 234.38c-18.834 0-37.668-4.882-53.712-14.648l-4.185-2.093-40.551 10.463 10.463-39.76-2.79-4.186C7.673 134.628 22.322 69.058 72.546 38.366c50.224-30.693 115.097-16.044 145.79 34.18 30.692 50.224 16.043 115.097-34.18 145.79-16.045 10.463-35.576 16.044-55.108 16.044zm61.385-77.428l-7.673-3.488s-11.16-4.883-17.136-7.673c-.698 0-1.395-.698-2.093-.698-2.093 0-3.488.698-4.883 1.395 0 0-.698.698-10.464 11.161-.698 1.395-2.093 2.093-3.488 2.093h-.698c-.697 0-2.092-.698-2.79-1.395l-3.488-1.395c-6.975-3.488-13.951-7.673-19.532-13.254-1.395-1.395-3.488-2.79-4.883-4.185-5.58-5.58-10.463-11.858-13.95-18.834l-.698-1.395c-.698-.698-.698-1.395-1.395-2.79 0-1.396 0-2.79.697-3.488 0 0 2.79-3.488 4.883-5.58 1.395-1.396 2.093-3.489 3.488-4.884 1.395-1.395 2.093-4.185 1.395-6.278-.697-3.488-9.068-22.322-11.16-26.508-1.396-2.093-2.791-2.79-4.884-3.488h-4.185c-1.395 0-3.488 0-5.58 0-1.396 0-2.791.697-4.186.697l-.698.698c-1.395.697-2.79 2.092-4.185 2.79-1.395 1.395-2.093 2.79-3.488 4.185-4.883 6.278-7.673 13.951-7.673 21.624 0 5.58 1.395 11.161 3.488 16.044l.698 2.093c6.278 13.254 14.648 25.112 25.81 35.575l2.79 2.79c2.092 2.093 4.185 3.488 5.58 5.58 14.649 12.557 31.39 21.625 50.224 26.508 2.093.698 4.883.698 6.976 1.395h6.975c2.093 0 4.883 0 6.976-.697 3.488 0 7.673-1.395 10.463-2.79 1.395-.698 2.79-.698 3.488-1.396l1.396-1.395c1.395-1.395 2.79-2.093 4.185-3.488 1.395-1.395 2.79-2.79 3.488-4.185 1.395-2.79 2.093-6.278 2.79-9.766 0-1.395 0-3.488 0-4.883 0 0-.698-.698-2.093-1.395z" fill="#FFFFFF" />
                </svg>
                <span className="select-none text-white text-xs py-0.5 px-1">WhatsApp</span>
            </WhatsappShareButton>

            {/* Facebook */}
            <FacebookShareButton url={url} className="flex items-center gap-1.5  ml-2 cursor-pointer rounded-md hover:bg-white/10 px-2 py-1">
                <svg className="w-4 h-4" width={40} height={40} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="url(#paint0_linear_fb)" />
                    <path d="M21.2137 20.2816L21.8356 16.3301H17.9452V13.767C17.9452 12.6857 18.4877 11.6311 20.2302 11.6311H22V8.26699C22 8.26699 20.3945 8 18.8603 8C15.6548 8 13.5617 9.89294 13.5617 13.3184V16.3301H10V20.2816H13.5617V29.8345C14.2767 29.944 15.0082 30 15.7534 30C16.4986 30 17.2302 29.944 17.9452 29.8345V20.2816H21.2137Z" fill="white" />
                    <defs>
                        <linearGradient id="paint0_linear_fb" x1="16" y1="2" x2="16" y2="29.917" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#18ACFE" />
                            <stop offset="1" stopColor="#0163E0" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="select-none text-white text-xs py-0.5 px-1">Facebook</span>
            </FacebookShareButton>

            {/* Twitter/X */}
            <TwitterShareButton url={url} className="flex items-center gap-1.5 ml-2 cursor-pointer rounded-md hover:bg-white/10 px-2 py-1">
                <X className="w-4 h-4" />
                <span className="select-none text-white text-xs py-0.5 px-1">Twitter</span>
            </TwitterShareButton>

            {/* LinkedIn */}
            <LinkedinShareButton url={url} className="flex items-center gap-1.5 ml-2 cursor-pointer rounded-md hover:bg-white/10 px-2 py-1">
                <svg className="w-4 h-4" width={40} height={40} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path fill="#0A66C2" d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14zM4.67 5.715a1.037 1.037 0 01-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032zm.889 6.51h-1.78V6.498h1.78v5.727zM13.11 2H2.885A.88.88 0 002 2.866v10.268a.88.88 0 00.885.866h10.226a.882.882 0 00.889-.866V2.865a.88.88 0 00-.889-.864z" />
                </svg>
                <span className="select-none text-white text-xs py-0.5 px-1">LinkedIn</span>
            </LinkedinShareButton>
        </div>
    );
};

export default ShareExpanded;
