export type OpenChangeSource = 'trigger' | 'panel' | 'escape' | 'outside' | 'close-button' | 'cancel' | 'form'

export interface OpenChangeDetail {
  open: boolean
  source: OpenChangeSource
}

export type ValueChangeSource = 'option' | 'clear'

export interface ValueChangeDetail<Value = string> {
  value: Value
  source: ValueChangeSource
}

export interface SelectedChangeDetail {
  selected: string[]
  source: ValueChangeSource
}
