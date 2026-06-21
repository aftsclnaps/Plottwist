// ================================================
// PLOT TWIST — Movie Database
// In production: replace with live TMDB API calls
// ================================================

export const MOVIES = [
  {
    t: "Eternal Sunshine", y: 2004, d: "Michel Gondry", g: "Romance",
    e: "♡", h: "#2a1a2e", gc: "#f4c0d1", gct: "#4b1528",
    tags: ["surreal","memory","heartbreak"],
    insight: "Your reflective pace and emotional signals align with this meditation on memory and love.",
    mood: ["sad","nostalgic","curious"], ms: .92, ps: .85,
    plot: "Joel erases memories of his ex but realises during the procedure he doesn't want to forget.",
    similar: ["Her","Amelie"],
    alts: [
      { t:"Her", y:2013, d:"Spike Jonze", g:"Drama", e:"○", h:"#2e1e0a", gc:"#ef9f27", gct:"#412402", why:"Same ache of connection lost — quieter, warmer, equally devastating.", ms:.87 },
      { t:"Amelie", y:2001, d:"Jean-Pierre Jeunet", g:"Romance", e:"♦", h:"#2e2010", gc:"#fac775", gct:"#412402", why:"Both orbit people who rearrange the world around their longing.", ms:.85 }
    ]
  },
  {
    t: "The Grand Budapest Hotel", y: 2014, d: "Wes Anderson", g: "Comedy",
    e: "◆", h: "#2e1a0e", gc: "#fac775", gct: "#412402",
    tags: ["whimsical","warm","adventure"],
    insight: "Upbeat signals and decisive swipes point to Wes Anderson's maximalist warm palette.",
    mood: ["happy","nostalgic","bored"], ms: .88, ps: .82,
    plot: "A legendary concierge and his lobby boy get tangled in the theft of a priceless painting.",
    similar: ["Knives Out","Moonrise Kingdom"],
    alts: [
      { t:"Knives Out", y:2019, d:"Rian Johnson", g:"Mystery", e:"◇", h:"#0a2e10", gc:"#97c459", gct:"#173404", why:"Same playful architecture of plot — witty, layered, enormously fun.", ms:.86 },
      { t:"Moonrise Kingdom", y:2012, d:"Wes Anderson", g:"Comedy", e:"★", h:"#102e10", gc:"#c0dd97", gct:"#173404", why:"Same director DNA — tender, meticulously framed, quietly moving.", ms:.83 }
    ]
  },
  {
    t: "Arrival", y: 2016, d: "Denis Villeneuve", g: "Sci-Fi",
    e: "◈", h: "#0d0a2e", gc: "#afa9ec", gct: "#26215c",
    tags: ["linguistics","quiet","time"],
    insight: "Your measured swipe rhythm matches this quiet, cerebral masterpiece.",
    mood: ["curious","sad","nostalgic"], ms: .90, ps: .87,
    plot: "A linguist communicates with alien lifeforms after twelve mysterious spacecraft appear globally.",
    similar: ["Interstellar","Annihilation"],
    alts: [
      { t:"Interstellar", y:2014, d:"Christopher Nolan", g:"Sci-Fi", e:"◎", h:"#050a1e", gc:"#85b7eb", gct:"#042c53", why:"Both use sci-fi to explore time, grief, and what we leave behind.", ms:.89 },
      { t:"Annihilation", y:2018, d:"Alex Garland", g:"Sci-Fi", e:"✦", h:"#0a1a0a", gc:"#97c459", gct:"#173404", why:"Same eerie cerebral dread — alien encounter as psychological mirror.", ms:.82 }
    ]
  },
  {
    t: "Parasite", y: 2019, d: "Bong Joon-ho", g: "Thriller",
    e: "▲", h: "#0a2e0a", gc: "#97c459", gct: "#173404",
    tags: ["class","tension","dark comedy"],
    insight: "High engagement — you are ready for something that grabs you by the collar.",
    mood: ["bored","curious","happy"], ms: .91, ps: .89,
    plot: "A poor family schemes to infiltrate a wealthy household with shocking consequences.",
    similar: ["Oldboy","The Platform"],
    alts: [
      { t:"Oldboy", y:2003, d:"Park Chan-wook", g:"Thriller", e:"◉", h:"#2e0a0a", gc:"#f09595", gct:"#501313", why:"Same Korean cinema intensity — visceral, layered, impossible to shake.", ms:.88 },
      { t:"The Platform", y:2019, d:"G.G-Urrutia", g:"Thriller", e:"▼", h:"#1a1a0a", gc:"#d3d1c7", gct:"#2c2c2a", why:"Same class-warfare allegory in a sealed, brutal system.", ms:.80 }
    ]
  },
  {
    t: "Her", y: 2013, d: "Spike Jonze", g: "Drama",
    e: "○", h: "#2e1e0a", gc: "#ef9f27", gct: "#412402",
    tags: ["loneliness","tech","warmth"],
    insight: "Emotional undercurrents suggest you want warmth without overwhelm.",
    mood: ["sad","nostalgic","curious"], ms: .87, ps: .84,
    plot: "In a near future, a lonely writer falls for an AI operating system.",
    similar: ["Eternal Sunshine","Lost in Translation"],
    alts: [
      { t:"Eternal Sunshine", y:2004, d:"Michel Gondry", g:"Romance", e:"♡", h:"#2a1a2e", gc:"#f4c0d1", gct:"#4b1528", why:"Both ask the impossible question: how do you hold onto love?", ms:.92 },
      { t:"Lost in Translation", y:2003, d:"Sofia Coppola", g:"Drama", e:"◑", h:"#0a0a2e", gc:"#afa9ec", gct:"#26215c", why:"Same quiet longing — two people adrift, finding each other briefly.", ms:.82 }
    ]
  },
  {
    t: "Everything Everywhere", y: 2022, d: "Daniels", g: "Sci-Fi",
    e: "✦", h: "#1a0a2e", gc: "#afa9ec", gct: "#26215c",
    tags: ["multiverse","absurd","emotional"],
    insight: "Restless energy off the charts — this will cure your boredom instantly.",
    mood: ["bored","stressed","happy"], ms: .90, ps: .88,
    plot: "An aging laundromat owner is swept into a wild multiverse adventure to save existence.",
    similar: ["Spider-Verse","Swiss Army Man"],
    alts: [
      { t:"Spider-Man: Spider-Verse", y:2018, d:"Lord & Miller", g:"Animation", e:"◈", h:"#1a0a2e", gc:"#afa9ec", gct:"#26215c", why:"Same multiverse chaos — visually explosive, emotionally grounded.", ms:.86 },
      { t:"Swiss Army Man", y:2016, d:"Daniels", g:"Comedy", e:"~", h:"#0a2e10", gc:"#97c459", gct:"#173404", why:"Same directors, same absurdist heart — grief wrapped in lunatic comedy.", ms:.78 }
    ]
  },
  {
    t: "Amelie", y: 2001, d: "Jean-Pierre Jeunet", g: "Romance",
    e: "♦", h: "#2e2010", gc: "#fac775", gct: "#412402",
    tags: ["paris","kindness","whimsy"],
    insight: "Nostalgic warmth detected — Amelie was made for exactly this evening.",
    mood: ["happy","nostalgic","sad"], ms: .93, ps: .85,
    plot: "An introverted Parisian woman orchestrates happiness for others while seeking her own.",
    similar: ["Midnight in Paris","Eternal Sunshine"],
    alts: [
      { t:"Midnight in Paris", y:2011, d:"Woody Allen", g:"Romance", e:"◑", h:"#0a102e", gc:"#85b7eb", gct:"#042c53", why:"Same Paris-as-dream logic — nostalgia as both shelter and trap.", ms:.84 },
      { t:"Eternal Sunshine", y:2004, d:"Michel Gondry", g:"Romance", e:"♡", h:"#2a1a2e", gc:"#f4c0d1", gct:"#4b1528", why:"Same tender inventive approach to how love reshapes who we are.", ms:.88 }
    ]
  },
  {
    t: "Spirited Away", y: 2001, d: "Hayao Miyazaki", g: "Animation",
    e: "✿", h: "#0a202e", gc: "#85b7eb", gct: "#042c53",
    tags: ["spirit world","wonder","growth"],
    insight: "Nostalgic undertones and gentle energy — Miyazaki speaks your soul's language.",
    mood: ["nostalgic","stressed","happy"], ms: .92, ps: .87,
    plot: "A ten-year-old stumbles into a spirit world where humans are turned into beasts.",
    similar: ["Princess Mononoke","Howl's Moving Castle"],
    alts: [
      { t:"Princess Mononoke", y:1997, d:"Hayao Miyazaki", g:"Animation", e:"✦", h:"#0a2e14", gc:"#5dcaa5", gct:"#04342c", why:"Same mythic Miyazaki scope — darker, weightier, more epic.", ms:.86 },
      { t:"Howl's Moving Castle", y:2004, d:"Hayao Miyazaki", g:"Animation", e:"◆", h:"#2e1a0e", gc:"#fac775", gct:"#412402", why:"Same warm Miyazaki wonder — a woman transformed, finding herself.", ms:.85 }
    ]
  },
  {
    t: "Interstellar", y: 2014, d: "Christopher Nolan", g: "Sci-Fi",
    e: "◎", h: "#050a1e", gc: "#85b7eb", gct: "#042c53",
    tags: ["space","epic","fatherhood"],
    insight: "High engagement and thoughtful pace — you want to be challenged and moved.",
    mood: ["curious","bored","nostalgic"], ms: .89, ps: .88,
    plot: "Astronauts travel through a wormhole to find a new home as Earth faces extinction.",
    similar: ["Arrival","2001: A Space Odyssey"],
    alts: [
      { t:"Arrival", y:2016, d:"Denis Villeneuve", g:"Sci-Fi", e:"◈", h:"#0d0a2e", gc:"#afa9ec", gct:"#26215c", why:"Same sci-fi grandeur used to tell a deeply personal story about time.", ms:.90 },
      { t:"2001: A Space Odyssey", y:1968, d:"Stanley Kubrick", g:"Sci-Fi", e:"○", h:"#0a0a1a", gc:"#d3d1c7", gct:"#2c2c2a", why:"The film Interstellar grew up worshipping — austere, visionary, essential.", ms:.84 }
    ]
  },
  {
    t: "Oldboy", y: 2003, d: "Park Chan-wook", g: "Thriller",
    e: "◉", h: "#2e0a0a", gc: "#f09595", gct: "#501313",
    tags: ["revenge","mystery","visceral"],
    insight: "Escalating tension — you're primed for something that demands everything.",
    mood: ["curious","bored","stressed"], ms: .88, ps: .86,
    plot: "A man imprisoned for fifteen years hunts his captor after sudden release.",
    similar: ["Parasite","Memories of Murder"],
    alts: [
      { t:"Parasite", y:2019, d:"Bong Joon-ho", g:"Thriller", e:"▲", h:"#0a2e0a", gc:"#97c459", gct:"#173404", why:"Same Korean cinema mastery — class anxiety turned into slow-burn terror.", ms:.91 },
      { t:"Memories of Murder", y:2003, d:"Bong Joon-ho", g:"Thriller", e:"◇", h:"#1a0a0a", gc:"#f09595", gct:"#501313", why:"Same obsessive investigation — based on Korea's first serial murders.", ms:.85 }
    ]
  },
  {
    t: "In the Mood for Love", y: 2000, d: "Wong Kar-wai", g: "Drama",
    e: "◈", h: "#2e0a1a", gc: "#ed93b1", gct: "#4b1528",
    tags: ["yearning","slow burn","gorgeous"],
    insight: "Your deliberate slow rhythm mirrors this film — it will feel exactly right.",
    mood: ["sad","nostalgic","curious"], ms: .91, ps: .83,
    plot: "Two neighbours develop a friendship after discovering their spouses are having an affair.",
    similar: ["Eternal Sunshine","Her"],
    alts: [
      { t:"Eternal Sunshine", y:2004, d:"Michel Gondry", g:"Romance", e:"♡", h:"#2a1a2e", gc:"#f4c0d1", gct:"#4b1528", why:"Same unspeakable ache of love that cannot be expressed — only felt.", ms:.92 },
      { t:"Her", y:2013, d:"Spike Jonze", g:"Drama", e:"○", h:"#2e1e0a", gc:"#ef9f27", gct:"#412402", why:"Same warm lonely longing — connection that exists but cannot be claimed.", ms:.87 }
    ]
  },
  {
    t: "The Lighthouse", y: 2019, d: "Robert Eggers", g: "Horror",
    e: "◬", h: "#1a1a0a", gc: "#d3d1c7", gct: "#2c2c2a",
    tags: ["isolation","madness","monochrome"],
    insight: "Hesitation on lighter films and slow pace — you want something dark.",
    mood: ["curious","sad","bored"], ms: .84, ps: .81,
    plot: "Two lighthouse keepers slowly lose their sanity on a remote New England island.",
    similar: ["The Witch","Midsommar"],
    alts: [
      { t:"The Witch", y:2015, d:"Robert Eggers", g:"Horror", e:"◬", h:"#1a0a0a", gc:"#f09595", gct:"#501313", why:"Same director's debut — same period dread, same creeping psychological horror.", ms:.82 },
      { t:"Midsommar", y:2019, d:"Ari Aster", g:"Horror", e:"◎", h:"#1a1a0a", gc:"#fac775", gct:"#412402", why:"Same folk horror DNA — isolation, ritual, slow unravelling of the self.", ms:.80 }
    ]
  },
  {
    t: "Knives Out", y: 2019, d: "Rian Johnson", g: "Mystery",
    e: "◇", h: "#0a2e10", gc: "#97c459", gct: "#173404",
    tags: ["whodunit","sharp","playful"],
    insight: "Alert session energy — this witty mystery is calibrated for your headspace.",
    mood: ["happy","bored","curious"], ms: .87, ps: .86,
    plot: "A brilliant detective investigates the death of a patriarch in an eccentric family.",
    similar: ["Grand Budapest Hotel","The Menu"],
    alts: [
      { t:"The Grand Budapest Hotel", y:2014, d:"Wes Anderson", g:"Comedy", e:"◆", h:"#2e1a0e", gc:"#fac775", gct:"#412402", why:"Same intricate plot craftsmanship — every detail placed with precision.", ms:.88 },
      { t:"The Menu", y:2022, d:"Mark Mylod", g:"Thriller", e:"◎", h:"#1a0a0a", gc:"#f09595", gct:"#501313", why:"Same sharp class satire wrapped inside a delicious genre twist.", ms:.82 }
    ]
  },
  {
    t: "Moonrise Kingdom", y: 2012, d: "Wes Anderson", g: "Comedy",
    e: "★", h: "#102e10", gc: "#c0dd97", gct: "#173404",
    tags: ["childhood","love","quirky"],
    insight: "Nostalgic signals with warmth — this tender adventure is precisely your vibe.",
    mood: ["nostalgic","happy","sad"], ms: .86, ps: .83,
    plot: "Two twelve-year-olds fall in love and plan to run away across a fictional island.",
    similar: ["Grand Budapest Hotel","Amelie"],
    alts: [
      { t:"The Grand Budapest Hotel", y:2014, d:"Wes Anderson", g:"Comedy", e:"◆", h:"#2e1a0e", gc:"#fac775", gct:"#412402", why:"Same Wes Anderson universe — precise, warm, quietly heartbreaking.", ms:.88 },
      { t:"Amelie", y:2001, d:"Jean-Pierre Jeunet", g:"Romance", e:"♦", h:"#2e2010", gc:"#fac775", gct:"#412402", why:"Same whimsical logic — both believe deeply in small acts of magic.", ms:.85 }
    ]
  },
  {
    t: "Princess Mononoke", y: 1997, d: "Hayao Miyazaki", g: "Animation",
    e: "✦", h: "#0a2e14", gc: "#5dcaa5", gct: "#04342c",
    tags: ["nature","war","spirit"],
    insight: "Stress with nostalgic undercurrent — this epic will transport you completely.",
    mood: ["stressed","nostalgic","happy"], ms: .86, ps: .83,
    plot: "Ashitaka finds himself between an industrial town and the ancient forest spirits.",
    similar: ["Spirited Away","Nausicaa"],
    alts: [
      { t:"Spirited Away", y:2001, d:"Hayao Miyazaki", g:"Animation", e:"✿", h:"#0a202e", gc:"#85b7eb", gct:"#042c53", why:"Same mythic spirit-world scope — gentler, more personal in its wonder.", ms:.92 },
      { t:"Nausicaa of the Valley", y:1984, d:"Hayao Miyazaki", g:"Animation", e:"◑", h:"#0a1a2e", gc:"#85b7eb", gct:"#042c53", why:"The spiritual predecessor — same ecological soul, same fierce heroine.", ms:.81 }
    ]
  },
];

