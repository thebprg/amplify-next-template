# Shrink-the-Link 🔗

**Shrink-the-Link** is a modern, full-stack URL shortener and QR code generator built with Next.js and AWS Amplify Gen 2. It empowers users to create concise, manageable links with advanced features like dynamic updates (overwriting destination URLs), real-time analytics, and organizational grouping.

## 🚀 Key Features

- **URL Shortening**: Instantly convert long, cumbersome URLs into short, shareable links.
- **Custom Aliases**: Create branded or memorable short codes (e.g., `shrink.link/my-awesome-project`).
- **QR Code Generation**: Automatically generate downloadable QR codes for every shortened link.
- **Dynamic Updates (Overwriting)**: Update the destination of an existing short link anytime without changing the short URL itself—perfect for fixing typos or updating campaign targets.
- **Link Expiration**: Set expiration dates for temporary links to ensure security and relevance.
- **Organization & Grouping**: Categorize your links into groups for better management and tracking.
- **Real-time Analytics**: Track click counts for every link in real-time.
- **Guest Access**: Quickly shorten links as a guest without needing an account.
- **Secure Authentication**: Robust user accounts and data protection powered by Amazon Cognito.
- **PWA Ready**: Install the app on your mobile or desktop for a native-like experience.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Backend-as-a-Service**: [AWS Amplify Gen 2](https://docs.amplify.aws/gen2/)
- **Authentication**: [Amazon Cognito](https://aws.amazon.com/cognito/)
- **Database**: [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
- **API**: [AWS AppSync](https://aws.amazon.com/appsync/) (GraphQL)
- **Functions**: [AWS Lambda](https://aws.amazon.com/lambda/)
- **Styling**: Vanilla CSS with a focus on a clean, responsive UI.

## 📦 Getting Started

### Prerequisites

- Node.js (>= 24.12.0)
- npm or yarn
- An AWS Account (for deployment)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/shrink-the-link.git
   cd shrink-the-link
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure AWS Amplify**:
   If you haven't already, install the Amplify CLI and log in.
   ```bash
   npx ampx sandbox
   ```
   This will set up a local development environment and generate the necessary `amplify_outputs.json` file.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🏗️ Project Structure

- `app/`: Next.js application logic, components, and styles.
- `amplify/`: AWS Amplify Gen 2 backend definitions (Auth, Data, Functions).
  - `data/resource.ts`: Database schema and API definitions.
  - `auth/resource.ts`: Authentication configuration.
  - `functions/`: Custom Lambda functions for click tracking and guest access.
- `public/`: Static assets and PWA configuration.

## 🛡️ Security

This project uses AWS Amplify's built-in security features. User data is protected by Cognito, and database access is restricted using fine-grained authorization rules (Owner-based access for authenticated users).

## 📄 License

This project is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file for details.
