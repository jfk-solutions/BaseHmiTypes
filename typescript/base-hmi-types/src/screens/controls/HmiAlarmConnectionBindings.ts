import { HmiProperty } from "../base.js";

export class HmiAlarmConnectionBindings {
  acknowledgeNotification?: HmiProperty<number>;
  silenceNotification?: HmiProperty<number>;
  statusResetNotification?: HmiProperty<number>;
  messageNotification?: HmiProperty<number>;
  messageHandshake?: HmiProperty<number>;
  closeDisplayNotification?: HmiProperty<number>;
  remoteAcknowledge?: HmiProperty<number>;
  remoteAcknowledgeAll?: HmiProperty<number>;
  remoteAcknowledgeHandshake?: HmiProperty<number>;
  remoteCloseDisplay?: HmiProperty<number>;
  remoteClearHistory?: HmiProperty<number>;
  remoteSilence?: HmiProperty<number>;
  remoteStatusReset?: HmiProperty<number>;
}
