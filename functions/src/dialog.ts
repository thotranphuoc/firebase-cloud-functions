import * as admin from 'firebase-admin';
// serviceAccount.json get from project settings
const serviceAccount = require('../serviceAccount/serviceAccount.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://messaging-push-sample.firebaseio.com"
});

(async () => {
    await chat('pizzachat', 'Fear', "What the heck is that?!")
    await chat('pizzachat', 'Joy', "Who puts broccoli on pizza?!")
    await chat('pizzachat', 'Disgust', "That's it. I'm done.")
    await chat('pizzachat', 'Anger', "Congratulations, San Francisco! You've ruined pizza!")
    process.exit(0)
})()
    .catch(err => { console.error(err) })

async function chat(room: string, name: string, text: string) {
    const messagesRef = admin.database().ref('rooms').child(room).child('messages')
    await messagesRef.push({ name, text })
    console.log(`${name}: ${text}`)
    await sleep(1500)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}