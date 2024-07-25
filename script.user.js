// ==UserScript==
// @name         Resizable Magnet Link Banner
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Displays magnet links in a resizable fixed banner at the top of the page with clear text from the dn= parameter, limits banner height, and includes a draggable resize handle with a darker blue scrollbar. Duplicate links are excluded.
// @author       BlahPunk
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract the dn= parameter from a magnet link
    function getMagnetLinkText(magnetLink) {
        const dnMatch = magnetLink.match(/dn=([^&]*)/);
        return dnMatch ? decodeURIComponent(dnMatch[1]) : `Magnet Link ${Math.random().toString(36).substr(2, 5)}`;
    }

    // Function to create and display the magnet link banner
    function createMagnetLinkBanner(magnetLinks) {
        const banner = document.createElement('div');
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.backgroundColor = '#1E90FF';
        banner.style.color = '#fff';
        banner.style.zIndex = '10000';
        banner.style.padding = '10px';
        banner.style.textAlign = 'center';
        banner.style.fontSize = '18px';
        banner.style.fontWeight = 'bold';
        banner.style.overflowY = 'auto'; // Allow scrolling if needed
        banner.style.maxHeight = '500px'; // Set maximum height for the banner
        banner.style.boxSizing = 'border-box'; // Include padding and border in the element's total width and height
        banner.style.borderBottom = '10px solid #104E8B'; // Space for the resize handle

        // Create a resize handle positioned at the bottom of the banner
        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.left = '0';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.width = '100%';
        resizeHandle.style.height = '10px'; // Solid 10px high area for dragging
        resizeHandle.style.backgroundColor = '#104E8B'; // Darker blue color for the resize handle
        resizeHandle.style.cursor = 'ns-resize';
        resizeHandle.style.zIndex = '10001'; // Ensure it's above the banner
        resizeHandle.style.textAlign = 'center';
        resizeHandle.style.lineHeight = '10px'; // Center the ^ vertically
        resizeHandle.style.color = '#fff'; // Color of the ^ character
        resizeHandle.textContent = '^'; // Add ^ character

        // Add links to the banner
        magnetLinks.forEach(link => {
            const magnetLink = document.createElement('a');
            magnetLink.href = link.url;
            magnetLink.textContent = link.text;
            magnetLink.style.display = 'block';
            magnetLink.style.color = '#fff';
            magnetLink.style.textDecoration = 'none';
            magnetLink.style.marginBottom = '5px';
            banner.appendChild(magnetLink);
        });

        // Append banner to the body
        document.body.appendChild(banner);

        // Append resize handle to the banner
        banner.appendChild(resizeHandle);

        // Add CSS for scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            .resizable-banner::-webkit-scrollbar {
                width: 12px;
            }
            .resizable-banner::-webkit-scrollbar-track {
                background: #1E90FF; /* Background color for scrollbar track */
            }
            .resizable-banner::-webkit-scrollbar-thumb {
                background: #104E8B; /* Darker blue color for scrollbar thumb */
                border-radius: 6px;
            }
            .resizable-banner::-webkit-scrollbar-thumb:hover {
                background: #1E90FF;
            }
        `;
        document.head.appendChild(style);

        // Apply class to banner for scrollbar styling
        banner.classList.add('resizable-banner');

        // Adjust the body's margin to account for the banner height
        document.body.style.marginTop = `${banner.offsetHeight}px`;

        // Make the banner resizable
        let isResizing = false;
        let lastDownY = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            lastDownY = e.clientY;
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
            if (!isResizing) return;
            const offset = e.clientY - lastDownY;
            banner.style.height = `${banner.offsetHeight + offset}px`;
            lastDownY = e.clientY;
            document.body.style.marginTop = `${banner.offsetHeight}px`;
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    // Function to find magnet links on the page
    function findMagnetLinks() {
        const links = document.querySelectorAll('a[href*="magnet%3A%3F"], a[href*="magnet:"]');
        const magnetLinks = [];
        const uniqueLinks = new Set();

        links.forEach(link => {
            const magnetLink = decodeURIComponent(link.href);
            const magnetLinkMatch = magnetLink.match(/magnet:\?.*/);
            if (magnetLinkMatch && !uniqueLinks.has(magnetLinkMatch[0])) {
                uniqueLinks.add(magnetLinkMatch[0]);
                magnetLinks.push({ url: magnetLinkMatch[0], text: getMagnetLinkText(magnetLinkMatch[0]) });
            }
        });
        return magnetLinks;
    }

    // Initialize the script
    function init() {
        const magnetLinks = findMagnetLinks();
        if (magnetLinks.length > 0) {
            createMagnetLinkBanner(magnetLinks);
        }
    }

    // Run the script once the DOM is fully loaded
    window.addEventListener('load', init);
})();
