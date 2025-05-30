// layout-components.js - Composants de mise en page
import { SIDEBAR_BUTTONS, GROUPES, activeButtonId, CONTACTS, CONTACTS_ARCHIVES } from './data.js';
import { creerBoutonSidebar, creerGroupe } from './ui-components.js';
import { creerFormulaireContact, creerFormulaireGroupe } from './form-components.js';
import { creerListeContacts, creerListeContactsArchives, creerListeConversations } from './list-components.js';
import { obtenirElementsArchives } from './contact-manager.js';
import { rafraichirInterface, filtrerParRecherche } from './utils.js';
import { rechercheTexte, setRechercheTexte } from './data.js';

export function creerSectionDiscussions() {
    let contenu;
    let titre = 'Discussions';
    
    switch(activeButtonId) {
        case 'messages':
            titre = 'Discussions';
            contenu = creerListeConversations();
            break;
        case 'nouveau':
            titre = 'Nouveau contact';
            contenu = createElement('div', { class: 'flex-1 overflow-y-auto' }, [creerFormulaireContact()]);
            break;
        case 'groupes':
            titre = 'Groupes';
            const groupesFiltres = filtrerParRecherche(GROUPES.filter(g => !g.archived), rechercheTexte, 'groupe');
            contenu = createElement('div', { class: 'flex-1 overflow-y-auto' }, [
                creerFormulaireGroupe(),
                createElement('div', { class: 'border-t border-gray-200 mx-4' }),
                createElement('div', { class: 'px-4 py-3' }, [
                    createElement('h4', { class: 'text-sm font-medium text-gray-700 mb-3' }, 
                        `Groupes existants ${rechercheTexte ? `(${groupesFiltres.length})` : ''}`
                    ),
                    groupesFiltres.length === 0 ? 
                        createElement('p', { class: 'text-xs text-gray-500 text-center py-4' }, 
                            rechercheTexte ? `Aucun résultat pour "${rechercheTexte}"` : 'Aucun groupe créé'
                        ) :
                        createElement('div', { 
                            vFor: { 
                                each: groupesFiltres, 
                                render: (groupe) => creerGroupe(groupe) 
                            } 
                        })
                ])
            ]);
            break;
        case 'diffusions':
            titre = 'Contacts';
            contenu = creerListeContacts();
            break;
        case 'archives':
            titre = 'Archives';
            contenu = creerListeArchivesComplete();
            break;
        default:
            contenu = creerListeConversations();
    }
    
    return createElement('div', { class: 'w-80 bg-white border-r border-gray-200 flex flex-col h-screen' }, [
        createElement('div', { class: 'px-4 py-3 border-b border-gray-200 bg-white' }, [
            createElement('div', { class: 'flex justify-between items-center mb-3' }, [
                createElement('h1', { class: 'text-lg font-semibold text-gray-900' }, titre)
            ]),
            
            activeButtonId !== 'nouveau' ? createElement('div', { class: 'relative' }, [
                createElement('input', {
                    type: 'text',
                    placeholder: `Rechercher dans ${titre.toLowerCase()}...`,
                    class: 'w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500',
                    value: rechercheTexte,
                    onInput: function(e) {
                        setRechercheTexte(e.target.value);
                        rafraichirInterface();
                    }
                }),
                createElement('i', { class: 'fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs' })
            ]) : null
        ]),
        
        contenu
    ]);
}

