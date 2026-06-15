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

  if (currentStoryKey === "rausgehen_1") {
    pendingStoryText = ["In rotem Schnee liegt ein totes Reh mit Schnittwunden."];
    nextStory("verbarikadieren_1");
    return;

  
  }
  if (currentStoryKey === "rausgehen_4") {
    pendingStoryText = ["sieht Mann voll mit blutigen Kleidern und Messer"];
    nextStory("ziel");
    return;
  

  
  }
  if (currentStoryKey === "dort_lassen_3") {
    pendingStoryText=["Eine nasse Spur führt ins Schlafzimmer",
      "Als ich die Spuren zum Schlafzimmer sehe, verbarrikadiere ich schnell die Tür mit dem Regal",
    playSound("sounds/verbarikadieren.mp3")
    ],
    
    nextStory("wehren_2");
    return;
  }

   if (currentStoryKey === "dort_lassen_2") {
    pendingStoryText = ["Ein überrascht aussehender Mann steht im Wohnzimmer."];
    nextStory("wohnzimmer_mann");
    return;
  }

     if (currentStoryKey === "versuchen_schlafen") {
    pendingStoryText = ["Mark steckt seine rechte Hand schnell hinter den Rücken und sagt: <Ich wollte mir nur ein Buch holen> Er nimmt ein Buch und geht zurück mit einem <Gute Nacht>."];
    nextStory("buch_1");
    return;
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


  if (BatteryLife <= 0) lampButton.disabled = true;
}

