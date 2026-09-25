// ── Minimal ZIP creator ───────────────────────────────────
// Creates uncompressed ZIPs from text files — no dependencies

function crc32(data: Uint8Array): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const b of data) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function makeZip(files: Array<{ name: string; text: string }>): Blob {
  const enc = new TextEncoder();
  const items: Array<{ nameBytes: Uint8Array; dataBytes: Uint8Array; crc: number; localOffset: number }> = [];
  const localParts: Uint8Array[] = [];
  let localOffset = 0;

  for (const file of files) {
    const nameBytes = enc.encode(file.name);
    const dataBytes = enc.encode(file.text);
    const crc = crc32(dataBytes);

    const lh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header sig
    lv.setUint16(4, 20, true);          // version needed
    lv.setUint16(6, 0, true);           // flags
    lv.setUint16(8, 0, true);           // compression: stored
    lv.setUint16(10, 0, true);          // mod time
    lv.setUint16(12, 0, true);          // mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true); // compressed size
    lv.setUint32(22, dataBytes.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);          // extra field length
    lh.set(nameBytes, 30);

    items.push({ nameBytes, dataBytes, crc, localOffset });
    localParts.push(lh, dataBytes);
    localOffset += 30 + nameBytes.length + dataBytes.length;
  }

  // Central directory
  const cdParts: Uint8Array[] = [];
  let cdSize = 0;
  for (const item of items) {
    const cd = new Uint8Array(46 + item.nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);  // central dir sig
    cv.setUint16(4, 20, true);           // version made by
    cv.setUint16(6, 20, true);           // version needed
    cv.setUint16(8, 0, true);            // flags
    cv.setUint16(10, 0, true);           // compression
    cv.setUint16(12, 0, true);           // mod time
    cv.setUint16(14, 0, true);           // mod date
    cv.setUint32(16, item.crc, true);
    cv.setUint32(20, item.dataBytes.length, true);
    cv.setUint32(24, item.dataBytes.length, true);
    cv.setUint16(28, item.nameBytes.length, true);
    cv.setUint16(30, 0, true);           // extra field
    cv.setUint16(32, 0, true);           // comment
    cv.setUint16(34, 0, true);           // disk start
    cv.setUint16(36, 0, true);           // internal attrs
    cv.setUint32(38, 0, true);           // external attrs
    cv.setUint32(42, item.localOffset, true);
    cd.set(item.nameBytes, 46);
    cdParts.push(cd);
    cdSize += cd.length;
  }

  // End of central directory record
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, items.length, true);
  ev.setUint16(10, items.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, localOffset, true);
  ev.setUint16(20, 0, true);

  const toBuffer = (u: Uint8Array) => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
  return new Blob(
    [...localParts, ...cdParts, eocd].map(toBuffer),
    { type: 'application/zip' },
  );
}
