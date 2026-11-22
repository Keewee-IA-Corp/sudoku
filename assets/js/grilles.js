/*
 * Réglages des niveaux de difficulté.
 * Les grilles ne sont plus fixes : elles sont générées à chaque partie
 * par assets/js/generateur.js, avec une solution unique.
 * Plus le niveau est difficile, moins il y a de chiffres de départ.
 */

/* Nombre de chiffres de départ visé pour chaque niveau. */
var CHIFFRES_DEPART = {
  facile: 45,
  moyen: 35,
  difficile: 25
};

/* Libellés des niveaux, affichés au joueur. */
var NIVEAUX = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile"
};
