 
import { CONTACTS, CONTACTS_ARCHIVES, CONVERSATIONS, GROUPES } from './data.js';
import { rafraichirInterface } from './utils.js';

export function archiverContact(contactId) {
    const contactIndex = CONTACTS.findIndex(contact => contact.id === contactId);
    if (contactIndex !== -1) {
        const contact = CONTACTS[contactIndex];
        contact.archived = true;
        contact.selected = false;
        
        CONTACTS_ARCHIVES.push(contact);
        CONTACTS.splice(contactIndex, 1);
        
        const conversationIndex = CONVERSATIONS.findIndex(conv => conv.id === contactId && conv.type !== 'groupe');
        if (conversationIndex !== -1) {
            CONVERSATIONS.splice(conversationIndex, 1);
        }
        
        rafraichirInterface();
        console.log(`Contact ${contact.name} archivé`);
    }
}

export function desarchiverContact(contactId) {
    const contactIndex = CONTACTS_ARCHIVES.findIndex(contact => contact.id === contactId);
    if (contactIndex !== -1) {
        const contact = CONTACTS_ARCHIVES[contactIndex];
        contact.archived = false;
        contact.selected = false;
        CONTACTS.push(contact);
        CONTACTS_ARCHIVES.splice(contactIndex, 1);
        
        if (!CONVERSATIONS.find(conv => conv.id === contactId)) {
            CONVERSATIONS.push({...contact});
        }
        
        rafraichirInterface();
        console.log(`Contact ${contact.name} désarchivé`);
    }
}

// Archiver un groupe
export function archiverGroupe(groupeId) {
    const groupeIndex = GROUPES.findIndex(groupe => groupe.id === groupeId);
    if (groupeIndex !== -1) {
        const groupe = GROUPES[groupeIndex];
        groupe.archived = true;
        groupe.selected = false;
        
        // Retirer le groupe des conversations actives
        const conversationIndex = CONVERSATIONS.findIndex(conv => conv.id === groupeId && conv.type === 'groupe');
        if (conversationIndex !== -1) {
            CONVERSATIONS.splice(conversationIndex, 1);
        }
        
        rafraichirInterface();
        console.log(`Groupe ${groupe.name} archivé`);
    }
}

// Désarchiver un groupe  
export function desarchiverGroupe(groupeId) {
    const groupeIndex = GROUPES.findIndex(groupe => groupe.id === groupeId && groupe.archived);
    if (groupeIndex !== -1) {
        const groupe = GROUPES[groupeIndex];
        groupe.archived = false;
        groupe.selected = false;
        
        // Remettre le groupe dans les conversations
        if (!CONVERSATIONS.find(conv => conv.id === groupeId && conv.type === 'groupe')) {
            CONVERSATIONS.push({...groupe});
        }
        
        rafraichirInterface();
        console.log(`Groupe ${groupe.name} désarchivé`);
    }
}

// Fonction pour obtenir tous les éléments archivés (contacts + groupes)
export function obtenirElementsArchives() {
    const contactsArchives = CONTACTS_ARCHIVES.map(contact => ({
        ...contact,
        type: 'contact'
    }));
    
    const groupesArchives = GROUPES.filter(groupe => groupe.archived).map(groupe => ({
        ...groupe,
        type: 'groupe'
    }));
    
    return [...contactsArchives, ...groupesArchives];
}

// NOUVELLE FONCTION - Ajouter des contacts existants à un groupe
export function ajouterContactsAuGroupe(groupeId, contactsIds) {
    const groupe = GROUPES.find(g => g.id === groupeId);
    if (!groupe) {
        console.error('Groupe non trouvé');
        return false;
    }

    let membresAjoutes = 0;
    
    contactsIds.forEach(contactId => {
        const contact = CONTACTS.find(c => c.id === contactId);
        if (contact) {
            // Vérifier si le contact n'est pas déjà membre
            const dejaMembre = groupe.listeMembres.some(membre => 
                membre.includes(contact.name) || membre.includes(contact.numero)
            );
            
            if (!dejaMembre) {
                // Ajouter le contact au groupe
                groupe.listeMembres.push(contact.name);
                groupe.membres = groupe.listeMembres.length;
                membresAjoutes++;
                console.log(`${contact.name} ajouté au groupe ${groupe.name}`);
            }
        }
    });

    if (membresAjoutes > 0) {
        // Mettre à jour le message du groupe
        groupe.lastMessage = `${membresAjoutes} nouveau${membresAjoutes > 1 ? 'x' : ''} membre${membresAjoutes > 1 ? 's' : ''} ajouté${membresAjoutes > 1 ? 's' : ''}`;
        groupe.time = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', minute: '2-digit' 
        });

        // Mettre à jour aussi dans CONVERSATIONS si le groupe y est
        const conversationIndex = CONVERSATIONS.findIndex(conv => conv.id === groupeId && conv.type === 'groupe');
        if (conversationIndex !== -1) {
            CONVERSATIONS[conversationIndex] = { ...groupe };
        }

        rafraichirInterface();
        return true;
    }
    
    return false;
}

