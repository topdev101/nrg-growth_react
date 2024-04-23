export class Order {
  constructor(orderId, data, followerCount) {
    this.orderId = orderId;
    this.totalPrice = data.totalPrice;
    this.followerCount = followerCount;
    this.date = data.date;
    this.email = data.email;
    this.instaUsername = data.instaUsername;
    this.femaleType = data.femaleType;
    this.usaLocation = data.usaLocation;
  }
}
