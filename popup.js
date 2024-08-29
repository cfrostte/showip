document.addEventListener('DOMContentLoaded', function () {

  const bookmarkSelect = jQuery('#bookmarkSelect');
  bookmarkSelect.select2({
    placeholder: 'Buscar marcador...',
    allowClear: true
  });

  const ipResult = document.getElementById('ipResult');
  const copyBtn = document.getElementById('copyBtn');

  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    bookmarkTreeNodes.forEach(poblarFavoritos);
    ordenarOpciones();
  });

  bookmarkSelect.on('change', function () {
    const selectedUrl = bookmarkSelect.val();
    if (selectedUrl) {
      const url = new URL(selectedUrl);
      fetch(`https://dns.google/resolve?name=${url.hostname}`)
        .then(response => response.json())
        .then(data => {
          const ip = data.Answer ? 'Se encontró: ' + data.Answer[0].data : 'No se encontró nada.';
          ipResult.textContent = `${ip}`;
        })
        .catch(error => console.error('Error al conectar:', error));
    }
  });

  copyBtn.addEventListener('click', () => {
    const ipText = ipResult.textContent.split(': ')[1];
    if (ipText) {
      navigator.clipboard.writeText(ipText).then(() => {
        const originalText = ipResult.textContent;
        ipResult.textContent = `Se copió: ${ipText}`;
        setTimeout(() => {
          ipResult.textContent = originalText;
        }, 2000);
      }).catch(err => console.error('Error al copiar:', err));
    }
  });

  function poblarFavoritos(bookmarkNode) {
    if (bookmarkNode.children) {
      bookmarkNode.children.forEach(poblarFavoritos);
    } else if (bookmarkNode.url) {
      let option = jQuery('<option>').val(generarURL(bookmarkNode.url)).text(generarTitulo(bookmarkNode.url));
      bookmarkSelect.append(option);
    }
  }

  function generarURL(url) {
    return url.replace(/(^https?:\/\/)?(www\.)/, '$1');
  }

  function generarTitulo(url) {
    let result = url.replace(/^https?:\/\//, '');
    result = result.replace(/\/$/, '');
    return result;
  }

  function ordenarOpciones() {
    const options = bookmarkSelect.children('option').toArray();
    options.sort((a, b) => a.text.localeCompare(b.text));
    bookmarkSelect.empty();
    options.forEach(option => bookmarkSelect.append(option));
  }

});