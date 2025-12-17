// Astrological interpretation generator
// Combines planet, sign, and house meanings for detailed personalized readings

interface Placement {
  name: string
  sign: string
  degree: string
  house: string
}

// Zodiac sign characteristics
const signTraits: Record<string, { element: string; quality: string; ruler: string; traits: string[]; personality: string }> = {
  Aries: {
    element: 'Fire',
    quality: 'Cardinal',
    ruler: 'Mars',
    traits: ['assertive', 'pioneering', 'impulsive', 'courageous', 'independent'],
    personality: 'Bold, energetic, and action-oriented. You lead with confidence and aren\'t afraid to take risks.'
  },
  Taurus: {
    element: 'Earth',
    quality: 'Fixed',
    ruler: 'Venus',
    traits: ['stable', 'sensual', 'practical', 'patient', 'determined'],
    personality: 'Grounded, reliable, and value-oriented. You appreciate beauty, comfort, and the finer things in life.'
  },
  Gemini: {
    element: 'Air',
    quality: 'Mutable',
    ruler: 'Mercury',
    traits: ['curious', 'communicative', 'adaptable', 'witty', 'versatile'],
    personality: 'Intellectually curious, quick-witted, and socially engaging. You thrive on variety and mental stimulation.'
  },
  Cancer: {
    element: 'Water',
    quality: 'Cardinal',
    ruler: 'Moon',
    traits: ['nurturing', 'intuitive', 'emotional', 'protective', 'sensitive'],
    personality: 'Deeply emotional and caring, with strong intuitive abilities. You value security and emotional connections.'
  },
  Leo: {
    element: 'Fire',
    quality: 'Fixed',
    ruler: 'Sun',
    traits: ['confident', 'creative', 'generous', 'dramatic', 'proud'],
    personality: 'Radiant, creative, and naturally charismatic. You shine brightly and inspire others with your warmth.'
  },
  Virgo: {
    element: 'Earth',
    quality: 'Mutable',
    ruler: 'Mercury',
    traits: ['analytical', 'practical', 'detail-oriented', 'helpful', 'perfectionist'],
    personality: 'Meticulous, service-oriented, and highly organized. You excel at improving and refining everything you touch.'
  },
  Libra: {
    element: 'Air',
    quality: 'Cardinal',
    ruler: 'Venus',
    traits: ['diplomatic', 'harmonious', 'aesthetic', 'cooperative', 'indecisive'],
    personality: 'Seeking balance and beauty in all things. You value relationships and strive for fairness and harmony.'
  },
  Scorpio: {
    element: 'Water',
    quality: 'Fixed',
    ruler: 'Pluto',
    traits: ['intense', 'transformative', 'passionate', 'secretive', 'powerful'],
    personality: 'Deep, intense, and transformative. You have the power to regenerate and understand life\'s mysteries.'
  },
  Sagittarius: {
    element: 'Fire',
    quality: 'Mutable',
    ruler: 'Jupiter',
    traits: ['adventurous', 'philosophical', 'optimistic', 'freedom-loving', 'truth-seeking'],
    personality: 'Free-spirited, philosophical, and always seeking truth and expansion. You\'re a natural teacher and explorer.'
  },
  Capricorn: {
    element: 'Earth',
    quality: 'Cardinal',
    ruler: 'Saturn',
    traits: ['ambitious', 'disciplined', 'responsible', 'practical', 'authoritative'],
    personality: 'Goal-oriented, disciplined, and naturally authoritative. You build lasting structures and achieve long-term success.'
  },
  Aquarius: {
    element: 'Air',
    quality: 'Fixed',
    ruler: 'Uranus',
    traits: ['innovative', 'independent', 'humanitarian', 'unconventional', 'intellectual'],
    personality: 'Forward-thinking, innovative, and committed to progress. You value freedom and work for the collective good.'
  },
  Pisces: {
    element: 'Water',
    quality: 'Mutable',
    ruler: 'Neptune',
    traits: ['intuitive', 'compassionate', 'artistic', 'dreamy', 'spiritual'],
    personality: 'Deeply intuitive, compassionate, and spiritually connected. You understand the unseen and feel deeply.'
  }
}

