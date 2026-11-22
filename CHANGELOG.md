# Journal des modifications

## SUD-20261122-171606-3 — Chronométrer la partie et afficher le temps dans le message de fin

- `index.html` : nouvelle ligne d'informations au-dessus de la grille, avec le niveau de la partie et un chronomètre (`#chrono`, rôle `timer`, non annoncé à chaque seconde).
- `assets/js/main.js` : logique du chrono (`demarrerChrono`, `arreterChrono`, `tempsEcoule`, `formaterDuree` au format mm:ss) séparée de son affichage (`afficherChrono`, `afficherInfoNiveau`). Le chrono démarre à la génération de la partie, est recalculé depuis l'heure de début (affichage rafraîchi 4 fois par seconde) et se fige quand la grille est réussie.
- Le message de félicitations affiche le temps final (« … au niveau Facile en 04:37. Bravo ! ») ; le message de réussite sous la grille le reprend aussi.
- « Recommencer » et « Nouvelle partie » remettent le chrono à 00:00.
- `assets/css/style.css` : styles `infos-partie` (chiffres à chasse fixe pour le chrono).
- `README.md` mis à jour.

## SUD-20261122-171606-2 — Animer la grille puis afficher le message de victoire par-dessus

- Grille gagnée (dernière case remplie, ou « Vérifier la grille ») : toutes les cases tremblent pendant environ 1 seconde (léger mouvement horizontal répété, classe `grille--tremble`, animation CSS `tremblement`).
- À la fin du tremblement, un message « Félicitations ! » (avec le niveau réussi) s'affiche par-dessus la grille, sur un voile semi-transparent : la grille reste visible derrière. Le focus va sur le bouton « Fermer ».
- Le message se ferme avec « Fermer » ou Échap (le focus revient dans la grille), et disparaît aussi avec « Nouvelle partie » (dans le message ou dans le panneau) et « Recommencer » ; un tremblement en cours est alors annulé.
- `index.html` : la grille est placée dans un conteneur `plateau` qui accueille la superposition `#victoire`.
- `assets/css/style.css` : nouvelles variables `--duree-tremblement`, `--amplitude-tremblement`, `--couleur-voile`, `--ombre-carte` ; animation désactivée si l'utilisateur a demandé de réduire les mouvements (le message s'affiche alors directement).
- `assets/js/main.js` : affichage (`afficherTremblement`, `afficherVictoire`, `masquerVictoire`) séparé de l'enchaînement (`celebrerVictoire`, `annulerVictoire`, `fermerVictoire`).
- `README.md` mis à jour.

## SUD-20261122-171606 — Réorganiser l'interface : grille décalée à gauche et saisie à droite

- `index.html` : nouvelle disposition `jeu__disposition` avec la grille (et son aide) à gauche, puis un panneau `jeu__panneau` contenant la section « Saisie des chiffres » (pavé, « Vérifier la grille », message) suivie des commandes (niveau, « Nouvelle partie », « Recommencer », état de la partie). L'ordre du code suit l'ordre visuel, donc l'ordre de tabulation reste logique. Identifiants inchangés : le JavaScript n'est pas modifié.
- `assets/css/style.css` : à partir de 48rem de large, grille et panneau côte à côte, alignés en haut, dans un bloc centré ; la grille se trouve ainsi à gauche sous le titre. Sur mobile, les éléments sont empilés (grille, saisie, commandes) sur la largeur de l'écran, sans défilement horizontal. Nouvelles variables `--largeur-panneau` et `--largeur-disposition`.
- La légende reste sous la disposition et prend sa largeur sur ordinateur.
- `README.md` mis à jour.

## SUD-20261122-161717-8 — Détecter et annoncer la fin de partie

- Nouvelle logique dans `assets/js/main.js` : `compterCasesVides`, `compterErreurs` et `verifierGrille` (statuts « gagnee », « erreurs », « incomplete ») ; la partie possède un indicateur `terminee`.
- Vérification automatique quand la dernière case est remplie, et nouveau bouton « Vérifier la grille » sous le pavé de saisie.
- Grille réussie : message de réussite (zone `aria-live`, fond vert), contour de la grille en vert, état « Partie terminée » au-dessus de la grille ; saisie et effacement refusés, pavé et bouton « Vérifier » désactivés, cases en `aria-readonly`.
- Grille complète avec erreurs : message en rouge indiquant le nombre de chiffres en conflit, la partie continue.
- « Recommencer » et « Nouvelle partie » rendent la grille de nouveau jouable.
- Aide sous la grille et règles du jeu (`README.md`) complétées.

## SUD-20261122-161717-7 — Lancer une nouvelle partie à tout moment

- Le lancement d'une nouvelle partie est regroupé dans une fonction dédiée `lancerNouvellePartie` (`assets/js/main.js`), appelée par le bouton « Nouvelle partie » sans rechargement de la page.
- À chaque appel, que la partie soit en cours ou terminée : nouvelle grille générée au niveau coché, anciennes saisies et sélection abandonnées, message sous la grille (conflit, fin de partie…) effacé, nouveau niveau annoncé dans la zone `aria-live`.
- Règles du jeu complétées dans `README.md`.

## SUD-20261122-161717-6 — Recommencer la partie en cours

