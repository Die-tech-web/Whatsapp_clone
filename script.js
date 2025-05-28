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

const SIDEBAR_BUTTONS = [
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

const CONVERSATIONS = [];
const CONTACTS = [];
const GROUPES = [];
const CONTACTS_ARCHIVES = [];

let activeButtonId = 'archives';



function archiverContact(contactId) {
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
function desarchiverContact(contactId) {
    const contactIndex = CONTACTS_ARCHIVES.findIndex(contact => contact.id === contactId);
    if (contactIndex !== -1) {
        const contact = CONTACTS_ARCHIVES[contactIndex];
        contact.archived = false;
        contact.selected = false; // AJOUTER CETTE LIGNE
        CONTACTS.push(contact);
        CONTACTS_ARCHIVES.splice(contactIndex, 1);
        
        // AJOUTER CETTE PARTIE - Rajouter dans CONVERSATIONS
        if (!CONVERSATIONS.find(conv => conv.id === contactId)) {
            CONVERSATIONS.push({...contact});
        }

        rafraichirInterface();
        console.log(`Contact ${contact.name} désarchivé`);
    }
}
function rafraichirInterface() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '';
        app.appendChild(creerInterface());
    }
}

function afficherErreur(elementId, message) {
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

function supprimerErreur(elementId) {
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

function creerFormulaireContact() {
    return createElement('div', {
        class: 'p-4'
    }, [
        createElement('h3', {
            class: 'text-sm font-medium text-gray-900 mb-4'
        }, 'Ajouter un nouveau contact'),
        
        createElement('form', {
            onSubmit: function(e) {
                e.preventDefault();
                
                supprimerErreur('prenom');
                supprimerErreur('nom');
                supprimerErreur('numero');
                
                const prenom = e.target.prenom.value.trim();
                const nom = e.target.nom.value.trim();
                const numero = e.target.numero.value.trim();

                let hasError = false;
                
                if (!prenom) {
                    afficherErreur('prenom', 'Le prénom est requis pour créer votre contact');
                    hasError = true;
                }
                
                if (!nom) {
                    afficherErreur('nom', ' N\'oubliez pas d\'ajouter le nom de famille');
                    hasError = true;
                }
                
                if (!numero) {
                    afficherErreur('numero', ' Le numéro de téléphone est indispensable');
                    hasError = true;
                } else {
                    // Validation du numéro 
                    const hasDigits = /\d/.test(numero);
                    if (!hasDigits) {
                        afficherErreur('numero', 'Le numéro doit contenir au moins un chiffre');
                        hasError = true;
                    } else if (/[a-zA-Z]/.test(numero)) {
                        afficherErreur('numero', 'Les lettres ne sont pas autorisées dans un numéro');
                        hasError = true;
                    } else if (numero.length < 9) {
                        afficherErreur('numero', 'Le numéro doit contenir au minimum 9 caractères');
                        hasError = true;
                    } else if (numero.length > 16) {
                        afficherErreur('numero', 'Le numéro ne doit pas dépasser 16 caractères');
                        hasError = true;
                    } else if (numero.startsWith('+')) {
                        const numeroSansPlus = numero.slice(1);
                        if (numeroSansPlus.length === 0) {
                            afficherErreur('numero', 'Ajoutez des chiffres après le "+"');
                            hasError = true;
                        } else if (!/^\d+$/.test(numeroSansPlus)) {
                            afficherErreur('numero', 'Après le "+", seuls les chiffres sont autorisés');
                            hasError = true;
                        }
                    } else if (!/^\d+$/.test(numero)) {
                        afficherErreur('numero', 'Utilisez uniquement des chiffres (ou commencez par "+")');
                        hasError = true;
                    }
                    
                    // Vérifier si le numéro existe déjà
                    if (!hasError && CONTACTS.find(contact => contact.numero === numero)) {
                        afficherErreur('numero', ' Ce numéro existe déjà');
                        hasError = true;
                    }
                }
                
                if (hasError) {
                    return;
                }
                //nom identique
                let nomFinal = `${prenom} ${nom}`;
                let compteur = 0;
                while (CONTACTS.find(contact => contact.name === nomFinal) || CONTACTS_ARCHIVES.find(contact => contact.name === nomFinal)) {
                    compteur++;
                    nomFinal = `${prenom} ${nom}${compteur}`;
                }
                
                const nouveauContact = {
                    id: Date.now(),
                    name: nomFinal,
                    lastMessage: 'Nouveau contact',
                    time: new Date().toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    //selectionner premier lettre prenom et nom
                    avatar: `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase(),
                    unread: 0,
                    active: false,
                    numero: numero,
                    selected: false
                };
                CONTACTS.push(nouveauContact);
                CONVERSATIONS.push({...nouveauContact});
                
                e.target.reset();
                
                SIDEBAR_BUTTONS.forEach(btn => btn.active = false);
                SIDEBAR_BUTTONS.find(btn => btn.id === 'diffusions').active = true;
                activeButtonId = 'diffusions';
                
                rafraichirInterface();
                
                console.log('Nouveau contact ajouté:', nouveauContact);
            }
        }, [
            createElement('div', {
                class: 'mb-3'
            }, [
                createElement('label', {
                    class: 'block text-xs font-medium text-gray-700 mb-1'
                }, 'Prénom'),
                createElement('input', {
                    type: 'text',
                    name: 'prenom',
                    id: 'prenom',
                    class: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors',
                    onFocus: function() {
                        supprimerErreur('prenom');
                    }
                })
            ]),
            
            createElement('div', {
                class: 'mb-3'
            }, [
                createElement('label', {
                    class: 'block text-xs font-medium text-gray-700 mb-1'
                }, 'Nom'),
                createElement('input', {
                    type: 'text',
                    name: 'nom',
                    id: 'nom',
                    class: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors',
                    onFocus: function() {
                        supprimerErreur('nom');
                    }
                })
            ]),
            
            createElement('div', {
                class: 'mb-4'
            }, [
                createElement('label', {
                    class: 'block text-xs font-medium text-gray-700 mb-1'
                }, 'Numéro de téléphone'),
                createElement('input', {
                    type: 'text',
                    name: 'numero',
                    id: 'numero',
                    placeholder: 'taper le numero',
                    class: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors',
                    onFocus: function() {
                        supprimerErreur('numero');
                    }
                })
            ]),
            
            createElement('button', {
                type: 'submit',
                class: 'w-full bg-green-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-600 transition-colors'
            }, 'Ajouter le contact')
        ])
    ]);
}

function creerFormulaireGroupe() {
    return createElement('div', { class: 'p-4' }, [
        createElement('h3', { class: 'text-sm font-medium text-gray-900 mb-4' }, 'Créer un nouveau groupe'),
        
        createElement('form', {
            onSubmit: function(e) {
                e.preventDefault();
                ['nom_groupe', 'description_groupe', 'membres_groupe'].forEach(supprimerErreur);
                
                const nom = e.target.nom.value.trim();
                const description = e.target.description.value.trim();
                const membresSelectionnes = Array.from(e.target.querySelectorAll('input[name="membres"]:checked'));
                
                // Validation
                if (!nom) { afficherErreur('nom_groupe', ' Le nom du groupe est requis'); return; }
                if (!description) { afficherErreur('description_groupe', ' Une description est requise'); return; }
                if (membresSelectionnes.length === 0) { afficherErreur('membres_groupe', ' Sélectionnez au moins un membre'); return; }
                
                const nouveauGroupe = {
                    id: Date.now(),
                    name: nom,
                    administrateur: 'Vous',
                    lastMessage: 'Groupe créé',
                    time: new Date().toLocaleString('fr-FR', { 
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    avatar: nom.charAt(0).toUpperCase(),
                    unread: 0,
                    active: false,
                    description: description,
                    type: 'groupe',
                    // Le nombre de membres = membres sélectionnés + vous (administrateur)
                    membres: membresSelectionnes.length + 1, 
                    listeMembres: ['Vous (Admin)', ...membresSelectionnes.map(cb => {
                        const contact = CONTACTS.find(c => c.id.toString() === cb.value);
                        return contact ? contact.name : '';
                    }).filter(Boolean)]
                };
                
                GROUPES.push(nouveauGroupe);
                CONVERSATIONS.push({...nouveauGroupe});
                e.target.reset();
                
                SIDEBAR_BUTTONS.forEach(btn => btn.active = false);
                SIDEBAR_BUTTONS.find(btn => btn.id === 'messages').active = true;
                activeButtonId = 'messages';
                rafraichirInterface();
                
                console.log('Groupe créé:', nouveauGroupe);
            }
        }, [
            createElement('div', { class: 'mb-3' }, [
                createElement('label', { class: 'block text-xs font-medium text-gray-700 mb-1' }, 'Nom du groupe'),
                createElement('input', {
                    type: 'text', name: 'nom', id: 'nom_groupe',
                    placeholder: 'Nom du groupe...',
                    class: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors',
                    onFocus: () => supprimerErreur('nom_groupe')
                })
            ]),
            
            createElement('div', { class: 'mb-3' }, [
                createElement('label', { class: 'block text-xs font-medium text-gray-700 mb-1' }, 'Description'),
                createElement('textarea', {
                    name: 'description', id: 'description_groupe',
                    placeholder: 'Décrivez ce groupe...', rows: 2,
                    class: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none transition-colors',
                    onFocus: () => supprimerErreur('description_groupe')
                })
            ]),
            
            createElement('div', { class: 'mb-4' }, [
                createElement('label', { class: 'block text-xs font-medium text-gray-700 mb-2' }, 'Membres du groupe'),
                createElement('div', { class: 'mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md' }, [
                    createElement('div', { class: 'flex items-center' }, [
                        createElement('div', {
                            class: 'w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0'
                        }, 'V'),
                        createElement('span', { class: 'text-sm text-green-800 font-medium' }, 'Vous (Administrateur)')
                    ])
                ]),
                createElement('div', { id: 'membres_groupe' }, [creerSelecteurMembres()])
            ]),
            
            createElement('button', {
                type: 'submit',
                class: 'w-full bg-green-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-600 transition-colors'
            }, 'Créer le groupe')
        ])
    ]);
}

function creerConversation(conversation) {
    const avatarColor = conversation.type === 'groupe' ? 'bg-purple-600' : 'bg-green-600';
    
    return createElement('div', {
        class: `flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${conversation.active ? 'bg-gray-100' : ''} ${conversation.selected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`,
        onClick: function() {
            if (conversation.type === 'groupe') {
                // Pour les groupes : sélection normale de conversation
                CONVERSATIONS.forEach(conv => conv.active = false);
                conversation.active = true;
                console.log(`Conversation sélectionnée: ${conversation.name}`);
            } else {
                // Pour les contacts : permettre la sélection pour archivage
                CONVERSATIONS.forEach(conv => conv.selected = false);
                CONTACTS.forEach(c => c.selected = false);
                CONTACTS_ARCHIVES.forEach(c => c.selected = false);
                
                // Marquer le contact comme sélectionné dans CONTACTS
                const contact = CONTACTS.find(c => c.id === conversation.id);
                if (contact) {
                    contact.selected = true;
                    conversation.selected = true;
                }
                
                console.log(`Contact sélectionné: ${conversation.name}`);
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
                    // Afficher le nombre de membres pour les groupes
                    conversation.type === 'groupe' ? createElement('span', {
                        class: 'text-xs text-gray-500 flex items-center cursor-pointer hover:text-green-600 transition-colors',
                        onClick: function(e) {
                            e.stopPropagation(); // Empêche le clic de remonter au parent
                            afficherMembresGroupe(conversation);
                        }
                    }, [
                        createElement('i', {
                            class: 'fas fa-users mr-1'
                        }),
                        `${conversation.membres}`
                    ]) : null,
                    // Badge de messages non lus
                    conversation.unread > 0 ? createElement('span', {
                        class: 'bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0'
                    }, conversation.unread.toString()) : null
                ])
            ])
        ])
    ]);
}

//afficher membres du groupes
function afficherMembresGroupe(groupe) {
    //  popup modale
    const modal = createElement('div', {class: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        onClick: function(e) {
            if (e.target === this) {
                this.remove();
            }
        }
    }, [
        createElement('div', {
            class: 'bg-white rounded-lg p-6 max-w-sm w-full mx-4 max-h-96 overflow-y-auto',
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
            
            createElement('div', {
                class: 'space-y-3'
            }, groupe.listeMembres.map(membre => {
                const estAdmin = membre.includes('Admin');
                return createElement('div', {
                    class: 'flex items-center p-2 rounded-lg hover:bg-gray-50'
                }, [
                    createElement('div', {
                        class: `w-8 h-8 ${estAdmin ? 'bg-green-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white text-xs mr-3`
                    }, estAdmin ? 'A' : membre.charAt(0).toUpperCase()),
                    createElement('div', {
                        class: 'flex-1'
                    }, [
                        createElement('p', {
                            class: 'text-sm font-medium text-gray-900'
                        }, membre),
                        estAdmin ? createElement('p', {
                            class: 'text-xs text-green-600'
                        }, 'Administrateur') : null
                    ])
                ]);
            }))
        ])
    ]);
    
    document.body.appendChild(modal);
}

