/**
 * Zone d’insertion d’image (fichier obligatoire / prioritaire)
 */
(function (global) {
  const MAX_KB = 1500;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function readFile(file, toast) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast('Choisissez un fichier image (jpg, png, webp…)');
        reject(new Error('type'));
        return;
      }
      if (file.size > MAX_KB * 1024) {
        toast(`Image trop lourde (max ${MAX_KB} Ko). Compressez-la puis réessayez.`);
        reject(new Error('size'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => {
        toast('Impossible de lire le fichier');
        reject(new Error('read'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * HTML d’une zone d’insertion
   * @param {object} opts id, label, value, required, multiple
   */
  function markup(opts) {
    const id = opts.id || 'imgInsert';
    const label = opts.label || 'Insérer une image';
    const value = opts.value || '';
    const required = opts.required ? 'true' : 'false';
    const multiple = opts.multiple ? 'multiple' : '';
    return `
      <div class="img-insert" data-img-insert="${escapeHtml(id)}" data-required="${required}">
        <input type="hidden" name="${escapeHtml(opts.name || 'image')}" id="${escapeHtml(id)}Value" value="${escapeHtml(value)}" />
        <label class="img-insert__drop" for="${escapeHtml(id)}File">
          <input type="file" id="${escapeHtml(id)}File" accept="image/*" ${multiple} hidden />
          <span class="img-insert__icon" aria-hidden="true">📷</span>
          <strong>${escapeHtml(label)}</strong>
          <span class="img-insert__hint">Cliquez ou glissez une image ici (JPG, PNG, WEBP — max ${MAX_KB} Ko)</span>
          <span class="btn btn--sm btn--gold img-insert__btn">Choisir un fichier</span>
        </label>
        <div class="img-insert__preview ${value ? 'is-visible' : ''}" id="${escapeHtml(id)}Preview"
          ${value ? `style="background-image:url('${escapeHtml(global.ATStore ? ATStore.src(value) : value)}')"` : ''}>
          <button type="button" class="img-insert__clear" id="${escapeHtml(id)}Clear" title="Retirer">×</button>
        </div>
        <p class="img-insert__or">ou coller une URL</p>
        <input type="url" class="img-insert__url" id="${escapeHtml(id)}Url" value="${escapeHtml(value && !String(value).startsWith('data:') ? value : '')}" placeholder="https://… ou /images/photo.jpg" />
      </div>
    `;
  }

  function bind(id, toast, onChange) {
    const root = document.querySelector(`[data-img-insert="${id}"]`);
    if (!root) return;
    const fileInput = document.getElementById(id + 'File');
    const urlInput = document.getElementById(id + 'Url');
    const hidden = document.getElementById(id + 'Value');
    const preview = document.getElementById(id + 'Preview');
    const clearBtn = document.getElementById(id + 'Clear');
    const drop = root.querySelector('.img-insert__drop');

    const setValue = (url) => {
      hidden.value = url || '';
      if (url) {
        preview.style.backgroundImage = `url('${global.ATStore ? ATStore.src(url) : url}')`;
        preview.classList.add('is-visible');
      } else {
        preview.style.backgroundImage = '';
        preview.classList.remove('is-visible');
      }
      if (typeof onChange === 'function') onChange(url || '');
    };

    // init from existing URL field if preview already set via markup
    if (preview.classList.contains('is-visible') && !hidden.value) {
      const bg = preview.style.backgroundImage || '';
      const m = bg.match(/url\(['"]?(.*?)['"]?\)/);
      if (m) hidden.value = m[1];
    }

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await readFile(file, toast);
        urlInput.value = '';
        setValue(dataUrl);
      } catch {
        fileInput.value = '';
      }
    });

    urlInput.addEventListener('change', () => {
      const v = urlInput.value.trim();
      if (v) setValue(v);
    });

    clearBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.value = '';
      urlInput.value = '';
      setValue('');
    });

    ['dragenter', 'dragover'].forEach((ev) => {
      drop.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.add('is-drag');
      });
    });
    ['dragleave', 'drop'].forEach((ev) => {
      drop.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.remove('is-drag');
      });
    });
    drop.addEventListener('drop', async (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await readFile(file, toast);
        urlInput.value = '';
        setValue(dataUrl);
      } catch {
        /* toast already */
      }
    });

    return {
      getValue: () => hidden.value.trim() || urlInput.value.trim(),
      setValue,
      isRequired: () => root.dataset.required === 'true',
    };
  }

  /** Plusieurs fichiers → tableau de data URLs */
  async function readMany(fileList, toast) {
    const out = [];
    for (const file of Array.from(fileList || [])) {
      try {
        out.push(await readFile(file, toast));
      } catch {
        /* skip */
      }
    }
    return out;
  }

  /** Redimensionne une photo (côté max 1600 px, JPEG) pour tenir dans le stockage du navigateur */
  function compressFile(file, maxSide = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('type'));
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('read'));
      };
      img.src = url;
    });
  }

  global.ATImageInsert = { markup, bind, readFile, readMany, compressFile, MAX_KB };
})(window);
