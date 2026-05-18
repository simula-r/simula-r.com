import { Tldraw } from 'tldraw'
import type { TLEditorSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import layoutDataRaw from './layouts/whiteboard.json'

const layoutData = layoutDataRaw as unknown as TLEditorSnapshot

export function MoveOnlyCanvas() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        hideUi
        snapshot={layoutData}
        options={{ camera: { wheelBehavior: 'zoom' } }}

        onMount={(editor) => {
          editor.on('change', () => {
            if (editor.getCurrentToolId() !== 'select') {
              editor.setCurrentTool('select')
            }
          })

          const el = editor.getContainer()
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
