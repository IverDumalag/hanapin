import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import bgTemplate from './assets/BG TEMPLATE.png';

const LandingPage = () => {
   const navigate = useNavigate();

   const redirectToLogin = () => {
      navigate('/login');
   };

   const redirectToRegister = () => {
      navigate('/register');
   };

   return (
         <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0, fontFamily: 'Inter, sans-serif' }}>
            
            <img src={bgTemplate} alt="BG TEMPLATE" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />
            
                   <div
                        style={{
                        position: 'absolute',
                        top: '280px', // Y-coordinate
                        left: '440px', // X-coordinate
                     }}
                  >
                     <h1
                        style={{
                           fontSize: '45px',
                           color: '#AFB0CE',
                           marginBottom: '0',
                           fontWeight: 'lighter'
                     }}
                  >
                        Hana<span style={{ color: '#BA96DD' }}>PIN,</span>
                     </h1>

                  </div>
                     {/* //eto ung sa description */}
                     <p
                        style={{
                        fontSize: '65px',
                        color: '#F5BEDB',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        position: 'absolute',
                        top: '-20px', // Y-coordinate
                        left: '440px', // X-coordinate
                        marginTop: '400px',
                     }}
                     >
                        Helps Paws find 

                     </p>

                     <p 
                        style={{
                        fontSize: '65px',
                        color: '#F5BEDB',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        position: 'absolute',
                        top: '45px', // Y-coordinate
                        left: '440px', // X-coordinate
                        marginTop: '400px',
                     }}
                     >
                        their way home        
                     </p>

                     <p
                        style={{
                        fontSize: '24px',
                        color: '#000000',
                        fontWeight: 'lighter',
                        textAlign: 'center',
                        position: 'absolute',
                        top: '169px', // Y-coordinate
                        left: '440px', // X-coordinate
                        marginTop: '400px',
                     }}
                     >
                        description
                     </p>

                        <div style={{ textAlign: 'center'}}>

                           <button onClick={redirectToLogin} style={{ marginRight: '10px', fontSize: 32}}>
                              LOGIN
                           </button>

                           <button onClick={redirectToRegister} style={{ marginRight: '10px', fontSize: 32, color: 'white'}}>
                              REGISTER
                           </button>
                  </div>
      </div>
   );
};

export default LandingPage;