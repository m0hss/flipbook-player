import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RightSidebar from '../Components/RightSidebar';
import ContactUs from './ContactUs';
import AboutMe from './AboutMe';
import FlipBook from './FlipBook';
import ProtectedRoute from './ProtectedRoute';
import UploadPDFs from './UploadPDFs';
import NotFound from './404';

const Home = () => {
  return (
    <div className='bg-black'>
      {/* <RightSidebar /> */}
      <Routes>
        <Route path='/' element={<FlipBook />} />
        <Route path='/contact' element={<ContactUs />} />
        <Route path='/aboutme' element={<AboutMe />} />
        <Route
          path='/upload'
          element={
            <ProtectedRoute>
              <UploadPDFs />
            </ProtectedRoute>
          }
        />
  <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default Home;
