declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            GUILD_ID: string;
            NODE_ENV: "dev" | "production";
            GAPI_CLIENT_EMAIL: string;
            GAPI_PRIVATE_KEY: string;
        }
    }
}

export {};
