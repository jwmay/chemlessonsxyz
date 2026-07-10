/* ==========================================================================
   chemlessons.xyz — site content
   This file is the single source of truth for curriculum content.
   Edit tracks, units, resources, and slide decks here; the pages render
   from it.

   STRUCTURE
   TRACKS → one entry per course (Conceptual Chemistry, Mathematical Chemistry)
     └─ units → one entry per unit (each course has its OWN names & sequence)
          └─ resources → the actual links

   TRACK FIELDS
   - id:      short slug, used in URLs (#conceptual, #mathematical) and unit ids
   - label:   full course name shown on the switcher
   - short:   compact name for chips ("Conceptual")
   - badge:   single letter shown on homepage unit tiles ("C" / "M")
   - tagline: one-liner shown under the course switcher

   RESOURCE FIELDS
   - title:   display name
   - kind:    notebook | slides | assignment | lab | activity | assessment
   - type:    gdoc | gsheet | gslides | gform | pdf | html | video | link
   - url:     link to the resource. Leave "" to show it as "In progress".
   - copyUrl: (optional) a Google "force copy" link. For any Google file,
              replace /edit... at the end of the URL with /copy to make one.
   ========================================================================== */

const SITE = {
  // Google Form teachers use to request assessment access (educator verification)
  requestAccessUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeH6-ztUDcCPv-L0WrEyC3tJV9UcUuE9ZkWNgjHJKOaVggBxw/viewform",
  // Contact email shown on the site
  email: "hello@chemlessons.xyz",
  // Companion site
  companionSite: "https://docmayscience.com",
  // Chem Cash — classroom economy app (marketing page; the root URL is the sign-in)
  chemCashUrl: "https://chem.cash/about?ref=chemlessons",
};

/* Resource type → icon + color + label (Font Awesome Pro classes, emoji fallback) */
const RESOURCE_TYPES = {
  gdoc:    { label: "Google Doc",    icon: "fa-duotone fa-solid fa-file-lines",          fb: "📄", color: "var(--c-gdoc)" },
  gsheet:  { label: "Google Sheet",  icon: "fa-duotone fa-solid fa-file-spreadsheet",    fb: "📊", color: "var(--c-gsheet)" },
  gslides: { label: "Google Slides", icon: "fa-duotone fa-solid fa-presentation-screen", fb: "🖥️", color: "var(--c-gslides)" },
  gform:   { label: "Google Form",   icon: "fa-duotone fa-solid fa-clipboard-list-check",fb: "📋", color: "var(--c-gform)" },
  pdf:     { label: "PDF",           icon: "fa-duotone fa-solid fa-file-pdf",            fb: "📕", color: "var(--c-pdf)" },
  html:    { label: "HTML Deck",     icon: "fa-duotone fa-solid fa-browser",             fb: "🌐", color: "var(--c-html)" },
  video:   { label: "Video",         icon: "fa-duotone fa-solid fa-circle-play",         fb: "🎬", color: "var(--c-video)" },
  link:    { label: "Link",          icon: "fa-duotone fa-solid fa-link",                fb: "🔗", color: "var(--c-link)" },
};

/* Resource kind → group heading + icon on the curriculum page */
const RESOURCE_KINDS = {
  notebook:   { label: "Interactive Notebook Pages", icon: "fa-duotone fa-solid fa-notebook",          fb: "📓" },
  slides:     { label: "Slide Decks",                icon: "fa-duotone fa-solid fa-presentation-screen", fb: "🖥️" },
  assignment: { label: "Assignments & Practice",     icon: "fa-duotone fa-solid fa-pen-to-square",     fb: "✏️" },
  lab:        { label: "Labs",                       icon: "fa-duotone fa-solid fa-flask",             fb: "🧪" },
  activity:   { label: "Activities & Games",         icon: "fa-duotone fa-solid fa-puzzle-piece",      fb: "🧩" },
  assessment: { label: "Assessments",                icon: "fa-duotone fa-solid fa-file-shield",       fb: "🔒" },
};

/* ==========================================================================
   The two course tracks. Each course has its own unit names, numbering,
   and sequence — they do NOT need to match. Unit ids must be unique across
   ALL tracks (they're used for deep links like #mathematical-unit-6).
   ========================================================================== */