function gunClickHandler() {
  if (!hasGun) return;

  playSound("sounds/gun_shot.mp3");

  if (gunShots <= 0) {
    alert("Du hast keine Schüsse mehr!");
    return;
  }

  gunShots--;

  if (currentStoryKey === "kamin_2") {
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
        "Obwohl er immer müder wurde, lief er weiter. Mit jedem Meter schien der unbekannte Läufer näher zu kommen. Manchmal glaubte er sogar, dessen Atem hinter sich zu hören. Er wagte es nicht, sich umzudrehen. In seinem Kopf gab es keinen Zweifel daran, dass dort jemand war und nur auf den richtigen Moment wartete, um ihn zu überholen und seine Aussicht rauben will.",
        "Das Geräusch hinter ihm schien immer näher zu kommen. Er war überzeugt, dass sein Verfolger nur wenige Schritte entfernt war, und sammelte seine letzten Kräfte, um vor ihm zu bleiben. Als er schließlich die Alphütte erreichte, die er sich als Ziel gesetzt hatte, blieb er stehen und drehte sich um",
        "Doch hinter ihm war niemand. Als er realisierte, dass sein Verfolger nie existiert hatte übermannten ihn Erschöpfung und Verwirrung. Dann verließen ihn seine Kräfte und er sank bewusstlos in den Schnee."

      ],
      image:"img/hütte_draussen.jpg",
      hasTimer: false,
      hasLamp:false,
  
      
    },
  
    
  
    start_1: {
      id: "start_1",
      text: ["Geräusch; Als ich mein Bewusstsein langsam wiedererlange finde ich mich in einer Pechschwarzen Welt wieder. ",
        "Erst als der hellstrahlende Vollmond hinter den Wolken hervortritt erkenne ich die Alphütte. Von Lebewesen keine Spur.",
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
      text: ["Ich versuche aufzustehen, die alten Langlaufskier an meinen Beinen erschwerten dies, so dass ich die klemmende Bindung mit dem anderen Ski nervös auftrat. Sie brach. ",
        "<Scheisse!> ",
        "Nach dem ich den zweiten Ski ausgezogen habe. Stehe ich auf und klopfe mir den Schnee ab."
        
      ],
      image:"img/mond.jpg",
      hasTimer: false,
      hasLamp:false,
      image: "img/wacht_auf.png",
      next: [
        { key: "weg_1", label: "Weg hinab" },
        { key: "hütte_1", label: "zur Alphütte" }
      ]
    },




    weg_1: {
      id: "weg_1",
      text: ["Die kaputten Skier im Schnee liegengelassen, gehe ich den, vom Mondlicht, schwach beleuchteten Weg zurück. "
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
      text: ["Nach einem längeren Marsch, erreiche ich kann gerade noch die Umrisse eines Wegweisers sehen, doch wegen dem Dickicht der Bäume dringt kaum noch Licht hindurch. Die Schrift ist nicht mehr zu erkennen. <Welcher Weg war es nochmals? Ich kann mich nicht mehr erinnern… Links? Obwohl. Rechts sieht auch gut aus…>"
      ],
      image: "img/weg_2.png",
      sound: "sounds/footsteps_snow.mp3",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "links_1", label: "Links." },
        { key: "rechts_1", label: "Rechts." },
        { key: "hütte_1", label: "zur Hütte." }
      ]
    },
 
    links_1: {
      id: "links_1",
      text: ["bekannter weg, erreicht Hütte"
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "links_2", label: "Weiter" }
      ]
    },
 
    links_2: {
      id: "links_2",
      text: ["Dreht sich um, \"wer ist da\" "],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "hinab_1", label: "Weiter hinab" },
        { key: "geräusch_1", label: "Geräusch folgen" }
      ]
    },
 
    hinab_1: {
      id: "hinab_1",
      text: ["hört schnelle Schritte und halt hinter sich."
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "ziel", label: "Wegrennen" },
        { key: "umdrehen_1", label: "Umdrehen" }
      ]
    },
      
    umdrehen_1: {
      id: "umdrehen_1",
      text: ["sieht mann. Beschleunigt",
        "...ist wütend...",
        "...hält Messer..."
        
      ],
      hasTimer: true,
      hasLamp: false,
      next: [
        { key: "ziel_tod_2", label: "weiter" }
      ]
    },

    geräusch_1: {
      id: "geräusch_1",
      text: ["will herausfinden was ihm die ganze zeit verfolgt. Bleibt stehen"
    
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_2", label: "weiter" }
      ]
    },

    geräusch_2: {
      id: "geräusch_2",
      text: ["erreicht Höhle"
        
        
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_weg_1", label: "Weg gehen" },
        {key: "geräusch_betreten_1", label: "betreten"}
      ],
      },

    geräusch_weg_1: {
      id: "geräusch_weg_1",
      text: ["sieht wieder Wegweiser",
        "...geht links..."
       
        
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_weg_2", label: "links" }
      ],
    },
    geräusch_weg_2: {
      id: "geräusch_weg_2",
      text: ["erreicht untere Hütte"
        
        
      ],
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "geräusch_weg_3", label: "weiter hinab" },
      ],
      },
      
 geräusch_weg_3: {
      id: "geräusch_weg_3",
      text: ["lauft runter. sieht licht dorf. hört <<Halt>>" ]
      ,
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "ziel_5", label: "wegrennen" },
        {key: "geräusch_umdrehen_1", label:"umdrehen"}
      ],
      },


    geräusch_umdrehen_1: {
      id: "geräusch_umdrehen_1",
      text: ["sieht mann. Beschleunigt",
        "...ist wütend...",
        "...hält Messer..."
        
      ],
      image: "img/weihnachtsbaumBild.jpg",
      hasTimer: true,
      hasLamp: false,
      next: [
         { key: "ziel_tod_8", label: "weiter" }
      ],
      },





































 hütte_1: {
      id: "hütte_1",
      text: ["Ich stelle die Skier gegen die verwitterte Wand der Hütte. Beim, angewohnten, höflichen, doch offensichtlich unnötigem, Anklopfen der Tür geht sie langsam auf. Geduckt betrete ich langsam das Haus.<Hallo, ist jemand Zuhause?",
        "Nachdem die Finsternis nicht geantwortet hat taste ich mich langsam in den Eingang. Auf dem Schrank ertaste ich eine Taschenlampe. Ihr flackern verrät mir, dass sie nicht mehr viel Akku hat. Um sie zu schonen schalte ich sie aus. ",
      ],
      image:"img/hütte_1.png",
      sound:"sounds/door_sound.mp3",
      hasTimer: false,
      hasLamp:true,
      BatteryLife:5,
      next: [
        { key: "weg_1", label: "weg hinab"},
        { key: "haus_durchsuchen_1", label: "Haus durchsuchen"}
      ]
      },

   haus_durchsuchen_1: {
      id: "haus_durchsuchen_1",
      text: ["Beim Durchsuchen entdecke ich ein geladenes Gewehr im hinteren Teil des Wohnzimmers. <Für eine solch kleine Hütte hat sie erstaunlich viele Zimmer --  eine Toilette, ein Schlafzimmer, eine Küche und ein Wohnzimmer mit Kamin. Hier lebte bestimmt ein Jäger.",
        
      ],
      image:"img/durchsucht_haus.png",
      hasTimer: false,
      hasLamp:true,
      hasGun:true,
      BatteryLife:5,

      next: [
        { key: "weg_1", label: "weg hinab" },
        { key: "kamin_1", label: "Kamin anzünden" }
      ]
      },

   kamin_1: {
      id: "kamin_1",
      text: ["Mithilfe von Streichhölzer und Holz, welche neben dem Kamin liegen, entzünde ich in Rekordzeit ein erleuchtendes Feuer.",
        "<Endlich etwas zum Aufwärmen>Ich nehme ein altes Buch vom Regal und setze mich zum Lesen. Doch bevor ich lesen kann nicke ich ein.",
      
      ],
      image:"img/kamin_1.webp",
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:true,
      BatteryLife:5,
      next: [
        { key: "kamin_2", label: "weiter" }
      ]
      
      },
 kamin_2: {
      id: "kamin_2",
      text: ["Durch mehrfache laute Knalle werde ich aus dem Schlaf gerissen.Ich folge dem Geräusch ins Schlafzimmer und entdecke ein Fenster, das vom Wind auf und zu geschlagen wird.",
        "Ich fange das Fenster ein und blicke in die Kälte hinaus. ",
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
        "<Ob die Sonne wohl bald auf geht?>",
       
      ],
      image:"img/kamin_2.png",
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "schlafen_1", label: "schlafen" },
        {key: "wach_1", label: "wach bleiben"}
      ]
      
      },

  schlafen_1: {
      id: "schlafen_1",
      text: ["Kaum lege ich mich neben das kleine Feuer, schlafe ich ein.",
        "Auf einmal wache ich auf. Das Feuer ist schon ausgebrannt und der Raum Stockdunkel. Nur das knarren der alten Holzdielen ist zu hören.",
        
      ],
      image:"img/schlafen_1.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "schlafen_2", label: "weiter" },
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
        { key: "Ziel_11", label: "weiter" }
      ]
      },

  schiessen_2: {
      id: "schiessen_2",
      text: ["Im letzten Moment rolle ich zur Seite, greife nach dem Gewehr und drücke ab.Der Mann sackt zusammen und bleibt reglos liegen. Eine rote Lache breitet sich aus."],
      hasTimer: false,
      image:"image/guy.avif",
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
        { key: "rausgehen_1", label: "rausgehen" },
        {key: "verbarikadieren_1_1", label: "verbarikadieren"}
      ]
      },



