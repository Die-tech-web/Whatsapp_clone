import {
  CONTACTS,
  CONTACTS_ARCHIVES,
  CONVERSATIONS,
  GROUPES,
  SIDEBAR_BUTTONS,
  setActiveButtonId,
} from "./data.js";
import {
  afficherErreur,
  supprimerErreur,
  rafraichirInterface,
} from "./utils.js";

export function creerFormulaireContact() {
  return createElement(
    "div",
    {
      class: "p-4",
    },
    [
      createElement(
        "h3",
        {
          class: "text-sm font-medium text-gray-900 mb-4",
        },
        "Ajouter un nouveau contact"
      ),

      createElement(
        "form",
        {
          onSubmit: function (e) {
            e.preventDefault();

            supprimerErreur("prenom");
            supprimerErreur("nom");
            supprimerErreur("numero");

            const prenom = e.target.prenom.value.trim();
            const nom = e.target.nom.value.trim();
            const numero = e.target.numero.value.trim();

            let hasError = false;

            if (!prenom) {
              afficherErreur(
                "prenom",
                "Le prénom est requis pour créer votre contact"
              );
              hasError = true;
            }

            if (!nom) {
              afficherErreur(
                "nom",
                " N'oubliez pas d'ajouter le nom de famille"
              );
              hasError = true;
            }

            if (!numero) {
              afficherErreur(
                "numero",
                " Le numéro de téléphone est indispensable"
              );
              hasError = true;
            } else {
              const hasDigits = /\d/.test(numero);
              if (!hasDigits) {
                afficherErreur(
                  "numero",
                  "Le numéro doit contenir au moins un chiffre"
                );
                hasError = true;
              } else if (/[a-zA-Z]/.test(numero)) {
                afficherErreur(
                  "numero",
                  "Les lettres ne sont pas autorisées dans un numéro"
                );
                hasError = true;
              } else if (numero.length < 9) {
                afficherErreur(
                  "numero",
                  "Le numéro doit contenir au minimum 9 caractères"
                );
                hasError = true;
              } else if (numero.length > 16) {
                afficherErreur(
                  "numero",
                  "Le numéro ne doit pas dépasser 16 caractères"
                );
                hasError = true;
              } else if (numero.startsWith("+")) {
                const numeroSansPlus = numero.slice(1);
                if (numeroSansPlus.length === 0) {
                  afficherErreur("numero", 'Ajoutez des chiffres après le "+"');
                  hasError = true;
                } else if (!/^\d+$/.test(numeroSansPlus)) {
                  afficherErreur(
                    "numero",
                    'Après le "+", seuls les chiffres sont autorisés'
                  );
                  hasError = true;
                }
              } else if (!/^\d+$/.test(numero)) {
                afficherErreur(
                  "numero",
                  'Utilisez uniquement des chiffres (ou commencez par "+")'
                );
                hasError = true;
              }

              if (
                !hasError &&
                CONTACTS.find((contact) => contact.numero === numero)
              ) {
                afficherErreur("numero", " Ce numéro existe déjà");
                hasError = true;
              }
            }

            if (hasError) {
              return;
            }

            let nomFinal = `${prenom} ${nom}`;
            let compteur = 0;
            while (
              CONTACTS.find((contact) => contact.name === nomFinal) ||
              CONTACTS_ARCHIVES.find((contact) => contact.name === nomFinal)
            ) {
              compteur++;
              nomFinal = `${prenom} ${nom}${compteur}`;
            }

            const nouveauContact = {
              id: Date.now(),
              name: nomFinal,
              lastMessage: "Nouveau contact",
              time: new Date().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              avatar: `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase(),
              unread: 0,
              active: false,
              numero: numero,
              selected: false,
            };
            CONTACTS.push(nouveauContact);
            CONVERSATIONS.push({ ...nouveauContact });

            e.target.reset();

            SIDEBAR_BUTTONS.forEach((btn) => (btn.active = false));
            SIDEBAR_BUTTONS.find(
              (btn) => btn.id === "diffusions"
            ).active = true;
            setActiveButtonId("diffusions");

            rafraichirInterface();

            console.log("Nouveau contact ajouté:", nouveauContact);
          },
        },
        [
          createElement(
            "div",
            {
              class: "mb-3",
            },
            [
              createElement(
                "label",
                {
                  class: "block text-xs font-medium text-gray-700 mb-1",
                },
                "Prénom"
              ),
              createElement("input", {
                type: "text",
                name: "prenom",
                id: "prenom",
                class:
                  "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors",
                onFocus: function () {
                  supprimerErreur("prenom");
                },
              }),
            ]
          ),

          createElement(
            "div",
            {
              class: "mb-3",
            },
            [
              createElement(
                "label",
                {
                  class: "block text-xs font-medium text-gray-700 mb-1",
                },
                "Nom"
              ),
              createElement("input", {
                type: "text",
                name: "nom",
                id: "nom",
                class:
                  "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors",
                onFocus: function () {
                  supprimerErreur("nom");
                },
              }),
            ]
          ),

          createElement(
            "div",
            {
              class: "mb-4",
            },
            [
              createElement(
                "label",
                {
                  class: "block text-xs font-medium text-gray-700 mb-1",
                },
                "Numéro de téléphone"
              ),
              createElement("input", {
                type: "text",
                name: "numero",
                id: "numero",
                placeholder: "taper le numero",
                class:
                  "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors",
                onFocus: function () {
                  supprimerErreur("numero");
                },
              }),
            ]
          ),

          createElement(
            "button",
            {
              type: "submit",
              class:
                "w-full bg-green-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-600 transition-colors",
            },
            "Ajouter le contact"
          ),
        ]
      ),
    ]
  );
}

export function creerFormulaireGroupe() {
  return createElement("div", { class: "p-4" }, [
    createElement(
      "h3",
      {
        class: "text-sm font-medium text-gray-900 mb-4",
      },
      "Créer un nouveau groupe"
    ),

    createElement(
      "form",
      {
        onSubmit: function (e) {
          e.preventDefault();
          ["nom_groupe", "description_groupe", "membres_groupe"].forEach(
            supprimerErreur
          );

          const nom = e.target.nom.value.trim();
          const description = e.target.description.value.trim();
          const membresSelectionnes = Array.from(
            e.target.querySelectorAll('input[name="membres"]:checked')
          );

          if (!nom) {
            afficherErreur("nom_groupe", " Le nom du groupe est requis");
            return;
          }
          if (!description) {
            afficherErreur(
              "description_groupe",
              " Une description est requise"
            );
            return;
          }
          if (membresSelectionnes.length === 0) {
            afficherErreur(
              "membres_groupe",
              " Sélectionnez au moins un membre"
            );
            return;
          }

          const nouveauGroupe = {
            id: Date.now(),
            name: nom,
            administrateur: "Vous",
            lastMessage: "Groupe créé",
            time: new Date().toLocaleString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            avatar: nom.charAt(0).toUpperCase(),
            unread: 0,
            active: false,
            description: description,
            type: "groupe",
            membres: membresSelectionnes.length + 1,
            listeMembres: [
              "Vous (Admin)",
              ...membresSelectionnes
                .map((cb) => {
                  const contact = CONTACTS.find(
                    (c) => c.id.toString() === cb.value
                  );
                  return contact ? contact.name : "";
                })
                .filter(Boolean),
            ],
          };

          GROUPES.push(nouveauGroupe);
          CONVERSATIONS.push({ ...nouveauGroupe });
          e.target.reset();

          SIDEBAR_BUTTONS.forEach((btn) => (btn.active = false));
          SIDEBAR_BUTTONS.find((btn) => btn.id === "messages").active = true;
          setActiveButtonId("messages");
          rafraichirInterface();

          console.log("Groupe créé:", nouveauGroupe);
        },
      },
      [
        // Champ nom du groupe
        createElement("div", { class: "mb-3" }, [
          createElement(
            "label",
            {
              class: "block text-xs font-medium text-gray-700 mb-1",
            },
            "Nom du groupe"
          ),
          createElement("input", {
            type: "text",
            name: "nom",
            id: "nom_groupe",
            placeholder: "Nom du groupe...",
            class:
              "w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-md hover:border-orange-400 outline-none",
            onFocus: () => supprimerErreur("nom_groupe"),
          }),
        ]),

        // Champ description
        createElement("div", { class: "mb-3" }, [
          createElement(
            "label",
            {
              class: "block text-xs font-medium text-gray-700 mb-1",
            },
            "Description"
          ),
          createElement("textarea", {
            name: "description",
            id: "description_groupe",
            placeholder: "Décrivez ce groupe...",
            rows: 2,
            class:
              "w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-md hover:border-orange-400 outline-none resize-none",
            onFocus: () => supprimerErreur("description_groupe"),
          }),
        ]),

        // Section admin
        createElement("div", { class: "mb-4" }, [
          createElement(
            "label",
            {
              class: "block text-xs font-medium text-gray-700 mb-2",
            },
            "Membres du groupe"
          ),
          createElement(
            "div",
            {
              class:
                "mb-2 px-4 py-3 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm",
            },
            [
              createElement("div", { class: "flex items-center" }, [
                createElement(
                  "div",
                  {
                    class:
                      "w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0",
                  },
                  "V"
                ),
                createElement(
                  "span",
                  {
                    class: "text-sm text-orange-800 font-medium",
                  },
                  "Vous (Administrateur)"
                ),
              ]),
            ]
          ),
          createElement(
            "div",
            {
              id: "membres_groupe",
              class: "space-y-2",
            },
            [creerSelecteurMembres()]
          ),
        ]),

        // Bouton de création
        createElement(
          "button",
          {
            type: "submit",
            class:
              "w-full bg-orange-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors transform hover:scale-105 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-md",
          },
          "Créer le groupe"
        ),
      ]
    ),
  ]);
}

export function creerSelecteurMembres(estEnModeAjout = false) {
  const contactsNonArchives = CONTACTS.filter((contact) => !contact.archived);

  return createElement("div", { class: "space-y-4" }, [
    // Le bouton "Ajouter un nouveau contact" ne s'affiche que si estEnModeAjout est true
    estEnModeAjout &&
      createElement(
        "button",
        {
          type: "button",
          class: `
          w-full flex items-center justify-center gap-2 
          px-4 py-3 
          text-sm font-medium text-white 
          bg-orange-500 hover:bg-orange-600 
          rounded-lg 
          transition-all duration-200 
          shadow-md hover:shadow-lg 
          transform hover:-translate-y-0.5
        `,
          onClick: function () {
            const formContainer = document.createElement("div");
            formContainer.id = "nouveau-contact-groupe";
            formContainer.className =
              "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

            const form = createElement(
              "div",
              {
                class: "bg-white rounded-lg p-6 w-96 shadow-xl",
              },
              [
                createElement(
                  "h3",
                  { class: "text-lg font-medium mb-4" },
                  "Ajouter un nouveau contact"
                ),
                creerFormulaireContact(),
                createElement(
                  "div",
                  { class: "flex justify-end mt-4 space-x-2" },
                  [
                    createElement(
                      "button",
                      {
                        class:
                          "px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg",
                        onClick: () => formContainer.remove(),
                      },
                      "Annuler"
                    ),
                  ]
                ),
              ]
            );

            formContainer.appendChild(form);
            document.body.appendChild(formContainer);
          },
        },
        [
          createElement("i", { class: "fas fa-user-plus text-lg" }),
          "Ajouter un nouveau contact",
        ]
      ),

    createElement(
      "div",
      {
        class: "flex items-center my-4",
      },
      [
        createElement("div", { class: "flex-grow border-t border-orange-200" }),
        createElement(
          "span",
          { class: "px-3 text-xs text-orange-500 font-medium" },
          "Contacts existants"
        ),
        createElement("div", { class: "flex-grow border-t border-orange-200" }),
      ]
    ),

    createElement(
      "div",
      {
        class: "max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2",
      },
      contactsNonArchives.length === 0
        ? createElement("div", { class: "text-center text-gray-500 py-4" }, [
            createElement(
              "p",
              { class: "text-xs" },
              "Aucun contact disponible"
            ),
            createElement(
              "p",
              { class: "text-xs mt-1" },
              "Créez d'abord des contacts pour former un groupe"
            ),
          ])
        : contactsNonArchives.map((contact) =>
            createElement(
              "label",
              {
                class:
                  "flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded px-2",
              },
              [
                createElement("input", {
                  type: "checkbox",
                  name: "membres",
                  value: contact.id,
                  class: "mr-2 text-orange-500 focus:ring-orange-500",
                }),
                createElement(
                  "div",
                  {
                    class:
                      "w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0",
                  },
                  contact.avatar
                ),
                createElement(
                  "span",
                  { class: "text-sm text-gray-700" },
                  contact.name
                ),
              ]
            )
          )
    ),
  ]);
}

// Fonction pour créer le popup des membres
export function creerPopupMembres(groupeId) {
  const groupe = GROUPES.find((g) => g.id === groupeId);
  if (!groupe) return;

  const popupContainer = createElement(
    "div",
    {
      class:
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
    },
    [
      createElement(
        "div",
        {
          class: "bg-white rounded-lg p-6 max-w-md w-full",
        },
        [
          // En-tête du popup
          createElement(
            "div",
            {
              class: "flex justify-between items-center mb-4",
            },
            [
              createElement(
                "h3",
                {
                  class: "text-lg font-medium",
                },
                `Membres de ${groupe.name}`
              ),
              // Bouton Ajouter
              createElement(
                "button",
                {
                  class:
                    "px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-2",
                  onClick: () => {
                    // Créer popup pour ajouter un nouveau contact
                    const formContainer = document.createElement("div");
                    formContainer.className =
                      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]";

                    const form = createElement(
                      "div",
                      {
                        class: "bg-white rounded-lg p-6 w-96 shadow-xl",
                      },
                      [
                        createElement(
                          "h3",
                          {
                            class: "text-lg font-medium mb-4",
                          },
                          "Ajouter un nouveau contact"
                        ),
                        creerFormulaireContact(),
                        createElement(
                          "div",
                          {
                            class: "flex justify-end mt-4 space-x-2",
                          },
                          [
                            createElement(
                              "button",
                              {
                                class:
                                  "px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg",
                                onClick: () => formContainer.remove(),
                              },
                              "Annuler"
                            ),
                          ]
                        ),
                      ]
                    );

                    formContainer.appendChild(form);
                    document.body.appendChild(formContainer);
                  },
                },
                [
                  createElement("i", { class: "fas fa-user-plus" }),
                  "Ajouter un contact",
                ]
              ),
            ]
          ),

          // Liste des membres existants
          createElement(
            "div",
            {
              class: "space-y-2 max-h-64 overflow-y-auto",
            },
            [
              // Admin (Vous)
              createElement(
                "div",
                {
                  class:
                    "flex items-center justify-between p-2 bg-orange-50 rounded-lg",
                },
                [
                  createElement("div", { class: "flex items-center gap-2" }, [
                    createElement(
                      "div",
                      {
                        class:
                          "w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white",
                      },
                      "V"
                    ),
                    createElement(
                      "span",
                      { class: "text-sm font-medium" },
                      "Vous (Administrateur)"
                    ),
                  ]),
                ]
              ),

              // Autres membres
              ...groupe.listeMembres.slice(1).map((membre) =>
                createElement(
                  "div",
                  {
                    class:
                      "flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg",
                  },
                  [
                    createElement("div", { class: "flex items-center gap-2" }, [
                      createElement(
                        "div",
                        {
                          class:
                            "w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white",
                        },
                        membre.charAt(0)
                      ),
                      createElement("span", { class: "text-sm" }, membre),
                    ]),
                    createElement("div", { class: "flex gap-2" }, [
                      createElement(
                        "button",
                        {
                          class:
                            "px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600",
                        },
                        "Nommer"
                      ),
                      createElement(
                        "button",
                        {
                          class:
                            "px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600",
                        },
                        "Retirer"
                      ),
                    ]),
                  ]
                )
              ),
            ]
          ),
        ]
      ),
    ]
  );

  document.body.appendChild(popupContainer);
}

// Dans le code qui gère le clic sur le groupe
function ouvrirPopupMembres(groupeId) {
  creerPopupMembres(groupeId);
}
