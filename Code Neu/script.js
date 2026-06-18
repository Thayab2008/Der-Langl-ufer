// Globale Variablen
const textContainer = document.getElementById("text-container");
const decisionContainer = document.getElementById("decision-container");
const buttonsAndInputs = document.getElementById("buttons-and-inputs");
const timerContainer = document.getElementById("timer-container");
const imageHolder = document.getElementById("story-image");
const startButton = document.getElementById("start-button");
const lampButton = document.getElementById("lampButton");
const gunButton = document.getElementById("gunButton");

// In dieser Variable wird der Timer gespeichert, damit wir ihn auch wieder löschen können, falls der Benutzer rechtzeitig eine Entscheidung trifft.
let timerVariable;
let timerTime = 10000; // Zeit in Millisekunden, die der Benutzer für eine Entscheidung hat (aktuell 10 Sekunden)

let useTypeWriterEffect = true; // Hier kann eingestellt werden, ob der Type-Writer Effekt verwendet werden soll oder nicht. Falls nicht, wird der Text direkt angezeigt.
let typeWriterSpeed = 3; // Hier kann die Geschwindigkeit des Type-Writer Effekts eingestellt werden (aktuell 3 Millisekunden pro Buchstabe)
let textDelay = 20; // Hier kann die Verzögerung zwischen den Textabschnitten eingestellt werden (aktuell 2000 Millisekunden = 2 Sekunden)
let hasLamp = false;
let BatteryLife = 5;
let lampHandlerAttached = false;
let hasGun = false;
let gunHandlerAttached = false;
let gunShots = 3;
let gunUsedStoryKeys = new Set();
let creditsScrollInterval = null;
let currentStoryKey = null;
let storyRunId = 0;
let currentSound = null;
let kamin2LampUsed = false;
let schlafen1LampUsed = false;
let pendingStoryText = [];
let rausgehen3LampUsed = false;


function playSound(soundPath) {
  if (currentSound) {
    currentSound.pause();
    currentSound.currentTime = 0;
  }

  currentSound = new Audio(soundPath);
  currentSound.play().catch(() => {});
}

function lampClickHandler() {
  if (!hasLamp) return;

  playSound("sounds/lamp_sound.mp3");

  if (BatteryLife <= 0) {
    alert("Die Batterie ist leer.");
    lampButton.disabled = true;
    return;
  }

  // Batterie verringern
  BatteryLife--;

  // Aktualisiere Batterie-Anzeige
  const batterySpan = document.getElementById("battery-count");
  if (batterySpan) batterySpan.innerText = BatteryLife;

  // Zusätzliche Information anzeigen
  const info = document.createElement("p");
  info.textContent = `Taschenlampe benutzt. Batterie verbleibend: ${BatteryLife}`;
  textContainer.appendChild(info);

  if (currentStoryKey === "kamin_2") {
    const rehInfo = document.createElement("p");
    rehInfo.textContent = "Ein Reh steht am Waldrand";
    textContainer.appendChild(rehInfo);
    kamin2LampUsed = true;
    if (gunButton && hasGun) {
      gunButton.disabled = gunShots <= 0;
    }
  }

  if (currentStoryKey === "schlafen_1") {
    const mannInfo = document.createElement("p");
    mannInfo.textContent = "Ein Mann mit Messer steht über mir.";
    textContainer.appendChild(mannInfo);
    schlafen1LampUsed = true;
    if (gunButton && hasGun) {
      gunButton.disabled = gunShots <= 0;
    }
  }

  if (currentStoryKey === "links_2") {
    const rehInfo = document.createElement("p");
    rehInfo.textContent = "Es ist nur ein Reh.";
    textContainer.appendChild(rehInfo);
  }

  if (currentStoryKey === "rausgehen_1") {
    pendingStoryText = ["In rotem Schnee liegt ein totes Reh mit Schnittwunden."];
    nextStory("verbarikadieren_1");
  }
  if (currentStoryKey === "rausgehen_4") {
    pendingStoryText = ["sieht Mann voll mit blutigen Kleidern und Messer"];
    nextStory("ziel_tod");
  }
  if (currentStoryKey === "rechts_1") {
    pendingStoryText = ["Das tote Reh ist von grausamen Schnittwunden übersät."];
    nextStory("geräusch_2");
  }
  if (currentStoryKey === "dort_lassen_3") {
    pendingStoryText=["Eine nasse Spur führt ins Schlafzimmer.",
      "Als ich die Spuren zum Schlafzimmer sehe, verbarrikadiere ich schnell die Tür mit dem Regal.",
  
    ]
    
    nextStory("wehren_2");
  }

   if (currentStoryKey === "dort_lassen_2") {
    pendingStoryText = ["Ein überrascht aussehender Mann steht im Wohnzimmer."];
    nextStory("wohnzimmer_mann");
  }

     if (currentStoryKey === "versuchen_schlafen") {
    pendingStoryText = ["Mark steckt seine rechte Hand schnell hinter den Rücken und sagt: <Ich wollte mir nur ein Buch holen.> Er nimmt ein Buch und geht zurück mit einem <Gute Nacht>."];
    nextStory("buch_1");
  }

  if (currentStoryKey === "rausgehen_3") {
    const mannInfo = document.createElement("p");
    mannInfo.textContent = "Der Mann ist voller Blut und hält ein Messer.";
    textContainer.appendChild(mannInfo);
    rausgehen3LampUsed = true;
    
    
    if (gunButton && hasGun) {
      gunButton.disabled = gunShots <= 0;
    }
  }

  if (currentStoryKey === "weg_2") {
    const leftPathInfo = document.createElement("p");
    leftPathInfo.textContent = "Links: Das Schild zeigt den Weg ins Tal.";
    textContainer.appendChild(leftPathInfo);

    const rightPathInfo = document.createElement("p");
    rightPathInfo.textContent = "Rechts: Das Schild zeigt zur Berghainhöhle";
    textContainer.appendChild(rightPathInfo);
  }
  if (currentStoryKey === "geräusch_2") {
    const wegweiserInfo = document.createElement("p");
    wegweiserInfo.textContent = "Vor der Höhle steht ein Warnschild: <Betreten verboten!>";
    textContainer.appendChild(wegweiserInfo);
  }

  if (currentStoryKey === "rechts_1") {
    const rechtsInfo = document.createElement("p");
    rechtsInfo.textContent = "Das tote Reh ist von grausamen Schnittwunden übersät.";
    textContainer.appendChild(rechtsInfo);
  }
   if (currentStoryKey === "links_2") {
    const waldInfo = document.createElement("p");
    waldInfo.textContent = "Es ist nur ein Reh";
    textContainer.appendChild(waldInfo);
  }
  if (BatteryLife <= 0) lampButton.disabled = true;
}


function gunClickHandler() {
  if (!hasGun) return;
  if (gunUsedStoryKeys.has(currentStoryKey)) return;

  if (gunShots <= 0) {
    alert("Du hast keine Schüsse mehr!");
    return;
  }

  gunUsedStoryKeys.add(currentStoryKey);
  if (gunButton) gunButton.disabled = true;

  playSound("sounds/gun_shot.mp3");

  gunShots--;

  if (currentStoryKey === "umdrehen_1") {
    nextStory("wald_verstecken");
  } else if (currentStoryKey === "umdrehen_2") {
    nextStory("Ziel_3");
  } else if (currentStoryKey === "kamin_2") {
    nextStory("schiessen_1");
  } else if (currentStoryKey === "schlafen_1") {
    nextStory("schiessen_2");
  } else if (currentStoryKey === "rausgehen_3") {
    nextStory("rausgehen_5");
  } else {
    nextStory("gun_action");
  }
}



