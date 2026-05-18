import { useCallback } from "react";
import { Tldraw, getSnapshot, loadSnapshot, useEditor } from "tldraw";
import "tldraw/tldraw.css";

const buttonStyle: React.CSSProperties = {
  padding: "8px 18px",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
};

function LayoutButtons() {
  const editor = useEditor();

  const save = useCallback(async () => {
    const { document, session } = getSnapshot(editor.store);
    const json = JSON.stringify({ document, session }, null, 2);
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: "whiteboard.json",
        types: [
          { description: "JSON", accept: { "application/json": [".json"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    } catch (e: any) {
      if (e.name !== "AbortError") throw e;
    }
  }, [editor]);

  const load = useCallback(async () => {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          { description: "JSON", accept: { "application/json": [".json"] } },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const text = await file.text();
      loadSnapshot(editor.store, JSON.parse(text));
    } catch (e: any) {
      if (e.name !== "AbortError") throw e;
    }
  }, [editor]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        right: 12,
        pointerEvents: "all",
        display: "flex",
        gap: 8,
      }}
    >
      <button onClick={load} style={{ ...buttonStyle, background: "#6b7280" }}>
        Load Layout
      </button>
      <button onClick={save} style={{ ...buttonStyle, background: "#2563eb" }}>
        Save Layout
      </button>
    </div>
  );
}

export function BuilderCanvas() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}
        options={{
          deepLinks: true,
        }}
        components={{
          InFrontOfTheCanvas: LayoutButtons,
        }}
      />
    </div>
  );
}
