import { createMiniCard } from './components/miniCard.js';
import { showToast } from './utils.js';
import { getAllCards, saveCard, deleteCard } from './db.js';
import { loadCardToMain } from './components/card.js';
import { sendToCosmicArchive } from './palace.js';
import { displayFilteredCards, showCollection } from './collection.js';

let showingArchive = false;
export const isShowingArchive = () => showingArchive;
export const setShowingArchive = (value) => {
  showingArchive = value;
};

export async function createCollectionViewer() {
  // First remove any existing viewer
  const existingViewer = document.querySelector('.collection-viewer');
  if (existingViewer) {
    existingViewer.remove();
  }

  const viewer = document.createElement('div');
  viewer.className = 'collection-viewer hidden';
  viewer.innerHTML = `
    <div class="collection-header">
      <div class="collection-header-title">
        <h2>Your Cosmic Observatory</h2>
        <button class="import-btn" title="Import Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" transform="rotate(180, 12, 12)"/>
          </svg>
        </button>
        <button class="export-btn" title="Export Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        <button class="archive-toggle-btn" title="Go to Cosmic Archive">
          <svg class="observatory-view-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <svg class="archive-view-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: none;">
            <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/>
          </svg>
        </button>
        <input type="file" class="hidden-file-input" accept=".json">
      </div>
      <div class="collection-header-buttons">
        <button class="delete-mode-toggle" title="Toggle Delete Mode">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
          </svg>
        </button>
        <button class="close-collection">×</button>
      </div>
    </div>
    <div class="collection-tabs">
      <button class="type-tab active" data-type="all">
        <span>ALL</span>
      </button>
    </div>
    <div class="collection-grid"></div>
  `;
  document.body.appendChild(viewer);

  // Add event listeners for the buttons
  const closeBtn = viewer.querySelector('.close-collection');
  const deleteToggle = viewer.querySelector('.delete-mode-toggle');
  const exportBtn = viewer.querySelector('.export-btn');
  const importBtn = viewer.querySelector('.import-btn');
  const fileInput = viewer.querySelector('.hidden-file-input');
  const archiveToggleBtn = viewer.querySelector('.archive-toggle-btn');
  let deleteMode = false;

  archiveToggleBtn.addEventListener('click', async () => {
    showingArchive = !showingArchive;
    archiveToggleBtn.classList.toggle('active');
    
    // Update button title and icons
    const observatoryIcon = archiveToggleBtn.querySelector('.observatory-view-icon');
    const archiveIcon = archiveToggleBtn.querySelector('.archive-view-icon');
    
    if (showingArchive) {
      archiveToggleBtn.title = 'Go to Observatory';
      observatoryIcon.style.display = 'none';
      archiveIcon.style.display = '';
    } else {
      archiveToggleBtn.title = 'Go to Cosmic Archive';
      observatoryIcon.style.display = '';
      archiveIcon.style.display = 'none';
    }
    
    const title = viewer.querySelector('h2');
    const grid = viewer.querySelector('.collection-grid');
    grid.innerHTML = '';

    if (showingArchive) {
      title.textContent = 'Cosmic Archive';
      deleteToggle.style.display = 'none'; // Hide delete toggle in archive view
      importBtn.style.display = 'none';
      exportBtn.style.display = 'none';
      
      try {
        const cosmicArchive = new WebsimSocket();
        const conditions = await cosmicArchive.collection('cosmic').getList();
        
        displayFilteredCards(conditions, [], 'single', true); // Pass true for isArchiveView

        // Subscribe to real-time updates
        cosmicArchive.collection('cosmic').subscribe((updatedConditions) => {
          if (showingArchive) { // Only update if still showing archive
            grid.innerHTML = '';
            displayFilteredCards(updatedConditions, [], 'single', true); // Pass true for isArchiveView
          }
        });
      } catch (error) {
        console.error('Error loading Cosmic Archive:', error);
        showToast('Failed to load Cosmic Archive', true);
      }
    } else {
      title.textContent = 'Your Cosmic Observatory';
      deleteToggle.style.display = ''; // Show delete toggle in observatory view
      importBtn.style.display = '';
      exportBtn.style.display = '';
      
      // Load local collection
      const cards = await getAllCards();
      cards.sort((a, b) => b.timestamp - a.timestamp);
      displayFilteredCards(cards, [], 'single');
    }
  });

  closeBtn.addEventListener('click', () => {
    viewer.classList.add('hidden');
    deleteMode = false;
    deleteToggle.classList.remove('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => card.classList.remove('delete-mode'));
    
    // Reset to Cosmic Observatory view for next open
    if (showingArchive) {
      showingArchive = false;
      archiveToggleBtn.classList.remove('active');
      const title = viewer.querySelector('h2');
      title.textContent = 'Your Cosmic Observatory';
      deleteToggle.style.display = '';
      importBtn.style.display = '';
      exportBtn.style.display = '';
      
      // Load Cosmic Observatory collection
      getAllCards().then(cards => {
        cards.sort((a, b) => b.timestamp - a.timestamp);
        displayFilteredCards(cards, [], 'single');
      });
    }
  });

  deleteToggle.addEventListener('click', () => {
    deleteMode = !deleteMode;
    deleteToggle.classList.toggle('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => {
      card.classList.toggle('delete-mode');
      
      // Remove existing click handlers
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
      
      // Add appropriate click handler based on mode
      if (deleteMode) {
        newCard.addEventListener('click', async (e) => {
          e.stopPropagation();
          const cardData = newCard.cardData;
          if (await showConfirmDialog(cardData)) {
            try {
              await deleteCard(cardData.id);
              newCard.remove();
              showToast(`${cardData.name} was released successfully!`);
            } catch (error) {
              console.error('Error deleting card:', error);
              showToast('Failed to release Phenomenon', true);
            }
          }
        });
      } else {
        newCard.addEventListener('click', async (e) => {
          const archiveButton = e.target.closest('.archive-button');
          
          if (archiveButton) {
            e.stopPropagation(); // Prevent card load
            try {
              await showArchiveDialog(newCard.cardData);
            } catch (error) {
              console.error('Failed to send to Cosmic Archive:', error);
            }
            return;
          }

          loadCardToMain(newCard.cardData);
          viewer.classList.add('hidden');
        });
      }
      
      // Preserve the cardData
      newCard.cardData = card.cardData;
    });
  });

  exportBtn.addEventListener('click', async () => {
    try {
      const cards = await getAllCards();
      const exportData = {
        cosmicobservatory: {
          version: 1,
          cards: cards,
          exported_at: new Date().toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cosmic-observatory-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Cosmic Observatory collection exported successfully!');
    } catch (error) {
      console.error('Error exporting collection:', error);
      showToast('Failed to export collection', true);
    }
  });

  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (!data.cosmicobservatory || !Array.isArray(data.cosmicobservatory.cards)) {
        throw new Error('Invalid file format');
      }

      // Show import options dialog
      const importChoice = await showImportDialog(data.cosmicobservatory.cards.length);
      if (importChoice === null) {
        fileInput.value = '';
        return; // User cancelled
      }

      // Get existing cards to check for duplicates
      const existingCards = await getAllCards();
      let cardsToImport;
      
      if (importChoice === 'skip') {
        // Filter out exact duplicates
        cardsToImport = data.cosmicobservatory.cards.filter(importCard => 
          !existingCards.some(existingCard => 
            existingCard.name === importCard.name &&
            existingCard.description === importCard.description &&
            existingCard.imageUrl === importCard.imageUrl
          )
        );
      } else {
        // Import all cards
        cardsToImport = data.cosmicobservatory.cards;
      }

      // Import the cards
      const importPromises = cardsToImport.map(card => saveCard(card));
      await Promise.all(importPromises);
      
      // Refresh the collection display
      const grid = viewer.querySelector('.collection-grid');
      grid.innerHTML = '';
      await showCollection();

      // Show success message
      const skippedCount = data.cosmicobservatory.cards.length - cardsToImport.length;
      if (importChoice === 'skip' && skippedCount > 0) {
        showToast(`Imported ${cardsToImport.length} cards. Skipped ${skippedCount} duplicate(s).`);
      } else {
        showToast(`Successfully imported ${cardsToImport.length} cards!`);
      }
    } catch (error) {
      console.error('Error importing collection:', error);
      showToast('Failed to import collection: ' + error.message, true);
    }

    // Reset the file input
    fileInput.value = '';
  });

  return viewer;
}

