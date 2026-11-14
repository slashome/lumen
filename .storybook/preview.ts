import { setCustomElementsManifest, type Preview } from '@storybook/web-components-vite'
import manifest from '../custom-elements.json'
import { declarationOf, markDeprecated } from './deprecated'
import { markRequired } from './required'
import '../src/foundations/lumen.css'
import '../src/index'
import { setLumenTheme } from '../src/lib'
import { registerDemoMessages } from '../stories/messages'

setCustomElementsManifest(manifest)
registerDemoMessages()

const preview: Preview = {
  globalTypes: {
    appearance: {
      description: 'Light or dark appearance',
      toolbar: { title: 'Appearance', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
    primary: { description: 'The theme primary color, set by the color picker of the toolbar' },
    secondary: { description: 'The theme secondary color, set by the color picker of the toolbar' },
  },
  initialGlobals: { appearance: 'light', primary: '#3760c9', secondary: '#3760c9' },
  decorators: [
    (story, context) => {
      const root = document.documentElement
      root.dataset.appearance = context.globals.appearance
      setLumenTheme({ primary: context.globals.primary, secondary: context.globals.secondary })
      return story()
    },
  ],
  argTypesEnhancers: [(context) => markRequired(markDeprecated(context.argTypes, declarationOf(manifest, context.component)), declarationOf(manifest, context.component))],
  parameters: {
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: ['Foundations', ['Introduction', 'Prop conventions', 'Labels', 'Tokens', 'Icons', 'Light', 'Frameworks', 'Changelog'], 'Actions', 'Form', 'Feedback', 'Navigation', 'Data', 'Overlays'],
      },
    },
  },
}

export default preview
