# Deploying ORION

The site is a Vite + React app hosted on **Vercel**. The backend is **Firebase**
(Firestore database and Microsoft sign-in) plus a few **Vercel API routes** in
`api/` that handle event registration and **Razorpay** payments.

Until the keys below are set, the site runs in preview mode: data stays in the
visitor's browser, sample sign-in buttons appear on the portal page, and
payments run in a labelled test mode.

## 1. Firebase

1. Create a project at https://console.firebase.google.com.
2. **Firestore**: Build → Firestore Database → Create database (production mode, region `asia-south1`).
3. **Rules**: paste `firestore.rules` into Firestore → Rules and publish
   (or run `firebase deploy --only firestore:rules`).
4. **Web app keys**: Project settings → Your apps → Add web app. Copy the config values
   into the `VITE_FIREBASE_*` variables.
5. **Sign-in**: Authentication → Sign-in method → enable **Email/Password**. Students sign up
   with their @reva.edu.in email and must click the verification link before they can sign in.
   Add your Vercel domain under Authentication → Settings → Authorised domains.
   (Optional, later) **Microsoft**: needs an Azure app registration (client id and secret),
   which REVA's IT team may need to create in the REVA Microsoft tenant.
6. **Service account for the API**: Project settings → Service accounts → Generate new
   private key. Base64-encode the file (`base64 -w0 key.json`) and put the result straight into
   Vercel as `FIREBASE_SERVICE_ACCOUNT_BASE64`. Never commit the JSON file or paste it in chat.
7. **First admin**: sign up on the live site and verify your email. Then in Firestore open
   `users/<your uid>` and set `isAdmin: true` and `position: "President"` (or your role).
   From then on, admins promote others from the committee console.
8. **Starting data**: signed in as that admin, open Committee console → Advanced data tools →
   **Push to Firestore**. This loads the five wings, events, team and notices into the database.
   It does not create any user accounts.

## Testing locally against the Firebase emulators

`npx firebase-tools emulators:start --only auth,firestore --project demo-orion`, then run the site
with `VITE_USE_FIREBASE_EMULATORS=true` and any non-empty `VITE_FIREBASE_API_KEY`, and the API with
`FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-orion`. Never set these in Vercel.

## 2. Razorpay

1. Dashboard → Account & Settings → API keys. Start with **Test mode** keys.
2. Set `VITE_RAZORPAY_KEY_ID` (public) and `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` (server only).
3. Webhooks → Add: URL `https://<your-domain>/api/razorpay/webhook`, event
   `payment.captured`, and a secret that you also set as `RAZORPAY_WEBHOOK_SECRET`.
4. Switch to Live keys only after a full test registration works end to end.

How a paid registration works:
1. The visitor fills in the event form. `api/registrations/create` reads the fee and capacity
   from Firestore and creates the registration (`pending_payment`, `confirmed` or `waitlisted`).
2. `api/razorpay/order` creates a Razorpay order for exactly that amount.
3. After checkout, `api/razorpay/verify` checks the signature with the secret key, fetches
   the payment from Razorpay to confirm order and amount, and only then marks it paid.
4. If the visitor closes the tab first, the webhook confirms it instead.

## 3. Vercel

1. https://vercel.com → Add New → Project → import the GitHub repo.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Add every variable from `.env.example` under Settings → Environment Variables.
4. Deploy. `vercel.json` sends page links to the app and leaves `/api/*` to the API routes.

## Setting event fees

Committee console → Registrations → choose the event → set fee, capacity and open/closed → Save.
Fees are stored on the event in Firestore, and the server always reads them from there.
