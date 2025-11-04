import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { IoIosMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import './Overlay.css';


const MobileMenu = ({ isOpen, onClose, isActive }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-screen z-40 backdrop-blur-xl bg-gray-800 flex flex-col items-center justify-center py-20 gap-10 text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-screen opacity-100' : 'w-0 opacity-0 pointer-events-none'
      }`}
    >
      <div className='flex flex-col justify-between items-center text-3xl font-semibold pl-6 gap-3 md:w-2/12 w-1/2 text-center'>
        <NavLink to='/' onClick={onClose} className={`flex gap-4 hover:text-yellow-500 ${isActive('/') && 'text-yellow-500'} items-center my-1`}>
          HOME
        </NavLink>
        <NavLink to='/about-me' onClick={onClose} className={`flex gap-4 hover:text-yellow-500 ${isActive('/about-me') && 'text-yellow-500'} items-center my-1`}>
          ABOUT ME
        </NavLink>
        <NavLink to='/contact' onClick={onClose} className={`flex gap-4 hover:text-yellow-500 ${isActive('/contact') && 'text-yellow-500'} items-center my-1`}>
          CONTACT
        </NavLink>
      </div>
    </div>
  );
};

const RightSidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const HIDE_SCROLL_THRESHOLD = 10; // hide earlier than before (was 50)

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      // Show when scrolling up, hide when scrolling down; use lower threshold to hide earlier
      if (scrollingDown && currentScrollY > HIDE_SCROLL_THRESHOLD) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <button
        className={`fixed z-50 top-4 right-6 flex flex-col items-end justify-start text-3xl rounded-full p-3 bg-white text-black transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-24'
        }`}
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <RxCross2 /> : <IoIosMenu />}
      </button>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} isActive={isActive} />
    </>
  );
};

export default RightSidebar;
