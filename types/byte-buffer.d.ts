declare module "byte-buffer" {
	export default class ByteBuffer {
		static LITTLE_ENDIAN: boolean;
		static BIG_ENDIAN: boolean;

		public available: number;
		public index: number;
		public buffer: Buffer;
		public view: DataView;

		public order: boolean;
		public length: number;
		constructor(sourceOrLength?: any, order?: boolean, implicitGrowth?: boolean);

		public front(): void;
		public toHex(): string;

		public write(value: any, length?: number): void;
		public read(size: number): ByteBuffer;
		public append(size: number): void;
		public seek(offset: number): any;

		public writeString(value: string): void;
		public readString(length?: number): string;

		// Writers for bytes, shorts, integers, floats and doubles
		public writeByte(value: number, type?: boolean): void;
		public writeUnsignedByte(value: number, type?: boolean): void;
		public writeShort(value: number, type?: boolean): void;
		public writeUnsignedShort(value: number, type?: boolean): void;
		public writeInt(value: number): void;
		public writeUnsignedInt(value: number, type?: boolean): void;
		public writeFloat(value: number, type?: boolean): void;
		public writeDouble(value: number): void;

		public readByte(): number;
		public readUnsignedByte(): number;
		public readShort(): number;
		public readUnsignedShort(type?: boolean): number;
		public readInt(): number;
		public readUnsignedInt(type?: boolean): number;
		public readFloat(type?: boolean): number;
		public readDouble(): number;

		public readCString(): string;
		public writeCString(value: string): void;
	}
}
