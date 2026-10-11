export function formatAppointmentDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatAppointmentTime(timeStr) {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

export function isPast(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr < today
}

export function getTypeLabel(type) {
  const labels = {
    assessment: 'Assessment',
    review: 'Review',
    therapy: 'Therapy'
  }
  return labels[type] || type
}

export function getStatusLabel(status) {
  const labels = {
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rescheduled: 'Rescheduled'
  }
  return labels[status] || status
}

export function getTypeStyle(type) {
  switch (type) {
    case 'assessment':
      return { bg: '#EEEDFE', text: '#3C3489', border: '#AFA9EC' }
    case 'review':
      return { bg: '#FAEEDA', text: '#633806', border: '#EF9F27' }
    case 'therapy':
      return { bg: '#E1F5EE', text: '#085041', border: '#5DCAA5' }
    default:
      return { bg: '#F0EFEA', text: '#5F5E5A', border: '#D3D1C7' }
  }
}

export function getStatusStyle(status) {
  switch (status) {
    case 'upcoming':
      return { bg: '#E6F1FB', text: '#0C447C' }
    case 'completed':
      return { bg: '#EAF3DE', text: '#27500A' }
    case 'cancelled':
      return { bg: '#FAECE7', text: '#712B13' }
    default:
      return { bg: '#F0EFEA', text: '#5F5E5A' }
  }
}

export function generateTimeSlots() {
  const slots = []
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hStr = h.toString().padStart(2, '0')
      const mStr = m.toString().padStart(2, '0')
      const value = `${hStr}:${mStr}`
      const h12 = h % 12 || 12
      const ampm = h >= 12 ? 'PM' : 'AM'
      const label = `${h12}:${mStr} ${ampm}`
      slots.push({ value, label })
    }
  }
  return slots
}

export function getProfileVariant(profile) {
  switch (profile) {
    case 'A': return { bg: '#EEEDFE', text: '#3C3489' }
    case 'B': return { bg: '#E6F1FB', text: '#185FA5' }
    case 'C': return { bg: '#FAEEDA', text: '#633806' }
    case 'D': return { bg: '#E1F5EE', text: '#085041' }
    case 'E': return { bg: '#FAECE7', text: '#712B13' }
    default: return { bg: '#F0EFEA', text: '#5F5E5A' }
  }
}
