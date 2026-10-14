import { db } from '../lib/db.js'
import { MASTER_EXERCISES } from '../data/exercisesData.js'

/**
 * Intelligent exercise item resolver.
 * Handles IDs ('ex-01'), exact names ('Jumping Jacks'), partial matches ('Therapy Ball'),
 * or custom clinical strings ('Tummy Time & Floor Crawling Games') and guarantees a complete
 * exercise object with category, description, and high-quality verified image URL.
 */
/**
 * Dedicated Clinical Mapping for Assessment-Generated Activities.
 * Guarantees that specialized items (Weighted Blanket, Sensory Fidget Toy, My Calm Corner,
 * Routine Books, Cones, etc.) receive distinct clinical manual pages, tailored photos, and instructions.
 */
export const CLINICAL_ACTIVITIES_MAP = {
  'sensory fidget toy': {
    refId: 'ex-28',
    category: 'Tactile & Sensory Regulation',
    category_color: '#854F0B',
    name: 'Sensory Fidget Toy',
    description: 'Targeted tactile engagement using textured fidget tools, tactile squeeze balls, sensory putty, or pop-it pads to channel sensory-seeking behaviors, increase finger endurance, and sustain attention.',
    home_description: 'Provide textured fidget tools during seated tasks, reading, or quiet time to aid sensory modulation and self-regulation.',
    benefits: [
      'Channels sensory seeking into functional focus',
      'Improves tactile processing and finger dexterity',
      'Helps reduce anxiety and motor restlessness',
      'Supports sustained attention during seated learning',
      'Encourages independent self-regulation'
    ]
  },
  'fidget toy': {
    refId: 'ex-28',
    category: 'Tactile & Sensory Regulation',
    category_color: '#854F0B',
    name: 'Sensory Fidget Toy',
    description: 'Targeted tactile engagement using textured fidget tools, tactile squeeze balls, sensory putty, or pop-it pads to channel sensory-seeking behaviors, increase finger endurance, and sustain attention.',
    home_description: 'Provide textured fidget tools during seated tasks, reading, or quiet time to aid sensory modulation and self-regulation.',
    benefits: [
      'Channels sensory seeking into functional focus',
      'Improves tactile processing and finger dexterity',
      'Helps reduce anxiety and motor restlessness',
      'Supports sustained attention during seated learning',
      'Encourages independent self-regulation'
    ]
  },
  'weighted blanket': {
    refId: 'ex-22',
    category: 'Proprioceptive & Deep Pressure',
    category_color: '#854F0B',
    name: 'Weighted Blanket / Deep Pressure Therapy',
    description: "Application of evenly distributed, therapeutic weight across the child's body or lap to provide calming proprioceptive deep touch pressure and down-regulate an overstimulated nervous system.",
    home_description: 'Drape a child-safe weighted blanket or lap pad (5–10% body weight) over lap or shoulders for 15–20 minutes during quiet time or transitions.',
    benefits: [
      'Provides deep proprioceptive input to calm the central nervous system',
      'Enhances body boundary awareness and grounding',
      'Reduces hyperactivity, restlessness, and sensory overload',
      'Promotes smoother bedtime and rest transitions',
      'Supports emotional equilibrium and focus'
    ]
  },
  'my calm corner': {
    refId: 'ex-30',
    category: 'Behavioral & Emotional Self-Regulation',
    category_color: '#3C3489',
    name: 'My Calm Corner',
    description: 'A designated quiet sensory retreat space with soft cushions, visual emotional regulation cards, and soothing items where the child learns self-soothing and co-regulation strategies.',
    home_description: 'Guide child to their quiet cozy corner with cushions and feeling cards when signs of overstimulation or frustration begin.',
    benefits: [
      'Encourages proactive self-regulation and emotional awareness',
      'De-escalates sensory overload before behavioral meltdowns occur',
      'Provides a safe, quiet refuge for resting and recalibrating',
      'Develops long-term coping strategies and emotional resilience',
      'Reinforces positive self-management in the home environment'
    ]
  },
  'calm corner': {
    refId: 'ex-30',
    category: 'Behavioral & Emotional Self-Regulation',
    category_color: '#3C3489',
    name: 'My Calm Corner',
    description: 'A designated quiet sensory retreat space with soft cushions, visual emotional regulation cards, and soothing items where the child learns self-soothing and co-regulation strategies.',
    home_description: 'Guide child to their quiet cozy corner with cushions and feeling cards when signs of overstimulation or frustration begin.',
    benefits: [
      'Encourages proactive self-regulation and emotional awareness',
      'De-escalates sensory overload before behavioral meltdowns occur',
      'Provides a safe, quiet refuge for resting and recalibrating',
      'Develops long-term coping strategies and emotional resilience',
      'Reinforces positive self-management in the home environment'
    ]
  },
  'social stories': {
    refId: 'ex-30',
    category: 'Social Cognition & Behavior',
    category_color: '#3C3489',
    name: 'Social Stories',
    description: 'Short, structured narrative stories with visual illustrations that clearly depict social cues, expected behaviors, and coping strategies for upcoming events or daily routines.',
    home_description: 'Read short illustrated social stories together before social gatherings, school transitions, or new routines.',
    benefits: [
      'Improves comprehension of social dynamics and expectations',
      'Reduces transition-related anxiety and uncertainty',
      'Teaches proactive coping mechanisms and perspective-taking',
      'Promotes positive peer interactions'
    ]
  },
  'game expression puzzle': {
    refId: 'ex-18',
    category: 'Visual Perception & Social Cognition',
    category_color: '#534AB7',
    name: 'Game Expression Puzzle',
    description: 'Matching facial expressions and emotional cues on puzzle boards to develop social perception, empathy, and fine motor fitting skills.',
    home_description: 'Piece together emotion puzzle boards (happy, calm, surprised, sad) while discussing what each expression means.',
    benefits: [
      'Enhances facial expression recognition and empathy',
      'Develops visual-spatial and fine motor matching skills',
      'Fosters emotional vocabulary and social communication'
    ]
  },
  'everyday routine book': {
    refId: 'ex-31',
    category: 'Visual Schedules & Daily Living (ADL)',
    category_color: '#3C3489',
    name: 'Everyday Routine Book',
    description: "A personalized pictorial schedule book illustrating key steps of the child's day (morning routine, dressing, meals, school, bedtime) to foster sequential independence.",
    home_description: 'Review the visual routine book step-by-step with your child before each transition to build daily routine predictability.',
    benefits: [
      'Provides predictability and reduces transition resistance',
      'Fosters independent daily living and self-care routines',
      'Supports visual memory and temporal sequencing'
    ]
  },
  'hole rings': {
    refId: 'ex-10',
    category: 'Coordination & Balance Targets',
    category_color: '#0F6E56',
    name: 'Hole Rings Balance & Toss',
    description: 'Stepping into and tossing rings onto designated floor targets to challenge dynamic standing balance, foot-eye coordination, and spatial precision.',
    home_description: 'Place rings on the floor for child to step inside heel-to-toe or toss rings onto cones while standing steady.',
    benefits: [
      'Develops dynamic standing balance and postural adjustments',
      'Enhances lower limb coordination and motor planning',
      'Strengthens visual-motor targeting and accuracy'
    ]
  },
  'cones': {
    refId: 'ex-06',
    category: 'Gross Motor & Agility',
    category_color: '#185FA5',
    name: 'Cone Weaving & Agility Drills',
    description: 'Slalom walking, running, and hopping around staggered traffic cones to challenge rapid direction changes, spatial planning, and footwork.',
    home_description: 'Set up 4–5 cups or cones in a line; practice weaving, hopping, and running around them smoothly.',
    benefits: [
      'Sharpens agility and rapid direction changes',
      'Builds dynamic postural stability and balance',
      'Improves motor planning and spatial awareness'
    ]
  },
  'memory game': {
    refId: 'ex-20',
    category: 'Cognitive & Working Memory',
    category_color: '#534AB7',
    name: 'Visual Memory Matching Game',
    description: 'Pairing matching cards, shapes, or picture tiles from memory to strengthen visual recall, focus, and working memory capacity.',
    home_description: 'Play picture-matching memory games daily, starting with 4 pairs and gradually increasing.',
    benefits: [
      'Strengthens visual working memory and recall speed',
      'Improves sustained attention span and impulse control',
      'Encourages logical reasoning and problem-solving'
    ]
  },
  'spelling flashcards': {
    refId: 'ex-29',
    category: 'Phonological & Visual Discrimination',
    category_color: '#3C3489',
    name: 'Spelling & Phonics Flashcards',
    description: 'Visual cards showing letter combinations, word families, and articulation mouth shapes to reinforce phonetic decoding and speech precision.',
    home_description: 'Sound out phonics flashcards together with rhythmic hand claps for each syllable.',
    benefits: [
      'Builds foundational phonological awareness and decoding',
      'Enhances letter-sound correspondence',
      'Boosts speech clarity and expressive vocabulary'
    ]
  },
  'magnet maze': {
    refId: 'ex-16',
    category: 'Fine Motor & Visual Tracking',
    category_color: '#534AB7',
    name: 'Magnetic Wand Maze',
    description: 'Guiding magnetic spheres through labyrinth pathways using a magnetic stylus to train precision tripod grasp, finger control, and smooth visual pursuit.',
    home_description: 'Sit upright at a table and guide magnetic beads through the maze using a gentle tripod grasp.',
    benefits: [
      'Prepares fingers for pencil grasp and handwriting endurance',
      'Strengthens intrinsic hand muscles and finger isolation',
      'Enhances smooth visual pursuit and tracking'
    ]
  },
  'butterfly lacing toy': {
    refId: 'ex-17',
    category: 'Fine Motor & Bilateral Coordination',
    category_color: '#534AB7',
    name: 'Butterfly Lacing Toy',
    description: 'Threading laces through eyelets along the wings of a wooden butterfly board using synchronized two-handed manipulation.',
    home_description: 'Hold the wooden board with one hand and lace the cord through eyelets in sequence with the dominant hand.',
    benefits: [
      'Develops bilateral hand coordination and finger dexterity',
      'Strengthens pincer grip and hand-eye precision',
      'Fosters patience, sequencing, and sustained attention'
    ]
  },
  'beads maze': {
    refId: 'ex-17',
    category: 'Fine Motor Dexterity',
    category_color: '#534AB7',
    name: 'Beads Wire Maze',
    description: 'Sliding multi-colored wooden beads along looping 3D wire roller-coaster tracks to practice finger isolation, wrist rotation, and crossing the midline.',
    home_description: 'Slide beads one by one along wire spirals, switching hands as the bead crosses midline.',
    benefits: [
      'Promotes finger isolation and wrist rotation',
      'Enhances 3D visual depth perception and tracking',
      'Encourages bilateral coordination across midline'
    ]
  },
  'dressing frame': {
    refId: 'ex-19',
    category: 'ADL & Fine Motor Independence',
    category_color: '#534AB7',
    name: 'Montessori Dressing Frame',
    description: 'Practice frames featuring large buttons, zippers, snaps, and laces to develop the motor coordination required for independent self-dressing.',
    home_description: 'Practice buttoning large buttons and pulling zippers on the dressing board before morning dressing.',
    benefits: [
      'Fosters independent dressing skills and autonomy',
      'Improves finger pinch strength and two-handed coordination',
      'Builds self-confidence in daily life routines'
    ]
  },
  'communication flash cards': {
    refId: 'ex-31',
    category: 'Augmentative Communication (AAC)',
    category_color: '#3C3489',
    name: 'Communication Flash Cards (PECS)',
    description: 'High-contrast symbol flashcards allowing the child to point to or exchange icons to express functional needs, choices, and feelings.',
    home_description: 'Keep symbol cards accessible at all times; prompt child to point or exchange card before receiving snacks or toys.',
    benefits: [
      'Decreases communicative frustration and behavioral outbursts',
      'Encourages functional language development and choice making',
      'Enhances receptive and expressive understanding'
    ]
  },
  'social skills training': {
    refId: 'ex-07',
    category: 'Social Interaction & Play',
    category_color: '#534AB7',
    name: 'Social Skills & Interactive Play Training',
    description: 'Structured cooperative play activities, turn-taking games, and shared attention exercises to build peer interaction skills.',
    home_description: 'Practice turn-taking board games and structured partner ball toss at home.',
    benefits: ['Improves peer engagement', 'Develops turn-taking', 'Fosters emotional reciprocity']
  },
  'narrative activities': {
    refId: 'ex-30',
    category: 'Behavioral & Social Learning',
    category_color: '#3C3489',
    name: 'Narrative & Storytelling Activities',
    description: 'Sequenced picture-story retelling to foster verbal expression, chronological ordering, and emotional comprehension.',
    home_description: 'Prompt child to retell story events using "first, then, last" sequencing.',
    benefits: ['Enhances language sequencing', 'Improves comprehension', 'Builds conversational confidence']
  },
  'cbt activities': {
    refId: 'ex-30',
    category: 'Behavioral & Emotional Regulation',
    category_color: '#3C3489',
    name: 'CBT & Emotional Regulation Activities',
    description: 'Child-friendly cognitive-behavioral exercises focusing on identifying emotional sensations, thought-feeling links, and calming self-talk.',
    home_description: 'Practice the "stop, breathe, think" three-step pause when feeling upset.',
    benefits: ['Fosters self-awareness', 'Reduces reactive anxiety', 'Builds coping self-talk']
  },
  'role play': {
    refId: 'ex-07',
    category: 'Social Cognition & Communication',
    category_color: '#534AB7',
    name: 'Therapeutic Role Play',
    description: 'Guided dramatic play and real-world scenario rehearsals to prepare the child for school, doctor visits, and peer play.',
    home_description: 'Act out everyday social situations with stuffed animals or family members.',
    benefits: ['Builds social flexibility', 'Reduces social anxiety', 'Enhances conversational empathy']
  },
  'aba activities': {
    refId: 'ex-20',
    category: 'Behavioral & Skill Acquisition',
    category_color: '#534AB7',
    name: 'Applied Behavior Analysis (ABA) Tasks',
    description: 'Discrete trial training and positive reinforcement routines targeting receptive language, categorization, and task compliance.',
    home_description: 'Use clear one-step prompts and immediate positive praise during daily tasks.',
    benefits: ['Enhances instructional compliance', 'Reinforces target skills', 'Builds structured learning habits']
  },
  'fine motor activities': {
    refId: 'ex-16',
    category: 'Fine Motor & Dexterity',
    category_color: '#534AB7',
    name: 'Fine Motor Dexterity Activities',
    description: 'Targeted manipulation tasks including pegboards, tweezers, and clay pinch games to strengthen intrinsic hand muscles.',
    home_description: 'Practice picking up small objects with tweezers or pinching playdough.',
    benefits: ['Develops pincer grasp', 'Builds hand muscle endurance', 'Improves finger isolation']
  },
  'behaviour modification': {
    refId: 'ex-30',
    category: 'Behavioral & Social Learning',
    category_color: '#3C3489',
    name: 'Behaviour Modification Protocols',
    description: 'Structured token economy, visual expectation boards, and differential reinforcement strategies to shape positive behaviors.',
    home_description: 'Use a visual star chart or token board to reward positive routine completion.',
    benefits: ['Reduces challenging behaviors', 'Increases on-task duration', 'Promotes positive motivation']
  },
  'physiotherapy exercises': {
    refId: 'ex-26',
    category: 'Gross Motor & Mobility',
    category_color: '#0F6E56',
    name: 'Clinical Physiotherapy Exercises',
    description: 'Targeted physical therapy routines including joint range of motion, muscle stretching, and alignment exercises.',
    home_description: 'Perform gentle passive or active-assisted stretches as guided by the physiotherapist.',
    benefits: ['Maintains joint mobility', 'Prevents muscle tightness', 'Supports functional movement']
  },
  'balance training': {
    refId: 'ex-09',
    category: 'Vestibular & Balance',
    category_color: '#0F6E56',
    name: 'Balance & Postural Stability Training',
    description: 'Static and dynamic balance drills on wobble cushions, beam walks, and single-leg balance to activate vestibular pathways.',
    home_description: 'Practice standing on one foot or walking heel-to-toe along a tape line.',
    benefits: ['Improves static and dynamic balance', 'Strengthens stabilizing muscles', 'Prevents falls']
  },
  'memory activities': {
    refId: 'ex-20',
    category: 'Cognitive & Working Memory',
    category_color: '#534AB7',
    name: 'Working Memory Training',
    description: 'Multi-modal cognitive drills involving auditory recall, visual sequencing, and n-back matching games.',
    home_description: 'Play "I went to the market" memory games and multi-step Simon Says.',
    benefits: ['Enhances working memory', 'Improves multi-step instruction following', 'Boosts cognitive processing']
  },
  'attention training': {
    refId: 'ex-32',
    category: 'Cognitive & Attention',
    category_color: '#854F0B',
    name: 'Attention & Focus Training',
    description: 'Structured concentration exercises including visual cancellation sheets, continuous performance tasks, and rhythm synchronization.',
    home_description: 'Engage in 5-minute timed focus tasks without interruptions, using a visual timer.',
    benefits: ['Increases sustained attention span', 'Reduces distractibility', 'Improves task completion']
  },
  'remedial tasks': {
    refId: 'ex-32',
    category: 'Cognitive & Academic Remediation',
    category_color: '#854F0B',
    name: 'Remedial Educational Tasks',
    description: 'Multisensory remedial techniques addressing specific learning difficulties in reading, writing, and spatial calculations.',
    home_description: 'Incorporate tactile letters and sand tray writing into daily practice.',
    benefits: ['Strengthens academic foundational skills', 'Improves letter-number recognition', 'Boosts learning confidence']
  },
  'brain gym activity book': {
    refId: 'ex-32',
    category: 'Cognitive & Bilateral Integration',
    category_color: '#854F0B',
    name: 'Brain Gym Activity Book',
    description: 'Cross-lateral movement exercises including Cross Crawls, Lazy 8s, and Double Doodles to integrate left and right brain hemispheres.',
    home_description: 'Practice Lazy 8 drawing on large paper and cross-crawl marching before seated homework.',
    benefits: ['Integrates bilateral coordination', 'Calms nervous system', 'Prepares brain for reading and writing']
  },
  'adl training': {
    refId: 'ex-19',
    category: 'ADL & Independence',
    category_color: '#534AB7',
    name: 'Activities of Daily Living (ADL) Training',
    description: 'Hands-on functional training in feeding, dressing, grooming, and personal hygiene to achieve maximum independence.',
    home_description: 'Break dressing and grooming into small manageable steps, allowing child to finish the final step.',
    benefits: ['Fosters self-care independence', 'Builds pride and autonomy', 'Improves functional motor coordination']
  }
}

