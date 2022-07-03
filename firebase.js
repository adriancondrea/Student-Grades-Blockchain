const admin = require("firebase-admin");

const serviceAccount = require("/Users/adriancondrea/Documents/UniversityDocuments/Blockchain-App/blockchain-app-5dcc5-firebase-adminsdk-t4ql9-6d18577728.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://blockchain-app-5dcc5-default-rtdb.europe-west1.firebasedatabase.app"
});
const database = admin.database();

module.exports = database
