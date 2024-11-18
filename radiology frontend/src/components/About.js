import React from 'react';

const About = () => {
  return (
    <div className='about'>
    <div className="bg-[#0A0A23] py-16 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center text-center">
      {/* Features Heading */}
      <h1 className="text-[#60CFFF] text-5xl font-extrabold mb-8">
        About
      </h1>
      <p className="text-gray-400 text-lg mb-8 max-w-3xl">
      Radiology is the medical discipline that uses medical imaging to diagnose and treat diseases within the bodies of animals and humans. A variety of imaging techniques such as X-ray radiography, ultrasound, computed tomography (CT), nuclear medicine including positron emission tomography (PET), fluoroscopy, and magnetic resonance imaging (MRI) are used to diagnose or treat diseases. Interventional radiology is the performance of usually minimally invasive medical procedures with the guidance of imaging technologies such as those mentioned above.

The modern practice of radiology involves several different healthcare professions working as a team. The radiologist is a medical doctor who has completed the appropriate post-graduate training and interprets medical images, communicates these findings to other physicians by means of a report or verbally, and uses imaging to perform minimally invasive medical procedures. The nurse is involved in the care of patients before and after imaging or procedures, including administration of medications, monitoring of vital signs and monitoring of sedated patients. The radiographer, also known as a "radiologic technologist" in some countries such as the United States and Canada, is a specially trained healthcare professional that uses sophisticated technology and positioning techniques to produce medical images for the radiologist to interpret. Depending on the individual's training and country of practice, the radiographer may specialize in one of the above-mentioned imaging modalities or have expanded roles in image reporting. 
        </p>
    </div>
    </div>
  );
};

export default About;