/**
 * Die Story-Datenstruktur
 * Jeder Knoten in der Story ist ein JavaScript Objekt mit den folgenden Eigenschaften: 
 *    id: "Story-Identifier", (der Identifier wird benötigt um den richtig Storyfluss zu gewährleisten)
 *    text: [], (Array von Strings, die nacheinander angezeigt angezeigt werden)
 *    hasTimer: True/False, Falls True, wird ein Timer angezeigt und der Benutzer muss innerhalb der Zeit eine Entscheidung treffen, sonst verliert er das Spiel.
 *    image: "Pfad zum Bild", (optional, falls an diesem Story-Punkt ein Bild angezeigt werden soll)
 *    next: [], (Array von Objekten mit key und label, die die möglichen Entscheidungen des Benutzers darstellen. 
 *              key ist der Identifier der nächsten Story, label ist der Text, der auf dem Button angezeigt wird) 
 *    input: { (optional, falls an diesem Story-Punkt eine Benutzereingabe benötigt wird) }
 */
const story = {
    introduction: {
      id: "introduction",
      text: [
        "Ein Langläufer machte sich am Abend auf den Weg durch die verschneite Landschaft. Er hatte die belebte Loipe verlassen, weil er Ruhe suchte und den vielen Menschen entkommen wollte. Doch je höher er in das Tal hinauf stampfte, desto sicherer war er, dass er nicht mehr allein war. Hinter ihm knirschte der Schnee im gleichen Takt wie unter seinen eigenen Skiern. Er hörte das leise Aufsetzen von Skistöcken und glaubte, dass ihm jemand Schritt für Schritt folgte.",
        "Obwohl er immer müder wurde, lief er weiter. Bei der Steinhütte, die er erreichte, wollte er eigentlich umkehren, doch die Schritte hinter ihm ließen ihn nicht anhalten. Mit jedem Meter schien der unbekannte Läufer näher zu kommen. Manchmal glaubte er sogar, dessen Atem hinter sich zu hören. Er wagte es nicht, sich umzudrehen. In seinem Kopf gab es keinen Zweifel daran, dass dort jemand war und nur auf den richtigen Moment wartete, um ihn zu überholen und seine Aussicht rauben will.",
        "Das Geräusch hinter ihm schien immer näher zu kommen. Er war überzeugt, dass sein Verfolger nur wenige Schritte entfernt war, und sammelte seine letzten Kräfte, um vor ihm zu bleiben. Als er schließlich die Alphütte erreichte, die er sich als Ziel gesetzt hatte, blieb er stehen und drehte sich um",
        "Doch hinter ihm war niemand. Als er realisierte, dass sein Verfolger nie existiert hatte übermannten ihn Erschöpfung und Verwirrung. Dann verließen ihn seine Kräfte und er sank bewusstlos in den Schnee."

      ],
      image:"img/hütte_draussen.jpg",
      hasTimer: false,
      hasLamp:false,
  
      
    },
  
    
  
    start_1: {
      id: "start_1",
      text: ["Geräusch; Als ich mein Bewusstsein langsam wiedererlange finde ich mich in einer pechschwarzen Welt wieder. ",
        "Erst als der hellstrahlende Vollmond hinter den Wolken hervortritt, erkenne ich die Alphütte. Von Lebewesen keine Spur.",
        "<Wie lange war ich bloss weggetreten? Ich hätte meine Taschenlampe einpacken sollen…>"
      ],
      image:"img/mond.jpg",
      hasTimer: false,
      hasLamp:false,
      next: [
        { key: "start_2", label: "Weiter" }
        
      ]
    },

    start_2: {
      id: "start_2",
      text: ["Ich versuche aufzustehen. Die alten Langlaufskier an meinen Beinen erschweren dies, so dass ich die klemmende Bindung mit dem anderen Ski nervös auftrat. Sie brach. ",
        "<Scheisse!> ",
        "Nachdem ich den zweiten Ski ausgezogen habe. Stehe ich auf und klopfe mir den Schnee ab."
        
      ],
      image:"img/mond.jpg",
      hasTimer: false,
      hasLamp:false,
      image: "img/wacht_auf.png",
      next: [
        { key: "weg_1", label: "Weg hinab" },
        { key: "hütte_1", label: "Zur Alphütte" }
      ]
    },




    weg_1: {
      id: "weg_1",
      text: ["Die kaputten Skier im Schnee liegengelassen, gehe ich den, vom Mondlicht schwach beleuchteten Weg zurück. "
      ],
      image: "img/weg_dunkel.png",
      sound: "sounds/footsteps_snow.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "weg_2", label: "Weiter" }
        
      ]
    },

  
    

    weg_2: {
      id: "weg_2",
      text: ["Nach einem längeren Marsch, kann ich gerade noch die Umrisse eines Wegweisers sehen, doch wegen dem Dickichts der Bäume dringt kaum noch Licht hindurch. Die Schrift ist nicht mehr zu erkennen. <Welcher Weg war es nochmals? Ich kann mich nicht mehr erinnern… Links? Obwohl. Rechts sieht auch gut aus…>"
      ],
      image: "img/weg_2.png",
      sound: "sounds/footsteps_snow.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "links_1", label: "Links" },
        { key: "rechts_1", label: "Rechts" },
      ]
    },
 
    links_1: {
      id: "links_1",
      text: ["Je weiter ich dem Weg entlang laufe, desto bekannter erscheint er mir. Nach einer Weile erreiche ich die Steinhütte, bei der ich beim Aufstieg zuerst umkehren wollte. Ich lehne mich seitlich an die verschlossene Holztür zum Durchatmen, als das Gebüsch  hinter mir raschelt. "
      ],
      image:"img/bush_forest.png",
      sound:"sounds/bush.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "links_2", label: "Weiter" }
      ]
    },
 
    links_2: {
      id: "links_2",
      text: ["Ich drehe mich schnell um und blicke in die Finsternis des Waldes. "],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "hinab_1", label: "Weiter hinab" },
        { key: "geräusch_1", label: "Geräusch folgen" }
      ]
    },

    geräusch_1: {
      id: "links_2",
      text: ["Sofort erinnere ich mich an all diese Geräusche beim Hochlaufen und fühle den Drang, mir zu beweisen, dass ich mir das nicht eingebildet habe. Ich laufe durch den Wald dem Geräusch nach, bis ich es nicht mehr höre. ",
        "Jetzt habe ich mich verlaufen."
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_2", label: "Weiter" }
      ]
    },


   geräusch_2: {
      id: "geräusch_2",
      text: ["Nach einer Weile erreiche ich eine pechschwarze Höhle. <Ob ich mich in dieser Höhle ausruhen  oder diesen Wanderweg hier nehmen soll?> Ich schaue von der Höhle weg auf einen schmalen Weg. "],
     image:"img/cave.png",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "weg_nehmen_1", label: "Weg nehmen" },
        { key: "betreten_1", label: "Betreten" }
      ]
    },
    weg_nehmen_1: {
      id: "weg_nehmen_1",
      text: ["Ich folge dem Weg und erreiche schon bald wieder die Kreuzung mit den Wegweisern.",
        "Der einzige Weg, den ich jetzt noch nicht gegangen bin, ist der linke."
      ],
      image:"img/path.png",
      sound:"sounds/footsteps_snow.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "weg_nehmen_2", label: "Links" }
      ]
    },

    weg_nehmen_2: {
      id: "weg_nehmen_2",
      text: ["Ich erreiche wieder die Steinhütte, ein Zeichen, dass ich auf dem richtigen Weg bin."],
      image:"img/hütte_2.jpeg",
      sound:"sounds/footsteps_snow.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "weg_nehmen_3", label: "Weiter" }
      ]
    },

  weg_nehmen_3: {
      id: "weg_nehmen_3",
      text: ["Ich laufe weiter.Die immer weniger werdenden Bäume geben nun die Sicht auf ferne, wunderschöne, funkelnde Dorflichter, unter einem Vollmond, frei. Ich höre ein entferntes <Halt!> und das leise, eher schnelle Knirschen des Schnees.",
        "hört schnelle schritte und <Halt!>"
      ],
      image:"img/dorf.png",
      sound:"sounds/running.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "Ziel_5", label: "Wegrennen" },
        {key:"umdrehen_1", label:"Umdrehen"}
      ]
    },
     rechts_1: {
      id: "rechts_1",
      text: ["Beim Gehen bemerke ich abseits des Weges im Dunkeln die Umrisse eines Rehkadavers.",
        "<Waren das wilde Tiere?>"
      ],
      image:"img/dead_deer.png",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_2", label: "Weiter" },

      ]
    },
  betreten_1: {
      id: "betreten_1",
      text: ["Mit jedem Schritt hallt ein Echo aus den schaurigen Tiefen der Höhle.Langsam schreite ich in die Finsternis. ",
        "Weiter hinten sehe ich ein flackerndes Licht an der Wand."

      ],
      image:"img/cave_inside.avif",
      sound:"sounds/cave.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "betreten_2", label: "Weiter" }
      ]
    },

  betreten_2: {
      id: "betreten_2",
      text: ["Ich gehe zur Fackel. Unter ihr liegt ein abgenutzter Schlafsack.",
        "Ich höre ein Geräusch aus Richtung Eingang, und bevor ich mich umdrehen kann, spüre ich einen Schlag auf den Kopf und verliere das Bewusstsein. "
      ],
      sound:"sounds/cave.mp3",
      sound:"sounds/hitting.mp3",
      image:"img/cave_light.webp",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "Ziel_2", label: "Weiter" }
      ]
    },

    hinab_1: {
      id: "hinab_1",
      text: ["Ich laufe weiter. Die immer weniger werdenden Bäume geben nun die Sicht auf ferne, wunderschöne, funkelnde Dorflichter, unter einem Vollmond, frei. Ich höre ein entferntes <Halt!> und das leise, eher schnelle Knirschen des Schnees."
      ],
      sound:"sounds/running_snow.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "Ziel_3", label: "Wegrennen" },
        { key: "umdrehen_1", label: "Umdrehen" }
      ]
    },
      
    umdrehen_1: {
      id: "umdrehen_1",
      text: ["Ich drehe mich um. Eine schneller werdende Gestalt nähert sich.",
        "...Er ist wütend...",
        "...und hält ein Messer!"
      ],
      sound:"sounds/running_snow.mp3",
      hasTimer: true,
      timerTime: 9000,
      timerKey: "ziel_tod",
      startTimerBeforeText: true,
      textDelay: 6000,
      hasLamp:false,
      canUseGun:true,
      BatteryLife:5
    },
  umdrehen_2: {
      id: "umdrehen_2",
      text: ["Als ich sicherheitshalber das Gewehr anlege, löst sich ein Schuss. Man hört, wie ein Baum getroffen wird.",
        "Nachdem ich wieder zu mir komme, liegt wenige Meter vor mir ein Mann mit dem Gesicht nach unten in rot getränktem Schnee.",
        
      ],
      sound:"sounds/gun_shot.mp3",
      sound:"sounds/man_scream.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:true,
      BatteryLife:5,
       next: [
        { key: "Ziel_3", label: "Weiter"},
       ]
    },
    wald_verstecken: {
      id: "wald_verstecken",
      text: ["Ich springe schnell ins Gestrüpp und verstecke mich weiter hinten in der Dunkelheit.",
        "Schritte nähern sich meinem Versteck."
      ],
      image:"img/bush_forest.png",
      sound:"sounds/bush.mp3",
      hasTimer: false,
      hasLamp: true,
      canUseGun: false,
      BatteryLife: 5,
      next: [
        { key: "versteckt_bleiben", label: "Versteckt bleiben"},
        {key:"angriff", label:"Angriff"}
      ]
    },
   versteckt_bleiben: {
      id: "versteck_bleiben",
      text: ["Ich drücke meine Augen zusammen und halte den Atem an.",
        "Er muss gerade neben mir stehen. Das letzte, das ich fühle, ist ein Stechen am Nacken und eine angenehme Wärme.",
      ],
      image:"img/bush_forest.png",
      sound:"sounds/hitting.mp3",
      hasTimer: false,
      hasLamp: true,
      canUseGun: false,
      BatteryLife: 5,
      next: [
        { key: "ziel_tod", label: "Weiter"}
       
      ]
    },
    angriff: {
      id: "angriff",
      text: ["Als er in meiner Reichweite steht, fasse ich mir ein Herz, greife einen faustgrossen Stein, springe auf und schlage ihn über seinen Hinterkopf.",
      ],
      image:"img/bush_forest.png",
      sound:"sounds/hitting.mp3",
      hasTimer: false,
      hasLamp: true,
      canUseGun: false,
      BatteryLife: 5,
      next: [
        { key: "Ziel_2", label: "Weiter"},
     
      ]
    },
    geräusch_1: {
      id: "geräusch_1",
      text: ["Sofort erinnere ich mich an all diese Geräusche beim Hochlaufen und fühle den Drang, mir zu beweisen, dass ich mir das nicht eingebildet habe. Ich laufe durch den Wald dem Geräusch nach, bis ich es nicht mehr höre. ",
        "Jetzt habe ich mich verlaufen."
      ],
      image:"img/path.png",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_2", label: "Weiter" }
      ]
    },

    geräusch_2: {
      id: "geräusch_2",
      text: ["Nach einer Weile erreiche ich eine pechschwarze Höhle. <Ob ich mich in dieser Höhle ausruhen  oder diesen Wanderweg hier nehmen soll?> Ich schaue von der Höhle weg auf einen schmalen Weg. "

      
      ],
      image:"img/cave.png",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_weg_1", label: "Weg gehen" },
        {key: "betreten_1", label: "Betreten"}
      ],
      },

    geräusch_weg_1: {
      id: "geräusch_weg_1",
      text: ["Ich folge dem Weg und erreiche schon bald wieder die Kreuzung mit den Wegweisern. Der einzige Weg, den ich jetzt noch nicht gegangen bin, ist der linke.",

      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_weg_2", label: "Links" }
      ],
    },
    geräusch_weg_2: {
      id: "geräusch_weg_2",
      text: ["Ich erreiche wieder die Steinhütte, ein Zeichen, dass ich auf dem richtigen Weg bin."
        
        
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_weg_3", label: "Weiter hinab" },
      ],
      },
      
 geräusch_weg_3: {
      id: "geräusch_weg_3",
      text: ["Ich laufe weiter. Die immer weniger werdenden Bäume geben nun die Sicht auf ferne, wunderschöne, funkelnde Dorflichter, unter einem Vollmond, frei. Ich höre ein entferntes <Halt!> und das leise, eher schnelle Knirschen des Schnees." ]
      ,
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "ziel_3", label: "Wegrennen" },
        {key: "umdrehen_1", label:"Umdrehen"}
      ],
      },






































 hütte_1: {
      id: "hütte_1",
      text: ["Ich stelle die Skier gegen die verwitterte Wand der Hütte. Beim, angewöhnten, höflichen, doch offensichtlich unnötigen, Anklopfen der Tür geht sie langsam auf. Geduckt betrete ich langsam das Haus.<Hallo, ist jemand Zuhause?>",
        "Nachdem die Finsternis nicht geantwortet hat, taste ich mich langsam in den Eingang. Auf dem Schrank ertaste ich eine Taschenlampe. Ihr Flackern verrät mir, dass sie nicht mehr viel Akku hat. Um sie zu schonen, schalte ich sie aus. ",
      ],
      image:"img/hütte_1.png",
      sound:"sounds/door_sound.mp3",
      hasTimer: false,
      hasLamp:true,
      BatteryLife:5,
      next: [
        { key: "weg_1", label: "Wg hinab"},
        { key: "haus_durchsuchen_1", label: "Haus durchsuchen"}
      ]
      },

   haus_durchsuchen_1: {
      id: "haus_durchsuchen_1",
      text: ["Beim Durchsuchen entdecke ich ein geladenes Gewehr im hinteren Teil des Wohnzimmers. <Für eine solch kleine Hütte hat sie erstaunlich viele Zimmer --  eine Toilette, ein Schlafzimmer, eine Küche und ein Wohnzimmer mit Kamin. Hier lebte bestimmt ein Jäger.>",
        
      ],
      image:"img/durchsucht_haus.png",
      hasTimer: false,
      hasLamp:true,
      hasGun:true,
      BatteryLife:5,

      next: [
        { key: "weg_1", label: "Weg hinab" },
        { key: "kamin_1", label: "Kamin anzünden" }
      ]
      },

   kamin_1: {
      id: "kamin_1",
      text: ["Mithilfe von Streichhölzern und Holz, welche neben dem Kamin liegen, entzünde ich in Rekordzeit ein erleuchtendes Feuer.",
        "<Endlich etwas zum Aufwärmen>",
        "Ich nehme ein altes Buch vom Regal und setze mich zum Lesen. Doch bevor ich lesen kann, nicke ich ein.",
      
      ],
      image:"img/kamin_1.webp",
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:true,
      BatteryLife:5,
      next: [
        { key: "kamin_2", label: "Weiter" }
      ]
      
      },
 kamin_2: {
      id: "kamin_2",
      text: ["Durch mehrfache laute Knalle werde ich aus dem Schlaf gerissen. Ich folge dem Geräusch ins Schlafzimmer und entdecke ein Fenster, das vom Wind auf- und zugeschlagen wird.",
        "Ich fange das Fenster ein und blicke in die Kälte hinaus. ",
        "<Am liebsten würde ich jetzt etwas sehen können.>",
        "<...und hunger habe ich auch."
      ],
      image:"img/kamin_2.png",
      sound:"sounds/window_bang.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,

      next: [
        { key: "kamin_3", label: "Schliesst Fenster" }
  
      ]
      
      },

  

    
 kamin_3: {
      id: "kamin_3",
      text: ["Aufgrund der Kälte schliesse ich das Fenster schnell ab. Ich gähne und reibe mir die Augen.",
        "<Ob die Sonne wohl bald aufgeht?>",
       
      ],
      image:"img/kamin_2.png",
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "schlafen_1", label: "Schlafen" },
        {key: "wach_1", label: "Wachbleiben"}
      ]
      
      },

  schlafen_1: {
      id: "schlafen_1",
      text: ["Kaum lege ich mich neben das kleine Feuer, schlafe ich ein.",
        "...",
        "Auf einmal wache ich auf. Das Feuer ist schon ausgebrannt und der Raum stockdunkel. Nur das Knarren der alten Holzdielen ist zu hören.",
      
        
      ],
      image:"img/schlafen_1.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "schlafen_2", label: "Weiter" },
      ]
        } ,

  schlafen_2: {
      id: "schlafen_2",
      text: [" ",
     
        "Eine Raue Stimme durchbricht die Stille: <Schlaf gut>"
      ],
      image:"img/schlafen_1.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "ziel_tod", label: "Weiter" }
      ]
      },

  schiessen_2: {
      id: "schiessen_2",
      text: ["Im letzten Moment rolle ich zur Seite, greife nach dem Gewehr und drücke ab. Der Mann sackt zusammen und bleibt reglos liegen. Eine rote Lache breitet sich aus."],
      hasTimer: false,
      image:"img/gun.avif",
      sound:"sounds/gun_shot.mp3",
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "messer_1", label: "Weiter" }
      ]
      },



  wach_1: {
      id: "wach_1",
      text: ["Ich setze mich an das Feuer und werfe ein paar Holzscheiten rein.",
        "Plötzlich schreit ein Tier laut auf. "
      ],
      sound:"sounds/animal_sound.mp3",
      image:"img/kamin_1.webp",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "rausgehen_1", label: "Rausgehen" },
        {key: "verbarikadieren_1_1", label: "Verbarikadieren"}
      ]
      },



