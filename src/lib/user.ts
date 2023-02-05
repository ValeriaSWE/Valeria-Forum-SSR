import jwt_decode from "jwt-decode"

/**
 * Saves the logged in user to the localStorage.
 * @param data
 */
export const Auth = async (data) => {
    // localStorage.setItem('profile', JSON.stringify({ ...data }))
    // return createServerData$(
    //     async (data, event) => {
    //         console.log(data)
    //         return
    //     },
    //     { key: () => data }
    // )
}
// import { createCookieSessionStorage } from "solid-start";
// import { createServerData$ } from "solid-start/server/data";

/**
 * CheckAuthLevel takes a token and an authLevel, and checks if user has acces to route.
 * @param {string} token - The JWT that is being checked
 * @param {number} authLevel - The minimum auth level required to access the route
 * @returns {bool} - if the user is permitted or not
 */
export const CheckAuthLevel = (token: string, authLevel: number): boolean => {
    if (!token) return false

    const data = jwt_decode(token) as { roleRank: number, exp: number }
    let exp = false

    try {
        exp = data?.exp * 1000 >= Date.now()
    } catch (error) {
        console.error(error)
    }

    return (data?.roleRank >= authLevel && exp)
}