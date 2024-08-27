document.addEventListener('DOMContentLoaded', function () {

  // Inicializar Select2 en el elemento select
  const bookmarkSelect = jQuery('#bookmarkSelect');
  bookmarkSelect.select2({
    placeholder: 'Buscar marcador...',
    allowClear: true
  });

  // Obtener el elemento que muestra los resultados
  const ipResult = document.getElementById('ipResult');

  // Cargar y ordenar marcadores de cada carpeta
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    // 1. Cargar:
    bookmarkTreeNodes.forEach(poblarFavoritos);
    // 2. Ordenar:
    ordenarOpciones();
  });

  // Obtener IP cuando se elija un marcador
  bookmarkSelect.on('change', function () {
    const selectedUrl = bookmarkSelect.val();
    if (selectedUrl) {
      const url = new URL(selectedUrl);
      fetch(`https://dns.google/resolve?name=${url.hostname}`)
        .then(response => response.json())
        .then(data => {
          const ip = data.Answer ? data.Answer[0].data : 'No se encontró la IP.';
          ipResult.textContent = `La IP es: ${ip}`;
        })
        .catch(error => console.error('Error al obtener la IP:', error));
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
    bookmarkSelect.empty(); // (vaciar actuales)
    options.forEach(option => bookmarkSelect.append(option));
  }

});