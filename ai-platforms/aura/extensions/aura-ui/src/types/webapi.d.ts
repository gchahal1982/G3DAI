/*---------------------------------------------------------------------------------------------
 *  Aura - AI-First VS Code Fork
 *  Copyright (c) Aura Development Team. All rights reserved.
 *  
 *  Web API Type Declarations
 *  Additional type definitions for browser APIs
 *--------------------------------------------------------------------------------------------*/

// Speech Recognition API types
declare global {
    interface Window {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }

    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        grammars: SpeechGrammarList;
        interimResults: boolean;
        lang: string;
        maxAlternatives: number;
        serviceURI: string;

        // Event handlers
        onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

        // Methods
        abort(): void;
        start(): void;
        stop(): void;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
        readonly message: string;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionAlternative {
        readonly confidence: number;
        readonly transcript: string;
    }

    interface SpeechGrammarList {
        readonly length: number;
        addFromString(string: string, weight?: number): void;
        addFromURI(src: string, weight?: number): void;
        item(index: number): SpeechGrammar;
        [index: number]: SpeechGrammar;
    }

    interface SpeechGrammar {
        src: string;
        weight: number;
    }
}

// Export to make this file a module
export {}; 