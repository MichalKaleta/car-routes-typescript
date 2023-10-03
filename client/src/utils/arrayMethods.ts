export function getArrayChunks<T>(
  arr: Array<T>,
  chunkSize: number
): Array<Array<T>> {
  const chunks = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk: Array<T> = arr.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}