function creerContact(contact) {
    return createElement('div', {
        class: `flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${contact.selected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`,
        onClick: function() {
            if (activeButtonId === 'diffusions') {
                // En mode diffusion : sélection multiple possible
                contact.selected = !contact.selected; // Toggle la sélection
            } else {
                // Dans les autres sections : sélection unique
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
function creerGroupe(groupe) {
    return createElement('div', {class: 'flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50',
        onClick: function() {
            console.log(`Groupe sélectionné: ${groupe.name}`);
        }
    }, [
        createElement('div', {
            class: 'w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0'
        }, groupe.avatar),
        
        createElement('div', { class: 'flex-1 min-w-0' }, [
            createElement('div', { class: 'flex justify-between items-baseline mb-1' }, [
                createElement('h3', { class: 'text-gray-900 font-medium text-sm truncate' }, groupe.name),
                createElement('span', { class: 'text-xs text-gray-500 ml-2 flex-shrink-0' }, 
                    `${groupe.membres} membre${groupe.membres > 1 ? 's' : ''}`)
            ]),
            
            createElement('div', { class: 'flex flex-col' }, [
                createElement('p', { class: 'text-xs text-gray-600 truncate flex-1' }, groupe.description),
                createElement('div', { class: 'flex justify-between items-center mt-1' }, [
                    createElement('p', { class: 'text-xs text-gray-500 truncate' }, `Admin: ${groupe.administrateur}`),
                    createElement('p', { class: 'text-xs text-gray-400' }, groupe.time.split(' ')[0]) 
                ])
            ])
        ])
    ]);
}

function validerChamp(id, valeur, type) {
    if (!valeur) {
        const messages = {
            prenom: 'Le prénom est requis',
            nom: 'Le nom est requis',
            numero: 'Le numéro est requis',
            nom_groupe: ' Le nom du groupe est requis',
            description_groupe: ' Une description est requise',
            membres_groupe: 'Sélectionnez au moins un membre'
        };
        afficherErreur(id, messages[id]);
        return false;
    }
    
    if (type === 'numero') {
        if (!/\d/.test(valeur)) { afficherErreur(id, 'Le numéro doit contenir au moins un chiffre'); return false; }
        if (/[a-zA-Z]/.test(valeur)) { afficherErreur(id, 'Les lettres ne sont pas autorisées'); return false; }
        if (valeur.length < 9 || valeur.length > 16) { afficherErreur(id, 'Entre 9 et 16 caractères requis'); return false; }
        if (valeur.startsWith('+') && !/^\+\d+$/.test(valeur)) { afficherErreur(id, 'Format invalide après le "+"'); return false; }
        if (!valeur.startsWith('+') && !/^\d+$/.test(valeur)) { afficherErreur(id, 'Utilisez uniquement des chiffres'); return false; }
        if (CONTACTS.find(c => c.numero === valeur)) { afficherErreur(id, 'Ce numéro existe déjà'); return false; }
    }
    return true;
}
function creerListeContacts() {
  
    const contactsNonArchives = CONTACTS.filter(contact => !contact.archived);
    
    if (contactsNonArchives.length === 0) {
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
                }, 'Aucun contact pour le moment'),
                createElement('p', {
                    class: 'text-xs mt-2'
                }, 'Cliquez sur "Nouveau" pour ajouter un contact')
            ])
        ]);
    }
    
    return createElement('div', {
        class: 'flex-1 overflow-y-auto',
        vFor: {
            each: contactsNonArchives,
            render: (contact) => creerContact(contact)
        }
    });
}