- Nouveau bouton « Recommencer » (style secondaire, à côté de « Nouvelle partie », `type="button"` pour ne pas lancer de nouvelle partie).
- Nouvelle logique `recommencerPartie` dans `assets/js/main.js` : la grille est reconstruite à partir de `partie.depart` ; le niveau, les chiffres de départ et la solution sont conservés, aucune grille n'est générée.
- La grille est rafraîchie (les signalements de conflit disparaissent avec les saisies) et un message est annoncé dans la zone `aria-live`.
- Règles du jeu complétées dans `README.md`.

## SUD-20261122-161717-5 — Signaler les chiffres en conflit

- Nouvelle logique dans `assets/js/main.js` : `reglesEnfreintes` (ligne, colonne et/ou bloc) et `estEnConflit` ; une case vide ou un chiffre de départ n'est jamais en conflit.
- Après chaque saisie ou effacement, toute la grille est rafraîchie (`rafraichirCases`) : un conflit apparaît ou disparaît aussi sur les autres chiffres saisis concernés.
- Chiffre saisi en conflit : rouge, souligné en vagues, sur fond rosé (classe `case--conflit`), même quand la case est sélectionnée ; `aria-invalid="true"` et mention « en conflit » dans le libellé de la case.
- Message annoncé dans la zone `aria-live` lors d'une saisie en conflit (par exemple « Attention : le 5 est déjà présent dans la même ligne et le même bloc. »).
- Légende complétée (« Chiffre en conflit ») et règles du jeu mises à jour dans `README.md`.

## SUD-20261122-161717-4 — Saisir et effacer un chiffre dans une case vide

- Sélection d'une case au clic, au toucher ou au clavier (Tab pour entrer dans la grille, flèches pour se déplacer) ; la case sélectionnée est surlignée en jaune avec un contour.
- Saisie d'un chiffre de 1 à 9 au clavier ou avec le nouveau pavé de boutons 1 à 9 sous la grille ; le chiffre saisi s'affiche en bleu.
- Effacement avec Suppr, Retour arrière ou le bouton « Effacer » : la case redevient vide.
- Les chiffres de départ ne changent pas : la tentative est refusée et un message est annoncé dans une zone `aria-live`.
- Logique séparée dans `assets/js/main.js` (`saisirChiffre`, `effacerCase`, `selectionnerCase`) et mise à jour de la seule case modifiée à l'affichage.
- Légende complétée (« Votre saisie ») et texte d'aide sous la grille.

## SUD-20261122-161717-3 — Générer une grille valide avec une solution unique selon le niveau

- Nouveau fichier `assets/js/generateur.js` : une grille complète est tirée au hasard (retour arrière avec chiffres mélangés), puis des chiffres sont retirés dans un ordre aléatoire en ne gardant un retrait que si la grille admet toujours une seule solution (comptage des solutions plafonné à 2).
- Chiffres de départ visés : 45 en Facile, 35 en Moyen, 25 en Difficile (`CHIFFRES_DEPART` dans `assets/js/grilles.js`). En Difficile, s'il n'est pas possible d'atteindre 25 sans perdre l'unicité, plusieurs essais sont faits et le plus proche est retenu.
- Les grilles fixes sont supprimées de `assets/js/grilles.js` : chaque partie (au chargement et à chaque « Nouvelle partie ») utilise une grille générée.
- La partie conserve sa grille de départ et sa solution (`depart`, `solution`) pour les user stories suivantes (Recommencer, vérification).

## SUD-20261122-161717-2 — Choisir le niveau de difficulté pour lancer une partie

- Ajout d'un bloc de commandes au-dessus de la grille : choix du niveau (Facile, Moyen, Difficile) par boutons radio groupés dans un `fieldset`, et bouton « Nouvelle partie ».
- « Nouvelle partie » démarre une partie au niveau sélectionné ; changer de niveau sans relancer ne modifie pas la partie en cours (un message d'aide le rappelle).
- Zone `aria-live` indiquant le niveau de la partie en cours et annonçant le lancement d'une nouvelle partie.
- Ajout d'une grille fixe Moyen (35 chiffres de départ) et Difficile (25 chiffres de départ) dans `assets/js/grilles.js`, ainsi que des libellés des niveaux.
- Au chargement de la page, une partie Facile est toujours lancée (pas de sauvegarde).

## SUD-20261122-161717 — Afficher une grille de Sudoku 9×9 avec ses chiffres de départ

- Création de la structure du projet (`index.html`, `assets/css/style.css`, `assets/js/`, `assets/img/`, `README.md`).
- Ajout d'une grille de départ fixe de niveau Facile (47 chiffres de départ) dans `assets/js/grilles.js`.
- Construction de la grille 9×9 (81 cases, 9 lignes, 9 colonnes) dans `assets/js/main.js`, avec séparation logique / affichage.
- Blocs de 3×3 délimités par des bordures épaisses, cases séparées par des bordures fines.
- Chiffres de départ en gras sur fond bleuté, marqués en lecture seule (`aria-readonly`) ; cases vides sur fond blanc.
- Grille carrée qui s'adapte à la largeur de l'écran (jusqu'à 32rem), sans défilement horizontal dès 360 px.
- Légende expliquant la différence entre chiffre de départ et case vide.