rausgehen_1: {
      id: "rausgehen_1",
      text: ["In den Wald hinausblickend stehe ich vor der Tür. Doch da die Wolken den Mond verdecken, kann ich nichts erkennen.",
        
      ],
      image:"img/mond.jpg",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "rausgehen_2", label: "Weiter" },
       
      ]
      },

rausgehen_2: {
      id: "rausgehen_2",
      text: ["Schultern zuckend kehre ich in die Hütte zurück.",
     
      ],
      image:"img/kamin_1.webp",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "rausgehen_3", label: "Weiter" }
      ]
      },
rausgehen_3: {
      id: "rausgehen_3",
      text: [
        "Ich gähne und blicke zur schwächer werdenden Flamme. Langsam knarrt die Tür auf. Eine ruhige Männerstimme ertönt: <Hallo! Ist hier wer?>",
      
      ],
      image:"img/kamin_1.webp",
      sound:"sounds/door_sound.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "rausgehen_4", label: "Weiter" }
      ]
      },

rausgehen_4: {
      id: "rausgehen_4",
      text: ["Der Mann sagt: <Ich bin froh, jemanden zu treffen. Ich irre schon seit Stunden umher.> Augen reibend strecke ich die Hand aus, um ihn zu begrüssen. ",
        "Er sieht den Mann fast nicht.",
        "Im nächsten Augenblick blitzt ein Messer auf–"
      ],
      image:"img/knife.jpg",
      sound:"sounds/knife_pull.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "ziel_tod", label: "Weiter" }
      ]
      },