function creerListeContactsArchives() {
    if (CONTACTS_ARCHIVES.length === 0) {
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
                }, 'Aucun contact archivé'),
                createElement('p', {
                    class: 'text-xs mt-2'
                }, 'Les contacts archivés apparaîtront ici')
            ])
        ]);
    }
    
    return createElement('div', {
        class: 'flex-1 overflow-y-auto',
        vFor: {
            each: CONTACTS_ARCHIVES,
            render: (contact) => creerContact(contact)
        }
    });
}

function creerListeConversations() {
    // Filtrer les conversations non archivées
    const conversationsNonArchivees = CONVERSATIONS.filter(conv => {
        // Si c'est un groupe, toujours l'afficher
        if (conv.type === 'groupe') return true;
        // Si c'est un contact, vérifier qu'il n'est pas archivé
        return !CONTACTS_ARCHIVES.find(archived => archived.id === conv.id);
    });
    
    if (conversationsNonArchivees.length === 0) {
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
                }, 'Aucune conversation pour le moment')
            ])
        ]);
    }
    
    return createElement('div', {
        class: 'flex-1 overflow-y-auto',
        vFor: {
            each: conversationsNonArchivees,
            render: (conversation) => creerConversation(conversation)
        }
    });
}
function creerSectionDiscussions() {
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
            contenu = createElement('div', { class: 'flex-1 overflow-y-auto' }, [
                creerFormulaireGroupe(),
                createElement('div', { class: 'border-t border-gray-200 mx-4' }),
                createElement('div', { class: 'px-4 py-3' }, [
                    createElement('h4', { class: 'text-sm font-medium text-gray-700 mb-3' }, 'Groupes existants'),
                    GROUPES.length === 0 ? 
                        createElement('p', { class: 'text-xs text-gray-500 text-center py-4' }, 'Aucun groupe créé') : 
                        createElement('div', { vFor: { each: GROUPES, render: (groupe) => creerGroupe(groupe) } })
                ])
            ]);
            break;
        case 'diffusions':
            titre = 'Contacts';
            contenu = creerListeContacts();
            break;
        case 'archives':
            titre = 'Archives';
            contenu = creerListeContactsArchives();
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
                    class: 'w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500'
                }),
                createElement('i', { class: 'fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs' })
            ]) : null
        ]),
        
        contenu
    ]);
}