export async function handleRegisterToObservatory(archiveData) {
  // First check for duplicates
  const existingCards = await getAllCards();
  const isDuplicate = existingCards.some(card => 
    card.name === archiveData.name &&
    card.description === archiveData.description &&
    (card.imageUrl === archiveData.backupImageUrl || card.imageUrl === archiveData.imageUrl)
  );

  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  dialog.innerHTML = `
    <h3>Register to Observatory</h3>
    <p>Would you like to add ${archiveData.name} to your Cosmic Observatory?</p>
    ${isDuplicate ? `<p style="color: var(--nebula-pink); font-size: 0.9em; margin-top: 8px;">
      Note: This cosmic phenomenon is already recorded in your Observatory
    </p>` : ''}
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">
        Register
        <span class="loading-spinner hidden"></span>
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  try {
    const result = await new Promise((resolve) => {
      const cancelBtn = dialog.querySelector('.cancel');
      const confirmBtn = dialog.querySelector('.confirm');
      const spinner = dialog.querySelector('.loading-spinner');

      cancelBtn.addEventListener('click', () => {
        dialog.remove();
        resolve(false);
      });

      confirmBtn.addEventListener('click', async () => {
        try {
          // Show loading state
          confirmBtn.disabled = true;
          spinner.classList.remove('hidden');

          // Create a new card data object mapping archive data to observatory format
          const observatoryData = {
            name: archiveData.name,
            description: archiveData.description,
            type: archiveData.cosmictype,
            magnitude: archiveData.magnitude,
            radius: archiveData.radius,
            imageUrl: archiveData.backupImageUrl || archiveData.imageUrl,
            backupImageUrl: archiveData.backupImageUrl
          };

          // Save to local IndexDB
          await saveCard(observatoryData);
          
          dialog.remove();
          showToast(`${archiveData.name} was successfully registered to your Observatory!${
            isDuplicate ? ' (Duplicate record)' : ''
          }`);
          
          // Refresh the collection view if in archive view
          const viewer = document.querySelector('.collection-viewer');
          if (viewer && viewer.querySelector('h2').textContent.includes('Cosmic Archive')) {
            const archiveToggleBtn = viewer.querySelector('.archive-toggle-btn');
            if (archiveToggleBtn) {
              archiveToggleBtn.click(); // Switch to Observatory view
              setTimeout(() => archiveToggleBtn.click(), 100); // Switch back to archive view
            }
          }
          
          resolve(true);
        } catch (error) {
          console.error('Failed to register to Observatory:', error);
          showToast('Failed to register to Observatory', true);
          confirmBtn.disabled = false;
          spinner.classList.add('hidden');
        }
      });
    });

    return result;
  } catch (error) {
    dialog.remove();
    throw error;
  }
}

export async function showCollection() {
  let viewer = document.querySelector('.collection-viewer');
  
  if (!viewer) {
    viewer = await createCollectionViewer();
  }
  
  const grid = viewer.querySelector('.collection-grid');
  const tabsContainer = viewer.querySelector('.collection-tabs');
  
  if (!grid || !tabsContainer) {
    console.error('Required collection elements not found');
    return;
  }

  try {
    const isShowingArchive = viewer.querySelector('h2').textContent.includes('Cosmic Archive');
    let cards;
    if (isShowingArchive) {
      cards = await cosmicArchive.collection('cosmic').getList();
    } else {
      cards = await getAllCards();
      cards.sort((a, b) => b.timestamp - a.timestamp);
    }

    const allTypes = new Set();
    cards.forEach(card => {
      const typeString = isShowingArchive ? card.cosmictype : card.type;
      typeString.split('/').forEach(type => {
        allTypes.add(type.trim());
      });
    });
    
    // Update the UI text and icon based on current view
    const archiveToggleBtn = viewer.querySelector('.archive-toggle-btn');
    if (archiveToggleBtn) {
      archiveToggleBtn.title = isShowingArchive ? 'Go to Observatory' : 'Go to Cosmic Archive';
      const observatoryIcon = archiveToggleBtn.querySelector('.observatory-view-icon');
      const archiveIcon = archiveToggleBtn.querySelector('.archive-view-icon');
      if (isShowingArchive) {
        observatoryIcon.style.display = 'none';
        archiveIcon.style.display = '';
      } else {
        observatoryIcon.style.display = '';
        archiveIcon.style.display = 'none';
      }
    }
    
    tabsContainer.innerHTML = `
      <button class="type-tab" data-type="all">
        <span>ALL</span>
      </button>
      ${Array.from(allTypes).sort().map(type => `
        <button class="type-tab" data-type="${type}">
          <div class="type-icon ${type.toLowerCase()}">${getTypeIcon(type)}</div>
          <span>${type}</span>
        </button>
      `).join('')}
    `;

    let selectedTypes = new Set();
    let filterMode = 'single'; 
    
    const tabs = tabsContainer.querySelectorAll('.type-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', async (e) => {
        const type = tab.dataset.type;
        
        if (e.ctrlKey || e.metaKey) {
          if (filterMode !== 'and') {
            selectedTypes.clear(); 
            filterMode = 'and';
          }
          
          if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
          } else if (selectedTypes.size < 2) {
            selectedTypes.add(type);
          }
          
        } else if (e.shiftKey) {
          filterMode = 'or';
          if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
          } else {
            selectedTypes.add(type);
          }
          
        } else {
          filterMode = 'single';
          selectedTypes.clear();
          selectedTypes.add(type);
        }

        tabs.forEach(t => {
          t.classList.remove('selected-single', 'selected-or', 'selected-and');
          if (selectedTypes.has(t.dataset.type)) {
            t.classList.add(`selected-${filterMode}`);
          }
        });
        
        const isShowingArchive = viewer.querySelector('h2').textContent.includes('Cosmic Archive');
        let currentCards;
        
        if (isShowingArchive) {
          currentCards = await cosmicArchive.collection('cosmic').getList();
        } else {
          currentCards = await getAllCards();
          currentCards.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        if (type === 'all' && filterMode === 'single') {
          selectedTypes.clear();
        }
        
        displayFilteredCards(currentCards, Array.from(selectedTypes), filterMode, isShowingArchive);
      });
    });
    
    displayFilteredCards(cards, [], 'single', isShowingArchive);
    
    viewer.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading collection:', error);
  }
}

export async function showImportDialog(totalCards) {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.className = 'import-dialog';
    dialog.innerHTML = `
      <h3>Import Collection</h3>
      <p>About to import ${totalCards} cards.</p>
      <p>How would you like to handle potential duplicates?</p>
      <div class="import-options">
        <label>
          <input type="radio" name="duplicate-handling" value="skip" checked>
          Skip exact duplicates
        </label>
        <label>
          <input type="radio" name="duplicate-handling" value="allow">
          Allow all duplicates
        </label>
      </div>
      <div class="import-dialog-buttons">
        <button class="cancel">Cancel</button>
        <button class="confirm">Import</button>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('.cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(null);
    });

    dialog.querySelector('.confirm').addEventListener('click', () => {
      const selectedOption = dialog.querySelector('input[name="duplicate-handling"]:checked').value;
      dialog.remove();
      resolve(selectedOption);
    });
  });
}

