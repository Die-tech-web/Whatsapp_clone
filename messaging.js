// messaging.js - Système de messagerie avec validation améliorée

import { MESSAGES, CONTACTS, REPONSES_AUTO, activeButtonId } from './data.js';
import { rafraichirInterface, afficherMessageValidation } from './utils.js';

export function creerInterfaceChat(conversation) {
    const messagesConv = MESSAGES.filter(m => 
        (m.expediteur === 'Moi' && m.destinataire === conversation.name) ||
        (m.expediteur === conversation.name && m.destinataire === 'Moi')
    );

    return createElement('div', { class: 'flex flex-col h-full bg-white' }, [
        // EN-TÊTE
        createElement('div', { class: 'flex items-center p-4 border-b bg-green-50' }, [
            createElement('div', { 
                class: `w-12 h-12 ${conversation.type === 'groupe' ? 'bg-purple-600' : 'bg-green-600'} rounded-full flex items-center justify-center text-white font-bold mr-3` 
            }, conversation.avatar),
            createElement('div', { class: 'flex-1' }, [
                createElement('h3', { class: 'font-semibold text-lg' }, conversation.name),
                createElement('p', { class: 'text-sm text-gray-600' }, 
                    conversation.type === 'groupe' ? `${conversation.membres} membres` : 'En ligne'
                )
            ])
        ]),
        
        // ZONE MESSAGES
        createElement('div', { 
            id: 'zone-messages',
            class: 'flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50'
        }, messagesConv.length === 0 ? [
            createElement('div', { class: 'text-center text-gray-500 py-8' }, [
                createElement('i', { class: 'fas fa-comments text-3xl mb-2' }),
                createElement('p', {}, 'Commencez votre conversation !')
            ])
        ] : messagesConv.map(msg => creerBulleMessage(msg))),
        
        // ZONE SAISIE
        creerZoneSaisie(conversation)
    ]);
}

export function creerBulleMessage(message) {
    const estMoi = message.expediteur === 'Moi';
    const heure = new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', minute: '2-digit' 
    });
    
    return createElement('div', { class: `flex ${estMoi ? 'justify-end' : 'justify-start'}` }, [
        createElement('div', { 
            class: `max-w-xs px-4 py-2 rounded-lg ${estMoi ? 'bg-green-500 text-white' : 'bg-white border text-gray-900'}` 
        }, [
            createElement('p', { class: 'text-sm' }, message.contenu),
            createElement('div', { class: `text-xs mt-1 ${estMoi ? 'text-green-100' : 'text-gray-500'}` }, heure)
        ])
    ]);
}

export function creerZoneSaisie(conversation) {
    return createElement('div', { class: 'p-4 border-t bg-white' }, [
        createElement('div', { class: 'flex items-center space-x-3' }, [
            createElement('input', {
                type: 'text',
                id: 'input-message',
                placeholder: `Message à ${conversation.name}...`,
                class: 'flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none',
                onKeyPress: function(e) {
                    if (e.key === 'Enter') {
                        envoyerMessage(conversation);
                    }
                }
            }),
            createElement('button', {
                class: 'w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600',
                onClick: () => envoyerMessage(conversation)
            }, createElement('i', { class: 'fas fa-paper-plane' }))
        ])
    ]);
}

export function envoyerMessage(conversation) {
    const input = document.getElementById('input-message');
    const contenu = input?.value.trim();
    
    if (!contenu) {
        afficherMessageValidation('Veuillez saisir un message avant d\'envoyer', 'error');
        return;
    }
    
    const message = {
        id: Date.now(),
        expediteur: 'Moi',
        destinataire: conversation.name,
        contenu: contenu,
        timestamp: new Date(),
        type: conversation.type || 'contact'
    };
    
    MESSAGES.push(message);
    
    conversation.lastMessage = contenu;
    conversation.time = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', minute: '2-digit' 
    });
    
    input.value = '';
    
    // Message de confirmation
    afficherMessageValidation('Message envoyé avec succès', 'success');
    
    rafraichirInterface();
    
    setTimeout(() => {
        genererReponseAuto(conversation);
    }, 1000 + Math.random() * 2000);
    
    console.log(`Message envoyé à ${conversation.name}: "${contenu}"`);
}

