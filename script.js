// Scientific references database
const scientificReferences = {
    anxiety: [
        {
            text: "According to a meta-analysis in the Journal of Clinical Psychology, cognitive behavioral therapy (CBT) has shown significant efficacy in treating anxiety disorders",
            source: "Hofmann, S. G., et al. (2012). The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses"
        },
        {
            text: "Research published in JAMA Psychiatry indicates that mindfulness meditation can help reduce symptoms of anxiety",
            source: "Goyal, M., et al. (2014). Meditation Programs for Psychological Stress and Well-being"
        }
    ],
    depression: [
        {
            text: "The American Journal of Psychiatry reports that a combination of psychotherapy and medication shows the highest efficacy for treating major depression",
            source: "Cuijpers, P., et al. (2020). Psychological Treatment of Depression"
        },
        {
            text: "Studies in the Lancet show that regular physical exercise can be as effective as medication for mild to moderate depression",
            source: "Cooney, G. M., et al. (2013). Exercise for Depression"
        }
    ],
    stress: [
        {
            text: "Research in the Journal of Clinical Psychology shows that regular mindfulness practice can reduce stress levels by up to 40%",
            source: "Khoury, B., et al. (2015). Mindfulness-based stress reduction for healthy individuals"
        },
        {
            text: "Studies in Psychoneuroendocrinology demonstrate that deep breathing exercises can lower cortisol levels",
            source: "Ma, X., et al. (2017). The Effect of Diaphragmatic Breathing on Attention"
        }
    ]
};

// Response templates
const responseTemplates = {
    anxiety: [
        "Based on clinical research, anxiety is a common and treatable condition. {reference} Some effective coping strategies include deep breathing exercises, progressive muscle relaxation, and cognitive restructuring.",
        "It's important to understand that anxiety is your body's natural response to stress. {reference} Professional help and evidence-based treatments can provide significant relief."
    ],
    depression: [
        "Depression is a complex condition that affects both mind and body. {reference} While it can feel overwhelming, there are multiple evidence-based treatments available.",
        "Research shows that a combination of approaches often works best for managing depression. {reference} This might include therapy, lifestyle changes, and in some cases, medication under professional supervision."
    ],
    stress: [
        "Stress management is crucial for mental well-being. {reference} Implementing regular stress-reduction techniques can help you build resilience.",
        "While some stress is normal, chronic stress can impact both mental and physical health. {reference} Evidence-based stress management techniques can help you maintain balance."
    ],
    general: [
        "While I can provide information based on scientific research, it's important to consult with a mental health professional for personalized advice. {reference}",
        "Mental health is complex and unique to each individual. While research provides valuable insights {reference}, professional guidance is essential for proper treatment."
    ]
};

// Initialize elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const voiceInputBtn = document.getElementById('voice-input-btn');
const toggleVoiceBtn = document.getElementById('toggle-voice');
const voiceStatus = document.getElementById('voice-status');

// Speech recognition setup
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
} else {
    voiceInputBtn.style.display = 'none';
}

// Speech synthesis setup
const synthesis = window.speechSynthesis;
let voiceEnabled = true;
let voices = [];

// Load voices immediately and set up change listener
function loadVoices() {
    voices = synthesis.getVoices();
    console.log('Available voices:', voices.map(v => v.name).join(', '));
}

loadVoices();
if (synthesis.onvoiceschanged !== undefined) {
    synthesis.onvoiceschanged = loadVoices;
}

// Voice input handling
if (recognition) {
    recognition.onstart = () => {
        voiceInputBtn.classList.add('recording');
        voiceStatus.textContent = 'Listening...';
    };

    recognition.onend = () => {
        voiceInputBtn.classList.remove('recording');
        voiceStatus.textContent = '';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleUserInput();
    };

    recognition.onerror = (event) => {
        voiceStatus.textContent = 'Error: ' + event.error;
        setTimeout(() => {
            voiceStatus.textContent = '';
        }, 3000);
    };

    voiceInputBtn.addEventListener('click', () => {
        if (voiceInputBtn.classList.contains('recording')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
}

// Voice output handling
toggleVoiceBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    toggleVoiceBtn.classList.toggle('active');
    if (!voiceEnabled) {
        synthesis.cancel();
    }
});

function speakText(text) {
    if (!voiceEnabled) return;
    
    try {
        // Remove HTML tags and references
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/Source:.*$/, '');
        console.log('Speaking text:', cleanText);
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Get current voices if not loaded
        if (voices.length === 0) {
            voices = synthesis.getVoices();
        }
        
        // Find female voice
        const femaleVoice = voices.find(voice => 
            voice.name.includes('Samantha') || 
            voice.name.includes('Female') || 
            (voice.name.includes('en-US') && !voice.name.includes('Male'))
        );
        
        if (femaleVoice) {
            console.log('Using voice:', femaleVoice.name);
            utterance.voice = femaleVoice;
        } else {
            console.log('No female voice found, using default voice');
        }
        
        // Set properties for sultry voice
        utterance.rate = 0.85;  // Slower
        utterance.pitch = 0.9;  // Slightly lower
        utterance.volume = 1;
        
        // Add event handlers
        utterance.onstart = () => console.log('Speech started');
        utterance.onend = () => console.log('Speech ended');
        utterance.onerror = (e) => console.error('Speech error:', e);
        
        // Cancel any ongoing speech
        synthesis.cancel();
        
        // Speak after a short delay to ensure browser is ready
        setTimeout(() => {
            try {
                synthesis.speak(utterance);
            } catch (error) {
                console.error('Speech synthesis error:', error);
            }
        }, 100);
        
    } catch (error) {
        console.error('Speech synthesis error:', error);
    }
}

function handleUserInput() {
    const message = userInput.value.trim();
    if (!message) return;

    // Display user message
    displayMessage(message, 'user');
    userInput.value = '';

    // Generate and display AI response
    const response = generateResponse(message);
    displayMessage(response, 'ai');
    
    // Speak the response
    speakText(response);
}

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    let category = 'general';
    
    if (message.includes('anxiety') || message.includes('anxious') || message.includes('worry')) {
        category = 'anxiety';
    } else if (message.includes('depress') || message.includes('sad') || message.includes('hopeless')) {
        category = 'depression';
    } else if (message.includes('stress') || message.includes('overwhelm') || message.includes('pressure')) {
        category = 'stress';
    }

    const templates = responseTemplates[category];
    const references = scientificReferences[category];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const reference = references[Math.floor(Math.random() * references.length)];

    const response = template.replace('{reference}', reference.text);
    return response + `<div class="reference">Source: ${reference.source}</div>`;
}

// Event listeners
sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});

// Initialize the application
function initializeApp() {
    // Enable voice and update UI
    voiceEnabled = true;
    toggleVoiceBtn.classList.add('active');
    
    // Display initial greeting
    const initialMessage = "Hello! I'm an AI Mental Health Assistant. I can provide information based on scientific research about mental health topics. Please note that I'm not a replacement for professional help. You can type your question or click the microphone icon to speak. How can I assist you today?";
    
    displayMessage(initialMessage, 'ai');
    
    // Add click handler to start speaking
    document.addEventListener('click', function initSpeech() {
        speakText(initialMessage);
        document.removeEventListener('click', initSpeech);
    }, { once: true });
}

// Start the application when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
