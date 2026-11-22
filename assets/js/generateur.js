/*
 * Générateur de grilles de Sudoku (logique pure, sans affichage).
 *
 * Une grille est un tableau de 81 entiers, lu ligne par ligne :
 * l'indice i correspond à la ligne Math.floor(i / 9) et à la colonne i % 9.
 * La valeur 0 désigne une case vide, 1 à 9 un chiffre.
 *
 * Principe :
 * 1. on remplit une grille complète au hasard en respectant les règles ;
 * 2. on retire des chiffres un à un, dans un ordre aléatoire, en ne gardant
 *    un retrait que si la grille admet toujours une seule solution ;
 * 3. on s'arrête quand le nombre de chiffres de départ visé est atteint.
 */
var Generateur = (function () {
  "use strict";

  var TAILLE = 9;
  var NB_CASES = TAILLE * TAILLE;
  var TOUS_LES_CHIFFRES = 0x3fe; // bits 1 à 9 : le chiffre v correspond au bit (1 << v)
  var ESSAIS_MAX = 6; // essais de retrait si le nombre visé n'est pas atteint du premier coup

  function ligneDe(i) {
    return Math.floor(i / TAILLE);
  }

  function colonneDe(i) {
    return i % TAILLE;
  }

  function blocDe(i) {
    return Math.floor(ligneDe(i) / 3) * 3 + Math.floor(colonneDe(i) / 3);
  }

  /** Mélange un tableau sur place (Fisher-Yates) et le renvoie. */
  function melanger(tableau) {
    for (var i = tableau.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = tableau[i];
      tableau[i] = tableau[j];
      tableau[j] = temp;
    }
    return tableau;
  }

  function nombreDeBits(masque) {
    var n = 0;
    while (masque) {
      masque &= masque - 1;
      n++;
    }
    return n;
  }

  /**
   * Explore les solutions d'une grille par retour arrière.
   * S'arrête dès que `limite` solutions sont trouvées.
   * Si `aleatoire` est vrai, les chiffres sont essayés dans un ordre aléatoire.
   * Renvoie { compte: nombre de solutions trouvées (≤ limite), solution: la première trouvée ou null }.
   */
  function explorer(grille, limite, aleatoire) {
    var g = grille.slice();
    var lignes = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var colonnes = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var blocs = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var compte = 0;
    var premiere = null;

    // Chiffres déjà placés : une grille qui contient un doublon n'a aucune solution.
    for (var i = 0; i < NB_CASES; i++) {
      var v = g[i];
      if (v === 0) {
        continue;
      }
      var bit = 1 << v;
      var l = ligneDe(i);
      var c = colonneDe(i);
      var b = blocDe(i);
      if ((lignes[l] | colonnes[c] | blocs[b]) & bit) {
        return { compte: 0, solution: null };
      }
      lignes[l] |= bit;
      colonnes[c] |= bit;
      blocs[b] |= bit;
    }

    function etape() {
      // Case vide ayant le moins de candidats possibles.
      var choix = -1;
      var masqueChoix = 0;
      var minimum = 10;
      for (var i = 0; i < NB_CASES; i++) {
        if (g[i] !== 0) {
          continue;
        }
        var masque = TOUS_LES_CHIFFRES & ~(lignes[ligneDe(i)] | colonnes[colonneDe(i)] | blocs[blocDe(i)]);
        var n = nombreDeBits(masque);
        if (n === 0) {
          return; // impasse
        }
        if (n < minimum) {
          minimum = n;
          choix = i;
          masqueChoix = masque;
          if (n === 1) {
            break;
          }
        }
      }

      if (choix === -1) {
        // Plus aucune case vide : c'est une solution.
        compte++;
        if (premiere === null) {
          premiere = g.slice();
        }
        return;
      }

      var valeurs = [];
      for (var v = 1; v <= TAILLE; v++) {
        if (masqueChoix & (1 << v)) {
          valeurs.push(v);
        }
      }
      if (aleatoire) {
        melanger(valeurs);
      }

      var l = ligneDe(choix);
      var c = colonneDe(choix);
      var b = blocDe(choix);
      for (var k = 0; k < valeurs.length; k++) {
        var bit = 1 << valeurs[k];
        g[choix] = valeurs[k];
        lignes[l] |= bit;
        colonnes[c] |= bit;
        blocs[b] |= bit;

        etape();

        g[choix] = 0;
        lignes[l] &= ~bit;
        colonnes[c] &= ~bit;
        blocs[b] &= ~bit;
        if (compte >= limite) {
          return;
        }
      }
    }

    etape();
    return { compte: compte, solution: premiere };
  }

  /** Nombre de solutions de la grille, plafonné à `limite` (2 suffit pour tester l'unicité). */
  function compterSolutions(grille, limite) {
    return explorer(grille, limite || 2, false).compte;
  }

  /** Vrai si la grille n'a aucun doublon dans une ligne, une colonne ou un bloc. */
  function respecteLesRegles(grille) {
    var vus = {};
    for (var i = 0; i < NB_CASES; i++) {
      var v = grille[i];
      if (v === 0) {
        continue;
      }
      var cles = ["l" + ligneDe(i) + v, "c" + colonneDe(i) + v, "b" + blocDe(i) + v];
      for (var k = 0; k < cles.length; k++) {
        if (vus[cles[k]]) {
          return false;
        }
        vus[cles[k]] = true;
      }
    }
    return true;
  }

  /** Grille complète tirée au hasard, conforme aux règles. */
  function genererSolution() {
    var vide = [];
    for (var i = 0; i < NB_CASES; i++) {
      vide.push(0);
    }
    return explorer(vide, 1, true).solution;
  }

  /** Retire des chiffres de la solution tant que la grille reste à solution unique. */
  function retirerChiffres(solution, chiffresVises) {
    var depart = solution.slice();
    var restants = NB_CASES;
    var positions = [];
    for (var i = 0; i < NB_CASES; i++) {
      positions.push(i);
    }
    melanger(positions);

    for (var k = 0; k < positions.length && restants > chiffresVises; k++) {
      var p = positions[k];
      var valeur = depart[p];
      depart[p] = 0;
      if (compterSolutions(depart, 2) === 1) {
        restants--;
      } else {
        depart[p] = valeur; // ce retrait rendrait la solution ambiguë : on remet le chiffre
      }
    }
    return { depart: depart, restants: restants };
  }

  /**
   * Génère une grille de Sudoku à solution unique.
   * Renvoie { depart: grille de départ (0 = vide), solution: grille complète, chiffres: nombre de chiffres de départ }.
   * Le nombre de chiffres obtenu est celui visé ; pour les grilles très dépouillées,
   * il peut rester légèrement au-dessus si aucun retrait supplémentaire ne garde l'unicité.
   */
  function genererGrille(chiffresVises) {
    var solution = genererSolution();
    var meilleur = null;
    for (var essai = 0; essai < ESSAIS_MAX; essai++) {
      var resultat = retirerChiffres(solution, chiffresVises);
      if (meilleur === null || resultat.restants < meilleur.restants) {
        meilleur = resultat;
      }
      if (meilleur.restants <= chiffresVises) {
        break;
      }
    }
    return { depart: meilleur.depart, solution: solution, chiffres: meilleur.restants };
  }

  return {
    genererGrille: genererGrille,
    compterSolutions: compterSolutions,
    respecteLesRegles: respecteLesRegles
  };
})();
