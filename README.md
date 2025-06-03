# Resizable Magnet and Torrent Link Banner Userscript

## Description
This userscript creates a resizable, scrollable banner at the top of web pages to display all magnet and `.torrent` file links found on the page. It bypasses annoying redirects, URL masking, and click hijacking, ensuring easy access to content. The banner is styled for easy readability and includes copy-to-clipboard functionality for each link. The script also blocks all page scripts and hides the page content if magnet or torrent links are detected, displaying only the extracted links in the banner.

## Features
- Displays magnet and `.torrent` links in a fixed, resizable banner at the top of the page.
- Extracts and decodes magnet links, including `dn=` parameters.
- Parses `.torrent` file links, including query strings like `?title=...`.
- Bypasses click hijacking by removing event listeners and preventing popups.
- Hides and disables all page content if links are found.
- Scrollable banner with draggable resize handle for easy height adjustment.
- "Copy" button for each link to quickly copy the full magnet or `.torrent` URL.
- Reload button to restore original page content if needed.
- Banner automatically reprocesses links after the page finishes loading.

## Installation
1. **Install Tampermonkey or Greasemonkey**:  
   - Add the Tampermonkey or Greasemonkey extension to your browser.
2. **Add the Script**:  
   - Click the Tampermonkey or Greasemonkey extension icon in your browser.
   - Select "Create a new script" or "Add a new script".
   - Copy the contents of `script.user.js` and paste them into the editor.
   - Save the script.

## Usage
The script automatically detects and displays a banner on any page containing magnet or `.torrent` links.  
- If no links are found, the page loads normally.  
- If links are found, the page content is hidden, scripts are blocked, and the banner displays the extracted links.  
- Drag the resize handle at the bottom of the banner to adjust its height.
- Click the "Reload Page Content" button in the banner to restore the original page content.
- Click the 📋 button next to a link to copy it to your clipboard.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
