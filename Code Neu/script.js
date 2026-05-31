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

let useTypeWriterEffect = false; // Hier kann eingestellt werden, ob der Type-Writer Effekt verwendet werden soll oder nicht. Falls nicht, wird der Text direkt angezeigt.
let typeWriterSpeed = 3; // Hier kann die Geschwindigkeit des Type-Writer Effekts eingestellt werden (aktuell 3 Millisekunden pro Buchstabe)
let textDelay = 20; // Hier kann die Verzögerung zwischen den Textabschnitten eingestellt werden (aktuell 2000 Millisekunden = 2 Sekunden)
let hasLamp = false;
let BatteryLife = 5;
let lampHandlerAttached = false;
let hasGun = false;
let gunHandlerAttached = false;
let gunShots = 3;
let currentStoryKey = null;
let kamin2LampUsed = false;
let schlafen1LampUsed = false;

function lampClickHandler() {
  if (!hasLamp) return;

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
    rehInfo.textContent = "sieht reh";
    textContainer.appendChild(rehInfo);
    kamin2LampUsed = true;
    if (gunButton && hasGun) {
      gunButton.disabled = gunShots <= 0;
    }
  }

  if (currentStoryKey === "schlafen_1") {
    const mannInfo = document.createElement("p");
    mannInfo.textContent = "sieht mann mit messer in hand";
    textContainer.appendChild(mannInfo);
    schlafen1LampUsed = true;
    if (gunButton && hasGun) {
      gunButton.disabled = gunShots <= 0;
    }
  }

  if (BatteryLife <= 0) lampButton.disabled = true;
}

function gunClickHandler() {
  if (!hasGun) return;
  if (gunShots <= 0) {
    alert("Du hast keine Schüsse mehr!");
    return;
  }

  gunShots--;

  if (currentStoryKey === "kamin_2") {
    nextStory("schiessen_1");
  } else if (currentStoryKey === "schlafen_1") {
    nextStory("schlafen_schiessen_1");
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
        "Einleitungsgeschichte.",
        "xxxx",
        "xxxx."
      ],
      hasTimer: false,
      hasLamp:false,
      image: "img/Flur_Eingang.webp",
      
    },
  
    
  
    start_1: {
      id: "start_1",
      text: ["langläufer hört ein geräusch wacht auf und sieht nichts."],
      hasTimer: false,
      hasLamp:false,
      next: [
        { key: "start_2", label: "Weiter" }
        
      ]
    },

    start_2: {
      id: "start_2",
      text: ["Er steht auf",
        "xxx",
        "xxxx",
        "xxxxx"
      ],
      hasTimer: false,
      hasLamp:false,
      image: "img/christmasBand.jpeg",
      next: [
        { key: "weg_1", label: "Weg hinab" },
        { key: "hütte_1", label: "zur Alphütte" }
      ]
    },


  
    logarithmusGleichungen: {
      id: "logarithmusGleichungen",
      text: ["Logarithmus-Gleichungen haben es in sich. Die Substitutions-Methode war dir nicht mehr vertraut, und kommt nächste Woche bei der Prüfung.",
        "Sehr gut, dass du dich entschieden hast, konzentriert mitzuarbeiten.",
        "Du entscheidest dich dafür, noch ein Jahr mit dem Projekt Jazz-Band zu warten."
      ],
      hasTimer: false,
      image: "img/logarithmusGleichung.png",
      next: [
        { key: "schluss", label: "Spiel abschliessen" }
      ]
    },
  
    brawlStarsSpielen: {
      id: "brawlStarsSpielen",
      text: ["Direkt als du andere Schülerinnen und Schüler fragen willst, ob sie eine Jazz-Band gründen wollen, wirst du abgelenkt.",
        "Zu einer Runde Brawl Stars kannst du kaum Nein sagen.",
        "Wie heisst nochmals die In-Game-Währung, mit der man neue Brawler freischalten kann?",
        "Deine Mitschülerinnen und Mitschüler warten auf deine Antwort:", 
        "Wenn sie richtig ist, gehst du zur Lehrperson und fragst nach Tipps zur Gründung einer Jazz-Band.",
      ],
      image: "img/brawlStars.jpg",
      hasTimer: true,

      // Hier definieren wir die Benutzereingabe, die an diesem Story-Punkt benötigt wird.
      // Der SuccessKey enthält der Identifier des Story-Objekts, welches als nächstes ausgeführt werden soll
      // Der FailureKey enthält der Identifier des Story-Objekts, welches als nächstes ausgeführt werden soll, falls die Benutzereingabe falsch ist.
      // Die answer ist die richtige Antwort, die mit der Benutzereingabe verglichen wird.
      // Das Label ist der Text, der im Input-Feld als Platzhalter angezeigt wird.
      input: {  
        type: "text",
        label: "Gib hier deine Antwort ein:",
        answer: "Credits",
        successKey: "bandGruenden",
        failureKey: "brawlStarsVerlieren"
      }
    },
  
    brawlStarsVerlieren: {
      id: "brawlStarsVerlieren",
      text: ["Oh nein! Du hast die Runde verloren, weil du die In-Game-Währung nicht kanntest.",
        "Vielleicht hättest du doch lieber nach einer Jazz-Band fragen sollen.",
        "Naja, nächstes Jahr versuchst du es wieder."
      ],
      hasTimer: false,
      next: [
        { key: "schluss", label: "Spiel abschliessen" }
      ]
    },

    weg_1: {
      id: "weg_1",
      text: ["Er kann den Weg gerade so erkennen"
      ],
      image: "img/weihnachtsbaumBild.jpg",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "weg_2", label: "Weiter" }
        
      ]
    },

  
    

    weg_2: {
      id: "weg_2",
      text: ["er kommt an Gabelung"
      ],
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
      hasTimer: false,
      hasLamp: false,
      next: [
        { key: "links_2", label: "Weiter" }
      ]
    },
 
    links_2: {
      id: "links_2",
      text: ["Dreht sich um, \"wer ist da\" "],
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
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
      image: "img/weihnachtsbaumBild.jpg",
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
      text: ["Tür öffnet sich bei Hütte",
        "Tritt ein und findet Taschenlampe",
      ],
      hasTimer: false,
      hasLamp:true,
      BatteryLife:5,
      next: [
        { key: "weg_1.1", label: "züruck"},
        { key: "haus_durchsuchen_1", label: "Haus durchsuchen"}
      ]
      },

   haus_durchsuchen_1: {
      id: "haus_durchsuchen_1",
      text: ["findet Gewehr",
        "xxx",
        "xxxx",
        "xxxxx"
      ],
      hasTimer: false,
      hasLamp:true,
      hasGun:true,
      BatteryLife:5,

      next: [
        { key: "weg_1.2", label: "zurück" },
        { key: "kamin_1", label: "Kamin anzünden" }
      ]
      },

   kamin_1: {
      id: "kamin_1",
      text: ["legt Feuerzeug aufs Holz",
        "xxx",
        "xxxx",
        "xxxxx"
      ],
      hasTimer: false,
      hasLamp:true,
      BatteryLife:5,
      next: [
        { key: "kamin_2", label: "weiter" }
      ]
      
      },
 kamin_2: {
      id: "kamin_2",
      text: ["hört Geräusch und wächt auf",
        "Schlafzimmerfenster von Wind offen",
        "xxxx",
        "xxxxx"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,

      next: [
        { key: "kamin_3", label: "Schliesst Fenster" },
        {key: "kamin_anzünden_1", label: "Kamin anzünden"}
      ]
      
      },
 kamin_3: {
      id: "kamin_3",
      text: ["Er ist müde aber besorgt",
        "xxxx",
        "xxxxx"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "schlafen_1", label: "schlafen" },
        {key: "wach_1", label: "wach bleiben"}
      ]
      
      },

  schlafen_1: {
      id: "schlafen_1",
      text: ["wächt in der Nacht auf",
        "Feuer ausgebrannt",
        "dunkel"
      ],
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
      text: ["Fremde Stimme: ‚Schlaf gut‘",
        "Spürt Schmerz in Brust",
        "xxxxx"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "Ziel_11", label: "weiter" }
      ]
      },

  schlafen_schiessen_1: {
      id: "schlafen_schiessen_1",
      text: ["Er rollt zur Seite, nimmt Gewehr und zündet ab -- Mann stirbt"],
      hasTimer: false,
      hasLamp:true,
      canUseGun:false,
      BatteryLife:5,
      next: [
        { key: "messer_1", label: "Weiter" }
      ]
      },














      

  schiessen_1: {
      id: "schiessen_1",
      text: ["Er schiesst und trifft",
        "xxx",
        "xxxxx"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "drinnen_1", label: "drinnen bleiben" },
         { key: "drausen_1", label: "rausgehen" }
      ]
      },
      






