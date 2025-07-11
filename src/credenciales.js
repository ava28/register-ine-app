import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCxuaRooFQF__Mq0qyANAWsKqwNviBtAcI",
  authDomain: "registro-app-ab287.firebaseapp.com",
  projectId: "registro-app-ab287",
  storageBucket: "registro-app-ab287.firebasestorage.app",
  messagingSenderId: "132103482084",
  appId: "1:132103482084:web:559b368befd27d238b9af1"
};

const appFirebase = initializeApp(firebaseConfig)

export const auth = getAuth(appFirebase)
export const database = getDatabase(appFirebase)

export default appFirebase