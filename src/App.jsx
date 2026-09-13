import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ASSISTANT_STATES } from './constants/assistant.js';
import { Header } from './components/Header/Header.jsx';
import { HeroSection } from './components/Hero/HeroSection.jsx';
import { IshaRobot3D } from './components/Robot/IshaRobot3D.jsx';
import { RobotOverlay } from './components/Robot/RobotOverlay.jsx';
import { StatusIndicator } from './components/StatusIndicator/StatusIndicator.jsx';
import { ScrollIndicator } from './components/ScrollIndicator/ScrollIndicator.jsx';
import { AboutSection } from './components/About/AboutSection.jsx';
import { FeaturesSection } from './components/Features/FeaturesSection.jsx';
import { FuturisticBackground } from './components/Background/FuturisticBackground.jsx';
import { SystemConsoleModal } from './components/Diagnostics/SystemConsoleModal.jsx';
import {
  startVoiceListening,
  stopVoiceListening,
  executeVoiceCommand,
} from './controllers/speechController.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [assistantState, setAssistantState] = useState(ASSISTANT_STATES.OFFLINE);
  const [isRobotHovered, setIsRobotHovered] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [lastUserRequest, setLastUserRequest] = useState(null);
  const [lastSpeechFeedback, setLastSpeechFeedback] = useState(null);
  const [isMicActive, setIsMicActive] = useState(false);

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);

  // Toggle Continuous Microphone & Wake Word Listening Engine
  const toggleMicActivation = useCallback(() => {
    setIsMicActive((prev) => {
      const nextState = !prev;
      if (nextState) {
        const success = startVoiceListening({
          onStateChange: (state) => setAssistantState(state),
          onRequest: (userReq) => setLastUserRequest(userReq),
          onFeedback: (feedbackText) => setLastSpeechFeedback(feedbackText),
          onError: (errMsg) => {
            console.warn(errMsg);
            setIsMicActive(false);
            setAssistantState(ASSISTANT_STATES.OFFLINE);
          },
        });
        if (!success) {
          return false;
        }
      } else {
        stopVoiceListening();
        setAssistantState(ASSISTANT_STATES.OFFLINE);
        setLastUserRequest(null);
        setLastSpeechFeedback(null);
      }
      return nextState;
    });
  }, []);

  // Automatically start voice listening on mount so ISHA is listening at all times
  useEffect(() => {
    const autoStartTimer = setTimeout(() => {
      const success = startVoiceListening({
        onStateChange: (state) => setAssistantState(state),
        onRequest: (userReq) => setLastUserRequest(userReq),
        onFeedback: (feedbackText) => setLastSpeechFeedback(feedbackText),
        onError: (errMsg) => {
          console.warn(errMsg);
          setIsMicActive(false);
        },
      });
      if (success) {
        setIsMicActive(true);
      }
    }, 500);

    return () => {
      clearTimeout(autoStartTimer);
      stopVoiceListening();
    };
  }, []);

  // Scroll navigation
  const scrollToSection = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      homeRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'about') {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'features') {
      featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextScroll = () => {
    if (activeTab === 'home') {
      scrollToSection('about');
    } else if (activeTab === 'about') {
      scrollToSection('features');
    } else {
      scrollToSection('home');
    }
  };

  // IntersectionObserver to update active header tab on scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0.1,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === homeRef.current) {
            setActiveTab('home');
          } else if (entry.target === aboutRef.current) {
            setActiveTab('about');
          } else if (entry.target === featuresRef.current) {
            setActiveTab('features');
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    if (homeRef.current) observer.observe(homeRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);

    return () => observer.disconnect();
  }, []);

  // Run test command with Neural TTS & Eye Synchrony
  const handleRunCommand = (cmd) => {
    executeVoiceCommand(cmd, {
      onStateChange: (state) => setAssistantState(state),
      onRequest: (userReq) => setLastUserRequest(userReq),
      onFeedback: (feedbackText) => setLastSpeechFeedback(feedbackText),
    });
  };

  return (
    <div
      id="isha-app-root"
      className="relative min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black overflow-x-hidden font-['Space_Grotesk',sans-serif]"
    >
      {/* Background Ambience */}
      <FuturisticBackground />

      {/* Minimal Header */}
      <Header
        activeTab={activeTab}
        onTabChange={scrollToSection}
        onOpenConsole={() => setIsConsoleOpen(true)}
      />

      {/* Main Hero Screen */}
      <div
        ref={homeRef}
        id="hero-screen"
        className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-between pt-20 lg:pt-0 overflow-hidden"
      >
        {/* Left Side: Large I.S.H.A Typography, Active Response Panel Below Title, & Voice Toggle */}
        <div className="w-full lg:w-1/2 flex items-center justify-start py-12 lg:py-0">
          <HeroSection
            isMicActive={isMicActive}
            onToggleMic={toggleMicActivation}
            lastUserRequest={lastUserRequest}
            lastSpeechFeedback={lastSpeechFeedback}
            assistantState={assistantState}
          />
        </div>

        {/* Right Side: Master 3D Robot Model */}
        <div
          id="robot-display-zone"
          className="relative w-full lg:w-1/2 h-[400px] sm:h-[450px] lg:h-[490px] flex items-center justify-center pointer-events-auto"
        >
          {/* Hover Me Prompt with Curved Technical Arrow */}
          <RobotOverlay isHovered={isRobotHovered} />

          {/* Master Three.js 3D Robot Canvas */}
          <IshaRobot3D
            assistantState={assistantState}
            onHoverChange={setIsRobotHovered}
            className="w-full h-full"
          />
        </div>

        {/* Bottom-Left Status Indicator & Voice Mic Toggle */}
        <StatusIndicator
          state={assistantState}
          isMicActive={isMicActive}
          onToggleMic={toggleMicActivation}
          onClickConsole={() => setIsConsoleOpen(true)}
        />

        {/* Right-Side Vertical "SCROLL" Indicator */}
        <ScrollIndicator onScrollClick={handleNextScroll} />
      </div>

      {/* About Section */}
      <div ref={aboutRef}>
        <AboutSection />
      </div>

      {/* Features Section */}
      <div ref={featuresRef}>
        <FeaturesSection />
      </div>

      {/* Technical Diagnostic Console */}
      <SystemConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        currentState={assistantState}
        onStateChange={setAssistantState}
        onRunTestCommand={handleRunCommand}
      />
    </div>
  );
}
