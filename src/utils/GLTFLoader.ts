// src/utils/GLTFLoader.js
export async function loadGLB(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const data = parseGLB(arrayBuffer);
    return data;
  }
  
  function parseGLB(buffer) {
    const dataView = new DataView(buffer);
  
    // GLB Header (12 bytes)
    const magic = dataView.getUint32(0, true);
    const version = dataView.getUint32(4, true);
    const length = dataView.getUint32(8, true);
  
    if (magic !== 0x46546C67) throw new Error("Invalid glTF binary format");
  
    let offset = 12;
    const chunks = [];
  
    while (offset < length) {
      const chunkLength = dataView.getUint32(offset, true);
      const chunkType = dataView.getUint32(offset + 4, true);
      const chunkData = buffer.slice(offset + 8, offset + 8 + chunkLength);
  
      chunks.push({
        type: chunkType === 0x4E4F534A ? "JSON" : "BIN",
        data: chunkData
      });
  
      offset += 8 + chunkLength;
    }
  
    const jsonChunk = JSON.parse(new TextDecoder().decode(chunks.find(c => c.type === "JSON").data));
    const binChunk = chunks.find(c => c.type === "BIN")?.data ?? null;
  
    return {
      json: jsonChunk,
      binary: binChunk
    };
  }
  