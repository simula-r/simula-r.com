import { Tldraw, createShapeId, Editor, toRichText } from 'tldraw'
import 'tldraw/tldraw.css'

function createInitialLayout(editor: Editor) {
  editor.createShapes([
    {
      id: createShapeId('card-1'),
      type: 'geo',
      x: 100,
      y: 100,
      props: { geo: 'rectangle', w: 200, h: 120, color: 'blue', size: 'm', richText: toRichText('Card 1'), fill: 'solid' },
    },
    {
      id: createShapeId('card-2'),
      type: 'geo',
      x: 400,
      y: 100,
      props: { geo: 'rectangle', w: 200, h: 120, color: 'green', size: 'm', richText: toRichText('Card 2'), fill: 'solid' },
    },
    {
      id: createShapeId('card-3'),
      type: 'geo',
      x: 250,
      y: 300,
      props: { geo: 'ellipse', w: 180, h: 180, color: 'red', size: 'm', richText: toRichText('Card 3'), fill: 'solid' },
    },
    {
      id: createShapeId('label'),
      type: 'text',
      x: 100,
      y: 520,
      props: { richText: toRichText('This is a view-only canvas'), size: 'l', color: 'grey' },
    },
  ])
  editor.zoomToFit({ animation: { duration: 0 } })
}

// Readonly — pan/zoom only, shapes are fixed in place
export function ReadonlyCanvas() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        hideUi
        onMount={(editor) => {
          createInitialLayout(editor)
          editor.updateInstanceState({ isReadonly: true })
        }}
      />
    </div>
  )
}

// Move-only — shapes can be dragged but not created, deleted, resized, rotated, or edited
export function MoveOnlyCanvas() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        hideUi
        components={{ SelectionForeground: null }}
        onMount={(editor) => {
          createInitialLayout(editor)

          const el = editor.getContainer()

          editor.on('change', () => {
            if (editor.getCurrentToolId() !== 'select') {
              editor.setCurrentTool('select')
            }
          })

          el.addEventListener('keydown', (e) => {
            if (
              e.key === 'Delete' || e.key === 'Backspace' ||
              ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z' || e.key === 'y' || e.key === 'Y'))
            ) {
              e.stopPropagation()
              e.preventDefault()
            }
          }, true)
        }}
      />
    </div>
  )
}
