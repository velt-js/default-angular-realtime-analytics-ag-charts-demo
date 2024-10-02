import { Marker } from 'ag-charts-community';

export class Heart extends Marker {
	toRadians(degrees: number) {
		return (degrees / 180) * Math.PI;
	}

	override updatePath() {
		const { x, y, path, size } = this;
		const scale = size / 12; // Adjust scale factor based on size

		path.clear();
		// Start at the bottom point of the heart
		path.moveTo(x, y + 4.28584 * scale);
		// Left curve
		path.cubicCurveTo(
			x - 1.24734 * scale, y + 4.28584 * scale,
			x - 3.75 * scale, y + 1.71416 * scale,
			x - 3.75 * scale, y - 1.71416 * scale
		);
		// Top left curve
		path.cubicCurveTo(
			x - 3.75 * scale, y - 4.28584 * scale,
			x - 1.25 * scale, y - 5.99984 * scale,
			x, y - 3.99984 * scale
		);
		// Top right curve
		path.cubicCurveTo(
			x + 1.25 * scale, y - 5.99984 * scale,
			x + 3.75 * scale, y - 4.28584 * scale,
			x + 3.75 * scale, y - 1.71416 * scale
		);
		// Right curve
		path.cubicCurveTo(
			x + 3.75 * scale, y + 1.71416 * scale,
			x + 1.24734 * scale, y + 4.28584 * scale,
			x, y + 4.28584 * scale
		);
		path.closePath();
	}
}