// FONCTION CORRIGÉE : Créer la liste complète des archives avec recherche
function creerListeArchivesComplete() {
    const contactsArchivesFiltres = filtrerParRecherche(CONTACTS_ARCHIVES, rechercheTexte, 'contact');
    const groupesArchivesFiltres = filtrerParRecherche(GROUPES.filter(g => g.archived), rechercheTexte, 'groupe');
    
    return createElement('div', { class: 'flex-1 overflow-y-auto' }, [
        (contactsArchivesFiltres.length === 0 && groupesArchivesFiltres.length === 0) ? 
            createElement('div', { class: 'flex-1 flex items-center justify-center' }, [
                createElement('div', { class: 'text-center' }, [
                    createElement('div', { class: 'w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center' }, 
                        createElement('i', { class: 'fas fa-archive text-2xl text-gray-400' })
                    ),
                    createElement('h3', { class: 'text-sm font-medium text-gray-600 mb-1' }, 
                        rechercheTexte ? `Aucun résultat pour "${rechercheTexte}"` : 'Aucun élément archivé'
                    ),
                    createElement('p', { class: 'text-xs text-gray-500' }, 
                        rechercheTexte ? 'Essayez avec d\'autres termes de recherche' : 'Les contacts et groupes archivés apparaîtront ici'
                    )
                ])
            ]) :
            createElement('div', { class: 'divide-y divide-gray-100' }, [
                // Afficher les contacts archivés filtrés
                contactsArchivesFiltres.length > 0 ? [
                    createElement('div', { class: 'px-4 py-2 bg-gray-50' }, [
                        createElement('h4', { class: 'text-xs font-medium text-gray-600' }, 
                            `Contacts archivés ${rechercheTexte ? `(${contactsArchivesFiltres.length})` : ''}`
                        )
                    ]),
                    ...contactsArchivesFiltres.map(contact => 
                        createElement('div', {
                            class: `flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${contact.selected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`,
                            onClick: function() {
                                // Désélectionner tous les autres éléments
                                CONTACTS_ARCHIVES.forEach(c => c.selected = false);
                                CONTACTS.forEach(c => c.selected = false);
                                GROUPES.forEach(g => g.selected = false);
                                
                                // Sélectionner ce contact
                                contact.selected = true;
                                console.log(`Contact archivé sélectionné: ${contact.name}`);
                                rafraichirInterface();
                            }
                        }, [
                            createElement('div', {
                                class: 'w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0'
                            }, contact.avatar),
                            createElement('div', { class: 'flex-1 min-w-0' }, [
                                createElement('h3', { class: 'text-gray-900 font-medium text-sm truncate mb-1' }, contact.name),
                                createElement('p', { class: 'text-xs text-gray-600 truncate flex-1' }, contact.numero),
                                createElement('span', { class: 'text-xs text-gray-400' }, '📁 Archivé')
                            ])
                        ])
                    )
                ] : [],
                
                // Afficher les groupes archivés filtrés
                groupesArchivesFiltres.length > 0 ? [
                    createElement('div', { class: 'px-4 py-2 bg-gray-50' }, [
                        createElement('h4', { class: 'text-xs font-medium text-gray-600' }, 
                            `Groupes archivés ${rechercheTexte ? `(${groupesArchivesFiltres.length})` : ''}`
                        )
                    ]),
                    ...groupesArchivesFiltres.map(groupe => 
                        createElement('div', {
                            class: `flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${groupe.selected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`,
                            onClick: function() {
                                // Désélectionner tous les autres éléments
                                CONTACTS_ARCHIVES.forEach(c => c.selected = false);
                                CONTACTS.forEach(c => c.selected = false);
                                GROUPES.forEach(g => g.selected = false);
                                
                                // Sélectionner ce groupe
                                groupe.selected = true;
                                console.log(`Groupe archivé sélectionné: ${groupe.name}`);
                                rafraichirInterface();
                            }
                        }, [
                            createElement('div', {
                                class: 'w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0'
                            }, groupe.avatar),
                            createElement('div', { class: 'flex-1 min-w-0' }, [
                                createElement('h3', { class: 'text-gray-900 font-medium text-sm truncate mb-1' }, groupe.name),
                                createElement('p', { class: 'text-xs text-gray-600 truncate flex-1' }, groupe.description || groupe.lastMessage),
                                createElement('span', { class: 'text-xs text-gray-400' }, `📁 Archivé • ${groupe.membres} membre${groupe.membres > 1 ? 's' : ''}`)
                            ])
                        ])
                    )
                ] : []
            ].flat())
    ]);
}

export function creerSidebar() {
    return createElement('div', { 
        class: 'w-40 h-screen bg-gray-50 border-r border-gray-200 p-5 flex flex-col items-center shadow-lg' 
    }, [
        createElement('div', { class: 'flex-1' }),
        createElement('div', { 
            class: 'flex flex-col items-center',
            vFor: { 
                each: SIDEBAR_BUTTONS, 
                render: creerBoutonSidebar 
            } 
        }),
        createElement('div', { class: 'flex-1' })
    ]);
}