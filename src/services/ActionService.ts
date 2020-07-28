import { Redis } from "ioredis";
import { ClientInterface, Action } from "../types";

export default class ActionService {
  client: ClientInterface;
  subscriber: Redis;
  publisher: Redis;

  constructor(client: ClientInterface, subscriber: Redis, publisher: Redis) {
    this.client = client;
    this.subscriber = subscriber;
    this.publisher = publisher;
  }

  public async handle(action: Action, data: any) {
    return {
      join: this.joinChannel,
      message: this.sendMessage,
      leave: this.leaveChannel,
      error: this.leaveChannel,
    }[action](data);
  }

  private joinChannel = (data: any) => {
    const { id: clientId } = this.client;
    const { channel } = data;
    this.subscriber.subscribe(channel);
    this.publisher.publish(channel, data);
  };

  private sendMessage = (data: any) => {
    const { channel } = data;
    this.publisher.publish(channel, data);
  };

  private leaveChannel = (data: any) => {
    const { channel } = data;
    this.subscriber.unsubscribe(channel);
  };
}
