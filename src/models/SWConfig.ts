export type SWConfig = (
  status: SWRegistrationStatus,
  event?: ServiceWorkerRegistration
) => void;

export enum SWRegistrationStatus {
  REGISTERED,
  SUCCESS,
  UPDATE_FOUND,
  NOT_SUPPORTED,
  ERROR,
}
