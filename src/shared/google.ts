import { google, youtube_v3 } from "googleapis";
import fs from "fs";

// TODO: This doesn't work.
const jwtClient = new google.auth.JWT(
    process.env.GAPI_CLIENT_EMAIL,
    null,
    process.env.GAPI_PRIVATE_KEY,
    ["https://www.googleapis.com/auth/youtube"]
);

jwtClient.authorize((err) => {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log("Successfully connected!");
    }
});

export const uploadVideo = (
    title: string,
    description: string,
    tags: string[],
    language: string,
    visibility: string,
    videoStream: fs.ReadStream
) => {
    return new Promise<youtube_v3.Schema$Video>((resolve, reject) => {
        const service = google.youtube("v3");
        service.videos.insert(
            {
                auth: jwtClient,
                part: ["snippet", "status"],
                requestBody: {
                    snippet: {
                        title,
                        description,
                        tags,
                        defaultLanguage: language,
                        defaultAudioLanguage: language
                    },
                    status: {
                        privacyStatus: visibility
                    }
                },
                media: {
                    body: videoStream
                }
            },
            (err, response) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(response.data);
            }
        );
    });
};
