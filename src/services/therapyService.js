import { childrenService } from './childrenService'

export const THERAPY_CATEGORIES = [
  {
    id: "ASD",
    name: "Autism Spectrum (ASD)",
    fullName: "Autism Spectrum Disorder (ASD)",
    description: "Social communication, sensory integration & behavioural support therapy",
    color: "#185FA5",
    bg: "bg-[#EEF4FB]",
    border: "border-[#185FA5]/30",
    badge: "blue"
  },
  {
    id: "ADHD",
    name: "ADHD Presentation",
    fullName: "Attention Deficit Hyperactivity Disorder (ADHD)",
    description: "Focus enhancement, impulse control, executive function & motor regulation",
    color: "#0F6E56",
    bg: "bg-[#E1F5EE]",
    border: "border-[#0F6E56]/30",
    badge: "green"
  },
  {
    id: "Developmental Delay",
    name: "Developmental Delay",
    fullName: "Global & Motor Developmental Delay",
    description: "Gross & fine motor milestones, posture control & developmental stimulation",
    color: "#854F0B",
    bg: "bg-[#FEF3C7]",
    border: "border-[#854F0B]/30",
    badge: "amber"
  },
  {
    id: "Learning Disability",
    name: "Learning Disability",
    fullName: "Specific Learning Disability (SLD)",
    description: "Remedial education, reading, pre-writing, cognitive & perceptual training",
    color: "#533AB7",
    bg: "bg-[#EEEDFE]",
    border: "border-[#533AB7]/30",
    badge: "purple"
  }
]

export const therapyService = {
  /**
   * Get all children registered strictly under Therapy
   */
  async getTherapyChildren(category = null) {
    return await childrenService.getTherapyChildren(category)
  },

  /**
   * Get summary counts for all 4 therapy categories
   */
  async getTherapyStats() {
    const therapyList = await childrenService.getTherapyChildren()
    const counts = {
      total: therapyList.length,
      ASD: 0,
      ADHD: 0,
      "Developmental Delay": 0,
      "Learning Disability": 0
    }

    therapyList.forEach(child => {
      const cat = child.therapy_category || "ASD"
      if (counts[cat] !== undefined) {
        counts[cat]++
      } else {
        counts.ASD++
      }
    })

    return counts
  }
}
