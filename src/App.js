import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FaPlay, FaReadme, FaSignOutAlt, FaSpinner, FaCloudDownloadAlt, FaHeadphones } from 'react-icons/fa';
import { getFirestore, collection, where, getDocs, query, orderBy, startAfter, limit } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uid, setUid] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const playerRef = useRef(null);
  const [user, setUser] = useState(null);
  const [genaiData, setGenaiData] = useState([]);
// Listen for authentication state changes
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      setUid(currentUser.uid);
      console.log('User is signed in:', currentUser.uid);
      // Fetch data for the authenticated user
      await fetchData(currentUser.uid);
    }
    else {
      console.log('No user is signed in');
    }
  });
  return () => unsubscribe();
}, []);

// Function to fetch data from Firestore
const fetchData = async (userID) => {
  try {
    const genaiCollection = collection(db, 'genai', userID, 'MyGenAI');
    let q;
    q = query(genaiCollection, where('model','==','azure-tts'), orderBy('createdDateTime', 'desc'), limit(15));
    const genaiSnapshot = await getDocs(q);
    const genaiList = genaiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // set data.answer for all rows with replace functions [play/download] and ')'
    genaiList.forEach(item => {
      item.answer = item.answer.replace('[play/download](', '').replace(/\)$/, '');
    });
    setGenaiData(genaiList);
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};

  useEffect(() => {
    fetch('https://us-central1-reviewtext-ad5c6.cloudfunctions.net/function-10')
      .then(response => response.json())
      .then(data => {
        console.log('Data fetched: ', data);
        setFiles(data);
      })
      .catch(error => console.error('Error fetching data: ', error));
  }, []);

  const setAudioSource = (url, index) => {
    setCurrentFileUrl(url);
    setIsPlaying(true);
    setSelectedFileIndex(index);
  };

  const handleCheckboxChange = (e, file) => {
    e.preventDefault();
    fetch('https://us-central1-reviewtext-ad5c6.cloudfunctions.net/function-10', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({filename: file.name})
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('API request failed');
        }
        return response.text();
      })
      .then(data => { console.log('Checkbox clicked: ', data); })
      .catch(error => console.error('file.name' + file.name + ' Error calling API: ', error));
  };

  const handleSignInWithEmail = async (e) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await auth.signOut();
        alert('Please verify your email before signing in.');
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        alert('Wrong password, please try again.');
      } else {
        alert('Error signing in, please try again.' + error.message);
        console.error('Error signing in:', error);
      }
    }
  };

  const handleSignUpWithEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(auth.currentUser);
      const user = userCredential.user;
      alert('Verification email sent! Please check your inbox. Ater verification, please sign in.');
      if (!user.emailVerified) {
        await auth.signOut();
      }
    } catch (error) {
      alert('Error signing up, please try again.' + error.message);
      console.error('Error signing up:', error);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert('Please enter your email address.');
      return;
    }
  };

    // Sign In with Google
    const handleSignInWithGoogle = () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider).catch((error) => {
        console.error('Error signing in with Google:', error);
        alert('Error signing in with Google: ' + error.message);
      });
    };
  
    // Sign Out
    const handleSignOut = () => {
      signOut(auth).catch((error) => {
        console.error('Error signing out:', error);
        alert('Error signing out: ' + error.message);
      });
    };

    
  return (
    <div>
    {!user ? (
      // **Unauthenticated User Interface: Authentication Forms**
      <div style={{ fontSize: '22px', width: '100%', margin: '0 auto' }}>
        <br />
        <p>Sign In</p>
        <input
          className="textinput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <br />
        <input
          type="password"
          className="textinput"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <br />
        <button className="signonpagebutton" onClick={handleSignInWithEmail}>
          Sign In
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button className="signuppagebutton" onClick={handleSignUpWithEmail}>
          Sign Up
        </button>
        <br />
        <br />
        <button onClick={handlePasswordReset}>Forgot Password?</button>
        <br />
        <br />
        <br />
        <p> OR </p>
        <br />
        <button className="signgooglepagebutton" onClick={handleSignInWithGoogle}>
          Sign In with Google
        </button>
        <br />
      </div>
    ) : (
      // **Authenticated User Interface: Data Display and New Functionalities**

    <div className="App">
      <h2>GenAI Data</h2>
      <ul style={{ listStyleType: 'none' }}>
      {genaiData.map((item, index) => (
      <li key={index}>
        {item.answer}
      </li>
      ))}
      </ul>
      <header className="App-header">
      <div className="" style={{ width: '99%' }}>
      <H5AudioPlayer
      ref={playerRef}
      src={currentFileUrl}
      autoPlay={isPlaying}
      showJumpControls={true}
      showDownloadProgress={true}
      showFilledProgress={true}
      showFilledVolume={true}
      progressJumpSteps={{ forward: 45000, backward: 20000 }}
      controls={true}
      onError={(error) => console.error('Error loading or playing audio:', error)}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnded={() => {
              const nextFileIndex = (selectedFileIndex + 1) % files.length;
              setAudioSource(files[nextFileIndex].url, nextFileIndex);
            }}
          />
          <p>Logged in as  : {user.email}  <button onClick={handleSignOut}><FaSignOutAlt /></button> </p>
         
          <ul style={{ listStyleType: 'none' }}>
            {files.map((file, index) => (
              <li
                key={index}
                className={selectedFileIndex === index ? 'selected-file' : ''}
              >
                <a href={file.url} download onClick={(e) => { e.preventDefault(); setAudioSource(file.url, index); }}>
                  {file.name}
                </a>
                <input type="checkbox" onChange={(e) => handleCheckboxChange(e, file)} style={{ width: '20px', height: '20px', backgroundColor: '#fff', border: '2px solid #000', borderRadius: '5px', marginLeft: '20px' }} />
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  )}
</div>
  );
}

export default App;
