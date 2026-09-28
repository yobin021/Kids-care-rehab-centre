"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  FileText,
  Activity,
  RotateCcw,
  Info,
  ChevronRight,
  TrendingUp,
  Calendar,
  AlertCircle
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { calculateDomainScores, classifyProfile, selectExercises } from "../utils/scoringEngine";
import { therapyAssessmentService } from "../services/therapyAssessmentService";
import { childrenService } from "../services/childrenService";
import { printReportWithFilename } from "../utils/printHelpers";

export const DEVELOPMENTAL_AGE_TIERS = [
  {
    id: "1-3m",
    title: "1 to 3 Months",
    minAgeMonths: 1,
    maxAgeMonths: 3,
    sections: [
      {
        category: "Movement",
        items: [
          { id: "1_3_m1", text: "Raises head and cheek when lying on stomach (3 mos.)" },
          { id: "1_3_m2", text: "Supports upper body with arms when lying on stomach (3 mos.)" },
          { id: "1_3_m3", text: "Stretches legs out when lying on stomach or back (2-3 mos.)" },
          { id: "1_3_m4", text: "Opens and shuts hands (2-3 mos.)" },
          { id: "1_3_m5", text: "Pushes down on his legs when his feet are placed on firm surface (3 mos.)" }
        ]
      },
      {
        category: "Visual",
        items: [
          { id: "1_3_v1", text: "Watches face intently (2-3 mos.)" },
          { id: "1_3_v2", text: "Follows moving objects (2 mos.)" },
          { id: "1_3_v3", text: "Recognizes familiar objects and people at a distance (3 mos.)" },
          { id: "1_3_v4", text: "Starts using hands and eyes in coordination (3 mos.)" }
        ]
      },
      {
        category: "Hearing and Speech",
        items: [
          { id: "1_3_h1", text: "Smiles at the sound of voice (2-3 mos.)" },
          { id: "1_3_h2", text: "Cooing noises; vocal play (begins at 3 mos.)" },
          { id: "1_3_h3", text: "Attends to sound (1-3 mos.)" },
          { id: "1_3_h4", text: "Startles to loud noise (1-3 mos.)" }
        ]
      },
      {
        category: "Social / Emotional",
        items: [
          { id: "1_3_s1", text: "Begins to develop a social smile (1-3 mos.)" },
          { id: "1_3_s2", text: "Enjoys playing with other people and may cry when playing stops (2-3 mos.)" },
          { id: "1_3_s3", text: "Becomes more communicative and expressive with face and body (2-3 mos.)" },
          { id: "1_3_s4", text: "Imitates some movements and facial expressions" }
        ]
      }
    ],
    redFlags: [
      { id: "1_3_rf1", text: "Doesn't seem to respond to loud noises" },
      { id: "1_3_rf2", text: "Doesn't follow moving objects with eyes by 2 to 3 months" },
      { id: "1_3_rf3", text: "Doesn't smile at the sound of your voice by 2 months" },
      { id: "1_3_rf4", text: "Doesn't grasp and hold objects by 3 months" },
      { id: "1_3_rf5", text: "Doesn't smile at people by 3 months" },
      { id: "1_3_rf6", text: "Cannot support head well at 3 months" },
      { id: "1_3_rf7", text: "Doesn't reach for and grasp toys by 3 to 4 months" },
      { id: "1_3_rf8", text: "Doesn't bring objects to mouth by 4 months" },
      { id: "1_3_rf9", text: "Doesn't push down with legs when feet are placed on a firm surface by 4 months" },
      { id: "1_3_rf10", text: "Has trouble moving one or both eyes in all directions" },
      { id: "1_3_rf11", text: "Crosses eyes most of the time (occasional crossing of the eyes is normal in these first months)" }
    ]
  },
  {
    id: "4-7m",
    title: "4 to 7 Months",
    minAgeMonths: 4,
    maxAgeMonths: 7,
    sections: [
      {
        category: "Movement",
        items: [
          { id: "4_7_m1", text: "Pushes up on extended arms (5 mos.)" },
          { id: "4_7_m2", text: "Pulls to sitting with no head lag (5 mos.)" },
          { id: "4_7_m3", text: "Sits with support of his hands (5-6 mos.)" },
          { id: "4_7_m4", text: "Sits unsupported for short periods (6-8 mos.)" },
          { id: "4_7_m5", text: "Supports whole weight on legs (6-7 mos.)" },
          { id: "4_7_m6", text: "Grasps feet (6 mos.)" },
          { id: "4_7_m7", text: "Transfers objects from hand to hand (6-7 mos.)" },
          { id: "4_7_m8", text: "Uses raking grasp (not pincer) (6 mos.)" }
        ]
      },
      {
        category: "Visual",
        items: [
          { id: "4_7_v1", text: "Looks for toy beyond tracking range (5-6 mos.)" },
          { id: "4_7_v2", text: "Tracks moving objects with ease (4-7 mos.)" },
          { id: "4_7_v3", text: "Grasps objects dangling in front of him (5-6 mos.)" },
          { id: "4_7_v4", text: "Looks for fallen toys (5-7 mos.)" }
        ]
      },
      {
        category: "Language",
        items: [
          { id: "4_7_l1", text: "Distinguishes emotions by tone of voice (4-7 mos.)" },
          { id: "4_7_l2", text: "Responds to sound by making sounds (4-6 mos.)" },
          { id: "4_7_l3", text: "Uses voice to express joy and displeasure (4-6 mos.)" },
          { id: "4_7_l4", text: "Syllable repetition begins (5-7 mos.)" }
        ]
      },
      {
        category: "Cognitive",
        items: [
          { id: "4_7_c1", text: "Finds partially hidden objects (6-7 mos.)" },
          { id: "4_7_c2", text: "Explores with hands and mouth (4-7 mos.)" },
          { id: "4_7_c3", text: "Struggles to get objects that are out of reach (5-7 mos.)" }
        ]
      },
      {
        category: "Social Emotional",
        items: [
          { id: "4_7_s1", text: "Enjoys social play (4-7 mos.)" },
          { id: "4_7_s2", text: "Interested in mirror images (5-7 mos.)" },
          { id: "4_7_s3", text: "Responds to other people's expression of emotion (4-7 mos.)" }
        ]
      }
    ],
    redFlags: [
      { id: "4_7_rf1", text: "Seems very stiff, tight muscles" },
      { id: "4_7_rf2", text: "Seems very floppy, like a rag doll" },
      { id: "4_7_rf3", text: "Head still flops back when body is pulled to sitting position (by 5 months still exhibits head lag)" },
      { id: "4_7_rf4", text: "Shows no affection for the person who cares for them" },
      { id: "4_7_rf5", text: "Doesn't seem to enjoy being around people" },
      { id: "4_7_rf6", text: "One or both eyes consistently turn in or out" },
      { id: "4_7_rf7", text: "Persistent tearing, eye drainage, or sensitivity to light" },
      { id: "4_7_rf8", text: "Does not respond to sounds around them" },
      { id: "4_7_rf9", text: "Has difficulty getting objects to mouth" },
      { id: "4_7_rf10", text: "Does not turn head to locate sounds by 4 months" },
      { id: "4_7_rf11", text: "Doesn't roll over (stomach to back) by 6 months" },
      { id: "4_7_rf12", text: "Cannot sit with help by 6 months (not by themselves)" },
      { id: "4_7_rf13", text: "Does not laugh or make squealing sounds by 5 months" },
      { id: "4_7_rf14", text: "Does not actively reach for objects by 6 months" },
      { id: "4_7_rf15", text: "Does not follow objects with both eyes" },
      { id: "4_7_rf16", text: "Does not bear some weight on legs by 5 months" }
    ]
  },
  {
    id: "8-12m",
    title: "8 to 12 Months",
    minAgeMonths: 8,
    maxAgeMonths: 12,
    sections: [
      {
        category: "Movement",
        items: [
          { id: "8_12_m1", text: "Gets to sitting position without assistance (8-10 mos.)" },
          { id: "8_12_m2", text: "Crawls forward on belly" },
          { id: "8_12_m3", text: "Assumes hand and knee position" },
          { id: "8_12_m4", text: "Creeps on hands and knees" },
          { id: "8_12_m5", text: "Gets from sitting to crawling or prone (lying on stomach) position (10-12 mos.)" },
          { id: "8_12_m6", text: "Pulls self up to standing position" },
          { id: "8_12_m7", text: "Walks holding on to furniture" },
          { id: "8_12_m8", text: "Stands momentarily without support" },
          { id: "8_12_m9", text: "May walk two or three steps without support" }
        ]
      },
      {
        category: "Hand and Finger Skills",
        items: [
          { id: "8_12_h1", text: "Uses pincer grasp (grasp using thumb and index finger) (7-10 mos.)" },
          { id: "8_12_h2", text: "Bangs two one-inch cubes together" },
          { id: "8_12_h3", text: "Puts objects into container (10-12 mos.)" },
          { id: "8_12_h4", text: "Takes objects out of container (10-12 mos.)" },
          { id: "8_12_h5", text: "Pokes with index finger" },
          { id: "8_12_h6", text: "Tries to imitate scribbling" }
        ]
      },
      {
        category: "Cognitive",
        items: [
          { id: "8_12_c1", text: "Explores objects in many different ways (shaking, banging, throwing, dropping) (8-10 mos.)" },
          { id: "8_12_c2", text: "Finds hidden objects easily (10-12 mos.)" },
          { id: "8_12_c3", text: "Looks at correct picture when image is named" },
          { id: "8_12_c4", text: "Imitates gestures (9-12 mos.)" }
        ]
      },
      {
        category: "Language Milestones",
        items: [
          { id: "8_12_l1", text: "Responds to simple verbal requests" },
          { id: "8_12_l2", text: "Responds to \"no\"" },
          { id: "8_12_l3", text: "Makes simple gestures such as shaking head for no" },
          { id: "8_12_l4", text: "Babbles with inflection (8-10 mos.)" },
          { id: "8_12_l5", text: "Babbles \"dada\" and \"mama\" (8-10 mos.)" },
          { id: "8_12_l6", text: "Says \"dada\" and \"mama\" for specific person (11-12 mos.)" },
          { id: "8_12_l7", text: "Uses exclamations such as \"oh-oh\"" }
        ]
      },
      {
        category: "Social / Emotional",
        items: [
          { id: "8_12_s1", text: "Shy or anxious with strangers (8-12 mos.)" },
          { id: "8_12_s2", text: "Cries when mother or father leaves (8-12 mos.)" },
          { id: "8_12_s3", text: "Enjoys imitating people in his play (10-12 mos.)" },
          { id: "8_12_s4", text: "Shows specific preferences for certain people and toys (8-12 mos.)" },
          { id: "8_12_s5", text: "Prefers mother and/or regular care provider over all others (8-12 mos.)" },
          { id: "8_12_s6", text: "Repeats sounds or gestures for attention (10-12 mos.)" },
          { id: "8_12_s7", text: "Finger-feeds himself (8-12 mos.)" },
          { id: "8_12_s8", text: "Extends arm or leg to help when being dressed" }
        ]
      }
    ],
    redFlags: [
      { id: "8_12_rf1", text: "Does not crawl" },
      { id: "8_12_rf2", text: "Drags one side of body while crawling (for over one month)" },
      { id: "8_12_rf3", text: "Cannot stand when supported" },
      { id: "8_12_rf4", text: "Does not search for objects that are hidden (10-12 mos.)" },
      { id: "8_12_rf5", text: "Says no single words (\"mama\" or \"dada\")" },
      { id: "8_12_rf6", text: "Does not learn to use gestures such as waving or shaking head" },
      { id: "8_12_rf7", text: "Does not sit steadily by 10 months" },
      { id: "8_12_rf8", text: "Does not show interest in \"peek-a-boo\" or \"patty cake\" by 8 mos." },
      { id: "8_12_rf9", text: "Does not babble by 8 mos. (\"dada,\" \"baba,\" \"mama\")" }
    ]
  },
  {
    id: "12-24m",
    title: "12 to 24 Months",
    minAgeMonths: 12,
    maxAgeMonths: 24,
    sections: [
      {
        category: "Movement",
        items: [
          { id: "12_24_m1", text: "Walks alone (12-16 mos.)" },
          { id: "12_24_m2", text: "Pulls toys behind him while walking (13-16 mos.)" },
          { id: "12_24_m3", text: "Carries large toy or several toys while walking (12-15 mos.)" },
          { id: "12_24_m4", text: "Begins to run stiffly (16-18 mos.)" },
          { id: "12_24_m5", text: "Walks into ball (18-24 mos.)" },
          { id: "12_24_m6", text: "Climbs onto and down from furniture unsupported (16-24 mos.)" },
          { id: "12_24_m7", text: "Walks up and down stairs holding on to support (18-24 mos.)" }
        ]
      },
      {
        category: "Hand and Finger Skills",
        items: [
          { id: "12_24_h1", text: "Scribbles spontaneously (14-16 mos.)" },
          { id: "12_24_h2", text: "Turns over container to pour out contents (12-18 mos.)" },
          { id: "12_24_h3", text: "Builds tower of four blocks or more (20-24 mos.)" }
        ]
      },
      {
        category: "Language",
        items: [
          { id: "12_24_l1", text: "Points to object or picture when it's named for them (18-24 mos.)" },
          { id: "12_24_l2", text: "Recognizes names of familiar people, objects, and body parts (18-24 mos.)" },
          { id: "12_24_l3", text: "Says several single words (15-18 mos.)" },
          { id: "12_24_l4", text: "Uses two-word sentences (18-24 mos.)" },
          { id: "12_24_l5", text: "Follows simple, one-step instructions (14-18 mos.)" },
          { id: "12_24_l6", text: "Repeats words overheard in conversations (16-18 mos.)" }
        ]
      },
      {
        category: "Cognitive",
        items: [
          { id: "12_24_c1", text: "Finds objects even when hidden under 2 or 3 covers" },
          { id: "12_24_c2", text: "Begins to sort shapes and colors (20-24 mos.)" },
          { id: "12_24_c3", text: "Begins make-believe play (20-24 mos.)" }
        ]
      },
      {
        category: "Social",
        items: [
          { id: "12_24_s1", text: "Imitates behavior of others, especially adults and older children (18-24 mos.)" },
          { id: "12_24_s2", text: "Increasingly enthusiastic about company of other children (20-24 mos.)" },
          { id: "12_24_s3", text: "Demonstrates increasing independence (18-24 mos.)" },
          { id: "12_24_s4", text: "Begins to show defiant behavior (18-24 mos.)" },
          { id: "12_24_s5", text: "Episodes of separation anxiety increase toward midyear, then fade" }
        ]
      }
    ],
    redFlags: [
      { id: "12_24_rf1", text: "Cannot walk by 18 months" },
      { id: "12_24_rf2", text: "Fails to develop a mature heel-toe walking pattern after several months of walking, or walks exclusively on toes" },
      { id: "12_24_rf3", text: "Does not speak at least 15 words by 18 months" },
      { id: "12_24_rf4", text: "Does not use two-word sentences by age 2" },
      { id: "12_24_rf5", text: "By 15 months does not seem to know the function of common household objects (brush, telephone, bell, fork, spoon)" },
      { id: "12_24_rf6", text: "Does not imitate actions or words by 24 mos." },
      { id: "12_24_rf7", text: "Does not follow simple one-step instructions by 24 mos." }
    ]
  },
  {
    id: "24-36m",
    title: "24 to 36 Months",
    minAgeMonths: 24,
    maxAgeMonths: 36,
    sections: [
      {
        category: "Movement",
        items: [
          { id: "24_36_m1", text: "Climbs well (24-30 mos.)" },
          { id: "24_36_m2", text: "Walks down stairs alone, placing both feet on each step (26-28 mos.)" },
          { id: "24_36_m3", text: "Walks up stairs alternating feet with support (24-30 mos.)" },
          { id: "24_36_m4", text: "Swings leg to kick ball (24-30 mos.)" },
          { id: "24_36_m5", text: "Runs easily (24-26 mos.)" },
          { id: "24_36_m6", text: "Pedals tricycle (30-36 mos.)" },
          { id: "24_36_m7", text: "Bends over easily without falling (24-30 mos.)" }
        ]
      },
      {
        category: "Hand and Finger Skills",
        items: [
          { id: "24_36_h1", text: "Makes vertical, horizontal, circular strokes with pencil or crayon (30-36 mos.)" },
          { id: "24_36_h2", text: "Turns book pages one at a time (24-30 mos.)" },
          { id: "24_36_h3", text: "Builds a tower of more than 6 blocks (24-30 mos.)" },
          { id: "24_36_h4", text: "Holds a pencil in writing position (30-36 mos.)" },
          { id: "24_36_h5", text: "Screws and unscrews jar lids, nuts, and bolts (24-30 mos.)" },
          { id: "24_36_h6", text: "Turns rotating handles (24-30 mos.)" }
        ]
      },
      {
        category: "Language",
        items: [
          { id: "24_36_l1", text: "Recognizes and identifies almost all common objects and pictures (26-32 mos.)" },
          { id: "24_36_l2", text: "Understands most sentences (24-40 mos.)" },
          { id: "24_36_l3", text: "Understands physical relationships (on, in, under) (30-36 mos.)" },
          { id: "24_36_l4", text: "Can say name, age, and sex (30-36 mos.)" },
          { id: "24_36_l5", text: "Uses pronouns (I, you, me, we, they) (24-30 mos.)" },
          { id: "24_36_l6", text: "Strangers can understand most of words (30-36 mos.)" }
        ]
      },
      {
        category: "Cognitive",
        items: [
          { id: "24_36_c1", text: "Makes mechanical toys work (30-36 mos.)" },
          { id: "24_36_c2", text: "Matches an object in hand or room to a picture in a book (24-30 mos.)" },
          { id: "24_36_c3", text: "Plays make-believe with dolls, animals, and people (24-36 mos.)" },
          { id: "24_36_c4", text: "Sorts objects by color (30-36 mos.)" },
          { id: "24_36_c5", text: "Completes puzzles with 3 or 4 pieces (24-36 mos.)" },
          { id: "24_36_c6", text: "Understands concept of \"two\" (26-32 mos.)" }
        ]
      },
      {
        category: "Social / Emotional",
        items: [
          { id: "24_36_s1", text: "Separates easily from parents (by 36 mo.)" },
          { id: "24_36_s2", text: "Expresses a wide range of emotions (24-36 mos.)" },
          { id: "24_36_s3", text: "Objects to major changes in routine (24-36 mos.)" }
        ]
      }
    ],
    redFlags: [
      { id: "24_36_rf1", text: "Frequent falling and difficulty with stairs" },
      { id: "24_36_rf2", text: "Persistent drooling or very unclear speech" },
      { id: "24_36_rf3", text: "Inability to build a tower of more than 4 blocks" },
      { id: "24_36_rf4", text: "Difficulty manipulating small objects" },
      { id: "24_36_rf5", text: "Inability to copy a circle by 3 years old" },
      { id: "24_36_rf6", text: "Inability to communicate in short phrases" },
      { id: "24_36_rf7", text: "No involvement in pretend play" },
      { id: "24_36_rf8", text: "Failure to understand simple instructions" },
      { id: "24_36_rf9", text: "Little interest in other children" },
      { id: "24_36_rf10", text: "Extreme difficulty separating from primary caregiver" }
    ]
  },
  {
    id: "3-4y",
    title: "3 to 4 Years",
    minAgeMonths: 36,
    maxAgeMonths: 48,
    sections: [
      {
        category: "Movement",
        items: [
          { id: "3_4_m1", text: "Hops and stands on one foot up to 5 seconds" },
          { id: "3_4_m2", text: "Goes upstairs and downstairs without support" },
          { id: "3_4_m3", text: "Kicks ball forward" },
          { id: "3_4_m4", text: "Throws ball overhand" },
          { id: "3_4_m5", text: "Catches bounced ball most of the time" },
          { id: "3_4_m6", text: "Moves forward and backward" },
          { id: "3_4_m7", text: "Uses riding toys" }
        ]
      },
      {
        category: "Hand and Finger Skills",
        items: [
          { id: "3_4_h1", text: "Copies square shapes" },
          { id: "3_4_h2", text: "Draws a person with 2-4 body parts" },
          { id: "3_4_h3", text: "Uses scissors" },
          { id: "3_4_h4", text: "Draws circles and squares" },
          { id: "3_4_h5", text: "Begins to copy some capital letters" },
          { id: "3_4_h6", text: "Can feed self with spoon" }
        ]
      },
      {
        category: "Language Milestones",
        items: [
          { id: "3_4_l1", text: "Understands the concepts of \"same\" and \"different\"" },
          { id: "3_4_l2", text: "Has mastered some basic rules of grammar" },
          { id: "3_4_l3", text: "Speaks in sentences of 5-6 words" },
          { id: "3_4_l4", text: "Asks questions" },
          { id: "3_4_l5", text: "Speaks clearly enough for strangers to understand" },
          { id: "3_4_l6", text: "Tells stories" }
        ]
      },
      {
        category: "Cognitive Milestones",
        items: [
          { id: "3_4_c1", text: "Correctly names some colors" },
          { id: "3_4_c2", text: "Understands the concept of counting and may know a few numbers" },
          { id: "3_4_c3", text: "Begins to have a clearer sense of time" },
          { id: "3_4_c4", text: "Follows three-part commands" },
          { id: "3_4_c5", text: "Recalls parts of a story" },
          { id: "3_4_c6", text: "Understands the concept of same/different" },
          { id: "3_4_c7", text: "Engages in fantasy play" },
          { id: "3_4_c8", text: "Understands causality (\"I can make things happen\")" }
        ]
      },
      {
        category: "Social Milestones",
        items: [
          { id: "3_4_s1", text: "Interested in new experiences" },
          { id: "3_4_s2", text: "Cooperates/plays with other children" },
          { id: "3_4_s3", text: "Plays \"mom\" or \"dad\"" },
          { id: "3_4_s4", text: "More inventive in fantasy play" },
          { id: "3_4_s5", text: "Dresses and undresses" },
          { id: "3_4_s6", text: "More independent" }
        ]
      },
      {
        category: "Emotional Milestones",
        items: [
          { id: "3_4_e1", text: "Often cannot distinguish between fantasy and reality" },
          { id: "3_4_e2", text: "May have imaginary friends or see monsters" }
        ]
      }
    ],
    redFlags: [
      { id: "3_4_rf1", text: "Cannot jump in place" },
      { id: "3_4_rf2", text: "Cannot ride a trike" },
      { id: "3_4_rf3", text: "Cannot grasp a crayon between thumb and fingers" },
      { id: "3_4_rf4", text: "Has difficulty scribbling" },
      { id: "3_4_rf5", text: "Cannot copy a circle" },
      { id: "3_4_rf6", text: "Cannot stack 4 blocks" },
      { id: "3_4_rf7", text: "Still clings or cries when parents leave him" },
      { id: "3_4_rf8", text: "Shows no interest in interactive games" },
      { id: "3_4_rf9", text: "Ignores other children" },
      { id: "3_4_rf10", text: "Doesn't respond to people outside the family" },
      { id: "3_4_rf11", text: "Doesn't engage in fantasy play" },
      { id: "3_4_rf12", text: "Resists dressing, sleeping, using the toilet" },
      { id: "3_4_rf13", text: "Lashes out without any self-control when angry or upset" },
      { id: "3_4_rf14", text: "Doesn't use sentences of more than three words" },
      { id: "3_4_rf15", text: "Doesn't use \"me\" or \"you\" appropriately" }
    ]
  },
  {
    id: "4-5y",
    title: "4 to 5 Years",
    minAgeMonths: 48,
    maxAgeMonths: 60,
    sections: [
      {
        category: "Movement",
        items: [
          { id: "4_5_m1", text: "Stands on one foot for 10 seconds or longer" },
          { id: "4_5_m2", text: "Hops, somersaults" },
          { id: "4_5_m3", text: "Swings, climbs" },
          { id: "4_5_m4", text: "May be able to skip" }
        ]
      },
      {
        category: "Milestones in Hand and Finger Skills",
        items: [
          { id: "4_5_h1", text: "Copies triangle and other geometric patterns" },
          { id: "4_5_h2", text: "Draws person with body" },
          { id: "4_5_h3", text: "Prints some letters" },
          { id: "4_5_h4", text: "Dresses and undresses without assistance" },
          { id: "4_5_h5", text: "Uses fork, spoon" },
          { id: "4_5_h6", text: "Usually cares for own toilet needs" }
        ]
      },
      {
        category: "Language Milestones",
        items: [
          { id: "4_5_l1", text: "Recalls parts of a story" },
          { id: "4_5_l2", text: "Speaks sentences of more than 5 words" },
          { id: "4_5_l3", text: "Uses future tense" },
          { id: "4_5_l4", text: "Tells longer stories" },
          { id: "4_5_l5", text: "Says name and address" }
        ]
      },
      {
        category: "Cognitive Milestones",
        items: [
          { id: "4_5_c1", text: "Can count 10 or more objects" },
          { id: "4_5_c2", text: "Correctly names at least 4 colors" },
          { id: "4_5_c3", text: "Better understands the concept of time" },
          { id: "4_5_c4", text: "Knows about things used every day in the home (money, food, etc.)" }
        ]
      },
      {
        category: "Social Milestones",
        items: [
          { id: "4_5_s1", text: "Wants to please and be with friends" },
          { id: "4_5_s2", text: "More likely to agree to rules" },
          { id: "4_5_s3", text: "Likes to sing, dance, and act" },
          { id: "4_5_s4", text: "Shows more independence" }
        ]
      }
    ],
    redFlags: []
  }
];

