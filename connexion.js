import { rafraichirInterface } from './utils.js';

let utilisateurConnecte = {
    nom: '',
    prenom: '',
    telephone: '',
    connecte: false
};

function chargerDonneesConnexion() {
    const donneesSauvees = sessionStorage.getItem('utilisateurWhatsApp');
    if (donneesSauvees) {
        utilisateurConnecte = JSON.parse(donneesSauvees);
        return true;
    }
    return false;
}

function sauvegarderDonneesConnexion() {
    sessionStorage.setItem('utilisateurWhatsApp', JSON.stringify(utilisateurConnecte));
}

function validerTelephone(telephone) {
    const numeroNettoye = telephone.replace(/\D/g, '');
    
    if (numeroNettoye.length < 9) {
        return { valide: false, message: 'Le numéro doit contenir au moins 9 chiffres' };
    }
    
    if (numeroNettoye.length > 16) {
        return { valide: false, message: 'Le numéro ne peut pas dépasser 16 chiffres' };
    }
    
    return { valide: true, numeroNettoye };
}

function validerNomPrenom(nom, prenom) {
    if (!nom.trim()) {
        return { valide: false, message: 'Le nom est requis' };
    }
    
    if (!prenom.trim()) {
        return { valide: false, message: 'Le prénom est requis' };
    }
    
    if (nom.trim().length < 2) {
        return { valide: false, message: 'Le nom doit contenir au moins 2 caractères' };
    }
    
    if (prenom.trim().length < 2) {
        return { valide: false, message: 'Le prénom doit contenir au moins 2 caractères' };
    }
    
    return { valide: true };
}

export function creerInterfaceConnexion() {
    return createElement('div', { 
        class: 'min-h-screen bg-gradient-to-br from-green-250 via-green-500 to-green-300 flex items-center justify-center p-4',
        id: 'interface-connexion'
    }, [
        createElement('div', { class: 'bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all' }, [
            createElement('div', { class: 'text-center mb-8' }, [
                createElement('div', { class: 'w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center' }, 
                    createElement('i', { class: 'fab fa-whatsapp text-3xl text-white' })
                ),
                createElement('h1', { class: 'text-3xl font-bold text-gray-800 mb-2' },),
                createElement('p', { class: 'text-gray-600' }, 'Connectez-vous pour commencer')
            ]),
            
            createElement('form', { 
                id: 'form-connexion',
                class: 'space-y-6',
                onSubmit: function(e) {
                    e.preventDefault();
                    tenterConnexion();
                }
            }, [
                // Champ Prénom
                createElement('div', {}, [
                    createElement('label', { class: 'block text-sm font-medium text-gray-700 mb-2' }, 'Prénom'),
                    createElement('input', {
                        type: 'text',
                        id: 'prenom',
                        class: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        placeholder: 'Votre prénom',
                        required: true
                    })
                ]),
                
                createElement('div', {}, [
                    createElement('label', { class: 'block text-sm font-medium text-gray-700 mb-2' }, 'Nom'),
                    createElement('input', {
                        type: 'text',
                        id: 'nom',
                        class: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        placeholder: 'Votre nom',
                        required: true
                    })
                ]),
                
                createElement('div', {}, [
                    createElement('label', { class: 'block text-sm font-medium text-gray-700 mb-2' }, 'Numéro de téléphone'),
                    createElement('input', {
                        type: 'tel',
                        id: 'telephone',
                        class: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        placeholder: '123456789 (9-16 chiffres)',
                        required: true,
                        onInput: function(e) {
                            e.target.value = e.target.value.replace(/\D/g, '');
                            
                            const validation = validerTelephone(e.target.value);
                            const messageElement = document.getElementById('message-telephone');
                            
                            if (e.target.value && !validation.valide) {
                                e.target.classList.add('border-red-500');
                                e.target.classList.remove('border-green-500');
                                if (messageElement) {
                                    messageElement.textContent = validation.message;
                                    messageElement.className = 'text-red-500 text-sm mt-1';
                                }
                            } else if (validation.valide) {
                                e.target.classList.add('border-green-500');
                                e.target.classList.remove('border-red-500');
                                if (messageElement) {
                                    messageElement.textContent = 'Numéro valide ✓';
                                    messageElement.className = 'text-green-500 text-sm mt-1';
                                }
                            } else {
                                e.target.classList.remove('border-red-500', 'border-green-500');
                                if (messageElement) {
                                    messageElement.textContent = '';
                                }
                            }
                        }
                    }),
                    createElement('div', { id: 'message-telephone', class: 'text-sm mt-1' })
                ]),
                
              
                createElement('div', { 
                    id: 'messages-validation',
                    class: 'hidden p-3 rounded-lg text-sm'
                }),
                
             
                createElement('button', {
                    type: 'submit',
                    class: 'w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                    id: 'btn-connexion'
                }, [
                    createElement('i', { class: 'fas fa-sign-in-alt mr-2' }),
                    'Se connecter'
                ])
            ])
        ])
    ]);
}


function tenterConnexion() {
    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    
  
    const validationNom = validerNomPrenom(nom, prenom);
    if (!validationNom.valide) {
        afficherMessage(validationNom.message, 'erreur');
        return;
    }
    
    const validationTel = validerTelephone(telephone);
    if (!validationTel.valide) {
        afficherMessage(validationTel.message, 'erreur');
        return;
    }
    
  
    utilisateurConnecte = {
        nom: nom,
        prenom: prenom,
        telephone: validationTel.numeroNettoye,
        connecte: true
    };
    
    sauvegarderDonneesConnexion();
    afficherMessage('Connexion réussie ! Bienvenue ' + prenom + ' !', 'succes');
    
    setTimeout(() => {
        rafraichirInterface();
    }, 1500);
}

function afficherMessage(message, type) {
    const messageElement = document.getElementById('messages-validation');
    const btnConnexion = document.getElementById('btn-connexion');
    
    messageElement.className = `p-3 rounded-lg text-sm ${
        type === 'erreur' ? 'bg-red-100 text-red-700 border border-red-300' : 
        'bg-green-100 text-green-700 border border-green-300'
    }`;
    messageElement.textContent = message;
    messageElement.classList.remove('hidden');
    
    if (type === 'succes') {
        btnConnexion.innerHTML = '<i class="fas fa-check mr-2"></i>Connexion en cours...';
        btnConnexion.disabled = true;
        btnConnexion.classList.add('opacity-75');
    }
    
    if (type === 'erreur') {
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 5000);
    }
}

export function creerBoutonDeconnexion() {
    return createElement('button', {
        class: 'w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md',
        title: 'Se déconnecter',
        onClick: function() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                deconnecter();
            }
        }
    }, createElement('i', { class: 'fas fa-sign-out-alt text-sm' }));
}

function deconnecter() {
    utilisateurConnecte = {
        nom: '',
        prenom: '',
        telephone: '',
        connecte: false
    };
    
    sessionStorage.removeItem('utilisateurWhatsApp');
    rafraichirInterface();
}

export function estConnecte() {
    return chargerDonneesConnexion() && utilisateurConnecte.connecte;
}

export function obtenirUtilisateur() {
    return utilisateurConnecte;
}

export function initialiserConnexion() {
    return chargerDonneesConnexion();
}