// House meanings
const houseMeanings: Record<string, { themes: string[]; lifeArea: string; description: string }> = {
  '1st House': {
    themes: ['identity', 'self-image', 'appearance', 'first impressions', 'vitality'],
    lifeArea: 'Self and Identity',
    description: 'The house of self, representing how you present yourself to the world, your physical appearance, and your core identity.'
  },
  '2nd House': {
    themes: ['possessions', 'values', 'money', 'self-worth', 'material security'],
    lifeArea: 'Resources and Values',
    description: 'The house of material possessions, personal values, and how you earn and manage resources.'
  },
  '3rd House': {
    themes: ['communication', 'siblings', 'learning', 'short trips', 'local environment'],
    lifeArea: 'Communication and Learning',
    description: 'The house of communication, early education, siblings, and your immediate environment.'
  },
  '4th House': {
    themes: ['home', 'family', 'roots', 'private life', 'foundation'],
    lifeArea: 'Home and Family',
    description: 'The house of home, family, ancestry, and your private emotional foundation.'
  },
  '5th House': {
    themes: ['creativity', 'romance', 'children', 'pleasure', 'self-expression'],
    lifeArea: 'Creativity and Pleasure',
    description: 'The house of creativity, romance, children, and joyful self-expression.'
  },
  '6th House': {
    themes: ['work', 'health', 'daily routines', 'service', 'pets'],
    lifeArea: 'Work and Health',
    description: 'The house of daily work, health, routines, and service to others.'
  },
  '7th House': {
    themes: ['partnerships', 'marriage', 'close relationships', 'others', 'balance'],
    lifeArea: 'Partnerships',
    description: 'The house of committed partnerships, marriage, and significant one-on-one relationships.'
  },
  '8th House': {
    themes: ['transformation', 'shared resources', 'intimacy', 'regeneration', 'mystery'],
    lifeArea: 'Transformation and Shared Resources',
    description: 'The house of transformation, shared resources, deep intimacy, and psychological depth.'
  },
  '9th House': {
    themes: ['philosophy', 'higher education', 'travel', 'religion', 'expansion'],
    lifeArea: 'Philosophy and Expansion',
    description: 'The house of higher learning, philosophy, long-distance travel, and spiritual expansion.'
  },
  '10th House': {
    themes: ['career', 'public image', 'reputation', 'authority', 'achievement'],
    lifeArea: 'Career and Public Image',
    description: 'The house of career, public reputation, authority, and your highest aspirations.'
  },
  '11th House': {
    themes: ['friendships', 'groups', 'hopes', 'dreams', 'community'],
    lifeArea: 'Friendships and Community',
    description: 'The house of friendships, groups, community involvement, and your hopes and dreams.'
  },
  '12th House': {
    themes: ['subconscious', 'spirituality', 'hidden matters', 'karma', 'solitude'],
    lifeArea: 'Subconscious and Spirituality',
    description: 'The house of the subconscious, spirituality, hidden matters, and karmic patterns.'
  }
}

