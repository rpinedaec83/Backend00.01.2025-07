import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import pool from "../db/connection.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Autenticando usuario con Google:", profile.displayName);

        //Muestra estructura completa del perfil recibido
        console.log("Perfil completo de Google:", JSON.stringify(profile, null, 2));

        // Extrae los datos de forma segura
        const oauth_id = profile.id;
        const name =
          profile.displayName ||
          `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
          "Usuario sin nombre";
        const email = profile.emails?.[0]?.value || null;
        const provider = profile.provider || "google";

        // Verifica que name y oauth_id sean válidos
        if (!oauth_id) throw new Error("No se recibió un ID de usuario válido desde Google.");

        // Busca si el usuario ya existe
        const [rows] = await pool.query("SELECT * FROM users WHERE oauth_id = ?", [oauth_id]);

        if (rows.length > 0) {
          console.log("Usuario existente:", rows[0].name);
          return done(null, rows[0]);
        } else {
          console.log("Nuevo usuario detectado. Registrando en BD...");

          // Inserta nuevo usuario
          await pool.query(
            "INSERT INTO users (oauth_id, name, email, provider) VALUES (?, ?, ?, ?)",
            [oauth_id, name, email, provider]
          );

          const newUser = { oauth_id, name, email, provider };
          console.log("Usuario registrado correctamente:", newUser);

          return done(null, newUser);
        }
      } catch (err) {
        console.error("Error en la autenticación con Google:", err.message);
        return done(err, null);
      }
    }
  )
);

// Serialización: guarda solo el ID en la sesión
passport.serializeUser((user, done) => {
  const userId = user.oauth_id || user.id; 
  console.log("Serializando usuario:", userId);
  done(null, userId);
});


// Deserialización: reconstruye el usuario desde la BD
passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializando usuario con ID:", id);
    const [rows] = await pool.query("SELECT * FROM users WHERE oauth_id = ?", [id]);
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      console.warn("Usuario no encontrado en la BD durante deserialización.");
      done(null, false);
    }
  } catch (err) {
    console.error("Error al deserializar usuario:", err.message);
    done(err, null);
  }
});

export default passport;
