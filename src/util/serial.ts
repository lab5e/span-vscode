interface ISerialPortDetail {
  path: string;
  manufacturer: string;
  vendorId: string;
  productId: string;
}

require("node-usb-native")
  .SerialPort.list()
  .then((serialPortList: ISerialPortDetail[]) => {
    console.log(serialPortList);
  });