export default function DevelopmentalDelayAssessmentForm() {
  const { childId: routeChildId } = useParams();
  const navigate = useNavigate();
  const { user, childrenList, showToast } = useAuth();

  const [selectedChildId, setSelectedChildId] = useState(routeChildId || "");
  const [child, setChild] = useState(null);
  const [allChildren, setAllChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTierId, setActiveTierId] = useState("1-3m");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessorNotes, setAssessorNotes] = useState("");
  const [assessorName, setAssessorName] = useState(user?.name || "Occupational / Physical Therapist");

  // State maps:
  // milestones: { [itemId]: "yes" | "emerging" | "no" }
  // datesObserved: { [itemId]: "YYYY-MM-DD" }
  // remarks: { [itemId]: string }
  // redFlags: { [rfId]: boolean }
  // tierComments: { [tierId]: string }
  const [milestones, setMilestones] = useState({});
  const [datesObserved, setDatesObserved] = useState({});
  const [remarks, setRemarks] = useState({});
  const [redFlags, setRedFlags] = useState({});
  const [tierComments, setTierComments] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await childrenService.getAll();
        const delayOrAll = list && list.length > 0 ? list : childrenList;
        setAllChildren(delayOrAll);

        const targetId =
          routeChildId ||
          (delayOrAll.find(
            (c) =>
              c.therapy_category === "Developmental Delay" ||
              c.diagnosis?.toLowerCase().includes("delay")
          )?.id || delayOrAll[0]?.id);

        if (targetId) {
          setSelectedChildId(targetId);
          const found = delayOrAll.find((c) => c.id === targetId);
          setChild(found || null);
          autoSelectTierForChild(found);
          loadDraft(targetId);
        }
      } catch (err) {
        console.warn("DevelopmentalDelayForm load error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [routeChildId]);

  const autoSelectTierForChild = (c) => {
    if (!c) return;
    const ageStr = (c.age || "").toLowerCase();
    if (ageStr.includes("m") || ageStr.includes("month")) {
      const m = parseInt(ageStr, 10);
      if (m <= 3) setActiveTierId("1-3m");
      else if (m <= 7) setActiveTierId("4-7m");
      else if (m <= 12) setActiveTierId("8-12m");
      else if (m <= 24) setActiveTierId("12-24m");
      else if (m <= 36) setActiveTierId("24-36m");
      else setActiveTierId("3-4y");
    } else if (ageStr.includes("y") || ageStr.includes("year")) {
      const y = parseInt(ageStr, 10);
      if (y < 2) setActiveTierId("12-24m");
      else if (y < 3) setActiveTierId("24-36m");
      else if (y < 4) setActiveTierId("3-4y");
      else setActiveTierId("4-5y");
    }
  };

  const loadDraft = (cId) => {
    if (!cId) return;
    try {
      const saved = localStorage.getItem(`dev_delay_draft_${cId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.milestones) setMilestones(parsed.milestones);
        if (parsed.datesObserved) setDatesObserved(parsed.datesObserved);
        if (parsed.remarks) setRemarks(parsed.remarks);
        if (parsed.redFlags) setRedFlags(parsed.redFlags);
        if (parsed.tierComments) setTierComments(parsed.tierComments);
        if (parsed.notes) setAssessorNotes(parsed.notes);
        if (parsed.date) setAssessmentDate(parsed.date);
        if (parsed.activeTierId) setActiveTierId(parsed.activeTierId);
        setLastSavedTime(parsed.savedAt || "Draft Loaded");
      } else {
        setMilestones({});
        setDatesObserved({});
        setRemarks({});
        setRedFlags({});
        setTierComments({});
        setAssessorNotes("");
      }
    } catch (e) {
      console.warn("Dev delay draft load error:", e);
    }
  };

  const saveCurrentDraft = (nextMilestones, nextDates, nextRemarks, nextRf, nextComments, nextNotes) => {
    if (!selectedChildId) return;
    const dataToSave = {
      milestones: nextMilestones || milestones,
      datesObserved: nextDates || datesObserved,
      remarks: nextRemarks || remarks,
      redFlags: nextRf || redFlags,
      tierComments: nextComments || tierComments,
      notes: nextNotes !== undefined ? nextNotes : assessorNotes,
      date: assessmentDate,
      activeTierId,
      savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    localStorage.setItem(`dev_delay_draft_${selectedChildId}`, JSON.stringify(dataToSave));
    setLastSavedTime(dataToSave.savedAt);
  };

  const handleChildChange = (newId) => {
    setSelectedChildId(newId);
    const found = allChildren.find((c) => c.id === newId);
    setChild(found || null);
    autoSelectTierForChild(found);
    loadDraft(newId);
  };

  const setMilestoneStatus = (itemId, status) => {
    setMilestones((prev) => {
      const next = { ...prev, [itemId]: status };
      let nextDates = datesObserved;
      if (status === "yes" && !datesObserved[itemId]) {
        nextDates = { ...datesObserved, [itemId]: assessmentDate };
        setDatesObserved(nextDates);
      }
      saveCurrentDraft(next, nextDates, remarks, redFlags, tierComments, assessorNotes);
      return next;
    });
  };

  const setItemDate = (itemId, dateStr) => {
    setDatesObserved((prev) => {
      const next = { ...prev, [itemId]: dateStr };
      saveCurrentDraft(milestones, next, remarks, redFlags, tierComments, assessorNotes);
      return next;
    });
  };

  const setItemRemark = (itemId, text) => {
    setRemarks((prev) => {
      const next = { ...prev, [itemId]: text };
      saveCurrentDraft(milestones, datesObserved, next, redFlags, tierComments, assessorNotes);
      return next;
    });
  };

  const toggleRedFlag = (rfId) => {
    setRedFlags((prev) => {
      const next = { ...prev, [rfId]: !prev[rfId] };
      saveCurrentDraft(milestones, datesObserved, remarks, next, tierComments, assessorNotes);
      return next;
    });
  };

  const setTierComment = (tierId, comment) => {
    setTierComments((prev) => {
      const next = { ...prev, [tierId]: comment };
      saveCurrentDraft(milestones, datesObserved, remarks, redFlags, next, assessorNotes);
      return next;
    });
  };

  const handleQuickFillTier = (tier, status) => {
    setMilestones((prev) => {
      const next = { ...prev };
      const nextDates = { ...datesObserved };
      tier.sections.forEach((sec) => {
        sec.items.forEach((it) => {
          next[it.id] = status;
          if (status === "yes" && !nextDates[it.id]) {
            nextDates[it.id] = assessmentDate;
          }
        });
      });
      setDatesObserved(nextDates);
      saveCurrentDraft(next, nextDates, remarks, redFlags, tierComments, assessorNotes);
      return next;
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all milestone observations for this child?")) {
      setMilestones({});
      setDatesObserved({});
      setRemarks({});
      setRedFlags({});
      setTierComments({});
      if (selectedChildId) {
        localStorage.removeItem(`dev_delay_draft_${selectedChildId}`);
      }
      showToast("Checklist reset successfully.", "info");
    }
  };

  // Live Statistics Calculations
  const stats = useMemo(() => {
    let totalItems = 0;
    let achievedCount = 0;
    let emergingCount = 0;
    let notAchievedCount = 0;
    let redFlagsTriggered = 0;

    DEVELOPMENTAL_AGE_TIERS.forEach((tier) => {
      tier.sections.forEach((sec) => {
        sec.items.forEach((it) => {
          totalItems++;
          const val = milestones[it.id];
          if (val === "yes") achievedCount++;
          else if (val === "emerging") emergingCount++;
          else if (val === "no") notAchievedCount++;
        });
      });
      tier.redFlags.forEach((rf) => {
        if (redFlags[rf.id]) redFlagsTriggered++;
      });
    });

    const evaluatedCount = achievedCount + emergingCount + notAchievedCount;
    const achieveRate = evaluatedCount > 0 ? Math.round((achievedCount / evaluatedCount) * 100) : 0;

    let delayLevel = "Typical Milestones";
    let badgeVariant = "success";
    if (redFlagsTriggered >= 4 || (evaluatedCount >= 10 && achieveRate < 50)) {
      delayLevel = "Significant Developmental Delay";
      badgeVariant = "danger";
    } else if (redFlagsTriggered >= 2 || (evaluatedCount >= 10 && achieveRate < 75)) {
      delayLevel = "Moderate Developmental Delay";
      badgeVariant = "amber";
    } else if (redFlagsTriggered === 1 || (evaluatedCount >= 5 && achieveRate < 90)) {
      delayLevel = "Mild Delay / Monitoring Required";
      badgeVariant = "blue";
    }

    return {
      totalItems,
      evaluatedCount,
      achievedCount,
      emergingCount,
      notAchievedCount,
      redFlagsTriggered,
      achieveRate,
      delayLevel,
      badgeVariant
    };
  }, [milestones, redFlags]);

  const currentTier = useMemo(() => {
    return DEVELOPMENTAL_AGE_TIERS.find((t) => t.id === activeTierId) || DEVELOPMENTAL_AGE_TIERS[0];
  }, [activeTierId]);

  const handleSubmit = async () => {
    if (!selectedChildId) {
      showToast("Please select a child before submitting.", "danger");
      return;
    }

    setSubmitting(true);
    try {
      const grossMotorScore = Math.max(20, Math.min(100, stats.achieveRate));
      const fineMotorScore = Math.max(20, Math.min(100, stats.achieveRate + 5));

      const domainScores = calculateDomainScores({
        s11_grossMotor: {
          sittingBalance: stats.achieveRate > 60 ? 3 : 1,
          standingBalance: stats.achieveRate > 70 ? 3 : 1,
          walking: stats.achieveRate > 60 ? 3 : 1,
          running: stats.achieveRate > 80 ? 3 : 0,
          climbingStairs: stats.achieveRate > 75 ? 3 : 1,
          postureControl: stats.redFlagsTriggered > 2 ? 1 : 3
        },
        s10_fineMotor: {
          reachesGrasps: stats.achieveRate > 60 ? 3 : 1,
          transfersHand: stats.achieveRate > 65 ? 3 : 1,
          stacksBlocks: stats.achieveRate > 70 ? 2 : 0,
          pencilGrip: stats.achieveRate > 75 ? 2 : 0
        },
        s5_communication: {
          respondsName: 3,
          simpleInstructions: stats.achieveRate > 60 ? 2 : 1
        },
        s8_social: {
          respondsAdults: 2,
          functionalPlay: stats.achieveRate > 50 ? 2 : 1
        },
        s13_adl: {
          eatingIndependently: stats.achieveRate > 70 ? 2 : 1,
          handWashing: stats.achieveRate > 70 ? 2 : 1
        },
        sensoryConcerns: stats.redFlagsTriggered > 0 ? ["Motor Tone / Delay Signs"] : []
      });

      const profileInfo = classifyProfile(domainScores, 0);
      const exercises = selectExercises("D", domainScores);

      const payload = {
        child_id: selectedChildId,
        assessment_date: assessmentDate,
        assessed_by: user?.id || null,
        isaa_score: stats.achievedCount,
        isaa_severity: stats.delayLevel,
        isaa_level: stats.redFlagsTriggered >= 4 ? 3 : stats.redFlagsTriggered >= 2 ? 2 : 1,
        domain_scores: {
          ...domainScores,
          grossMotor: grossMotorScore,
          fineMotor: fineMotorScore
        },
        profile: "D",
        profile_description:
          "Developmental Delay & Motor Milestones Pathway — Physiotherapy, postural control, and milestone stimulation focus.",
        clinic_exercises: exercises.clinicExercises,
        home_exercises: exercises.homeExercises,
        form_data: {
          formType: "DEVELOPMENTAL_CHECKLIST_BIRTH_TO_FIVE",
          milestones,
          datesObserved,
          remarks,
          redFlags,
          tierComments,
          stats,
          assessorName,
          assessorNotes,
          completedDate: new Date().toISOString()
        },
        status: "completed"
      };

      const res = await therapyAssessmentService.saveDelay(payload);
      localStorage.removeItem(`dev_delay_draft_${selectedChildId}`);
      showToast("Developmental Checklist saved successfully!", "success");

      setShowConfirmModal(false);
      navigate(`/reports/new/${selectedChildId}?assessmentId=${res?.id || ""}`);
    } catch (err) {
      console.error("Developmental checklist submission error:", err);
      showToast(`Submission notice: ${err.message}`, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* ═══ TOP BREADCRUMB & HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F5E5A]">
            <Link to="/therapy" className="hover:text-[#854F0B] transition-colors flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-[#854F0B]" />
              Therapy Pathways
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#854F0B] font-bold">Developmental Delay</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#2C2C2A] font-bold">Checklists Birth to Five</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="h-8 w-8 rounded-[8px] bg-[#854F0B]/10 flex items-center justify-center text-[#854F0B]">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#2C2C2A] tracking-tight">
                Developmental Checklists (Birth to Five)
              </h1>
              <p className="text-xs text-[#5F5E5A] font-semibold">
                Comprehensive Early Childhood Milestone Checklist &amp; Clinical Red Flags Evaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outlined"
            icon={ArrowLeft}
            onClick={() => navigate("/therapy")}
          >
            Back to Therapy
          </Button>
          <Button
            size="sm"
            variant="outlined"
            icon={Printer}
            onClick={() =>
              printReportWithFilename({
                childName: child?.name,
                childId: child?.id || selectedChildId
              })
            }
          >
            Print Checklist
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={CheckCircle2}
            className="bg-[#854F0B] hover:bg-[#683C07]"
            onClick={() => setShowConfirmModal(true)}
          >
            Submit &amp; Generate Report
          </Button>
        </div>
      </div>

      {/* ═══ PATIENT METADATA BAR ═══ */}
      <div className="bg-white p-4 rounded-[12px] border border-[#854F0B]/30 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              Select Delay / Therapy Student
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => handleChildChange(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A] outline-none focus:border-[#854F0B] focus:bg-white cursor-pointer"
            >
              {allChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) — {c.therapy_category || c.diagnosis || "Delay"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              Child Details
            </label>
            <div className="flex items-center gap-2 h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A]">
              <span>Gender: {child?.gender || "Male"}</span>
              <span className="text-[#D3D1C7]">|</span>
              <span>Age: {child?.age || child?.dob || "N/A"}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              Parent / Guardian
            </label>
            <div className="h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-semibold text-[#2C2C2A] flex items-center">
              <span className="truncate">{child?.parent?.name || child?.parent_accounts?.parent_name || "Parent"}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              Assessment Date
            </label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A] outline-none focus:border-[#854F0B]"
            />
          </div>
        </div>
      </div>

      {/* ═══ LIVE MILESTONE & RED FLAG SCORE MONITOR ═══ */}
      <div className="bg-gradient-to-r from-[#854F0B]/15 via-[#854F0B]/5 to-white p-5 rounded-[12px] border-2 border-[#854F0B]/30 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#854F0B] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#854F0B]">
                Milestone Progress &amp; Clinical Staging
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-[#2C2C2A]">
                {stats.achievedCount}
              </span>
              <span className="text-sm font-bold text-[#5F5E5A]">
                / {stats.evaluatedCount > 0 ? `${stats.evaluatedCount} Evaluated (${stats.achieveRate}%)` : "0 Evaluated"}
              </span>
              <Badge label={stats.delayLevel} variant={stats.badgeVariant} size="md" />
            </div>
            <p className="text-xs font-semibold text-[#5F5E5A]">
              Autosaved status: <strong>{lastSavedTime ? lastSavedTime : "No draft yet"}</strong>
            </p>
          </div>

          {/* Subscale summary chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-[8px] border border-[#D3D1C7]">
              <span className="text-[10px] text-[#5F5E5A] block uppercase font-bold">Achieved</span>
              <span className="text-sm font-black font-mono text-emerald-700">{stats.achievedCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-[8px] border border-[#D3D1C7]">
              <span className="text-[10px] text-[#5F5E5A] block uppercase font-bold">Emerging</span>
              <span className="text-sm font-black font-mono text-blue-700">{stats.emergingCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-[8px] border border-[#D3D1C7]">
              <span className="text-[10px] text-[#5F5E5A] block uppercase font-bold">Not Achieved</span>
              <span className="text-sm font-black font-mono text-amber-700">{stats.notAchievedCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-[8px] border border-red-200 bg-red-50/50">
              <span className="text-[10px] text-red-600 block uppercase font-bold">Red Flags</span>
              <span className="text-sm font-black font-mono text-red-700">{stats.redFlagsTriggered}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ AGE BRACKET TABS (1 TO 3 MOS -> 4 TO 5 YEARS) ═══ */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-1.5 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        {DEVELOPMENTAL_AGE_TIERS.map((tier) => {
          const isActive = activeTierId === tier.id;
          let tierAchieved = 0;
          let tierTotal = 0;
          tier.sections.forEach((sec) => {
            sec.items.forEach((it) => {
              tierTotal++;
              if (milestones[it.id] === "yes") tierAchieved++;
            });
          });

          return (
            <button
              key={tier.id}
              onClick={() => setActiveTierId(tier.id)}
              className={`px-4 py-2.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#854F0B] text-white shadow-xs"
                  : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6] hover:text-[#2C2C2A]"
              }`}
            >
              <span>{tier.title}</span>
              {tierAchieved > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/25 text-white" : "bg-[#854F0B]/10 text-[#854F0B]"
                  }`}
                >
                  {tierAchieved}/{tierTotal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ ACTIVE AGE TIER CHECKLIST CONTENT ═══ */}
      <div className="space-y-6">
        {/* Tier Action Header */}
        <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#2C2C2A] flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-[#854F0B]" />
              DEVELOPMENTAL CHECKLIST — {currentTier.title.toUpperCase()}
            </h2>
            <p className="text-xs text-[#5F5E5A] font-medium">
              Record observed motor, sensory, cognitive, and language milestones for this developmental age tier.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickFillTier(currentTier, "yes")}
              className="px-3 py-1 text-xs font-bold bg-[#854F0B]/10 text-[#854F0B] hover:bg-[#854F0B]/20 rounded-[6px] cursor-pointer transition-colors"
            >
              Mark All Achieved
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1 text-xs font-bold text-[#D85A5A] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Categories within this age tier */}
        {currentTier.sections.map((sec) => (
          <div key={sec.category} className="bg-white rounded-[12px] border border-[#D3D1C7] overflow-hidden shadow-2xs">
            <div className="bg-[#854F0B] text-white px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-black tracking-wider uppercase">{sec.category}</h3>
              <span className="text-[11px] font-mono text-white/90">
                {sec.items.filter((it) => milestones[it.id] === "yes").length}/{sec.items.length} Achieved
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#2C2C2A] font-bold">
                    <th className="py-2.5 px-3 w-10 text-center">✓</th>
                    <th className="py-2.5 px-4 min-w-[300px]">Milestone Skill Item</th>
                    <th className="py-2.5 px-2 text-center w-20">Achieved</th>
                    <th className="py-2.5 px-2 text-center w-20">Emerging</th>
                    <th className="py-2.5 px-2 text-center w-20">Delayed</th>
                    <th className="py-2.5 px-3 w-32">Date Observed</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Remarks / Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.items.map((it, idx) => {
                    const status = milestones[it.id];
                    const dateVal = datesObserved[it.id] || "";
                    const remarkVal = remarks[it.id] || "";
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={it.id}
                        className={`border-b border-[#E8E6DF] transition-colors ${
                          status === "yes"
                            ? "bg-emerald-50/30 hover:bg-emerald-50/60"
                            : status === "no"
                            ? "bg-amber-50/30 hover:bg-amber-50/60"
                            : isEven
                            ? "bg-[#FAF9F5] hover:bg-[#F0F7FD]"
                            : "bg-white hover:bg-[#F0F7FD]"
                        }`}
                      >
                        <td className="py-3 px-3 text-center text-[#854F0B] font-bold">
                          ✓
                        </td>
                        <td className="py-3 px-4 text-[#2C2C2A] font-semibold">
                          {it.text}
                        </td>

                        {/* Achieved */}
                        <td
                          onClick={() => setMilestoneStatus(it.id, "yes")}
                          className={`py-3 px-2 text-center border-l border-[#D3D1C7]/60 cursor-pointer ${
                            status === "yes" ? "bg-emerald-100 font-bold" : "hover:bg-emerald-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`milestone-${it.id}`}
                            checked={status === "yes"}
                            onChange={() => setMilestoneStatus(it.id, "yes")}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-600 cursor-pointer accent-emerald-600"
                          />
                        </td>

                        {/* Emerging */}
                        <td
                          onClick={() => setMilestoneStatus(it.id, "emerging")}
                          className={`py-3 px-2 text-center border-l border-[#D3D1C7]/60 cursor-pointer ${
                            status === "emerging" ? "bg-blue-100 font-bold" : "hover:bg-blue-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`milestone-${it.id}`}
                            checked={status === "emerging"}
                            onChange={() => setMilestoneStatus(it.id, "emerging")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600 cursor-pointer accent-blue-600"
                          />
                        </td>

                        {/* Delayed / Not Achieved */}
                        <td
                          onClick={() => setMilestoneStatus(it.id, "no")}
                          className={`py-3 px-2 text-center border-l border-[#D3D1C7]/60 cursor-pointer ${
                            status === "no" ? "bg-amber-100 font-bold" : "hover:bg-amber-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`milestone-${it.id}`}
                            checked={status === "no"}
                            onChange={() => setMilestoneStatus(it.id, "no")}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-600 cursor-pointer accent-amber-600"
                          />
                        </td>

                        {/* Date Observed */}
                        <td className="py-2.5 px-3 border-l border-[#D3D1C7]/60">
                          <input
                            type="date"
                            value={dateVal}
                            onChange={(e) => setItemDate(it.id, e.target.value)}
                            className="w-full h-7 px-2 bg-white border border-[#D3D1C7] rounded-[4px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#854F0B]"
                          />
                        </td>

                        {/* Remarks */}
                        <td className="py-2.5 px-3 border-l border-[#D3D1C7]/60">
                          <input
                            type="text"
                            value={remarkVal}
                            onChange={(e) => setItemRemark(it.id, e.target.value)}
                            placeholder="Observations, support required..."
                            className="w-full h-7 px-2 bg-white border border-[#D3D1C7] rounded-[4px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#854F0B]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* ═══ DEVELOPMENTAL RED FLAGS SECTION (IF PRESENT FOR THIS TIER) ═══ */}
        {currentTier.redFlags && currentTier.redFlags.length > 0 && (
          <div className="bg-white rounded-[12px] border-2 border-red-200 overflow-hidden shadow-2xs">
            <div className="bg-red-700 text-white px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-black tracking-wider uppercase flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                DEVELOPMENTAL RED FLAGS ({currentTier.title.toUpperCase()})
              </h3>
              <span className="text-[11px] font-mono font-bold text-white/90">
                {currentTier.redFlags.filter((rf) => redFlags[rf.id]).length} Flags Triggered
              </span>
            </div>

            <div className="p-4 space-y-2.5 bg-red-50/30">
              <p className="text-xs font-semibold text-red-900 mb-2">
                Check any clinical red flag signs observed for immediate therapy focus:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {currentTier.redFlags.map((rf) => {
                  const isFlagged = redFlags[rf.id] === true;

                  return (
                    <label
                      key={rf.id}
                      onClick={() => toggleRedFlag(rf.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-[8px] border transition-all cursor-pointer select-none ${
                        isFlagged
                          ? "bg-red-100 border-red-400 text-red-900 font-bold"
                          : "bg-white border-[#D3D1C7] text-[#2C2C2A] hover:bg-red-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isFlagged}
                        onChange={() => toggleRedFlag(rf.id)}
                        className="h-4 w-4 rounded border-[#D3D1C7] text-red-600 focus:ring-red-600 accent-red-600 mt-0.5 shrink-0 cursor-pointer"
                      />
                      <span className="text-xs leading-relaxed">{rf.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TIER COMMENTS ═══ */}
        <Card padding="p-4" className="space-y-2">
          <label className="block text-xs font-bold text-[#2C2C2A]">
            Comments &amp; Summary Notes for {currentTier.title}:
          </label>
          <textarea
            rows={3}
            value={tierComments[currentTier.id] || ""}
            onChange={(e) => setTierComment(currentTier.id, e.target.value)}
            placeholder={`Enter qualitative observations, parent feedback, or functional milestone status for ${currentTier.title}...`}
            className="w-full p-2.5 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs text-[#2C2C2A] outline-none focus:border-[#854F0B] focus:bg-white"
          />
        </Card>
      </div>

      {/* ═══ OVERALL CLINICAL NOTES & SUBMISSION FOOTER ═══ */}
      <Card padding="p-5" className="space-y-4">
        <h3 className="text-sm font-bold text-[#2C2C2A] flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#854F0B]" />
          Overall Physical / Occupational Therapy Clinical Impression
        </h3>
        <textarea
          rows={3}
          value={assessorNotes}
          onChange={(e) => setAssessorNotes(e.target.value)}
          placeholder="Record overall posture control, muscle tone, primitive reflexes, gait development, and rehabilitation priorities..."
          className="w-full p-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[8px] text-xs text-[#2C2C2A] outline-none focus:border-[#854F0B] focus:bg-white"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#D3D1C7]">
          <div>
            <p className="text-xs font-bold text-[#2C2C2A]">
              Developmental Status: <span className="text-[#854F0B] font-mono">{stats.achievedCount} Milestones Achieved</span> ({stats.delayLevel})
            </p>
            <p className="text-[11px] text-[#5F5E5A]">
              Submitting records this developmental checklist and selects targeted physiotherapy &amp; motor exercises.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="md"
              variant="outlined"
              onClick={() => navigate("/therapy")}
            >
              Cancel
            </Button>
            <Button
              size="md"
              variant="primary"
              icon={CheckCircle2}
              className="bg-[#854F0B] hover:bg-[#683C07]"
              loading={submitting}
              onClick={() => setShowConfirmModal(true)}
            >
              Save &amp; Generate Therapy Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* ═══ CONFIRMATION MODAL ═══ */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Developmental Delay Checklist Submission"
      >
        <div className="space-y-4 text-xs text-[#2C2C2A]">
          <div className="bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7] space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Child:</span>
              <span className="font-bold">{child?.name} ({child?.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Milestones Achieved:</span>
              <span className="font-bold font-mono text-emerald-700">{stats.achievedCount} items</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Emerging / Delayed:</span>
              <span className="font-bold font-mono text-amber-700">{stats.emergingCount + stats.notAchievedCount} items</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Red Flags Identified:</span>
              <span className="font-bold font-mono text-red-700">{stats.redFlagsTriggered} flags</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Clinical Staging:</span>
              <Badge label={stats.delayLevel} variant={stats.badgeVariant} size="sm" />
            </div>
          </div>

          <p className="text-[#5F5E5A]">
            Saving will persist all recorded milestone observations across all completed age tiers into the patient database.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D3D1C7]">
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setShowConfirmModal(false)}
            >
              Review Checklist
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={CheckCircle2}
              className="bg-[#854F0B] hover:bg-[#683C07]"
              loading={submitting}
              onClick={handleSubmit}
            >
              Confirm &amp; Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
