export interface ICollectionResponse {
  collections: ICollection[];
}

export interface ICollection {
  collectionId: string;
  tags?: { [tagKey: string]: string };
}

export interface IDeviceResponse {
  devices: IDevice[];
}

export interface IDevice {
  collectionId: string;
  deviceId: string;
  imei: string;
  imsi: string;
  tags?: { [tagKey: string]: string };
}