// Planet/point meanings
const planetMeanings: Record<string, { coreMeaning: string; represents: string[]; expression: string }> = {
  'Rising': {
    coreMeaning: 'Your outer personality and how others perceive you',
    represents: ['first impressions', 'physical appearance', 'approach to life', 'mask you wear'],
    expression: 'This is the face you show to the world and how you naturally approach new situations.'
  },
  'Sun': {
    coreMeaning: 'Your core identity, ego, and life purpose',
    represents: ['who you are', 'your essence', 'vitality', 'conscious self'],
    expression: 'This represents your fundamental nature, what drives you, and how you shine your light.'
  },
  'Moon': {
    coreMeaning: 'Your emotional nature, instincts, and inner world',
    represents: ['emotions', 'needs', 'instincts', 'nurturing style', 'comfort'],
    expression: 'This reveals your emotional needs, how you process feelings, and what makes you feel secure.'
  },
  'Mercury': {
    coreMeaning: 'How you think, communicate, and process information',
    represents: ['communication style', 'thinking patterns', 'learning', 'intellect'],
    expression: 'This shows how you express yourself, process information, and connect with others mentally.'
  },
  'Venus': {
    coreMeaning: 'How you love, relate, and appreciate beauty',
    represents: ['love style', 'values', 'aesthetics', 'relationships', 'pleasure'],
    expression: 'This reveals your approach to love, what you value, and how you attract and relate to others.'
  },
  'Mars': {
    coreMeaning: 'How you take action, assert yourself, and express passion',
    represents: ['drive', 'assertion', 'passion', 'anger', 'action'],
    expression: 'This shows your energy, how you pursue goals, and how you handle conflict and desire.'
  },
  'Jupiter': {
    coreMeaning: 'Where you find expansion, growth, and abundance',
    represents: ['growth', 'optimism', 'philosophy', 'luck', 'expansion'],
    expression: 'This indicates where you naturally expand, find opportunities, and experience growth and abundance.'
  },
  'Saturn': {
    coreMeaning: 'Where you face challenges, build structure, and develop discipline',
    represents: ['responsibility', 'limitations', 'structure', 'discipline', 'karma'],
    expression: 'This shows where you must work hard, face challenges, and build lasting foundations through discipline.'
  },
  'Uranus': {
    coreMeaning: 'Where you innovate, rebel, and experience sudden change',
    represents: ['innovation', 'freedom', 'unpredictability', 'revolution', 'awakening'],
    expression: 'This reveals where you break free from tradition, innovate, and experience sudden insights or changes.'
  },
  'Neptune': {
    coreMeaning: 'Where you access imagination, spirituality, and transcendence',
    represents: ['imagination', 'spirituality', 'dreams', 'illusion', 'compassion'],
    expression: 'This shows where you connect with the mystical, access your imagination, and experience transcendence.'
  },
  'Pluto': {
    coreMeaning: 'Where you experience transformation, power, and regeneration',
    represents: ['transformation', 'power', 'regeneration', 'taboo', 'depth'],
    expression: 'This reveals where you undergo deep transformation, access hidden power, and experience profound change.'
  },
  'DC': {
    coreMeaning: 'What you seek in partnerships and how you relate to others',
    represents: ['partnership needs', 'relationship style', 'complementary qualities'],
    expression: 'This shows what you attract in partners and how you balance yourself through relationships.'
  },
  'MC': {
    coreMeaning: 'Your public image, career path, and highest aspirations',
    represents: ['career', 'reputation', 'public role', 'life direction'],
    expression: 'This indicates your career path, public reputation, and what you\'re meant to achieve in the world.'
  },
  'IC': {
    coreMeaning: 'Your private foundation, ancestry, and emotional roots',
    represents: ['home', 'family', 'roots', 'private self', 'foundation'],
    expression: 'This reveals your private foundation, family patterns, and what you need for emotional security.'
  },
  'North Node': {
    coreMeaning: 'Your soul\'s growth direction and what you\'re learning to become',
    represents: ['growth path', 'soul purpose', 'future development', 'destiny'],
    expression: 'This shows your karmic path forward, what you\'re learning to develop, and your soul\'s evolution.'
  },
  'South Node': {
    coreMeaning: 'Your past life gifts and what you\'re learning to release',
    represents: ['past talents', 'comfort zone', 'what to let go', 'karmic patterns'],
    expression: 'This reveals talents from past lives that you must learn to balance and not over-rely upon.'
  },
  'Black Moon Lilith': {
    coreMeaning: 'Where you express raw, untamed power and defiance',
    represents: ['wildness', 'taboo', 'defiance', 'raw power', 'shadow'],
    expression: 'This shows where you refuse to conform, express your wild nature, and access untamed power.'
  },
  'Chiron': {
    coreMeaning: 'Your deepest wound and greatest gift of healing',
    represents: ['wound', 'healing', 'teaching', 'vulnerability', 'wisdom'],
    expression: 'This reveals your deepest wound, which becomes your greatest gift as you learn to heal and teach others.'
  },
  'Pallas Athena': {
    coreMeaning: 'How you strategize, create patterns, and use wisdom',
    represents: ['strategy', 'wisdom', 'patterns', 'creative intelligence'],
    expression: 'This shows your strategic thinking, how you solve problems creatively, and access to wisdom.'
  }
}

