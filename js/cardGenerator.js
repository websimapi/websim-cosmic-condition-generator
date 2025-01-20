import { getPokemonDescription, generatePokemonImage } from './api.js';
import { saveCard } from './db.js';
import { handleHover, resetHover } from './components/card.js';
import { getTypeIcon, getTypeColor } from './utils.js';

export async function generateCard() {
  // Remove existing card and submenu if any
  const existingCard = document.querySelector('.card');
  const existingSubmenu = document.querySelector('.submenu');
  if (existingCard) {
    existingCard.remove();
  }
  if (existingSubmenu) {
    existingSubmenu.remove();
  }

  // Create new card with front and back
  const cardContainer = document.getElementById('cardContainer');
  const card = document.createElement('div');
  card.className = 'card';
  
  // Create card inner structure with initial flipped state
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner flipped';
  
  cardInner.innerHTML = `
    <div class="card-front">
      <h2 class="cosmic-name"></h2>
      <div class="card-image-container"></div>
      <div class="stats-container">
        <div class="type-wrapper"></div>
        <p class="cosmic-stats"></p>
      </div>
      <div class="card-description">
        <p class="cosmic-description"></p>
      </div>
    </div>
    <div class="card-back">
      <div class="card-back-design">
        <svg class="card-back-logo" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" stroke-width="2"/>
          <circle cx="50" cy="50" r="20" fill="currentColor"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4"/>
        </svg>
        <div class="card-back-pattern"></div>
      </div>
    </div>
  `;
  
  card.appendChild(cardInner);
  
  // Create submenu but start hidden
  const submenu = document.createElement('div');
  submenu.className = 'submenu hidden';
  
  // Create submenu content with placeholder data
  submenu.innerHTML = `
    <div class="submenu-grid">
      <div class="stat-box">
        <div class="stat-label">Name</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Type</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Magnitude</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Radius</div>
        <div class="stat-value">???</div>
      </div>
    </div>
    <div class="description-box">
      <div class="description-title">Phenomenon Description</div>
      <div class="full-description">Generate a cosmic condition to see its description!</div>
    </div>
  `;
  
  cardContainer.appendChild(submenu);

  // Get cosmic condition description from LLM
  const cosmicData = await getPokemonDescription();

  // Update submenu content but keep it hidden
  const statValues = submenu.querySelectorAll('.stat-value');
  statValues[0].textContent = cosmicData.name;
  statValues[1].textContent = cosmicData.type;
  statValues[2].textContent = cosmicData.magnitude;
  statValues[3].textContent = cosmicData.radius;
  
  submenu.querySelector('.full-description').textContent = cosmicData.description;

  // Generate image based on description
  const imageUrl = await generatePokemonImage(`cosmic phenomenon ${cosmicData.description}`);
  
  // Move cardData declaration earlier
  const cardData = {
    name: cosmicData.name,
    description: cosmicData.description,
    type: cosmicData.type,
    magnitude: cosmicData.magnitude,
    radius: cosmicData.radius,
    imageUrl: imageUrl
  };

  // After successfully generating image, upload a backup
  if (imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${cosmicData.name}.png`, { type: 'image/png' });
      const backupImageUrl = await saveCard(file);
      cardData.backupImageUrl = backupImageUrl;
    } catch (error) {
      console.error('Failed to create backup image:', error);
    }
  }

  // Modify the image creation and load handler
  if (imageUrl) {
    const cosmicImage = document.createElement('img');
    cosmicImage.id = `cosmic-${Date.now()}`; // Unique ID
    cosmicImage.className = 'cosmic-image hidden'; // Add hidden class initially
    cosmicImage.src = imageUrl;
    cosmicImage.alt = `cosmic phenomenon ${cosmicData.description} - ${cosmicData.name}`;
    
    cosmicImage.addEventListener('load', async function() {
      const actualSrc = this.currentSrc || this.src;
      if (!actualSrc.includes('cosmic phenomenon')) {
        this.classList.remove('hidden');
        cardData.imageUrl = actualSrc;
        await saveCard(cardData);
      }
    });
    
    cosmicImage.addEventListener('error', function() {
      this.classList.add('hidden');
    });
    
    const imageContainer = card.querySelector('.card-image-container');
    imageContainer.appendChild(cosmicImage);
  }
  
  // Create and append cosmic info elements
  const nameElement = card.querySelector('.cosmic-name');
  nameElement.textContent = cosmicData.name;
  
  // Create stats container with new compact layout
  const statsContainer = card.querySelector('.stats-container');
  
  const types = cosmicData.type.split('/');
  const typeIcons = types.map(type => {
    const typeDiv = document.createElement('div');
    typeDiv.className = `type-icon ${type.toLowerCase().trim()}`;
    typeDiv.innerHTML = getTypeIcon(type.trim());
    typeDiv.title = type.trim();
    return typeDiv;
  });
  
  const typeWrapper = statsContainer.querySelector('.type-wrapper');
  typeIcons.forEach(icon => typeWrapper.appendChild(icon));

  // Add the gradient classes based on both types
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const cardFront = card.querySelector('.card-front');
  
  cardFront.className = 'card-front';
  
  // Create custom gradient style with cosmic overlay
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  cardFront.style.background = `
    linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%),
    radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)
  `;

  const statsElement = statsContainer.querySelector('.cosmic-stats');
  statsElement.textContent = `${cosmicData.magnitude} | ${cosmicData.radius}`;
  
  const descElement = card.querySelector('.cosmic-description');
  descElement.textContent = cosmicData.description;
  
  cardContainer.appendChild(card);

  // Add click handler with submenu toggle
  card.addEventListener('click', (e) => {
    const cardInner = e.currentTarget.querySelector('.card-inner');
    cardInner.classList.toggle('flipped');
    
    if (!cardInner.classList.contains('flipped')) {
      setTimeout(() => {
        submenu.classList.remove('hidden');
      }, 400);
    } else {
      submenu.classList.add('hidden');
    }
  });

  // Add hover effect
  card.addEventListener('mousemove', handleHover);
  card.addEventListener('mouseleave', resetHover);

  // Show card with initial animation
  requestAnimationFrame(() => {
    card.classList.add('show');
  });
}