// NOUVELLE FONCTION - Afficher la modal pour ajouter des contacts à un groupe
export function afficherModalAjouterContacts(groupe) {
    const modal = createElement('div', {
        class: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        onClick: function(e) {
            if (e.target === this) {
                this.remove();
            }
        }
    }, [
        createElement('div', {
            class: 'bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto',
            onClick: function(e) {
                e.stopPropagation();
            }
        }, [
            createElement('div', {
                class: 'flex justify-between items-center mb-4'
            }, [
                createElement('h3', {
                    class: 'text-lg font-semibold text-gray-900'
                }, `Ajouter des contacts à ${groupe.name}`),
                createElement('button', {
                    class: 'text-gray-400 hover:text-gray-600',
                    onClick: function() {
                        modal.remove();
                    }
                }, [
                    createElement('i', {
                        class: 'fas fa-times'
                    })
                ])
            ]),
            
            // Liste des contacts disponibles
            createElement('div', {
                class: 'space-y-2 mb-4'
            }, CONTACTS.map(contact => {
                // Vérifier si le contact est déjà membre
                const dejaMembre = groupe.listeMembres.some(membre => 
                    membre.includes(contact.name) || membre.includes(contact.numero)
                );

                return createElement('div', {
                    class: `flex items-center p-3 rounded-lg border ${dejaMembre ? 'bg-gray-100 border-gray-200' : 'hover:bg-gray-50 border-gray-100 cursor-pointer'}`,
                    onClick: dejaMembre ? null : function() {
                        // Toggle sélection du contact
                        contact.tempSelected = !contact.tempSelected;
                        this.classList.toggle('bg-blue-50');
                        this.classList.toggle('border-blue-200');
                        
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            checkbox.checked = contact.tempSelected;
                        }
                    }
                }, [
                    createElement('input', {
                        type: 'checkbox',
                        class: 'mr-3',
                        disabled: dejaMembre,
                        checked: dejaMembre || contact.tempSelected || false,
                        onChange: function() {
                            if (!dejaMembre) {
                                contact.tempSelected = this.checked;
                            }
                        }
                    }),
                    createElement('div', {
                        class: `w-8 h-8 ${dejaMembre ? 'bg-gray-500' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white text-xs mr-3`
                    }, contact.avatar),
                    createElement('div', {
                        class: 'flex-1'
                    }, [
                        createElement('p', {
                            class: `text-sm font-medium ${dejaMembre ? 'text-gray-500' : 'text-gray-900'}`
                        }, contact.name),
                        createElement('p', {
                            class: `text-xs ${dejaMembre ? 'text-gray-400' : 'text-gray-600'}`
                        }, contact.numero)
                    ]),
                    dejaMembre ? createElement('span', {
                        class: 'text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded'
                    }, 'Déjà membre') : null
                ]);
            })),
            
            // Boutons d'action
            createElement('div', {
                class: 'flex justify-end space-x-3'
            }, [
                createElement('button', {
                    class: 'px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors',
                    onClick: function() {
                        // Nettoyer les sélections temporaires
                        CONTACTS.forEach(c => delete c.tempSelected);
                        modal.remove();
                    }
                }, 'Annuler'),
                
                createElement('button', {
                    class: 'px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors',
                    onClick: function() {
                        // Récupérer les contacts sélectionnés
                        const contactsSelectionnes = CONTACTS.filter(c => c.tempSelected);
                        
                        if (contactsSelectionnes.length > 0) {
                            const contactsIds = contactsSelectionnes.map(c => c.id);
                            const succes = ajouterContactsAuGroupe(groupe.id, contactsIds);
                            
                            if (succes) {
                                alert(`${contactsSelectionnes.length} contact(s) ajouté(s) au groupe !`);
                            } else {
                                alert('Aucun nouveau contact ajouté.');
                            }
                        } else {
                            alert('Veuillez sélectionner au moins un contact.');
                        }
                        
                        // Nettoyer les sélections temporaires
                        CONTACTS.forEach(c => delete c.tempSelected);
                        modal.remove();
                    }
                }, 'Ajouter')
            ])
        ])
    ]);
    
    document.body.appendChild(modal);
}