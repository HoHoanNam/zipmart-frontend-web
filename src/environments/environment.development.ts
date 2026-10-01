export const environment = {
  apiUrl: 'http://localhost:3000/api/v1',
  // A.8 push notifications — VAPID *public* key only (safe to ship in a
  // build, unlike the private key which stays server-side). Not documented
  // in the expansion plan how this is distributed to the frontend; left
  // empty here so PushService no-ops until a real key is filled in.
  vapidPublicKey: '',
};
