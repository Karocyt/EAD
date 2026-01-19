/* ==========================================================================
   DATA.JS
   Contient la configuration des cursus, des matières et des règles.
   ========================================================================== */

const CURRICULUMS = {
    // ----------------------------------------------------------------------
    // LICENCE 1 (Règle spécifique : Validation Majeures + Générale)
    // ----------------------------------------------------------------------
    'l1_ead': {
        name: "Licence 1 - Droit EAD",
        hasMajorBlock: true, // <--- C'est ici qu'on active la règle du bloc majeures
        subjects: [
            // Semestre 1
            { id: 's1_p1', sem: 1, name: "Droit des Personnes", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 's1_p2', sem: 1, name: "Droit Constitutionnel S1", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 's1_p3', sem: 1, name: "Relations Internationales", coef: 4, isMajor: false },
            { id: 's1_p4', sem: 1, name: "Introduction Droit", coef: 5, isMajor: false },
            { id: 's1_p5', sem: 1, name: "Hist. des Instit. après 1789", coef: 5, isMajor: false },
            
            // Semestre 2
            { id: 's2_p1', sem: 2, name: "Droit de la famille", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 's2_p2', sem: 2, name: "Droit Constitutionnel S2", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 's2_p3', sem: 2, name: "Intro Gds Syst. Jur.", coef: 4, isMajor: false },
            { id: 's2_p4', sem: 2, name: "Hist. des Instit. avant 1789", coef: 4, isMajor: false }
        ]
    },

    // ----------------------------------------------------------------------
    // LICENCE 2 (Validation uniquement à la moyenne générale)
    // ----------------------------------------------------------------------
    'l2_ead': {
        name: "Licence 2 - Droit EAD",
        hasMajorBlock: false, // Pas de bloc majeures bloquant
        subjects: [
            // Semestre 1
            { id: 'l2_s1_p1', sem: 1, name: "Droit des contrats", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l2_s1_p2', sem: 1, name: "Droit administratif 1", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l2_s1_p3', sem: 1, name: "Finances publiques", coef: 5, isMajor: false },
            { id: 'l2_s1_p4', sem: 1, name: "Droit pénal général", coef: 5, isMajor: false },
            { id: 'l2_s1_p5', sem: 1, name: "Introduction au droit comparé", coef: 3, isMajor: false },
            { id: 'l2_s1_p6', sem: 1, name: "Institutions européennes", coef: 5, isMajor: false }, // ID Corrigé
            
            // Semestre 2
            { id: 'l2_s2_p1', sem: 2, name: "Droit de la responsabilité civile", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l2_s2_p2', sem: 2, name: "Droit administratif 2", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l2_s2_p3', sem: 2, name: "Droit des affaires", coef: 5, isMajor: false },
            { id: 'l2_s2_p4', sem: 2, name: "Droit fiscal", coef: 4, isMajor: false },
            { id: 'l2_s2_p5', sem: 2, name: "Histoire du droit des obligations", coef: 4, isMajor: false }
        ]
    },

    // ----------------------------------------------------------------------
    // LICENCE 3
    // ----------------------------------------------------------------------
    'l3_ead': {
        name: "Licence 3 - Droit EAD",
        hasMajorBlock: false,
        subjects: [
            // Semestre 1
            { id: 'l3_s1_p1', sem: 1, name: "Régime général des obligations", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l3_s1_p2', sem: 1, name: "Droit des collectivités territoriales", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l3_s1_p3', sem: 1, name: "Droit de l'Union Européenne", coef: 5, isMajor: false },
            { id: 'l3_s1_p4', sem: 1, name: "Droit des sociétés", coef: 5, isMajor: false },
            { id: 'l3_s1_p5', sem: 1, name: "Procédures pénales", coef: 5, isMajor: false },
            { id: 'l3_s1_p6', sem: 1, name: "Histoire des droits de l'Homme", coef: 5, isMajor: false },
            
            // Semestre 2
            { id: 'l3_s2_p1', sem: 2, name: "Droit des biens", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l3_s2_p2', sem: 2, name: "Droit public des affaires", coef: 7, isMajor: true, bonusMax: 1.5 },
            { id: 'l3_s2_p3', sem: 2, name: "Droit international public", coef: 5, isMajor: false },
            { id: 'l3_s2_p4', sem: 2, name: "Droit du travail", coef: 5, isMajor: false },
            { id: 'l3_s2_p5', sem: 2, name: "Droit des libertés fondamentales", coef: 4, isMajor: false },
            { id: 'l3_s2_p6', sem: 2, name: "Procédure civile", coef: 4, isMajor: false },
            { id: 'l3_s2_p7', sem: 2, name: "Anglais juridique", coef: 2, isMajor: false } // ID Corrigé
        ]
    }
};
