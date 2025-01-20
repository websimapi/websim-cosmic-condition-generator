let db;

export const initDB = () => {
  const request = indexedDB.open('CosmicConditions', 1);
  
  request.onerror = (event) => {
    console.error('Database error:', event.target.error);
  };

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains('conditions')) {
      const store = db.createObjectStore('conditions', { keyPath: 'id', autoIncrement: true });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
  };
};

export const saveCard = async (cardData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['conditions'], 'readwrite');
    const store = transaction.objectStore('conditions');
    
    const newCard = {
      name: cardData.name,
      description: cardData.description,
      type: cardData.type, 
      magnitude: cardData.magnitude,
      radius: cardData.radius,
      imageUrl: cardData.imageUrl,
      backupImageUrl: cardData.backupImageUrl,
      timestamp: new Date().getTime()
    };

    const request = store.add(newCard);

    request.onsuccess = () => {
      newCard.id = request.result;
      resolve(newCard);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllCards = async () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['conditions'], 'readonly');
    const store = transaction.objectStore('conditions');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteCard = async (id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['conditions'], 'readwrite');
    const store = transaction.objectStore('conditions');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getDB = () => db;