const $ = id => document.getElementById(id);

/* =========================
   ESTADO Y GUARDADO
========================= */

const ESTADO_VERSION = "mochilaSeguraEstadoV3";

if(!localStorage.getItem(ESTADO_VERSION)){
  localStorage.removeItem("puntosMochila");
  localStorage.removeItem("nivelesCompletadosMochila");
  localStorage.removeItem("nivelDesbloqueadoMochila");
  localStorage.removeItem("mejorPuntuacionMochila");
  localStorage.removeItem("logrosMochila");
  localStorage.removeItem("checklistMochila");
  localStorage.removeItem("checkEstadoMochila");
  localStorage.removeItem("planFamiliar");
  localStorage.removeItem("recompensaMochilaEntregada");

  localStorage.setItem(ESTADO_VERSION,"activo");
}

let puntos = Number(localStorage.getItem("puntosMochila") || 0);

let nivelesCompletados =
  Number(localStorage.getItem("nivelesCompletadosMochila") || 0);

let nivelDesbloqueado =
  Math.min(
    10,
    Math.max(
      1,
      Number(localStorage.getItem("nivelDesbloqueadoMochila") || 1)
    )
  );

let mejorPuntuacion =
  Number(localStorage.getItem("mejorPuntuacionMochila") || 0);

let medallas =
  JSON.parse(localStorage.getItem("logrosMochila") || "{}");

let checklistItems =
  JSON.parse(localStorage.getItem("checklistMochila") || "[]");

/* =========================
   MOCHILA
========================= */

const backpackBase = [
  [
    "💧",
    "Agua potable",
    "Agua para cubrir las necesidades básicas."
  ],
  [
    "🥫",
    "Alimentos no perecibles",
    "Alimentos fáciles de conservar y consumir."
  ],
  [
    "🔦",
    "Linterna",
    "Útil ante cortes de energía."
  ],
  [
    "🔋",
    "Pilas o batería de respaldo",
    "Para mantener equipos básicos funcionando."
  ],
  [
    "🩹",
    "Botiquín",
    "Materiales básicos de primeros auxilios."
  ],
  [
    "📻",
    "Radio",
    "Para recibir información y recomendaciones oficiales."
  ],
  [
    "📱",
    "Celular y cargador",
    "Mantén comunicación cuando sea posible."
  ],
  [
    "📄",
    "Documentos importantes",
    "Protegidos y en un lugar seguro."
  ],
  [
    "🧴",
    "Higiene personal",
    "Elementos básicos de higiene."
  ],
  [
    "🧥",
    "Ropa de abrigo",
    "Según clima y necesidades de la familia."
  ]
];

/* =========================
   GUARDAR ESTADÍSTICAS
========================= */

function saveStats(){

  localStorage.setItem("puntosMochila",puntos);

  localStorage.setItem(
    "nivelesCompletadosMochila",
    nivelesCompletados
  );

  localStorage.setItem(
    "nivelDesbloqueadoMochila",
    nivelDesbloqueado
  );

  localStorage.setItem(
    "mejorPuntuacionMochila",
    mejorPuntuacion
  );

  localStorage.setItem(
    "logrosMochila",
    JSON.stringify(medallas)
  );

  updateDashboard();
}

/* =========================
   REINICIAR TODO EL PROGRESO
========================= */

function reiniciarProgresoCompleto(){

  const confirmar = confirm(
    "¿Estás seguro de reiniciar todo tu progreso?\n\n" +
    "Se borrarán:\n" +
    "⭐ Puntos\n" +
    "🏅 Medallas\n" +
    "🎮 Niveles completados\n" +
    "🔓 Niveles desbloqueados\n" +
    "📊 Progreso de la evaluación\n" +
    "🎒 Checklist\n" +
    "👨‍👩‍👧‍👦 Plan familiar\n\n" +
    "Esta acción no se puede deshacer."
  );

  if(!confirmar) return;

  detenerTemporizador();

  puntos = 0;
  nivelesCompletados = 0;
  nivelDesbloqueado = 1;
  mejorPuntuacion = 0;
  medallas = {};
  checklistItems = [];

  localStorage.removeItem("puntosMochila");
  localStorage.removeItem("nivelesCompletadosMochila");
  localStorage.removeItem("nivelDesbloqueadoMochila");
  localStorage.removeItem("mejorPuntuacionMochila");
  localStorage.removeItem("logrosMochila");
  localStorage.removeItem("checklistMochila");
  localStorage.removeItem("checkEstadoMochila");
  localStorage.removeItem("planFamiliar");
  localStorage.removeItem("recompensaMochilaEntregada");

  localStorage.setItem(
    "nivelDesbloqueadoMochila",
    "1"
  );

  localStorage.setItem(
    "nivelesCompletadosMochila",
    "0"
  );

  juego = {
    nivel:1,
    pregunta:0,
    vidas:3,
    tiempo:0,
    interval:null,
    activo:false,
    puntosNivel:0
  };

  $("resultadoMochila").innerHTML = "";
  $("planResultado").innerHTML = "";

  $("familia").value = "";
  $("responsable").value = "";
  $("contacto").value = "";
  $("telefono").value = "";
  $("puntoEncuentro").value = "";
  $("ruta").value = "";

  renderChecklist();
  seleccionarNivel(1);
  updateDashboard();

  alert(
    "✅ Progreso reiniciado correctamente.\n\n" +
    "⭐ 0 puntos\n" +
    "🏅 0 medallas\n" +
    "🎮 0/10 niveles\n" +
    "📊 0% de progreso\n" +
    "🔓 Solo el nivel 1 está desbloqueado."
  );
}

/* =========================
   PANEL
========================= */

function updateDashboard(){

  $("statPuntos").textContent =
    puntos.toLocaleString();

  $("statNiveles").textContent =
    `${nivelesCompletados}/10`;

  $("statMedallas").textContent =
    Object.values(medallas)
      .filter(Boolean)
      .length;

  const checks =
    document.querySelectorAll(
      ".check-item input"
    );

  const done =
    [...checks].filter(
      x => x.checked
    ).length;

  const percent =
    checks.length
      ? Math.round(done / checks.length * 100)
      : 0;

  $("statPreparacion").textContent =
    percent + "%";

  updateEvaluation();
  renderLevelGrid();
  renderAchievements();
}