function creerBoutonSidebar(bouton) {
    const baseClasses = "w-28 h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 font-medium text-xs gap-2 mb-3 outline-none";
    const activeClasses = bouton.active 
        ? "bg-yellow-500 text-white border-yellow-600" 
        : "bg-gray-50 text-gray-700 border-orange-400 hover:bg-gray-100 hover:border-orange-500";
        
    
    return createElement('button', {
        class: `${baseClasses} ${activeClasses}`,
        onClick: function() {
            SIDEBAR_BUTTONS.forEach(btn => btn.active = false);
            bouton.active = true;
            activeButtonId = bouton.id;
            
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

function creerSidebar() {
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

function creerInterface() {
    const contactSelectionne = CONTACTS.find(c => c.selected) || CONTACTS_ARCHIVES.find(c => c.selected);
    const contactEstArchive = CONTACTS_ARCHIVES.find(c => c.selected);
    
    const buttons = [
        ['bg-orange-500 hover:bg-orange-600', 'fa-solid fa-share'],
        contactSelectionne ? [
            contactEstArchive ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500',
            contactEstArchive ? 'fas fa-box-open' : 'fas fa-archive'
        ] : ['bg-gray-400 hover:bg-gray-500', 'fas fa-archive'],
        ['bg-gray-600 hover:bg-gray-700', 'fa-solid fa-stop'],
        ['bg-red-500 hover:bg-red-600', 'fas fa-trash']
    ];

    return createElement('div', { id: 'whatsapp-container', class: 'flex h-screen bg-gray-100 font-sans ' }, [
        creerSidebar(),
        creerSectionDiscussions(),
        createElement('div', { class: 'flex-1 bg-gray-100 flex flex-col relative' }, [
            createElement('div', { class: 'flex-1 flex items-center bg-pink-50 justify-center' }, [
                createElement('div', { class: 'text-center' }, [
                    createElement('div', { class: 'w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center' }, 
                        createElement('i', { class: 'fas fa-comments text-4xl text-gray-500' })
                    ),
                    createElement('h2', { class: 'text-2xl font-light text-gray-600 mb-2' }, 'Sélectionnez une conversation'),
                    createElement('p', { class: 'text-gray-500' }, 'Choisissez une conversation dans la liste pour commencer à discuter')
                ])
            ]),
            createElement('div', { class: 'absolute top-4 right-4 flex space-x-2' }, 
                buttons.map(([color, icon], index) => 
                    createElement('button', { 
                        class: `w-8 h-8 ${color} rounded-full flex items-center justify-center text-white transition-colors shadow-md`,
                        onClick: function() {
                            if (index === 1 && contactSelectionne) { 
                                if (contactEstArchive) {
                                    desarchiverContact(contactSelectionne.id);
                                } else {
                                    archiverContact(contactSelectionne.id);
                                }
                            }
                        }
                    }, createElement('i', { class: `${icon} text-sm` }))
                )
            ),
            createElement('div', { class: 'absolute bottom-6 right-6' }, [
                createElement('button', { 
                    class: 'w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-green-600 transition-colors' 
                }, createElement('i', { class: 'fas fa-arrow-right text-xl' }))
            ])
        ])
    ]);
}

//membres 
function creerSelecteurMembres() {
    // Filtrer les contacts non archivés pour la création de groupes
    const contactsNonArchives = CONTACTS.filter(contact => !contact.archived);
    
    if (contactsNonArchives.length === 0) {
        return createElement('div', { class: 'text-center text-gray-500 py-4' }, [
            createElement('p', { class: 'text-xs' }, 'Aucun contact disponible'),
            createElement('p', { class: 'text-xs mt-1' }, 'Créez d\'abord des contacts pour former un groupe')
        ]);
    }
    
    return createElement('div', { class: 'max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2' }, 
        contactsNonArchives.map(contact => 
            createElement('label', { class: 'flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded px-2' }, [
                createElement('input', {
                    type: 'checkbox',
                    name: 'membres',
                    value: contact.id,
                    class: 'mr-2 text-green-500 focus:ring-green-500'
                }),
                createElement('div', {
                    class: 'w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0'
                }, contact.avatar),
                createElement('span', { class: 'text-sm text-gray-700' }, contact.name)
            ])
        )
    );
}

const additionalStyles = createElement('style', {}, `
    .fas, .fa {
        font-family: "Font Awesome 6 Free";
        font-weight: 900;
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
    
    /* Animation pour les messages d'erreur */
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
    
    /* Transition douce pour les bordures d'erreur */
    input, textarea {
        transition: border-color 0.3s ease, background-color 0.3s ease;
    }
`);

function init() {
    document.head.appendChild(additionalStyles);
    
    const app = document.getElementById('app');
    if (app) {
        app.appendChild(creerInterface());
        console.log('Interface WhatsApp créée avec archivage des contacts!');
    } else {
        console.error('Élément #app non trouvé');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}