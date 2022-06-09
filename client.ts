import { Socket } from "net";
import { Interface, createInterface } from "readline";
import ByteBuffer from "byte-buffer";

export enum MovementType {
	PATH,
	MOVE_ALONG_SURFACE,
	RANDOM_POINT,
	RANDOM_POINT_AROUND,
	CAST_RAY,
	RANDOM_PATH,
}

export enum PathRequestFlags {
	None = 0,
	ChaikinCurve = 1,
	CatmullRomSpline = 2,
}

export type PathRequest = {
	a: SatNavVector;
	b: SatNavVector;
	mapId: number;
};

export type Vector3 = {
	x: number;
	y: number;
	z: number;
}

export type SatNavVector = { X: number; Y: number; Z: number };

export default class SatNav {
	protected client: Socket;
	protected readline: Interface;

	constructor() {
		// this.server = spawn("./tools/navigation/AmeisenNavServer.exe", {
		// 	stdio: "inherit",
		// });

		this.client = new Socket();
		this.client.connect(47110, "mun.sh", () => {
			console.log("nav client connected");
			this.readline = createInterface({
				input: this.client,
			});
		});
	}

	async getPath(mapId: number, start: Vector3, end: Vector3) {
		let packet = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN, true);
		packet.writeInt(mapId); // 4
		packet.writeInt(PathRequestFlags.None); // 8
		packet.writeFloat(start.x); // 12
		packet.writeFloat(start.y); // 16
		packet.writeFloat(start.z); // 20
		packet.writeFloat(end.x); // 24
		packet.writeFloat(end.y); // 28
		packet.writeFloat(end.z); // 32

		return await this.send(packet);
	}

	protected async send(data: ByteBuffer, type = MovementType.PATH): Promise<Vector3[]> {
		const header = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN, true);
		header.writeByte(data.length + 1);
		header.writeInt(type);

		const packet = Buffer.concat([Buffer.from(header.buffer), Buffer.from(data.buffer)]);
		this.client.write(packet)

		// console.log("sent", data.length, packet);

		return new Promise((r) => {
			let final = Buffer.from([]);

			this.client.on("data", (data) => {
				// console.log("got data", data);
				final = Buffer.concat([final, data]);

				const packet = new ByteBuffer(Uint8Array.from(final), true);
				const size = packet.readUnsignedInt();

				if (packet.length == size + 4) {
					const type = packet.readByte();
					const vectors = [];

					while (packet.available > 0) {
						vectors.push({x: packet.readFloat(), y: packet.readFloat(), z: packet.readFloat()});
					}
	
					r(vectors);
					this.client.removeAllListeners("data");
				}
			});
		});
	}

	public static ToSatnavVector(vector: Vector3) {
		return { X: vector.x, Y: vector.y, Z: vector.z };
	}

	public static FromSatnavVector(vector: SatNavVector): Vector3 {
		return {x: vector.X, y: vector.Y, z: vector.Z};
	}
}

(async () => {
	const satnav = new SatNav();

	const Goldshire = { mapId: 0, position: {x: -9443, y: 59, z: 56} }
	const Northshire = { mapId: 0, position: {x: -9015, y: -79, z: 87} }

	setTimeout(async () => {
		const data = await satnav.getPath(Northshire.mapId, Northshire.position, Goldshire.position);

		console.log(data);

		const data2 = await satnav.getPath(Northshire.mapId, Northshire.position, Goldshire.position);

		console.log(data2);
	}, 500)

})()
