import React, { useEffect, useState } from 'react';
import './PageTransition.css';

const PageTransition = ({ children, in: inProp }) => {
  const [shouldRender, setShouldRender] = useState(inProp);
  const [animationClass, setAnimationClass] = useState('page-enter');

  useEffect(() => {
    if (inProp) {
      setShouldRender(true);
      setAnimationClass('page-enter');
      setTimeout(() => setAnimationClass('page-enter-active'), 10);
    } else {
      setAnimationClass('page-exit-active');
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [inProp]);

  if (!shouldRender) return null;

  return (
    <div className={animationClass}>
      {children}
    </div>
  );
};

export default PageTransition;
