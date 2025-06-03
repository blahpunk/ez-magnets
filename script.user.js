// ==UserScript==
// @name         Resizable Magnet and Torrent Link Banner (Full Block + Refresh)
// @namespace    http://tampermonkey.net/
// @version      5.4
// @description  Block all page content and scripts, show only magnet and .torrent links. Detects redirect URLs. Reloads banner after page load to prevent popups. Includes toggle to reload page content. All original features preserved.
// @author       BlahPunk
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let banner, resizeHandle;

    const blockScripts = () => {
        const removeScripts = () => {
            document.querySelectorAll('script, iframe, embed, object').forEach(e => e.remove());
        };
        new MutationObserver(removeScripts).observe(document.documentElement, { childList: true, subtree: true });
        removeScripts();
    };

    const wipeListeners = () => {
        const clone = node => node.cloneNode(true);
        document.documentElement.replaceWith(clone(document.documentElement));
        document.body && document.body.replaceWith(clone(document.body));
    };

    function getMagnetLinkText(magnetLink) {
        const dnMatch = magnetLink.match(/dn=([^&]*)/);
        return dnMatch ? decodeURIComponent(dnMatch[1]) : `Magnet Link ${Math.random().toString(36).substr(2, 5)}`;
    }

    function getTorrentLinkText(torrentLink) {
        return decodeURIComponent(torrentLink.split('/').pop().split('?')[0] || `Torrent File ${Math.random().toString(36).substr(2, 5)}`);
    }

    function extractMagnetFromURL(url) {
        const decoded = decodeURIComponent(url);
        const match = decoded.match(/magnet:\?.+/);
        return match ? match[0] : null;
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        alert('Copied to clipboard: ' + text);
    }

    function buildBanner(magnetLinks, torrentLinks) {
        if (banner) banner.remove();
        if (resizeHandle) resizeHandle.remove();

        banner = document.createElement('div');
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.backgroundColor = '#1C1C1C';
        banner.style.color = '#E0E0E0';
        banner.style.zIndex = '999999';  // Ensures top layer
        banner.style.padding = '10px';
        banner.style.fontSize = '14px';
        banner.style.fontFamily = 'Arial, sans-serif';
        banner.style.overflowY = 'auto';
        banner.style.maxHeight = '500px';
        banner.style.boxSizing = 'border-box';
        banner.style.borderTop = '1px solid #444';

        if (magnetLinks.length) {
            const header = document.createElement('h3');
            header.textContent = 'Magnet Links';
            header.style.color = '#32CD32';
            header.style.margin = '10px 0 5px 0';
            banner.appendChild(header);

            magnetLinks.forEach(link => {
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.marginBottom = '5px';

                const copyBtn = document.createElement('button');
                copyBtn.textContent = '📋';
                Object.assign(copyBtn.style, { marginRight: '10px', backgroundColor: '#228B22', border: 'none', color: '#E0E0E0', cursor: 'pointer', fontSize: '12px', padding: '5px', borderRadius: '3px' });
                copyBtn.addEventListener('click', e => { e.stopPropagation(); copyToClipboard(link.url); });

                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = `${link.text} (Magnet)`;
                Object.assign(a.style, { color: '#E0E0E0', textDecoration: 'none', fontSize: '12px' });
                a.addEventListener('click', e => e.stopPropagation());

                container.appendChild(copyBtn);
                container.appendChild(a);
                banner.appendChild(container);
            });
        }

        if (torrentLinks.length) {
            const header = document.createElement('h3');
            header.textContent = 'Torrent Files';
            header.style.color = '#32CD32';
            header.style.margin = '10px 0 5px 0';
            banner.appendChild(header);

            torrentLinks.forEach(link => {
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.marginBottom = '5px';

                const copyBtn = document.createElement('button');
                copyBtn.textContent = '📋';
                Object.assign(copyBtn.style, { marginRight: '10px', backgroundColor: '#228B22', border: 'none', color: '#E0E0E0', cursor: 'pointer', fontSize: '12px', padding: '5px', borderRadius: '3px' });
                copyBtn.addEventListener('click', e => { e.stopPropagation(); copyToClipboard(link.url); });

                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = `${link.text} (.torrent)`;
                Object.assign(a.style, { color: '#E0E0E0', textDecoration: 'none', fontSize: '12px' });
                a.addEventListener('click', e => e.stopPropagation());

                container.appendChild(copyBtn);
                container.appendChild(a);
                banner.appendChild(container);
            });
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Reload Page Content';
        Object.assign(toggleBtn.style, { marginTop: '10px', backgroundColor: '#228B22', border: 'none', color: '#E0E0E0', cursor: 'pointer', fontSize: '12px', padding: '5px', borderRadius: '3px' });
        toggleBtn.addEventListener('click', () => location.reload());
        banner.appendChild(toggleBtn);

        document.body.appendChild(banner);

        resizeHandle = document.createElement('div');
        Object.assign(resizeHandle.style, { position: 'fixed', left: '0', top: `${banner.offsetHeight}px`, width: '100%', height: '10px', backgroundColor: '#333', cursor: 'ns-resize', zIndex: '999999', textAlign: 'center', lineHeight: '10px', color: '#E0E0E0' });
        resizeHandle.textContent = '^';
        document.body.appendChild(resizeHandle);

        let isResizing = false, lastY = 0;
        resizeHandle.addEventListener('mousedown', e => {
            isResizing = true;
            lastY = e.clientY;
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });
        function resize(e) {
            if (!isResizing) return;
            const offset = e.clientY - lastY;
            banner.style.height = `${banner.offsetHeight + offset}px`;
            lastY = e.clientY;
            resizeHandle.style.top = `${banner.offsetHeight}px`;
        }
        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }

        Array.from(document.body.children).forEach(el => {
            if (!banner.contains(el) && el !== resizeHandle) {
                el.style.display = 'none';
            }
        });
    }

    function findLinks() {
        const magnetLinks = [], torrentLinks = [];
        const magnetSet = new Set(), torrentSet = new Set();

        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.href;
            const magnet = extractMagnetFromURL(href);
            if (magnet && !magnetSet.has(magnet)) {
                magnetSet.add(magnet);
                magnetLinks.push({ url: magnet, text: getMagnetLinkText(magnet) });
            }

            if (href.match(/\.torrent(\?|$)/i) && !torrentSet.has(href)) {
                torrentSet.add(href);
                torrentLinks.push({ url: href, text: getTorrentLinkText(href) });
            }
        });

        return { magnetLinks, torrentLinks };
    }

    function refreshDisplay() {
        wipeListeners();
        const { magnetLinks, torrentLinks } = findLinks();
        if (magnetLinks.length || torrentLinks.length) {
            buildBanner(magnetLinks, torrentLinks);
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        blockScripts();
        refreshDisplay();
    });

    window.addEventListener('load', () => {
        setTimeout(refreshDisplay, 300);  // Reprocess links after full page load
    });
})();
