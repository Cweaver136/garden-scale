// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import "firebase/compat/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQWaOJ6TkdV25ZRuQ-JpeK9-bcEpM9MCM",
  authDomain: "garden-scale.firebaseapp.com",
  databaseURL: "https://garden-scale-default-rtdb.firebaseio.com",
  projectId: "garden-scale",
  storageBucket: "garden-scale.firebasestorage.app",
  messagingSenderId: "341969912898",
  appId: "1:341969912898:web:3b05f144c21e7303c119db"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database().app;

export { db as firebase }