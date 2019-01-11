import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// onRequest function
// export const helloWorld = functions.https.onRequest((request, response) => {
//     console.log(request);
//     response.send("Hello from Firebase!");
// });

// firestore
export const getBostonWeather = functions.https.onRequest((request, response) => {
    admin.firestore().doc('cities-weather/boston-ma-us').get()
        .then((snapDoc) => {
            const data = snapDoc.data();
            response.send(data);
        })
        .catch((err) => {
            console.log(err);
            response.status(500).send(err);
        })
})