/* =========================
   GENERADOR DE MOCHILA
========================= */

function generarMochila(){

  const personas =
    Math.max(
      1,
      Number($("personas").value) || 1
    );

  const dias =
    Math.max(
      1,
      Number($("dias").value) || 1
    );

  const ninos =
    Math.max(
      0,
      Number($("ninos").value) || 0
    );

  const adultos =
    Math.max(
      0,
      Number($("adultos").value) || 0
    );

  const discapacidad =
    Math.max(
      0,
      Number($("discapacidad").value) || 0
    );

  const mascotas =
    Math.max(
      0,
      Number($("mascotas").value) || 0
    );

  const riesgo =
    $("riesgo").value;

  const agua =
    personas * dias * 2;

  const alimentos =
    personas * dias * 3;

  const papel =
    personas * dias;

  const mascarillas =
    personas * 2;

  const recipientes =
    personas;

  const ropa =
    personas;

  const aguaMascotas =
    mascotas * dias;

  const alimentoMascotas =
    mascotas * dias * 2;

  const items = [
    [
      "💧",
      "Agua potable",
      `${agua} litros`,
      "Cantidad orientativa calculada según personas y días."
    ],

    [
      "🥫",
      "Alimentos no perecibles",
      `${alimentos} porciones`,
      "Cantidad orientativa calculada según personas y días."
    ],

    [
      "🔦",
      "Linterna",
      `${personas} unidad(es)`,
      "Una unidad por persona como referencia."
    ],

    [
      "🔋",
      "Pilas o batería de respaldo",
      `${personas} unidad(es)`,
      "Considera baterías o medios de respaldo."
    ],

    [
      "🩹",
      "Botiquín",
      `1`,
      "Botiquín básico para la familia."
    ],

    [
      "📻",
      "Radio",
      `1`,
      "Para recibir información oficial."
    ],

    [
      "📱",
      "Celular y cargador",
      `${personas} equipo(s)`,
      "Mantén los equipos disponibles y cargados."
    ],

    [
      "📄",
      "Documentos importantes",
      `1 conjunto`,
      "Guárdalos protegidos."
    ],

    [
      "🧴",
      "Higiene personal",
      `${personas} persona(s)`,
      "Considera las necesidades de cada integrante."
    ],

    [
      "🧥",
      "Ropa de abrigo",
      `${ropa} cambio(s)`,
      "Según clima y necesidades."
    ],

    [
      "😷",
      "Mascarillas",
      `${mascarillas}`,
      "Cantidad orientativa."
    ],

    [
      "🧻",
      "Papel higiénico",
      `${papel} rollo(s)`,
      "Cantidad orientativa según personas y días."
    ],

    [
      "🪣",
      "Recipientes para agua",
      `${recipientes}`,
      "Para almacenar o transportar agua."
    ]
  ];

  if(ninos > 0){

    items.push([
      "🧸",
      "Elementos para niños",
      `${ninos} kit(s)`,
      "Considera artículos necesarios para ellos."
    ]);

  }

  if(adultos > 0){

    items.push([
      "👴",
      "Elementos para adultos mayores",
      `${adultos} kit(s)`,
      "Considera sus necesidades particulares."
    ]);

  }

  if(discapacidad > 0){

    items.push([
      "♿",
      "Elementos de apoyo",
      `${discapacidad} kit(s)`,
      "Incluye lo necesario según cada necesidad."
    ]);

  }

  if(mascotas > 0){

    items.push([
      "🐶",
      "Agua para mascotas",
      `${aguaMascotas} litros`,
      "Cantidad orientativa."
    ]);

    items.push([
      "🐾",
      "Alimento para mascotas",
      `${alimentoMascotas} porciones`,
      "Cantidad orientativa."
    ]);

  }

  const riskText = {

    general:
      "Revisa periódicamente la mochila y adapta su contenido a las necesidades de tu familia.",

    terremoto:
      "Mantén la mochila accesible y prepara previamente un plan familiar.",

    incendio:
      "Conoce las rutas de salida y evita guardar la mochila en zonas de difícil acceso.",

    inundacion:
      "Mantente atento a las indicaciones oficiales y evita zonas que puedan inundarse.",

    huaico:
      "Presta atención a las alertas y evita quebradas, ríos y zonas de peligro.",

    lluvias:
      "Revisa las condiciones de la vivienda y mantente atento a las alertas oficiales."

  }[riesgo];

  $("resultadoMochila").innerHTML = `

    <div class="result-box">

      <h3>🎒 Tu mochila personalizada</h3>

      <p>
        <b>${personas}</b> persona(s) ·
        <b>${dias}</b> día(s) ·
        ${ninos} niño(s) ·
        ${adultos} adulto(s) mayor(es) ·
        ${discapacidad} persona(s) con discapacidad ·
        ${mascotas} mascota(s)
      </p>

      <div class="item-list">

        ${items.map(item => `

          <div>

            ${item[0]}
            <b>${item[1]}</b>

            <div class="quantity">
              📦 ${item[2]}
            </div>

            <small>
              ${item[3]}
            </small>

          </div>

        `).join("")}

      </div>

      <div class="risk-note">

        <b>📌 Recomendación:</b>
        ${riskText}

      </div>

      <p style="margin-top:15px;color:#627d98;font-size:13px">
        ℹ️ Las cantidades mostradas son orientativas para esta herramienta
        educativa y pueden adaptarse a las necesidades reales de cada familia.
      </p>

    </div>
  `;

  checklistItems =
    items.map(
      item => item[1]
    );

  localStorage.setItem(
    "checklistMochila",
    JSON.stringify(checklistItems)
  );

  renderChecklist();

  /*
    La mochila solamente entrega
    los +50 puntos la primera vez.
  */

  if(
    !localStorage.getItem(
      "recompensaMochilaEntregada"
    )
  ){

    puntos += 50;

    localStorage.setItem(
      "recompensaMochilaEntregada",
      "true"
    );

    saveStats();

  }else{

    updateDashboard();

  }
}

/* =========================
   CHECKLIST
========================= */

