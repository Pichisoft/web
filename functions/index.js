/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */
const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const crypto = require("crypto");

initializeApp();

const auth = getAuth();
const db = getFirestore();

setGlobalOptions({
  maxInstances: 10,
});
/**
 * Normaliza un nombre de usuario.
 */
function normalizarUsuario(username) {
  return username.trim().toLowerCase();
}
/**
 * Comprueba si un nombre de usuario es válido.
 */
function validarUsuario(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}
/**
 * Comprueba si una contraseña cumple los requisitos.
 */
function validarPassword(password) {
  return typeof password === "string" && password.length >= 8;
}
/**
 * Genera un hash seguro para una contraseña.
 */
function crearHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto.scryptSync(
      password,
      salt,
      64,
  ).toString("hex");

  return {
    salt,
    hash,
  };
}
/**
 * Comprueba una contraseña contra su hash almacenado.
 */
function comprobarPassword(password, salt, hashGuardado) {
  const hash = crypto.scryptSync(
      password,
      salt,
      64,
  ).toString("hex");

  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(hashGuardado, "hex");

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

exports.pruebaFirebase = onRequest((req, res) => {
  res.send("Firebase Functions funciona correctamente.");
});

exports.registrarUsuario = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Método no permitido.",
      });
    }

    const {username, password, photo = ""} = req.body || {};

    if (typeof username !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Usuario inválido.",
      });
    }

    if (!validarUsuario(username)) {
      return res.status(400).json({
        ok: false,
        error: "El usuario debe tener entre 3 y 20 caracteres.",
      });
    }

    if (!validarPassword(password)) {
      return res.status(400).json({
        ok: false,
        error: "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    const usuario = normalizarUsuario(username);
    const usernameRef = db.collection("usernames").doc(usuario);

    const resultado = await db.runTransaction(async (transaction) => {
      const usernameDoc = await transaction.get(usernameRef);

      if (usernameDoc.exists) {
        return {
          error: "Ese nombre de usuario ya está en uso.",
        };
      }

      const userRecord = await auth.createUser({
        disabled: false,
      });

      const credenciales = crearHash(password);

      const userRef = db.collection("users").doc(userRecord.uid);

      transaction.create(usernameRef, {
        uid: userRecord.uid,
        username: usuario,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(userRef, {
        username: usuario,
        photo: typeof photo === "string" ? photo : "",
        createdAt: FieldValue.serverTimestamp(),
      });

      const credentialsRef = db.collection("credentials").doc(userRecord.uid);

      transaction.create(credentialsRef, {
        salt: credenciales.salt,
        hash: credenciales.hash,
        algorithm: "scrypt",
      });

      return {
        uid: userRecord.uid,
      };
    });

    if (resultado.error) {
      return res.status(409).json({
        ok: false,
        error: resultado.error,
      });
    }

    const token = await auth.createCustomToken(resultado.uid, {
      username: usuario,
    });

    return res.status(201).json({
      ok: true,
      token,
      username: usuario,
    });
  } catch (error) {
    console.error("Error registrando usuario:", error);

    return res.status(500).json({
      ok: false,
      error: "No se pudo crear la cuenta.",
    });
  }
});

exports.iniciarSesion = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Método no permitido.",
      });
    }

    const {username, password} = req.body || {};

    if (
      typeof username !== "string" ||
            typeof password !== "string"
    ) {
      return res.status(400).json({
        ok: false,
        error: "Usuario o contraseña inválidos.",
      });
    }

    const usuario = normalizarUsuario(username);

    const usernameRef = db.collection("usernames").doc(usuario);
    const usernameDoc = await usernameRef.get();

    if (!usernameDoc.exists) {
      return res.status(401).json({
        ok: false,
        error: "Usuario o contraseña incorrectos.",
      });
    }

    const uid = usernameDoc.data().uid;

    const credentialsRef = db.collection("credentials").doc(uid);
    const credentialsDoc = await credentialsRef.get();

    if (!credentialsDoc.exists) {
      return res.status(401).json({
        ok: false,
        error: "Usuario o contraseña incorrectos.",
      });
    }

    const credentials = credentialsDoc.data();

    const correcta = comprobarPassword(
        password,
        credentials.salt,
        credentials.hash,
    );

    if (!correcta) {
      return res.status(401).json({
        ok: false,
        error: "Usuario o contraseña incorrectos.",
      });
    }

    const token = await auth.createCustomToken(uid, {
      username: usuario,
    });

    return res.status(200).json({
      ok: true,
      token,
      username: usuario,
    });
  } catch (error) {
    console.error("Error iniciando sesión:", error);

    return res.status(500).json({
      ok: false,
      error: "No se pudo iniciar sesión.",
    });
  }
});
