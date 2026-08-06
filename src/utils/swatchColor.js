const VARIANT_LABELS = ['Pomegranate', 'Sea Breeze']
const VARIANT_COLORS = ['#E8397F', '#2E8FE0']

export function variantLabel(images, image) {
  if (!Array.isArray(images)) return null
  const idx = images.indexOf(image)
  return idx >= 0 ? (VARIANT_LABELS[idx] || `Option ${idx + 1}`) : null
}

export function swatchColor(images, image) {
  if (!Array.isArray(images)) return '#888888'
  const idx = images.indexOf(image)
  return idx >= 0 ? (VARIANT_COLORS[idx] || '#888888') : '#888888'
}
