// data.js - Données et constantes de l'application

export const SIDEBAR_BUTTONS = [
    { 
        id: 'messages', 
        icon: 'fa-solid fa-square', 
        label: 'Messages', 
        active: false 
    },
    { 
        id: 'groupes', 
        icon: 'fas fa-users', 
        label: 'Groupes', 
        active: false 
    },
    { 
        id: 'diffusions', 
        icon: 'fa-solid fa-arrows-turn-to-dots', 
        label: 'Diffusions', 
        active: false 
    },
    { 
        id: 'archives', 
        icon: 'fas fa-archive', 
        label: 'Archives', 
        active: true 
    },
    { 
        id: 'nouveau', 
        icon: 'fas fa-plus', 
        label: 'Nouveau', 
        active: false 
    }
];

export const CONVERSATIONS = [];
export const CONTACTS = [];
export const GROUPES = [];
export const CONTACTS_ARCHIVES = [];
export const MESSAGES = [];

export const REPONSES_AUTO = [
    "Message reçu ! 😊", 
    "Merci pour votre message !", 
    "Hello ! 👋", 
    "Reçu 5/5 !", 
    "À bientôt !", 
    "Message bien reçu !"
];

export let activeButtonId = 'archives';

export function setActiveButtonId(id) {
    activeButtonId = id;
}

export let rechercheTexte = '';
export function setRechercheTexte(texte) {
    rechercheTexte = texte;
}