// Generate detailed interpretation
export function generateInterpretation(placement: Placement): {
  shortDesc: string
  detailedAnalysis: string
  whatYouAre: string
  whatYouBecome: string
} {
  const { name, sign, house } = placement
  const signInfo = signTraits[sign] || signTraits['Aries']
  const houseInfo = houseMeanings[house] || houseMeanings['1st House']
  const planetInfo = planetMeanings[name] || planetMeanings['Sun']

  // Short description
  const shortDesc = planetInfo.coreMeaning

  // Detailed analysis combining all elements
  const elementDescription = signInfo.element === 'Fire' 
    ? 'passion, inspiration, and dynamic action' 
    : signInfo.element === 'Earth' 
    ? 'practicality, stability, and tangible results' 
    : signInfo.element === 'Air' 
    ? 'intellect, communication, and mental stimulation' 
    : 'emotion, intuition, and deep sensitivity'
  
  const qualityDescription = signInfo.quality === 'Cardinal' 
    ? 'initiating and leading change' 
    : signInfo.quality === 'Fixed' 
    ? 'maintaining stability and persistence' 
    : 'adapting and finding flexible solutions'
  
  const detailedAnalysis = `${planetInfo.expression} With ${name} in ${sign}, you express this energy through ${signInfo.personality.toLowerCase()}. This ${signInfo.element.toLowerCase()} sign brings ${signInfo.quality.toLowerCase()} energy, making you naturally ${signInfo.traits.slice(0, 2).join(' and ')} in this area of life. 

The ${house} represents ${houseInfo.description.toLowerCase()} Here, ${name} in ${sign} means you approach ${houseInfo.lifeArea.toLowerCase()} with ${signInfo.traits[0]} energy, ${signInfo.traits[1]} determination, and a ${signInfo.quality.toLowerCase()} approach that involves ${qualityDescription}. The themes of ${houseInfo.themes.slice(0, 3).join(', ')} are particularly significant for you, and you experience these areas through the lens of ${sign} energy.

This placement suggests that ${planetInfo.represents[0]} is deeply connected to your ${houseInfo.lifeArea.toLowerCase()}, and you naturally bring ${elementDescription} to how you experience and express ${planetInfo.represents[0]}. The combination of ${sign} (ruled by ${signInfo.ruler}) in the ${house} creates a unique expression where your ${planetInfo.represents[1] || planetInfo.represents[0]} is filtered through ${signInfo.element.toLowerCase()} energy, making you particularly ${signInfo.traits[2]} when it comes to ${houseInfo.themes[0]} and ${houseInfo.themes[1] || houseInfo.themes[0]}.`

  // What you are
  const qualityAction = signInfo.quality === 'Cardinal' 
    ? 'initiate and lead' 
    : signInfo.quality === 'Fixed' 
    ? 'persist and maintain with determination' 
    : 'adapt and adjust flexibly'
  
  const whatYouAre = `You are someone who ${planetInfo.represents[0]} through the lens of ${sign} energy in the ${house}. This makes you naturally ${signInfo.traits[0]} and ${signInfo.traits[1]} when it comes to ${houseInfo.themes[0]} and ${houseInfo.themes[1]}. Your ${name} placement reveals that you ${planetInfo.represents[1] || planetInfo.represents[0]} with ${signInfo.personality.toLowerCase()}, particularly in areas related to ${houseInfo.lifeArea}. 

You have a ${signInfo.quality.toLowerCase()} approach to ${planetInfo.coreMeaning.toLowerCase()}, meaning you ${qualityAction} in this area of your life. The ${signInfo.element.toLowerCase()} element of ${sign} gives you a natural affinity for ${signInfo.element === 'Fire' ? 'taking bold action and inspiring others' : signInfo.element === 'Earth' ? 'building practical foundations and creating tangible results' : signInfo.element === 'Air' ? 'communicating ideas and connecting through intellect' : 'navigating emotional depths and intuitive understanding'}. This is especially evident in how you handle ${houseInfo.themes[0]}, where your ${sign} nature shines through.`

  // What you become
  const whatYouBecome = `As you evolve, you become someone who masters the art of ${planetInfo.represents[0]} through ${sign} wisdom in the ${house}. You develop into a person who ${signInfo.traits[2]} ${planetInfo.represents[0]} while maintaining ${signInfo.traits[3]} in ${houseInfo.lifeArea.toLowerCase()}. 

Your growth path involves learning to balance the ${signInfo.element.toLowerCase()} nature of ${sign} with the deeper themes of the ${house}, allowing you to ${planetInfo.represents[2] || planetInfo.represents[0]} with greater wisdom and maturity. You become a ${signInfo.traits[4]} individual who uses ${name} energy to transform ${houseInfo.themes[0]} and ${houseInfo.themes[1] || houseInfo.themes[0]} in meaningful ways, embodying the best qualities of ${sign} while honoring the ${houseInfo.lifeArea.toLowerCase()} that shapes your experience.

Through this evolution, you learn to channel the ${signInfo.ruler}-ruled energy of ${sign} more consciously, using your natural ${signInfo.traits[0]} and ${signInfo.traits[1]} tendencies as strengths rather than limitations. You develop a deeper understanding of how ${houseInfo.themes.join(', ')} intersect with your core ${name} expression, creating a more integrated and authentic way of being in the world.`

  return {
    shortDesc,
    detailedAnalysis,
    whatYouAre,
    whatYouBecome
  }
}