rausgehen_1: {
      id: "rausgehen_1",
      text: ["In den Wald hinausblickend stehe ich vor der Tür. Doch da die Wolken den Mond verdecken kann ich nichts erkennen.",
        
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "rausgehen_2", label: "weiter" },
        {key: "verbarikadieren_1", label: "verbarikadieren"}
      ]
      },

rausgehen_2: {
      id: "rausgehen_2",
      text: ["Schultern zuckend kehre ich in die Hütte zurück.",
     
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "rausgehen_3", label: "weiter" }
      ]
      },
rausgehen_3: {
      id: "rausgehen_3",
      text: ["er wird müde",
        "Ich gähne und blicke zur schwächer werdenden Flamme.Langsam knarrt die Tür auf.Eine ruhige Männerstimme ertönt: <Hallo! Ist hier wer?",
      
      ],
      sound:"sounds/door_sound.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "rausgehen_4", label: "weiter" }
      ]
      },

rausgehen_4: {
      id: "rausgehen_4",
      text: ["Der Mann sagt: <ich bin froh, jemanden zu treffen. Ich irre schon seit Stunden umher.>Augen reibend strecke ich die Hand aus um ihn zu begrüssen. ",
        "Er sieht den Mann fast nicht",
        "Im nächsten Augenblick blitzt ein Messer auf–"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "ziel_13", label: "weiter" }
      ]
      },
rausgehen_5: {
      id: "rausgehen_5",
      text: ["Ruckartig reisse ich das Gewehr hoch und schiesse.Der rennt um sein Leben. Nur das Loch in der Wand bleibt.Zur Sicherheit verbarrikadiere ich die Tür",
 
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "ziel_14", label: "weiter" }
      ]
      },








