import { registerLumenMessages, type LumenMessages } from '../src/lib/messages'

export const en: LumenMessages = {
  close: 'Close',
  confirm: 'Confirm',
  cancel: 'Cancel',
  clear: 'Clear',
  notifications: 'Notifications',
  loading: 'Loading…',
  draggable: 'draggable',
  dragPickedUp: ({ item }) => `Picked up ${item}. Use the arrow keys to move, Space to drop, Escape to cancel.`,
  dragOver: ({ zone }) => `Over ${zone}.`,
  dragDropped: ({ zone }) => `Dropped on ${zone}.`,
  dragDroppedOutside: 'Dropped.',
  dragCancelled: 'Move cancelled.',
}

export const fr: LumenMessages = {
  close: 'Fermer',
  confirm: 'Confirmer',
  cancel: 'Annuler',
  clear: 'Effacer',
  notifications: 'Notifications',
  loading: 'Chargement…',
  draggable: 'déplaçable',
  dragPickedUp: ({ item }) => `${item} saisi. Flèches pour déplacer, Espace pour déposer, Échap pour annuler.`,
  dragOver: ({ zone }) => `Sur ${zone}.`,
  dragDropped: ({ zone }) => `Déposé sur ${zone}.`,
  dragDroppedOutside: 'Déposé.',
  dragCancelled: 'Déplacement annulé.',
}

export function registerDemoMessages() {
  registerLumenMessages('en', en)
  registerLumenMessages('fr', fr)
  if (!document.documentElement.lang) {
    document.documentElement.lang = 'en'
  }
}
