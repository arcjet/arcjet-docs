export type Faq = {
  question: string;
  answer: string[];
};

/**
 * Shared FAQ copy used on get-started and product quick-start pages.
 * Structured data is mapped from these items so questions stay in one place.
 */
export const faqs: Faq[] = [
  {
    question: "Do I need to run any infrastructure, such as Redis?",
    answer: [
      "No, Arcjet handles all the infrastructure for you so you don't need to worry about deploying global Redis clusters, designing data structures to track rate limits, or keeping security detection rules up to date.",
    ],
  },
  {
    question: "What is the performance overhead?",
    answer: [
      "Arcjet SDK tries to do as much as possible asynchronously and locally to minimize latency for each request. Where decisions can be made locally or previous decisions are cached in-memory, latency is usually <1ms.",
      "When a call to the Cloud API is required, such as when tracking a rate limit in a serverless environment, there is some additional latency before a decision is made. The Cloud API has been designed for high performance and low latency, and is deployed to multiple regions around the world. The SDK will automatically use the closest region which means the total overhead is typically no more than 20-30ms, often significantly less.",
    ],
  },
  {
    question: "What happens if Arcjet is unavailable?",
    answer: [
      "Where a decision has been cached locally, such as blocking a client, Arcjet will continue to function even if the service is unavailable.",
      "If a call to the Cloud API is needed and there is a network problem or Arcjet is unavailable, the default behavior is to fail open and allow the request. You have control over how to handle errors, including choosing to fail close if you prefer. See the reference docs for details.",
    ],
  },
  {
    question: "How does Arcjet protect me against DDoS attacks?",
    answer: [
      "Network layer attacks tend to be generic and high volume, so these are best handled by your hosting platform. Most cloud providers include network DDoS protection by default.",
      "Arcjet sits closer to your application so it can understand the context. This is important because some types of traffic may not look like a DDoS attack, but can still have the same effect. For example, a customer making too many API requests and affecting other customers, or large numbers of signups from disposable email addresses.",
      "Network-level DDoS protection tools find it difficult to protect against this type of traffic because they don't understand the structure of your application. Arcjet can help you to identify and block this traffic by integrating with your codebase and understanding the context of the request, such as the customer ID or the sensitivity of the API route.",
      "Volumetric network attacks are best handled by your hosting provider. Application level attacks need to be handled by the application. That's where Arcjet helps.",
    ],
  },
];

export function faqPageJsonLd(items: Faq[] = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.join(" "),
      },
    })),
  };
}
