async function listModels() {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY');
    const data = await res.json();
    console.log(data.models.map(m => m.name).join('\n'));
  } catch (e) {
    console.error(e);
  }
}
listModels();
