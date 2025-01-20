export function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after animation
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function getTypeIcon(type) {
  const icons = {
    'Stellar': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 32l64 128 144 16-112 96 32 144-128-80-128 80 32-144-112-96 144-16z"/>
    </svg>`,
    
    'Nebula': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192zm-96 0c0 53-43 96-96 96s-96-43-96-96 43-96 96-96 96 43 96 96z"/>
    </svg>`,
    
    'Galactic': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 32c-123.7 0-224 100.3-224 224s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32z"/>
    </svg>`,
    
    'Orbital': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 48c-110.5 0-200 89.5-200 200s89.5 200 200 200 200-89.5 200-200S366.5 48 256 48z"/>
    </svg>`,
    
    'Cosmic': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 32l64 128 144 16-112 96 32 144-128-80-128 80 32-144-112-96 144-16z"/>
    </svg>`,
    
    'Solar': `<svg viewBox="0 0 512 512">
      <circle cx="256" cy="256" r="128" fill="currentColor"/>
      <path fill="currentColor" d="M256 64l32 32-32 32-32-32zM448 256l-32-32-32 32 32 32zM256 448l-32-32 32-32 32 32zM64 256l32 32 32-32-32-32z"/>
    </svg>`,
    
    'Lunar': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/>
    </svg>`,
    
    'Asteroid': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M480 256c0 123.7-100.3 224-224 224S32 379.7 32 256 132.3 32 256 32s224 100.3 224 224z"/>
    </svg>`,
    
    'Planetary': `<svg viewBox="0 0 512 512">
      <circle cx="256" cy="256" r="160" fill="currentColor"/>
      <path fill="none" stroke="currentColor" stroke-width="32" d="M256 96c88.4 0 160 71.6 160 160s-71.6 160-160 160S96 344.4 96 256s71.6-160 160-160"/>
    </svg>`,
    
    'Quantum': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 48c-110.5 0-200 89.5-200 200s89.5 200 200 200 200-89.5 200-200S366.5 48 256 48zm0 320c-66.2 0-120-53.8-120-120s53.8-120 120-120 120 53.8 120 120-53.8 120-120 120z"/>
    </svg>`,
    
    'Temporal': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z"/>
      <path fill="currentColor" d="M256 96v160h160"/>
    </svg>`,
  };
  
  return icons[type] || `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96z"/></svg>`;
}

export function getTypeColor(type) {
  const colors = {
    'stellar': '#FFD700', // Gold
    'nebula': '#FF69B4', // Hot Pink
    'galactic': '#4B0082', // Indigo
    'orbital': '#00CED1', // Dark Turquoise
    'cosmic': '#9400D3', // Dark Violet
    'solar': '#FFA500', // Orange
    'lunar': '#C0C0C0', // Silver
    'asteroid': '#8B4513', // Saddle Brown
    'planetary': '#32CD32', // Lime Green
    'quantum': '#00FFFF', // Cyan
    'temporal': '#483D8B', // Dark Slate Blue
  };
  
  return colors[type.toLowerCase()] || '#999999';
}