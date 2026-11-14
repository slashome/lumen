import { createElement } from 'react'
import { addons, types, useGlobals } from 'storybook/manager-api'
import { create } from 'storybook/theming'

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Lumen',
    brandUrl: 'https://github.com/slashome/lumen',
    brandImage: './logo.svg',
    brandTarget: '_blank',
  }),
})

const themeColors = [
  { key: 'primary', title: 'Primary' },
  { key: 'secondary', title: 'Secondary' },
] as const

function ThemeColors() {
  const [globals, updateGlobals] = useGlobals()
  return createElement(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: 12, paddingInline: 8, fontSize: 12 } },
    themeColors.map(({ key, title }) =>
      createElement(
        'label',
        { key, title: `The theme ${key} color`, style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' } },
        title,
        createElement('input', {
          type: 'color',
          name: `lumen-theme-${key}`,
          value: String(globals[key] ?? '#3760c9'),
          onChange: (event: { target: { value: string } }) => updateGlobals({ [key]: event.target.value }),
          style: { inlineSize: 28, blockSize: 20, padding: 0, border: 0, background: 'none', cursor: 'pointer' },
        }),
      ),
    ),
  )
}

addons.register('lumen/theme', () => {
  addons.add('lumen/theme/colors', {
    type: types.TOOL,
    title: 'Theme colors',
    match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
    render: ThemeColors,
  })
})
