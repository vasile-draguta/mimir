# Privacy Policy for Mimir

**Last Updated:** December 30, 2025

## Overview

Mimir is a Chrome extension that provides AI-powered explanations for highlighted text. This privacy policy describes how we collect, use, and protect your information.

## Information We Collect

### User-Provided Content
When you highlight text and trigger the extension, that specific text is processed to generate an explanation. We collect only the text you explicitly select and submit.

### Information We Do NOT Collect
- Personal identification information
- Browsing history
- Cookies or tracking data
- IP addresses
- Device information

## How We Use Your Information

Your highlighted text is sent to our backend server, which forwards it to Groq AI to generate an explanation. The response is returned directly to you. We do not store, log, or retain your highlighted text or the generated responses on our servers.

## Data Storage

### Local Storage
The extension uses Chrome's local storage API (`chrome.storage.local`) to store your history of highlights and explanations. This data is stored entirely on your device and is never transmitted to our servers or any third party.

### Server-Side Storage
We do not maintain any server-side storage of user data. All processing is done in real-time without data retention.

## Third-Party Services

We use Groq AI as our language model provider. Your highlighted text is transmitted securely to Groq's API for processing. Groq's handling of this data is governed by their own privacy policy, available at https://groq.com/privacy-policy/.

## Data Security

All data transmission between the extension and our server, and between our server and Groq, is encrypted using HTTPS/TLS protocols.

## User Rights

You can clear your local history at any time through the extension's side panel. Since we do not store any personal data on our servers, there is no server-side data to request or delete.

## Children's Privacy

This extension is not intended for use by children under 13 years of age. We do not knowingly collect information from children under 13.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this document.

## Contact Us

If you have questions or concerns about this privacy policy, please open an issue on our GitHub repository at https://github.com/vasile-draguta/mimir.