rausgehen_5: {
      id: "rausgehen_5",
      text: ["Ruckartig reisse ich das Gewehr hoch und schiesse. Der rennt um sein Leben. Nur das Loch in der Wand bleibt. Zur Sicherheit verbarrikadiere ich die Tür.",
      ],
      sound:"sounds/running.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_14", label: "Weiter" }
      ]
      },








verbarikadieren_1: {
      id: "verbarikadieren_1",
      text: ["Panisch eile ich in die Hütte und verbarrikadiere die Tür.",
     
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "verbarikadieren_2", label: "Weiter" }
      ]
      },

 verbarikadieren_2: {
      id: "verbarikadieren_2",
      text: ["Während der Nacht rüttelt es mehrmals an der Tür. Doch ich bleibe vor dem Feuer und halte mir die Ohren zu. ",
        "Die ersten Morgenstrahlen brechen an. Ein höfliches Klopfen ertönt. Ein Polizist winkt erleichtert durch das Fenster."
      ],
      image:"img/kamin_1.webp",
      sound:"sounds/door_rattling.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_15", label: "Weiter" }
      ]
      }, 
      
  verbarikadieren_1_1: {
      id: "verbarikadieren_1_1",
      text: ["Der Schrei löst in mir ein mulmiges Gefühl aus und zur Sicherheit verbarrikadiere ich die Tür."
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "verbarikadieren_2", label: "Weiter" }
      ]
      },    




      

  schiessen_1: {
      id: "schiessen_1",
      text: ["Mit knurrendem Magen, drücke ich ab. Das Reh fällt sofort tot um.",
       
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "drinnen_1", label: "Drinnen bleiben" },
         { key: "rausgehen_reh", label: "Rausgehen" }
      ]
      },

    drinnen_1: {
      id: "drinnen_1",
      text: ["Aufgrund der Dunkelheit entschliesse ich mich, auf den Morgen zu warten. Ich schliesse das Fenster und setze mich an den Kamin. Kurz darauf klopft es an der Tür.",
       
      ],
      image:"img/door_inside.png",
      sound:"sounds/window_closing.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "drinnen_2", label: "Öffnen" }
      ]
      },  

    drinnen_2: {
      id: "drinnen_2",
      text: ["Ich öffne die Tür einen Spalt weit. Ein freundlich aussehender Herr blickt mich an. ",
        "Er: <Dürfte ich mich zu ihnen gesellen? Mir frieren bald die Finger ab.> Ich lasse ihn herein.",
      ],
      image:"img/door_inside_open.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "drinnen_3", label: "Weiter" }
      ]
      },  

  drinnen_3: {
      id: "drinnen_3",
      text: ["Er: <Ich habe es beim Hochlaufen schon gesehen. Leider verlor ich Sie aus den Augen und verlief mich… Doch dank des Schusses habe ich hergefunden.>",
        "<Sie waren also derjenige, der mich einholen wollte. Ich dachte schon, ich höre Dinge.>"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "drinnen_4", label: "Weiter" }
      ]
      },  

