export type SWConfig = {
  onSuccess: (registration: ServiceWorkerRegistration) => void;
  onUpdate: (registration: ServiceWorkerRegistration) => void;
  onRegister: (registration: ServiceWorkerRegistration) => void;
};
