import { showArchiveDialog, handleRegisterToObservatory, setShowingArchive } from '../ui.js';
import { loadCardToMain } from './card.js';
import { getTypeIcon, getTypeColor } from '../utils.js';

export function createMiniCard(cardData, isArchiveView = false) {
  const miniCard = document.createElement('div');
  miniCard.className = 'mini-card';
  miniCard.dataset.cardId = cardData.id;
  miniCard.cardData = cardData;
  
  const types = cardData.type ? cardData.type.split('/') : cardData.cosmictype.split('/');
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  
  // Different icons for Archive vs Observatory
  const buttonIcon = isArchiveView ? `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  ` : `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/>
    </svg>
  `;
  
  miniCard.innerHTML = `
    <div class="mini-card-inner" style="background: linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%), 
                                      radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)">
      <div class="delete-overlay">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
        </svg>
      </div>
      <div class="archive-button" title="${isArchiveView ? 'Register to Observatory' : 'Send to Archive'}">
        ${buttonIcon}
      </div>
      <h3 class="mini-card-name">${cardData.name}</h3>
      <div class="mini-card-stats">
        <div class="mini-card-type">
          ${types.map(type => `
            <div class="type-icon ${type.toLowerCase().trim()}" title="${type.trim()}">
              ${getTypeIcon(type.trim())}
            </div>
          `).join('')}
        </div>
        <span class="mini-card-stats-text">${cardData.magnitude || 'Unknown'} | ${cardData.radius || 'Unknown'}</span>
      </div>
      <div class="mini-card-image" style="background-image: url('${cardData.backupImageUrl || cardData.imageUrl}')"></div>
      <div class="mini-card-description">${cardData.description}</div>
    </div>
  `;

  miniCard.addEventListener('click', async (e) => {
    const archiveButton = e.target.closest('.archive-button');
    
    if (archiveButton) {
      e.stopPropagation();
      try {
        if (isArchiveView) {
          await handleRegisterToObservatory(miniCard.cardData);
        } else {
          await showArchiveDialog(miniCard.cardData);
        }
      } catch (error) {
        console.error('Failed to handle archive action:', error);
      }
      return;
    }

    if (!e.target.closest('.delete-overlay')) {
      setShowingArchive(false);
      loadCardToMain(miniCard.cardData);
      
      const viewer = document.querySelector('.collection-viewer');
      if (viewer) {
        const archiveToggleBtn = viewer.querySelector('.archive-toggle-btn');
        if (archiveToggleBtn) {
          archiveToggleBtn.classList.remove('active');
        }
        
        const deleteToggle = viewer.querySelector('.delete-mode-toggle');
        const importBtn = viewer.querySelector('.import-btn');
        const exportBtn = viewer.querySelector('.export-btn');
        
        if (deleteToggle) deleteToggle.style.display = '';
        if (importBtn) importBtn.style.display = '';
        if (exportBtn) exportBtn.style.display = '';
        
        const title = viewer.querySelector('h2');
        if (title) {
          title.textContent = 'Your Cosmic Observatory';
        }
        
        viewer.classList.add('hidden');
      }
    }
  });

  return miniCard;
}