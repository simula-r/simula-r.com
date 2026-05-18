import { BuilderCanvas } from './BuilderCanvas'
import { MoveOnlyCanvas } from './ViewerCanvas'

const isBuilder = new URLSearchParams(window.location.search).has('builder')

export default function App() {
  return isBuilder ? <BuilderCanvas /> : <MoveOnlyCanvas />
}
