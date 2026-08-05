export function swatchColor(imagePath) {
  const name = imagePath.toLowerCase()
  if (name.includes('azul') || name.includes('blue')) return '#2E8FE0'
  if (name.includes('pomegranate') || name.includes('rosa') || name.includes('pink')) return '#E8397F'
  return '#888888'
}