drinnen_4: {
      id: "drinnen_4",
      text: ["Er: <Könnten Sie mir bitte das Buch dort reichen?>",
        "Als ich mich umdrehe, spüre ich plötzlich einen dumpfen Schlag auf den Kopf."
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "ziel_tod", label: "Weiter" }
      ]
      },  



rausgehen_reh: {
      id: "rausgehen_reh",
      text: ["Ich stampfe durch den Schnee und bleibe vor dem leblosen Reh stehen.",
        "<Puh! Das war das erste Mal, dass ich auf ein Lebewesen schoss.> "
      ],
      sound:"sounds/footsteps_snow.mp3",
      image:"img/dead_deer.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
  
        {key:"hütte_bringen", label:"Vor Hütte bringen"}
      ]
      },  


dort_lassen_2: {
      id: "dort_lassen_2",
      text: ["Das Feuer ist erloschen und der Raum pechschwarz. <Ist hier jemand?> Niemand antwortet.",
      ],
      image:"img/hütte_wohnzimmer_fussspuren.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "dort_lassen_3", label: "Betreten" }
      ]
      },
      
dort_lassen_3: {
      id: "dort_lassen_3",
      text: ["Jede Faser meines Körpers spannt sich an. <Ich weiss, dass jemand hier ist!>",
        "Beim Eintreten höre ich ein Platschen unter meinem Fuss. <…Die Pfütze war vorher noch nicht da…>",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "toilette_1", label: "Toilette nachschauen" },
        { key: "toilette_1", label: "Küche nachschauen" },
        { key: "schlafzimmer", label: "Schlafzimmer nachschauen" }
      ]
      },

schlafzimmer: {
      id: "schlafzimmer",
      text: ["Kaum öffne ich die Tür sehe ich eine fremde Gestalt. Ich knalle die Tür zu und verbarrikadiere sie mit dem danebenstehenden Regal.",
  
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "wehren_2", label: "Weiter" }
      ]
      },


toilette_1: {
      id: "toilette_1",
      text: ["Nichts zu sehen… ",
        "…Im Wohnzimmer knarzen die Dielen…",
        "…Schnelle Schritte!"
      
      ],
      hasTimer: true,
      timerTime: 9000,
      timerKey: "ziel_tod",
      startTimerBeforeText: true,
      textDelay: 3000,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "wehren_1", label: "Wehren" }
      ]
      },

wehren_1: {
      id: "wehren_1",
      text: ["Als ich mit dem Gewehrlauf ins Dunkle schlage treffe ich etwas. Nachdem sich meine Augen angepasst haben, blicke ich auf eine ohnmächtige Gestalt mit einem Messer.",
        "Eilig fessle ich ihn mit einem Vorhang und sperre ihn, mithilfe des Regals unter der Türklinke, im Schlafzimmer ein.",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "wehren_2", label: "Weiter" }
      ]
      },


wehren_2: {
      id: "wehren_2",
      text: ["Mein ganzer Körper zittert.",
        "Ich höre, wie er aufwacht.",
        "Eine raue Stimme von der anderen Seite spricht: <Hey, lass mich raus! Ich war nur auf der Hut, da ich einen Schuss hörte.> ",
        "<Tut mir ja leid, aber ich werde dich vorerst nicht rauslassen.>",
        "Wutentbrannt schreit er: <Lass mich sofort raus! Rauslassen habe ich gesagt!> Die Tür poltert mehrmals heftig, doch trotz des alten Aussehens gibt sie nicht nach. Ich weiss nicht mehr, wie lange es gedauert hat, doch als der Morgen anbricht, war er still."
      ],
      sound:"sounds/door_rattling.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_18", label: "Weiter" }
      ]
      },

  hütte_bringen: {
      id: "gütte_bringen",
      text: ["<Tut mir leid, aber der Hunger ist zu gross.>",
        "Ich greife es am Hinterbein und schleife es durch den Schnee."
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "dort_lassen_1", label: "Weiter" }
      ]
      },
  
 dort_lassen_1: {
      id: "dort_lassen_1",
      text: ["Vor der Hütte erkenne ich Abdrücke von fremdem Schuhprofil, welche in die Hütte führen. Ich lasse das Reh schockiert los.",
      ],
      image:"img/hütte_wohnzimmer.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "dort_lassen_2", label: "Weiter" }
      ]
      },   

  wohnzimmer_mann: {
      id: "wohnzimmer_mann",
      text: ["Der Mann zuckt zusammen und quietscht: <Bitte nicht schiessen. Ich habe mich verlaufen und friere fürchterlich. Lass mich bitte bleiben.>"],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "wegschicken_1", label: "Wegschicken" },
        {key:"bleiben_lassen_1", label:"Bleiben lassen"}
      ]
      },

  wegschicken_1: {
      id: "wegschicken_1",
      text: ["<Tut mir leid, ich traue dir nicht. Hier, nimm die Taschenlampe. Bleibe einfach auf dem Weg, dann bist du bald im Dorf.>",
      ],
      image:"img/lamp.png",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "wegschicken_2", label: "Weiter" }
      ]
      },

  wegschicken_2: {
      id: "wegschicken_2",
      text: ["Als der Mann die Hütte verlässt, verbarrikadiere ich sicherheitshalber Tür und Fenster.",
        "In der Nacht sehe ich Licht durchs Fenster und höre ich, wie jemand um die Hütte schleicht.",
        "Ich bleibe wach, bis der Morgen anbricht. "
      ],
      image:"img/door_inside.png",
      sound:"sounds/verbarikadieren.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_19", label: "Weiter" }
      ]
      },

   bleiben_lassen_1: {
      id: "bleiben_lassen_1",
      text: ["Der Mann spricht: <Vielen Dank! Mein Name ist übrigens Mark.>",
        "Wir entzünden das Feuer.",
        "Der Mark fragt: <Ich darf doch sicher hier beim Feuer schlafen, oder? >"
      ],
      image:"img/kamin_1.webp",
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "erlauben", label: "Erlauben" },
        {key:"anderes_zimmer_1", label:"In ein anderes Zimmer schicken"}
      ]
      },

      erlauben: {
      id: "erlauben",
      text: ["Ich versuche wach zu bleiben, doch aufgrund des warmen Feuers und des schlafenden Mannes, entspanne ich mich langsam und nicke ein. Plötzlich verspüre ich, wie etwas Scharfes meinen Hals berührt– "],
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "ziel_tod", label: "Weiter" }
      ]
      },


      anderes_zimmer_1: {
      id: "anderes_zimmer_1",
      text: ["Ich erinnere mich, dass die Schlafzimmertür laut knarrt.",
        "<Tut mir leid Mark, aber mir wäre es wohler, wenn du im Schlafzimmer schläfst.>"
      ],
      sound:"sounds/door_sound.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "anderes_zimmer_2", label: "Weiter" }
      ]
      },

      anderes_zimmer_2: {
      id: "erlauben",
      text: ["Nach einiger Zeit, höre ich den Mark im Schlafzimmer mehrmals niesen."],
      sound:"sounds/sneeze.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "mann_schauen_1", label: "Nach Mark schauen" },
        {key:"versuchen_schlafen", label:"Versuchen zu schlafen"}
      ]
      },

      mann_schauen_1: {
      id: "mann_schauen_1",
      text: ["Mich plagt ein schlechtes Gewissen. Als ich die Tür öffne und Licht vom Kamin reinscheint, erstarrt der Mann erschrocken mit einem Messer in der Hand.",
        "Schnell knalle ich die Tür zu und verbarrikadiere sie mit dem danebenstehenden Regal.",
        "Mein Herz pocht wie wild und es läuft mir kalt den Rücken runter, als er mich bittet die Tür zu öffnen. In dieser Verfassung bleibe ich, bis der Morgen anbricht.",
      ],
      image:"img/knife.jpg",
      sound:"sounds/heartbeat.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_21", label: "Weiter" }
      ]
      },


 versuchen_schlafen: {
      id: "versuchen_schlafen",
      text: ["Langsames Knarzen weckt mich aus dem Halbschlaf.",
        " Das Feuer ist zu Glut geworden.",
        " Nur Silhouetten sind zu erkennen.",
        "<Ist etwas? Ich kann dich fast nicht sehen…>",
      
      ],
      image:"img/kamin_erloschen.png",
      sound:"sounds/running.mp3",
      hasTimer: true,
      timerTime: 12000,
      timerKey: "versuchen_schlafen_2",
      startTimerBeforeText: true,
      textDelay: 6000,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
      ]
      },