// Mood configuration
export const MOOD_MAP = {
  happy:    { moods:["happy","bored"],              col:"#f5c842", mode:"MATCH", mCls:"mode-match", label:"joyful frequency" },
  sad:      { moods:["sad","nostalgic"],             col:"#c8a8f0", mode:"SHIFT", mCls:"mode-shift", label:"reflective depth" },
  bored:    { moods:["bored","curious","happy"],     col:"#f08080", mode:"MATCH", mCls:"mode-match", label:"restless signal" },
  stressed: { moods:["stressed","nostalgic"],        col:"#90d4a0", mode:"SHIFT", mCls:"mode-shift", label:"calm-seeking" },
  nostalgic:{ moods:["nostalgic","sad","happy"],     col:"#f5c842", mode:"MATCH", mCls:"mode-match", label:"nostalgic warmth" },
  curious:  { moods:["curious","bored"],             col:"#90d4a0", mode:"MATCH", mCls:"mode-match", label:"curious alertness" },
};

// Confetti colors
export const CONFETTI_COLORS = ["#f5c842","#f08080","#90d4a0","#c8a8f0","#f0a830","#e8a820","#d4c090","#f5e6c0"];

// Cinema light colors
export const BULB_COLORS = ["#f5c842","#e84438","#f0a830","#90d4a0","#c8a8f0","#85b7eb","#f5c842","#e84438","#90d4a0","#c8a8f0"];
