import {
  Tldraw,
  parseTldrawJsonFile,
  getSnapshot,
  createTLStore,
} from "tldraw";
import "tldraw/tldraw.css";
import tldrRaw from "./layouts/whiteboard.tldr?raw";

const parseResult = parseTldrawJsonFile({
  json: tldrRaw,
  schema: createTLStore().schema,
});
if (!parseResult.ok) {
  throw new Error(`Failed to load whiteboard: ${parseResult.error.type}`);
}
const layoutData = getSnapshot(parseResult.value);

export function MoveOnlyCanvas() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}
        hideUi
        snapshot={layoutData}
        options={{ camera: { wheelBehavior: "zoom" }, deepLinks: true }}
        onMount={(editor) => {
          editor.setCurrentTool("hand");

          editor.on("change", () => {
            if (editor.getCurrentToolId() !== "hand") {
              editor.setCurrentTool("hand");
            }
          });

          const el = editor.getContainer();
          el.addEventListener(
            "keydown",
            (e) => {
              if (
                e.key === "Delete" ||
                e.key === "Backspace" ||
                ((e.ctrlKey || e.metaKey) &&
                  (e.key === "z" ||
                    e.key === "Z" ||
                    e.key === "y" ||
                    e.key === "Y"))
              ) {
                e.stopPropagation();
                e.preventDefault();
              }
            },
            true,
          );
        }}
      />
    </div>
  );
}
