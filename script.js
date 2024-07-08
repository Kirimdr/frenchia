const HUGGINGFACE_API_KEY = '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';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';

async function translateText(text, sourceLang, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
        console.log(`Tentative de traduction: ${text} de ${sourceLang} vers ${targetLang}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Traduction réussie: ${data[0][0][0]}`);
        return data[0][0][0];
    } catch (error) {
        console.error('Erreur de traduction:', error);
        throw error;
    }
}

async function getAIResponse(message) {
    try {
        console.log(`Message original: ${message}`);
        const englishMessage = await translateText(message, 'fr', 'en');
        console.log(`Message traduit en anglais: ${englishMessage}`);
        
        console.log('Envoi de la requête à Hugging Face API');
        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: englishMessage })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Réponse API:', data);
        
        if (!data[0] || !data[0].generated_text) {
            throw new Error('Réponse API invalide');
        }
        
        const englishResponse = data[0].generated_text;
        console.log(`Réponse en anglais: ${englishResponse}`);
        
        const frenchResponse = await translateText(englishResponse, 'en', 'fr');
        console.log(`Réponse traduite en français: ${frenchResponse}`);
        
        return frenchResponse;
    } catch (error) {
        console.error('Erreur détaillée:', error);
        return "Désolé, une erreur s'est produite. Veuillez réessayer.";
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (message) {
        const chatScreen = document.getElementById('chat-screen');
        
        // Message de l'utilisateur
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'sent');
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        userMessage.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${currentTime}</div>
        `;
        chatScreen.appendChild(userMessage);
        
        userInput.value = '';
        
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('message', 'received', 'loading');
        loadingMessage.innerHTML = `
            <div class="message-content">Yosikkireen...</div>
        `;
        chatScreen.appendChild(loadingMessage);
        chatScreen.scrollTop = chatScreen.scrollHeight;

        try {
            console.log('Début du traitement du message');
            const aiResponse = await getAIResponse(message);
            console.log('Réponse AI reçue');
            loadingMessage.remove();
            const botMessage = document.createElement('div');
            botMessage.classList.add('message', 'received');
            botMessage.innerHTML = `
                <div class="message-content">${aiResponse}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            chatScreen.appendChild(botMessage);
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
            loadingMessage.remove();
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('message', 'received', 'error');
            errorMessage.innerHTML = `
                <div class="message-content">Désolé, une erreur s'est produite. Veuillez réessayer.</div>
            `;
            chatScreen.appendChild(errorMessage);
        }

        chatScreen.scrollTop = chatScreen.scrollHeight;
    }
}

function toggleChatbot() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.classList.toggle('d-none');
    if (!chatContainer.classList.contains('d-none')) {
        document.getElementById('user-input').focus();
    }
}

function autoResizeTextarea() {
    const textarea = document.getElementById('user-input');
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const toggleButton = document.getElementById('toggle-chatbot');

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (userInput) {
        userInput.addEventListener('input', autoResizeTextarea);
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', toggleChatbot);
    }

    // Modifier le message initial
    const initialMessage = document.querySelector('.message.received .message-content');
    if (initialMessage) {
        initialMessage.textContent = "Bonjour! Comment puis-je vous aider aujourd'hui?";
    }
});