function renderChecklist(){

  const saved =
    JSON.parse(
      localStorage.getItem(
        "checkEstadoMochila"
      ) || "{}"
    );

  const list =
    checklistItems.length
      ? checklistItems
      : JSON.parse(
          localStorage.getItem(
            "checklistMochila"
          ) || "[]"
        );

  $("checklist").innerHTML =
    list.length

      ? list.map((item,i) => `

        <label
          class="check-item ${saved[item] ? "done" : ""}"
        >

          <input
            type="checkbox"
            ${saved[item] ? "checked" : ""}
            onchange="toggleCheck('${encodeURIComponent(item)}',this.checked)"
          >

          <span>${item}</span>

        </label>

      `).join("")

      : `<p>Aún no has generado una mochila.</p>`;

  updateChecklistProgress();
}

function toggleCheck(encoded,checked){

  const item =
    decodeURIComponent(encoded);

  const saved =
    JSON.parse(
      localStorage.getItem(
        "checkEstadoMochila"
      ) || "{}"
    );

  saved[item] = checked;

  localStorage.setItem(
    "checkEstadoMochila",
    JSON.stringify(saved)
  );

  renderChecklist();
}

function updateChecklistProgress(){

  const checks =
    document.querySelectorAll(
      ".check-item input"
    );

  const done =
    [...checks].filter(
      x => x.checked
    ).length;

  const total =
    checks.length;

  const percent =
    total
      ? Math.round(
          done / total * 100
        )
      : 0;

  $("barraProgreso").style.width =
    percent + "%";

  $("textoProgreso").textContent =
    percent + "% preparado";

  $("contadorChecklist").textContent =
    `${done}/${total}`;

  $("statPreparacion").textContent =
    percent + "%";

  updateEvaluation();
}

/* =========================
   PLAN FAMILIAR
========================= */

function crearPlan(){

  const data = {

    familia:
      $("familia").value.trim(),

    responsable:
      $("responsable").value.trim(),

    contacto:
      $("contacto").value.trim(),

    telefono:
      $("telefono").value.trim(),

    punto:
      $("puntoEncuentro").value.trim(),

    ruta:
      $("ruta").value.trim()

  };

  if(
    !data.familia ||
    !data.responsable ||
    !data.punto
  ){

    $("planResultado").innerHTML = `

      <div class="result-box risk-note">

        Completa al menos integrantes,
        responsable y punto de encuentro.

      </div>

    `;

    return;
  }

  localStorage.setItem(
    "planFamiliar",
    JSON.stringify(data)
  );

  $("planResultado").innerHTML = `

    <div class="result-box">

      <h3>✅ Plan familiar guardado</h3>

      <p>
        <b>Familia:</b>
        ${escapeHTML(data.familia)}
      </p>

      <p>
        <b>Responsable:</b>
        ${escapeHTML(data.responsable)}
      </p>

      <p>
        <b>Contacto:</b>
        ${escapeHTML(
          data.contacto || "No registrado"
        )}
        ·
        ${escapeHTML(
          data.telefono || "Sin teléfono"
        )}
      </p>

      <p>
        <b>Punto de encuentro:</b>
        ${escapeHTML(data.punto)}
      </p>

      <p>
        <b>Ruta:</b>
        ${escapeHTML(
          data.ruta || "No registrada"
        )}
      </p>

    </div>
  `;

  /*
    El plan entrega +100 puntos
    solamente la primera vez.
  */

  if(!medallas.plan){

    puntos += 100;
    medallas.plan = true;

    saveStats();

  }else{

    updateDashboard();

  }
}

function cargarPlan(){

  const data =
    JSON.parse(
      localStorage.getItem(
        "planFamiliar"
      ) || "null"
    );

  if(!data) return;

  $("familia").value =
    data.familia || "";

  $("responsable").value =
    data.responsable || "";

  $("contacto").value =
    data.contacto || "";

  $("telefono").value =
    data.telefono || "";

  $("puntoEncuentro").value =
    data.punto || "";

  $("ruta").value =
    data.ruta || "";
}

/* =========================
   IMPRESIÓN DE MOCHILA
========================= */

function imprimirMochila(){

  const personas =
    Number($("personas").value) || 1;

  const dias =
    Number($("dias").value) || 1;

  const riesgo =
    $("riesgo").value;

  const riesgoNombre =
    $("riesgo").options[
      $("riesgo").selectedIndex
    ].text;

  const ninos =
    Number($("ninos").value) || 0;

  const adultos =
    Number($("adultos").value) || 0;

  const discapacidad =
    Number($("discapacidad").value) || 0;

  const mascotas =
    Number($("mascotas").value) || 0;

  const agua =
    personas * dias * 2;

  const alimentos =
    personas * dias * 3;

  const papel =
    personas * dias;

  const mascarillas =
    personas * 2;

  const recipientes =
    personas;

  const items = [

    ["💧","Agua potable",`${agua} litros`],

    ["🥫","Alimentos no perecibles",`${alimentos} porciones`],

    ["🔦","Linterna",`${personas} unidad(es)`],

    ["🔋","Pilas o batería de respaldo",`${personas} unidad(es)`],

    ["🩹","Botiquín","1`"],

    ["📻","Radio","1`"],

    ["📱","Celular y cargador",`${personas} equipo(s)`],

    ["📄","Documentos importantes","1 conjunto"],

    ["🧴","Higiene personal",`${personas} persona(s)`],

    ["🧥","Ropa de abrigo",`${personas} cambio(s)`],

    ["😷","Mascarillas",`${mascarillas}`],

    ["🧻","Papel higiénico",`${papel} rollo(s)`],

    ["🪣","Recipientes para agua",`${recipientes}`]

  ];

  if(ninos > 0){
    items.push([
      "🧸",
      "Elementos para niños",
      `${ninos} kit(s)`
    ]);
  }

  if(adultos > 0){
    items.push([
      "👴",
      "Elementos para adultos mayores",
      `${adultos} kit(s)`
    ]);
  }

  if(discapacidad > 0){
    items.push([
      "♿",
      "Elementos de apoyo",
      `${discapacidad} kit(s)`
    ]);
  }

  if(mascotas > 0){

    items.push([
      "🐶",
      "Agua para mascotas",
      `${mascotas * dias} litros`
    ]);

    items.push([
      "🐾",
      "Alimento para mascotas",
      `${mascotas * dias * 2} porciones`
    ]);

  }

  let contenedor =
    document.getElementById(
      "printMochila"
    );

  if(!contenedor){

    contenedor =
      document.createElement("div");

    contenedor.id =
      "printMochila";

    document.body.appendChild(
      contenedor
    );
  }

  contenedor.innerHTML = `

    <div class="print-header">

      <div class="print-logo">
        🎒 MochilaSegura
      </div>

      <div class="print-title">
        Mochila de Emergencia
      </div>

    </div>

    <div class="print-info">

      <b>👥 Personas:</b> ${personas}
      &nbsp;&nbsp;

      <b>📅 Días:</b> ${dias}

      <br><br>

      <b>🚨 Tipo de emergencia:</b>
      ${escapeHTML(riesgoNombre)}

      <br><br>

      <b>👶 Niños:</b> ${ninos}
      &nbsp;&nbsp;

      <b>👴 Adultos mayores:</b> ${adultos}
      &nbsp;&nbsp;

      <b>♿ Discapacidad:</b> ${discapacidad}
      &nbsp;&nbsp;

      <b>🐶 Mascotas:</b> ${mascotas}

    </div>

    <h2>📋 Lista de preparación</h2>

    <div class="print-items">

      ${items.map(item => `

        <div class="print-item">

          ☐ ${item[0]}
          <strong>${item[1]}</strong>

          <div class="print-quantity">
            📦 ${item[2]}
          </div>

        </div>

      `).join("")}

    </div>

    <div class="print-note">

      <b>📌 Recomendación:</b>

      Revisa periódicamente la mochila,
      conserva los elementos en buen estado
      y adapta su contenido a las necesidades
      de tu familia.

    </div>

    <div class="print-footer">

      🎒 MochilaSegura —
      Herramienta educativa de prevención
      y gestión de riesgos.

    </div>

  `;

  window.print();
}

