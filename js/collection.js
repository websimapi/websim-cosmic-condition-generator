import { createMiniCard } from './components/miniCard.js';
import { createCollectionViewer } from './ui.js';
import { getTypeIcon } from './utils.js';
import { getAllCards } from './db.js';

const cosmicArchive = new WebsimSocket();

export function displayFilteredCards(cards, selectedTypes, filterMode, isArchiveView = false) {
  const grid = document.querySelector('.collection-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  let filteredCards;
  
  if (selectedTypes.length === 0 || (selectedTypes.length === 1 && selectedTypes[0] === 'all')) {
    filteredCards = cards;
  } else if (filterMode === 'and') {
    filteredCards = cards.filter(card => 
      selectedTypes.every(type => 
        (isArchiveView ? card.cosmictype : card.type)
        .split('/')
        .map(t => t.trim())
        .includes(type)
      )
    );
  } else {
    filteredCards = cards.filter(card => 
      selectedTypes.some(type => 
        (isArchiveView ? card.cosmictype : card.type)
        .split('/')
        .map(t => t.trim())
        .includes(type)
      )
    );
  }
  
  if (filteredCards.length === 0) {
    grid.innerHTML = `
      <div class="no-cards-message">
        No cosmic phenomena found matching the selected filters
      </div>
    `;
    return;
  }
  
  filteredCards.forEach(card => {
    const miniCard = createMiniCard(card, isArchiveView);
    grid.appendChild(miniCard);
  });
}