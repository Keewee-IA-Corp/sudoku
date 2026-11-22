/*
 * Sudoku — logique et affichage de la grille.
 * La logique (état de la partie) est séparée de l'affichage (construction du DOM).
 */
(function () {
  "use strict";

  var TAILLE = 9;
  var TAILLE_BLOC = 3;

  /* ---------- Logique ---------- */

  /**
   * Transforme une grille de 81 chiffres (0 = vide, lue ligne par ligne) en un tableau 9×9 de cases.
   * Chaque case : { valeur: 0..9 (0 = vide), depart: booléen }.
   */
  function creerEtat(grille) {
    var cases = [];
    for (var l = 0; l < TAILLE; l++) {
      var ligne = [];
      for (var c = 0; c < TAILLE; c++) {
        var valeur = grille[l * TAILLE + c];
        ligne.push({ valeur: valeur, depart: valeur !== 0 });
      }
      cases.push(ligne);
    }
    return { cases: cases };
  }

  /** Niveau utilisé au chargement de la page (pas de sauvegarde entre deux visites). */
  var NIVEAU_PAR_DEFAUT = "facile";

  /** Vrai si le niveau existe et possède un nombre de chiffres de départ. */
  function niveauValide(niveau) {
    return typeof CHIFFRES_DEPART !== "undefined" && Object.prototype.hasOwnProperty.call(CHIFFRES_DEPART, niveau);
  }

  /**
   * Crée une nouvelle partie au niveau demandé, avec une grille générée à solution unique.
   * Une partie : {
   *   niveau: "facile" | "moyen" | "difficile",
   *   cases: [...],               état affiché de la grille
   *   depart: [81 chiffres],      grille de départ (pour pouvoir la recommencer)
   *   solution: [81 chiffres],    solution unique de la grille
   *   selection: null | { ligne, colonne }   case sélectionnée par le joueur
   *   terminee: booléen            vrai quand la grille est réussie (cases verrouillées)
   * }.
   */
  function creerPartie(niveau) {
    if (!niveauValide(niveau)) {
      niveau = NIVEAU_PAR_DEFAUT;
    }
    var grille = Generateur.genererGrille(CHIFFRES_DEPART[niveau]);
    var etat = creerEtat(grille.depart);
    etat.niveau = niveau;
    etat.depart = grille.depart;
    etat.solution = grille.solution;
    etat.selection = null;
    etat.terminee = false;
    demarrerChrono(etat);
    return etat;
  }

  /* --- Chronomètre : démarre à la création de la partie, s'arrête à la victoire --- */

  /** Remet le chrono à zéro et le fait démarrer maintenant. partie.fin reste null tant que la grille n'est pas réussie. */
  function demarrerChrono(partie, maintenant) {
    partie.debut = typeof maintenant === "number" ? maintenant : Date.now();
    partie.fin = null;
  }

  /** Fige le chrono (à la victoire) ; sans effet s'il est déjà arrêté. */
  function arreterChrono(partie, maintenant) {
    if (partie.fin === null) {
      partie.fin = typeof maintenant === "number" ? maintenant : Date.now();
    }
  }

  /** Temps écoulé en millisecondes : jusqu'à maintenant si la partie continue, jusqu'à la victoire sinon. */
  function tempsEcoule(partie, maintenant) {
    var finCalcul = partie.fin !== null ? partie.fin : (typeof maintenant === "number" ? maintenant : Date.now());
    return Math.max(0, finCalcul - partie.debut);
  }

  /** Durée au format mm:ss (les minutes peuvent dépasser 59, par exemple 75:03). */
  function formaterDuree(millisecondes) {
    var secondes = Math.floor(millisecondes / 1000);
    var minutes = Math.floor(secondes / 60);
    secondes = secondes % 60;
    return (minutes < 10 ? "0" : "") + minutes + ":" + (secondes < 10 ? "0" : "") + secondes;
  }

  /**
   * Remet la partie dans son état de départ : toutes les saisies du joueur sont effacées,
   * le niveau, les chiffres de départ et la solution sont conservés (aucune nouvelle grille).
   * Renvoie le nombre de saisies effacées.
   */
  function recommencerPartie(partie) {
    var effacees = 0;
    for (var l = 0; l < TAILLE; l++) {
      for (var c = 0; c < TAILLE; c++) {
        var caseJeu = partie.cases[l][c];
        var valeurDepart = partie.depart[l * TAILLE + c];
        if (!caseJeu.depart && caseJeu.valeur !== 0) {
          effacees++;
        }
        caseJeu.valeur = valeurDepart;
        caseJeu.depart = valeurDepart !== 0;
      }
    }
    // Une grille réussie puis recommencée redevient jouable, et le chrono repart de 00:00.
    partie.terminee = false;
    demarrerChrono(partie);
    return effacees;
  }

  /** Numéro du bloc 3×3 (de 1 à 9, de gauche à droite puis de haut en bas). */
  function numeroBloc(ligne, colonne) {
    return Math.floor(ligne / TAILLE_BLOC) * TAILLE_BLOC + Math.floor(colonne / TAILLE_BLOC) + 1;
  }

  /** Vrai si la valeur est un chiffre de 1 à 9. */
  function chiffreValide(valeur) {
    return typeof valeur === "number" && valeur >= 1 && valeur <= 9 && Math.floor(valeur) === valeur;
  }

  /**
   * Place un chiffre dans une case.
   * Renvoie "saisi" si la case a été modifiée, "depart" si c'est un chiffre de départ (refusé),
   * "invalide" si le chiffre n'est pas entre 1 et 9, ou "terminee" si la partie est gagnée (grille verrouillée).
   */
  function saisirChiffre(partie, ligne, colonne, valeur) {
    var caseJeu = partie.cases[ligne][colonne];
    if (partie.terminee) {
      return "terminee";
    }
    if (caseJeu.depart) {
      return "depart";
    }
    if (!chiffreValide(valeur)) {
      return "invalide";
    }
    caseJeu.valeur = valeur;
    return "saisi";
  }

  /**
   * Vide une case remplie par le joueur.
   * Renvoie "efface", "deja-vide", "depart" (chiffre de départ : refusé) ou "terminee" (partie gagnée).
   */
  function effacerCase(partie, ligne, colonne) {
    var caseJeu = partie.cases[ligne][colonne];
    if (partie.terminee) {
      return "terminee";
    }
    if (caseJeu.depart) {
      return "depart";
    }
    if (caseJeu.valeur === 0) {
      return "deja-vide";
    }
    caseJeu.valeur = 0;
    return "efface";
  }

  /**
   * Liste les règles enfreintes par le chiffre d'une case : "ligne", "colonne" et/ou "bloc".
   * Une case vide ou un chiffre de départ n'est jamais en conflit (tableau vide).
   */
  function reglesEnfreintes(partie, ligne, colonne) {
    var caseJeu = partie.cases[ligne][colonne];
    var regles = [];
    if (caseJeu.depart || caseJeu.valeur === 0) {
      return regles;
    }
    var valeur = caseJeu.valeur;
    var i;
    for (i = 0; i < TAILLE; i++) {
      if (i !== colonne && partie.cases[ligne][i].valeur === valeur) {
        regles.push("ligne");
        break;
      }
    }
    for (i = 0; i < TAILLE; i++) {
      if (i !== ligne && partie.cases[i][colonne].valeur === valeur) {
        regles.push("colonne");
        break;
      }
    }
    var debutLigne = ligne - (ligne % TAILLE_BLOC);
    var debutColonne = colonne - (colonne % TAILLE_BLOC);
    bloc: for (var l = debutLigne; l < debutLigne + TAILLE_BLOC; l++) {
      for (var c = debutColonne; c < debutColonne + TAILLE_BLOC; c++) {
        if ((l !== ligne || c !== colonne) && partie.cases[l][c].valeur === valeur) {
          regles.push("bloc");
          break bloc;
        }
      }
    }
    return regles;
  }

  /** Vrai si le chiffre saisi dans la case contredit une règle (jamais pour un chiffre de départ). */
  function estEnConflit(partie, ligne, colonne) {
    return reglesEnfreintes(partie, ligne, colonne).length > 0;
  }

  /** Nombre de cases encore vides dans la grille. */
  function compterCasesVides(partie) {
    var vides = 0;
    for (var l = 0; l < TAILLE; l++) {
      for (var c = 0; c < TAILLE; c++) {
        if (partie.cases[l][c].valeur === 0) {
          vides++;
        }
      }
    }
    return vides;
  }

  /** Nombre de chiffres saisis par le joueur qui contredisent une règle (ligne, colonne ou bloc). */
  function compterErreurs(partie) {
    var erreurs = 0;
    for (var l = 0; l < TAILLE; l++) {
      for (var c = 0; c < TAILLE; c++) {
        if (estEnConflit(partie, l, c)) {
          erreurs++;
        }
      }
    }
    return erreurs;
  }

  /**
   * Vérifie la grille et renvoie { statut, vides, erreurs } :
   *   "gagnee"     grille complète sans aucun conflit : la partie est terminée et verrouillée ;
   *   "erreurs"    grille complète mais au moins un chiffre enfreint une règle : la partie continue ;
   *   "incomplete" il reste des cases vides : la partie continue.
   * Une grille complète sans conflit respecte toutes les règles ; comme la grille n'a qu'une
   * solution, elle est alors identique à partie.solution.
   */
  function verifierGrille(partie) {
    var vides = compterCasesVides(partie);
    var erreurs = compterErreurs(partie);
    var statut = "incomplete";
    if (vides === 0) {
      statut = erreurs === 0 ? "gagnee" : "erreurs";
    }
    if (statut === "gagnee") {
      partie.terminee = true;
      arreterChrono(partie);
    }
    return { statut: statut, vides: vides, erreurs: erreurs };
  }

  /** Mémorise la case sélectionnée (coordonnées bornées à la grille). */
  function selectionnerCase(partie, ligne, colonne) {
    partie.selection = {
      ligne: Math.max(0, Math.min(TAILLE - 1, ligne)),
      colonne: Math.max(0, Math.min(TAILLE - 1, colonne))
    };
    return partie.selection;
  }

  /* ---------- Affichage ---------- */

  function libelleCase(ligne, colonne, caseJeu, enConflit) {
    var position = "Ligne " + (ligne + 1) + ", colonne " + (colonne + 1) + ", bloc " + numeroBloc(ligne, colonne);
    if (caseJeu.depart) {
      return position + " : " + caseJeu.valeur + ", chiffre de départ";
    }
    if (caseJeu.valeur !== 0) {
      return position + " : " + caseJeu.valeur + ", votre saisie" + (enConflit ? ", en conflit" : "");
    }
    return position + " : case vide";
  }

  /** Texte décrivant les règles enfreintes, par exemple « la même ligne et le même bloc ». */
  function texteRegles(regles) {
    var noms = { ligne: "la même ligne", colonne: "la même colonne", bloc: "le même bloc" };
    var morceaux = regles.map(function (regle) { return noms[regle]; });
    if (morceaux.length <= 1) {
      return morceaux.join("");
    }
    return morceaux.slice(0, -1).join(", ") + " et " + morceaux[morceaux.length - 1];
  }

  function elementCase(conteneur, ligne, colonne) {
    return conteneur.querySelector('[data-ligne="' + ligne + '"][data-colonne="' + colonne + '"]');
  }

  /** Met à jour le contenu, les classes et le libellé d'une case sans reconstruire la grille. */
  function afficherCase(element, ligne, colonne, caseJeu, enConflit, verrouillee) {
    var classes = ["case"];
    if (caseJeu.depart) {
      classes.push("case--depart");
    } else if (caseJeu.valeur !== 0) {
      classes.push("case--saisie");
      if (enConflit) {
        classes.push("case--conflit");
      }
    } else {
      classes.push("case--vide");
    }
    // Bordures épaisses entre les blocs 3×3
    if (colonne % TAILLE_BLOC === TAILLE_BLOC - 1 && colonne < TAILLE - 1) {
      classes.push("case--fin-bloc-colonne");
    }
    if (ligne % TAILLE_BLOC === TAILLE_BLOC - 1 && ligne < TAILLE - 1) {
      classes.push("case--fin-bloc-ligne");
    }
    if (element.classList.contains("case--selectionnee")) {
      classes.push("case--selectionnee");
    }
    element.className = classes.join(" ");
    element.textContent = caseJeu.valeur !== 0 ? String(caseJeu.valeur) : "";
    element.setAttribute("aria-readonly", caseJeu.depart || verrouillee ? "true" : "false");
    element.setAttribute("aria-label", libelleCase(ligne, colonne, caseJeu, enConflit));
    if (enConflit) {
      element.setAttribute("aria-invalid", "true");
    } else {
      element.removeAttribute("aria-invalid");
    }
  }

  /**
   * Met à jour toutes les cases (contenu et signalement des conflits).
   * Corriger un chiffre peut lever ou créer un conflit ailleurs dans la ligne, la colonne ou le bloc.
   */
  function rafraichirCases(conteneur, partie) {
    for (var l = 0; l < TAILLE; l++) {
      for (var c = 0; c < TAILLE; c++) {
        var element = elementCase(conteneur, l, c);
        if (element) {
          afficherCase(element, l, c, partie.cases[l][c], estEnConflit(partie, l, c), partie.terminee);
        }
      }
    }
  }

  function afficherGrille(conteneur, etat) {
    conteneur.innerHTML = "";
    for (var l = 0; l < TAILLE; l++) {
      var rangee = document.createElement("div");
      rangee.className = "grille__ligne";
      rangee.setAttribute("role", "row");

      for (var c = 0; c < TAILLE; c++) {
        var element = document.createElement("div");
        element.setAttribute("role", "gridcell");
        element.setAttribute("data-ligne", String(l));
        element.setAttribute("data-colonne", String(c));
        // Une seule case atteignable avec Tab (la première), les flèches font le reste.
        element.setAttribute("tabindex", l === 0 && c === 0 ? "0" : "-1");
        afficherCase(element, l, c, etat.cases[l][c], estEnConflit(etat, l, c), etat.terminee);
        rangee.appendChild(element);
      }
      conteneur.appendChild(rangee);
    }
  }

  /** Met en évidence la case sélectionnée et la rend seule atteignable avec Tab. */
  function afficherSelection(conteneur, partie) {
    var anciennes = conteneur.querySelectorAll(".case--selectionnee");
    for (var i = 0; i < anciennes.length; i++) {
      anciennes[i].classList.remove("case--selectionnee");
      anciennes[i].removeAttribute("aria-selected");
    }
    if (!partie.selection) {
      return null;
    }
    var element = elementCase(conteneur, partie.selection.ligne, partie.selection.colonne);
    if (!element) {
      return null;
    }
    var toutes = conteneur.querySelectorAll(".case");
    for (var j = 0; j < toutes.length; j++) {
      toutes[j].setAttribute("tabindex", "-1");
    }
    element.setAttribute("tabindex", "0");
    element.classList.add("case--selectionnee");
    element.setAttribute("aria-selected", "true");
    return element;
  }

  /** Affiche un message sous la grille ; ton facultatif : "succes" ou "erreur". */
  function afficherMessage(element, texte, ton) {
    if (element) {
      element.textContent = texte;
      element.classList.toggle("jeu__message--succes", ton === "succes");
      element.classList.toggle("jeu__message--erreur", ton === "erreur");
    }
  }

  /**
   * Reflète l'état « partie terminée » : grille marquée comme réussie,
   * pavé de saisie et bouton « Vérifier » désactivés (ou réactivés si la partie reprend).
   */
  function afficherFinPartie(conteneur, pave, boutonVerifier, terminee) {
    conteneur.classList.toggle("grille--terminee", terminee);
    if (pave) {
      var boutons = pave.querySelectorAll("button");
      for (var i = 0; i < boutons.length; i++) {
        boutons[i].disabled = terminee;
      }
    }
    if (boutonVerifier) {
      boutonVerifier.disabled = terminee;
    }
  }

  /** Durée du tremblement des cases (même valeur que --duree-tremblement dans style.css). */
  var DUREE_TREMBLEMENT_MS = 1000;

  /** Vrai si le joueur a demandé à réduire les animations : le message s'affiche alors sans attendre. */
  function mouvementsReduits() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /** Lance ou arrête le tremblement de toutes les cases de la grille. */
  function afficherTremblement(conteneur, actif) {
    conteneur.classList.toggle("grille--tremble", actif);
  }

  /** Affiche le message de félicitations par-dessus la grille, avec le niveau réussi et le temps final. */
  function afficherVictoire(element, texte, partie) {
    if (texte) {
      texte.textContent = "Vous avez réussi la grille au niveau " + libelleNiveau(partie.niveau) +
        " en " + formaterDuree(tempsEcoule(partie)) + ". Bravo !";
    }
    element.hidden = false;
  }

  function masquerVictoire(element) {
    element.hidden = true;
  }

  /** Message correspondant au résultat de verifierGrille. */
  function texteVerification(resultat, partie) {
    if (resultat.statut === "gagnee") {
      return "Bravo, vous avez gagné ! La grille est correctement remplie (niveau " + libelleNiveau(partie.niveau) +
        ", temps " + formaterDuree(tempsEcoule(partie)) + "). Lancez une nouvelle partie pour rejouer.";
    }
    var erreurs = resultat.erreurs > 1 ? resultat.erreurs + " chiffres en conflit" : "1 chiffre en conflit";
    if (resultat.statut === "erreurs") {
      return "La grille est complète, mais il reste des erreurs : " + erreurs +
        " (en rouge). Corrigez-les pour terminer la partie.";
    }
    var vides = resultat.vides > 1 ? resultat.vides + " cases vides" : "1 case vide";
    return "La grille n’est pas encore complète : il reste " + vides +
      (resultat.erreurs > 0 ? " et " + erreurs : "") + ".";
  }

  function libelleNiveau(niveau) {
    return typeof NIVEAUX !== "undefined" && NIVEAUX[niveau] ? NIVEAUX[niveau] : niveau;
  }

  /** Indique le niveau de la partie en cours (zone aria-live). */
  function afficherEtatPartie(element, partie, annonce) {
    var libelle = libelleNiveau(partie.niveau);
    var texte;
    if (partie.terminee) {
      texte = "Partie terminée : grille réussie au niveau " + libelle + ".";
    } else {
      texte = annonce
        ? "Nouvelle partie lancée au niveau " + libelle + "."
        : "Partie en cours : niveau " + libelle + ".";
    }
    // Pas de réécriture d'un texte identique : la zone aria-live ne le répète pas à chaque saisie.
    if (element.textContent !== texte) {
      element.textContent = texte;
    }
  }

  /** Niveau de la partie affiché au-dessus de la grille, à côté du chrono. */
  function afficherInfoNiveau(element, partie) {
    element.textContent = libelleNiveau(partie.niveau);
  }

  /** Affiche le temps écoulé (mm:ss) ; le texte n'est réécrit que s'il change. */
  function afficherChrono(element, partie) {
    var texte = formaterDuree(tempsEcoule(partie));
    if (element.textContent !== texte) {
      element.textContent = texte;
    }
  }

  /** Affiche l'aide seulement si le niveau coché diffère de celui de la partie en cours. */
  function afficherAideNiveau(element, niveauChoisi, partie) {
    element.hidden = niveauChoisi === partie.niveau;
  }

  /* ---------- Commandes ---------- */

  function niveauSelectionne(formulaire) {
    var choix = formulaire.querySelector('input[name="niveau"]:checked');
    return choix ? choix.value : NIVEAU_PAR_DEFAUT;
  }

  /** Déplacement de la sélection associé à une touche fléchée (ou null). */
  var DEPLACEMENTS = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1]
  };

  /* ---------- Démarrage ---------- */

  function demarrer() {
    var conteneur = document.getElementById("grille");
    if (!conteneur || typeof CHIFFRES_DEPART === "undefined" || typeof Generateur === "undefined") {
      return;
    }
    var formulaire = document.getElementById("form-nouvelle-partie");
    var etatPartie = document.getElementById("etat-partie");
    var aideNiveau = document.getElementById("aide-niveau");
    var messageJeu = document.getElementById("message-jeu");
    var pave = document.getElementById("pave-saisie");
    var boutonVerifier = document.getElementById("bouton-verifier");
    var victoire = document.getElementById("victoire");
    var victoireTexte = document.getElementById("victoire-texte");
    var victoireFermer = document.getElementById("victoire-fermer");
    var victoireNouvellePartie = document.getElementById("victoire-nouvelle-partie");
    var minuterieVictoire = null;

    // Au chargement : toujours une partie Facile, et le bouton Facile coché.
    var partie = creerPartie(NIVEAU_PAR_DEFAUT);
    if (formulaire) {
      var radioDefaut = formulaire.querySelector('input[name="niveau"][value="' + NIVEAU_PAR_DEFAUT + '"]');
      if (radioDefaut) {
        radioDefaut.checked = true;
      }
    }
    afficherGrille(conteneur, partie);
    if (etatPartie) {
      afficherEtatPartie(etatPartie, partie, false);
    }

    /* --- Niveau et chronomètre au-dessus de la grille --- */

    var infoNiveau = document.getElementById("info-niveau");
    var chrono = document.getElementById("chrono");

    function rafraichirInfos() {
      if (infoNiveau) {
        afficherInfoNiveau(infoNiveau, partie);
      }
      if (chrono) {
        afficherChrono(chrono, partie);
      }
    }

    rafraichirInfos();
    // Le chrono est recalculé à partir de l'heure de début : il reste juste même si l'onglet est mis en veille.
    // Une fois la partie gagnée, partie.fin fige la valeur affichée.
    if (chrono) {
      setInterval(function () {
        afficherChrono(chrono, partie);
      }, 250);
    }

    /* --- Saisie --- */

    function rafraichir() {
      rafraichirCases(conteneur, partie);
      afficherFinPartie(conteneur, pave, boutonVerifier, partie.terminee);
      if (etatPartie) {
        afficherEtatPartie(etatPartie, partie, false);
      }
    }

    function signalerPartieTerminee() {
      afficherMessage(
        messageJeu,
        "La partie est terminée : la grille ne peut plus être modifiée. Lancez une nouvelle partie ou recommencez celle-ci.",
        "succes"
      );
    }

    /* --- Victoire : tremblement des cases, puis message superposé à la grille --- */

    /** Arrête le tremblement en cours et masque le message de félicitations (la grille redevient lisible). */
    function annulerVictoire() {
      if (minuterieVictoire !== null) {
        clearTimeout(minuterieVictoire);
        minuterieVictoire = null;
      }
      afficherTremblement(conteneur, false);
      if (victoire) {
        masquerVictoire(victoire);
      }
    }

    /** Fait trembler les cases pendant DUREE_TREMBLEMENT_MS, puis affiche le message de félicitations. */
    function celebrerVictoire() {
      annulerVictoire();
      afficherTremblement(conteneur, true);
      minuterieVictoire = setTimeout(function () {
        minuterieVictoire = null;
        afficherTremblement(conteneur, false);
        if (victoire && partie.terminee) {
          afficherVictoire(victoire, victoireTexte, partie);
          if (victoireFermer) {
            victoireFermer.focus();
          }
        }
      }, mouvementsReduits() ? 0 : DUREE_TREMBLEMENT_MS);
    }

    /** « Fermer » (ou Échap) : le message disparaît et le focus revient dans la grille. */
    function fermerVictoire() {
      annulerVictoire();
      var element = partie.selection
        ? elementCase(conteneur, partie.selection.ligne, partie.selection.colonne)
        : conteneur.querySelector('.case[tabindex="0"]');
      if (element) {
        element.focus();
      }
    }

    if (victoire) {
      if (victoireFermer) {
        victoireFermer.addEventListener("click", fermerVictoire);
      }
      victoire.addEventListener("keydown", function (evenement) {
        if (evenement.key === "Escape") {
          evenement.preventDefault();
          fermerVictoire();
        }
      });
    }

    /** Vérifie la grille, met à jour l'affichage (verrouillage si gagnée) et annonce le résultat. */
    function verifierEtAnnoncer() {
      var focusDansPave = !!(pave && pave.contains(document.activeElement)) ||
        (!!boutonVerifier && document.activeElement === boutonVerifier);
      var resultat = verifierGrille(partie);
      rafraichir();
      // Victoire : le chrono affiché est figé sur le temps final.
      rafraichirInfos();
      afficherMessage(
        messageJeu,
        texteVerification(resultat, partie),
        resultat.statut === "gagnee" ? "succes" : resultat.statut === "erreurs" ? "erreur" : ""
      );
      // Le bouton qui avait le focus vient d'être désactivé : le focus revient dans la grille.
      if (resultat.statut === "gagnee" && focusDansPave && partie.selection) {
        var element = elementCase(conteneur, partie.selection.ligne, partie.selection.colonne);
        if (element) {
          element.focus();
        }
      }
      if (resultat.statut === "gagnee") {
        celebrerVictoire();
      }
      return resultat;
    }

    function choisirCase(ligne, colonne, donnerFocus) {
      selectionnerCase(partie, ligne, colonne);
      var element = afficherSelection(conteneur, partie);
      if (donnerFocus && element && document.activeElement !== element) {
        element.focus();
      }
    }

    function signalerDepart() {
      afficherMessage(messageJeu, "Ce chiffre de départ ne peut pas être modifié.");
    }

    function jouerChiffre(valeur) {
      if (!partie.selection) {
        afficherMessage(messageJeu, "Sélectionnez d’abord une case de la grille.");
        return;
      }
      var l = partie.selection.ligne;
      var c = partie.selection.colonne;
      var resultat = saisirChiffre(partie, l, c, valeur);
      if (resultat === "terminee") {
        signalerPartieTerminee();
      } else if (resultat === "depart") {
        signalerDepart();
      } else if (resultat === "saisi") {
        // Dernière case remplie : la grille est vérifiée automatiquement.
        if (compterCasesVides(partie) === 0) {
          verifierEtAnnoncer();
          return;
        }
        rafraichir();
        var regles = reglesEnfreintes(partie, l, c);
        afficherMessage(
          messageJeu,
          regles.length > 0
            ? "Attention : le " + valeur + " est déjà présent dans " + texteRegles(regles) + "."
            : ""
        );
      }
    }

    function effacerSelection() {
      if (!partie.selection) {
        afficherMessage(messageJeu, "Sélectionnez d’abord une case de la grille.");
        return;
      }
      var l = partie.selection.ligne;
      var c = partie.selection.colonne;
      var resultat = effacerCase(partie, l, c);
      if (resultat === "terminee") {
        signalerPartieTerminee();
      } else if (resultat === "depart") {
        signalerDepart();
      } else if (resultat === "efface") {
        rafraichir();
        afficherMessage(messageJeu, "Case effacée.");
      }
    }

    // Clic ou Tab sur une case : elle devient la case sélectionnée.
    conteneur.addEventListener("focusin", function (evenement) {
      var cible = evenement.target;
      if (cible && cible.hasAttribute("data-ligne")) {
        choisirCase(Number(cible.getAttribute("data-ligne")), Number(cible.getAttribute("data-colonne")), false);
      }
    });

    // Certains navigateurs mobiles ne donnent pas le focus au toucher : le clic sélectionne aussi.
    conteneur.addEventListener("click", function (evenement) {
      var cible = evenement.target.closest ? evenement.target.closest("[data-ligne]") : null;
      if (cible) {
        choisirCase(Number(cible.getAttribute("data-ligne")), Number(cible.getAttribute("data-colonne")), true);
      }
    });

    // Clavier dans la grille : chiffres 1 à 9, Suppr / Retour arrière, flèches.
    conteneur.addEventListener("keydown", function (evenement) {
      if (evenement.ctrlKey || evenement.metaKey || evenement.altKey) {
        return;
      }
      var touche = evenement.key;
      if (/^[1-9]$/.test(touche)) {
        evenement.preventDefault();
        jouerChiffre(Number(touche));
      } else if (touche === "Delete" || touche === "Backspace") {
        evenement.preventDefault();
        effacerSelection();
      } else if (DEPLACEMENTS[touche]) {
        evenement.preventDefault();
        var depart = partie.selection || { ligne: 0, colonne: 0 };
        choisirCase(depart.ligne + DEPLACEMENTS[touche][0], depart.colonne + DEPLACEMENTS[touche][1], true);
      }
    });

    // Boutons de saisie sous la grille (utiles sur mobile).
    if (pave) {
      pave.addEventListener("click", function (evenement) {
        var bouton = evenement.target.closest ? evenement.target.closest("button") : null;
        if (!bouton) {
          return;
        }
        if (bouton.hasAttribute("data-chiffre")) {
          jouerChiffre(Number(bouton.getAttribute("data-chiffre")));
        } else if (bouton.hasAttribute("data-effacer")) {
          effacerSelection();
        }
      });
    }

    // « Vérifier la grille » : signale les cases vides ou les erreurs restantes, ou annonce la victoire.
    if (boutonVerifier) {
      boutonVerifier.addEventListener("click", function () {
        if (partie.terminee) {
          signalerPartieTerminee();
          return;
        }
        verifierEtAnnoncer();
      });
    }

    // « Recommencer » efface les saisies et garde la même grille et le même niveau.
    var boutonRecommencer = document.getElementById("bouton-recommencer");
    if (boutonRecommencer) {
      boutonRecommencer.addEventListener("click", function () {
        annulerVictoire();
        var effacees = recommencerPartie(partie);
        rafraichir();
        rafraichirInfos();
        afficherMessage(
          messageJeu,
          effacees > 0
            ? "Partie recommencée : vos saisies ont été effacées, la grille de départ est conservée (niveau " + libelleNiveau(partie.niveau) + ")."
            : "La grille est déjà dans son état de départ."
        );
      });
    }

    if (!formulaire) {
      return;
    }

    // Changer de niveau ne touche pas à la partie en cours : seule l'aide est mise à jour.
    formulaire.addEventListener("change", function () {
      if (aideNiveau) {
        afficherAideNiveau(aideNiveau, niveauSelectionne(formulaire), partie);
      }
    });

    /**
     * Lance une nouvelle partie au niveau sélectionné, que la partie actuelle soit en cours ou terminée :
     * une nouvelle grille est générée (l'ancienne partie, ses saisies et sa sélection sont abandonnées)
     * et le message de jeu (conflit, fin de partie…) est effacé.
     */
    function lancerNouvellePartie() {
      annulerVictoire();
      partie = creerPartie(niveauSelectionne(formulaire));
      afficherGrille(conteneur, partie);
      rafraichirInfos();
      afficherFinPartie(conteneur, pave, boutonVerifier, false);
      afficherMessage(messageJeu, "");
      if (etatPartie) {
        afficherEtatPartie(etatPartie, partie, true);
      }
      if (aideNiveau) {
        afficherAideNiveau(aideNiveau, niveauSelectionne(formulaire), partie);
      }
    }

    // « Nouvelle partie » (bouton de type submit du formulaire) : pas de rechargement de la page.
    formulaire.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      lancerNouvellePartie();
    });

    // « Nouvelle partie » dans le message de félicitations : même effet que le bouton du formulaire.
    if (victoireNouvellePartie) {
      victoireNouvellePartie.addEventListener("click", function () {
        lancerNouvellePartie();
        var premiere = conteneur.querySelector('.case[tabindex="0"]');
        if (premiere) {
          premiere.focus();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer);
  } else {
    demarrer();
  }
})();
