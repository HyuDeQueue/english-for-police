import React, { useState } from 'react';

interface ReflexWheelProps {
  prompt: string;
  answer: string;
  onCorrect: () => void;
}

export const ReflexWheel: React.FC<ReflexWheelProps> = ({ prompt, answer, onCorrect }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const spin = () => {
    setIsSpinning(true);
    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

  const startRecording = () => {
    interface ISpeechRecognitionEvent {
      results: { [key: number]: { [key: number]: { transcript: string } } };
    }
    interface ISpeechRecognition extends EventTarget {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: () => void;
      onresult: (event: ISpeechRecognitionEvent) => void;
      onerror: (event: { error: string }) => void;
      onend: () => void;
      start: () => void;
    }
    interface ISpeechRecognitionConstructor {
      new (): ISpeechRecognition;
    }

    const SpeechRecognition = (window as unknown as { SpeechRecognition: ISpeechRecognitionConstructor }).SpeechRecognition || 
                               (window as unknown as { webkitSpeechRecognition: ISpeechRecognitionConstructor }).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('Listening for final response...');
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      if (text.toLowerCase().includes(answer.toLowerCase().split(' ')[0])) {
         onCorrect();
      }
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'aborted') return;
      
      console.error('Speech Recognition Error:', event.error);
      const errorMsgs: Record<string, string> = {
        'network': 'Network Error: Google servers unreachable. Try Microsoft Edge or check internet.',
        'not-allowed': 'Permission Denied: Please enable microphone access.',
        'no-speech': 'No voice detected. Please try again.'
      };
      setTranscript(errorMsgs[event.error] || `Error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  return (
    <div className="reflex-practice">
       <div className="wheel-container">
          <div className="wheel-arrow"></div>
          <div className="reflex-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
            <span style={{ transform: `rotate(-${rotation}deg)`, transition: 'transform 3s' }}>
              {isSpinning ? 'SPINNING...' : 'TARGET'}
            </span>
          </div>
       </div>
       <div className="text-center reflex-controls">
         <button onClick={spin} disabled={isSpinning} className="secondary spin-btn">SPIN REFLEX WHEEL</button>
         {!isSpinning && rotation > 0 && (
           <div className="speaking-task animate-fade-in">
             <p className="vn-prompt-reflex">SAY THE ENGLISH FOR: <br/><strong>{prompt}</strong></p>
             <button 
               className={`mic-btn ${isRecording ? 'active' : ''}`} 
               onClick={startRecording}
             >
               {isRecording ? '🛑 LISTENING...' : '🎤 START RECORDING'}
             </button>
             {transcript && <div className="transcript">Detected: "{transcript}"</div>}
           </div>
         )}
       </div>
    </div>
  );
};