const TRACKS = [
  {
    id: "conceptual",
    label: "Conceptual Chemistry",
    short: "Conceptual",
    badge: "C",
    icon: "fa-duotone fa-solid fa-lightbulb",
    fb: "💡",
    tagline:
      "Understanding first — models, particle-level pictures, and hands-on phenomena, with just enough math to support the ideas.",
    units: [
      {
        id: "conceptual-unit-1",
        num: 1,
        symbol: "Cw",
        semester: 1,
        title: "Chemistry in Our World",
        weeks: "2 weeks",
        description:
          "Launch the year with what chemistry is, how chemists work, and how to stay safe while doing real science.",
        topics: ["Lab safety", "What chemists do", "Observation vs. inference", "Lab equipment", "Scientific models"],
        resources: [
          { title: "Lab Safety & Equipment Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "How These HTML Decks Work (demo)", kind: "slides", type: "html", url: "slides/demo-deck/" },
          { title: "What Do Chemists Do? Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Lab Equipment Scavenger Hunt", kind: "activity", type: "gdoc", url: "" },
          { title: "Observation vs. Inference Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 1 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-2",
        num: 2,
        symbol: "Pp",
        semester: 1,
        title: "Particles & Phases",
        weeks: "3 weeks",
        description:
          "Build the particle model of matter and use it to explain states, phase changes, and everyday phenomena.",
        topics: ["Particle model", "States of matter", "Phase changes", "Particle diagrams", "Kinetic energy (conceptual)"],
        resources: [
          { title: "Particles & Phases Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "States of Matter Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Particle Diagram Drawing Practice", kind: "assignment", type: "gdoc", url: "" },
          { title: "Melting Ice Inquiry Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 2 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-3",
        num: 3,
        symbol: "Cm",
        semester: 1,
        title: "Classifying Matter",
        weeks: "3 weeks",
        description:
          "Sort the material world: elements, compounds, and mixtures — and design ways to take mixtures apart.",
        topics: ["Elements, compounds & mixtures", "Pure substances", "Physical vs. chemical change", "Separation techniques"],
        resources: [
          { title: "Classifying Matter Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Classifying Matter Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Element, Compound or Mixture? Card Sort", kind: "activity", type: "pdf", url: "" },
          { title: "Mixture Separation Challenge Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 3 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-4",
        num: 4,
        symbol: "At",
        semester: 1,
        title: "Atomic Structure",
        weeks: "3 weeks",
        description:
          "Follow the evidence that built the modern atom: from Dalton's spheres to the electron-cloud model.",
        topics: ["History of the atom", "Protons, neutrons, electrons", "Isotopes (conceptual)", "Ions", "Models as evidence"],
        resources: [
          { title: "Atomic Structure Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "History of the Atom Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Build-an-Atom Simulation Activity", kind: "activity", type: "link", url: "" },
          { title: "Beanium Isotope Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 4 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-5",
        num: 5,
        symbol: "Pt",
        semester: 1,
        title: "The Periodic Table",
        weeks: "3 weeks",
        description:
          "Discover the logic of the table: families, metals and nonmetals, and the patterns that predict behavior.",
        topics: ["Organization of the table", "Element families", "Metals & nonmetals", "Valence electrons", "Trends (conceptual)"],
        resources: [
          { title: "Periodic Table Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Families of the Periodic Table Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Alien Periodic Table Activity", kind: "activity", type: "gdoc", url: "" },
          { title: "Periodic Trends Exploration", kind: "activity", type: "gsheet", url: "" },
          { title: "Unit 5 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-6",
        num: 6,
        symbol: "Bo",
        semester: 1,
        title: "Chemical Bonding",
        weeks: "3 weeks",
        description:
          "Why atoms stick together: ionic, covalent, and metallic bonding, and how bond type shapes properties.",
        topics: ["Why atoms bond", "Ionic bonding", "Covalent bonding", "Metallic bonding", "Properties & bond type", "Naming (intro)"],
        resources: [
          { title: "Chemical Bonding Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Ionic vs. Covalent Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Bonding Basics Card Sort", kind: "activity", type: "pdf", url: "" },
          { title: "Properties of Compounds Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 6 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-7",
        num: 7,
        symbol: "Rx",
        semester: 2,
        title: "Chemical Reactions",
        weeks: "3 weeks",
        description:
          "Recognize reactions by their evidence, track atoms through balanced equations, and see conservation of mass in action.",
        topics: ["Evidence of reactions", "Conservation of mass", "Balancing with models", "Reaction types (conceptual)"],
        resources: [
          { title: "Chemical Reactions Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Evidence of Reactions Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Balancing Equations with Models", kind: "activity", type: "gdoc", url: "" },
          { title: "Reaction Evidence Stations Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 7 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-8",
        num: 8,
        symbol: "Mo",
        semester: 2,
        title: "The Mole in Context",
        weeks: "3 weeks",
        description:
          "Make sense of counting by mass — what a mole is, why chemists need it, and recipe-style stoichiometry.",
        topics: ["Counting by mass", "The mole (conceptual)", "Molar mass", "Recipe stoichiometry"],
        resources: [
          { title: "Mole Concept Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Counting by Mass Slides", kind: "slides", type: "gslides", url: "" },
          { title: "S'mores Stoichiometry Activity", kind: "activity", type: "gdoc", url: "" },
          { title: "Mole Conversion Practice (supported)", kind: "assignment", type: "gdoc", url: "" },
          { title: "Unit 8 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-9",
        num: 9,
        symbol: "So",
        semester: 2,
        title: "Solutions & Water",
        weeks: "3 weeks",
        description:
          "Explore water's special properties and what really happens, particle by particle, when things dissolve.",
        topics: ["Properties of water", "Dissolving (particle view)", "Concentration (qualitative)", "Solubility"],
        resources: [
          { title: "Solutions & Water Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Dissolving & Solutions Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Solubility Curve Reading Practice", kind: "assignment", type: "gdoc", url: "" },
          { title: "Kool-Aid Concentration Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 9 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-10",
        num: 10,
        symbol: "Ab",
        semester: 2,
        title: "Acids & Bases",
        weeks: "3 weeks",
        description:
          "Meet the acids and bases of everyday life, read the pH scale, and neutralize like a chemist.",
        topics: ["Acid & base properties", "The pH scale", "Indicators", "Neutralization", "Acids & bases at home"],
        resources: [
          { title: "Acids & Bases Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "pH & Indicators Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Red Cabbage Indicator Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "pH Scale Practice", kind: "assignment", type: "gdoc", url: "" },
          { title: "Unit 10 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-11",
        num: 11,
        symbol: "En",
        semester: 2,
        title: "Energy & Change",
        weeks: "3 weeks",
        description:
          "Follow energy through chemical and physical change — warm packs, cold packs, and where the heat really goes.",
        topics: ["Endothermic & exothermic", "Energy diagrams (conceptual)", "Heating & cooling curves", "Energy in reactions"],
        resources: [
          { title: "Energy & Change Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Endo vs. Exo Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Hand Warmer & Cold Pack Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Heating Curve CER Activity", kind: "activity", type: "gdoc", url: "" },
          { title: "Unit 11 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "conceptual-unit-12",
        num: 12,
        symbol: "Nu",
        semester: 2,
        title: "Nuclear Chemistry",
        weeks: "2 weeks",
        description:
          "Finish with the nucleus: radioactive decay, half-life, and an evidence-based look at nuclear energy in society.",
        topics: ["Radioactive decay", "Half-life (conceptual)", "Fission & fusion", "Nuclear energy & society"],
        resources: [
          { title: "Nuclear Chemistry Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Nuclear Decay Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Half-Life Simulation (Pennies)", kind: "activity", type: "gsheet", url: "" },
          { title: "Nuclear Energy Town Hall Debate", kind: "activity", type: "gdoc", url: "" },
          { title: "Unit 12 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
    ],
  },

  {
    id: "mathematical",
    label: "Mathematical Chemistry",
    short: "Mathematical",
    badge: "M",
    icon: "fa-duotone fa-solid fa-calculator",
    fb: "🧮",
    tagline:
      "Numbers first — a quantitative, problem-solving path through chemistry that builds fluency for AP and college coursework.",
    units: [
      {
        id: "mathematical-unit-0",
        num: 0,
        symbol: "Md",
        semester: 1,
        title: "Measurement & Data Analysis",
        weeks: "2 weeks",
        description:
          "Set the quantitative foundation: significant figures, dimensional analysis, percent error, and graphing real data.",
        topics: ["SI units", "Significant figures", "Dimensional analysis", "Accuracy vs. precision", "Percent error", "Graphing & linearization"],
        resources: [
          { title: "Measurement & Data Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Measurement & Sig Figs Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Dimensional Analysis Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Density & Graphing Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 0 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-1",
        num: 1,
        symbol: "At",
        semester: 1,
        title: "Atomic Structure & Atomic Mass",
        weeks: "3 weeks",
        description:
          "Subatomic accounting: isotopes, ions, weighted-average atomic mass, and the data behind mass spectrometry.",
        topics: ["Subatomic particles", "Isotopes & ions", "Average atomic mass calculations", "Mass spectrometry (intro)", "Nuclear symbol notation"],
        resources: [
          { title: "Atomic Structure Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Atomic Structure & Mass Spec Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Weighted Average Mass Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Beanium Isotope Lab (with % error)", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 1 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-2",
        num: 2,
        symbol: "Ep",
        semester: 1,
        title: "Electrons, Light & Periodicity",
        weeks: "3 weeks",
        description:
          "Quantify the quantum: E = hν calculations, electron configurations, orbital diagrams, and trend evidence.",
        topics: ["E = hν & c = λν calculations", "Electron configuration", "Orbital diagrams", "Quantum numbers", "Periodic trends & data"],
        resources: [
          { title: "Electrons & Periodicity Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Quantum Model Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Light & Energy Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Flame Test Lab (with spectra analysis)", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 2 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-3",
        num: 3,
        symbol: "Bn",
        semester: 1,
        title: "Bonding & Molecular Structure",
        weeks: "3 weeks",
        description:
          "From Lewis structures through VSEPR geometry, polarity, and intermolecular forces — structure predicts properties.",
        topics: ["Ionic & covalent bonding", "Lewis structures", "VSEPR geometry", "Polarity", "Intermolecular forces"],
        resources: [
          { title: "Bonding & Structure Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "VSEPR & Polarity Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Lewis Structure & Geometry Practice", kind: "assignment", type: "gdoc", url: "" },
          { title: "IMFs & Evaporation Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 3 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-4",
        num: 4,
        symbol: "Mo",
        semester: 1,
        title: "Nomenclature & The Mole",
        weeks: "3 weeks",
        description:
          "Name compounds fluently, then put them on the balance: molar mass, percent composition, and formula determination.",
        topics: ["Nomenclature", "The mole & molar mass", "Percent composition", "Empirical & molecular formulas", "Hydrates"],
        resources: [
          { title: "Nomenclature & Mole Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "The Mole & Formula Math Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Empirical Formula Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Hydrate Formula Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 4 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-5",
        num: 5,
        symbol: "Rx",
        semester: 1,
        title: "Reactions & Net Ionic Equations",
        weeks: "3 weeks",
        description:
          "Balance and classify reactions, apply solubility rules, and strip spectator ions down to net ionic equations.",
        topics: ["Balancing equations", "Reaction types", "Predicting products", "Solubility rules", "Net ionic equations"],
        resources: [
          { title: "Chemical Reactions Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Net Ionic Equations Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Predicting Products Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Precipitate Reactions Micro-Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 5 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-6",
        num: 6,
        symbol: "St",
        semester: 1,
        title: "Stoichiometry",
        weeks: "4 weeks",
        description:
          "The quantitative heart of the course: mole ratios, limiting reactants, percent yield, and lab-verified predictions.",
        topics: ["Mole ratios", "Mass-mass stoichiometry", "Limiting reactants", "Percent yield", "Error analysis"],
        resources: [
          { title: "Stoichiometry Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Limiting Reactant & Yield Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Stoichiometry Challenge Problems", kind: "assignment", type: "gdoc", url: "" },
          { title: "Copper Cycle Percent Yield Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 6 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-7",
        num: 7,
        symbol: "Ga",
        semester: 2,
        title: "Gases",
        weeks: "3 weeks",
        description:
          "Model gas behavior quantitatively: the gas laws, ideal gas equation, partial pressures, and gas stoichiometry.",
        topics: ["Kinetic molecular theory", "Gas laws", "Ideal gas law", "Dalton's law", "Graham's law", "Gas stoichiometry"],
        resources: [
          { title: "Gas Laws Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Ideal Gas & Partial Pressure Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Gas Stoichiometry Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Molar Mass of Butane Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 7 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-8",
        num: 8,
        symbol: "So",
        semester: 2,
        title: "Solutions & Concentration",
        weeks: "3 weeks",
        description:
          "Quantify the dissolved world: molarity, dilutions, solution stoichiometry, and colligative-property calculations.",
        topics: ["Molarity", "Dilutions", "Solution stoichiometry", "Colligative property calculations", "Beer's law (intro)"],
        resources: [
          { title: "Solutions & Concentration Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Molarity & Colligative Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Solution Stoichiometry Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Ice Cream Freezing-Point Depression Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 8 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-9",
        num: 9,
        symbol: "Th",
        semester: 2,
        title: "Thermochemistry",
        weeks: "3 weeks",
        description:
          "Energy with units: q = mcΔT calorimetry, heating-curve energy totals, Hess's law, and enthalpies of formation.",
        topics: ["q = mcΔT", "Calorimetry", "Heating curve calculations", "Hess's law", "Enthalpy of formation"],
        resources: [
          { title: "Thermochemistry Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Calorimetry & Hess's Law Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Hess's Law Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Heat of Reaction Calorimetry Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 9 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-10",
        num: 10,
        symbol: "Ke",
        semester: 2,
        title: "Kinetics & Equilibrium",
        weeks: "3 weeks",
        description:
          "Measure rates, then quantify reversibility with equilibrium-constant expressions and introductory ICE tables.",
        topics: ["Rate calculations", "Collision theory", "Le Châtelier's principle", "Equilibrium constant K", "ICE tables (intro)"],
        resources: [
          { title: "Kinetics & Equilibrium Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Equilibrium Constant Slides", kind: "slides", type: "gslides", url: "" },
          { title: "K Expression & ICE Table Practice", kind: "assignment", type: "gdoc", url: "" },
          { title: "Iron-Thiocyanate Equilibrium Lab", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 10 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-11",
        num: 11,
        symbol: "Ab",
        semester: 2,
        title: "Acids, Bases & Titrations",
        weeks: "3–4 weeks",
        description:
          "pH mathematics from strong acids through Ka/Kb, finished with quantitative titration analysis and curves.",
        topics: ["pH & pOH calculations", "Strong vs. weak acids", "Ka/Kb (intro)", "Titration calculations", "Titration curves"],
        resources: [
          { title: "Acids & Bases Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "pH Math & Weak Acids Slides", kind: "slides", type: "gslides", url: "" },
          { title: "pH & Ka Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Acid-Base Titration Lab (quantitative)", kind: "lab", type: "gdoc", url: "" },
          { title: "Unit 11 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
      {
        id: "mathematical-unit-12",
        num: 12,
        symbol: "Nu",
        semester: 2,
        title: "Nuclear Chemistry",
        weeks: "2 weeks",
        description:
          "Decay mathematics: nuclear equations, half-life calculations, decay series, and binding energy with mass defect.",
        topics: ["Nuclear equations", "Half-life calculations", "Decay series", "Binding energy & mass defect", "Fission & fusion"],
        resources: [
          { title: "Nuclear Chemistry Notebook Pages", kind: "notebook", type: "pdf", url: "" },
          { title: "Nuclear Energy Slides", kind: "slides", type: "gslides", url: "" },
          { title: "Half-Life & Decay Series Problem Set", kind: "assignment", type: "gdoc", url: "" },
          { title: "Radiation Shielding Simulation", kind: "activity", type: "gsheet", url: "" },
          { title: "Unit 12 Assessment", kind: "assessment", type: "gform", url: "" },
        ],
      },
    ],
  },
];

/* HTML slide decks hosted on this site (shown on the Slide Decks page).
   Add a folder under /slides/ and list it here. Optional `track` field
   shows a course label on the card (e.g. "Conceptual", "Mathematical"). */
const DECKS = [
  {
    title: "Demo Deck: How These Slides Work",
    unit: "Template",
    description:
      "A dependency-free HTML slide deck template with keyboard, click, and swipe navigation. Duplicate the folder to make your own.",
    url: "slides/demo-deck/",
    icon: "fa-duotone fa-solid fa-presentation-screen",
    fb: "🖥️",
  },
];