/* =========================
   IMPRESIÓN DEL PLAN
========================= */

function imprimirPlan(){

  const data =
    JSON.parse(
      localStorage.getItem(
        "planFamiliar"
      ) || "null"
    );

  if(!data){

    alert(
      "Primero debes guardar tu plan familiar."
    );

    return;
  }

  let contenedor =
    document.getElementById(
      "printPlan"
    );

  if(!contenedor){

    contenedor =
      document.createElement("div");

    contenedor.id =
      "printPlan";

    document.body.appendChild(
      contenedor
    );
  }

  contenedor.innerHTML = `

    <div class="print-header">

      <div class="print-logo">
        🎒 MochilaSegura
      </div>

      <div class="print-title">
        Plan Familiar de Emergencia
      </div>

    </div>

    <div class="print-info">

      <p>
        <b>👨‍👩‍👧‍👦 Integrantes:</b>
        ${escapeHTML(data.familia)}
      </p>

      <p>
        <b>👤 Responsable:</b>
        ${escapeHTML(data.responsable)}
      </p>

      <p>
        <b>📞 Contacto:</b>
        ${escapeHTML(
          data.contacto || "No registrado"
        )}
      </p>

      <p>
        <b>📱 Teléfono:</b>
        ${escapeHTML(
          data.telefono || "No registrado"
        )}
      </p>

      <p>
        <b>📍 Punto de encuentro:</b>
        ${escapeHTML(data.punto)}
      </p>

      <p>
        <b>🚶 Ruta de evacuación:</b>
        ${escapeHTML(
          data.ruta || "No registrada"
        )}
      </p>

    </div>

    <div class="print-note">

      <b>📌 Recomendación:</b>

      Todos los integrantes de la familia
      deben conocer el punto de encuentro,
      la ruta de evacuación y las acciones
      que deben realizar ante una emergencia.

    </div>

    <div class="print-footer">

      🎒 MochilaSegura —
      Herramienta educativa de prevención
      y gestión de riesgos.

    </div>

  `;

  window.print();
}

/* =========================
   SIMULADOR
========================= */

const simData = {

  terremoto:[

    [
      "Comienza un terremoto. ¿Qué acción es más segura?",
      "Mantener la calma y buscar un lugar seguro.",
      "Correr hacia las ventanas.",
      "Usar el ascensor."
    ],

    [
      "Después del movimiento, ¿qué debes hacer?",
      "Revisar la situación y seguir el plan familiar.",
      "Regresar inmediatamente a una zona peligrosa.",
      "Ignorar las indicaciones oficiales."
    ]

  ],

  incendio:[

    [
      "Hay humo y se necesita evacuar. ¿Qué haces?",
      "Sigues una ruta segura de salida y avisas a los demás.",
      "Te escondes para esperar.",
      "Regresas por objetos personales."
    ],

    [
      "¿Qué debes evitar?",
      "Volver a una zona afectada sin indicación segura.",
      "Mantener la calma.",
      "Seguir indicaciones."
    ]

  ],

  inundacion:[

    [
      "El agua comienza a subir. ¿Qué opción es adecuada?",
      "Alejarse de zonas inundadas y seguir indicaciones oficiales.",
      "Caminar por agua de corriente fuerte.",
      "Acercarse a cables o instalaciones eléctricas."
    ],

    [
      "¿Qué información es útil?",
      "Alertas y recomendaciones de las autoridades.",
      "Rumores sin verificar.",
      "Información de origen desconocido."
    ]

  ],

  huaico:[

    [
      "Existe una alerta de huaico. ¿Qué haces?",
      "Te alejas de quebradas y zonas de peligro siguiendo la evacuación.",
      "Te acercas para observar.",
      "Permaneces en el cauce de un río."
    ],

    [
      "¿Qué debes seguir?",
      "Las indicaciones oficiales y rutas de evacuación.",
      "Atajos hacia zonas de peligro.",
      "Solo mensajes sin verificar."
    ]

  ]

};

let simState = null;

function iniciarSimulador(tipo){

  simState = {
    tipo,
    index:0
  };

  mostrarPreguntaSim();
}

function mostrarPreguntaSim(){

  const q =
    simData[
      simState.tipo
    ][
      simState.index
    ];

  $("simuladorTitulo").textContent =
    `${simState.tipo.toUpperCase()} — Situación ${simState.index + 1}`;

  $("simuladorTexto").textContent =
    q[0];

  $("opcionesSimulador").innerHTML =
    q.slice(1)
      .map(
        (op,i) => `

          <button
            class="sim-option"
            onclick="responderSim(${i})"
          >

            ${String.fromCharCode(65+i)})
            ${op}

          </button>

        `
      )
      .join("");

  $("simuladorResultado").textContent =
    "";
}

