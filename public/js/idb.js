// Write out idb.js for this assignment. Refer to modules if needed. Make a serviceworker.js
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_data', { autoIncrement: true });
};

request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run checkDatabase() function to send all local db data to api
    if (navigator.onLine) {
    uploadData();
    }
  };

  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

  function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_data'], 'readwrite');
  
    // access the object store for `new_data`
    const dataObjectStore = transaction.objectStore('new_data');
  
    // add record to your store with add method
    dataObjectStore.add(record);
  }

  function uploadData() {
    // open a transaction on your db
    const transaction = db.transaction(['new_data'], 'readwrite');
  
    // access your object store
    const dataObjectStore = transaction.objectStore('new_data');
  
    // get all records from store and set to a variable
    const getAll = dataObjectStore.getAll();
  
    // more to come...
    // upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/routes/api/', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_data'], 'readwrite');
          // access the new_data object store
          const dataObjectStore = transaction.objectStore('new_data');
          // clear all items in your store
          dataObjectStore.clear();

          alert('All saved data has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
  }

  // listen for app coming back online
window.addEventListener('online', uploadData);