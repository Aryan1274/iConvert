const clients = new Set();

export function addClient(res) {
  clients.add(res);
  res.on('close', () => {
    clients.delete(res);
  });
}

export function broadcastProgress(jobId, data) {
  for (const client of clients) {
    client.write(`event: progress\n`);
    client.write(`data: ${JSON.stringify({ jobId, ...data })}\n\n`);
  }
}
