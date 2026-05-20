import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { execute, queryOne } from "@/lib/db";

const SESSION_COOKIE_NAME = "kos_session";
const SESSION_DURATION_DAYS = 14;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export async function verifyPassword(password, storedPasswordHash) {
  const [salt, originalHash] = String(storedPasswordHash || "").split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const candidateHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const originalBuffer = Buffer.from(originalHash, "hex");
  const candidateBuffer = Buffer.from(candidateHash, "hex");

  if (originalBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, candidateBuffer);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashSessionToken(sessionToken);
  const user = await queryOne(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.profile_image_url AS profileImageUrl
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  if (!user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

export async function requireSeller() {
  const user = await requireUser();

  if (user.role !== "seller" && user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

export async function createSession(userId) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await execute(
    `
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `,
    [userId, tokenHash, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: expiresAt
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await execute("DELETE FROM sessions WHERE token_hash = ?", [hashSessionToken(sessionToken)]);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function registerUser({ name, email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await queryOne("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
  const normalizedRole = role === "seller" ? "seller" : "buyer";

  if (existingUser) {
    throw new Error("That email is already registered.");
  }

  const passwordHash = await hashPassword(password);
  const result = await execute(
    `
      INSERT INTO users (name, email, password_hash, role, profile_image_url)
      VALUES (?, ?, ?, ?, '')
    `,
    [name.trim(), normalizedEmail, passwordHash, normalizedRole]
  );

  await createSession(result.insertId);

  return result.insertId;
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await queryOne(
    `
      SELECT id, password_hash
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [normalizedEmail]
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  await createSession(user.id);

  return user.id;
}

function hashSessionToken(sessionToken) {
  return crypto.createHash("sha256").update(sessionToken).digest("hex");
}
