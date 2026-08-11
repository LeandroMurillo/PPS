import L from 'leaflet';

// Patch Leaflet _initContainer to prevent 'Map container is already initialized' in React 19 / StrictMode
interface LeafletMapPrototype {
	_initContainer: (id: string | HTMLElement) => void;
}

const mapProto = L.Map.prototype as unknown as LeafletMapPrototype;
const originalInitContainer = mapProto._initContainer;

mapProto._initContainer = function (this: L.Map, id: string | HTMLElement) {
	const container = typeof id === 'string' ? document.getElementById(id) : id;
	if (container && (container as unknown as Record<string, unknown>)._leaflet_id) {
		(container as unknown as Record<string, unknown>)._leaflet_id = null;
	}
	originalInitContainer.call(this, id);
};
