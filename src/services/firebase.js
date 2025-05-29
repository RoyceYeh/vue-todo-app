import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBn58YfUqCXrR0fdCLoAe0vpjukqo0Smlw',
  authDomain: 'mock-jwi.firebaseapp.com',
  projectId: 'mock-jwi',
  storageBucket: 'mock-jwi.firebasestorage.app',
  messagingSenderId: '742658641508',
  appId: '1:742658641508:web:9f55b38c69dda3b0629971',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
