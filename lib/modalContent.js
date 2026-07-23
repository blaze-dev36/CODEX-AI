export const lockedSections = ["tools", "apis"];

export const modalContentMap = {
  deploy: {
    title: "Deploy Your AI Models",
    icon: "rocket",
    body: (
      <>
        <p>Follow these steps to deploy your AI models on our enterprise infrastructure:</p>
        <ol>
          <li><strong>Prepare Your Model</strong> - Package your model files and dependencies</li>
          <li><strong>Configure Settings</strong> - Set environment variables and scaling parameters</li>
          <li><strong>Choose Platform</strong> - Select your preferred hosting environment (cloud, on-premise)</li>
          <li><strong>Deploy & Monitor</strong> - Deploy with one click and monitor real-time performance</li>
        </ol>
        <p>Watch this tutorial for a detailed walkthrough:</p>
        <iframe src="https://www.youtube.com/embed/jS5zBrEZg-A?si=84Xy3OQrxxHZjT2d" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </>
    ),
  },
  plugins: {
    title: "Plugins",
    icon: "puzzle-piece",
    body: null,
  },
  support: {
    title: "Get Support",
    icon: "headset",
    body: (
      <>
        <p>Join our communities for help, discussions, and latest updates, or reach out to us directly</p>
        <div className="support-links">
          <a href="https://chat.whatsapp.com/BVKaSgWjobcFfO4NU07g5Q?mode=gi_t" className="support-link" target="_blank" rel="noreferrer">
            <i className="fab fa-whatsapp" />
            <span>WhatsApp<br />Group</span>
          </a>
          <a href="https://whatsapp.com/channel/0029Vb6sMEy96H4VI2w3I50F" className="support-link" target="_blank" rel="noreferrer">
            <i className="fab fa-whatsapp" />
            <span>WhatsApp<br />Channel</span>
          </a>
          <a href="https://wa.me/2347019135989" className="support-link" target="_blank" rel="noreferrer">
            <i className="fab fa-whatsapp" />
            <span>Message<br />us here</span>
          </a>
          <a href="https://t.me/5GQxLKGLbkszNjg0" className="support-link" target="_blank" rel="noreferrer">
            <i className="fab fa-telegram" />
            <span>Telegram<br />Group</span>
          </a>
          <a href="https://t.me/CODEX_AIV3" className="support-link" target="_blank" rel="noreferrer">
            <i className="fab fa-telegram" />
            <span>Telegram<br />Channel</span>
          </a>
          <a href="https://t.me/DEV_CODEXV3" className="support-link" target="_blank" rel="noreferrer">
            <i className="fab fa-telegram" />
            <span>Message<br />us here</span>
          </a>
        </div>
      </>
    ),
  },
  tools: {
    title: "Tools Center",
    icon: "wrench",
    body: (
      <>
        <p>Discover developer tools and automation helpers for fast AI workflows.</p>
        <ul>
          <li><strong>Tool 1:</strong> Replace this with a custom tool description.</li>
          <li><strong>Tool 2:</strong> Add tool setup instructions or integration notes.</li>
          <li><strong>Tool 3:</strong> Explain how users can use this tool in their workflow.</li>
        </ul>
        <p>Change this text at any time to reflect the tools you want to present.</p>
      </>
    ),
  },
  apis: {
    title: "API Library",
    icon: "network-wired",
    body: (
      <>
        <p>List your APIs, endpoints, and integration notes here.</p>
        <ul>
          <li><strong>API 1:</strong> Add endpoint descriptions and usage examples.</li>
          <li><strong>API 2:</strong> Explain authentication, rate limits, and how to connect.</li>
          <li><strong>API 3:</strong> Show the most common call patterns and sample payloads.</li>
        </ul>
        <p>Change the text to describe your APIs and integrations.</p>
      </>
    ),
  },
  repo: {
    title: "GitHub Repository",
    icon: "github",
    body: (
      <>
        <p>Access the official CODEX AI source code, documentation, and contribute to the project:</p>
        <p style={{ marginTop: "2rem", textAlign: "center" }}>
          <a href="https://github.com/CODEX-SPACEX/CODEX-AI/tree/main" target="_blank" rel="noreferrer" className="create-plugin-btn" style={{ display: "inline-flex" }}>
            <i className="fab fa-github" /> GitHub
          </a>
        </p>
      </>
    ),
  },
  suggest: {
    title: "Suggest Features",
    icon: "lightbulb",
    body: (
      <>
        <p>Help us improve CODEX AI by sharing your ideas. Tell us what features you would like to see:</p>
        <form className="suggest-form">
          <textarea placeholder="Share your ideas, feature requests, and improvements for CODEX AI." />
          <button type="button">Send Suggestion</button>
        </form>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    icon: "shield-alt",
    body: (
      <>
        <p>At CODEX AI, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>
        <h3>Information We Collect</h3>
        <ul>
          <li><strong>Personal Information:</strong> When you contact us or submit suggestions, we may collect your name, email, or WhatsApp details if provided.</li>
          <li><strong>Usage Data:</strong> We collect anonymous usage statistics to improve our service.</li>
          <li><strong>Cookies:</strong> We use cookies for theme preferences and basic functionality.</li>
        </ul>
        <h3>How We Use Your Information</h3>
        <p>We use collected information solely to provide and improve our services, respond to inquiries, and enhance user experience.</p>
        <h3>Data Security</h3>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.</p>
        <h3>Contact Us</h3>
        <p>If you have questions about this Privacy Policy, please contact us through our support channels.</p>
      </>
    ),
  },
  license: {
    title: "License Agreement",
    icon: "file-contract",
    body: (
      <>
        <p>This License Agreement (&quot;Agreement&quot;) governs your use of CODEX AI (&quot;the Software&quot;). By accessing or using the Software, you agree to be bound by the terms of this Agreement.</p>
        <h3>Grant of License</h3>
        <p>Subject to your compliance with this Agreement, we grant you a limited, non-exclusive, non-transferable license to use the Software for personal and commercial purposes.</p>
        <h3>Restrictions</h3>
        <ul>
          <li>You may not modify, reverse engineer, or distribute the Software without permission.</li>
          <li>You may not use the Software for illegal activities.</li>
          <li>You must comply with all applicable laws and regulations.</li>
        </ul>
        <h3>Intellectual Property</h3>
        <p>The Software and all related intellectual property rights remain our property. This Agreement does not transfer any ownership rights to you.</p>
        <h3>Termination</h3>
        <p>This license is effective until terminated. We may terminate it at any time if you breach this Agreement.</p>
        <h3>Disclaimer</h3>
        <p>The Software is provided &quot;as is&quot; without warranties of any kind. We disclaim all warranties, express or implied.</p>
      </>
    ),
  },
  terms: {
    title: "Terms of Service",
    icon: "gavel",
    body: (
      <>
        <p>Welcome to CODEX AI. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our platform. By using CODEX AI, you agree to these Terms.</p>
        <h3>Acceptance of Terms</h3>
        <p>By accessing our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
        <h3>User Responsibilities</h3>
        <ul>
          <li>Provide accurate information when submitting suggestions or contacting support.</li>
          <li>Use the platform responsibly and in compliance with applicable laws.</li>
          <li>Respect intellectual property rights of others.</li>
        </ul>
        <h3>Prohibited Activities</h3>
        <ul>
          <li>Attempting to gain unauthorized access to our systems.</li>
          <li>Using the platform to distribute harmful or illegal content.</li>
          <li>Interfering with the proper functioning of the platform.</li>
        </ul>
        <h3>Service Availability</h3>
        <p>We strive to provide continuous service but do not guarantee uninterrupted access. We reserve the right to modify or discontinue services at any time.</p>
        <h3>Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
        <h3>Changes to Terms</h3>
        <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
        <h3>Contact Information</h3>
        <p>For questions about these Terms, please use our support channels.</p>
      </>
    ),
  },
};
