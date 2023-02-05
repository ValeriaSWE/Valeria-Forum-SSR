// src/server/auth.ts
import { DiscordStrategy } from '@solid-auth/socials' // or any other provider
import { storage } from '~/lib/user.sever' // the sessionStorage we created before
import { Authenticator } from '@solid-auth/core'
import User from '~/Schemas/User'

export const authenticator = new Authenticator(storage).use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
            // SITE_URL should be set to: http://localhost:3000 locally and https://yourdomain.com in production
            callbackURL: process.env.BASE_URL + '/api/auth/discord/callback',
        },
        async ({ profile }) => {
            let user = await User.findOne({ discord: profile.id })
            if (!user) {
                user = await User.create({ username: profile.__json.username, password: null, email: profile.__json.email })
            }
            return user
        }
    )
)