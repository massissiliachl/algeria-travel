import ICONS from './icon-data.js';

/**
 * Icône SVG (équivalent du composant React <Icon name size className strokeWidth fill />).
 * Retourne une chaîne HTML ; nom inconnu → chaîne vide.
 */
export function icon(name, size = 20, { className = '', strokeWidth = 1.75, fill = 'none', style = '' } = {}) {
  const data = ICONS[name];
  if (!data) return '';
  const [baseClass, inner] = data;
  const cls = className ? `${baseClass} ${className}` : baseClass;
  const styleAttr = style ? ` style="${style}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true"${styleAttr}>${inner}</svg>`;
}
