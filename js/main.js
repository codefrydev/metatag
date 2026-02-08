(function () {
  'use strict';

  let fields = [];
  let appData = null;

  function resolveFieldValue(value) {
    if (value === '@currentUrl') return window.location.href;
    return value || '';
  }

  function applyUiStrings(data) {
    const ui = data.ui;
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setPlaceholder = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.placeholder = text;
    };

    set('headerTitle', ui.pageTitle);
    set('tagline', ui.tagline);
    set('generatorSettingsTitle', ui.generatorSettings);
    set('previewSectionTitle', ui.preview);
    document.getElementById('codeTab').textContent = ui.tabs.code;
    document.getElementById('previewTab').textContent = ui.tabs.socialPreview;
    document.getElementById('searchTab').textContent = ui.tabs.searchResult;
    document.getElementById('extractorTab').textContent = ui.tabs.metaDataExtractor;
    set('generateBtnText', ui.buttons.generateMetaTags);
    set('resetBtnText', ui.buttons.resetForm);
    set('extractBtnText', ui.buttons.extract);
    set('copyNotificationText', ui.copyNotification);
    setPlaceholder('extractUrl', ui.placeholders.extractUrl);
    set('extractorPlaceholderText', ui.extractorPlaceholder);
    set('extractorLoadingText', ui.extractorLoading);
    set('extractedTabTagsText', ui.extractedTags);
    set('extractedTabPreviewText', ui.socialPreviewTab);
    set('extractedMetaTagsHeading', ui.extractedMetaTagsHeading);
    set('websiteUrlLabel', ui.websiteUrl);
    set('tablePropertyName', ui.tablePropertyName);
    set('tableContent', ui.tableContent);
    set('socialMediaPreviewHeading', ui.socialMediaPreviewHeading);
    set('facebookPreviewLabel', ui.facebookPreview);
    set('twitterPreviewLabel', ui.twitterPreview);
  }

  function buildForm(data) {
    const form = document.getElementById('metaForm');
    fields = data.formFields.map(f => ({
      ...f,
      value: resolveFieldValue(f.value)
    }));

    function isValidHex(color) {
      return /^#([0-9A-F]{3}){1,2}$/i.test(color);
    }

    const ui = data.ui;
    const colorPlaceholder = ui.placeholders.hexColor;

    fields.forEach((f, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex flex-col animate-fadeInUp';
      wrapper.style.animationDelay = `${i * 0.1}s`;

      const label = document.createElement('label');
      label.htmlFor = f.name;
      label.textContent = f.label;
      label.className = 'font-semibold mb-1 text-gray-700';
      if (f.required) {
        const req = document.createElement('span');
        req.textContent = ' *';
        req.className = 'text-red-500';
        label.appendChild(req);
      }

      let input;

      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else if (f.type === 'color') {
        const container = document.createElement('div');
        container.className = 'color-input-container';

        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = f.value || '#ffffff';

        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = f.value || '#0ea5e9';
        colorPicker.className = 'cursor-pointer w-10 h-10';

        input = document.createElement('input');
        input.type = 'text';
        input.id = f.name;
        input.name = f.name;
        input.value = f.value || '';
        input.placeholder = colorPlaceholder;
        input.className = 'border rounded-2xl p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 flex-1';

        colorPicker.addEventListener('input', () => {
          input.value = colorPicker.value;
          preview.style.backgroundColor = colorPicker.value;
        });

        input.addEventListener('input', () => {
          let color = input.value;
          if (color && !color.startsWith('#')) color = '#' + color;
          if (isValidHex(color)) {
            colorPicker.value = color;
            preview.style.backgroundColor = color;
            input.classList.remove('border-red-500');
          } else {
            input.classList.add('border-red-500');
          }
        });

        container.appendChild(preview);
        container.appendChild(colorPicker);
        container.appendChild(input);
        wrapper.append(label, container);
        form.appendChild(wrapper);
        return;
      } else {
        input = document.createElement('input');
        input.type = f.type;
      }

      input.id = f.name;
      input.name = f.name;
      input.value = f.value || '';
      input.placeholder = f.label;
      input.className = 'border rounded-2xl p-2 focus:outline-none focus:ring-2 focus:ring-teal-400';
      if (f.required) input.required = true;

      wrapper.append(label, input);
      form.appendChild(wrapper);
    });
  }

  function getFormValues() {
    const values = {};
    fields.forEach(field => {
      const el = document.getElementById(field.name);
      if (el) values[field.name] = el.value;
    });
    return values;
  }

  function generateMetaTags() {
    const m = getFormValues();
    const indent = '  ';
    return `<!-- Primary Meta Tags -->
${indent}<meta charset="UTF-8" />
${indent}<meta name="viewport" content="width=device-width, initial-scale=1" />
${indent}<title>${m.title}</title>
${indent}<meta name="title" content="${m.title}" />
${indent}<meta name="description" content="${m.description}" />
${indent}<meta name="author" content="${m.author}" />
${indent}<meta name="keywords" content="${m.keywords}" />
${indent}<meta name="robots" content="${m.robots}" />
${indent}<link rel="canonical" href="${m.canonical}" />

${indent}<!-- Theme & Icons -->
${indent}<meta name="theme-color" content="${m.themeColor}" />
${indent}<meta name="msapplication-TileColor" content="${m.tileColor}" />
${indent}<link rel="icon" href="${m.favicon}" />

${indent}<!-- Open Graph -->
${indent}<meta property="og:type" content="${m.ogType}" />
${indent}<meta property="og:url" content="${m.ogUrl}" />
${indent}<meta property="og:title" content="${m.ogTitle || m.title}" />
${indent}<meta property="og:description" content="${m.ogDescription || m.description}" />
${indent}<meta property="og:image" content="${m.ogImage}" />
${indent}<meta property="og:site_name" content="${m.siteName}" />

${indent}<!-- Twitter -->
${indent}<meta name="twitter:card" content="${m.twitterCard}" />
${indent}<meta name="twitter:title" content="${m.ogTitle || m.title}" />
${indent}<meta name="twitter:description" content="${m.ogDescription || m.description}" />
${indent}<meta name="twitter:image" content="${m.twitterImage || m.ogImage}" />`;
  }

  function updatePreviews() {
    const m = getFormValues();
    const fb = appData.ui.fallbacks;

    document.getElementById('previewTitle').textContent = m.ogTitle || m.title || fb.yourPageTitle;
    document.getElementById('previewDescription').textContent = m.ogDescription || m.description || fb.socialPreviewDescription;

    try {
      const url = new URL(m.ogUrl || m.canonical || '');
      document.getElementById('previewDomain').textContent = url.hostname;
    } catch (e) {
      document.getElementById('previewDomain').textContent = fb.exampleDomain;
    }

    if (m.ogImage) {
      document.getElementById('previewImage').innerHTML = `<img src="${m.ogImage}" alt="Preview" class="w-full h-full object-cover">`;
    } else {
      document.getElementById('previewImage').innerHTML = '<i class="fas fa-image text-4xl text-gray-400"></i>';
    }

    document.getElementById('searchTitle').textContent = m.title || fb.yourPageTitle;
    document.getElementById('searchDescription').textContent = m.description || fb.searchPreviewDescription;

    try {
      const url = new URL(m.canonical || '');
      document.getElementById('searchUrl').textContent = url.href;
    } catch (e) {
      document.getElementById('searchUrl').textContent = fb.defaultSearchUrl;
    }

    if (m.favicon) {
      document.getElementById('searchFavicon').innerHTML = `<img src="${m.favicon}" alt="Favicon" class="w-full h-full object-contain">`;
    } else {
      document.getElementById('searchFavicon').innerHTML = '<i class="fas fa-globe text-gray-400"></i>';
    }

    const now = new Date();
    document.getElementById('searchDate').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    const tabBtnId = tabId.replace('Output', 'Tab');
    const tabBtn = document.getElementById(tabBtnId);
    if (tabBtn) tabBtn.classList.add('active');
  }

  function refreshOutputAndPreviews() {
    const out = document.getElementById('output');
    if (out) out.textContent = generateMetaTags();
    updatePreviews();
  }

  function showExtractorError(message) {
    document.getElementById('extractorLoading').classList.add('hidden');
    document.getElementById('extractorContent').classList.add('hidden');
    document.getElementById('extractorPlaceholder').classList.add('hidden');
    const errorElement = document.getElementById('extractorError');
    document.getElementById('errorMessage').textContent = message;
    errorElement.classList.remove('hidden');
  }

  function wireEvents(data) {
    const errors = data.errors;

    document.getElementById('codeTab').addEventListener('click', () => switchTab('codeOutput'));
    document.getElementById('previewTab').addEventListener('click', () => {
      switchTab('previewOutput');
      updatePreviews();
    });
    document.getElementById('searchTab').addEventListener('click', () => {
      switchTab('searchOutput');
      updatePreviews();
    });
    document.getElementById('extractorTab').addEventListener('click', () => switchTab('extractorOutput'));

    /* Auto-generate meta tags whenever form data changes */
    const form = document.getElementById('metaForm');
    if (form) {
      form.addEventListener('input', refreshOutputAndPreviews);
      form.addEventListener('change', refreshOutputAndPreviews);
    }

    document.getElementById('generateBtn').addEventListener('click', () => {
      refreshOutputAndPreviews();
      switchTab('codeOutput');
      document.getElementById('output')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
      const tags = document.getElementById('output').textContent;
      navigator.clipboard.writeText(tags);
      const notification = document.getElementById('copyNotification');
      notification.classList.add('show');
      setTimeout(() => notification.classList.remove('show'), 2000);
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      fields.forEach(field => {
        const el = document.getElementById(field.name);
        if (el) el.value = field.value || '';
      });
      refreshOutputAndPreviews();
    });

    document.getElementById('extractBtn').addEventListener('click', async () => {
      const urlInput = document.getElementById('extractUrl').value.trim();

      if (!urlInput) {
        showExtractorError(errors.enterUrl);
        return;
      }

      let url;
      try {
        url = new URL(urlInput);
      } catch (e) {
        showExtractorError(errors.invalidUrl);
        return;
      }

      document.getElementById('extractorPlaceholder').classList.add('hidden');
      document.getElementById('extractorContent').classList.add('hidden');
      document.getElementById('extractorError').classList.add('hidden');
      document.getElementById('extractorLoading').classList.remove('hidden');

      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url.href)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Failed to fetch website: ${response.status}`);

        const result = await response.json();
        const htmlContent = result.contents;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const metaTags = Array.from(doc.querySelectorAll('meta'));
        const fb = data.ui.fallbacks;

        document.getElementById('extractedUrl').textContent = url.href;

        const tagsContainer = document.getElementById('extractedTags');
        tagsContainer.innerHTML = '';

        const title = doc.querySelector('title')?.textContent || fb.noTitleFound;
        tagsContainer.innerHTML += `
          <tr>
            <td><span class="tag-badge">title</span></td>
            <td>${title}</td>
          </tr>
        `;

        metaTags.forEach(tag => {
          const name = tag.getAttribute('name') || tag.getAttribute('property') || tag.getAttribute('itemprop') || 'unnamed';
          const content = tag.getAttribute('content') || '';
          tagsContainer.innerHTML += `
            <tr>
              <td><span class="tag-badge">${name}</span></td>
              <td>${content}</td>
            </tr>
          `;
        });

        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || title;
        const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="description"]')?.getAttribute('content') || fb.noDescriptionAvailable;
        const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';

        document.getElementById('extractedPreviewTitle').textContent = ogTitle;
        document.getElementById('extractedPreviewDescription').textContent = ogDescription;
        document.getElementById('extractedPreviewDomain').textContent = url.hostname;

        if (ogImage) {
          document.getElementById('extractedPreviewImage').innerHTML = `<img src="${ogImage}" alt="Preview" class="w-full h-full object-cover">`;
        } else {
          document.getElementById('extractedPreviewImage').innerHTML = '<i class="fas fa-image text-4xl text-gray-400"></i>';
        }

        const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || ogTitle;
        const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || ogDescription;
        const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || ogImage;

        document.getElementById('extractedTwitterTitle').textContent = twitterTitle;
        document.getElementById('extractedTwitterDescription').textContent = twitterDescription;
        document.getElementById('extractedTwitterDomain').textContent = url.hostname;

        if (twitterImage) {
          document.getElementById('extractedTwitterImage').innerHTML = `<img src="${twitterImage}" alt="Twitter Preview" class="w-full h-full object-cover">`;
        } else {
          document.getElementById('extractedTwitterImage').innerHTML = '<i class="fas fa-image text-4xl text-gray-400"></i>';
        }

        const metaMap = {
          title: doc.querySelector('title')?.textContent || '',
          description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          author: doc.querySelector('meta[name="author"]')?.getAttribute('content') || '',
          keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
          canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || url.href,
          robots: doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
          themeColor: doc.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '',
          tileColor: doc.querySelector('meta[name="msapplication-TileColor"]')?.getAttribute('content') || '',
          favicon: doc.querySelector('link[rel="icon"]')?.getAttribute('href') || '',
          ogType: doc.querySelector('meta[property="og:type"]')?.getAttribute('content') || '',
          ogUrl: doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || url.href,
          ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
          ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
          ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
          twitterCard: doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '',
          twitterImage: doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '',
          siteName: doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || ''
        };

        fields.forEach(field => {
          const el = document.getElementById(field.name);
          if (el && metaMap[field.name] !== undefined && metaMap[field.name] !== '') {
            el.value = metaMap[field.name];
            if (field.type === 'color') el.dispatchEvent(new Event('input'));
          }
        });

        updatePreviews();
        document.getElementById('output').textContent = generateMetaTags();

        document.getElementById('extractorLoading').classList.add('hidden');
        document.getElementById('extractorContent').classList.remove('hidden');
      } catch (error) {
        const msg = data.errors.extractFailed.replace('{message}', error.message);
        showExtractorError(msg);
      }
    });

    document.querySelectorAll('.extracted-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.extracted-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.extracted-tab-content').forEach(c => c.classList.remove('active'));
        const tabName = tab.getAttribute('data-tab');
        const contentId = `extracted${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
        const content = document.getElementById(contentId);
        if (content) content.classList.add('active');
      });
    });
  }

  function init(data) {
    appData = data;
    applyUiStrings(data);
    buildForm(data);
    wireEvents(data);
    refreshOutputAndPreviews();
    const extractUrl = document.getElementById('extractUrl');
    if (extractUrl) extractUrl.value = window.location.href;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fetch('data/data.json')
        .then(r => r.json())
        .then(init)
        .catch(err => console.error('Failed to load data:', err));
    });
  } else {
    fetch('data/data.json')
      .then(r => r.json())
      .then(init)
      .catch(err => console.error('Failed to load data:', err));
  }
})();
