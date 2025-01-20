export async function getPokemonDescription() {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a creative description for a unique cosmic condition or celestial phenomenon. The name should be original and meaningful, derived from astronomical or physics terms that relate to the condition's characteristics. For example:
        - "Chronopulsar" (temporal pulsar phenomenon)
        - "Neovortex" (newly formed space vortex)
        - "Quantanebula" (quantum nebula formation)
        
        Be imaginative and original. Include its type (Stellar, Nebula, Galactic, Orbital, Cosmic, Solar, Lunar, Asteroid, Planetary, Quantum, or Temporal), magnitude (in astronomical units), radius (in light years), and a brief poetic description of its appearance and effects. The description should capture the awe-inspiring and mysterious nature of cosmic phenomena.

        interface Response {
          name: string;
          description: string;
          type: string;
          magnitude: string;
          radius: string;
        }

        Example response (generate something completely different):
        {
          "name": "Stellarix",
          "description": "A magnificent stellar anomaly that bends light into crystalline patterns, creating cascading waves of chromatic energy that ripple through nearby space-time.",
          "type": "Stellar/Quantum",
          "magnitude": "2.3 AU",
          "radius": "0.5 LY"
        }`,
        data: ""
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cosmic condition:', error);
    return {
      name: 'Error',
      description: 'Failed to generate cosmic condition',
      type: 'Unknown',
      magnitude: 'Unknown',
      radius: 'Unknown'
    };
  }
}

export async function generatePokemonImage(description) {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a unique image URL for a cosmic phenomenon based on this description: "${description}". The image should depict a spectacular space scene with celestial bodies, energy patterns, and cosmic effects. Return a URL to an image that matches the description.

        interface Response {
          imageUrl: string;
        }

        Example response (generate something different):
        {
          "imageUrl": "https://example.com/cosmic-image.jpg"
        }`,
        data: description
      }),
    });
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating cosmic image:', error);
    return null;
  }
}