verbarikadieren_1: {
      id: "verbarikadieren_1",
      text: ["Panisch eile ich in die Hütte und verbarrikadiere sie.",
     
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "verbarikadieren_2", label: "weiter" }
      ]
      },

 verbarikadieren_2: {
      id: "verbarikadieren_2",
      text: ["Während der Nacht rüttelt es mehrmals an der Tür. Doch ich bleibe vor dem Feuer und halte mir die Ohren zu. ",
        "Die ersten Morgenstrahlen brechen ein. Ein höfliches Klopfen ertönt. Ein Polizist winkt erleichtert durch das Fenster."
      ],
      sound:"sounds/door_rattling.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_15", label: "weiter" }
      ]
      }, 
      
  verbarikadieren_1_1: {
      id: "verbarikadieren_1_1",
      text: ["Der Schrei löst in mir ein mulmiges Gefühl aus und zur Sicherheit verbarrikadiere ich die Tür"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "verbarikadieren_2", label: "weiter" }
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
        { key: "drinnen_1", label: "drinnen bleiben" },
         { key: "rausgehen_reh", label: "rausgehen" }
      ]
      },

    drinnen_1: {
      id: "drinnen_1",
      text: ["Aufgrund der Dunkelheit entschliesse ich mich auf den Morgen zu warten. Ich schliesse das Fenster und setze mich an den Kamin.Kurz darauf klopft es an der Tür.",
       
      ],
      sound:"sounds/window_closing.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "drinnen_2", label: "öffnen" }
      ]
      },  

    drinnen_2: {
      id: "drinnen_2",
      text: ["Ich öffne die Tür einen Spalt weit. Ein freundlich aussehender Herr blickt mich an. ",
        "Er: <Dürfte ich mich zu ihnen gesellen. Mir frieren bald die Finger ab.>Ich lasse ihn herein.",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "drinnen_3", label: "weiter" }
      ]
      },  

  drinnen_3: {
      id: "drinnen_3",
      text: ["Er: <Ich habe beim hochlaufen schon gesehen. Leider verlor Sie aus den Augen und verlief mich… Doch dank dem Schuss habe ich her gefunden.>",
        "<Sie waren also derjenige der mich einholen wollte. Ich dachte schon ich höre Dinge.>"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "drinnen_4", label: "weiter" }
      ]
      },  

drinnen_4: {
      id: "drinnen_4",
      text: ["Er: <Könnten Sie mir bitte das Buch dort reichen?>",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_16", label: "weiter" }
      ]
      },  



rausgehen_reh: {
      id: "rausgehen_reh",
      text: ["Ich stampfe durch den Schnee und bleibe vor dem leblosen Reh stehen.",
        "<Puh! Das war das war das erste Mal, dass ich auf ein Lebewesen schoss.> "
      ],
      sound:"sounds/footsteps_snow.mp3",
      image:"img/footsteps_snow.jpg",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
  
        {key:"hütte_bringen", label:"vör Hütte bringen"}
      ]
      },  


dort_lassen_2: {
      id: "dort_lassen_1",
      text: ["Das Feuer ist erloschen und der Raum pechschwarz.<Ist hier jemand?>Niemand antwortet.",
      ],
      image:"img/hütte_wohnzimmer_fussspuren.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "dort_lassen_3", label: "weiter" }
      ]
      },
      
dort_lassen_3: {
      id: "dort_lassen_3",
      text: ["Jede Faser meines Körpers spannt sich an.<Ich weiss, dass jemand hier ist!>",
        "Beim Eintreten höre ich ein Platschen unter meinem Fuss.<…Die Pfütze war vorher noch nicht da…>",
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
        { key: "wehren_2", label: "weiter" }
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
      timerKey: "toilette_2",
      startTimerBeforeText: true,
      textDelay: 3000,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_17", label: "wehren" }
      ]
      },

