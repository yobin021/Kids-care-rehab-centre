/**
 * Master Clinical Exercise Library — Kids Care Rehab Centre
 * Complete 32 Physiotherapy, Occupational Therapy, Sensory & Cognitive Exercises
 * Derived from the clinical exercise manual.
 */

export const MASTER_EXERCISES = [
  {
    id: "ex-01",
    name: "Jumping Jacks",
    category: "Gross Motor & Conditioning",
    category_color: "#185FA5",
    description: "The child stands with feet together and arms by the sides. They jump while spreading their legs apart and raising their arms overhead, then return to the starting position.",
    home_description: "Jump with legs apart and arms overhead, then jump back together.",
    benefits: [
      "Improves cardiovascular endurance",
      "Enhances bilateral coordination",
      "Increases lower limb strength",
      "Improves balance and body awareness",
      "Promotes motor planning skills"
    ],
    duration: "5–10 mins",
    frequency: "Daily (2 sets of 10–15 reps)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "1_jumping_jacks.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX001.jpg"
  },
  {
    id: "ex-02",
    name: "Bear Walk",
    category: "Gross Motor & Core",
    category_color: "#0F6E56",
    description: "The child walks on hands and feet with hips raised and knees off the floor.",
    home_description: "Walk forward on hands and feet with hips up and knees off the floor.",
    benefits: [
      "Strengthens shoulder muscles",
      "Improves core stability",
      "Enhances coordination",
      "Develops weight-bearing through the upper limbs",
      "Increases postural control"
    ],
    duration: "5 mins",
    frequency: "Daily (3–4 laps across room)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "2_bear_walk.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX002.jpg"
  },
  {
    id: "ex-03",
    name: "Crab Walk",
    category: "Gross Motor & Core",
    category_color: "#0F6E56",
    description: "The child moves forward or backward while supporting the body with hands and feet facing upward.",
    home_description: "Sit on the floor, lift hips with hands and feet on the ground, and walk like a crab.",
    benefits: [
      "Strengthens arms and shoulders",
      "Improves trunk stability",
      "Enhances balance",
      "Develops motor planning",
      "Increases body awareness"
    ],
    duration: "5 mins",
    frequency: "Daily (2–3 laps across room)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "3_crab_walk.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX003.jpg"
  },
  {
    id: "ex-04",
    name: "Frog Jumps",
    category: "Gross Motor & Agility",
    category_color: "#185FA5",
    description: "The child squats and jumps forward like a frog.",
    home_description: "Deep squat with hands touching the floor, then jump forward like a leaping frog.",
    benefits: [
      "Strengthens leg muscles",
      "Improves balance",
      "Enhances coordination",
      "Develops power and agility",
      "Promotes gross motor development"
    ],
    duration: "5 mins",
    frequency: "Daily (10 jumps)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "4_frog_jumps.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX004.jpg"
  },
  {
    id: "ex-05",
    name: "Bunny Hops",
    category: "Gross Motor & Balance",
    category_color: "#185FA5",
    description: "The child hops forward with both feet together.",
    home_description: "Keep feet glued together, bend knees slightly, and hop forward smoothly.",
    benefits: [
      "Improves bilateral coordination",
      "Strengthens lower limbs",
      "Enhances balance",
      "Develops rhythm and timing",
      "Improves motor control"
    ],
    duration: "5 mins",
    frequency: "Daily (10–15 hops)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "5_bunny_hops.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX005.jpg"
  },
  {
    id: "ex-06",
    name: "Obstacle Course",
    category: "Motor Planning & Sensory",
    category_color: "#854F0B",
    description: "The child completes activities such as crawling, jumping, balancing, and stepping over objects.",
    home_description: "Step over cushions, crawl under tables, walk along lines, and jump onto targets.",
    benefits: [
      "Improves motor planning",
      "Enhances coordination",
      "Develops balance skills",
      "Increases confidence",
      "Promotes problem-solving abilities"
    ],
    duration: "10–15 mins",
    frequency: "3–4 times/week",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "6_obstacle_course.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX006.jpg"
  },
  {
    id: "ex-07",
    name: "Throwing and Catching Ball",
    category: "Visual-Motor & Social",
    category_color: "#534AB7",
    description: "The child throws a ball to a partner and catches it when returned.",
    home_description: "Toss a medium-sized soft ball back and forth with parent or sibling.",
    benefits: [
      "Improves hand-eye coordination",
      "Enhances reaction time",
      "Develops upper limb control",
      "Improves concentration",
      "Encourages social interaction"
    ],
    duration: "10 mins",
    frequency: "Daily (15–20 catches)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "7_throwing_catching_ball.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX007.jpg"
  },
  {
    id: "ex-08",
    name: "Kicking Ball",
    category: "Gross Motor & Balance",
    category_color: "#185FA5",
    description: "The child kicks a ball toward a target or partner.",
    home_description: "Kick a stationary or slowly rolling ball toward a goal or wall target.",
    benefits: [
      "Strengthens leg muscles",
      "Improves dynamic balance",
      "Enhances coordination",
      "Develops timing and accuracy",
      "Improves motor planning"
    ],
    duration: "10 mins",
    frequency: "Daily (10 kicks with each leg)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "8_kicking_ball.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX008.jpg"
  },
  {
    id: "ex-09",
    name: "Standing on One Leg",
    category: "Vestibular & Balance",
    category_color: "#0F6E56",
    description: "The child balances on one foot while maintaining an upright posture.",
    home_description: "Stand tall like a flamingo on one foot for 10 seconds, then switch legs.",
    benefits: [
      "Improves static balance",
      "Enhances postural control",
      "Strengthens lower limb muscles",
      "Improves concentration",
      "Develops body awareness"
    ],
    duration: "5 mins",
    frequency: "Daily (3 repetitions each leg)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "9_standing_on_one_leg.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX009.jpg"
  },
  {
    id: "ex-10",
    name: "Walking on a Line",
    category: "Coordination & Balance",
    category_color: "#0F6E56",
    description: "The child walks heel-to-toe along a straight line.",
    home_description: "Walk heel-to-toe along tape on the floor without stepping off.",
    benefits: [
      "Improves balance",
      "Enhances coordination",
      "Develops body awareness",
      "Improves gait control",
      "Increases attention and focus"
    ],
    duration: "5 mins",
    frequency: "Daily (3–4 walks along 3-meter line)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "10_walking_on_line.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX010.jpg"
  },
  {
    id: "ex-11",
    name: "Bridging",
    category: "Core & Pelvic Stability",
    category_color: "#0F6E56",
    description: "The child lies on their back with knees bent and lifts the hips upward.",
    home_description: "Lie on back with knees bent, feet flat, lift hips high and hold for 5 seconds.",
    benefits: [
      "Strengthens gluteal muscles",
      "Improves core stability",
      "Enhances pelvic control",
      "Supports proper posture",
      "Improves lower body strength"
    ],
    duration: "5 mins",
    frequency: "Daily (2 sets of 10 lifts)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "11_bridging.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX011.jpg"
  },
  {
    id: "ex-12",
    name: "Plank Hold",
    category: "Core & Shoulder Stability",
    category_color: "#0F6E56",
    description: "The child supports the body on forearms and toes while maintaining a straight posture.",
    home_description: "Hold body straight like a wooden plank resting on forearms and toes.",
    benefits: [
      "Strengthens core muscles",
      "Improves shoulder stability",
      "Enhances endurance",
      "Supports postural control",
      "Improves overall body strength"
    ],
    duration: "5 mins",
    frequency: "Daily (3 holds of 10–20 seconds)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "12_plank_hold.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX012.jpg"
  },
  {
    id: "ex-13",
    name: "Superman Exercise",
    category: "Extensor Strengthening",
    category_color: "#185FA5",
    description: "The child lies prone and lifts both arms and legs off the floor.",
    home_description: "Lie on tummy and fly like Superman with arms and legs lifted off the floor.",
    benefits: [
      "Strengthens back muscles",
      "Improves posture",
      "Enhances trunk stability",
      "Develops body awareness",
      "Supports spinal alignment"
    ],
    duration: "5 mins",
    frequency: "Daily (5–10 holds of 5 seconds)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "13_superman_exercise.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX013.jpg"
  },
  {
    id: "ex-14",
    name: "Wheelbarrow Walking",
    category: "Upper Limb & Core",
    category_color: "#0F6E56",
    description: "An adult holds the child's legs while the child walks on their hands.",
    home_description: "Parent holds child's thighs or ankles while child walks forward on hands.",
    benefits: [
      "Strengthens shoulders and arms",
      "Improves core strength",
      "Enhances coordination",
      "Develops upper body endurance",
      "Improves motor planning"
    ],
    duration: "5 mins",
    frequency: "Daily (2–3 short walks across room)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "14_wheelbarrow_walking.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX014.jpg"
  },
  {
    id: "ex-15",
    name: "Therapy Ball Rocking",
    category: "Vestibular & Core",
    category_color: "#854F0B",
    description: "The child sits or lies on a therapy ball while gently rocking in different directions.",
    home_description: "Sit or lie over a large gym ball while gently rocking forward, back, and side to side.",
    benefits: [
      "Improves balance reactions",
      "Enhances postural control",
      "Develops core stability",
      "Provides vestibular stimulation",
      "Improves body awareness"
    ],
    duration: "10 mins",
    frequency: "Daily (gentle 5–10 min rhythm)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "15_therapy_ball_rocking.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX015.jpg"
  },
  {
    id: "ex-16",
    name: "Pegboard Activity",
    category: "Fine Motor & Visual-Motor",
    category_color: "#534AB7",
    description: "The child places pegs into corresponding holes on a pegboard.",
    home_description: "Pick up pegs with thumb and index finger (pincer grasp) and push into board holes.",
    benefits: [
      "Improves fine motor skills",
      "Enhances finger strength",
      "Develops hand-eye coordination",
      "Improves concentration",
      "Promotes visual-motor integration"
    ],
    duration: "10 mins",
    frequency: "Daily (complete 1 full pattern board)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "16_pegboard_activity.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX016.jpg"
  },
  {
    id: "ex-17",
    name: "Bead Stringing",
    category: "Fine Motor & Bilateral",
    category_color: "#534AB7",
    description: "The child threads beads onto a string.",
    home_description: "Hold thread steady in one hand and thread colourful beads using the other hand.",
    benefits: [
      "Improves finger dexterity",
      "Enhances bilateral coordination",
      "Develops hand-eye coordination",
      "Improves attention span",
      "Strengthens grasping skills"
    ],
    duration: "10 mins",
    frequency: "Daily (string 10–15 beads)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "17_bead_stringing.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX017.jpg"
  },
  {
    id: "ex-18",
    name: "Puzzle Activity",
    category: "Visual Perception & Cognitive",
    category_color: "#534AB7",
    description: "The child fits puzzle pieces into the correct spaces.",
    home_description: "Solve wooden inset or interlocking jigsaw puzzle pieces independently.",
    benefits: [
      "Improves problem-solving skills",
      "Enhances visual perception",
      "Develops fine motor skills",
      "Improves concentration",
      "Encourages logical thinking"
    ],
    duration: "10–15 mins",
    frequency: "Daily (1–2 puzzles)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "18_puzzle_activity.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX018.jpg"
  },
  {
    id: "ex-19",
    name: "Buttoning and Zipping",
    category: "ADL & Independence",
    category_color: "#534AB7",
    description: "The child practices fastening buttons and zippers independently.",
    home_description: "Practice buttoning big and small buttons on a shirt and pulling zippers smoothly.",
    benefits: [
      "Improves finger dexterity",
      "Enhances hand coordination",
      "Promotes independence in daily living",
      "Strengthens fine motor control",
      "Improves attention to detail"
    ],
    duration: "10 mins",
    frequency: "Daily during dressing routines",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "19_buttoning_zipping.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX019.jpg"
  },
  {
    id: "ex-20",
    name: "Shape Sorting",
    category: "Cognitive & Fine Motor",
    category_color: "#534AB7",
    description: "The child matches shapes and places them into corresponding slots.",
    home_description: "Identify circle, square, triangle and push through matching bucket openings.",
    benefits: [
      "Improves cognitive skills",
      "Enhances visual discrimination",
      "Develops hand-eye coordination",
      "Improves problem-solving abilities",
      "Encourages shape and color recognition"
    ],
    duration: "10 mins",
    frequency: "Daily (2 rounds of sorting)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "20_shape_sorting.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX020.jpg"
  },
  {
    id: "ex-21",
    name: "Swing Therapy (Pediatric Swing)",
    category: "Vestibular & Sensory Integration",
    category_color: "#854F0B",
    description: "Swing therapy is a sensory integration activity where children sit, lie, or stand on a swing to improve balance, body awareness, coordination, and sensory processing. Different types of swings provide vestibular stimulation that helps children regulate their movements and attention.",
    home_description: "Gentle linear swinging in park swing or hammock for calming vestibular input.",
    benefits: [
      "Improves balance and postural control",
      "Enhances body awareness (proprioception)",
      "Increases attention and concentration",
      "Develops motor planning and coordination",
      "Helps regulate sensory processing and behaviour"
    ],
    duration: "15 mins",
    frequency: "2–3 times/week",
    is_home_exercise: false,
    is_clinic_exercise: true,
    storage_file_name: "21_swing_therapy.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX021.jpg"
  },
  {
    id: "ex-22",
    name: "Vibrator Therapy (Vibration Therapy)",
    category: "Proprioceptive & Tactile",
    category_color: "#854F0B",
    description: "Vibration therapy uses a handheld vibrator or vibrating device to provide sensory stimulation to muscles and joints. It helps improve muscle activation, body awareness, and sensory responses in children with developmental delays or neurological conditions.",
    home_description: "Targeted vibration input on limbs to reduce stiffness or alert low-tone muscles under guidance.",
    benefits: [
      "Improves sensory awareness",
      "Stimulates muscle activation",
      "Reduces muscle tightness and stiffness",
      "Enhances proprioceptive input",
      "Promotes relaxation and calming effects"
    ],
    duration: "10 mins",
    frequency: "As prescribed by therapist",
    is_home_exercise: false,
    is_clinic_exercise: true,
    storage_file_name: "22_vibrator_therapy.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX022.jpg"
  },
  {
    id: "ex-23",
    name: "Treadmill Training",
    category: "Gait & Endurance",
    category_color: "#185FA5",
    description: "Treadmill training is a gait-training exercise where children walk on a treadmill under supervision. It is commonly used to improve walking ability, endurance, balance, and lower-limb strength in children with developmental or neurological disorders.",
    home_description: "Supervised gentle treadmill or steady walking in hallway.",
    benefits: [
      "Improves walking pattern and gait",
      "Increases lower limb strength",
      "Enhances balance and coordination",
      "Builds endurance and cardiovascular fitness",
      "Promotes independent mobility"
    ],
    duration: "10–15 mins",
    frequency: "2–3 times/week",
    is_home_exercise: false,
    is_clinic_exercise: true,
    storage_file_name: "23_treadmill_training.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX023.jpg"
  },
  {
    id: "ex-24",
    name: "Wedge Exercises",
    category: "Postural Control & Alignment",
    category_color: "#0F6E56",
    description: "Wedge exercises use an inclined foam wedge to improve posture, balance, trunk control, weight shifting, and muscle activation. Children perform activities such as prone lying, crawling, kneeling, and reaching while positioned on the wedge.",
    home_description: "Lie tummy-down on an inclined pillow/wedge to play with toys and lift head.",
    benefits: [
      "Improves trunk and neck control",
      "Enhances balance and postural stability",
      "Strengthens shoulder and upper limb muscles",
      "Promotes weight shifting and body awareness",
      "Develops gross motor skills and coordination"
    ],
    duration: "10 mins",
    frequency: "Daily (2 sessions of 5–10 mins)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "24_wedge_exercises.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX024.jpg"
  },
  {
    id: "ex-25",
    name: "Standing Frame Activities",
    category: "Weight Bearing & Posture",
    category_color: "#185FA5",
    description: "Standing frame activities help children maintain an upright standing posture safely while performing functional tasks such as reaching, playing, drawing, or throwing a ball.",
    home_description: "Upright standing with trunk and leg support while engaging in table activities.",
    benefits: [
      "Promotes proper weight bearing through the legs",
      "Improves posture and spinal alignment",
      "Increases bone density and joint health",
      "Enhances circulation and respiratory function",
      "Encourages hand function during standing activities"
    ],
    duration: "15–30 mins",
    frequency: "Daily as recommended",
    is_home_exercise: false,
    is_clinic_exercise: true,
    storage_file_name: "25_standing_frame_activities.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX025.jpg"
  },
  {
    id: "ex-26",
    name: "Stretching Exercises",
    category: "Flexibility & Joint Mobility",
    category_color: "#0F6E56",
    description: "Stretching exercises gently lengthen tight muscles and soft tissues to improve flexibility and maintain joint mobility.",
    home_description: "Gentle calf, hamstring, and heel cord stretches held for 20–30 seconds.",
    benefits: [
      "Prevents muscle tightness and contractures",
      "Improves flexibility and range of motion",
      "Reduces muscle stiffness",
      "Promotes better posture",
      "Improves functional movement"
    ],
    duration: "10 mins",
    frequency: "Daily (morning and evening)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "26_stretching_exercises.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX026.jpg"
  },
  {
    id: "ex-27",
    name: "Theraband Exercises",
    category: "Resistance & Strengthening",
    category_color: "#185FA5",
    description: "Strengthening exercises improve muscle power using body weight, resistance bands, or therapeutic equipment to support daily activities.",
    home_description: "Gentle elastic band pulls with arms and leg kicks against band resistance.",
    benefits: [
      "Increases muscle strength",
      "Improves endurance",
      "Enhances joint stability",
      "Supports functional mobility",
      "Promotes independence in daily activities"
    ],
    duration: "10 mins",
    frequency: "3 times/week (2 sets of 10 reps)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "27_theraband_exercises.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX027.jpg"
  },
  {
    id: "ex-28",
    name: "Sensory Integration Activities",
    category: "Sensory Processing & Regulation",
    category_color: "#854F0B",
    description: "Sensory integration activities provide controlled sensory input through movement, touch, balance, and proprioception to improve sensory processing.",
    home_description: "Tactile play with clay, sensory bins, brushing, and deep pressure squeezes.",
    benefits: [
      "Improves sensory processing",
      "Enhances attention and concentration",
      "Develops balance and coordination",
      "Increases body awareness",
      "Promotes emotional regulation"
    ],
    duration: "15 mins",
    frequency: "Daily (calm-down routine)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "28_sensory_integration.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX028.jpg"
  },
  {
    id: "ex-29",
    name: "Speech Therapy Exercises",
    category: "Oral Motor & Communication",
    category_color: "#3C3489",
    description: "Speech therapy exercises improve speech production, language development, oral motor control, and communication skills through structured activities.",
    home_description: "Blowing bubbles, tongue-lip movement games, and repetitive vocal sound practice.",
    benefits: [
      "Improves speech clarity",
      "Enhances communication skills",
      "Strengthens oral muscles",
      "Develops language and vocabulary",
      "Increases social interaction"
    ],
    duration: "10–15 mins",
    frequency: "Daily (2 sessions of 10 mins)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "29_speech_therapy_exercises.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX029.jpg"
  },
  {
    id: "ex-30",
    name: "Behaviour Cards",
    category: "Behavioral & Social Learning",
    category_color: "#3C3489",
    description: "Behaviour cards are visual aids that teach children appropriate behaviors, social rules, emotions, and expected responses in different situations. They are commonly used for children with autism, ADHD, developmental delays, and behavioral challenges.",
    home_description: "Review feeling and behavior flashcards before transitions and social outings.",
    benefits: [
      "Improves understanding of appropriate behavior",
      "Enhances social and emotional skills",
      "Encourages positive behavior and self-control",
      "Reduces challenging behaviors through visual learning",
      "Increases independence in daily routines"
    ],
    duration: "10 mins",
    frequency: "Daily before bedtime or morning routine",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "30_behaviour_cards.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX030.jpg"
  },
  {
    id: "ex-31",
    name: "Communication Cards",
    category: "AAC & Expressive Language",
    category_color: "#3C3489",
    description: "Communication cards are picture-based or symbol-based cards that help children express their needs, wants, feelings, and choices. They are useful for children with speech and language difficulties or limited verbal communication.",
    home_description: "Encourage child to point to picture cards for water, food, toilet, and play choices.",
    benefits: [
      "Improves communication skills",
      "Reduces frustration caused by communication difficulties",
      "Encourages expressive and receptive language development",
      "Promotes independence in expressing needs",
      "Enhances social interaction and participation"
    ],
    duration: "Integrated into daily routines",
    frequency: "All day throughout meals and activities",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "30_communication_cards.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX031.jpg"
  },
  {
    id: "ex-32",
    name: "Brain Gym Exercises",
    category: "Cognitive & Bilateral Integration",
    category_color: "#854F0B",
    description: "Brain Gym exercises are simple body movements designed to support coordination, attention, learning readiness, and the integration of movement with cognitive tasks. These exercises are often used as part of educational or therapeutic activities.",
    home_description: "Perform PACE routine: Sip water, massage Brain Buttons, do Cross Crawl marches, and Hook-ups for calm focus.",
    benefits: [
      "Improves concentration and attention",
      "Enhances coordination and balance",
      "Supports motor planning and body awareness",
      "Promotes relaxation and readiness for learning",
      "Encourages bilateral coordination and movement control"
    ],
    duration: "10 mins",
    frequency: "Daily before study or seated therapy tasks",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "31_brain_gym_exercises.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX032.jpg"
  },
  {
    id: "ex-33",
    name: "Reflex Integration Exercises",
    category: "Neuromotor & Primitive Reflex",
    category_color: "#0F6E56",
    description: "Reflex integration exercises are structured movement activities intended to address the persistence of primitive reflex patterns and support the development of more mature movement patterns. These exercises should be selected and supervised by trained professionals as part of a comprehensive assessment and intervention plan.",
    home_description: "Rhythmical movements (snow angels, lizard crawl, star cross) under clinical therapist advice.",
    benefits: [
      "Supports postural control and balance",
      "Improves coordination and motor planning",
      "Enhances body awareness and movement quality",
      "May help improve attention during functional activities",
      "Promotes smoother performance of age-appropriate motor skills"
    ],
    duration: "10 mins",
    frequency: "Daily (supervised 10-minute session)",
    is_home_exercise: true,
    is_clinic_exercise: true,
    storage_file_name: "32_reflex_integration.jpg",
    image_url: "https://midkfahpqowiwkajxeiz.supabase.co/storage/v1/object/public/exercise-images/EX033.jpg"
  }
];
