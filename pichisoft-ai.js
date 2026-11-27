/* =====================================================================
   PICHISOFT AI · La rAI. (chatbot limitado, 100% local, sin servidor)
   <script src="pichisoft-ai.js"></script> al final del <body>

   Solo se editan las 3 cajas de texto de abajo (ACCIONES_RAPIDAS, REGLAS y
   NO_ENTENDIDO). Se escriben como bloques, copiando y pegando uno debajo del otro.
   No hay IDs, ni comas, ni comillas. Todo lo demás (el motor) no se toca.

   ─────────────────────────  GUÍA RÁPIDA  ─────────────────────────

   1) ACCIONES_RAPIDAS  → los botones que aparecen arriba del input
        boton: HOLA
        dice: hola!!
        responde: Hola, ¿todo bien? ¿Quieres saber [acerca de Pichisoft]?

   2) REGLAS  → lo que el usuario puede escribir en el input
        dice: hola | holi | buenas | buen dia
        responde: Hola, ¿todo bien?
      (separás las variantes con |. No importan mayúsculas, tildes ni signos ¿?¡!)
      (si el mensaje CONTIENE una de las frases, responde ese bloque; gana la frase más larga)

   3) NO_ENTENDIDO  → lo que responde si no entiende el mensaje
        responde: No entendí eso.

   ATAJOS (botones dentro de una respuesta)
      En la respuesta escribís [texto del atajo] y justo debajo agregás:
        atajo: texto del atajo
        dice: lo que "dice" el usuario al apretarlo (si lo omitís, dice el texto del atajo)
        responde: lo que responde la IA
      Un atajo puede tener sus propios atajos: se escriben con MÁS sangría (más espacios).
      "dice:" siempre va ANTES de "responde:". La respuesta puede ocupar varias líneas.

   PENSANDO (opcional, en cualquier bloque o atajo)
        pensando: 6                         → segundos que "piensa" (por defecto CFG.pensandoMs)
        paso: Buscando información...       → un "paso" por línea. Si hay pasos, "Pensando..."
        paso: Formulando respuesta...         es un botón que al apretarlo muestra esas líneas

   FORMATO DENTRO DE "responde:"
        # Título          ## Subtítulo        - item de lista
        **negrita**   *cursiva*   ~monoespaciado~
        [Texto](https://url)       link          [Escríbenos](gmail)   abre Gmail a CFG.email
        {panel:faq}                botón que abre un panel (texto automático)
        {panel:faq|Texto propio}   botón de panel con texto propio
        {copiar:texto}             monoespaciado con botón "Copiar"
        | A | B |                  tabla (1ª fila = encabezado; la fila |---|---| es opcional)
                                   (en tablas no uses {panel:..|texto}, por el "|")
      Paneles: config, traducir, mensajeria, compartir, coins, sobre, faq, info,
               reglas, privacidad, cookies, ayuda, consola

   FORMULARIO (preguntas encadenadas, 4b)
        En un atajo agregá la línea  formulario: iniciar  y, al responder ese atajo, la IA empieza a preguntar.
        Las preguntas se escriben en la caja FORMULARIO (pregunta: / opcion: / dice: / rechazo:).
        El link [texto](formulario) abre Gmail con nombre de usuario, UID y las respuestas.

   COMENTARIOS: una línea que empieza con // se ignora.
   IMPORTANTE: dentro de las cajas NO uses el carácter ` (tilde invertida), ni \ ni la
               secuencia  $ {  ; para monoespaciado usá ~texto~.
   ===================================================================== */
