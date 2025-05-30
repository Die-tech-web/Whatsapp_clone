
import { CONTACTS, CONTACTS_ARCHIVES, CONVERSATIONS, rechercheTexte } from './data.js';
import { creerContact, creerConversation } from './ui-components.js';
import { filtrerParRecherche, filtrerConversations } from './utils.js';

export function creerListeContacts() {
    const contactsNonArchives = CONTACTS.filter(contact => !contact.archived);
    const contactsFiltres = filtrerParRecherche(contactsNonArchives, rechercheTexte, 'contact');
    
    if (contactsFiltres.length === 0) {
        return createElement('div', {
            class: 'flex-1 overflow-y-auto flex items-center justify-center'
        }, [
            createElement('div', {
                class: 'text-center text-gray-500'
            }, [
                createElement('i', {
                    class: 'fas fa-address-book text-4xl mb-3'
                }),
                createElement('p', {
                    class: 'text-sm'
                }, rechercheTexte ? `Aucun résultat pour "${rechercheTexte}"` : 'Aucun contact pour le moment'),
                createElement('p', {
                    class: 'text-xs mt-2'
                }, rechercheTexte ? 'Essayez avec d\'autres termes de recherche' : 'Cliquez sur "Nouveau" pour ajouter un contact')
            ])
        ]);
    }
    
    return createElement('div', {
        class: 'flex-1 overflow-y-auto',
        vFor: {
            each: contactsFiltres,
            render: (contact) => creerContact(contact)
        }
    });
}

export function creerListeContactsArchives() {
    const contactsArchivesFiltres = filtrerParRecherche(CONTACTS_ARCHIVES, rechercheTexte, 'contact');
    
    if (contactsArchivesFiltres.length === 0) {
        return createElement('div', {
            class: 'flex-1 overflow-y-auto flex items-center justify-center'
        }, [
            createElement('div', {
                class: 'text-center text-gray-500'
            }, [
                createElement('i', {
                    class: 'fas fa-archive text-4xl mb-3'
                }),
                createElement('p', {
                    class: 'text-sm'
                }, rechercheTexte ? `Aucun résultat pour "${rechercheTexte}"` : 'Aucun contact archivé'),
                createElement('p', {
                    class: 'text-xs mt-2'
                }, rechercheTexte ? 'Essayez avec d\'autres termes de recherche' : 'Les contacts archivés apparaîtront ici')
            ])
        ]);
    }
    
    return createElement('div', {
        class: 'flex-1 overflow-y-auto',
        vFor: {
            each: contactsArchivesFiltres,
            render: (contact) => creerContact(contact)
        }
    });
}

export function creerListeConversations() {
    const conversationsNonArchivees = CONVERSATIONS.filter(conv => {
        if (conv.type === 'groupe') return true;
        return !CONTACTS_ARCHIVES.find(archived => archived.id === conv.id);
    });
    
    const conversationsFiltrees = filtrerConversations(conversationsNonArchivees, rechercheTexte);
    
    if (conversationsFiltrees.length === 0) {
        return createElement('div', {
            class: 'flex-1 overflow-y-auto flex items-center justify-center'
        }, [
            createElement('div', {
                class: 'text-center text-gray-500'
            }, [
                createElement('i', {
                    class: 'fas fa-inbox text-4xl mb-3'
                }),
                createElement('p', {
                    class: 'text-sm'
                }, rechercheTexte ? `Aucun résultat pour "${rechercheTexte}"` : 'Aucune conversation pour le moment'),
                createElement('p', {
                    class: 'text-xs mt-2'
                }, rechercheTexte ? 'Essayez avec d\'autres termes de recherche' : 'Sélectionnez un contact pour commencer une conversation')
            ])
        ]);
    }
    
    return createElement('div', {
        class: 'flex-1 overflow-y-auto',
        vFor: {
            each: conversationsFiltrees,
            render: (conversation) => creerConversation(conversation)
        }
    });
}