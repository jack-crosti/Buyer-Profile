"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { inputHover, checkboxRipple, labelPulse, progressGlow, checkmarkAnimation, playClickSound, playSuccessSound } from '../lib/utils/animations';
import ConfettiEffect from './ConfettiEffect';

type FormData = {
  name: string;
  mobile: string;
  email: string;
  location: string;
  type: string;
  typeOther: string;
  preferredLocation: string;
  preferredLocationOther: string;
  budget: string;
  experience: string;
  currentJob: string;
  currentJobOther: string;
  pastPurchase: string;
  familiarity: string;
  capital: string;
  financeReady: string;
  vendorFinance: string;
  motivation: string;
  motivationOther: string;
  idealDay: string;
  nonNegotiable: string;
  nonNegotiableOther: string;
  offMarketAccess: string;
  nextStep: string;
  finalNotes: string;
};

type Step = number | 'done' | 'details';

const BuyerInfoForm = () => {
  const [step, setStep] = useState<Step>(1);
  const [showContent, setShowContent] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    email: '',
    location: '',
    type: '',
    typeOther: '',
    preferredLocation: '',
    preferredLocationOther: '',
    budget: '',
    experience: '',
    currentJob: '',
    currentJobOther: '',
    pastPurchase: '',
    familiarity: '',
    capital: '',
    financeReady: '',
    vendorFinance: '',
    motivation: '',
    motivationOther: '',
    idealDay: '',
    nonNegotiable: '',
    nonNegotiableOther: '',
    offMarketAccess: '',
    nextStep: '',
    finalNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Start the animation sequence after component mount
    const timer1 = setTimeout(() => {
      setIsBlurred(true);
    }, 500);

    const timer2 = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Add debounce to prevent performance issues
      requestAnimationFrame(() => {
        setParallaxOffset(window.scrollY * 0.1);
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    try {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when user types
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    } catch (error) {
      console.error('Error handling form change:', error);
    }
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateStep = () => {
    const requiredFields: Record<number, (keyof FormData)[]> = {
      1: [],
      2: ['name', 'mobile', 'email'],
      3: ['type'],
      4: ['preferredLocation'],
      5: ['budget'],
      6: ['experience', 'currentJob'],
      7: ['capital', 'financeReady'],
      8: ['motivation', 'idealDay'],
      9: ['nextStep']
    };

    if (typeof step !== 'number') return true;

    const stepFields = requiredFields[step];
    if (!stepFields) return true;

    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    stepFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      playClickSound();
      // Reduce the delay to ensure content appears quickly
      setTimeout(() => {
        if (typeof step === 'number') {
          setStep(step + 1);
        }
      }, 50);
    } else {
      setSubmitError('Please fill in all required fields.');
    }
  };

  const handleBack = () => {
    playClickSound();
    // Reduce the delay to ensure content appears quickly
    setTimeout(() => {
      setStep((step as number) - 1);
    }, 50);
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      setSubmitError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setShowConfetti(true);
      playSuccessSound();
      setStep('done');
      
      // Hide confetti after 3 seconds but stay on done page
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLater = () => {
    setStep('details');
  };

  const renderOtherInput = (fieldName: string, otherFieldName: keyof FormData) => {
    if (formData[fieldName as keyof FormData] === 'Other') {
      const wordCount = countWords(formData[otherFieldName]);
      return (
        <div className="mt-2">
          <textarea
            name={otherFieldName}
            value={formData[otherFieldName]}
            onChange={handleChange}
            placeholder="Please specify (max 200 words)"
            className={`w-full bg-[#0E1A2B] border border-[#384352] p-3 rounded-lg text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] ${errors[otherFieldName] ? 'border-red-500' : ''}`}
            rows={3}
            maxLength={1000}
          />
          <div className="text-right text-sm text-[#D1D5DB] mt-1">
            {wordCount}/200 words
          </div>
          {errors[otherFieldName] && <p className="text-red-500 text-sm mt-1">Please specify your answer</p>}
          {wordCount > 200 && <p className="text-red-500 text-sm mt-1">Please limit your response to 200 words</p>}
        </div>
      );
    }
    return null;
  };

  const renderHeader = () => (
    <div className="flex flex-col items-center mb-12">
      {typeof step === 'number' && step > 2 && formData.name && (
        <h2 className="text-2xl font-bold text-white mt-4">
          {formData.name} Buyer
        </h2>
      )}
    </div>
  );

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }
  };

  const stepFadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }
  };

  const progressWidth = ((step as number) - 1) * (100 / 8);

  const renderProgressBar = () => (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="h-1 bg-[#384352]">
        <motion.div 
          className="h-full bg-[#F4C542]"
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );

  const buttonVariants = {
    initial: { 
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
      transition: { duration: 0.1 }
    }
  };

  const checkboxVariants = {
    initial: { scale: 1 },
    checked: { 
      scale: 1.1,
      backgroundColor: "#F4C542",
      transition: { duration: 0.2 }
    },
    unchecked: { 
      scale: 1,
      backgroundColor: "transparent",
      transition: { duration: 0.2 }
    }
  };

  const renderCheckboxGroup = (options: string[], fieldName: keyof FormData, label: string) => (
    <div className="space-y-4">
      <label className="block text-[#D1D5DB] mb-2 text-center">{label}</label>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <motion.label 
            key={option}
            className={`flex items-center p-4 rounded-lg cursor-pointer border-2 border-[#384352] ${
              formData[fieldName]?.includes(option) ? 'bg-[#F4C542] border-[#F4C542]' : 'bg-transparent'
            }`}
            variants={checkboxVariants}
            initial="initial"
            animate={formData[fieldName]?.includes(option) ? "checked" : "unchecked"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input 
              type="checkbox" 
              name={fieldName} 
              value={option}
              checked={formData[fieldName]?.includes(option)}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  [fieldName]: e.target.checked 
                    ? prev[fieldName] ? prev[fieldName] + ',' + value : value
                    : prev[fieldName]?.split(',').filter(t => t !== value).join(',') || ''
                }));
              }}
              className="hidden"
            />
            <span className={`text-center w-full ${formData[fieldName]?.includes(option) ? 'text-[#0E1A2B]' : 'text-[#D1D5DB]'}`}>
              {option}
            </span>
          </motion.label>
        ))}
      </div>
      {errors[fieldName] && <p className="text-red-500 text-sm mt-1 text-center">Please select at least one option</p>}
    </div>
  );

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 100, damping: 20, duration: 1.2, delay: 0.1 },
        opacity: { duration: 1.2, delay: 0.1 }
      }
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 100, damping: 20, duration: 1.2, delay: 0.1 },
        opacity: { duration: 1.2, delay: 0.1 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 100, damping: 20, duration: 1.62 },
        opacity: { duration: 1.62 }
      }
    })
  };

  const renderError = (field: keyof FormData) => {
    if (!errors[field]) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm mt-1"
      >
        This field is required
      </motion.p>
    );
  };

  const renderSubmitError = () => {
    if (!submitError) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span className="block sm:inline">{submitError}</span>
      </motion.div>
    );
  };

  const renderSubmitButton = () => {
    const isLastStep = step === 9;
    
    return (
      <motion.button
        type="button"
        onClick={isLastStep ? handleSubmit : handleNext}
        disabled={isSubmitting}
        className="px-6 py-3 bg-[#F4C542] text-[#0E1A2B] rounded-xl font-bold hover:bg-[#F4C542]/90 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-[#0E1A2B] rounded-full animate-spin mr-2"></div>
            Submitting...
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>{isLastStep ? 'Submit My Profile' : 'Next'}</span>
            {!isLastStep && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        )}
      </motion.button>
    );
  };

  if (step === 'done') {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden bg-[url('/background-mobile.jpg')] md:bg-[url('/background.jpg')] lg:bg-[url('/background.jpg')]"
        style={{ 
          backgroundPositionY: `${parallaxOffset}px`,
          transition: 'background-position 0.1s ease-out'
        }}
      >
        <motion.div 
          className="absolute inset-0"
          animate={{
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)"
          }}
          initial={{
            backdropFilter: "blur(0px)",
            backgroundColor: "rgba(0, 0, 0, 0)"
          }}
          transition={{ 
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1]
          }}
        />
        <motion.div 
          className="relative z-10 max-w-md w-full mx-auto p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-[#0E1A2B]/90 rounded-2xl p-8 backdrop-blur-md shadow-xl border border-white/10">
            <motion.div 
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-white">Thanks {formData.name}!</h1>
              <p className="text-[#D1D5DB] text-lg">I'll review this and get back to you with business options tailored to your answers.</p>
              
              <div className="pt-4 space-y-6">
                <p className="text-white font-medium">Get in touch with me directly:</p>
                <div className="space-y-4">
                  <motion.a 
                    href="tel:0210909525" 
                    className="w-full block px-6 py-4 bg-[#F4C542] text-[#0E1A2B] rounded-xl font-bold hover:bg-[#F4C542]/90 transition-all duration-200 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    📞 Call Jack Crosti
                  </motion.a>
                  
                  <motion.a 
                    href="mailto:jack@cmbusiness.co.nz" 
                    className="w-full block px-6 py-4 bg-[#F4C542] text-[#0E1A2B] rounded-xl font-bold hover:bg-[#F4C542]/90 transition-all duration-200 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    ✉️ Email Jack
                  </motion.a>
                  
                  <motion.a 
                    href="https://outlook.office.com/bookwithme/user/d2299bdac90442e4b62fe21d4f7445ba%40cmbusiness.co.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block px-6 py-4 bg-[#F4C542] text-[#0E1A2B] rounded-xl font-bold hover:bg-[#F4C542]/90 transition-all duration-200 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    📅 Book a Meeting
                  </motion.a>

                  <motion.button
                    onClick={handleLater}
                    className="w-full mt-8 px-6 py-4 bg-[#F4C542] text-[#0E1A2B] rounded-xl font-bold hover:bg-[#F4C542]/90 transition-all duration-200 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    I'll Do This Later
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="min-h-screen bg-no-repeat relative" 
           style={{ 
             backgroundImage: "url('/business-card.jpg')",
             backgroundSize: "100% 100%",
             backgroundPosition: "center"
           }}>
        <style jsx>{`
          @media (min-width: 768px) {
            div {
              background-image: url('/business-card-tablet.jpg') !important;
            }
          }
          @media (min-width: 1024px) {
            div {
              background-image: url('/business-card-desktop.jpg') !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden bg-[url('/background-mobile.jpg')] md:bg-[url('/background.jpg')] lg:bg-[url('/background.jpg')]"
      style={{ 
        backgroundPositionY: `${parallaxOffset}px`,
        transition: 'background-position 0.1s ease-out'
      }}
    >
      {showConfetti && <ConfettiEffect />}
      
      {step > 1 && (
        <motion.div 
          className="w-full max-w-2xl mx-auto mb-8"
          animate={progressGlow}
        >
          {renderProgressBar()}
        </motion.div>
      )}

      <motion.div 
        className="absolute inset-0"
        animate={{
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)"
        }}
        initial={{
          backdropFilter: "blur(0px)",
          backgroundColor: "rgba(0, 0, 0, 0)"
        }}
        transition={{ 
          duration: 0.6,
          ease: [0.645, 0.045, 0.355, 1]
        }}
      />

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8">
        <AnimatePresence mode="wait" custom={step}>
          {step === 1 ? (
            showContent && (
              <motion.div 
                key="step1"
                className="w-full max-w-lg mx-auto p-6 sm:p-8 md:p-10 bg-[#0E1A2B]/90 rounded-2xl backdrop-blur-md shadow-2xl border border-white/10"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <motion.div 
                  className="text-center space-y-6"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="space-y-4">
                    <motion.h2 
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4,
                        delay: 0.2,
                        ease: [0.645, 0.045, 0.355, 1]
                      }}
                    >
                      Let's find your perfect business.
                    </motion.h2>
                    <motion.p 
                      className="text-[#D1D5DB] text-sm sm:text-base md:text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        duration: 0.4,
                        delay: 0.3,
                        ease: [0.645, 0.045, 0.355, 1]
                      }}
                    >
                      Answer a few questions to help us match you with the right business opportunities.
                    </motion.p>
                  </div>
                  <motion.button 
                    onClick={handleNext} 
                    className="w-full mt-6 sm:mt-8 bg-[#F4C542] text-[#0E1A2B] px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#F4C542]/90 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    variants={buttonVariants}
                    initial={{ ...buttonVariants.initial, opacity: 0, y: 20 }}
                    whileHover="hover"
                    whileTap="tap"
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.4,
                      ease: [0.645, 0.045, 0.355, 1]
                    }}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </motion.div>
            )
          ) : (
            <motion.div 
              key={`step-${step}`}
              className="w-full max-w-lg mx-auto p-6 sm:p-8 md:p-10 bg-[#0E1A2B]/90 rounded-2xl backdrop-blur-md shadow-2xl border border-white/10"
              custom={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <motion.form 
                onSubmit={(e) => { e.preventDefault(); step === 9 ? handleSubmit() : handleNext(); }} 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.2
                }}
              >
                <motion.div 
                  className="mb-6 sm:mb-8 text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.3,
                    ease: [0.645, 0.045, 0.355, 1]
                  }}
                >
                  <motion.h2 
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.4,
                      ease: [0.645, 0.045, 0.355, 1]
                    }}
                  >
                    {step === 2 && "About You"}
                    {step === 3 && "What Are You Looking For?"}
                    {step === 4 && "Where Would You Like It?"}
                    {step === 5 && "What's Your Budget?"}
                    {step === 6 && "Experience & Background"}
                    {step === 7 && "Financial Snapshot"}
                    {step === 8 && "Fit & Personality"}
                    {step === 9 && "Let's Stay Connected"}
                  </motion.h2>
                </motion.div>

                <motion.div 
                  className="space-y-4 sm:space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.5,
                    ease: [0.645, 0.045, 0.355, 1]
                  }}
                >
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#D1D5DB] mb-2 text-center text-sm sm:text-base">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50 ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {renderError('name')}
                      </div>

                      <div>
                        <label className="block text-[#D1D5DB] mb-2 text-center text-sm sm:text-base">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {renderError('email')}
                      </div>

                      <div>
                        <label className="block text-[#D1D5DB] mb-2 text-center text-sm sm:text-base">Phone Number</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          className={`w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50 ${errors.mobile ? 'border-red-500' : ''}`}
                        />
                        {renderError('mobile')}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      {renderCheckboxGroup(
                        ['Cafe', 'Restaurant', 'Bar', 'Pizza Shop', 'Takeaway', 'Other'],
                        'type',
                        'What type of business are you looking for?'
                      )}
                      {formData.type?.includes('Other') && (
                        <div className="mt-4">
                          <label className="block text-[#D1D5DB] mb-2 text-center text-sm sm:text-base">Please specify other business type</label>
                          <textarea
                            name="typeOther"
                            value={formData.typeOther || ''}
                            onChange={handleChange}
                            className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                            rows={2}
                            maxLength={200}
                            placeholder="Describe the type of business (max 200 characters)"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      {renderCheckboxGroup(
                        ['Anywhere in Auckland', 'Central Auckland', 'East Auckland', 'West Auckland', 'South Auckland', 'Other'],
                        'preferredLocation',
                        'Preferred Location(s)'
                      )}
                      {formData.preferredLocation?.includes('Other') && (
                        <div className="mt-4">
                          <label className="block text-[#D1D5DB] mb-2 text-center text-sm sm:text-base">Please specify other location</label>
                          <textarea
                            name="preferredLocationOther"
                            value={formData.preferredLocationOther || ''}
                            onChange={handleChange}
                            className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                            rows={2}
                            maxLength={200}
                            placeholder="Describe your preferred location (max 200 characters)"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4">
                      <div>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">What's your budget range?</option>
                          <option value="Under $100k">Under $100k</option>
                          <option value="$100k–$300k">$100k–$300k</option>
                          <option value="$300k–$700k">$300k–$700k</option>
                          <option value="$700k+">$700k+</option>
                        </select>
                        {errors.budget && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-4">
                      <div>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">Any experience in this industry?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.experience && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                      <div>
                        <select
                          name="currentJob"
                          value={formData.currentJob}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">What's your current role?</option>
                          <option value="Business Owner">Business Owner</option>
                          <option value="Manager">Manager</option>
                          <option value="Employee">Employee</option>
                          <option value="Student">Student</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.currentJob && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                        {renderOtherInput('currentJob', 'currentJobOther')}
                      </div>
                      <div>
                        <select
                          name="pastPurchase"
                          value={formData.pastPurchase}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">Have you purchased a business before?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.pastPurchase && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                      <div>
                        <select
                          name="familiarity"
                          value={formData.familiarity}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">How familiar are you with ownership</option>
                          <option value="Very">Very</option>
                          <option value="Somewhat">Somewhat</option>
                          <option value="Not at all">Not at all</option>
                        </select>
                        {errors.familiarity && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                    </div>
                  )}

                  {step === 7 && (
                    <div className="space-y-4">
                      <div>
                        <select
                          name="capital"
                          value={formData.capital}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">What funds do you have ready?</option>
                          <option value="Under $100k">Under $100k</option>
                          <option value="$100k–$300k">$100k–$300k</option>
                          <option value="$300k–$700k">$300k–$700k</option>
                          <option value="$700k+">$700k+</option>
                        </select>
                        {errors.capital && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                      <div>
                        <select
                          name="financeReady"
                          value={formData.financeReady}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">Planning to apply for a loan?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.financeReady && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                      <div>
                        <select
                          name="vendorFinance"
                          value={formData.vendorFinance}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">Would you consider vendor finance?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Open to it">Open to it</option>
                        </select>
                        {errors.vendorFinance && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                    </div>
                  )}

                  {step === 8 && (
                    <div className="space-y-4">
                      <div>
                        <select
                          name="motivation"
                          value={formData.motivation}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">Reason behind buying a business?</option>
                          <option value="Financial Independence">Financial Independence</option>
                          <option value="Lifestyle Change">Lifestyle Change</option>
                          <option value="Career Change">Career Change</option>
                          <option value="Investment">Investment</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.motivation && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                        {renderOtherInput('motivation', 'motivationOther')}
                      </div>
                      <div>
                        <select
                          name="idealDay"
                          value={formData.idealDay}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">What would your ideal day look like?</option>
                          <option value="Hands-on Management">Hands-on Management</option>
                          <option value="Strategic Planning">Strategic Planning</option>
                          <option value="Part-time Involvement">Part-time Involvement</option>
                          <option value="Remote Management">Remote Management</option>
                        </select>
                        {errors.idealDay && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                      <div>
                        <select
                          name="nonNegotiable"
                          value={formData.nonNegotiable}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">What's non-negotiable for you?</option>
                          <option value="Location">Location</option>
                          <option value="Price">Price</option>
                          <option value="Industry">Industry</option>
                          <option value="Work Hours">Work Hours</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.nonNegotiable && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                        {renderOtherInput('nonNegotiable', 'nonNegotiableOther')}
                      </div>
                      <div>
                        <select
                          name="offMarketAccess"
                          value={formData.offMarketAccess}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">Interested in off-market business deals?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.offMarketAccess && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                    </div>
                  )}

                  {step === 9 && (
                    <div className="space-y-4">
                      <div>
                        <select
                          name="nextStep"
                          value={formData.nextStep}
                          onChange={(e) => {
                            handleChange(e);
                            if (e.target.value === "I'd like to speak to Jack Crosti") {
                              alert("Almost there! Just hit 'Submit My Profile' to move forward");
                            }
                          }}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                        >
                          <option value="">What would you like to do next?</option>
                          <option value="Send me matching listings">Send me matching listings</option>
                          <option value="Help me shortlist">Help me shortlist</option>
                          <option value="I'd like to speak to Jack Crosti">I'd like to speak to Jack Crosti</option>
                        </select>
                        {errors.nextStep && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                      <div>
                        <textarea
                          name="finalNotes"
                          placeholder="Any final notes or questions?"
                          value={formData.finalNotes}
                          onChange={handleChange}
                          className="w-full bg-[#0E1A2B] border border-[#384352] p-4 rounded-xl text-white placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-center shadow-inner transition-all duration-200 hover:border-[#F4C542]/50"
                          rows={4}
                        />
                        {errors.finalNotes && <p className="text-red-500 text-sm mt-1">This field is required</p>}
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  className="flex justify-between mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.6,
                    ease: [0.645, 0.045, 0.355, 1]
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 bg-[#384352] text-white rounded-xl font-medium hover:bg-[#384352]/90 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </motion.button>
                  
                  {renderSubmitError()}
                  {renderSubmitButton()}
                </motion.div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BuyerInfoForm; 