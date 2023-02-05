import { createSolidAuthClient } from "@solid-auth/core";
import { createCookieSessionStorage } from "solid-start";
import { redirect } from "solid-start/server/responses";
import { GetImage } from "~/api/posts";

export const storage = createCookieSessionStorage({
    cookie: {
        name: "session",
        secure: process.env.NODE_ENV === "production",
        secrets: [process.env.SESSION_SECRET as string],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true
    }
});
export function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function createUserSession() {
    const session = await storage.getSession();
    return session
}

export async function login(_id: string, username: string, email: string, role: string, roleRank: number, pfp: string, redirectTo: string, request: Request) {
    let session = await getUserSession(request);
    if (!session) return session = await createUserSession();
    const user = {
        _id: _id, username: username, email: email, role: role, roleRank: roleRank, pfp
    }
    session.set("user", user);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session)
        }
    });
}

export async function getUser(request: Request) {
    const userSession = await getUserSession(request);
    if (!userSession || !userSession.get("user") || typeof userSession.get("user") !== "object" || Object.keys(userSession.get("user")).length === 0) return null;
    const pfp = `data:image/png;base64,${btoa(
        new Uint8Array((await GetImage(userSession.get("user").pfp)).data.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, "")
    )}`
    const user = { ...userSession.get("user"), pfp };

    return user;
}

export async function logout(redirectTo: string, request: Request) {
    const session = await storage.getSession(request.headers.get("Cookie"));
    session.set("user", {})
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export async function saveUserPrefs(options: Object, redirectTo: string, request: Request) {
    let userSession = await getUserSession(request);
    if (!userSession) userSession = await createUserSession();
    userSession.set("prefs", options);

    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(userSession)
        }
    });
}

export async function getUserPrefs(request: Request) {
    const userSession = await getUserSession(request);
    if (!userSession || typeof userSession.get("prefs") !== "object") return null;
    const userPrefs = userSession.get("prefs");

    return userPrefs;
}

export const authClient = createSolidAuthClient(`${process.env.BASE_URL}/api/auth`)