wehren_1: {
      id: "wehren_1",
      text: ["verbarrikadiere ich sicherheitshalber Tür und Fenster.Als ich mit dem Gewehrlauf ins Dunkle schlage treffe ich etwas.Nachdem sich meine Augen sich angepasst haben, blicke ich auf eine ohnmächtige Gestalt mit Messer.Mann verlässt Hütte, Als er einschläft spurt er Turen&Fenster absichern. stechendeSchmereschlagst mit Gewehrlauf ins Dunkle-triffst. ^",
        "Eilig fessle ich ihn mit einem Vorhang und sperre ihn, mithilfe dem Regal unter der Türklinke, im Schlafzimmer ein.",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "wehren_2", label: "weiter" }
      ]
      },


wehren_2: {
      id: "wehren_2",
      text: ["Mein ganzer Körper zittert.",
        "Ich höre wie er aufwacht.",
        "Eine raue Stimme von der anderen Seite spricht: <Hey lass mich raus! Ich war nur auf der Hut, da ich ein Schuss hörte.> ",
        "<Tut mir ja leid, aber ich werde dich vorerst nicht rauslassen.>",
        "Wutentbrannt schreit er: <Lass mich sofort raus! Rauslassen habe ich gesagt!>Die Tür poltert mehrmals heftig, doch trotz des alten Aussehens gibt sie nicht nach.Ich weiss nicht mehr wie lange es gedauert hat, doch als der Morgen einbricht war er still."
      ],
      sound:"sounds/door_rattling.mp3",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_18", label: "weiter" }
      ]
      },

  hütte_bringen: {
      id: "gütte_bringen",
      text: ["<Tut mir leid, aber der Hunger ist zu gross.>",
        "Ich greife es am Hinterbein und schleife es durch den Schnee"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "dort_lassen_1", label: "weiter" }
      ]
      },
  
 dort_lassen_1: {
      id: "dort_lassen_1",
      text: ["Vor der Hütte erkenne ich Abdrücke von fremdem Schuhprofil welche in Hütte führen. Ich lasse das Reh schockiert los.",
      ],
      image:"img/hütte_wohnzimmer.png",
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "dort_lassen_2", label: "weiter" }
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
        { key: "wegschicken_1", label: "wegschicken" },
        {key:"bleiben_lassen_1", label:"bleiben lassen"}
      ]
      },

  wegschicken_1: {
      id: "wegschicken_1",
      text: ["<Tut mir leid ich traue dir nicht.Hier nimm die Taschenlampe. Bleibe einfach auf dem Weg, dann bist du bald im Dorf.>",
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "wegschicken_2", label: "weiter" }
      ]
      },

  wegschicken_2: {
      id: "wegschicken_2",
      text: ["Als der Mann die Hütte verlässt, verbarrikadiere ich sicherheitshalber Tür und Fenster.",
        "In der Nacht sehe ich Licht durchs Fenster und höre ich, wie jemand um die Hütte schleicht.",
        "Ich bleibe wach bis der Morgen einbricht. "
      ],
      sound:"sounds/verbarikadieren.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_19", label: "weiter" }
      ]
      },

   bleiben_lassen_1: {
      id: "bleiben_lassen_1",
      text: ["Der Mann spricht: <Vielen Dank! Mein Name ist übrigens Mark.>",
        "Wir entzünden das Feuer.",
        "Der Mark fragt: <Ich darf doch sicher hier beim Feuer schlafen, oder? >"
      ],
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "erlauben", label: "erlauben" },
        {key:"anderes_zimmer_1", label:"in anderes Zimmer schicken"}
      ]
      },

      erlauben: {
      id: "erlauben",
      text: ["Ich versuche wach zu bleiben, doch aufgrund des warmen Feuers und dem schlafenden Mann, entspanne ich mich langsam und nicke ein. Plötzlich verspüre ich, wie etwas scharfes mein Hals berührt– "],
      sound:"sounds/fire.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_20", label: "weiter" }
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
        { key: "anderes_zimmer_2", label: "weiter" }
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
        { key: "mann_schauen_1", label: "nach Mann schauen" },
        {key:"versuchen_schlafen", label:"versuchen zu schlafen"}
      ]
      },

      mann_schauen_1: {
      id: "mann_schauen_1",
      text: ["Mich plagt ein schlechtes Gewissen.Als ich die Tür öffne und Licht vom Kamin reinscheint, erstarrt der Mann erschrocken mit einem Messer in der Hand.",
        "Schnell knalle ich die Tür zu und verbarrikadiere sie mit dem daneben stehenden Regal.",
        "Mein Herz pocht wie wild und es läuft mir kalt den Rücken runter, als er mich bittet die Tür zu öffnen. In dieser Verfassung bleibe ich bis der Morgen einbricht.",
      ],
      sound:"sounds/hearbeat.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_21", label: "weiter" }
      ]
      },


 versuchen_schlafen: {
      id: "versuchen_schlafen",
      text: ["Langsames Knarzen weckt mich aus dem Halbschlaf. Das Feuer ist zu Glut geworden. Nur Silhouetten sind zu erkennen.",
        "<Ist etwas? Ich kann dich fast nicht sehen…>",
        ""
      
      ],
      sound:"sounds/running.mp3",
      hasTimer: true,
      timerTime: 12000,
      timerKey: "Ziel_22",
      startTimerBeforeText: true,
      textDelay: 3000,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "Ziel_22", label: "wehren" }
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
      sound:"sounds/verbarikadieren.mp3",
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "buch_2", label: "weiter" }
      ]
      }, 