function responderSim(i){

  const buttons =
    [
      ...document.querySelectorAll(
        ".sim-option"
      )
    ];

  buttons.forEach(
    b => b.disabled = true
  );

  const correct =
    i === 0;

  buttons[i].classList.add(
    correct
      ? "correct"
      : "wrong"
  );

  $("simuladorResultado").textContent =
    correct
      ? "✅ Correcto. ¡Muy bien!"
      : "❌ Esa opción no es la más segura. Revisa la situación.";

  if(correct){

    puntos += 30;

    saveStats();

  }

  setTimeout(() => {

    simState.index++;

    if(
      simState.index <
      simData[simState.tipo].length
    ){

      mostrarPreguntaSim();

    }else{

      $("simuladorResultado").textContent =
        "🎉 Simulación completada.";

      puntos += 50;

      if(!medallas.simulador){

        medallas.simulador = true;

      }

      saveStats();

    }

  },900);
}

/* =========================
   JUEGO DE 10 NIVELES
========================= */

const niveles = [

  {
    emoji:"🎒",
    title:"Preparación de mochila",
    intro:"Prepara correctamente una mochila para una emergencia.",

    questions:[

      [
        "¿Qué elemento ayuda a tener iluminación si se corta la energía?",
        [
          "🔦 Linterna",
          "🎮 Consola",
          "🎧 Audífonos",
          "🧸 Juguete"
        ],
        0
      ],

      [
        "¿Qué conviene hacer con la mochila?",
        [
          "📍 Mantenerla accesible",
          "🔒 Guardarla donde nadie la encuentre",
          "☀️ Dejarla a la intemperie",
          "🧳 Guardarla sin revisar"
        ],
        0
      ],

      [
        "¿Qué debe considerarse al preparar una mochila?",
        [
          "👨‍👩‍👧‍👦 Las necesidades de la familia",
          "🎲 Solo objetos de entretenimiento",
          "🍬 Solo dulces",
          "👟 Solo ropa"
        ],
        0
      ]

    ]
  },

  {
    emoji:"🌎",
    title:"Terremoto",
    intro:"Toma decisiones durante una situación de movimiento fuerte.",

    questions:[

      [
        "Comienza un terremoto. ¿Qué haces?",
        [
          "😌 Mantener la calma y buscar un lugar seguro",
          "🏃 Correr sin observar",
          "🪟 Acercarte a las ventanas",
          "🛗 Usar el ascensor"
        ],
        0
      ],

      [
        "Durante el movimiento, ¿qué conviene evitar?",
        [
          "🪟 Zonas cercanas a vidrios u objetos que puedan caer",
          "🧘 Mantener la calma",
          "🛡️ Protegerte en una zona segura",
          "👂 Escuchar indicaciones"
        ],
        0
      ],

      [
        "Después, ¿qué debes hacer?",
        [
          "📋 Seguir el plan familiar y las indicaciones oficiales",
          "🔙 Volver inmediatamente a una zona de riesgo",
          "📱 Compartir rumores",
          "🚪 Bloquear las salidas"
        ],
        0
      ]

    ]
  },

  {
    emoji:"🔥",
    title:"Incendio",
    intro:"Aprende a responder ante una situación de incendio.",

    questions:[

      [
        "Si debes evacuar, ¿qué haces?",
        [
          "🚪 Salir por una ruta segura",
          "📦 Regresar por objetos",
          "🛗 Usar el ascensor",
          "🪟 Acercarte al humo"
        ],
        0
      ],

      [
        "¿Qué es importante durante la evacuación?",
        [
          "😌 Mantener la calma y seguir indicaciones",
          "📸 Detenerse a grabar",
          "🏃 Empujar a otras personas",
          "🔙 Regresar"
        ],
        0
      ],

      [
        "¿Qué debes evitar?",
        [
          "🔥 Acercarte al área afectada",
          "🚶 Seguir una ruta segura",
          "📢 Avisar a los demás",
          "👨‍👩‍👧 Mantenerse con el grupo"
        ],
        0
      ]

    ]
  },

  {
    emoji:"🌊",
    title:"Inundación",
    intro:"Identifica decisiones seguras frente a una inundación.",

    questions:[

      [
        "El agua comienza a subir. ¿Qué haces?",
        [
          "⬆️ Alejarte de zonas inundadas y seguir indicaciones",
          "🌊 Caminar por corriente fuerte",
          "⚡ Acercarte a cables",
          "📸 Ir a observar"
        ],
        0
      ],

      [
        "¿Qué debes evitar?",
        [
          "🌊 Cruzar zonas con corriente de agua",
          "📻 Escuchar información oficial",
          "🎒 Tener preparada la mochila",
          "👨‍👩‍👧 Seguir el plan"
        ],
        0
      ],

      [
        "¿Qué información es más útil?",
        [
          "📢 Alertas oficiales",
          "💬 Rumores",
          "📱 Mensajes sin verificar",
          "🎲 Adivinanzas"
        ],
        0
      ]

    ]
  },

  {
    emoji:"⛰️",
    title:"Huaico",
    intro:"Reconoce las decisiones adecuadas ante el riesgo de huaico.",

    questions:[

      [
        "Hay una alerta de huaico. ¿Qué haces?",
        [
          "🚶 Alejarte de quebradas y zonas de peligro",
          "🌊 Acercarte al cauce",
          "📸 Ir a mirar",
          "🏕️ Quedarte en una zona de riesgo"
        ],
        0
      ],

      [
        "¿Qué debes seguir?",
        [
          "📢 Las indicaciones oficiales",
          "💬 Rumores",
          "🎲 Decisiones al azar",
          "📱 Mensajes sin verificar"
        ],
        0
      ],

      [
        "¿Qué ayuda a prepararse?",
        [
          "🎒 Tener mochila y plan familiar preparados",
          "🛋️ No hacer nada",
          "🚫 Ignorar alertas",
          "📦 Guardar la mochila lejos"
        ],
        0
      ]

    ]
  },

  {
    emoji:"🌧️",
    title:"Lluvias intensas",
    intro:"Prepárate y toma decisiones ante lluvias fuertes.",

    questions:[

      [
        "Antes de lluvias intensas, ¿qué puedes hacer?",
        [
          "🎒 Revisar la mochila y el plan familiar",
          "🌊 Acercarte a ríos",
          "🚶 Buscar zonas inundadas",
          "📱 Ignorar alertas"
        ],
        0
      ],

      [
        "¿Qué información debes revisar?",
        [
          "📢 Alertas y recomendaciones oficiales",
          "💬 Rumores",
          "🎲 Juegos",
          "📸 Videos sin contexto"
        ],
        0
      ],

      [
        "¿Qué zona conviene evitar si presenta peligro?",
        [
          "🌊 Zonas inundables o de riesgo",
          "🏠 Un lugar seguro",
          "📍 Punto de encuentro",
          "🎒 Lugar de la mochila"
        ],
        0
      ]

    ]
  },

  {
    emoji:"👨‍👩‍👧‍👦",
    title:"Evacuación familiar",
    intro:"Ayuda a tu familia a organizarse ante una emergencia.",

    questions:[

      [
        "¿Para qué sirve un punto de encuentro?",
        [
          "📍 Para reunirse después de evacuar",
          "🎮 Para jugar",
          "🛍️ Para comprar",
          "📦 Para guardar objetos"
        ],
        0
      ],

      [
        "¿Qué debe conocer la familia?",
        [
          "🗺️ La ruta de evacuación y el plan",
          "🎲 Solo el nombre del juego",
          "📸 Solo fotografías",
          "🎧 Solo música"
        ],
        0
      ],

      [
        "Si alguien necesita apoyo especial, ¿qué conviene hacer?",
        [
          "♿ Considerar sus necesidades en el plan",
          "❌ Ignorarlas",
          "🏃 Dejarlo atrás",
          "📦 No preparar nada"
        ],
        0
      ]

    ]
  },

  {
    emoji:"🌙",
    title:"Emergencia nocturna",
    intro:"Una emergencia ocurre de noche. Decide qué hacer.",

    questions:[

      [
        "Se corta la luz durante una emergencia. ¿Qué ayuda?",
        [
          "🔦 Una linterna preparada",
          "🕯️ Cualquier fuego sin cuidado",
          "📱 Ignorar la situación",
          "🎮 Una consola"
        ],
        0
      ],

      [
        "¿Qué conviene hacer?",
        [
          "😌 Mantener la calma y seguir el plan",
          "🏃 Correr sin orientación",
          "🪟 Acercarse a ventanas",
          "🚪 Bloquear salidas"
        ],
        0
      ],

      [
        "¿Qué debe estar preparado?",
        [
          "🎒 Mochila accesible",
          "📦 Objetos escondidos",
          "🎲 Solo juguetes",
          "🛋️ Nada"
        ],
        0
      ]

    ]
  },

  {
    emoji:"🚨",
    title:"Emergencia combinada",
    intro:"Ahora tendrás que tomar decisiones ante varios riesgos.",

    questions:[

      [
        "Hay lluvia intensa y riesgo de inundación. ¿Qué haces?",
        [
          "📢 Sigues alertas y evitas zonas de riesgo",
          "🌊 Te acercas al agua",
          "📸 Vas a observar",
          "🚶 Cruzas zonas inundadas"
        ],
        0
      ],

      [
        "También debes evacuar con tu familia. ¿Qué priorizas?",
        [
          "👨‍👩‍👧 Seguir el plan familiar y reunirse en un punto seguro",
          "🏃 Separarte del grupo",
          "📦 Regresar por objetos",
          "📱 Ignorar indicaciones"
        ],
        0
      ],

      [
        "¿Qué información debes compartir?",
        [
          "📢 Información oficial y útil",
          "💬 Rumores",
          "🎲 Mensajes inventados",
          "📸 Contenido sin verificar"
        ],
        0
      ],

      [
        "¿Qué objeto ayuda a estar preparado?",
        [
          "🎒 Mochila de emergencia",
          "🎮 Consola",
          "🧸 Juguete",
          "🎧 Audífonos"
        ],
        0
      ]

    ]
  },

  {
    emoji:"🏆",
    title:"Gran simulación final",
    intro:"Has llegado a la misión final. Demuestra todo lo aprendido.",

    questions:[

      [
        "¿Qué debes hacer primero ante una emergencia?",
        [
          "😌 Mantener la calma y evaluar la situación",
          "🏃 Correr sin pensar",
          "📸 Grabar",
          "💬 Crear rumores"
        ],
        0
      ],

      [
        "¿Qué ayuda antes de una emergencia?",
        [
          "🎒 Mochila y plan familiar preparados",
          "🚫 Ignorar alertas",
          "📦 No organizar nada",
          "🎲 Esperar sin plan"
        ],
        0
      ],

      [
        "Durante un terremoto, ¿qué debes priorizar?",
        [
          "🛡️ Tu seguridad y seguir recomendaciones",
          "🪟 Acercarte a ventanas",
          "🛗 Usar ascensor",
          "📦 Recoger objetos"
        ],
        0
      ],

      [
        "Ante una inundación, ¿qué debes evitar?",
        [
          "🌊 Zonas inundadas y corrientes de agua",
          "📢 Alertas",
          "🎒 Mochila",
          "👨‍👩‍👧 Plan familiar"
        ],
        0
      ],

      [
        "Ante un huaico, ¿qué es importante?",
        [
          "⛰️ Alejarse de zonas de peligro y seguir la evacuación",
          "🌊 Acercarse al cauce",
          "📸 Observar",
          "🏕️ Permanecer en la zona de riesgo"
        ],
        0
      ],

      [
        "¿Qué hace que un plan familiar sea útil?",
        [
          "👨‍👩‍👧 Que todos conozcan qué hacer y dónde reunirse",
          "❌ Que solo lo conozca una persona",
          "🎲 Que sea improvisado",
          "📱 Que no esté actualizado"
        ],
        0
      ]

    ]
  }

];

