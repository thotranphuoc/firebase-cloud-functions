import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
// import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// onRequest function
// export const helloWorld = functions.https.onRequest((request, response) => {
//     console.log(request);
//     response.send("Hello from Firebase!");
// });

// // firestore
// export const getBostonWeather = functions.https.onRequest((request, response) => {
//     admin.firestore().doc('cities-weather/boston-ma-us').get()
//         .then((snapDoc) => {
//             const data = snapDoc.data();
//             response.send(data);
//         })
//         .catch((err) => {
//             console.log(err);
//             response.status(500).send(err);
//         })
// })


// // https trigger -> get data from firestore -> response to user with Promise
// export const getBostonAreaWeather = functions.https.onRequest((request, response) => {

//     admin.firestore().doc("areas/greater-boston").get()
//         .then(areaSnapshot => {
//             console.log(areaSnapshot.data());
//             const cities: string[] = areaSnapshot.data().cities
//             const promises = []
//             cities.forEach(city => {
//                 const p = admin.firestore().doc(`cities-weather/${city}`).get()
//                 promises.push(p)
//             })
//             return Promise.all(promises)
//         })
//         .then(snapshots => {
//             const results = []
//             snapshots.forEach(snap => {
//                 const data = snap.data()
//                 data['city'] = snap.id
//                 results.push(data)
//             })
//             response.send(results)
//         })
//         .catch(error => {
//             console.log(error)
//             response.status(500).send(error)
//         })
// })


// https trigger -> get data from firestore -> response to user with AsyncAwait
export const getBostonAreaWeatherAsyncAwait = functions.https.onRequest(
    async (request, response) => {
        try {
            const areaSnapshot = await admin.firestore().doc("areas/greater-boston").get();
            console.log(areaSnapshot.data());
            const cities: string[] = areaSnapshot.data().cities
            const promises = []
            cities.forEach(city => {
                const p = admin.firestore().doc(`cities-weather/${city}`).get()
                promises.push(p)
            });
            const snapshots = await Promise.all(promises);
            const results = []
            snapshots.forEach(snap => {
                const data = snap.data()
                data['city'] = snap.id
                results.push(data)
            })
            response.send(results)
        } catch (error) {
            console.error(error)
            response.status(500).send(error);
        }
    });


// https://www.youtube.com/watch?v=DglTSNEdl0U&list=PLl-K7zZEsYLkPZHe41m4jfAxUi0JjLgSM&index=7
export const onMessageCreate = functions.database
    .ref('/rooms/{roomId}/messages/{messageId}')
    .onCreate(async (snapshot, context) => {
        console.log('context', context);
        const roomId = context.params.roomId
        const messageId = context.params.messageId
        console.log(`New message ${messageId} in room ${roomId}`)

        const messageData = snapshot.val()
        const text = addPizzazz(messageData.text)
        await snapshot.ref.update({ text: text })

        const countRef = snapshot.ref.parent.parent.child('messageCount')
        return countRef.transaction(count => {
            return count + 1
        });
    });

function addPizzazz(text: string): string {
    return text.replace(/\bpizza\b/g, '🍕');
}

export const onMessageDelete = functions.database
    .ref('/rooms/{roomId}/messages/{messageId}')
    .onDelete(async (snapshot, context) => {
        const countRef = snapshot.ref.parent.parent.child('messageCount')
        return countRef.transaction(count => {
            return count - 1
        });
    });

export const onMessageUpdate = functions.database
    .ref('/rooms/{roomId}/messages/{messageId}')
    .onUpdate((change, context) => {
        const before = change.before.val()
        const after = change.after.val()

        if (before.text === after.text) {
            console.log("Text didn't change")
            return null
        }

        const text = addPizzazz(after.text)
        const timeEdited = Date.now()
        return change.after.ref.update({ text, timeEdited })
    });



    //Example Source Code: https://gist.github.com/CodingDoug/814a75ff55d5a3f951f8a7df3979636a