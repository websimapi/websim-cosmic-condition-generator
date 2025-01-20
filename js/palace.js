import { getDB } from './db.js';

const cosmicArchive = new WebsimSocket();

export async function sendToCosmicArchive(cardData) {
  try {
    const response = await fetch(cardData.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${cardData.name}.png`, { type: 'image/png' });
    
    const backupImageUrl = await websim.upload(file);
    
    if (cardData.id) {
      const db = getDB();
      const transaction = db.transaction(['conditions'], 'readwrite');
      const store = transaction.objectStore('conditions');
      const request = store.get(cardData.id);
      
      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          record.backupImageUrl = backupImageUrl;
          store.put(record);
        }
      };
    }
    
    const archiveRecord = await cosmicArchive.collection('cosmic').create({
      name: cardData.name,
      description: cardData.description,
      cosmictype: cardData.type,
      magnitude: cardData.magnitude,
      radius: cardData.radius,
      imageUrl: cardData.imageUrl,
      backupImageUrl: backupImageUrl,
      origin_observer: cosmicArchive.party.client.username
    });
    
    console.log('New Cosmic Archive record created:', archiveRecord);

    const allConditions = await cosmicArchive.collection('cosmic').getList();
    console.log('Current Cosmic Archive collection:', allConditions);

    cosmicArchive.collection('cosmic').subscribe((conditions) => {
      console.log('Cosmic Archive collection updated:', conditions);
    });

    return archiveRecord;
  } catch (error) {
    console.error('Error sending to Cosmic Archive:', error);
    throw error;
  }
}