# 🔬 Pharmlogics Healthcare | Clinical Infrastructure Registry

Pharmlogics is a high-integrity Next.js 15 platform designed for high-bioavailability supplement distribution and biological optimization. This platform bridges pharmaceutical rigor with botanical potential through a Genkit-powered AI intelligence layer.

---

## 1. 🛠 Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Intelligence**: Google Genkit with Gemini 2.5 Flash
- **Database**: Firebase Firestore (Real-time synchronization)
- **Authentication**: Firebase Auth (Multi-factor & Social)
- **Payments**: Razorpay (Digital & COD Protocols)
- **Email**: Resend (Server-side clinical dispatch)
- **Styling**: Tailwind CSS & ShadCN UI
- **Animations**: Framer Motion & Lenis Smooth Scroll

---

## 2. 🧠 AI Intelligence Layer (Genkit)
The platform integrates five specialized AI flows to automate research and logistics:

1. **Clinical Concierge**: Real-time AI chat analyzing user biomarkers to recommend specific formulas.
2. **Formula Finder**: A diagnostic quiz generating custom "Optimization Protocols."
3. **Predictive Stock Audit**: Neural forecasting monitoring SKU velocity to trigger stockout alerts.
4. **Clinical Copy Generator**: Automates professional, persuasive product descriptions for the catalog.
5. **QC Report Generator**: Generates laboratory verification certificates for every clinical order.

---

## 3. 📂 Data Registry & Governance
The Firestore schema is designed for clinical traceability and administrative sovereignty.

### Core Collections:
- `/settings/store`: Global financial (tax, shipping) and brand (colors, logos) configuration.
- `/pages/{pageId}`: Dynamic content nodes for the Visual CMS (Home, About, FAQs, etc.).
- `/products/{productId}`: Formula catalog, inventory levels, and detailed clinical benefits.
- `/categories/{categoryId}`: Clinical taxonomy nodes for product classification.
- `/insights/{insightId}`: Laboratory research abstracts and peer-reviewed articles.
- `/orders_global/{orderId}`: Centralized fulfillment registry for administrative management.
- `/users/{userId}/notifications`: Real-time personal alert stream for logistics and membership updates.
- `/roles_admin/{userId}`: Privilege nodes for administrative tiers.

### Administrative Tiers:
- **Super Admin**: Full infrastructure sovereignty, role management, and financial configuration.
- **Content Manager**: Access to Visual CMS, Catalog, and Research Insights.
- **Logistics Staff**: Access to Global Orders, Lab Processing, and QC verification protocols.

---

## 4. 🔧 Vercel Deployment Registry
To deploy Pharmlogics to Vercel, you must configure the following Environment Variables in your Vercel Project Settings:

| Variable | Description |
| :--- | :--- |
| `GOOGLE_GENAI_API_KEY` | Powers the AI Concierge and Predictive Models. |
| `RESEND_API_KEY` | Triggers high-delivery clinical emails. |
| `RESEND_FROM_EMAIL` | Your verified domain sender address (e.g., `orders@yourdomain.com`). |
| `RAZORPAY_KEY_ID` | Public financial key from the Razorpay dashboard. |
| `RAZORPAY_KEY_SECRET` | Private financial key for secure order creation. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary node for asset storage. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset for clinical visuals. |

---

## 5. 🚀 Getting Started
1. **Firebase Setup**: Enable Firestore, Auth (Email, Google, Phone), and Storage.
2. **Security Rules**: Deploy the rules found in `firestore.rules`.
3. **Seeding**: Log in to the **Admin > CMS** dashboard and run "Initialize Clinical Registry" to deploy baseline page content and research abstracts.
4. **Domain**: Verify your domain in Resend to enable production email dispatch.

---
*Authorized for Pharmlogics Healthcare Infrastructure Management.*
