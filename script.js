// script.js - Interface principale avec validation améliorée

import { CONVERSATIONS, CONTACTS, CONTACTS_ARCHIVES, GROUPES, activeButtonId } from './data.js';
import { rafraichirInterface, afficherMessageValidation } from './utils.js';
import { archiverContact, desarchiverContact, archiverGroupe, desarchiverGroupe } from './contact-manager.js';
import { creerSidebar, creerSectionDiscussions } from './layout-components.js';
import { creerInterfaceChat, envoyerMessageDiffusion } from './messaging.js';
import { 
    estConnecte, 
    creerInterfaceConnexion, 
    creerBoutonDeconnexion, 
    initialiserConnexion,
    obtenirUtilisateur 
} from './connexion.js';

function createElement(tag, props = {}, content = "") {
    if (typeof tag !== "string") return null;
    
    if ('vIf' in props && !props.vIf) return null;

    const fragment = document.createDocumentFragment();

    if ('vFor' in props) {
        const { each, render } = props.vFor;
        console.log(render)
        each.forEach((item) => {
            const child = render(item);
            if (child instanceof Node) {
                fragment.appendChild(child);
            }
        });
    }

    const el = document.createElement(tag);

    for (const key in props) {
        const value = props[key];

        if (key === "class" || key === "className") {
            el.className = Array.isArray(value) ? value.join(" ") : value;
        }

        else if (key.startsWith("on") && typeof value === "function") {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, value);
        }

        else if (key === "vShow") {
            el.style.display = value ? "" : "none";
        }

        else if (key === "vIf" || key === "vFor") {
            continue;
        }

        else if (key.startsWith(":")) {
            const realAttr = key.slice(1);
            el.setAttribute(realAttr, value);
        }

        else if (key === "style" && typeof value === "object") {
            Object.assign(el.style, value);
        }

        else {
            el.setAttribute(key, value);
        }
    }

    if (Array.isArray(content)) {
        content.forEach(item => {
            if (typeof item === "string") {
                el.appendChild(document.createTextNode(item));
            } else if (item instanceof Node) {
                el.appendChild(item);
            }
        });
    } else if (typeof content === "string") {
        el.textContent = content;
    } else if (content instanceof Node) {
        el.appendChild(content);
    }

    el.addElement = function (tag, props = {}, content = "") {
        const newEl = createElement(tag, props, content);
        this.appendChild(newEl);
        return this;
    };
    el.addNode = function (node) {
        this.appendChild(node);
        return this;
    };

    return el.addNode(fragment);
}

window.createElement = createElement;