/* =========================
   ESTADO DEL JUEGO
========================= */

let juego = {

  nivel:nivelDesbloqueado,
  pregunta:0,
  vidas:3,
  tiempo:0,
  interval:null,
  activo:false,
  puntosNivel:0

};

/* =========================
   NIVELES
========================= */

function renderLevelGrid(){

  const grid =
    $("levelGrid");

  grid.innerHTML =
    niveles.map((n,i)=>{

      const num =
        i + 1;

      const unlocked =
        num <= nivelDesbloqueado;

      const completed =
        num <= nivelesCompletados;

      return `

        <button
          class="level-btn
            ${unlocked ? "unlocked" : ""}
            ${completed ? "completed" : ""}
            ${num === juego.nivel ? "current" : ""}"
          ${unlocked
            ? `onclick="seleccionarNivel(${num})"`
            : "disabled"}
        >

          ${completed
            ? "🏅"
            : unlocked
              ? n.emoji
              : "🔒"}

          <br>

          ${num}

        </button>

      `;

    }).join("");
}

function seleccionarNivel(num){

  if(num > nivelDesbloqueado)
    return;

  detenerTemporizador();

  juego = {

    nivel:num,
    pregunta:0,
    vidas:3,
    tiempo:0,
    interval:null,
    activo:false,
    puntosNivel:0

  };

  mostrarNivelPreparacion();

  renderLevelGrid();
}