export async function showConfirmDialog(cardData) {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  dialog.innerHTML = `
    <h3>Release Phenomenon</h3>
    <p>Are you sure you want to release ${cardData.name}?</p>
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">Release</button>
    </div>
  `;

  document.body.appendChild(dialog);

  const result = await new Promise((resolve) => {
    dialog.querySelector('.cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(false);
    });

    dialog.querySelector('.confirm').addEventListener('click', async () => {
      dialog.remove();
      resolve(true);
    });
  });

  return result;
}

export async function showArchiveDialog(cardData) {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog archive-dialog';
  dialog.innerHTML = `
    <h3>Send to Cosmic Archive</h3>
    <p>Would you like to add ${cardData.name} to the Cosmic Archive?</p>
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">
        Send to Archive
        <span class="loading-spinner hidden"></span>
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  try {
    const result = await new Promise((resolve) => {
      const cancelBtn = dialog.querySelector('.cancel');
      const confirmBtn = dialog.querySelector('.confirm');
      const spinner = dialog.querySelector('.loading-spinner');

      cancelBtn.addEventListener('click', () => {
        dialog.remove();
        resolve(false);
      });

      confirmBtn.addEventListener('click', async () => {
        // Show loading state
        confirmBtn.disabled = true;
        spinner.classList.remove('hidden');

        try {
          await sendToCosmicArchive(cardData);
          dialog.remove();
          showToast(`${cardData.name} was successfully added to Cosmic Archive!`);
          resolve(true);
        } catch (error) {
          console.error('Failed to send to Cosmic Archive:', error);
          showToast('Failed to send to Cosmic Archive', true);
          // Re-enable button and hide spinner on error
          confirmBtn.disabled = false;
          spinner.classList.add('hidden');
        }
      });
    });

    return result;
  } catch (error) {
    dialog.remove();
    throw error;
  }
}