export function creerInterface() {
    if (!estConnecte()) {
        return creerInterfaceConnexion();
    }

    const utilisateur = obtenirUtilisateur();
    
    const contactSelectionne = CONTACTS.find(c => c.selected) || CONTACTS_ARCHIVES.find(c => c.selected);
    const contactEstArchive = CONTACTS_ARCHIVES.find(c => c.selected);
    
    const groupeSelectionne = GROUPES.find(g => g.selected);
    const groupeEstArchive = groupeSelectionne && groupeSelectionne.archived;
    
    
    const buttons = [
        ['bg-orange-500 hover:bg-orange-600', 'fa-solid fa-share'],
        contactSelectionne ? [
            contactEstArchive ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500',
            contactEstArchive ? 'fas fa-box-open' : 'fas fa-archive'
        ] : ['bg-gray-400 hover:bg-gray-500', 'fas fa-archive'],
        ['bg-gray-600 hover:bg-gray-700', 'fa-solid fa-stop'],
        ['bg-red-500 hover:bg-red-600', 'fas fa-trash']
    ];

    const conversationActive = CONVERSATIONS.find(conv => conv.active);

    return createElement('div', { id: 'whatsapp-container', class: 'flex h-screen bg-gray-100 font-sans' }, [
        creerSidebar(),
        creerSectionDiscussions(),
        createElement('div', { class: 'flex-1 bg-gray-100 flex flex-col relative' }, [
            createElement('div', { class: 'bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between' }, [
                createElement('div', { class: 'flex items-center space-x-3' }, [
                    createElement('div', { class: 'w-10 h-10 bg-green-500 rounded-full flex items-center justify-center' }, 
                        createElement('i', { class: 'fas fa-user text-white' })
                    ),
                    createElement('div', {}, [
                        createElement('h3', { class: 'font-semibold text-gray-800' }, 
                            `${utilisateur.prenom} ${utilisateur.nom}`
                        ),
                        createElement('p', { class: 'text-sm text-gray-500' }, utilisateur.telephone)
                    ])
                ]),
                createElement('div', { class: 'flex items-center space-x-2' }, [
                    createElement('span', { class: 'text-sm text-gray-500' }, 'En ligne'),
                    createElement('div', { class: 'w-2 h-2 bg-green-500 rounded-full animate-pulse' }),
                    creerBoutonDeconnexion()
                ])
            ]),
            
            conversationActive ? 
                creerInterfaceChat(conversationActive) : 
                createElement('div', { class: 'flex-1 flex items-center bg-pink-50 justify-center' }, [
                    createElement('div', { class: 'text-center' }, [
                        createElement('div', { class: 'w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center' }, 
                            createElement('i', { class: 'fas fa-comments text-4xl text-gray-500' })
                        ),
                        createElement('h2', { class: 'text-2xl font-light text-gray-600 mb-2' }, 'Sélectionnez une conversation'),
                        createElement('p', { class: 'text-gray-500' }, 'Choisissez une conversation dans la liste pour commencer à discuter'),
                        createElement('p', { class: 'text-sm text-green-600 mt-4' }, 
                            `Bienvenue ${utilisateur.prenom} ! 👋`
                        )
                    ])
                ]),
            
            createElement('div', { class: 'absolute top-20 right-4 flex space-x-2' }, 
                buttons.map(([color, icon], index) => 
                    createElement('button', { 
                        class: `w-8 h-8 ${color} rounded-full flex items-center justify-center text-white transition-colors shadow-md`,
                        onClick: function() {
                            if (index === 1 && (contactSelectionne || groupeSelectionne)) { 
                                if (contactSelectionne) {
                                    if (contactEstArchive) {
                                        desarchiverContact(contactSelectionne.id);
                                        afficherMessageValidation('Contact désarchivé avec succès', 'success');
                                    } else {
                                        archiverContact(contactSelectionne.id);
                                        afficherMessageValidation('Contact archivé avec succès', 'success');
                                    }
                                } else if (groupeSelectionne) {
                                    if (groupeEstArchive) {
                                        console.log('Désarchiver le groupe:', groupeSelectionne.name);
                                        desarchiverGroupe(groupeSelectionne.id);
                                        afficherMessageValidation('Groupe désarchivé avec succès', 'success');
                                    } else {
                                        console.log('Archiver le groupe:', groupeSelectionne.name);
                                        archiverGroupe(groupeSelectionne.id);
                                        afficherMessageValidation('Groupe archivé avec succès', 'success');
                                    }
                                }
                            } else if (index === 1) {
                                afficherMessageValidation('Sélectionnez un contact ou un groupe à archiver', 'error');
                            }
                        }
                    }, createElement('i', { class: `${icon} text-sm` }))
                )
            ),
            
            // Bouton vert flottant
            createElement('div', { class: 'absolute bottom-6 right-6' }, [
                createElement('button', { 
                    class: 'w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-green-600 transition-colors',
                    onClick: function() {
                        if (activeButtonId === 'diffusions') {
                            envoyerMessageDiffusion();
                        } else {
                            afficherMessageValidation('Utilisez ce bouton en mode Diffusions pour envoyer un message groupé !', 'error');
                        }
                    }
                }, createElement('i', { 
                    class: activeButtonId === 'diffusions' ? 'fas fa-paper-plane text-xl' : 'fas fa-arrow-right text-xl' 
                }))
            ])
        ])
    ]);
}

window.creerInterface = creerInterface;

const additionalStyles = createElement('style', {}, `
    .fas, .fa, .fab {
        font-family: "Font Awesome 6 Free";
        font-weight: 900;
    }
    
    .fab {
        font-family: "Font Awesome 6 Brands";
        font-weight: 400;
    }
    
    body {
        margin: 0;
        padding: 0;
    }
    
    ::-webkit-scrollbar {
        width: 6px;
    }
    
    ::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
    
    .conversation-item {
        transition: all 0.2s ease;
    }
    
    .conversation-item:hover {
        transform: translateX(2px);
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    .animate-pulse {
        animation: pulse 2s infinite;
    }
    
    input, textarea {
        transition: border-color 0.3s ease, background-color 0.3s ease;
    }
    
    /* Animations pour la page de connexion */
    @keyframes slideInUp {
        from {
            transform: translateY(30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    #interface-connexion > div {
        animation: slideInUp 0.6s ease-out;
    }
    
    /* Style pour les champs valides/invalides */
    .border-green-500 {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .border-red-500 {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    /* Styles pour les messages de validation */
    #validation-message {
        animation: slideInBottom 0.3s ease-out;
    }
    
    @keyframes slideInBottom {
        from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    /* Amélioration de l'interface de diffusion */
    #interface-diffusion {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    #interface-diffusion > div {
        animation: slideInUp 0.3s ease-out;
    }
`);

function init() {
    document.head.appendChild(additionalStyles);
    
    initialiserConnexion();
    
    const app = document.getElementById('app');
    if (app) {
        app.appendChild(creerInterface());
        console.log('système de connexion!');
    } else {
        console.error('Élément #app non trouvé');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}