(function () {
    'use strict';
    if (window.PichisoftAI) return;

    /* ============ 1) CONFIGURACIÓN GENERAL ============ */
    const CFG = {
        nombre: 'rAI',
        descripcion: '¿Necesitas ayuda con algo que tenga que ver con Pichisoft? Habla con la rAI.',
        tooltip: 'Chat con la RAI',
        placeholder: 'Escribe tu mensaje…',
        pensandoMs: 4000,            // tiempo de "Pensando..." si el bloque no define "pensando:"
        caracteresPorSegundo: 140,   // velocidad de escritura de la IA
        email: 'contacto@pichisoft.cc'
    };

    /* =====================================================================
       2) ACCIONES RÁPIDAS · botones arriba del input
          Cada bloque:  boton: / dice: / responde:   (+ atajos y pensando si querés)
       ===================================================================== */
    const ACCIONES_RAPIDAS = `

boton: Sobre la rAI
dice: Quiero saber acerca de la rAI.
pensando: 14
paso: Buscando información sobre la rAI
paso: Formulando respuesta...
responde: ¡Hola! Por supuesto, aquí tienes información sobre la rAI.
---
# La rAI 
---
La rAI es nuestra IA limitada. Puedes decirme los posibles textos que contienen los botones de arriba del formato. 
¿Quieres [saber acerca de Pichisoft]?

atajo: saber acerca de Pichisoft
dice: Quiero saber acerca de Pichisoft.
pensando: 12
paso: Buscando información sobre Pichisoft
paso: Formulando respuesta...
responde: # Pichisoft
Pichisoft es nuestra página independiente de *PichonApps*, si quieres, puedes ver toda nuestra información en el panel {panel:sobre|Sobre nosotros}.


boton: Trabaja con nosotros
dice: Quiero trabajar con Pichisoft.
pensando: 9
paso: El usuario quiere postularse en el equipo Pichisoft, tendría que prepararme para hacerle un formulario.
paso: Formulando respuesta...
responde: ¡Hola! Perfecto. 
Dime si quieres que te [cree un formulario] para que te postules al Equipo Pichisoft.

atajo: cree un formulario
dice: Haceme un formulario por favor.
pensando: 42
paso: Permitir acceso a ser Admin
paso: Interpretando nombre de usuario
paso: Interpretando UID
paso: Preparando preguntas
paso: Creando un formulario
paso: Compartiendo formulario...
formulario: iniciar
responde: Perfecto. Te haré unas preguntas para sumarte al Equipo Pichisoft. 

boton: Comunícate con nosotros
dice: Quiero comunicarme con el Equipo Pichisoft.
pensando: 7
paso: El usuario quiere comunicarse con nosotros. Necesito averiguar el email de Pichisoft.
paso: Compartiendo email
paso: Formulando respuesta...
responde: ¡Hola! Por supuesto, comunícate aquí: **[contacto@pichisoft.cc](gmail)**.
¿Quieres que te ayude a redactar el mensaje? (Escribe "sí" para continuar).

boton: Sobre Pichisoft
dice: Quiero saber acerca de Pichisoft.
pensando: 14
paso: El usuario quiere saber más acerca de Pichisoft. Debería ofrecerme para más ayuda, quizás ofreciendole que lea nuestros paneles aquí mismo.
paso: Buscando información sobre Pichisoft
paso: Formulando respuesta...
responde: ¡Por supuesto! Aquí tienes información sobre Pichisoft:
---
# Pichisoft
---
Pichisoft es la página independiente que administra **todo** PichonApps y sus aplicaciones y juegos. Fue creada el 10 de mayo de 2026.
¿Quieres que [te pase los links a sus paneles]?

atajo: te pase los links a sus paneles
dice: Sí, por favor. Quiero que me pases los links para ver sus paneles.
pensando: 16
paso: Recopilando información sobre cada panel
paso: Creando links para los paneles
paso: Formulando respuesta...
responde: ¡Por supuesto! Aquí tienes los links a los paneles de Pichisoft.
---
**Sobre nosotros:** {panel:sobre}

**Preguntas frecuentes:** {panel:faq}

**Información general:** {panel:info}

**Nuestras reglas:** {panel:reglas}

**Política de Privacidad:** {panel:privacidad}

**Política de Cookies:** {panel:cookies}

**Ayuda:** {panel:ayuda}

**Consola:** {panel:consola}

**PichiCoins:** {panel:coins}

**Configuración:** {panel:config}

**Traducir:** {panel:traducir}

**Mensajería:** {panel:mensajeria}

**Compartir:** {panel:compartir}


`;

    /* =====================================================================
       3) REGLAS · lo que el usuario puede escribir  →  lo que responde la IA
          Cada bloque:  dice: frase1 | frase2   /   responde: ...
       ===================================================================== */
    const REGLAS = `

dice: Hola | hola | Hola. | hola. | HOLA
pensando: 4
paso: Respondiendo...
responde: ¡Hola! 

dice: Quiero saber acerca de la rAI.
pensando: 14
paso: Buscando información sobre la rAI
paso: Formulando respuesta...
responde: ¡Hola! Por supuesto, aquí tienes información sobre la rAI.
---
# La rAI 
---
La rAI es nuestra IA limitada. Puedes decirme los posibles textos que contienen los botones de arriba del formato. 
¿Quieres [saber acerca de Pichisoft]?

atajo: saber acerca de Pichisoft
dice: Quiero saber acerca de Pichisoft.
pensando: 5
paso: Buscando información sobre Pichisoft
paso: Formulando respuesta...
responde: # Pichisoft
Pichisoft es nuestra página independiente de *PichonApps*, si quieres, puedes ver toda nuestra información en el {panel:sobre|Sobre nosotros}. 

dice: Quiero saber acerca de Pichisoft.
pensando: 12
paso: Buscando información sobre Pichisoft
paso: Formulando respuesta...
responde: # Pichisoft
Pichisoft es nuestra página independiente de *PichonApps*, si quieres, puedes ver toda nuestra información en el {panel:sobre|Sobre nosotros}.

dice: Quiero comunicarme con el Equipo Pichisoft.
pensando: 7
paso: El usuario quiere comunicarse con nosotros. Necesito averiguar el email de Pichisoft.
paso: Compartiendo email
paso: Formulando respuesta...
responde: ¡Hola! Por supuesto, comunícate aquí: **[contacto@pichisoft.cc](gmail)**.
¿Quieres que te ayude a redactar el mensaje? (Escribe "sí" para continuar).
dice: Quiero que me ayudes a redactar el mensaje. | Sí. | Si | Sí | Si
pensando: 4
paso: Espera, todavía no sé qué tipo de mensaje quiere darle al Equipo Pichisoft.
paso: Formulando respuesta...
responde: ¡Entendido! Dime de qué trataría el mensaje:
-Una duda sobre una app (para eso, escribe: "Es sobre una duda de una app", y luego aclara de qué app: "Sobre PichonSnake", "Sobre PichonOpinion", "Sobre PichMan", etc).
-Una duda general (para eso, escribe: "Tengo una duda general.").
-Quieres sugerir una app (para eso, escribe: "Quiero sugerir una app.").
-Quieres postularte para trabajar en Pichisoft (para eso, escribe: "Quiero postularme para trabajar en Pichisoft.").
-Ayuda sobre mi cuenta (para eso, escribe: "Necesito ayuda sobre mi cuenta.").
dice: Es sobre una duda de una app.
pensando: 3
paso: Necesito saber qué app específica.
paso: Formulando respuesta...
responde: ¡Entendido! ¿Sobre qué app tienes una duda?.

dice: Sobre PichonAlarm.
pensando: 29
paso: El usuario tiene una duda sobre PichonAlarm
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonAlarm tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonAlarm: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonBirthday.
pensando: 29
paso: El usuario tiene una duda sobre PichonBirthday
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonBirthday tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonBirthday: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonCalc.
pensando: 29
paso: El usuario tiene una duda sobre PichonCalc
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonCalc tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonCalc: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonCalendar.
pensando: 29
paso: El usuario tiene una duda sobre PichonCalendar
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonCalendar tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonCalendar: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonChess.
pensando: 29
paso: El usuario tiene una duda sobre PichonChess
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonChess tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonChess: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonCode.
pensando: 29
paso: El usuario tiene una duda sobre PichonCode
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonCode tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonCode: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonDestiny.
pensando: 29
paso: El usuario tiene una duda sobre PichonDestiny
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonDestiny tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonDestiny: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonDocs.
pensando: 29
paso: El usuario tiene una duda sobre PichonDocs
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonDocs tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonDocs: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonFood.
pensando: 29
paso: El usuario tiene una duda sobre PichonFood
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonFood tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonFood: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonList.
pensando: 29
paso: El usuario tiene una duda sobre PichonList
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonList tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonList: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichMan.
pensando: 29
paso: El usuario tiene una duda sobre PichMan
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichMan tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichMan: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonMorse.
pensando: 29
paso: El usuario tiene una duda sobre PichonMorse
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonMorse tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonMorse: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonOpinion.
pensando: 29
paso: El usuario tiene una duda sobre PichonOpinion
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonOpinion tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonOpinion: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonPaint.
pensando: 29
paso: El usuario tiene una duda sobre PichonPaint
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonPaint tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonPaint: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonPass.
pensando: 29
paso: El usuario tiene una duda sobre PichonPass
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonPass tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonPass: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonPush.
pensando: 29
paso: El usuario tiene una duda sobre PichonPush
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonPush tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonPush: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonRandom.
pensando: 29
paso: El usuario tiene una duda sobre PichonRandom
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonRandom tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").
---
# Email para Pichisoft
Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonRandom: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonSnake.
pensando: 29
paso: El usuario tiene una duda sobre PichonSnake

paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonSnake tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").


# Email para Pichisoft

Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonSnake: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonTraffic.
pensando: 29
paso: El usuario tiene una duda sobre PichonTraffic
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonTraffic tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").


# Email para Pichisoft

Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonTraffic: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonWatch.
pensando: 29
paso: El usuario tiene una duda sobre PichonWatch
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonWatch tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").


# Email para Pichisoft

Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonWatch: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Sobre PichonWeather.
pensando: 29
paso: El usuario tiene una duda sobre PichonWeather
paso: Preparando email
paso: Formulando respuesta...
responde: ¡Perfecto! Aquí tienes tu email ya preparado, solo tienes que especificar qué duda de PichonWeather tiene, tu nombre de usuario (al final, en el "Saludos cordiales, tu nombre").


# Email para Pichisoft

Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre PichonWeather: (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Tengo una duda general.
pensando: 16
paso: El usuario tiene una duda general.
paso: Redactando email.
paso: Formulando respuesta...
responde: ¡Por supuesto! Aquí tienes el email ya redactado para que se lo mandes a Pichisoft. (Solo aclara la duda general que tengas y aclara tu nombre de usuario.)
---
# Email para Pichisoft

Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, tengo una duda sobre (TU DUDA).
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Quiero sugerir una app.
pensando: 12
paso: El usuario quiere sugerir una app.
paso: Redactando email...
paso: Formulando respuesta...
responde: ¡Por supuesto! Aquí tienes el email ya redactado para que se lo mandes a Pichisoft. Tienes que aclarar estas cosas: el nombre de la app, de qué tratará la app, y tu nombre de usuario exacto.
# Email para Pichisoft

Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, deseo sugerir una app nueva para PichonApps.
Nombre de la app: (EL-NOMBRE-DE-TU-APP).
La app trataría sobre (ACLARA-DE-QUÉ-TRATARÍA-TU-APP).
¡Muchas gracias!
Este email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Necesito ayuda sobre mi cuenta.
pensando: 16
paso: El usuario necesita ayuda sobre su cuenta.
paso: Redactando email.
paso: Formulando respuesta...
responde: ¡Por supuesto! Aquí tienes el email ya redactado para que se lo mandes a Pichisoft. (Solo aclara tu duda que tengas y aclara tu nombre de usuario.)
---
# Email para Pichisoft

Hola, Equipo Pichisoft. Espero que se encuentren muy bien.
Quiero comunicarles que, necesito ayuda sobre mi cuenta: (TU-DUDA).
Esta email fue redactado por la rAI.
Saludos cordiales,
(TU-NOMBRE-DE-USUARIO-EXACTO).

dice: Quiero postularme para trabajar en Pichisoft.
pensando: 4
paso: El usuario se quiere postular para trabajar en Pichisoft.
paso: Para eso, ya existe una función.
paso: Formulando respuesta...
responde: Para eso, aprieta el botón "Trabaja con nosotros", y sigue las instrucciones.

dice: ¡Gracias! | Gracias | Gracias. | Gracias!
pensando: 3
paso: Formulando respuesta...
responde: ¡No hay de qué! ¡No dudes en consultarme ante cualquier cosa!
`;

    /* =====================================================================
       4) NO ENTENDIDO · respuesta cuando el mensaje no coincide con ninguna regla
       ===================================================================== */
    const NO_ENTENDIDO = `

responde: Soy una IA limitada y solo puedo entender determinados mensajes.

`;

    /* =====================================================================
       4b) FORMULARIO · preguntas que hace la IA una tras otra (se inicia desde un atajo con "formulario: iniciar")
          pensando: segundos que "piensa" antes de cada pregunta
          asunto:   asunto del email · final: mensaje al terminar (el link  [texto](formulario)  abre Gmail ya armado)
          pregunta: / opcion: / dice: (opcional) / rechazo: (opcional: si elige esa opción, el test termina con ese mensaje)
       ===================================================================== */
    const FORMULARIO = `

pensando: 1.5
asunto: Postulación al Equipo Pichisoft
final: ¡Has pasado nuestro test! Ya puedes [enviar el formulario al Equipo Pichisoft](formulario). ¡Suerte y felicidades!

pregunta: ¿Te caracterizas por...?
opcion: Atención al cliente
dice: Me caracterizo por la atención al cliente.
opcion: Administración de cuentas
dice: Me caracterizo por la administración de cuentas.
opcion: Solución de problemas
dice: Me caracterizo por la solución de problemas.
opcion: Una mezcla de todo eso
dice: Me caracterizo por una mezcla de todo eso.

pregunta: Aproximadamente, ¿desde hace cuánto tiempo usas Pichisoft?
opcion: Menos de 1 mes
dice: Desde hace menos de 1 mes.
rechazo: Lo siento, no puedes ser admin de Pichisoft con una experiencia de menos de 1 mes.
opcion: Entre 1 y 3 meses
dice: Desde hace entre 1 y 3 meses.
opcion: Entre 3 y 6 meses
dice: Desde hace entre 3 y 6 meses.
opcion: Hace más de 6 meses
dice: Desde hace más de 6 meses.

pregunta: ¿Con qué frecuencia usas Pichisoft?
opcion: Todos los días
dice: Uso Pichisoft todos los días.
opcion: Varias veces por semana
dice: Uso Pichisoft varias veces por semana.
opcion: Una vez por semana
dice: Uso Pichisoft una vez por semana.
opcion: Casi nunca
dice: No suelo usar Pichisoft.
rechazo: Lo siento, tienes que usar frecuentemente Pichisoft (o al menos una vez por semana) para que puedas postularte a nuestro Equipo.

pregunta: ¿Cuánto tiempo a la semana podrías dedicar al Equipo Pichisoft?
opcion: Menos de 2 horas
dice: Podría dedicarle menos de 2 horas a la semana.
opcion: Entre 2 y 5 horas
dice: Podría dedicarle entre 2 y 5 horas.
opcion: Entre 5 y 10 horas
dice: Podría dedicarle entre 5 y 10 horas.
opcion: Más de 10 horas
dice: Podría dedicarle más de 10 horas a la semana.

pregunta: ¿Qué parte de Pichisoft conoces mejor?
opcion: PichonApps y sus apps
dice: Conozco mejor PichonApps y sus apps.
opcion: PichiCoins y temas
dice: Conozco mejor los PichiCoins y sus temas.
opcion: Mensajería y comunidad
dice: Conozco mejor la Mensajería y comunidad.
opcion: Cuentas y configuración
dice: Conozco mejor las cuentas y configuración.
opcion: Una mezcla de todo.
dice: Conozco todo.

pregunta: ¿Has ayudado antes a otros usuarios con algún problema?
opcion: Sí, muchas veces
dice: He ayudado muchas veces a otros usuarios con algún problema.
opcion: Sí, alguna vez
dice: He ayudado algunas veces a otros usuarios con algún problema.
opcion: Nunca, pero quiero hacerlo
dice: ¡Deseo ayudar a otros usuarios de Pichisoft!

pregunta: Si un usuario se queja con enojo, ¿qué harías?
opcion: Escucharlo con calma y buscar una solución
dice: Escucharlo con calma y buscar una solución.
opcion: Derivarlo a otro miembro del equipo
dice: Lo derivaría a otro miembro del equipo.
opcion: Pedirle que escriba su reclamo por email
dice: Le pediría que escriba su reclamo formalmente por email.
opcion: Ignorarlo hasta que se calme
dice: Lo ignoraría hasta que se calme.
rechazo: Esa no es la actitud que buscamos en el Equipo Pichisoft.

pregunta: ¿Acepta mantener un lenguaje profecional, adecuado, respetuoso y formal ante cualquier usuario/admin de Pichisoft?
opcion: Sí, acepto.
dice: Sí, acepto.
opcion: No acepto.
dice: No acepto.
rechazo: Para formar parte del Equipo Pichisoft es obligatorio ser respetuoso ante los representantes de Pichisoft.

pregunta: ¿Aceptas cumplir Nuestras reglas y mantener la confidencialidad de los datos de los usuarios?
opcion: Sí, acepto
dice: Sí, acepto.
opcion: No acepto
dice: No acepto.
rechazo: Para formar parte del equipo es obligatorio aceptar las reglas y la confidencialidad.
`;

    /* ============ 5) PANELES (lo que abren los botones {panel:...}) ============ */
    const q = s => () => { const e = document.querySelector(s); if (e) e.click(); };
    const PANELES = {
        config: { n: 'Configuración', run: q('#pGear') },
        traducir: { n: 'Traducir', run: () => window.PichisoftIdiomas ? window.PichisoftIdiomas.abrir() : q('#psi-btn')() },
        mensajeria: { n: 'Mensajería', run: () => window.PichisoftMensajeria && window.PichisoftMensajeria.abrir('chat') },
        compartir: { n: 'Compartir', run: q('#pf-share-btn') },
        coins: { n: 'PichiCoins', run: () => window.PichiCoins && window.PichiCoins.abrir() },
        sobre: { n: 'Sobre nosotros', run: q('.pf-btn[data-pf="sobre"]') },
        faq: { n: 'Preguntas frecuentes', run: q('.pf-btn[data-pf="faq"]') },
        info: { n: 'Información general', run: q('.pf-btn[data-pf="info"]') },
        reglas: { n: 'Nuestras reglas', run: q('.pf-btn[data-pf="reglas"]') },
        privacidad: { n: 'Política de Privacidad', run: q('.pf-btn[data-pf="privacidad"]') },
        cookies: { n: 'Política de Cookies', run: q('.pf-btn[data-pf="cookies"]') },
        ayuda: { n: 'Ayuda', run: q('.pf-btn[data-pf="ayuda"]') },
        consola: { n: 'Consola', run: () => window.PichisoftAtajos && window.PichisoftAtajos.consola() }
    };

    /* ============ 6) ÍCONOS (CSS mask, toman el color del tema) ============ */
    const ICON_AI = '<path d="M2 19 7.5 5 13 19"/><path d="M4 14.5h7"/><path d="M17 5v14"/><path d="M14.5 5h5"/><path d="M14.5 19h5"/>';
    const ICON_COPY = '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
    const ICON_SEND = '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>';

    /* =====================================================================
       MOTOR (no hace falta tocar de acá para abajo)
       ===================================================================== */
    const GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + CFG.email;
    const mask = inner => 'url("data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>') + '")';
    const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

    /* ---------- Lector de bloques ---------- */
    const KEY_RX = /^(\s*)(bot[oó]n|dice|responde|atajo|pensando|paso|formulario):[ \t]?(.*)$/i;
    function nodoNuevo(ind) { return { indent: ind, nombre: '', dice: null, resp: false, texto: [], pensandoMs: 0, pasos: [], atajos: [], frases: [], iniciaForm: false, fn: null, ok: null }; }

    function parsear(src, modo) {            // modo: 'boton' (acciones rápidas) | 'regla'
        const raices = [], pila = [];
        let cur = null;                       // arreglo donde se acumulan las líneas de "responde:"
        const top = () => pila[pila.length - 1];
        const nueva = ind => { const n = nodoNuevo(ind); raices.push(n); pila.length = 0; pila.push(n); return n; };
        String(src).split(/\r?\n/).forEach(raw => {
            if (/^\s*\/\//.test(raw)) return;
            const m = raw.match(KEY_RX);
            if (!m) { if (raw.trim() && cur) cur.push(raw.trim()); return; }
            const ind = m[1].replace(/\t/g, '    ').length, key = m[2].toLowerCase().replace('ó', 'o'), val = m[3].trim();
            let t;
            if (key === 'boton') {
                if (modo !== 'boton') { console.warn('[PichisoftAI] "boton:" solo va en ACCIONES_RAPIDAS'); return; }
                nueva(ind).nombre = val; cur = null; return;
            }
            if (key === 'atajo') {
                if (!pila.length) { console.warn('[PichisoftAI] "atajo:" sin bloque previo: ' + val); return; }
                while (pila.length > 1 && top().indent >= ind) pila.pop();
                const n = nodoNuevo(ind); n.nombre = val; top().atajos.push(n); pila.push(n); cur = null; return;
            }
            if (key === 'dice') {
                t = top();
                if (modo === 'regla' && (!t || ((t.dice !== null || t.resp) && ind <= pila[0].indent))) t = nueva(ind);
                if (!t) { console.warn('[PichisoftAI] "dice:" sin "boton:" previo: ' + val); return; }
                t.dice = val; cur = null; return;
            }
            t = top();
            if (!t && modo === 'regla' && key === 'responde') t = nueva(ind);
            if (!t) { console.warn('[PichisoftAI] "' + key + ':" sin bloque previo'); return; }
            if (key === 'responde') { t.resp = true; t.texto = []; if (val) t.texto.push(val); cur = t.texto; }
            else if (key === 'pensando') { const s = parseFloat(val.replace(',', '.')); t.pensandoMs = s > 0 ? s * 1000 : 0; cur = null; }
            else if (key === 'paso') { if (val) t.pasos.push(val); cur = null; }
            else if (key === 'formulario') { t.iniciaForm = true; cur = null; }
        });
        return raices;
    }

    const ACCIONES = parsear(ACCIONES_RAPIDAS, 'boton').filter(n => n.nombre);
    const REGLAS_L = parsear(REGLAS, 'regla').filter(n => n.dice);
    REGLAS_L.forEach(n => { n.frases = n.dice.split('|').map(norm).filter(Boolean); });
    const NOENT = parsear(NO_ENTENDIDO, 'regla')[0] || null;
    const SIN_CONFIGURAR = { texto: ['(Esta respuesta todavía no está configurada.)'], pensandoMs: 0, pasos: [], atajos: [] };

    /* ---------- Formulario ---------- */
    const FKEY = /^\s*(pregunta|opci[oó]n|dice|rechazo|final|asunto|pensando):[ \t]?(.*)$/i;
    function parsearForm(src) {
        const F = { preguntas: [], final: [], asunto: 'Postulación al Equipo Pichisoft', pensandoMs: 1500 };
        let q = null, o = null, cur = null;
        String(src).split(/\r?\n/).forEach(raw => {
            if (/^\s*\/\//.test(raw)) return;
            const m = raw.match(FKEY);
            if (!m) { if (raw.trim() && cur) cur.push(raw.trim()); return; }
            const k = m[1].toLowerCase().replace('ó', 'o'), v = m[2].trim(); cur = null;
            if (k === 'asunto') F.asunto = v;
            else if (k === 'pensando') { const x = parseFloat(v.replace(',', '.')); if (x > 0) F.pensandoMs = x * 1000; }
            else if (k === 'final') { F.final = v ? [v] : []; cur = F.final; }
            else if (k === 'pregunta') { q = { texto: v, opciones: [] }; o = null; F.preguntas.push(q); }
            else if (k === 'opcion') { if (!q) return; o = { nombre: v, dice: '', rechazo: [] }; q.opciones.push(o); }
            else if (k === 'dice') { if (o) o.dice = v; }
            else if (k === 'rechazo') { if (o) { o.rechazo = v ? [v] : []; cur = o.rechazo; } }
        });
        F.preguntas = F.preguntas.filter(x => x.opciones.length);
        return F;
    }
    const FORM_DEF = parsearForm(FORMULARIO);
    let FORM = null;                          // { resp: [ {p, r}, ... ] }
    const nodoTexto = texto => Object.assign(nodoNuevo(0), { texto: texto, pensandoMs: FORM_DEF.pensandoMs });

    function urlFormulario() {
        const P = window.Pichisoft, u = (P && P.user) || {}, nombre = u.name || 'Usuario', uid = (P && P.uid) || 'No disponible';
        const L = ['Hola, Equipo Pichisoft. Dejo este formulario mío hecho por la rAI.', '', 'Nombre de usuario: ' + nombre, 'UID: ' + uid, ''];
        ((FORM && FORM.resp) || []).forEach((x, i) => { if (x) L.push('Pregunta ' + (i + 1) + ': ' + x.p, 'Respuesta: ' + x.r, ''); });
        L.push('Saludos cordiales,', nombre);
        return GMAIL + '&su=' + encodeURIComponent(FORM_DEF.asunto) + '&body=' + encodeURIComponent(L.join('\n'));
    }
    function iniciarForm() {
        if (!FORM_DEF.preguntas.length) { responder(nodoTexto(['(El formulario todavía no está configurado.)'])); return; }
        FORM = { resp: [] }; preguntar(0);
    }
    function preguntar(i) {
        const P = FORM_DEF.preguntas, q = P[i];
        const n = nodoTexto(['## Pregunta ' + (i + 1) + ' de ' + P.length, q.texto].concat(q.opciones.map(o => '- [' + o.nombre + ']')));
        n.atajos = q.opciones.map(o => {
            const a = nodoNuevo(0); a.nombre = o.nombre; a.dice = o.dice || o.nombre;
            a.ok = () => !!FORM && FORM.resp.length === i;          // ignora botones de preguntas viejas
            a.fn = () => elegir(i, o);
            return a;
        });
        responder(n);
    }
    function elegir(i, o) {
        FORM.resp[i] = { p: FORM_DEF.preguntas[i].texto, r: o.nombre };
        if (o.rechazo.length) { FORM = null; responder(nodoTexto(o.rechazo)); }
        else if (i + 1 < FORM_DEF.preguntas.length) preguntar(i + 1);
        else responder(nodoTexto(FORM_DEF.final));
    }

    function buscar(txt) {
        const t = ' ' + norm(txt) + ' ';
        let mejor = null, len = 0;
        REGLAS_L.forEach(r => r.frases.forEach(f => {
            if (f.length > len && t.indexOf(' ' + f + ' ') !== -1) { mejor = r; len = f.length; }
        }));
        return mejor || NOENT;
    }

    /* ---------- Render de texto enriquecido (seguro: todo con textContent) ---------- */
    const RX = /\{(panel|copiar):([^}]*)\}|\[([^\]]+)\]\(([^)\s]+)\)|\[([^\]]+)\]|\*\*(.+?)\*\*|[`~]([^`~]+)[`~]|\*([^*]+)\*/;

    function copiar(txt, span) {
        const ok = () => { span.textContent = '¡Copiado!'; setTimeout(() => { span.textContent = 'Copiar'; }, 1500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, ok);
        else { const t = el('textarea'); t.value = txt; document.body.append(t); t.select(); try { document.execCommand('copy'); } catch (e) { } t.remove(); ok(); }
    }

    function inline(txt, dest, full, ctx) {
        const rx = new RegExp(RX.source, 'g');
        let last = 0, m;
        while ((m = rx.exec(txt))) {
            if (m.index > last) dest.append(txt.slice(last, m.index));
            last = rx.lastIndex;
            if ((m[1] || m[3] || m[5]) && !full) { dest.append(m[0]); continue; }   // el usuario no puede poner botones ni links
            if (m[1] === 'panel') {
                const p = m[2].split('|'), k = p[0].trim(), info = PANELES[k];
                const b = el('button', 'pai-chipb pai-panelb', ((p[1] || '').trim() || (info && info.n) || k));
                b.type = 'button'; b.onclick = () => abrirPanel(k); dest.append(b);
            } else if (m[1] === 'copiar') {
                const w = el('span', 'pai-copy'), c = el('code', null, m[2].trim()), b = el('button', 'pai-copyb'), i = el('i', 'pai-ico'), s = el('span', null, 'Copiar');
                b.type = 'button'; i.style.setProperty('--ic', mask(ICON_COPY)); b.append(i, s);
                b.onclick = () => copiar(m[2].trim(), s);
                w.append(c, b); dest.append(w);
            } else if (m[3]) {
                const href = m[4] === 'gmail' ? GMAIL : m[4] === 'formulario' ? urlFormulario() : m[4];
                if (/^https?:\/\//i.test(href)) {
                    const a = el('a', null, m[3]); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; dest.append(a);
                } else dest.append(m[0]);
            } else if (m[5]) {
                const at = ctx && ctx.atajos.find(a => norm(a.nombre) === norm(m[5]));
                if (at) { const b = el('button', 'pai-chipb', m[5]); b.type = 'button'; b.onclick = () => enviarNodo(at); dest.append(b); }
                else { console.warn('[PichisoftAI] Falta definir el atajo: ' + m[5]); dest.append(m[0]); }
            } else if (m[6] != null) { const s = el('strong'); inline(m[6], s, full, ctx); dest.append(s); }
            else if (m[7] != null) dest.append(el('code', 'pai-mono', m[7]));
            else if (m[8] != null) { const s = el('em'); inline(m[8], s, full, ctx); dest.append(s); }
        }
        if (last < txt.length) dest.append(txt.slice(last));
    }

    function bloques(L, dest, ctx) {
        let i = 0;
        while (i < L.length) {
            const l = L[i];
            if (/^\s*\|/.test(l)) {
                const filas = [];
                while (i < L.length && /^\s*\|/.test(L[i])) { filas.push(L[i]); i++; }
                const t = el('table', 'pai-tbl'); let primera = true;
                filas.forEach(f => {
                    if (/^[\s|:-]+$/.test(f) && f.indexOf('-') !== -1) return;
                    const tr = el('tr');
                    f.trim().replace(/^\||\|$/g, '').split('|').forEach(c => { const td = el(primera ? 'th' : 'td'); inline(c.trim(), td, true, ctx); tr.append(td); });
                    primera = false; t.append(tr);
                });
                dest.append(t); continue;
            }
            if (/^\s*-\s+/.test(l)) {
                const ul = el('ul', 'pai-ul');
                while (i < L.length && /^\s*-\s+/.test(L[i])) { const li = el('li'); inline(L[i].replace(/^\s*-\s+/, ''), li, true, ctx); ul.append(li); i++; }
                dest.append(ul); continue;
            }
            i++;
            if (!l.trim()) continue;
            if (/^---+$/.test(l.trim())) { dest.append(el('div', 'pai-gap', '\u00a0')); continue; }
            let d;
            if (/^##\s+/.test(l)) { d = el('div', 'pai-t2'); inline(l.replace(/^##\s+/, ''), d, true, ctx); }
            else if (/^#\s+/.test(l)) { d = el('div', 'pai-t1'); inline(l.replace(/^#\s+/, ''), d, true, ctx); }
            else { d = el('div', 'pai-p'); inline(l, d, true, ctx); }
            dest.append(d);
        }
    }

    /* ---------- Escritura progresiva (rAF, sin timers pesados) ---------- */
    function revelar(root) {
        return new Promise(res => {
            const nodos = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            while (w.nextNode()) { const n = w.currentNode, a = Array.from(n.data); nodos.push({ n, a, k: 0 }); }
            root.querySelectorAll('*').forEach(e => e.classList.add('pai-x'));
            nodos.forEach(o => { o.n.data = ''; });
            let i = 0, acc = 0, prev = performance.now();
            const mostrar = n => { for (let p = n.parentNode; p && p !== root; p = p.parentNode) if (p.classList) p.classList.remove('pai-x'); };
            function frame(now) {
                acc += (now - prev) / 1000 * CFG.caracteresPorSegundo; prev = now;
                let k = Math.floor(acc); acc -= k;
                while (k > 0 && i < nodos.length) {
                    const o = nodos[i];
                    if (o.k === 0) mostrar(o.n);
                    const take = Math.min(o.a.length - o.k, k);
                    o.n.data += o.a.slice(o.k, o.k + take).join(''); o.k += take; k -= take;
                    if (o.k >= o.a.length) i++;
                }
                log.scrollTop = log.scrollHeight;
                if (i < nodos.length) requestAnimationFrame(frame); else res();
            }
            requestAnimationFrame(frame);
        });
    }

    /* ---------- "Pensando..." ---------- */
    function pensar(holder, n) {
        const ms = n.pensandoMs || CFG.pensandoMs, pasos = n.pasos;
        const wrap = el('div', 'pai-think'); holder.append(wrap);
        log.scrollTop = log.scrollHeight;
        if (!pasos.length) {
            wrap.append(el('span', 'pai-live', 'Pensando...'));
            return new Promise(r => setTimeout(() => { wrap.remove(); r(); }, ms));
        }
        const b = el('button', 'pai-think-b'), t = el('span', 'pai-live', 'Pensando...'), lista = el('div', 'pai-steps');
        b.type = 'button'; b.append(t); wrap.append(b, lista);
        b.onclick = () => { lista.classList.toggle('open'); b.classList.toggle('open'); log.scrollTop = log.scrollHeight; };
        const tms = [];
        pasos.forEach((s, i) => tms.push(setTimeout(() => { lista.append(el('div', null, s)); }, Math.floor(ms * i / pasos.length))));
        return new Promise(r => setTimeout(() => {
            tms.forEach(clearTimeout);
            if (lista.children.length < pasos.length) { lista.textContent = ''; pasos.forEach(s => lista.append(el('div', null, s))); }
            t.className = ''; t.textContent = 'Pensó durante ' + Math.round(ms / 1000) + ' s';
            r();
        }, ms));
    }

    /* ---------- Chat ---------- */
    let modal = null, log = null, inp = null, card = null, busy = false;

    function mostrarUsuario(txt) {
        const d = el('div', 'pai-msg pai-user'); inline(txt, d, false, null); log.append(d); log.scrollTop = log.scrollHeight;
    }
    function enviarTexto(txt) {
        txt = (txt || '').trim(); if (!txt || busy) return;
        mostrarUsuario(txt); responder(buscar(txt));
    }
    function enviarNodo(n) {                  // botón rápido o atajo
        if (busy || (n.ok && !n.ok())) return;
        mostrarUsuario(n.dice || n.nombre);
        if (n.fn) n.fn(); else responder(n);
    }
    async function responder(n) {
        busy = true; card.classList.add('busy');
        const inicia = !!(n && n.iniciaForm);
        try {
            if (!n || !n.texto.length) n = SIN_CONFIGURAR;
            const msg = el('div', 'pai-msg pai-ai'), cuerpo = el('div');
            log.append(msg);
            await pensar(msg, n);
            msg.append(cuerpo); bloques(n.texto, cuerpo, n);
            await revelar(cuerpo);
        } catch (e) { console.error(e); }
        busy = false; card.classList.remove('busy');
        if (inicia) iniciarForm();
    }
    function abrirPanel(k) {
        const p = PANELES[k]; if (!p) return;
        cerrar(); setTimeout(() => { try { p.run(); } catch (e) { console.error(e); } }, 80);
    }
    function envolver(m) {
        const s = inp.selectionStart, e = inp.selectionEnd, v = inp.value;
        inp.value = v.slice(0, s) + m + v.slice(s, e) + m + v.slice(e);
        const pos = s === e ? s + m.length : e + m.length * 2;
        inp.focus(); inp.setSelectionRange(pos, pos);
    }

    const CSS = `
#pai-modal .pai-card{display:flex;flex-direction:column;width:min(680px,94vw);height:min(82vh,740px);max-height:92vh;padding:0;overflow:hidden;background:#0d0d0d;border:1px solid var(--gold,#d4af37);border-radius:16px}
#pai-modal .pf-header{flex:none}
.pai-desc{flex:none;padding:10px 18px;font-size:.85rem;color:#bdbdbd;border-bottom:1px solid #262626}
.pai-log{flex:1;min-height:0;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:12px;overscroll-behavior:contain}
.pai-msg{max-width:90%;padding:10px 13px;border-radius:14px;font-size:.92rem;line-height:1.5;word-break:break-word;user-select:text;-webkit-user-select:text}
.pai-user{align-self:flex-end;background:#2a2412;border:1px solid var(--gold,#d4af37);color:#fff;border-bottom-right-radius:4px}
.pai-ai{align-self:flex-start;background:#171717;border:1px solid #2c2c2c;color:#e8e8e8;border-bottom-left-radius:4px}
.pai-x{display:none!important}
.pai-t1{font-size:1.15rem;font-weight:bold;color:var(--gold2,#f1d98a);margin:2px 0 6px}
.pai-t2{font-size:.98rem;font-weight:bold;color:var(--gold,#d4af37);margin:8px 0 4px}
.pai-p{margin:0 0 6px}
.pai-gap{line-height:.9}
.pai-ul{margin:4px 0 6px;padding-left:20px}
.pai-ai a{color:var(--gold2,#f1d98a);text-decoration:underline}
.pai-msg code,.pai-copy code{font-family:ui-monospace,Consolas,"Courier New",monospace}
.pai-mono{background:#0a0a0a;border:1px solid #333;border-radius:5px;padding:1px 5px;font-size:.86em}
.pai-copy{display:inline-flex;align-items:center;gap:8px;max-width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:3px 4px 3px 10px;margin:2px 0}
.pai-copy code{font-size:.85rem;color:#fff;word-break:break-all}
.pai-copyb,.pai-chipb,.pai-q,.pai-f,.pai-send,.pai-think-b{font-family:inherit;cursor:pointer}
.pai-copyb{display:inline-flex;align-items:center;gap:5px;background:#1d1d1d;border:1px solid var(--gold,#d4af37);color:var(--gold2,#f1d98a);border-radius:6px;padding:3px 8px;font-size:.74rem;font-weight:bold}
.pai-copyb:hover{background:var(--gold,#d4af37);color:#111}
.pai-ico{width:14px;height:14px;display:block;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat}
.pai-chipb{display:inline-block;margin:2px 3px 2px 0;padding:2px 11px;border-radius:999px;border:1px solid var(--gold,#d4af37);background:#1d1a10;color:var(--gold2,#f1d98a);font-size:.88em;font-weight:bold}
.pai-chipb:hover{background:var(--gold,#d4af37);color:#111}
.pai-panelb::after{content:" ↗"}
.pai-tbl{display:block;overflow-x:auto;max-width:100%;border-collapse:collapse;margin:6px 0;font-size:.85rem}
.pai-tbl th,.pai-tbl td{border:1px solid #333;padding:5px 10px;text-align:left}
.pai-tbl th{background:#222;color:var(--gold2,#f1d98a)}
.pai-think{font-size:.82rem;color:#8a8a8a;margin-bottom:4px}
.pai-think-b{background:none;border:0;color:#9a9a9a;padding:0;font-size:inherit;display:inline-flex;align-items:center;gap:6px}
.pai-think-b::after{content:"▾";font-size:.8em;transition:transform .15s}
.pai-think-b.open::after{transform:rotate(180deg)}
.pai-live{animation:pai-pulse 1.2s ease-in-out infinite}
@keyframes pai-pulse{50%{opacity:.35}}
.pai-steps{display:none;margin:6px 0 4px;padding-left:10px;border-left:2px solid #333;color:#777;font-size:.8rem;line-height:1.6}
.pai-steps.open{display:block}
.pai-quick{flex:none;display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px 0;max-height:96px;overflow-y:auto}
.pai-q{padding:5px 12px;border-radius:999px;border:1px solid #3a3a3a;background:#161616;color:#ddd;font-size:.8rem}
.pai-q:hover{border-color:var(--gold,#d4af37);color:var(--gold2,#f1d98a)}
.pai-row{flex:none;display:flex;align-items:center;gap:6px;padding:10px 14px 14px}
.pai-f{width:30px;height:36px;border-radius:8px;border:1px solid #333;background:#161616;color:#ddd;font-size:.9rem;padding:0}
.pai-f:hover{border-color:var(--gold,#d4af37);color:var(--gold2,#f1d98a)}
.pai-row input{flex:1;min-width:0;background:#000;border:1px solid #333;border-radius:10px;color:#fff;padding:9px 12px;font:16px Verdana,sans-serif;outline:0}
.pai-row input:focus{border-color:var(--gold,#d4af37)}
.pai-send{width:38px;height:38px;border:0;border-radius:10px;background:linear-gradient(135deg,var(--gold2,#f1d98a),var(--gold,#d4af37));color:#1a1405;display:flex;align-items:center;justify-content:center;padding:0}
.pai-send .pai-ico{width:17px;height:17px}
.pai-card.busy .pai-q,.pai-card.busy .pai-send{opacity:.5;pointer-events:none}
`;

    function crear() {
        if (modal) return;
        const st = el('style'); st.textContent = CSS; document.head.append(st);
        modal = el('div', 'pf-modal'); modal.id = 'pai-modal'; modal.setAttribute('translate', 'no');
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = '<div class="pf-card pai-card"><div class="pf-header"><h2></h2>' +
            '<button class="pf-close" type="button" aria-label="Cerrar ventana">✕</button></div>' +
            '<div class="pai-desc"></div><div class="pai-log"></div><div class="pai-quick"></div>' +
            '<div class="pai-row"><button class="pai-f" type="button" data-m="**" aria-label="Negrita"><b>B</b></button>' +
            '<button class="pai-f" type="button" data-m="*" aria-label="Cursiva"><i>I</i></button>' +
            '<button class="pai-f" type="button" data-m="~" aria-label="Monoespaciado"><span style="font-family:monospace">&lt;/&gt;</span></button>' +
            '<input type="text" autocomplete="off" spellcheck="false"><button class="pai-send" type="button" aria-label="Enviar"><i class="pai-ico"></i></button></div></div>';
        document.body.append(modal);
        card = modal.querySelector('.pai-card'); log = modal.querySelector('.pai-log'); inp = modal.querySelector('input');
        modal.querySelector('h2').textContent = CFG.nombre;
        modal.querySelector('.pai-desc').textContent = CFG.descripcion;
        inp.placeholder = CFG.placeholder;
        modal.querySelector('.pai-send .pai-ico').style.setProperty('--ic', mask(ICON_SEND));
        const quick = modal.querySelector('.pai-quick');
        if (!ACCIONES.length) quick.style.display = 'none';
        ACCIONES.forEach(n => {
            const b = el('button', 'pai-q', n.nombre); b.type = 'button';
            b.onclick = () => enviarNodo(n); quick.append(b);
        });
        modal.querySelector('.pf-close').onclick = cerrar;
        modal.addEventListener('click', e => { if (e.target === modal) cerrar(); });
        modal.querySelectorAll('.pai-f').forEach(b => b.onclick = () => envolver(b.dataset.m));
        modal.querySelector('.pai-send').onclick = () => { const v = inp.value; inp.value = ''; enviarTexto(v); inp.focus(); };
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const v = inp.value; inp.value = ''; enviarTexto(v); } });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && abierto()) cerrar(); });
    }
    const abierto = () => !!(modal && modal.classList.contains('open'));
    function abrir() {
        crear();
        modal.classList.add('open');
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => inp.focus(), 50);
    }
    function cerrar() {
        if (!modal) return;
        modal.classList.remove('open');
        document.documentElement.style.overflow = '';
    }

    /* ---------- Botones (solo con cuenta): barra de íconos (Interfaz optimizada) y panel de abajo (otras interfaces) ---------- */
    let usuario = false;
    function quitarBotones() {
        document.querySelectorAll('.pai-btn,.pai-sep,#pf-ai').forEach(e => e.remove());
    }
    function sincronizar() {
        if (!usuario) { quitarBotones(); cerrar(); return true; }
        const bar = document.getElementById('ps-obar'), pie = document.getElementById('pf-consola');
        if (bar && !bar.querySelector('.pai-btn')) {
            const s = el('span', 'ps-ob-s pai-sep'), b = el('button', 'ps-ob-b pai-btn'), i = el('i');
            b.type = 'button'; b.setAttribute('aria-label', CFG.tooltip); b.dataset.tip = CFG.tooltip;
            i.setAttribute('aria-hidden', 'true'); i.style.setProperty('--ic', mask(ICON_AI));
            b.append(i); b.onclick = abrir; bar.append(s, b);
        }
        if (pie && !document.getElementById('pf-ai')) {
            const b = el('button', 'pf-btn', CFG.nombre); b.id = 'pf-ai'; b.type = 'button'; b.title = CFG.tooltip;
            b.onclick = abrir; pie.after(b);
        }
        return !!(bar && pie);
    }
    function iniciar() {
        const P = window.Pichisoft;
        if (P && typeof P.onAuth === 'function') P.onAuth(u => { usuario = !!u; sincronizar(); });
        else usuario = !!(P && P.user);
        /* la barra y el footer pueden aparecer un poco después: se reintenta unos segundos */
        let n = 0; const t = setInterval(() => {
            if (!P || typeof P.onAuth !== 'function') usuario = !!(P && P.user);
            if ((sincronizar() && usuario) || ++n > 80) clearInterval(t);
        }, 250);
    }
    iniciar();

    window.PichisoftAI = { abrir, cerrar, acciones: ACCIONES.map(n => n.nombre) };
})();
