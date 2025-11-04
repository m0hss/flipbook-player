import React from 'react';
import MySkills from '../Components/MySkills';
import ExperienceEducation from '../Components/ExperienceEducation';
import PageTransition from '../Components/PageTransition';
import usePageTransition from '../hooks/usePageTransition';
import myimg from '../assets/images/Untitled.jpg';

const AboutMe = () => {
  const showPage = usePageTransition();



  return (
    <PageTransition in={showPage}>
      <div className='h-auto w-full bg-gray-900 text-white py-1'>
        <h2 className="md:text-6xl text-4xl font-[900] leading-3 text-center my-20">ABOUT <span className='text-yellow-500'>ME</span></h2>

        <div className='flex flex-col md:flex-row w-9/12 mx-auto md:gap-10'>
          <div className='md:w-2/12 md:m-auto md:scale-150 md:hidden md:h-1/2'>
            <img
              src={myimg}
              alt="Profile"
              className="rounded-full md:rounded-none h-[250px] w-[250px] md:h-full md:w-full mx-auto mb-4 object-cover border-4 border-gray-800 shadow-md"
            />
          </div>

          <div className="flex flex-wrap mb-4 flex-1 text-center md:text-start">
            <div className="w-full sm:w-1/2">
              <p className="mb-4"><span className="font-bold">First Name:</span> Hamza</p>
              <p className="mb-4"><span className="font-bold">Last Name:</span> Ben Ali</p>
              <p className="mb-4"><span className="font-bold">Age:</span> 21 Years</p>
              <p className="mb-4"><span className="font-bold">Nationality:</span> Tunisian</p>

            </div>
            <div className="w-full sm:w-1/2">
              <p className="mb-4"><span className="font-bold">Address:</span> Tunisia</p>
              <p className="mb-4"><span className="font-bold">Phone:</span> +91 9893340323</p>
              <p className="mb-4"><span className="font-bold">Email:</span> hamzabenali@gmail.com</p>
              <p className="mb-4"><span className="font-bold">Languages:</span> Arabic, English, French</p>
            </div>
            <button className="text-white px-3 w-48 font-semibold border border-orange-400 py-3 my-4 flex items-center justify-center rounded-full mx-auto hover:bg-orange-400 hover:text-white transition-all duration-300">
              Download Resume
            </button>
          </div>

          <div className="flex flex-wrap justify-center flex-1 md:gap-6 mx-auto">
            <div className='flex flex-col md:flex-row md:gap-6 w-full'>
              <div className='p-4 px-6 border flex flex-col justify-center text-center md:w-2/5'>
                <span className='text-5xl text-yellow-500 font-extrabold'>3+</span>
                <span className='mt-2'>YEARS OF EXPERIENCE</span>
              </div>
              <div className='p-4 px-6 border flex flex-col justify-center text-center flex-1'>
                <span className='text-5xl text-yellow-500 font-extrabold'>1000+</span>
                <span className='mt-2'>LEETCODE QUESTIONS SOLVED</span>
              </div>
            </div>
            <div className='flex flex-col md:flex-row md:gap-6 w-full'>
              <div className='p-4 px-6 border flex flex-col justify-center text-center md:w-2/5'>
                <span className='text-5xl text-yellow-500 font-extrabold'>100+</span>
                <span className='mt-2'>FULL STACK PROJECTS</span>
              </div>
              <div className='p-4 px-6 border flex flex-col justify-center text-center flex-1'>
                <span className='text-5xl text-yellow-500 font-extrabold'>25+</span>
                <span className='mt-2'>MODERN TECHNOLOGIES SKILLED</span>
              </div>
            </div>
          </div>
        </div>

        <MySkills />
        <ExperienceEducation />
      </div>
    </PageTransition>
  );
};

export default AboutMe;