messer_1: {
      id: "messer_1",
      text: ["Es vergehen einige Minuten oder Stunden in denen ich zusammengekauert in der dunkelsten Ecke des Zimmers verkrieche. Ab und zu blicke ich zitternd zu dem nun, von den ersten Sonnenstrahlen beleuchteten, Körper.",
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "Ziel_12", label: "weiter" }
        
      ]
      },


      
   Ziel_11: {
      id: "Ziel_11",
      text: [""],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "start_1", label: "noch mal spielen" },
        {key:"ende", label:"Spiel beenden"}
      ]
      },


   Ziel_12: {
      id: "Ziel_12",
      text: ["Ich laufe in grossem Bogen um die Leiche zur Tür und öffne sie einen Spalt.",
        "Ein Polizist mit freundlichem und erleichtertem Gesicht von einem Foto auf und offenbart: <Herr Meier, wir haben Sie gesucht. Es wurde eine Vermisstenmeldung aufgegeben.>",
        "<Herr polizist, Es ist etwas schreckliches passiert! Sehen Sie–> Als ich mich umdrehe erblicke ich nur den staubigen leeren Holzboden."
      ],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "start_1", label: "noch mal spielen" },
        {key:"ende", label:"Spiel beenden"}
      ]
      },

      
   Ziel_13: {
      id: "Ziel_13",
      text: [""],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "start_1", label: "noch mal spielen" },
        {key:"ende", label:"Spiel beenden"}
      ]
      },
 
    Ziel_16: {
      id: "Ziel_16",
      text: ["Als ich mich umdrehe spüre ich plötzlich einen dumpfen schlag auf den Kopf."],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "start_1", label: "noch mal spielen" },
        {key:"ende", label:"Spiel beenden"}
      ]
      },
    
   Ziel_17: {
      id: "Ziel_17",
      text: ["<Agh!> Ein stechender Schmerz in der Brust raubt mir die Sicht."],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "start_1", label: "noch mal spielen" },
        {key:"ende", label:"Spiel beenden"}
      ]
      },




   Ziel_22: {
      id: "Ziel_22",
      text: ["Ich höre vier schnelle, hämmernde Schritte, und bevor ich reagieren kann, schlägt mein Kopf, mit stechenden Schmerzen in der Brust, auf dem Boden auf.    "],
      hasTimer: false,
      hasLamp:false,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "start_1", label: "noch mal spielen" },
        {key:"ende", label:"Spiel beenden"}
      ]
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
      nextStory(timeoutKey);    
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
        } else {
            await displayTextNormally(text, textIdx == nodeText.length-1);
        }

        if (runId !== storyRunId) {
            textDelay = previousTextDelay;
            return;
        }
    }
    textDelay = previousTextDelay;

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
        // Button ist nur aktivierbar, wenn an diesem Ort verwendbar und noch Schüsse vorhanden
        gunButton.disabled = !(node.canUseGun === true) || gunShots <= 0 || (currentStoryKey === "kamin_2" && !kamin2LampUsed) || (currentStoryKey === "rausgehen_3" && !rausgehen3LampUsed);
        // Listener nur einmal anhängen, wenn noch nicht angehängt
        if (!gunHandlerAttached) {
          gunButton.addEventListener("click", gunClickHandler);
          gunHandlerAttached = true;
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
