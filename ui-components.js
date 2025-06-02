import { CONVERSATIONS, CONTACTS, CONTACTS_ARCHIVES, SIDEBAR_BUTTONS, GROUPES, activeButtonId, setActiveButtonId } from './data.js';
import { rafraichirInterface, afficherMessageValidation } from './utils.js';
import { archiverContact, archiverGroupe, afficherModalAjouterContacts } from './contact-manager.js';
import { obtenirElementsArchives } from './contact-manager.js';


export function creerConversation(conversation) {
    const avatarColor = conversation.type === 'groupe' ? 'bg-purple-600' : 'bg-green-600';
    
    return createElement('div', {
        class: `group flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${conversation.active ? 'bg-gray-100' : ''} ${conversation.selected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`,
        onClick: function(event) {
            if (event.ctrlKey || event.metaKey) {
                // Mode sélection pour archivage
                CONVERSATIONS.forEach(conv => conv.selected = false);
                CONTACTS.forEach(c => c.selected = false);
                CONTACTS_ARCHIVES.forEach(c => c.selected = false);
                GROUPES.forEach(g => g.selected = false);
                
                if (conversation.type === 'groupe') {
                    const groupe = GROUPES.find(g => g.id === conversation.id);
                    if (groupe) {
                        groupe.selected = true;
                        conversation.selected = true;
                    }
                    console.log(`Groupe sélectionné pour archivage: ${conversation.name}`);
                } else {
                    const contact = CONTACTS.find(c => c.id === conversation.id);
                    if (contact) {
                        contact.selected = true;
                        conversation.selected = true;
                    }
                    console.log(`Contact sélectionné pour archivage: ${conversation.name}`);
                }
            } else {
                // Mode conversation normale
                CONVERSATIONS.forEach(conv => conv.active = false);
                CONVERSATIONS.forEach(conv => conv.selected = false);
                CONTACTS.forEach(c => c.selected = false);
                CONTACTS_ARCHIVES.forEach(c => c.selected = false);
                GROUPES.forEach(g => g.selected = false);
                
                conversation.active = true;
                console.log(`Conversation activée: ${conversation.name}`);
            }
            
            rafraichirInterface();
        }
    }, [
        createElement('div', {
            class: `w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0`
        }, conversation.avatar),
        
        createElement('div', {
            class: 'flex-1 min-w-0'
        }, [
            createElement('div', {
                class: 'flex justify-between items-baseline mb-1'
            }, [
                createElement('h3', {
                    class: 'text-gray-900 font-medium text-sm truncate'
                }, conversation.name),
                createElement('span', {
                    class: 'text-xs text-gray-500 ml-2 flex-shrink-0'
                }, conversation.time)
            ]),
            
            createElement('div', {
                class: 'flex justify-between items-center'
            }, [
                createElement('p', {
                    class: 'text-xs text-gray-600 truncate flex-1'
                }, conversation.lastMessage),
                
                createElement('div', {
                    class: 'flex items-center space-x-2'
                }, [
                    conversation.type === 'groupe' ? createElement('span', {
                        class: 'text-xs text-gray-500 flex items-center cursor-pointer hover:text-green-600 transition-colors',
                        onClick: function(e) {
                            e.stopPropagation();
                            afficherMembresGroupe(conversation);
                        }
                    }, [
                        createElement('i', {
                            class: 'fas fa-users mr-1'
                        }),
                        `${conversation.membres}`
                    ]) : null,
                    conversation.unread > 0 ? createElement('span', {
                        class: 'bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0'
                    }, conversation.unread.toString()) : null
                ])
            ])
        ])
    ]);
}

