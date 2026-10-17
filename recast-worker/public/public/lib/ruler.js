const ruler = document.getElementById('ruler');
if (ruler) {
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('span');
    s.textContent = i % 5 === 0 ? i : '';
    ruler.appendChild(s);
  }
}
