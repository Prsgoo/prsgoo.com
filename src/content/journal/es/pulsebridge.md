---
title: "PulseBridge, o cómo evité escribir el mismo adaptador doce veces"
date: 2026-06-29
summary: Un proyecto paralelo de "world monitor" que acabó siendo un runtime de plugins para Node.js, porque me aburrí de copiar y pegar las partes tediosas.
type: case-study
tags: [TypeScript, Node.js, Architecture, PulseBridge]
draft: false
---

Empezó como un "world monitor" — una pantalla que me mostraba el estado del planeta a partir de un montón de APIs públicas. El tiempo, cripto, mercados, terremotos, calidad del aire, las noticias, clima espacial, los CVE que salieran esa mañana. Un pequeño dashboard entretenido.

El plan era el obvio: escribir un adaptador para cada API, meterlos en la app, listo. Escribí dos y lo dejé.

No porque fuera difícil — sino porque era repetitivo de una forma que me molestaba. Cada adaptador hacía las mismas tareas alrededor de unas pocas líneas de lógica real: programar la petición, guardar una clave de API en algún sitio, esperar con paciencia cuando la API pedía bajar el ritmo, almacenar la última respuesta y entregársela a la UI. Los datos eran quizá una décima parte de cada archivo. El resto era fontanería que iba a copiar una docena de veces y luego mantener una docena de veces — justo el tipo de trabajo futuro que intento diseñar para que no exista.

Así que dejé el dashboard y construí la parte que no quería repetir.

## Un contrato, tres formas de entrar

PulseBridge es una librería, no un servidor. Lo inicias una vez y funciona en segundo plano de forma discreta, programando trabajo y reaccionando a él. Un plugin es un objeto plano — sin clase base que extender, sin decoradores, nada rebuscado. Declara lo que necesita en un manifest e implementa cómo obtener los datos; lo que devuelve sale por el otro lado con una única forma, un `PulseRecord<T>`, de modo que nada aguas abajo tiene que saber de qué API vino.

Lo que más me gusta: un único contrato de plugin gestiona tres formas realmente distintas de hablar con un sistema. El scheduler hace **poll** a intervalos. Un servicio externo puede hacer **push a datos** mediante un webhook. El host puede lanzar una **acción** bajo demanda. Mismo manifest, mismo manejo de secretos, mismo modelo de errores para los tres. Los procesadores están aguas abajo y convierten los registros en bruto en las views que lee la UI — y leer una view nunca toca una API en vivo, siempre es la copia almacenada.

## Las partes poco glamurosas que más me importaron

Cualquiera puede montar un `fetch()`. La razón por la que estoy orgulloso de este proyecto es lo que nunca aparece en una demo.

Los secretos no andan sueltos. El núcleo los cifra en reposo y entrega a cada plugin una view de solo lectura de _únicamente_ las claves que declaró — pide una que no declaraste y obtienes una excepción, no el valor. Deliberadamente nunca lee `process.env`, así que nada se cuela por accidente.

El fallo es una entrada de diseño, no un caso límite. Los errores son tipados, así que el runtime distingue "tu clave está mal" (parar) de "baja el ritmo" (esperar exactamente lo que pidió la API) de "algo inesperado se rompió" (retroceder y, si claramente está muerto, rendirse). Una integración inestable se degrada a sí misma y deja el resto funcionando.

Y como un webhook es la única puerta que se abre a la internet pública, los plugins reciben los bytes crudos de la petición y verifican la firma ellos mismos antes de confiar en un solo campo.

## Dónde acabó

Los plugins oficiales resultaron ser justo el world monitor que me propuse construir — OpenWeather, CoinGecko, Finnhub, USGS, NASA y los demás. Solo que añadir la siguiente fuente ya no es un proyecto; es una tarde y una interfaz. Que era justo el objetivo. Construye el gestor una vez, y los adaptadores pueden seguir siendo aburridos.