export function afficherMembresGroupe(groupe) {
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
                }, `Membres de ${groupe.name}`),
                createElement('div', {
                    class: 'flex items-center space-x-2'
                }, [
                    createElement('button', {
                        class: 'px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center',
                        onClick: function() {
                            modal.remove();
                            afficherModalAjouterContacts(groupe);
                        }
                    }, [
                        createElement('i', {
                            class: 'fas fa-user-plus mr-2'
                        }),
                        'Ajouter'
                    ]),
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
                ])
            ]),
            
            createElement('div', {
                class: 'space-y-2'
            }, groupe.listeMembres.map(membre => {
                const estAdmin = membre.includes('Admin');
                const estVous = membre.includes('Vous');
                const nomSansStatut = membre.replace(' (Admin)', '').replace('Vous (Admin)', 'Vous');
                
                return createElement('div', {
                    class: 'flex items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-100'
                }, [
                    createElement('div', {
                        class: 'flex items-center flex-1'
                    }, [
                        createElement('div', {
                            class: `w-8 h-8 ${estAdmin ? 'bg-green-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white text-xs mr-3`
                        }, estAdmin ? 'A' : nomSansStatut.charAt(0).toUpperCase()),
                        createElement('div', {
                            class: 'flex-1'
                        }, [
                            createElement('p', {
                                class: 'text-sm font-medium text-gray-900'
                            }, nomSansStatut),
                            createElement('p', {
                                class: `text-xs ${estAdmin ? 'text-green-600' : 'text-gray-500'}`
                            }, estAdmin ? 'Administrateur' : 'Membre')
                        ])
                    ]),
                    
                    (!estVous) ? createElement('div', {
                        class: 'flex items-center space-x-2 ml-3'
                    }, [
                        createElement('button', {
                            class: `px-2 py-1 text-xs rounded transition-colors ${
                                estAdmin 
                                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                            }`,
                            onClick: function() {
                                const action = estAdmin ? 'retirer' : 'nommer';
                                const nouveauStatut = estAdmin ? 'membre simple' : 'administrateur';
                                
                                // Remplacer confirm par une validation avec message
                                afficherModalConfirmation(
                                    `Voulez-vous ${action} ${nomSansStatut} en ${nouveauStatut} ?`,
                                    function() {
                                        changerStatutMembre(groupe, membre, !estAdmin);
                                        modal.remove();
                                        afficherMessageValidation(
                                            `${nomSansStatut} a été ${estAdmin ? 'rétrogradé en membre simple' : 'promu administrateur'}`,
                                            'success'
                                        );
                                    }
                                );
                            }
                        }, [
                            createElement('i', {
                                class: `fas ${estAdmin ? 'fa-arrow-down' : 'fa-arrow-up'} mr-1`
                            }),
                            estAdmin ? 'retirer' : 'nommer'
                        ]),
                        
                        (!estAdmin) ? createElement('button', {
                            class: 'px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors',
                            onClick: function() {
                                // Remplacer confirm par une validation avec message
                                afficherModalConfirmation(
                                    `Voulez-vous retirer ${nomSansStatut} du groupe ?`,
                                    function() {
                                        retirerMembreGroupe(groupe, membre);
                                        modal.remove();
                                        afficherMessageValidation(
                                            `${nomSansStatut} a été retiré du groupe`,
                                            'success'
                                        );
                                    }
                                );
                            }
                        }, [
                            createElement('i', {
                                class: 'fas fa-user-minus mr-1'
                            }),
                            'Retirer'
                        ]) : null
                    ]) : 
                    createElement('div', {
                        class: 'px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded font-medium'
                    }, 'Vous')
                ]);
            }))
        ])
    ]);
    
    document.body.appendChild(modal);
}

export function afficherModalConfirmation(message, onConfirm) {
    const modal = createElement('div', {
        class: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        onClick: function(e) {
            if (e.target === this) {
                this.remove();
            }
        }
    }, [
        createElement('div', {
            class: 'bg-white rounded-lg p-6 max-w-sm w-full mx-4',
            onClick: function(e) {
                e.stopPropagation();
            }
        }, [
            createElement('div', {
                class: 'flex items-center justify-center mb-4'
            }, [
                createElement('div', {
                    class: 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'
                }, [
                    createElement('i', {
                        class: 'fas fa-question text-blue-600 text-xl'
                    })
                ])
            ]),
            createElement('h3', {
                class: 'text-lg font-semibold text-gray-900 text-center mb-2'
            }, 'Confirmation'),
            createElement('p', {
                class: 'text-gray-600 text-center mb-6'
            }, message),
            createElement('div', {
                class: 'flex justify-center space-x-3'
            }, [
                createElement('button', {
                    class: 'px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors',
                    onClick: function() {
                        modal.remove();
                    }
                }, 'Annuler'),
                createElement('button', {
                    class: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors',
                    onClick: function() {
                        modal.remove();
                        if (onConfirm) onConfirm();
                    }
                }, 'Confirmer')
            ])
        ])
    ]);
    
    document.body.appendChild(modal);
}

export function changerStatutMembre(groupe, membre, devientAdmin) {
    const indexMembre = groupe.listeMembres.findIndex(m => m === membre);
    if (indexMembre !== -1) {
        const nomSansStatut = membre.replace(' (Admin)', '').replace('Vous (Admin)', 'Vous');
        const nouveauMembre = devientAdmin ? `${nomSansStatut} (Admin)` : nomSansStatut;
        
        groupe.listeMembres[indexMembre] = nouveauMembre;
        
        const groupeIndex = GROUPES.findIndex(g => g.id === groupe.id);
        if (groupeIndex !== -1) {
            GROUPES[groupeIndex] = { ...groupe };
        }
        
        const conversationIndex = CONVERSATIONS.findIndex(conv => conv.id === groupe.id && conv.type === 'groupe');
        if (conversationIndex !== -1) {
            CONVERSATIONS[conversationIndex] = { ...groupe };
        }
        
        const action = devientAdmin ? 'promu administrateur' : 'rétrogradé en membre simple';
        groupe.lastMessage = `${nomSansStatut} a été ${action}`;
        groupe.time = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', minute: '2-digit' 
        });
        
        rafraichirInterface();
        console.log(`${nomSansStatut} ${action} dans le groupe ${groupe.name}`);
    }
}

