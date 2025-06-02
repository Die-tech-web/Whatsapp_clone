
import { CONTACTS } from './data.js';

export function afficherMessageValidation(message, type = 'error') {
    const existingMessage = document.getElementById('validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = createElement('div', {
        id: 'validation-message',
        class: `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            type === 'error' 
                ? 'bg-red-500 text-white border border-red-600' 
                : type === 'success'
                ? 'bg-green-500 text-white border border-green-600'
                : 'bg-blue-500 text-white border border-blue-600'
        }`,
        style: {
            minWidth: '300px',
            maxWidth: '500px'
        }
    }, [
        createElement('div', {
            class: 'flex items-center justify-between'
        }, [
            createElement('div', {
                class: 'flex items-center'
            }, [
                createElement('i', {
                    class: `fas ${
                        type === 'error' 
                            ? 'fa-exclamation-triangle' 
                            : type === 'success'
                            ? 'fa-check-circle'
                            : 'fa-info-circle'
                    } mr-2`
                }),
                createElement('span', {
                    class: 'text-sm font-medium'
                }, message)
            ]),
            createElement('button', {
                class: 'ml-4 text-white hover:text-gray-200',
                onClick: function() {
                    const msg = document.getElementById('validation-message');
                    if (msg) msg.remove();
                }
            }, createElement('i', {
                class: 'fas fa-times'
            }))
        ])
    ]);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 10);
    
    setTimeout(() => {
        if (document.getElementById('validation-message')) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 4000);
}

export function afficherErreur(elementId, message) {
    const existingError = document.getElementById(elementId + '_error');
    if (existingError) {
        existingError.remove();
    }
    
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('border-red-400', 'bg-red-50');
        element.classList.remove('border-gray-300', 'focus:border-green-500');
        
        const errorDiv = createElement('div', {
            id: elementId + '_error',
            class: 'mt-1 px-3 py-2 bg-red-100 border border-red-300 rounded-md text-red-600 text-xs flex items-center animate-pulse'
        }, [
            createElement('i', {
                class: 'fas fa-exclamation-triangle mr-2'
            }),
            createElement('span', {}, message)
        ]);
        
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    }
}

export function supprimerErreur(elementId) {
    const existingError = document.getElementById(elementId + '_error');
    if (existingError) {
        existingError.remove();
    }
    
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('border-red-400', 'bg-red-50');
        element.classList.add('border-gray-300');
    }
}

export function validerChamp(id, valeur, type) {
    if (!valeur) {
        const messages = {
            prenom: 'Le prénom est requis',
            nom: 'Le nom est requis',
            numero: 'Le numéro est requis',
            nom_groupe: 'Le nom du groupe est requis',
            description_groupe: 'Une description est requise',
            membres_groupe: 'Sélectionnez au moins un membre'
        };
        afficherErreur(id, messages[id]);
        return false;
    }
    
    if (type === 'numero') {
        if (!/\d/.test(valeur)) { 
            afficherErreur(id, 'Le numéro doit contenir au moins un chiffre'); 
            return false; 
        }
        if (/[a-zA-Z]/.test(valeur)) { 
            afficherErreur(id, 'Les lettres ne sont pas autorisées'); 
            return false; 
        }
        if (valeur.length < 9 || valeur.length > 16) { 
            afficherErreur(id, 'Entre 9 et 16 caractères requis'); 
            return false; 
        }
        if (valeur.startsWith('+') && !/^\+\d+$/.test(valeur)) { 
            afficherErreur(id, 'Format invalide après le "+"'); 
            return false; 
        }
        if (!valeur.startsWith('+') && !/^\d+$/.test(valeur)) { 
            afficherErreur(id, 'Utilisez uniquement des chiffres'); 
            return false; 
        }
        if (CONTACTS.find(c => c.numero === valeur)) { 
            afficherErreur(id, 'Ce numéro existe déjà'); 
            return false; 
        }
    }
    return true;
}

export function rafraichirInterface() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '';
        app.appendChild(window.creerInterface());
    }
}

export function filtrerParRecherche(liste, texte, type = 'contact') {
    if (!texte.trim()) return liste;
    
    if (texte === '*') {
        return [...liste].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    const termeRecherche = texte.toLowerCase();
    
    return liste.filter(item => {
        const nom = item.name.toLowerCase();
        const numero = type === 'contact' ? (item.numero || '').toLowerCase() : '';
        const description = type === 'groupe' ? (item.description || '').toLowerCase() : '';
        
        return nom.includes(termeRecherche) || 
               numero.includes(termeRecherche) ||
               (type === 'groupe' && description.includes(termeRecherche));
    });
}

export function filtrerConversations(conversations, texte) {
    if (!texte.trim()) return conversations;
    
    if (texte === '*') {
        return [...conversations].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    const termeRecherche = texte.toLowerCase();
    
    return conversations.filter(conv => {
        const nom = conv.name.toLowerCase();
        const message = (conv.lastMessage || '').toLowerCase();
        
        return nom.includes(termeRecherche) || message.includes(termeRecherche);
    });
}