versuchen_schlafen_2: {
      id: "versuchen_schlafen_2",
      text: ["Ich höre vier schnelle, hämmernde Schritte, und bevor ich reagieren kann, schlägt mein Kopf, mit stechenden Schmerzen in der Brust, auf dem Boden auf.",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "ziel_tod", label: "Weiter" }
        
      ]
      },
  buch_1: {
      id: "buch_1",
      text: ["Irgendwas war merkwürdig… ",
        "Lesen ohne Licht?",
        "Aus Unwohlsein verbarrikadiere ich seine Tür.",
        "Überrascht fragt er: <Hast du mich eingeschlossen? Mach bitte die Tür wieder auf.>",
        "<Entschuldige, ich lasse dich morgen wieder raus.>"
      ],
      image:"img/buch.jpg",
      sound:"sounds/verbarikadieren.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_23", label: "Weiter" }
      ]
      }, 





messer_1: {
      id: "messer_1",
      text: ["Es vergehen einige Minuten oder Stunden, in denen ich zusammengekauert in der dunkelsten Ecke des Zimmers verkrieche. Ab und zu blicke ich zitternd zu dem nun, von den ersten Sonnenstrahlen beleuchteten, Körper.",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "Ziel_12", label: "Weiter" }
        
      ]
      },


    Ziel_2: {
      id: "Ziel_2",
      text: ["Ich blicke auf den bewusstlosen Mann hinunter. Als mir bewusst wird, was passiert ist, renne ich schnell ins Dorf hinunter, um Hilfe zu holen. Kurz vor dem Dorf kommen mir Polizisten mit Hunden entgegen. Sie suchen nach mir, da ich als vermisst gemeldet wurde. Schwer keuchend führe ich sie zum Ort des Geschehens, doch selbst nach stundenlangem Suchen bleiben meine Fussabdrücke die einzigen, die im Tiefschnee zu finden sind."],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },

     Ziel_3: {
      id: "Ziel_3",
      text: ["	<Ha! Es will mir wieder jemand meine schöne Aussicht stehlen! Jetzt, da jemand gerufen hat, ist bestätigt, dass ich es mir nicht eingebildet habe.> Selbstsicher, ohne mich umzudrehen, beschleunige ich. Dieses Mal höre ich das Keuchen hinter mir viel deutlicher. Eine Gruppe Polizisten kommt mir entgegen.",
        "	<Herr Meier, wir haben Sie schon gesucht.>",
        "<Meinen Verfolger sucht ihr bestimmt auch.> Ich drehe mich um und blicke auf einen völlig leeren Weg."
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },
    Ziel_5: {
      id: "Ziel_5",
      text: ["	Panisch, von dem was geschehen ist, renne ich Richtung Dorf. Eine Gruppe Polizisten eilt mir entgegen.",
        "	<Was war das? Was ist passiert?>",
        "	Mir steht der blanke Horror ins Gesicht geschrieben.",
        "	<I‑Ich habe jemanden erschossen!>",
        "	Während ich verhaftet werde, gehen einige Beamte nachschauen. Kopfschüttelnd kehren sie zurück.",
        "	<Herr Meier, ich denke, Sie sollten Dr. Neumann diese Geschichte erzählen.>"
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },
     Ziel_5: {
      id: "Ziel_5",
      text: ["	Panisch, von dem was geschehen ist, renne ich Richtung Dorf. Eine Gruppe Polizisten eilt mir entgegen.",
        "	<Was war das? Was ist passiert?>",
        "	Mir steht der blanke Horror ins Gesicht geschrieben.",
        "	<I‑Ich habe jemanden erschossen!>",
        "	Während ich verhaftet werde, gehen einige Beamte nachschauen. Kopfschüttelnd kehren sie zurück.",
        "	<Herr Meier, ich denke, Sie sollten Dr. Neumann diese Geschichte erzählen.>"
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },
    ziel_tod: {
      id: "ziel_tod",
      text: ["Der Mann tötet dich"],
      image:"img/knife.jpg",
      sound:"sounds/knife_stab.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },
  
      



   Ziel_12: {
      id: "Ziel_12",
      text: ["Ich laufe in grossem Bogen um die Leiche zur Tür und öffne sie einen Spalt.",
        "Ein Polizist mit freundlichem und erleichtertem Gesicht schaut von einem Foto auf und offenbart: <Herr Meier, wir haben Sie gesucht. Es wurde eine Vermisstenmeldung aufgegeben.>",
        "<Herr Polizist, es ist etwas Schreckliches passiert! Sehen Sie–> Als ich mich umdrehe, erblicke ich nur den staubigen, leeren Holzboden."
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },

     Ziel_14: {
      id: "Ziel_14",
      text: ["Die ersten Morgenstrahlen brechen an. Ein höfliches Klopfen ertönt. Ein Polizist winkt erleichtert durch das Fenster. Ich öffne die Tür. Zwei Polizisten kommen herein. Sie bemerken das Gewehr und das Loch in der Wand sofort.",
        "<Herr Meier, geht es Ihnen gut? Was ist passiert>",
        "<Sie müssen ihn suchen, da war ein Mann mit einem Messer!>",
        "Die Polizisten schmunzeln.",
        "<Keine Sorge, wir werden ihn schnappen.>"
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },


   

     Ziel_15: {
      id: "Ziel_15",
      text: ["	Ich öffne die Tür. Zwei Polizisten kommen herein.",
        "	<Guten Tag, Herr Meier. Sie wurden als vermisst gemeldet. Wir sind hier, um Sie abzuholen.>",
        "	<Das trifft sich gut. Die Tiere hier klingen fürchterlich.>",
        "Gemeinsam beginnen wir friedlich unseren Abstieg.",
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },



    Ziel_18: {
      id: "Ziel_18",
      text: ["		Ein paar Polizisten klopfen an und treten ein. <Herr Meier? Sie wurden als vermisst gemeldet. Geht es Ihnen gut?> <Sie kommen gerade richtig, in diesem Zimmer dort ist ein Verrückter.> Ein Polizist öffnet die Schlafzimmertür. Es ist leer. Ich betrete verdattert das Zimmer. <Wie kann das sein?>",
        "Der Polizist spricht beruhigend: <Keine Sorge, ich weiss Bescheid. Wegen dem Verrückten sind wir ja hier.>",
        
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },

    Ziel_19: {
      id: "Ziel_19",
      text: ["Ein lautes Klopfen reisst mich aus den Gedanken. Ein Polizist schaut erleichtert durch ein Fenster herein. Ich öffne die Tür und gehe raus. <Guten Tag, wir sind hier, um Sie abzuholen. Sie wurden als vermisst gemeldet. Zum Glück fiel nicht viel Schnee. Ihre Skispuren waren auch die einzigen, so konnten wir Sie schnell finden.> <Guten Morgen. … Es waren die einzigen Spuren?>",
               
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },

    Ziel_21: {
      id: "Ziel_21",
      text: ["Ein paar Polizisten kommen herein. Der vorderste schaut von einem Foto auf und sagt erleichtert <Herr Meier, wir haben Sie schon gesucht. Wie geht es Ihnen?> <Sie kommen genau richtig. In diesem Zimmer ist ein Mann mit einem Messer. Ich habe ihn sicherheitshalber eingesperrt.> Ein Polizist öffnet vorsichtig die Tür und sagt: <Aber Herr Meier, hier ist doch gar niemand.>",
               
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },
    Ziel_23: {
      id: "Ziel_23",
      text: ["Nach einiger Zeit geht die Sonne auf. Eine Gruppe Polizisten kommt herein. <Guten Tag Herr Meier, Sie wurden als vermisst gemeldet, da Sie gestern nicht zurück in die Einrichtung kamen.> <Bitte entschuldigen Sie die Umstände.> <Mark, die Polizei ist hier, um uns abzuholen.> Ich öffne die Tür, doch sehe nichts weiter als ein leeres Bett.",
               
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        {key:"ende", label:"Spiel beenden"}
      ]
      },

    ende: {
      id: "ende",
      text: [
        "CREDITS",
        "Der Langläufer",
        "",
        "Entwickelt von",
        "Thayab Irshad & Samuel Aregger",
        "",
        "Geschichte",
        "Inspiriert von der Kurzgeschichte „Der Langläufer“ von Franz Hohler.",
        "",
        "Programmierung",
        "Thayab Irshad & Samuel Aregger",
        "",
        "Grafik und Design",
        "Thayab Irshad",
        "",
        "Story",
        "Samuel Aregger",
        "",
        "Sound",
        "Verwendete Sounds aus lizenzfreien Quellen.",
        "",
        "Besonderer Dank",
        "Vielen Dank fürs Spielen!",
        "",
        "Ende",

        "Zum nochmal spielen drücke Ctrl+R"
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
  
      },

  }
;
 
 // timer & schiessen fragen 

/**
 * Diese Funktion zeigt den Text normal an, ohne Type-Writer Effekt.
 */
async function displayTextNormally(text, isLastText) {
    const p = document.createElement("p");
    p.innerText = text;
    textContainer.appendChild(p);

    // Falls der letzte Textabschnitt erreicht ist, ...
    if (isLastText) {
        return;
    }

    const placeHolder = document.createElement("p");
    placeHolder.innerText = "...";
    textContainer.appendChild(placeHolder);

    return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          placeHolder.remove();
        }, textDelay);
    });
}


/**
 * Diese Funktion wird als Type-Writer Effekt verwendet
 * Wir 
 * @param {*} text: Der Text der geschrieben wird
 * @return Promise: Ein "Verpsrechen", dass diese Funktion auch einmal "Fertig sein wird". Dort wo sie aber ausgeführt wird, soll auf 
 * die Funktion "gewartet" werden.
 */
function displayTextWithTypeWriter(text){

    return new Promise((resolve) => {

        // Neues Text-Element wird zum Phone hinzugefügt
        let newTextElement = document.createElement("p");

        // Das Element kommt in das Phone-Display
        textContainer.appendChild(newTextElement);

        // Diese Variable speichert den aktuellen Buchstaben (wir starten mit dem Buchstaben 0)
        let charIdx = 0;

        // Wir definieren eine Funktion, die den nächsten Buchstaben zum Text hinzugefügt wird
        function typeNextChar() {
            if (charIdx < text.length) {
                // Neuer Buchstabe wird hinzugefügt
                newTextElement.textContent += text.charAt(charIdx);
                // Buchstabennummer erhöhen
                charIdx++;
                // Nach 50 MS wird die Funktion wieder ausgeführt.
                setTimeout(typeNextChar, typeWriterSpeed); 
            } else {
                // Falls kein Buchstabe mehr vorhanden ist, wird das "Versprechen" erfüllt und die Funktion ist "beendet"
                resolve(); 
            }
        }

        // Die Funktion muss ausgeführt werden.
        typeNextChar();
    });
}

function startCreditsScroll() {
  if (!textContainer) return;
  textContainer.scrollTop = 0;
  creditsScrollInterval = setInterval(() => {
    if (!textContainer.classList.contains("credits-mode")) {
      clearInterval(creditsScrollInterval);
      creditsScrollInterval = null;
      return;
    }
    textContainer.scrollTop += 1;
  }, 50);
}

/**
 * Jede Story hat unter "next" mehrere Entscheidungen, die der Benutzer treffen kann.
 * Diese Funktion zeigt die Buttons für diese Entscheidungen an.
 * Bsp.: [{key: "bahnhof", label: "Weiter"}]
 * 
 * -> Ein Button mit dem Text "Weiter" wird angezeigt. 
 * Wenn der Benutzer darauf klickt, wird die Story mit dem Key "bahnhof" geladen.
 * 
 * Bsp.: [{key: "berg", label: "Auf den Berg"}, {key: "see", label: "Zum See"}]
 * 
 * -> Zwei Buttons mit den Texten "Auf den Berg" und "Zum See" werden angezeigt. 
 * Wenn der Benutzer aus "Auf den Berg" klickt, wird die Story mit dem Key "berg" geladen.
 * @param {*} buttonList 
 */
function displayDecisionButtons(buttonList){
  
    console.log("DisplayDecisionButtons wurde ausgeführt")
    // Alle Buttons sollen angezeigt werden
    for(const button of buttonList){

        // Neuer Button mit dem Label wird erstellt
        let newButton = document.createElement("button");
        newButton.textContent = button.label;

        // Die Funktion, die ausgeführt wird, wenn der Button geklickt wird 
        newButton.addEventListener("click", function(){
            playSound("sounds/click_effect.mp3");
            // Der nächste Story-Punkt wird geladen
            nextStory(button.key);
        });

        buttonsAndInputs.appendChild(newButton);
    }
}

/**
 * Diese Funktion wird verwendet um eine Eingabe anzuzeigen
 * @param {*} inputConfig 
 */
function showInput(inputConfig){

    // Neues Input-Element wird erstellt
    let inputElement = document.createElement("input");
    inputElement.type = inputConfig.type;
    inputElement.placeholder = inputConfig.label;
    buttonsAndInputs.appendChild(inputElement);

    // Neuer Button zum Absenden der Eingabe
    let submitButton = document.createElement("button");
    submitButton.textContent = "Absenden";
    buttonsAndInputs.appendChild(submitButton);

    // Der EventLIstener auf dem Button, der geklickt wird wenn die Eingabe abgeschickt wird
    submitButton.addEventListener("click", function(){
        playSound("sounds/click_effect.mp3");
        const userInput = inputElement.value;
        if (userInput.toLowerCase() === inputConfig.answer.toLowerCase()) {
            alert("Die Antwort " + userInput + " ist richtig! :)")
            nextStory(inputConfig.successKey);  
        } else {
            nextStory(inputConfig.failureKey);    
        } 

    });
}

/**
 * Diese Funktion zeigt einen Timer an, der herunterzählt. 
 * Wenn der Timer abläuft, ohne dass der Benutzer eine Entscheidung trifft, verliert er das Spiel.
 */
function displayTimer(duration = timerTime, timeoutKey = "verloren"){
    const timerBar = document.createElement("div");
    timerBar.classList.add("timer-bar");
    timerContainer.appendChild(timerBar);

    timerBar.style.animation = `countdown ${duration/1000}s linear forwards`;

    timerVariable = setTimeout(() => {
      timerBar.remove();
      if (currentStoryKey === "umdrehen_2") {
        if (hasGun && gunShots > 0) {
          gunShots--;
          pendingStoryText = ["Du schiesst und Mann stirbt."];
          nextStory("Ziel_3");
        } else {
          pendingStoryText = ["Du hast keine Waffe. Du bist machtlos."];
          nextStory("ziel_tod");
        }
      } else {
        nextStory(timeoutKey);
      }
    }, duration); 
}

/**
 * Diese Funktion lädt den nächsten Story-Punkt
 * @param {*} key Der Key des nächsten Story-Punkts
 */
async function nextStory(key) {   
  currentStoryKey = key;
  const runId = ++storyRunId;
    // In der Variable "node" wird der aktuelle Story-Punkt gespeichert, damit wir einfacher darauf zugreifen können.
    // Bsp: key = "bahnhof" -> node = story["bahnhof"] -> node.text, node.image, node.next, etc. werden vom Bahnhof geladen
    const node = story[key];

    // Hier werden alle HTML-Elemnte zurückgesetzt, damit der neue Story-Punkt geladen werden kann.
    // Text und Entscheidungs-Container sollen leer sein
    textContainer.innerHTML = "";
    buttonsAndInputs.innerHTML = "";
    timerContainer.innerHTML = "";
    clearTimeout(timerVariable);

    if (node.sound) {
        playSound(node.sound);
    }

    // Titel und Start-Button nur in der Einleitung anzeigen
    const header = document.getElementById("header");
    if (header) header.style.display = (node.id === "introduction") ? "" : "none";

    const startHolder = document.getElementById("start-button-holder");
    if (startHolder) startHolder.style.display = (node.id === "introduction") ? "" : "none";


    // 1. Bild anzeigen
    if (node.image){
        imageHolder.style.opacity = 0;       

        // Animation um Bild einblenden zu lassen
        setTimeout(() => {
            imageHolder.src = node.image;             
            imageHolder.style.opacity = 1; 
        }, 300); 
    } else {
        imageHolder.src = "";
    }

    if (node.hasTimer && node.startTimerBeforeText) {
        displayTimer(node.timerTime || timerTime, node.timerKey || "verloren");
    }

    // 2. Text schreiben
    const nodeText = pendingStoryText.concat(node.text);
    pendingStoryText = [];
    const previousTextDelay = textDelay;
    if (node.textDelay !== undefined) {
        textDelay = node.textDelay;
    }

    for (let textIdx in nodeText) {
        const text = nodeText[textIdx];
        if(useTypeWriterEffect){
            await displayTextWithTypeWriter(text);
            if (textIdx != nodeText.length-1) {
                await new Promise((resolve) => setTimeout(resolve, textDelay));
            }
        } else {
            await displayTextNormally(text, textIdx == nodeText.length-1);
        }

        if (runId !== storyRunId) {
            textDelay = previousTextDelay;
            return;
        }
    }
    textDelay = previousTextDelay;

    if (creditsScrollInterval) {
      clearInterval(creditsScrollInterval);
      creditsScrollInterval = null;
    }

    if (node.id === "ende") {
      textContainer.classList.add("credits-mode");
      startCreditsScroll();
    } else {
      textContainer.classList.remove("credits-mode");
    }

    // Falls dieser Knoten eine Lampe bereitstellt, merken wir uns, dass der Spieler eine Lampe hat
    if (node.hasLamp) {
      hasLamp = true;
    }

    // Lampen-Button wird angezeigt, sobald der Spieler die Lampe besitzt
    if (hasLamp) {
      if (lampButton) {
        lampButton.style.display = "flex";
        const batterySpan = document.getElementById("battery-count");
        if (batterySpan) batterySpan.innerText = BatteryLife;
        lampButton.disabled = BatteryLife <= 0;
        // Listener nur einmal anhängen, wenn noch nicht angehängt
        if (!lampHandlerAttached) {
          lampButton.addEventListener("click", lampClickHandler);
          lampHandlerAttached = true;
        }
      }
    } else {
      // Verstecke Lampen-Button, bis man eine Lampe hat
      if (lampButton) lampButton.style.display = "none";
    }

    // Falls dieser Knoten ein Gewehr bereitstellt, speichern wir es
    if (node.hasGun) {
      hasGun = true;
    }

    // Gewehr-Button anzeigen, wenn man ein Gewehr hat (bleibt dann sichtbar)
    if (hasGun) {
      if (gunButton) {
        gunButton.style.display = "flex";
        // Button ist nur aktivierbar, wenn an diesem Ort verwendbar, noch Schüsse vorhanden sind und der Spieler hier noch nicht geschossen hat
        gunButton.disabled = !(node.canUseGun === true) || gunShots <= 0 || gunUsedStoryKeys.has(currentStoryKey) || (currentStoryKey === "kamin_2" && !kamin2LampUsed) || (currentStoryKey === "rausgehen_3" && !rausgehen3LampUsed);
        // Listener nur einmal anhängen, wenn noch nicht angehängt
        if (!gunHandlerAttached) {
          gunButton.addEventListener("click", gunClickHandler);
          gunHandlerAttached = true;
        }
        if (node.id === "ende") {
          gunButton.style.display = "none";
        }
      }
    } else {
      // Verstecke Gewehr-Button, bis man ein Gewehr hat
      if (gunButton) gunButton.style.display = "none";
    }

    // 3. Benutzereingabe?
    if (node.input) {
        showInput(node.input);
    }

    // 4. Normale Entscheidungen anzeigen
    if (node.next) {
        displayDecisionButtons(node.next);
    }

    // Timer starten, falls dieser Knoten einen Timer nutzt
    if (node.hasTimer && !node.startTimerBeforeText) {
        displayTimer(node.timerTime || timerTime, node.timerKey || "verloren");
    }
}



/**
 * Diese Funktion wird zum Start ausgeführt
 */
startButton.addEventListener("click", function(){

    console.log("STARTBUTTON KLICK WURDE AUSGEFÜHRT")
  // Zum nächsten Story-Punkt wechseln
  nextStory("start_1");

});


    // Die Lampe wird beim Betreten eines Knotens mit hasLamp aktiviert (Listener wird dort angebracht)






nextStory("introduction");
// bei nextStory ("introduction fur am start zu beginnen")