function mostrarNivelPreparacion(){

  const n =
    niveles[
      juego.nivel - 1
    ];

  $("nivelJuego").textContent =
    juego.nivel;

  $("puntosJuego").textContent =
    puntos.toLocaleString();

  $("vidasJuego").textContent =
    "❤️❤️❤️";

  $("tiempoJuego").textContent =
    "--";

  $("nivelEmoji").textContent =
    n.emoji;

  $("tituloMision").textContent =
    `Nivel ${juego.nivel} — ${n.title}`;

  $("descripcionMision").textContent =
    n.intro;

  $("missionBar").style.width =
    "0%";

  $("objetosJuego").innerHTML =
    "";

  $("mensajeJuego").textContent =
    "";

  $("btnIniciar").textContent =
    "▶️ Iniciar nivel";

  $("btnIniciar").style.display =
    "inline-block";

  $("nivelCompletado")
    .classList
    .add("hidden");
}

/* =========================
   INICIAR JUEGO
========================= */

function iniciarJuego(){

  if(juego.activo)
    return;

  juego.pregunta = 0;
  juego.vidas = 3;
  juego.puntosNivel = 0;
  juego.activo = true;

  $("btnIniciar").style.display =
    "none";

  mostrarPreguntaJuego();

  iniciarTemporizador();
}

function mostrarPreguntaJuego(){

  const n =
    niveles[
      juego.nivel - 1
    ];

  const q =
    n.questions[
      juego.pregunta
    ];

  $("nivelJuego").textContent =
    juego.nivel;

  $("vidasJuego").textContent =
    "❤️".repeat(juego.vidas) +
    "🖤".repeat(3 - juego.vidas);

  $("puntosJuego").textContent =
    puntos.toLocaleString();

  $("tituloMision").textContent =
    `Nivel ${juego.nivel} — ${n.title}`;

  $("descripcionMision").textContent =
    `Pregunta ${juego.pregunta + 1} de ${n.questions.length}: ${q[0]}`;

  $("missionBar").style.width =
    (
      juego.pregunta /
      n.questions.length *
      100
    ) + "%";

  $("objetosJuego").innerHTML =
    q[1]
      .map(
        (op,i) => `

          <button
            class="game-option"
            onclick="responderJuego(${i})"
          >

            ${String.fromCharCode(65+i)})
            ${op}

          </button>

        `
      )
      .join("");

  $("mensajeJuego").textContent =
    "";
}

/* =========================
   TEMPORIZADOR
========================= */

function iniciarTemporizador(){

  juego.tiempo = 50;

  $("tiempoJuego").textContent =
    juego.tiempo + "s";

  detenerTemporizador();

  juego.interval =
    setInterval(()=>{

      juego.tiempo--;

      $("tiempoJuego").textContent =
        juego.tiempo + "s";

      if(juego.tiempo <= 0){

        detenerTemporizador();

        juego.activo = false;

        fallarNivel(
          "⏱️ ¡Se acabó el tiempo!"
        );

      }

    },1000);
}

function detenerTemporizador(){

  if(juego.interval){

    clearInterval(
      juego.interval
    );

    juego.interval = null;

  }
}

/* =========================
   RESPONDER JUEGO
========================= */

function responderJuego(index){

  if(!juego.activo)
    return;

  const q =
    niveles[
      juego.nivel - 1
    ].questions[
      juego.pregunta
    ];

  const buttons =
    [
      ...document.querySelectorAll(
        ".game-option"
      )
    ];

  buttons.forEach(
    b => b.disabled = true
  );

  const correct =
    index === q[2];

  buttons[index].classList.add(
    correct
      ? "correct"
      : "wrong"
  );

  if(correct){

    const gain = 100;

    puntos += gain;

    juego.puntosNivel += gain;

    $("mensajeJuego").textContent =
      `🎉 ¡Correcto! +${gain} puntos`;

    saveStats();

    setTimeout(()=>{

      juego.pregunta++;

      if(
        juego.pregunta >=
        niveles[
          juego.nivel - 1
        ].questions.length
      ){

        completarNivel();

      }else{

        mostrarPreguntaJuego();

      }

    },700);

  }else{

    juego.vidas--;

    $("mensajeJuego").textContent =
      "❌ Respuesta incorrecta. Pierdes una vida.";

    $("vidasJuego").textContent =
      "❤️".repeat(juego.vidas) +
      "🖤".repeat(3 - juego.vidas);

    if(juego.vidas <= 0){

      setTimeout(()=>{

        detenerTemporizador();

        juego.activo = false;

        fallarNivel(
          "💔 Te quedaste sin vidas."
        );

      },700);

    }else{

      setTimeout(
        () => mostrarPreguntaJuego(),
        900
      );

    }

  }
}

/* =========================
   COMPLETAR NIVEL
========================= */