messer_1: {
      id: "messer_1",
      text: ["Er hat Angst und hat Schuldgefühle",
        "Es wird morgen",
        "als er sich umdreht ist die Leiche weg"
      ],
      hasTimer: false,
      hasLamp:true,
      canUseGun:true,
      BatteryLife:5,
      next: [
        { key: "Ziel_12", label: "weiter" }
        
      ]
      },
      






  gun_action: {
    id: "gun_action",
    text: ["Du ziehst das Gewehr und schießt ab!", "xxxx", "xxxxx"],
    hasTimer: false,
    next: [
      { key: "kamin_3", label: "Zurück" }
    ]
  }
};
 
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
function displayTimer(){
    const timerBar = document.createElement("div");
    timerBar.classList.add("timer-bar");
    timerContainer.appendChild(timerBar);

    timerBar.style.animation = `countdown ${timerTime/1000}s linear forwards`;

    timerVariable = setTimeout(() => {
      timerBar.remove();
      nextStory("verloren");    
    }, timerTime); 
}

/**
 * Diese Funktion lädt den nächsten Story-Punkt
 * @param {*} key Der Key des nächsten Story-Punkts
 */
async function nextStory(key) {   
  currentStoryKey = key;
    // In der Variable "node" wird der aktuelle Story-Punkt gespeichert, damit wir einfacher darauf zugreifen können.
    // Bsp: key = "bahnhof" -> node = story["bahnhof"] -> node.text, node.image, node.next, etc. werden vom Bahnhof geladen
    const node = story[key];

    // Hier werden alle HTML-Elemnte zurückgesetzt, damit der neue Story-Punkt geladen werden kann.
    // Text und Entscheidungs-Container sollen leer sein
    textContainer.innerHTML = "";
    buttonsAndInputs.innerHTML = "";
    timerContainer.innerHTML = "";
    clearTimeout(timerVariable);

    // Start-Button nur in der Einleitung anzeigen
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

    // 2. Text schreiben
    for (let textIdx in node.text) {
        const text = node.text[textIdx];
        if(useTypeWriterEffect){
            await displayTextWithTypeWriter(text);
        } else {
            await displayTextNormally(text, textIdx == node.text.length-1);
        }
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
        // Button ist nur aktivierbar, wenn an diesem Ort verwendbar und noch Schüsse vorhanden
        gunButton.disabled = !(node.canUseGun === true) || gunShots <= 0 || (currentStoryKey === "kamin_2" && !kamin2LampUsed);
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
    if (node.hasTimer) {
        displayTimer();
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
