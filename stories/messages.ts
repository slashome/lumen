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
  fileDrop: 'Drop files here',
  fileBrowse: 'Choose files',
  fileRemove: ({ name }) => `Remove ${name}`,
  filesAdded: ({ count }) => (count === 1 ? '1 file added.' : `${count} files added.`),
  fileRemoved: ({ name }) => `${name} removed.`,
  fileRejected: ({ name }) => `${name} is not accepted.`,
  tagRemove: ({ label }) => `Remove ${label}`,
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
  fileDrop: 'Déposez des fichiers ici',
  fileBrowse: 'Choisir des fichiers',
  fileRemove: ({ name }) => `Retirer ${name}`,
  filesAdded: ({ count }) => (count === 1 ? '1 fichier ajouté.' : `${count} fichiers ajoutés.`),
  fileRemoved: ({ name }) => `${name} retiré.`,
  fileRejected: ({ name }) => `${name} n’est pas accepté.`,
  tagRemove: ({ label }) => `Retirer ${label}`,
}

export function registerDemoMessages() {
  registerLumenMessages('en', en)
  registerLumenMessages('fr', fr)
  if (!document.documentElement.lang) {
    document.documentElement.lang = 'en'
  }
}
