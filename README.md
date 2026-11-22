# Sudoku

Un jeu de Sudoku qui fonctionne entièrement dans le navigateur, sans serveur ni installation.

## Ouvrir le jeu

Ouvrez simplement le fichier `index.html` dans un navigateur récent (double-clic, ou glisser-déposer dans une fenêtre).

## Pages

- `index.html` : écran principal du jeu. Au-dessus de la grille, une ligne rappelle le niveau de la partie et affiche le chronomètre. Sur ordinateur, la grille 9×9 est sous le titre, à gauche, et le panneau de droite regroupe, à la hauteur de la grille, le pavé de saisie, le bouton « Vérifier la grille », les messages puis le niveau et les boutons « Nouvelle partie » et « Recommencer ». Sur mobile, ces éléments sont empilés sous la grille. La légende est en bas.

## Comment jouer

Le but est de remplir la grille pour que chaque ligne, chaque colonne et chaque bloc de 3×3 contienne une seule fois les chiffres de 1 à 9.

- Choisissez un **niveau** (Facile, Moyen ou Difficile) puis cliquez sur **Nouvelle partie** pour lancer une partie à ce niveau. Une nouvelle grille, différente à chaque partie et avec une solution unique, est générée : environ 45 chiffres de départ en Facile, 35 en Moyen et 25 en Difficile. Changer de niveau sans cliquer sur « Nouvelle partie » ne modifie pas la partie en cours. À l'ouverture de la page, une partie Facile est lancée.
- Les **chiffres de départ** apparaissent en gras sur fond bleuté : ils sont fixés et ne peuvent pas être modifiés.
- Les **cases vides** sont blanches : c'est à vous de les remplir.
- **Saisir un chiffre** : touchez ou cliquez une case (elle apparaît sur fond jaune), puis tapez un chiffre de 1 à 9 au clavier ou touchez un des boutons 1 à 9 du pavé de saisie (à droite de la grille sur ordinateur, dessous sur mobile). Votre chiffre s'affiche en bleu ; vous pouvez le remplacer en saisissant un autre chiffre.
- **Chiffres en conflit** : si un chiffre que vous avez saisi est déjà présent dans la même ligne, la même colonne ou le même bloc, il s'affiche en rouge, souligné, sur fond rosé, et un message précise la règle enfreinte. Le signalement disparaît dès que le conflit est corrigé. Les chiffres de départ ne sont jamais signalés.
- **Effacer** : touche Suppr ou Retour arrière, ou bouton « Effacer » du pavé de saisie.
- **Fin de partie** : dès que la dernière case est remplie, la grille est vérifiée automatiquement. Si elle respecte toutes les règles, les cases tremblent pendant environ une seconde, puis un message de félicitations s'affiche par-dessus la grille (fermez-le avec « Fermer » ou Échap, ou lancez directement une nouvelle partie) ; un message de réussite s'affiche aussi sous la grille, le contour de la grille passe au vert et les cases ne sont plus modifiables (pavé de saisie désactivé). S'il reste des erreurs, un message l'indique, les chiffres en conflit restent en rouge et la partie continue : corrigez-les pour gagner.
- **Chronomètre** : il démarre à 00:00 dès que la grille est générée et défile au-dessus de la grille, à côté du niveau. Il s'arrête quand la grille est réussie, et le temps final (au format mm:ss) s'affiche dans le message de félicitations. « Recommencer » et « Nouvelle partie » le remettent à 00:00.
- **Vérifier la grille** : à tout moment, ce bouton indique s'il reste des cases vides et combien de chiffres sont en conflit.
- **Nouvelle partie** : à tout moment, que la partie soit en cours ou terminée, le bouton « Nouvelle partie » génère une nouvelle grille au niveau coché, sans recharger la page. Vos saisies précédentes et le message affiché sous la grille (conflit, fin de partie…) disparaissent.
- **Recommencer** : le bouton « Recommencer » efface toutes vos saisies et remet la grille dans son état de départ. Le niveau et les chiffres de départ restent les mêmes : aucune nouvelle grille n'est générée (pour cela, utilisez « Nouvelle partie »).
- **Au clavier** : Tab pour entrer dans la grille, flèches pour changer de case.
- Les chiffres de départ ne peuvent pas être modifiés : un message le rappelle si vous essayez.

## Organisation des fichiers

```
index.html              écran principal du jeu
assets/css/style.css    feuille de style unique
assets/js/grilles.js    réglages des niveaux : chiffres de départ visés et libellés (données)
assets/js/generateur.js génération des grilles à solution unique (logique pure)
assets/js/main.js       logique de la partie et affichage de la grille
assets/img/             images (vide pour l'instant)
CHANGELOG.md            historique des user stories réalisées
```
