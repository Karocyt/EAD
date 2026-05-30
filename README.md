# Simulateur de Notes - Droit EAD (UGA)

Ce simulateur est une application web statique (HTML/CSS/JS) conçue pour aider les étudiants en Droit EAD de l'Université Grenoble Alpes (UGA) à simuler leurs moyennes, à suivre leur validation d'année et à optimiser leurs choix de matières lors des rattrapages.

---

## 🚀 Utilisation rapide

Comme l'application est entièrement écrite en technologies web natives, elle ne nécessite aucun serveur ou installation :
1. Téléchargez ou clonez les fichiers du dossier.
2. Ouvrez le fichier `simu.html` dans n'importe quel navigateur web (Chrome, Firefox, Safari, Edge...).

---

## 📋 Fonctionnalités Principales

### 1. Saisie des notes et calcul des moyennes (Session 1)
- **Choix du cursus** : Sélectionnable dans l'en-tête (Licence 1, Licence 2, Licence 3). Les matières, coefficients et règles de validation s'adaptent automatiquement.
- **Saisie simplifiée** : Champs pour les notes d'examens (/20) et de devoirs maison (DM / bonifications).
- **Moyennes en temps réel** : Calcul immédiat des moyennes générales des semestres, de la moyenne annuelle et de la moyenne des matières majeures.
- **Règles de validation spécifiques** :
  - **Licence 1** : Règle stricte du bloc des majeures (nécessite une moyenne des majeures $\ge 10/20$ **ET** une moyenne générale $\ge 10/20$).
  - **Licence 2 & 3** : Validation à la moyenne générale ($\ge 10/20$).
- **Statuts visuels** : Les cartes affichent clairement si le semestre est « Validé » ou « Non Validé » par des codes couleurs.

### 2. Module de Rattrapages Dynamique (Secours)
En cliquant sur **Simuler les Rattrapages**, un panneau interactif apparaît :
- **Sélection des matières** : Seules les matières non validées ($<10/20$ en Session 1) y figurent. Vous pouvez cocher celles que vous prévoyez de repasser.
- **Indicateurs visuels sur les cartes** : Lorsqu'une matière est cochée pour le rattrapage, sa note sur la carte du semestre en haut est modifiée :
  - La note de Session 1 est grisée et barrée (ex: ~~`7,50`~~).
  - Une icône de bouée de sauvetage 🛟 s'affiche.
  - La nouvelle note simulée s'affiche à côté, ou un point d'interrogation **`?`** orange si aucune note n'a encore été saisie (matière en attente).
- **Réglettes (Sliders) Premium** : Les notes se simulent via des réglettes avançant par **quarts de points (pas de 0,25)**, doublées d'un champ numérique synchronisé bidirectionnellement pour plus de précision.
- **Coloration interactive des pistes (Tracts)** : Les pistes des sliders se colorent d'un dégradé dynamique à trois zones :
  - 🔴 **Rouge** : Note de rattrapage insuffisante pour valider l'année ou le semestre.
  - 🟠 **Orange** : Note inférieure à 10, mais suffisante pour compenser avec les autres matières et valider globalement (sous réserve de bons résultats aux autres rattrapages en attente).
  - 🟢 **Vert** : Note garantissant la validation globale (année ou semestre) avec les notes de rattrapage déjà saisies.
- **Infobulle d'aide** : Au survol de l'icône `(i)` à droite du titre du module, une légende explique le rôle des couleurs.

---

## 🧮 Logique Mathématique (Coloration Dynamique)

La coloration des pistes des sliders utilise un algorithme de **recherche dichotomique** rapide :
1. **Seuil Optimiste ($T_{orange}$)** : Calculé en supposant que toutes les *autres* matières cochées en rattrapage mais non encore saisies obtiennent la note maximale de 20/20. C'est le score minimum à obtenir sur cette matière pour espérer valider.
2. **Seuil Pessimiste ($T_{green}$)** : Calculé en supposant que toutes les *autres* matières cochées en rattrapage mais non encore saisies obtiennent 0/20 (on ne compte que sur les notes déjà simulées). C'est le score de sécurité pour valider d'office.

Dès que vous bougez un slider, les frontières de couleur (limites rouge, orange et verte) des *autres* sliders se décalent en temps réel pour refléter les points gagnés ! Si toutes les notes sont saisies, la zone orange disparaît logiquement.

---

## 💾 Persistance des Données

L'application enregistre automatiquement vos saisies dans le stockage local du navigateur (`localStorage`).
- Vos simulations sont conservées même si vous fermez ou actualisez l'onglet.
- Les données sont cloisonnées par cursus (vos notes de L1 n'écraseront pas vos simulations de L2).
- Un bouton **Effacer les données de ce cursus** en bas de page permet de réinitialiser la simulation à zéro.

---

## ⚠️ Avertissement (Disclaimer)

Ce simulateur est un outil non officiel réalisé par un étudiant. Il n'est pas affilié, validé ou édité par l'Université Grenoble Alpes (UGA). Les règles de validation appliquées se basent sur les règlements d'examen connus, mais l'étudiant doit toujours se référer aux résultats officiels fournis par l'UGA.