function completarNivel(){

  detenerTemporizador();

  juego.activo = false;

  const bonus = 300;

  const timeBonus =
    Math.max(
      0,
      juego.tiempo * 5
    );

  const lifeBonus =
    juego.vidas * 50;

  const totalBonus =
    bonus +
    timeBonus +
    lifeBonus;

  puntos += totalBonus;

  nivelesCompletados =
    Math.max(
      nivelesCompletados,
      juego.nivel
    );

  if(juego.nivel < 10){

    nivelDesbloqueado =
      Math.max(
        nivelDesbloqueado,
        juego.nivel + 1
      );

  }else{

    nivelDesbloqueado = 10;

  }

  if(puntos > mejorPuntuacion){

    mejorPuntuacion =
      puntos;

  }

  const title =
    getTitle(juego.nivel);

  medallas[
    "nivel" + juego.nivel
  ] = true;

  if(juego.nivel === 10){

    medallas.final = true;

  }

  saveStats();

  $("missionBar").style.width =
    "100%";

  $("nivelCompletado")
    .classList
    .remove("hidden");

  $("nivelCompletado").innerHTML = `

    <div style="font-size:60px">
      🎉🏆
    </div>

    <h2>
      ¡Nivel ${juego.nivel} completado!
    </h2>

    <div class="reward">
      <b>${title}</b>
    </div>

    <p>
      ⭐ Puntos del nivel:
      ${juego.puntosNivel}
    </p>

    <p>
      🎁 Bonificación:
      +${totalBonus} puntos
    </p>

    <p>
      ❤️ Vidas restantes:
      ${juego.vidas}
    </p>

    ${
      juego.nivel < 10

        ? `

          <p style="margin-top:12px">
            <b>
              🔓 ¡Nivel ${juego.nivel + 1} desbloqueado!
            </b>
          </p>

          <button
            class="btn"
            onclick="seleccionarNivel(${juego.nivel + 1})"
          >
            ➡️ Continuar al nivel
            ${juego.nivel + 1}
          </button>

        `

        : `

          <p style="margin-top:12px">
            <b>
              👑 ¡EXPERTO EN GESTIÓN DE RIESGOS!
            </b>
          </p>

          <p>
            ⭐ Puntuación final:
            <b>${puntos.toLocaleString()}</b>
          </p>

          <button
            class="btn"
            onclick="seleccionarNivel(10)"
          >
            🔄 Jugar nivel final
          </button>

        `
    }

  `;

  renderLevelGrid();
}

function fallarNivel(msg){

  $("nivelCompletado")
    .classList
    .remove("hidden");

  $("nivelCompletado").innerHTML = `

    <div style="font-size:55px">
      🔄
    </div>

    <h2>
      ${msg}
    </h2>

    <p>
      No pierdes los niveles que ya desbloqueaste.
    </p>

    <button
      class="btn"
      onclick="seleccionarNivel(${juego.nivel})"
    >
      🔄 Intentar de nuevo
    </button>

  `;

  $("objetosJuego").innerHTML =
    "";
}

function reiniciarJuego(){

  seleccionarNivel(
    juego.nivel
  );

}

/* =========================
   TÍTULOS
========================= */

function getTitle(n){

  return [

    "🎒 ¡Preparado para la misión!",

    "🌎 ¡Aprendiz de prevención!",

    "🔥 ¡Guardián de la seguridad!",

    "🌊 ¡Experto en emergencias!",

    "⛰️ ¡Héroe de la prevención!",

    "🌧️ ¡Maestro de la preparación!",

    "👨‍👩‍👧‍👦 ¡Protector de la familia!",

    "🌙 ¡Experto en situaciones difíciles!",

    "🚨 ¡Especialista en emergencias!",

    "👑 ¡EXPERTO EN GESTIÓN DE RIESGOS!"

  ][n - 1];
}

/* =========================
   MEDALLAS
========================= */

const achievementData = [

  [
    "plan",
    "👨‍👩‍👧‍👦",
    "Plan familiar",
    "Crea y guarda tu plan familiar."
  ],

  [
    "simulador",
    "🚨",
    "Simulador",
    "Completa una simulación."
  ],

  [
    "nivel1",
    "🎒",
    "Primera misión",
    "Completa el nivel 1."
  ],

  [
    "nivel3",
    "🔥",
    "Guardián",
    "Completa el nivel 3."
  ],

  [
    "nivel5",
    "⛰️",
    "Héroe",
    "Completa el nivel 5."
  ],

  [
    "nivel7",
    "👨‍👩‍👧‍👦",
    "Protector",
    "Completa el nivel 7."
  ],

  [
    "nivel10",
    "👑",
    "Experto",
    "Completa los 10 niveles."
  ]

];

function renderAchievements(){

  $("logrosContainer").innerHTML =
    achievementData
      .map(a => `

        <article
          class="achievement
          ${medallas[a[0]]
            ? ""
            : "locked"}"
        >

          <span>${a[1]}</span>

          <h3>${a[2]}</h3>

          <p>
            ${
              medallas[a[0]]
                ? "🏅 ¡Desbloqueado!"
                : a[3]
            }
          </p>

        </article>

      `)
      .join("");
}

/* =========================
   EVALUACIÓN
========================= */

function updateEvaluation(){

  const plan =
    localStorage.getItem(
      "planFamiliar"
    )
      ? 1
      : 0;

  const checks =
    document.querySelectorAll(
      ".check-item input"
    );

  const checkPercent =
    checks.length
      ? (
          [...checks]
            .filter(
              x => x.checked
            ).length /
          checks.length
        )
      : 0;

  const gamePercent =
    nivelesCompletados / 10;

  const percent =
    Math.round(
      (
        checkPercent * 40 +
        plan * 20 +
        gamePercent * 40
      )
    );

  $("evaluacionPorcentaje").textContent =
    percent + "%";

  $("evaluacionTexto").textContent =

    percent >= 80

      ? "🎉 Muy buen nivel de preparación."

      : percent >= 50

        ? "👍 Vas avanzando. Sigue practicando."

        : "📚 Continúa completando la mochila, el plan y las misiones.";
}

/* =========================
   SEGURIDAD DE TEXTO
========================= */

function escapeHTML(str){

  return String(str)
    .replace(
      /[&<>"']/g,
      m => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#039;"
      }[m])
    );

}

/* =========================
   INICIO
========================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    cargarPlan();

    checklistItems =
      JSON.parse(
        localStorage.getItem(
          "checklistMochila"
        ) || "[]"
      );

    renderChecklist();

    seleccionarNivel(
      nivelDesbloqueado
    );

    updateDashboard();

  }
);