export function genererReponseAuto(conversation) {
    const reponse = REPONSES_AUTO[Math.floor(Math.random() * REPONSES_AUTO.length)];
    
    const messageReponse = {
        id: Date.now() + 1,
        expediteur: conversation.name,
        destinataire: 'Moi',
        contenu: reponse,
        timestamp: new Date(),
        type: conversation.type || 'contact'
    };
    
    MESSAGES.push(messageReponse);
    
    conversation.lastMessage = reponse;
    conversation.time = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', minute: '2-digit' 
    });
    conversation.unread = (conversation.unread || 0) + 1;
    
    rafraichirInterface();
    console.log(`Réponse auto de ${conversation.name}: "${reponse}"`);
}

export function envoyerMessageDiffusion() {
    const contactsSelectionnes = CONTACTS.filter(c => c.selected);
    
    if (contactsSelectionnes.length === 0) {
        afficherMessageValidation('Sélectionnez au moins un contact pour la diffusion', 'error');
        return;
    }
    
    // Créer une interface de saisie pour le message de diffusion
    creerInterfaceSaisieDiffusion(contactsSelectionnes);
}

export function creerInterfaceSaisieDiffusion(contactsSelectionnes) {
    // Supprimer toute interface de diffusion existante
    const existingInterface = document.getElementById('interface-diffusion');
    if (existingInterface) {
        existingInterface.remove();
    }
    
    const interfaceDiffusion = createElement('div', {
        id: 'interface-diffusion',
        class: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    }, [
        createElement('div', {
            class: 'bg-white rounded-lg p-6 w-96 max-w-full mx-4'
        }, [
            createElement('div', {
                class: 'flex items-center justify-between mb-4'
            }, [
                createElement('h3', {
                    class: 'text-lg font-semibold text-gray-800'
                }, 'Message de diffusion'),
                createElement('button', {
                    class: 'text-gray-500 hover:text-gray-700',
                    onClick: function() {
                        document.getElementById('interface-diffusion').remove();
                    }
                }, createElement('i', {
                    class: 'fas fa-times'
                }))
            ]),
            createElement('div', {
                class: 'mb-4'
            }, [
                createElement('p', {
                    class: 'text-sm text-gray-600 mb-2'
                }, `Diffusion vers ${contactsSelectionnes.length} contact(s) :`),
                createElement('div', {
                    class: 'bg-gray-100 rounded p-2 max-h-20 overflow-y-auto'
                }, contactsSelectionnes.map(contact => 
                    createElement('span', {
                        class: 'inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1'
                    }, contact.name)
                ))
            ]),
            createElement('textarea', {
                id: 'message-diffusion',
                placeholder: 'Saisissez votre message de diffusion...',
                class: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 resize-none',
                rows: '4'
            }),
            createElement('div', {
                class: 'flex justify-end space-x-3 mt-4'
            }, [
                createElement('button', {
                    class: 'px-4 py-2 text-gray-600 hover:text-gray-800',
                    onClick: function() {
                        document.getElementById('interface-diffusion').remove();
                    }
                }, 'Annuler'),
                createElement('button', {
                    class: 'px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600',
                    onClick: function() {
                        envoyerDiffusion(contactsSelectionnes);
                    }
                }, 'Envoyer')
            ])
        ])
    ]);
    
    document.body.appendChild(interfaceDiffusion);
    
    // Focus sur le textarea
    setTimeout(() => {
        document.getElementById('message-diffusion').focus();
    }, 100);
}

export function envoyerDiffusion(contactsSelectionnes) {
    const contenu = document.getElementById('message-diffusion')?.value.trim();
    
    if (!contenu) {
        afficherMessageValidation('Veuillez saisir un message pour la diffusion', 'error');
        return;
    }
    
    contactsSelectionnes.forEach(contact => {
        const message = {
            id: Date.now() + Math.random(),
            expediteur: 'Moi',
            destinataire: contact.name,
            contenu: contenu,
            timestamp: new Date(),
            type: 'diffusion'
        };
        
        MESSAGES.push(message);
        
        contact.lastMessage = contenu;
        contact.time = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', minute: '2-digit' 
        });
        
        setTimeout(() => {
            genererReponseAuto(contact);
        }, Math.random() * 3000 + 1000);
    });
    
    // Fermer l'interface de diffusion
    document.getElementById('interface-diffusion').remove();
    
    // Message de confirmation
    afficherMessageValidation(
        `Diffusion envoyée avec succès à ${contactsSelectionnes.length} contact(s)`, 
        'success'
    );
    
    console.log(`Diffusion envoyée à ${contactsSelectionnes.length} contacts`);
    rafraichirInterface();
}