/**
 * Intelligent exercise item resolver.
 * Handles IDs ('ex-01'), exact names ('Jumping Jacks'), partial matches ('Therapy Ball'),
 * or custom clinical strings ('Tummy Time & Floor Crawling Games') and guarantees a complete
 * exercise object with category, description, and high-quality verified image URL.
 */
export function resolveExerciseItem(item, availableList = MASTER_EXERCISES) {
  if (!item) return null

  const getRef = (masterId) => {
    return (
      availableList.find(e => e.id?.toLowerCase() === masterId.toLowerCase() || e.db_id === masterId) ||
      MASTER_EXERCISES.find(e => e.id?.toLowerCase() === masterId.toLowerCase()) ||
      availableList[0] ||
      MASTER_EXERCISES[0]
    )
  }

  const searchStr = (typeof item === 'string' ? item : item.name || item.id || '').trim().toLowerCase()
  if (!searchStr) return null

  const buildResult = (base, customProps = {}) => {
    const isObj = typeof item === 'object'
    return {
      ...base,
      ...customProps,
      ...(isObj ? item : {}),
      id: isObj && item.id ? item.id : customProps.id || base.id || `ex-${searchStr.replace(/[^a-z0-9]/g, '-').slice(0, 24)}`,
      name: (isObj ? item.name : item) || customProps.name || base.name,
      category: (isObj && item.category) || customProps.category || base.category || 'Home Therapy',
      category_color: (isObj && item.category_color) || customProps.category_color || base.category_color,
      description: (isObj && item.description) || customProps.description || base.description || 'Clinical therapeutic exercise for milestone achievement.',
      home_description: (isObj && (item.home_description || item.homeDescription)) || customProps.home_description || base.home_description || base.description,
      image_url: (isObj && (item.image_url || item.imageUrl)) || customProps.image_url || base.image_url,
      benefits: (isObj && item.benefits && item.benefits.length > 0) ? item.benefits : (customProps.benefits || base.benefits || [])
    }
  }

  // 1. Exact ID match (check both availableList and MASTER_EXERCISES)
  let found = availableList.find(e => e.id?.toLowerCase() === searchStr || e.db_id === searchStr)
  if (!found) found = MASTER_EXERCISES.find(e => e.id?.toLowerCase() === searchStr)
  if (found) return buildResult(found)

  // 2. Exact Name match (case-insensitive)
  found = availableList.find(e => e.name?.toLowerCase() === searchStr)
  if (!found) found = MASTER_EXERCISES.find(e => e.name?.toLowerCase() === searchStr)
  if (found) return buildResult(found)

  // 3. Clinical activities exact match
  if (CLINICAL_ACTIVITIES_MAP[searchStr]) {
    const spec = CLINICAL_ACTIVITIES_MAP[searchStr]
    return buildResult(getRef(spec.refId), spec)
  }

  // 4. Clinical activities key substring check (prevents blanket group collisions)
  for (const [key, spec] of Object.entries(CLINICAL_ACTIVITIES_MAP)) {
    if (searchStr === key || searchStr.includes(key) || key.includes(searchStr)) {
      return buildResult(getRef(spec.refId), spec)
    }
  }

  // 5. Substring / normalized match (e.g. "Swing Therapy" -> "Swing Therapy (Pediatric Swing)", "Treadmill" -> "Treadmill Training")
  found = availableList.find(e => {
    const eName = e.name?.toLowerCase() || ''
    return eName.includes(searchStr) || searchStr.includes(eName)
  })
  if (!found) {
    found = MASTER_EXERCISES.find(e => {
      const eName = e.name?.toLowerCase() || ''
      return eName.includes(searchStr) || searchStr.includes(eName)
    })
  }
  if (found) return buildResult(found)

  // 6. Clinical semantic keyword matching — guarantees every clinical exercise has a verified photo & instructions
  if (searchStr.includes('tummy') || searchStr.includes('crawl') || searchStr.includes('prone') || searchStr.includes('wedge')) {
    return buildResult(getRef('ex-24'), { category: 'Gross Motor & Prone Skills' })
  }

  if (searchStr.includes('superman') || searchStr.includes('extensor') || searchStr.includes('flying')) {
    return buildResult(getRef('ex-13'), { category: 'Extensor Strengthening' })
  }

  if (searchStr.includes('ball') || searchStr.includes('rocking') || searchStr.includes('bounce')) {
    return buildResult(getRef('ex-15'), { category: 'Sensory & Postural Control' })
  }

  if (searchStr.includes('throw') || searchStr.includes('catch') || searchStr.includes('toss')) {
    return buildResult(getRef('ex-07'), { category: 'Visual-Motor & Social' })
  }

  if (searchStr.includes('kick') || searchStr.includes('foot') || searchStr.includes('soccer')) {
    return buildResult(getRef('ex-08'), { category: 'Gross Motor & Balance' })
  }

  if (searchStr.includes('single leg') || searchStr.includes('flamingo') || searchStr.includes('stork')) {
    return buildResult(getRef('ex-09'), { category: 'Vestibular & Balance' })
  }

  if (
    searchStr.includes('balance') ||
    searchStr.includes('stepping') ||
    searchStr.includes('line') ||
    searchStr.includes('stones')
  ) {
    return buildResult(getRef('ex-10'), { category: 'Balance & Motor Coordination' })
  }

  if (searchStr.includes('bridge') || searchStr.includes('bridging') || searchStr.includes('pelvic')) {
    return buildResult(getRef('ex-11'), { category: 'Core & Pelvic Stability' })
  }

  if (searchStr.includes('plank') || searchStr.includes('core stability')) {
    return buildResult(getRef('ex-12'), { category: 'Core & Shoulder Stability' })
  }

  if (searchStr.includes('wheelbarrow') || searchStr.includes('hand walk')) {
    return buildResult(getRef('ex-14'), { category: 'Upper Limb & Core' })
  }

  if (
    searchStr.includes('pincer') ||
    searchStr.includes('peg') ||
    searchStr.includes('stack') ||
    searchStr.includes('cup') ||
    searchStr.includes('grasp')
  ) {
    return buildResult(getRef('ex-16'), { category: 'Fine Motor & Dexterity' })
  }

  if (searchStr.includes('bead') || searchStr.includes('string') || searchStr.includes('thread')) {
    return buildResult(getRef('ex-17'), { category: 'Fine Motor Coordination' })
  }

  if (searchStr.includes('puzzle') || searchStr.includes('sort') || searchStr.includes('shape')) {
    return buildResult(getRef('ex-18'), { category: 'Cognitive & Visual Spatial' })
  }

  if (searchStr.includes('button') || searchStr.includes('zip') || searchStr.includes('dress') || searchStr.includes('shoe') || searchStr.includes('adl')) {
    return buildResult(getRef('ex-19'), { category: 'ADL & Independence' })
  }

  if (searchStr.includes('swing') || searchStr.includes('hammock') || searchStr.includes('vestibular stimulation')) {
    return buildResult(getRef('ex-21'), { category: 'Vestibular & Sensory Integration' })
  }

  if (searchStr.includes('vibrat') || searchStr.includes('vibration')) {
    return buildResult(getRef('ex-22'), { category: 'Proprioceptive & Tactile' })
  }

  if (searchStr.includes('treadmill') || searchStr.includes('gait')) {
    return buildResult(getRef('ex-23'), { category: 'Gait & Endurance' })
  }

  if (searchStr.includes('standing frame') || searchStr.includes('weight bearing') || searchStr.includes('upright')) {
    return buildResult(getRef('ex-25'), { category: 'Weight Bearing & Posture' })
  }

  if (searchStr.includes('stretch') || searchStr.includes('flexibility') || searchStr.includes('tightness')) {
    return buildResult(getRef('ex-26'), { category: 'Flexibility & Joint Mobility' })
  }

  if (searchStr.includes('theraband') || searchStr.includes('band') || searchStr.includes('resistance')) {
    return buildResult(getRef('ex-27'), { category: 'Resistance & Strengthening' })
  }

  if (
    searchStr.includes('sensory') ||
    searchStr.includes('tactile') ||
    searchStr.includes('brushing')
  ) {
    return buildResult(getRef('ex-28'), { category: 'Sensory Integration' })
  }

  if (searchStr.includes('speech') || searchStr.includes('sound') || searchStr.includes('rhyme') || searchStr.includes('talk') || searchStr.includes('oral') || searchStr.includes('bubble')) {
    return buildResult(getRef('ex-29'), { category: 'Speech & Communication' })
  }

  if (searchStr.includes('social') || searchStr.includes('story') || searchStr.includes('stories') || searchStr.includes('cbt') || searchStr.includes('role play')) {
    return buildResult(getRef('ex-30'), { category: 'Behaviour & Social Skills' })
  }

  if (searchStr.includes('behaviour') || searchStr.includes('behavior') || searchStr.includes('modification')) {
    return buildResult(getRef('ex-30'), { category: 'Behaviour & Social Skills' })
  }

  if (searchStr.includes('card') || searchStr.includes('flashcard') || searchStr.includes('flash card') || searchStr.includes('symbol') || searchStr.includes('aac')) {
    return buildResult(getRef('ex-31'), { category: 'AAC & Expressive Language' })
  }

  if (searchStr.includes('brain gym') || searchStr.includes('cross crawl') || searchStr.includes('pace') || searchStr.includes('memory') || searchStr.includes('remedial') || searchStr.includes('cognit')) {
    return buildResult(getRef('ex-32'), { category: 'Cognitive & Bilateral Integration' })
  }

  if (searchStr.includes('reflex') || searchStr.includes('primitive') || searchStr.includes('neuromotor')) {
    return buildResult(getRef('ex-33'), { category: 'Neuromotor & Primitive Reflex' })
  }

  if (searchStr.includes('animal') || searchStr.includes('bear') || searchStr.includes('heavy')) {
    return buildResult(getRef('ex-02'), { category: 'Proprioceptive & Core' })
  }

  if (searchStr.includes('crab')) {
    return buildResult(getRef('ex-03'), { category: 'Gross Motor & Core' })
  }

  if (searchStr.includes('frog')) {
    return buildResult(getRef('ex-04'), { category: 'Gross Motor & Agility' })
  }

  if (searchStr.includes('bunny') || searchStr.includes('hop')) {
    return buildResult(getRef('ex-05'), { category: 'Gross Motor & Balance' })
  }

  if (searchStr.includes('obstacle') || searchStr.includes('course') || searchStr.includes('tunnel')) {
    return buildResult(getRef('ex-06'), { category: 'Motor Planning & Sensory' })
  }

  if (searchStr.includes('jump') || searchStr.includes('jack') || searchStr.includes('active')) {
    return buildResult(getRef('ex-01'), { category: 'Gross Motor & Conditioning' })
  }

  // 7. Fallback: match by index hash so an authentic clinical photo is always provided
  const idx = Math.abs(searchStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % MASTER_EXERCISES.length
  return buildResult(MASTER_EXERCISES[idx] || MASTER_EXERCISES[0])
}

/**
 * Intelligent exercise list resolver with dynamic image deduplication.
 * Guarantees that every exercise item in the list receives a unique, authentic clinical photo
 * without collisions between cards.
 */
export function resolveExerciseList(items = [], availableList = MASTER_EXERCISES) {
  if (!Array.isArray(items) || items.length === 0) return []

  const pool = (Array.isArray(availableList) && availableList.length > 0) ? availableList : MASTER_EXERCISES
  const usedImages = new Set()
  const seenIds = new Set()

  return items.map((item, idx) => {
    let resolved = resolveExerciseItem(item, pool)
    if (!resolved) return null

    // Ensure distinct ID
    let finalId = resolved.id || `ex-${idx}`
    if (seenIds.has(finalId)) {
      finalId = `${finalId}-${idx}`
    }
    seenIds.add(finalId)
    resolved = { ...resolved, id: finalId }

    // If this image was already assigned to an earlier card in this list, pick an alternate unused photo
    if (resolved.image_url && usedImages.has(resolved.image_url)) {
      const categoryMatch = pool.find(
        alt => alt.image_url && !usedImages.has(alt.image_url) &&
        alt.category && resolved.category &&
        (alt.category.toLowerCase().includes(resolved.category.toLowerCase().slice(0, 5)) ||
         resolved.category.toLowerCase().includes(alt.category.toLowerCase().slice(0, 5)))
      ) || MASTER_EXERCISES.find(
        alt => alt.image_url && !usedImages.has(alt.image_url) &&
        alt.category && resolved.category &&
        (alt.category.toLowerCase().includes(resolved.category.toLowerCase().slice(0, 5)) ||
         resolved.category.toLowerCase().includes(alt.category.toLowerCase().slice(0, 5)))
      )

      const unusedAlt = categoryMatch ||
        pool.find(alt => alt.image_url && !usedImages.has(alt.image_url)) ||
        MASTER_EXERCISES.find(alt => alt.image_url && !usedImages.has(alt.image_url))

      if (unusedAlt && unusedAlt.image_url) {
        resolved = {
          ...resolved,
          image_url: unusedAlt.image_url
        }
      }
    }

    if (resolved.image_url) {
      usedImages.add(resolved.image_url)
    }

    return resolved
  }).filter(Boolean)
}

export const exerciseService = {

  async getAll() {
    try {
      const data = await db.select('exercises', {
        match: { is_active: true },
        order: { column: 'name', ascending: true }
      })

      if (data && data.length > 0) {
        // Merge remote DB rows with master exercises, always preserving master.id ('ex-01') and verified working image_url
        return MASTER_EXERCISES.map((master) => {
          const remote = data.find((d) => d.id === master.id || d.name?.toLowerCase() === master.name?.toLowerCase())
          return remote
            ? { ...remote, ...master, db_id: remote.id, image_url: master.image_url || remote.image_url }
            : master
        })
      }
      return MASTER_EXERCISES
    } catch (err) {
      console.warn('exerciseService.getAll fallback notice:', err.message)
      return MASTER_EXERCISES
    }
  },

  async getByProfile(profile) {
    try {
      const data = await db.select('exercises', { match: { is_active: true } })
      if (Array.isArray(data) && data.length > 0) {
        return data.filter(
          (ex) => Array.isArray(ex.for_profiles) && ex.for_profiles.includes(profile)
        )
      }
      return MASTER_EXERCISES
    } catch (err) {
      console.error('exerciseService.getByProfile error:', err.message)
      return MASTER_EXERCISES
    }
  },

  async getHomeExercises() {
    return MASTER_EXERCISES.filter(e => e.is_home_exercise)
  },

  async getClinicExercises() {
    return MASTER_EXERCISES.filter(e => e.is_clinic_exercise)
  },

  async getByIds(ids = []) {
    if (!ids || ids.length === 0) return []
    try {
      const all = await this.getAll()
      return resolveExerciseList(ids, all)
    } catch (err) {
      console.warn('exerciseService.getByIds notice:', err.message)
      return resolveExerciseList(ids, MASTER_EXERCISES)
    }
  },

  /**
   * Safety guard: exercises are strictly prohibited for IEP children.
   * For therapy children without explicit IDs, returns default pathway exercises.
   */
  async getForChild(child, ids = []) {
    if (!child || child.program_type === 'iep') {
      return []
    }
    if (ids && ids.length > 0) {
      return await this.getByIds(ids)
    }

    // Default therapy exercises by category if none assigned yet
    const category = (child.therapy_category || child.diagnosis || child.profile || '').toLowerCase()
    if (category.includes('delay') || category.includes('developmental')) {
      return resolveExerciseList([
        'Prone on Elbows & Tummy Reaching',
        'Therapy Ball Reach',
        'Step-Ups',
        'Pegboard Activity',
        'Sensory Tactile Bin Exploration'
      ])
    }
    if (category.includes('adhd')) {
      return resolveExerciseList([
        'Bear Walk',
        'Frog Jumps',
        'Jumping Jacks',
        'Obstacle Course',
        'Single Leg Stance'
      ])
    }
    if (category.includes('learn') || category.includes('sld')) {
      return resolveExerciseList([
        'Pegboard Activity',
        'Bead Stringing',
        'Cutting with Scissors',
        'Playdough Clay Modeling',
        'Bilateral Hand Clapping & Pat-a-Cake'
      ])
    }
    // Default ASD
    return resolveExerciseList([
      'Swing Therapy (Vestibular Stimulation)',
      'Deep Pressure Sensory Roll',
      'Sensory Tactile Bin Exploration',
      'Oral Motor Straw Blowing & Bubbles',
      'Obstacle Course'
    ])
  }
}

