// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import "firebase/compat/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuWu3dL2mpsem426-ygMvb1R2ZfnJ5-pQ",
  authDomain: "weaver-farms.firebaseapp.com",
  databaseURL: "https://weaver-farms-default-rtdb.firebaseio.com",
  projectId: "weaver-farms",
  storageBucket: "weaver-farms.firebasestorage.app",
  messagingSenderId: "787561428317",
  appId: "1:787561428317:web:ed90a1fd08ea9bc6fd24b4",
  measurementId: "G-PKEXB01Q9F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database().app;

export { db as firebase }