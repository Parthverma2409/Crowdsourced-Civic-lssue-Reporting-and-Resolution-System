import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCx0DXqQcFtEb_wnVgzB3j-qGnzeKytqWg",
    authDomain: "civicprojectbackend.firebaseapp.com",
    projectId: "civicprojectbackend",
    storageBucket: "civicprojectbackend.firebasestorage.app",
    messagingSenderId: "892321252302",
    appId: "1:892321252302:web:0813270f26485d7caa619f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;