export function retirerMembreGroupe(groupe, membreARetirer) {
    const indexMembre = groupe.listeMembres.findIndex(membre => membre === membreARetirer);
    if (indexMembre !== -1) {
        groupe.listeMembres.splice(indexMembre, 1);
        groupe.membres = groupe.listeMembres.length;
        
        const groupeIndex = GROUPES.findIndex(g => g.id === groupe.id);
        if (groupeIndex !== -1) {
            GROUPES[groupeIndex] = { ...groupe };
        }
        
        const conversationIndex = CONVERSATIONS.findIndex(conv => conv.id === groupe.id && conv.type === 'groupe');
        if (conversationIndex !== -1) {
            CONVERSATIONS[conversationIndex] = { ...groupe };
        }
        
        const nomSansStatut = membreARetirer.replace(' (Admin)', '').replace('Vous (Admin)', 'Vous');
        groupe.lastMessage = `${nomSansStatut} a été retiré du groupe`;
        groupe.time = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', minute: '2-digit' 
        });
        
        rafraichirInterface();
        console.log(`${nomSansStatut} retiré du groupe ${groupe.name}`);
    }
}

export function creerContact(contact) {
    return createElement('div', {
        class: `flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${contact.selected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`,
        onClick: function() {
            if (activeButtonId === 'diffusions') {
                contact.selected = !contact.selected;
            } else {
                CONTACTS.forEach(c => c.selected = false);
                CONTACTS_ARCHIVES.forEach(c => c.selected = false);
                contact.selected = true;
            }
            
            rafraichirInterface();
            
            if (activeButtonId === 'diffusions') {
                const contactsSelectionnes = CONTACTS.filter(c => c.selected);
                console.log(`Contacts sélectionnés pour diffusion:`, contactsSelectionnes.map(c => c.name));
            } else {
                console.log(`Contact sélectionné: ${contact.name}`);
            }
        }
    }, [
        createElement('div', {
            class: `w-10 h-10 ${contact.selected && activeButtonId === 'diffusions' ? 'bg-green-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0 relative`
        }, [
            contact.selected && activeButtonId === 'diffusions' ? 
                createElement('i', { class: 'fas fa-check text-white' }) : 
                contact.avatar
        ]),
        
        createElement('div', {
            class: 'flex-1 min-w-0'
        }, [
            createElement('h3', {
                class: 'text-gray-900 font-medium text-sm truncate mb-1'
            }, contact.name),
            
            createElement('p', {
                class: 'text-xs text-gray-600 truncate flex-1'
            }, contact.numero)
        ])
    ]);
}

export function creerGroupe(groupe) {
    return createElement('div', {
        class: 'flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50',
        onClick: function() {
            console.log(`Groupe sélectionné: ${groupe.name}`);
        }
    }, [
        createElement('div', {
            class: 'w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0'
        }, groupe.avatar),
        
        createElement('div', { 
            class: 'flex-1 min-w-0' 
        }, [
            createElement('div', { 
                class: 'flex justify-between items-baseline mb-1' 
            }, [
                createElement('h3', { 
                    class: 'text-gray-900 font-medium text-sm truncate' 
                }, groupe.name),
                createElement('span', { 
                    class: 'text-xs text-gray-500 ml-2 flex-shrink-0' 
                }, `${groupe.membres} membre${groupe.membres > 1 ? 's' : ''}`)
            ]),
            
            createElement('div', { 
                class: 'flex flex-col' 
            }, [
                createElement('p', { 
                    class: 'text-xs text-gray-600 truncate flex-1' 
                }, groupe.description),
                createElement('div', { 
                    class: 'flex justify-between items-center mt-1' 
                }, [
                    createElement('p', { 
                        class: 'text-xs text-gray-500 truncate' 
                    }, `Admin: ${groupe.administrateur}`),
                    createElement('p', { 
                        class: 'text-xs text-gray-400' 
                    }, groupe.time.split(' ')[0]) 
                ])
            ])
        ])
    ]);
}

export function creerBoutonSidebar(bouton) {
    const baseClasses = "w-28 h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 font-medium text-xs gap-2 mb-3 outline-none";
    const activeClasses = bouton.active 
        ? "bg-yellow-500 text-white border-yellow-600" 
        : "bg-gray-50 text-gray-700 border-orange-400 hover:bg-gray-100 hover:border-orange-500";
        
    return createElement('button', {
        class: `${baseClasses} ${activeClasses}`,
        onClick: function() {
            SIDEBAR_BUTTONS.forEach(btn => btn.active = false);
            bouton.active = true;
            setActiveButtonId(bouton.id);
            
            rafraichirInterface();
            
            console.log(`Bouton cliqué: ${bouton.label}`);
        }
    }, [
        createElement('i', {
            class: `${bouton.icon} text-2xl`
        }),
        createElement('span', {
            class: 'text-xs text-center leading-tight'
        }, bouton.label)
    ]);
}