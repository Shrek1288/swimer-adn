const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const galleryDir = path.join(__dirname, 'public', 'gallery');
fs.mkdirSync(galleryDir, { recursive: true });
let gallery = [];
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/upload-image', upload.single('image'), (req, res) => {
  const url = '/gallery/' + req.file.filename;
  const id = Date.now().toString();
  gallery.push({ url, id });
  res.json({ success: true, url, id });
});

app.get('/gallery', (req, res) => res.json(gallery));

app.delete('/gallery/:id', (req, res) => {
  const img = gallery.find(i => i.id === req.params.id);
  if (!img) return res.sendStatus(404);
  fs.unlinkSync(path.join(galleryDir, path.basename(img.url)));
  gallery = gallery.filter(i => i.id !== img.id);
  res.sendStatus(204);
});

app.use(express.json());
let messages = [];

app.get('/messages', (req, res) => res.json(messages));

app.post('/messages', (req, res) => {
  const msg = { text: req.body.text, id: Date.now().toString(), timestamp: new Date() };
  messages.unshift(msg);
  res.json(msg);
});

app.delete('/messages/:id', (req, res) => {
  messages = messages.filter(m => m.id !== req.params.id);
  res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));