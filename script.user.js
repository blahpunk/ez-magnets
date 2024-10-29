// ==UserScript==
// @name         Resizable Magnet Link Banner
// @namespace    http://tampermonkey.net/
// @version      4.4
// @description  Displays magnet links in a resizable fixed banner at the top of the page with clear text from the dn= parameter, limits banner height, and includes a draggable resize handle with a gothic style and a clipboard copy button. Duplicate links are excluded. Now with green hues for buttons and link effects.
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
        banner.style.backgroundColor = '#1C1C1C'; // Darker, gothic background
        banner.style.color = '#E0E0E0'; // Lighter text
        banner.style.zIndex = '10000';
        banner.style.padding = '10px';
        banner.style.textAlign = 'left'; // Align text to the left
        banner.style.fontSize = '14px'; // Smaller font size for the banner text
        banner.style.fontFamily = 'Arial, sans-serif';
        banner.style.overflowY = 'auto'; // Allow scrolling if needed
        banner.style.maxHeight = '500px'; // Set maximum height for the banner
        banner.style.boxSizing = 'border-box'; // Include padding and border in the element's total width and height
        banner.style.borderTop = '1px solid #444'; // Top border for a framed look

        // Create a resize handle positioned just below the banner
        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'fixed';
        resizeHandle.style.left = '0';
        resizeHandle.style.top = `${banner.offsetHeight}px`; // Position it just below the banner
        resizeHandle.style.width = '100%';
        resizeHandle.style.height = '10px'; // Shorter handle
        resizeHandle.style.backgroundColor = '#333'; // Darker color for the resize handle
        resizeHandle.style.cursor = 'ns-resize';
        resizeHandle.style.zIndex = '10001'; // Ensure it's above the banner
        resizeHandle.style.textAlign = 'center';
        resizeHandle.style.lineHeight = '10px'; // Center the ^ vertically
        resizeHandle.style.color = '#E0E0E0'; // Color of the ^ character
        resizeHandle.textContent = '^'; // Add ^ character

        // Function to copy text to clipboard
        function copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Copied to clipboard: ' + text);
        }

        // Add links to the banner
        magnetLinks.forEach(link => {
            const linkContainer = document.createElement('div');
            linkContainer.style.display = 'flex';
            linkContainer.style.alignItems = 'center';
            linkContainer.style.marginBottom = '5px';

            const copyButton = document.createElement('button');
            copyButton.textContent = '📋';
            copyButton.style.marginRight = '10px';
            copyButton.style.backgroundColor = '#228B22'; // Green button background
            copyButton.style.border = 'none';
            copyButton.style.color = '#E0E0E0'; // Button text color
            copyButton.style.cursor = 'pointer';
            copyButton.style.fontSize = '12px'; // Smaller font size for the button
            copyButton.style.padding = '5px';
            copyButton.style.borderRadius = '3px'; // Slight border radius
            copyButton.addEventListener('click', () => copyToClipboard(link.url));
            copyButton.addEventListener('mouseover', () => copyButton.style.backgroundColor = '#32CD32'); // Lighter green on hover
            copyButton.addEventListener('mouseout', () => copyButton.style.backgroundColor = '#228B22'); // Darker green on mouse out

            const magnetLink = document.createElement('a');
            magnetLink.href = link.url;
            magnetLink.textContent = link.text + " (Magnet Link)";
            magnetLink.style.color = '#E0E0E0'; // Lighter text for links
            magnetLink.style.textDecoration = 'none';
            magnetLink.style.fontSize = '12px'; // Smaller font size for the links
            magnetLink.style.marginRight = '10px';
            magnetLink.addEventListener('mouseover', () => magnetLink.style.color = '#32CD32'); // Lighter green on hover
            magnetLink.addEventListener('mouseout', () => magnetLink.style.color = '#E0E0E0'); // Lighter text on mouse out

            linkContainer.appendChild(copyButton);
            linkContainer.appendChild(magnetLink);
            banner.appendChild(linkContainer);
        });

        // Append banner to the body
        document.body.appendChild(banner);

        // Append resize handle to the body
        document.body.appendChild(resizeHandle);

        // Add CSS for scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            .resizable-banner::-webkit-scrollbar {
                width: 12px;
            }
            .resizable-banner::-webkit-scrollbar-track {
                background: #1C1C1C; /* Background color for scrollbar track */
            }
            .resizable-banner::-webkit-scrollbar-thumb {
                background: #333; /* Darker color for scrollbar thumb */
                border-radius: 6px;
            }
            .resizable-banner::-webkit-scrollbar-thumb:hover {
                background: #444;
            }
        `;
        document.head.appendChild(style);

        // Apply class to banner for scrollbar styling
        banner.classList.add('resizable-banner');

        // Adjust the body's margin to account for the banner height
        document.body.style.marginTop = `${banner.offsetHeight + 10}px`; // Add 10px for the handle height

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
            resizeHandle.style.top = `${banner.offsetHeight}px`; // Move handle along with the banner
            document.body.style.marginTop = `${banner.offsetHeight + 10}px`; // Adjust body's margin
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
