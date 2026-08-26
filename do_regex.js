const fs = require('fs');
let code = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

code = code.replace(/<LeafletMap/g, '{!isMobile && <LeafletMap');
code = code.replace(/currentZoomLevel={currentZoomLevel}\s*\/>/g, 'currentZoomLevel={currentZoomLevel}\n              />}');

// Wait, the first replacement replaced BOTH occurrences of LeafletMap (the import and the component).
// Let's be careful.
