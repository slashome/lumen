const openFlag = 'data-lu-popover-open'

function toggle(element: HTMLElement, open: boolean) {
  const wasOpen = element.hasAttribute(openFlag)
  if (wasOpen === open) {
    return
  }
  element.toggleAttribute(openFlag, open)
  const event = new Event('toggle')
  Object.assign(event, { oldState: wasOpen ? 'open' : 'closed', newState: open ? 'open' : 'closed' })
  element.dispatchEvent(event)
}

export function installDomShims() {
  const dialog = globalThis.HTMLDialogElement?.prototype
  if (dialog && typeof dialog.showModal !== 'function') {
    dialog.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    dialog.show = dialog.showModal
    dialog.close = function close(this: HTMLDialogElement) {
      if (this.hasAttribute('open')) {
        this.removeAttribute('open')
        this.dispatchEvent(new Event('close'))
      }
    }
  }
  const element = globalThis.HTMLElement?.prototype
  if (element && typeof element.showPopover !== 'function') {
    element.showPopover = function showPopover(this: HTMLElement) {
      toggle(this, true)
    }
    element.hidePopover = function hidePopover(this: HTMLElement) {
      toggle(this, false)
    }
    element.togglePopover = function togglePopover(this: HTMLElement, force?: boolean | { force?: boolean }) {
      const wanted = typeof force === 'object' ? force.force : force
      const open = wanted ?? !this.hasAttribute(openFlag)
      toggle(this, open)
      return open
    }
  }
  const internals = globalThis.ElementInternals?.prototype
  if (internals && typeof internals.setFormValue !== 'function') {
    internals.setFormValue = function setFormValue() {}
  }
}
